# Supabase Integration Verification & Row Level Security (RLS) Guide

This guide details how to verify the connection between the **Cognitive Scripture Mastery System (CSMS / STBA)** and **Supabase**, ensuring that data fetching, authentication services, and Row Level Security (RLS) policies are active and functioning correctly.

---

## 1. Quick Verification Command

You can run the automated verification suite directly from the terminal at any time:

```bash
npm run test:supabase
```
*(or run directly via: `npx tsx scripts/verify-supabase.ts`)*

This runs an automated 13-point diagnostic suite covering:
- **Environment & Key Format**: Validates URL structure and JWT token signature/claims (`ref: ygsatsfcvodstgjhmths`).
- **Network & Gateway Ping**: Verifies sub-250ms REST API reachability.
- **Supabase Auth Health**: Verifies session management and credentials evaluation.
- **Table Data Fetching**: Queries `doctrine_tracks`, `stba_study_notes`, `stba_study_highlights`, and `track_progress`.
- **Row Level Security (RLS) Write Guards**: Confirms that unauthenticated/anonymous clients are actively **blocked** by PostgreSQL with error code `42501` (`new row violates row-level security policy`).
- **Owner Isolation**: Verifies that user data cannot be viewed or overwritten across different accounts.

---

## 2. Environment Variables Configuration

The application uses the following variables (configured in `.env` and `.env.example`):

| Variable | Description | Client Exposed | Example Value |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Base Supabase project URL | Yes (`VITE_` prefix) | `https://ygsatsfcvodstgjhmths.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase Anonymous Key (JWT) | Yes (`VITE_` prefix) | `eyJhbGciOiJIUzI1NiIsInR5...` |
| `SUPABASE_TEST_EMAIL` | *(Optional)* Test user email for live CRUD verification | No (CI / Test only) | `scholar.test@stba.internal` |
| `SUPABASE_TEST_PASSWORD` | *(Optional)* Test user password for live CRUD verification | No (CI / Test only) | `SecurePassword123!` |

> **Note**: `src/lib/supabase.ts` automatically sanitizes trailing `/rest/v1` routes so that the `@supabase/supabase-js` client operates properly across both browser and server environments.

---

## 3. Database Schema & RLS Architecture

The application interfaces with four primary Supabase tables in the `public` schema:

### 1. `stba_study_notes` (Notebook Entries & Scribe Notes)
- **Columns**: `id` (UUID), `user_id` (UUID, references `auth.users`), `title` (text), `content` (text), `summary` (text), `category` (text), `scripture_tags` (text[] or jsonb), `children` (uuid[]), `order` (int), `is_favorite` (bool), `created_at` (timestamptz), `updated_at` (timestamptz).
- **RLS Policy**:
  - `SELECT`: Only rows where `auth.uid() = user_id`.
  - `INSERT`: Allowed only when `auth.uid() = user_id`.
  - `UPDATE`: Allowed only when `auth.uid() = user_id`.
  - `DELETE`: Allowed only when `auth.uid() = user_id`.

### 2. `stba_study_highlights` (Scripture Highlights & Margin Notes)
- **Columns**: `id` (UUID), `user_id` (UUID, references `auth.users`), `verse_id` (text), `color` (text), `category` (text), `note` (text), `created_at` (timestamptz).
- **RLS Policy**:
  - `SELECT`: Only rows where `auth.uid() = user_id`.
  - `INSERT`: Allowed only when `auth.uid() = user_id`.
  - `DELETE`: Allowed only when `auth.uid() = user_id`.

### 3. `track_progress` (Doctrinal Mastery Pre-Test & Study Track Records)
- **Columns**:
  - `id` (UUID, primary key, `DEFAULT gen_random_uuid()`)
  - `user_id` (UUID, `NOT NULL`, references `auth.users(id) ON DELETE CASCADE`)
  - `track_id` (text, `NOT NULL`)
  - `track_name` (text)
  - `pre_test_score` (int4 / numeric, `NOT NULL DEFAULT 0`)
  - `recommended_starting_point` (text, nullable — `NULL` indicates not assigned yet)
  - `studied_texts` (jsonb / text[], `NOT NULL DEFAULT '[]'::jsonb`)
  - `active_recall` (jsonb, `NOT NULL DEFAULT '{"score": 0, "inputs": {}, "checks": {}, "masteryLevel": {}}'::jsonb`)
  - `teach_it` (jsonb, `NOT NULL DEFAULT '{"score": 0, "grading": null, "feedback": "", "generatedSummary": ""}'::jsonb`)
  - `saved_to_notebook` (bool, `NOT NULL DEFAULT false`)
  - `saved_notebook_page_id` (text / UUID, nullable — `NULL` indicates not saved yet)
  - `created_at` (timestamptz, `NOT NULL DEFAULT now()`)
  - `updated_at` (timestamptz, `NOT NULL DEFAULT now()`)
- **RLS Policy**:
  - `SELECT` / `INSERT` / `UPDATE` / `DELETE`: Only rows where `auth.uid() = user_id`.

### 4. `active_recall_mastery` (Active Recall Verse Mastery, Attempts & Successes)
- **Columns**:
  - `id` (UUID, primary key, `DEFAULT gen_random_uuid()`)
  - `user_id` (UUID, `NOT NULL`, references `auth.users(id) ON DELETE CASCADE`)
  - `track_id` (text, `NOT NULL`)
  - `verse_reference` (text, `NOT NULL`)
  - `mastery_level` (int4, `NOT NULL DEFAULT 0`)
  - `attempts` (int4, `NOT NULL DEFAULT 0`)
  - `successes` (int4, `NOT NULL DEFAULT 0`)
  - `last_review_at` (timestamptz, nullable)
  - `created_at` (timestamptz, `NOT NULL DEFAULT now()`)
  - `updated_at` (timestamptz, `NOT NULL DEFAULT now()`)
- **RLS Policy**:
  - `SELECT` / `INSERT` / `UPDATE` / `DELETE`: Only rows where `auth.uid() = user_id`.

### 5. `doctrine_tracks` (Curated SDA Doctrine Tracks)
- **Columns**: `id` (UUID), `name` (text), `description` (text), `sections` (jsonb), `order` (int), `is_published` (bool).
- **RLS Policy**:
  - `SELECT`: Public access allowed (`true` or `is_published = true`).
  - `INSERT` / `UPDATE` / `DELETE`: Restricted to administrators (`auth.jwt()->>'role' = 'service_role'` or admin email).

---

## 4. Complete SQL Function & Trigger Script (Handling Non-Nullable Columns on New User Signup)

Run the following complete, idempotent SQL script in the **Supabase SQL Editor**. It configures column defaults for both `public.track_progress` and `public.active_recall_mastery`—specifically handling the required non-nullable columns (`track_progress.track_id`, `track_progress.track_name`, `active_recall_mastery.track_id`, and `active_recall_mastery.verse_reference`)—and creates both the `BEFORE INSERT OR UPDATE` null-guard triggers and the `AFTER INSERT ON auth.users` signup initialization trigger:

```sql
-- ============================================================================
-- 1. ENSURE UNIQUE CONSTRAINTS FOR IDEMPOTENT ON CONFLICT UPSERTS
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.track_progress'::regclass
      AND contype IN ('p', 'u')
      AND pg_get_constraintdef(oid) LIKE '%(user_id, track_id)%'
  ) THEN
    ALTER TABLE public.track_progress
      ADD CONSTRAINT track_progress_user_id_track_id_key UNIQUE (user_id, track_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.active_recall_mastery'::regclass
      AND contype IN ('p', 'u')
      AND pg_get_constraintdef(oid) LIKE '%(user_id, track_id, verse_reference)%'
  ) THEN
    ALTER TABLE public.active_recall_mastery
      ADD CONSTRAINT active_recall_mastery_user_track_verse_key UNIQUE (user_id, track_id, verse_reference);
  END IF;
END $$;

-- ============================================================================
-- 2. SET COLUMN DEFAULTS (INCLUDING NON-NULLABLE IDENTIFIER COLUMNS)
--    - track_progress.track_id          -> 'fundamental-beliefs'
--    - track_progress.track_name        -> '28 Fundamental Beliefs'
--    - track_progress.pre_test_score    -> 0
--    - active_recall_mastery.track_id   -> 'fundamental-beliefs'
--    - active_recall_mastery.verse_reference -> '2 Timothy 3:16'
-- ============================================================================
ALTER TABLE public.track_progress
  ALTER COLUMN track_id SET DEFAULT 'fundamental-beliefs',
  ALTER COLUMN track_name SET DEFAULT '28 Fundamental Beliefs',
  ALTER COLUMN pre_test_score SET DEFAULT 0,
  ALTER COLUMN studied_texts SET DEFAULT '[]'::jsonb,
  ALTER COLUMN active_recall SET DEFAULT '{"score": 0, "inputs": {}, "checks": {}, "masteryLevel": {}}'::jsonb,
  ALTER COLUMN teach_it SET DEFAULT '{"score": 0, "grading": null, "feedback": "", "generatedSummary": ""}'::jsonb,
  ALTER COLUMN saved_to_notebook SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.active_recall_mastery
  ALTER COLUMN track_id SET DEFAULT 'fundamental-beliefs',
  ALTER COLUMN verse_reference SET DEFAULT '2 Timothy 3:16',
  ALTER COLUMN mastery_level SET DEFAULT 0,
  ALTER COLUMN attempts SET DEFAULT 0,
  ALTER COLUMN successes SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- ============================================================================
-- 3. BACKFILL ANY EXISTING NULL VALUES & ENFORCE NOT NULL CONSTRAINTS
-- ============================================================================
UPDATE public.track_progress
SET
  track_id = COALESCE(NULLIF(TRIM(track_id), ''), 'fundamental-beliefs'),
  track_name = COALESCE(NULLIF(TRIM(track_name), ''), '28 Fundamental Beliefs'),
  pre_test_score = COALESCE(pre_test_score, 0),
  studied_texts = COALESCE(studied_texts, '[]'::jsonb),
  active_recall = COALESCE(active_recall, '{"score": 0, "inputs": {}, "checks": {}, "masteryLevel": {}}'::jsonb),
  teach_it = COALESCE(teach_it, '{"score": 0, "grading": null, "feedback": "", "generatedSummary": ""}'::jsonb),
  saved_to_notebook = COALESCE(saved_to_notebook, false),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE track_id IS NULL
   OR track_name IS NULL
   OR pre_test_score IS NULL
   OR studied_texts IS NULL
   OR active_recall IS NULL
   OR teach_it IS NULL
   OR saved_to_notebook IS NULL
   OR created_at IS NULL
   OR updated_at IS NULL;

ALTER TABLE public.track_progress
  ALTER COLUMN track_id SET NOT NULL,
  ALTER COLUMN track_name SET NOT NULL,
  ALTER COLUMN pre_test_score SET NOT NULL,
  ALTER COLUMN studied_texts SET NOT NULL,
  ALTER COLUMN active_recall SET NOT NULL,
  ALTER COLUMN teach_it SET NOT NULL,
  ALTER COLUMN saved_to_notebook SET NOT NULL;

UPDATE public.active_recall_mastery
SET
  track_id = COALESCE(NULLIF(TRIM(track_id), ''), 'fundamental-beliefs'),
  verse_reference = COALESCE(NULLIF(TRIM(verse_reference), ''), '2 Timothy 3:16'),
  mastery_level = COALESCE(mastery_level, 0),
  attempts = COALESCE(attempts, 0),
  successes = COALESCE(successes, 0),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE track_id IS NULL
   OR verse_reference IS NULL
   OR mastery_level IS NULL
   OR attempts IS NULL
   OR successes IS NULL
   OR created_at IS NULL
   OR updated_at IS NULL;

ALTER TABLE public.active_recall_mastery
  ALTER COLUMN track_id SET NOT NULL,
  ALTER COLUMN verse_reference SET NOT NULL,
  ALTER COLUMN mastery_level SET NOT NULL,
  ALTER COLUMN attempts SET NOT NULL,
  ALTER COLUMN successes SET NOT NULL;

-- ============================================================================
-- 4. BEFORE INSERT OR UPDATE TRIGGERS TO GUARD AGAINST EXPLICIT NULL PAYLOADS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_track_progress_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.track_id := COALESCE(NULLIF(TRIM(NEW.track_id), ''), 'fundamental-beliefs');
  NEW.track_name := COALESCE(
    NULLIF(TRIM(NEW.track_name), ''),
    CASE NEW.track_id
      WHEN 'fundamental-beliefs' THEN '28 Fundamental Beliefs'
      WHEN 'salvation' THEN 'The Plan of Salvation'
      WHEN 'sabbath' THEN 'The Seventh-day Sabbath'
      WHEN 'sanctuary' THEN 'The Heavenly Sanctuary'
      WHEN 'sanctuary-doctrine' THEN 'The Heavenly Sanctuary'
      WHEN 'second-coming' THEN 'The Second Coming of Christ'
      WHEN 'state-of-the-dead' THEN 'State of the Dead'
      WHEN 'three-angels' THEN 'Three Angels'' Messages'
      WHEN 'law-and-grace' THEN 'Law and Grace'
      WHEN 'health-and-temperance' THEN 'Christian Health & Temperance'
      ELSE '28 Fundamental Beliefs'
    END
  );
  NEW.pre_test_score := COALESCE(NEW.pre_test_score, 0);
  NEW.studied_texts := COALESCE(NEW.studied_texts, '[]'::jsonb);
  NEW.active_recall := COALESCE(NEW.active_recall, '{"score": 0, "inputs": {}, "checks": {}, "masteryLevel": {}}'::jsonb);
  NEW.teach_it := COALESCE(NEW.teach_it, '{"score": 0, "grading": null, "feedback": "", "generatedSummary": ""}'::jsonb);
  NEW.saved_to_notebook := COALESCE(NEW.saved_to_notebook, false);
  NEW.created_at := COALESCE(NEW.created_at, now());
  NEW.updated_at := COALESCE(NEW.updated_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_track_progress_defaults ON public.track_progress;
CREATE TRIGGER trg_enforce_track_progress_defaults
BEFORE INSERT OR UPDATE ON public.track_progress
FOR EACH ROW
EXECUTE FUNCTION public.enforce_track_progress_defaults();

CREATE OR REPLACE FUNCTION public.enforce_active_recall_mastery_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.track_id := COALESCE(NULLIF(TRIM(NEW.track_id), ''), 'fundamental-beliefs');
  NEW.verse_reference := COALESCE(NULLIF(TRIM(NEW.verse_reference), ''), '2 Timothy 3:16');
  NEW.mastery_level := COALESCE(NEW.mastery_level, 0);
  NEW.attempts := COALESCE(NEW.attempts, 0);
  NEW.successes := COALESCE(NEW.successes, 0);
  NEW.created_at := COALESCE(NEW.created_at, now());
  NEW.updated_at := COALESCE(NEW.updated_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_active_recall_mastery_defaults ON public.active_recall_mastery;
CREATE TRIGGER trg_enforce_active_recall_mastery_defaults
BEFORE INSERT OR UPDATE ON public.active_recall_mastery
FOR EACH ROW
EXECUTE FUNCTION public.enforce_active_recall_mastery_defaults();

-- ============================================================================
-- 5. AFTER INSERT TRIGGER ON auth.users TO INITIALIZE BOTH TABLES ON SIGNUP
--    Populates non-nullable track_id, track_name, and verse_reference along
--    with zeroed scores and empty JSON/array states.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_stats_init()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_track_id text;
  v_track_name text;
  v_anchor_verse text;
BEGIN
  -- 1. Resolve initial track_id from user signup metadata or default to 'fundamental-beliefs'
  v_track_id := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'firstTrack'), ''),
    'fundamental-beliefs'
  );

  -- 2. Resolve human-readable track_name and starter verse_reference for that track
  CASE v_track_id
    WHEN 'salvation' THEN
      v_track_name := 'The Plan of Salvation';
      v_anchor_verse := 'Ephesians 2:8-9';
    WHEN 'sabbath' THEN
      v_track_name := 'The Seventh-day Sabbath';
      v_anchor_verse := 'Exodus 20:8-11';
    WHEN 'sanctuary', 'sanctuary-doctrine' THEN
      v_track_name := 'The Heavenly Sanctuary';
      v_anchor_verse := 'Hebrews 8:1-2';
    WHEN 'second-coming' THEN
      v_track_name := 'The Second Coming of Christ';
      v_anchor_verse := 'John 14:1-3';
    WHEN 'state-of-the-dead' THEN
      v_track_name := 'State of the Dead';
      v_anchor_verse := 'Ecclesiastes 9:5';
    WHEN 'three-angels' THEN
      v_track_name := 'Three Angels'' Messages';
      v_anchor_verse := 'Revelation 14:12';
    ELSE
      v_track_id := 'fundamental-beliefs';
      v_track_name := '28 Fundamental Beliefs';
      v_anchor_verse := '2 Timothy 3:16';
  END CASE;

  -- 3. Seed zeroed initial row in public.track_progress
  INSERT INTO public.track_progress (
    user_id,
    track_id,
    track_name,
    pre_test_score,
    recommended_starting_point,
    studied_texts,
    active_recall,
    teach_it,
    saved_to_notebook,
    saved_notebook_page_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_track_id,
    v_track_name,
    0,
    NULL,
    '[]'::jsonb,
    '{"score": 0, "inputs": {}, "checks": {}, "masteryLevel": {}}'::jsonb,
    '{"score": 0, "grading": null, "feedback": "", "generatedSummary": ""}'::jsonb,
    false,
    NULL,
    now(),
    now()
  )
  ON CONFLICT (user_id, track_id) DO NOTHING;

  -- 4. Seed zeroed initial row in public.active_recall_mastery
  INSERT INTO public.active_recall_mastery (
    user_id,
    track_id,
    verse_reference,
    mastery_level,
    attempts,
    successes,
    last_review_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_track_id,
    v_anchor_verse,
    0,
    0,
    0,
    NULL,
    now(),
    now()
  )
  ON CONFLICT (user_id, track_id, verse_reference) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_init_stats ON auth.users;
CREATE TRIGGER on_auth_user_created_init_stats
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_stats_init();
```

---

## 5. Interpreting Test Results

When running `npm run test:supabase`:

1. **`RLS Active: Unauthorized INSERT blocked with 42501`**:
   - **Meaning**: Row Level Security is functioning as intended. The database successfully identified that an unauthenticated client attempted an INSERT and blocked the operation.
2. **`All expected columns verified`**:
   - **Meaning**: Both `public.track_progress` and `public.active_recall_mastery` expose their full expected column sets via PostgREST.
3. **`Auth API endpoint responds with standard credentials validation`**:
   - **Meaning**: The Supabase Auth service is responding to authentication requests and evaluating credentials appropriately.



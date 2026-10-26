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
- **Columns**: `user_id` (UUID, references `auth.users`), `track_id` (text), `track_name` (text), `data` (jsonb), `created_at` (timestamptz), `updated_at` (timestamptz).
- **RLS Policy**:
  - `SELECT`: Only rows where `auth.uid() = user_id`.
  - `INSERT`: Allowed only when `auth.uid() = user_id`.
  - `UPDATE`: Allowed only when `auth.uid() = user_id`.

### 4. `doctrine_tracks` (Curated SDA Doctrine Tracks)
- **Columns**: `id` (UUID), `name` (text), `description` (text), `sections` (jsonb), `order` (int), `is_published` (bool).
- **RLS Policy**:
  - `SELECT`: Public access allowed (`true` or `is_published = true`).
  - `INSERT` / `UPDATE` / `DELETE`: Restricted to administrators (`auth.jwt()->>'role' = 'service_role'` or admin email).

---

## 4. Recommended Supabase SQL Migration (If Setting Up a Fresh Database)

If provisioning or auditing policies directly in the Supabase SQL Editor:

```sql
-- 1. Enable RLS on all tables
ALTER TABLE public.stba_study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stba_study_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctrine_tracks ENABLE ROW LEVEL SECURITY;

-- 2. Policies for stba_study_notes
CREATE POLICY "Users can view their own notes"
ON public.stba_study_notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
ON public.stba_study_notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.stba_study_notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.stba_study_notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Policies for stba_study_highlights
CREATE POLICY "Users can view their own highlights"
ON public.stba_study_highlights FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own highlights"
ON public.stba_study_highlights FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
ON public.stba_study_highlights FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Policies for track_progress
CREATE POLICY "Users can view their own track progress"
ON public.track_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own track progress"
ON public.track_progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Policies for doctrine_tracks (Public read)
CREATE POLICY "Anyone can view doctrine tracks"
ON public.doctrine_tracks FOR SELECT
TO anon, authenticated
USING (true);
```

---

## 5. Interpreting Test Results

When running `npm run test:supabase`:

1. **`RLS Active: Unauthorized INSERT blocked with 42501`**:
   - **Meaning**: Row Level Security is functioning as intended. The database successfully identified that an unauthenticated client attempted an INSERT and blocked the operation.
2. **`Records returned: 0 (Total in view: 0)`**:
   - **Meaning**: The table exists, is connected, and PostgREST properly filtered out private records from unauthorized callers.
3. **`Auth API endpoint responds with standard credentials validation`**:
   - **Meaning**: The Supabase Auth service is responding to authentication requests and evaluating credentials appropriately.

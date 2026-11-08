import { supabase } from './supabase';

export interface ActiveRecallJsonState {
  score: number;
  masteryLevel: Record<string, "Weak" | "Developing" | "Mastered">;
  inputs: Record<string, string>;
  checks: Record<string, boolean>;
}

export interface TeachItJsonState {
  score: number;
  feedback: string;
  grading: any;
  generatedSummary: string;
}

export interface TrackProgressData {
  pre_test_score: number | {
    score: number;
    submitted: boolean;
    answers: Record<number, number>;
  };
  recommended_starting_point: string | null;
  studied_texts: string[];
  active_recall: ActiveRecallJsonState;
  teach_it: TeachItJsonState;
  saved_to_notebook: boolean;
  saved_notebook_page_id: string | null;
}

export interface TrackProgressRow {
  id?: string;
  user_id: string;
  track_id: string;
  track_name?: string;
  pre_test_score: number;
  recommended_starting_point: string | null;
  studied_texts: string[];
  active_recall: ActiveRecallJsonState;
  teach_it: TeachItJsonState;
  saved_to_notebook: boolean;
  saved_notebook_page_id: string | null;
  /** Normalized client view of the row's progress fields */
  data: TrackProgressData;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveRecallMasteryRow {
  id?: string;
  user_id: string;
  track_id: string;
  verse_reference: string;
  mastery_level: number;
  attempts: number;
  successes: number;
  last_review_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_ACTIVE_RECALL_JSON: ActiveRecallJsonState = {
  score: 0,
  masteryLevel: {},
  inputs: {},
  checks: {},
};

export const DEFAULT_TEACH_IT_JSON: TeachItJsonState = {
  score: 0,
  feedback: "",
  grading: null,
  generatedSummary: "",
};

export const DEFAULT_TRACK_PROGRESS_DATA: TrackProgressData = {
  pre_test_score: 0,
  recommended_starting_point: null,
  studied_texts: [],
  active_recall: { ...DEFAULT_ACTIVE_RECALL_JSON },
  teach_it: { ...DEFAULT_TEACH_IT_JSON },
  saved_to_notebook: false,
  saved_notebook_page_id: null,
};

/**
 * Coalesces any raw database row or partial payload into a guaranteed non-null,
 * zero-initialized TrackProgressData object so callers never encounter null errors.
 */
export function normalizeTrackProgressData(raw: any): TrackProgressData {
  const source = raw?.data && typeof raw.data === "object" ? { ...raw, ...raw.data } : (raw || {});

  const rawPreTest = source.pre_test_score;
  let normalizedPreTest: TrackProgressData["pre_test_score"] = 0;
  if (typeof rawPreTest === "number" && !Number.isNaN(rawPreTest)) {
    normalizedPreTest = rawPreTest;
  } else if (rawPreTest && typeof rawPreTest === "object") {
    normalizedPreTest = {
      score: typeof rawPreTest.score === "number" ? rawPreTest.score : 0,
      submitted: Boolean(rawPreTest.submitted),
      answers: rawPreTest.answers && typeof rawPreTest.answers === "object" ? rawPreTest.answers : {},
    };
  }

  const rawActiveRecall = source.active_recall && typeof source.active_recall === "object"
    ? source.active_recall
    : {};

  const rawTeachIt = source.teach_it && typeof source.teach_it === "object"
    ? source.teach_it
    : {};

  return {
    pre_test_score: normalizedPreTest,
    recommended_starting_point:
      typeof source.recommended_starting_point === "string" ? source.recommended_starting_point : null,
    studied_texts: Array.isArray(source.studied_texts) ? source.studied_texts : [],
    active_recall: {
      score: typeof rawActiveRecall.score === "number" ? rawActiveRecall.score : 0,
      masteryLevel:
        rawActiveRecall.masteryLevel && typeof rawActiveRecall.masteryLevel === "object"
          ? rawActiveRecall.masteryLevel
          : {},
      inputs:
        rawActiveRecall.inputs && typeof rawActiveRecall.inputs === "object"
          ? rawActiveRecall.inputs
          : {},
      checks:
        rawActiveRecall.checks && typeof rawActiveRecall.checks === "object"
          ? rawActiveRecall.checks
          : {},
    },
    teach_it: {
      score: typeof rawTeachIt.score === "number" ? rawTeachIt.score : 0,
      feedback: typeof rawTeachIt.feedback === "string" ? rawTeachIt.feedback : "",
      grading: rawTeachIt.grading ?? null,
      generatedSummary: typeof rawTeachIt.generatedSummary === "string" ? rawTeachIt.generatedSummary : "",
    },
    saved_to_notebook: Boolean(source.saved_to_notebook),
    saved_notebook_page_id:
      typeof source.saved_notebook_page_id === "string" ? source.saved_notebook_page_id : null,
  };
}

/**
 * Maps string mastery labels ("Weak" | "Developing" | "Mastered") to integer levels (1 | 2 | 3),
 * with 0 representing unrated/initial state.
 */
export function masteryLabelToInt(level?: "Weak" | "Developing" | "Mastered" | number | null): number {
  if (typeof level === "number") return Math.max(0, Math.min(3, Math.round(level)));
  if (level === "Mastered") return 3;
  if (level === "Developing") return 2;
  if (level === "Weak") return 1;
  return 0;
}

/**
 * Loads track progress from Supabase and guarantees zeroed/empty defaults for any nullable columns.
 */
export async function loadTrackProgress(userId: string, trackId: string): Promise<TrackProgressRow | null> {
  try {
    const { data, error } = await supabase
      .from("track_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("track_id", trackId)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
        return null;
      }
      console.warn("loadTrackProgress error from Supabase:", error);
      return null;
    }

    if (!data) return null;

    const normalized = normalizeTrackProgressData(data);
    const numericPreTest =
      typeof normalized.pre_test_score === "number"
        ? normalized.pre_test_score
        : normalized.pre_test_score.score;

    return {
      ...data,
      pre_test_score: numericPreTest,
      recommended_starting_point: normalized.recommended_starting_point,
      studied_texts: normalized.studied_texts,
      active_recall: normalized.active_recall,
      teach_it: normalized.teach_it,
      saved_to_notebook: normalized.saved_to_notebook,
      saved_notebook_page_id: normalized.saved_notebook_page_id,
      data: normalized,
    } as TrackProgressRow;
  } catch (err) {
    console.warn("loadTrackProgress exception:", err);
    return null;
  }
}

export const TRACK_NAME_MAP: Record<string, string> = {
  "fundamental-beliefs": "28 Fundamental Beliefs",
  "salvation": "The Plan of Salvation",
  "sabbath": "The Seventh-day Sabbath",
  "sanctuary": "The Heavenly Sanctuary",
  "sanctuary-doctrine": "The Heavenly Sanctuary",
  "second-coming": "The Second Coming of Christ",
  "state-of-the-dead": "State of the Dead",
  "three-angels": "Three Angels' Messages",
  "law-and-grace": "Law and Grace",
  "health-and-temperance": "Christian Health & Temperance",
};

export function resolveTrackName(trackId?: string | null, explicitName?: string | null): string {
  if (explicitName && explicitName.trim().length > 0) {
    return explicitName.trim();
  }
  const cleanId = (trackId || "fundamental-beliefs").trim();
  return TRACK_NAME_MAP[cleanId] || "28 Fundamental Beliefs";
}

/**
 * Saves track progress to public.track_progress, ensuring non-null zeroed/empty defaults
 * so explicit NULLs never overwrite database defaults for stats or non-nullable columns.
 */
export async function saveTrackProgress(
  userId: string,
  trackId: string,
  progressData: Partial<TrackProgressData>,
  isCreation: boolean,
  trackName?: string
): Promise<boolean> {
  try {
    const safeTrackId = (trackId || "fundamental-beliefs").trim() || "fundamental-beliefs";
    const safeTrackName = resolveTrackName(safeTrackId, trackName);
    const normalized = normalizeTrackProgressData(progressData);
    const numericPreTest =
      typeof normalized.pre_test_score === "number"
        ? normalized.pre_test_score
        : normalized.pre_test_score.score;

    const dbPayload: Record<string, any> = {
      user_id: userId,
      track_id: safeTrackId,
      track_name: safeTrackName,
      pre_test_score: numericPreTest ?? 0,
      recommended_starting_point: normalized.recommended_starting_point,
      studied_texts: normalized.studied_texts,
      active_recall: normalized.active_recall,
      teach_it: normalized.teach_it,
      saved_to_notebook: Boolean(normalized.saved_to_notebook),
      saved_notebook_page_id: normalized.saved_notebook_page_id,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("track_progress")
      .upsert(dbPayload, { onConflict: "user_id,track_id" });

    if (upsertError) {
      // Fallback to Edge Function if configured
      const { error: fnError } = await supabase.functions.invoke("save-track-progress", {
        body: {
          ...dbPayload,
          data: normalized,
        },
      });
      if (fnError) {
        console.warn("saveTrackProgress failed on both direct upsert and edge function:", upsertError.message);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn("saveTrackProgress exception:", err);
    return false;
  }
}

/**
 * Upserts a verse mastery record into public.active_recall_mastery using its exact schema:
 * (user_id, track_id, verse_reference, mastery_level, attempts, successes, last_review_at, updated_at)
 * while preserving non-null zeroed defaults (0) for mastery_level, attempts, and successes.
 */
export async function upsertActiveRecallMastery(params: {
  userId: string;
  trackId: string;
  verseReference: string;
  masteryLevel: "Weak" | "Developing" | "Mastered" | number;
  isSuccess?: boolean;
}): Promise<boolean> {
  const { userId, trackId, verseReference, masteryLevel, isSuccess } = params;
  if (!userId) return false;

  const safeTrackId = (trackId || "fundamental-beliefs").trim() || "fundamental-beliefs";
  const safeVerseRef = (verseReference || "2 Timothy 3:16").trim() || "2 Timothy 3:16";

  try {
    const numericLevel = masteryLabelToInt(masteryLevel);
    const succeeded = isSuccess !== undefined ? isSuccess : numericLevel >= 2;

    // Fetch existing counters so attempts & successes increment cleanly from 0
    const { data: existing } = await supabase
      .from("active_recall_mastery")
      .select("id, attempts, successes")
      .eq("user_id", userId)
      .eq("track_id", safeTrackId)
      .eq("verse_reference", safeVerseRef)
      .maybeSingle();

    const nextAttempts = (typeof existing?.attempts === "number" ? existing.attempts : 0) + 1;
    const nextSuccesses =
      (typeof existing?.successes === "number" ? existing.successes : 0) + (succeeded ? 1 : 0);

    const payload: Record<string, any> = {
      user_id: userId,
      track_id: safeTrackId,
      verse_reference: safeVerseRef,
      mastery_level: numericLevel,
      attempts: nextAttempts,
      successes: nextSuccesses,
      last_review_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      payload.id = existing.id;
    }

    const { error } = await supabase
      .from("active_recall_mastery")
      .upsert(payload, { onConflict: "user_id,track_id,verse_reference" });

    if (error) {
      console.warn("Supabase active_recall_mastery upsert warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("upsertActiveRecallMastery exception:", err);
    return false;
  }
}

/**
 * Loads all active recall mastery rows for the given user directly from Supabase.
 */
export async function loadUserRecallMastery(userId: string): Promise<ActiveRecallMasteryRow[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("active_recall_mastery")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("loadUserRecallMastery error from Supabase:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("loadUserRecallMastery exception:", err);
    return [];
  }
}

/**
 * Initializes zeroed/empty baseline records in BOTH public.track_progress and
 * public.active_recall_mastery for a newly created or authenticated user profile,
 * supplying explicit non-null values for track_id, track_name, and verse_reference.
 */
export async function ensureInitialUserTrackProgress(
  userId: string,
  defaultTrackId: string = "fundamental-beliefs",
  defaultTrackName?: string,
  defaultVerseReference: string = "2 Timothy 3:16"
): Promise<void> {
  if (!userId) return;
  const safeTrackId = (defaultTrackId || "fundamental-beliefs").trim() || "fundamental-beliefs";
  const safeTrackName = resolveTrackName(safeTrackId, defaultTrackName);
  const safeVerseRef = (defaultVerseReference || "2 Timothy 3:16").trim() || "2 Timothy 3:16";

  try {
    const existingProgress = await loadTrackProgress(userId, safeTrackId);
    if (!existingProgress) {
      await saveTrackProgress(
        userId,
        safeTrackId,
        DEFAULT_TRACK_PROGRESS_DATA,
        true,
        safeTrackName
      );
    }

    const { data: existingRecall } = await supabase
      .from("active_recall_mastery")
      .select("id")
      .eq("user_id", userId)
      .eq("track_id", safeTrackId)
      .eq("verse_reference", safeVerseRef)
      .maybeSingle();

    if (!existingRecall) {
      await supabase
        .from("active_recall_mastery")
        .upsert(
          {
            user_id: userId,
            track_id: safeTrackId,
            verse_reference: safeVerseRef,
            mastery_level: 0,
            attempts: 0,
            successes: 0,
            last_review_at: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,track_id,verse_reference" }
        );
    }
  } catch (err) {
    console.warn("ensureInitialUserTrackProgress exception:", err);
  }
}


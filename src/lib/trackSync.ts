import { supabase } from './supabase';

export interface TrackProgressData {
  pre_test_score: {
    score: number;
    submitted: boolean;
    answers: Record<number, number>;
  } | null;
  recommended_starting_point: string | null;
  studied_texts: string[];
  active_recall: {
    masteryLevel: Record<string, "Weak" | "Developing" | "Mastered">;
    inputs: Record<string, string>;
    checks: Record<string, boolean>;
  };
  teach_it: {
    grading: any;
    generatedSummary: string;
  } | null;
  saved_to_notebook: boolean;
  saved_notebook_page_id: string | null;
}

export interface TrackProgressRow {
  user_id: string;
  track_id: string;
  track_name?: string;
  data: TrackProgressData;
  created_at?: string;
  updated_at?: string;
}

/**
 * Loads track progress from Supabase.
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
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return null;
      }
      console.warn("loadTrackProgress error from Supabase:", error);
      return null;
    }

    return data as TrackProgressRow | null;
  } catch (err) {
    console.warn("loadTrackProgress exception:", err);
    return null;
  }
}

/**
 * Saves track progress by calling the Edge Function: save-track-progress.
 */
export async function saveTrackProgress(
  userId: string,
  trackId: string,
  progressData: TrackProgressData,
  isCreation: boolean,
  trackName?: string
): Promise<boolean> {
  try {
    const body: any = {
      user_id: userId,
      track_id: trackId,
      data: progressData
    };

    if (isCreation && trackName) {
      body.track_name = trackName;
    }

    const { data, error } = await supabase.functions.invoke("save-track-progress", {
      body
    });

    if (error) {
      console.warn("Edge function save-track-progress failed:", error);
      
      // Fallback: If edge function fails (e.g., local development sandbox where edge functions might not be fully routed),
      // we can try direct database insert/upsert so the user's progress is STILL saved perfectly!
      try {
        const payload: any = {
          user_id: userId,
          track_id: trackId,
          data: progressData,
          updated_at: new Date().toISOString()
        };
        if (isCreation && trackName) {
          payload.track_name = trackName;
        }
        const { error: upsertError } = await supabase
          .from("track_progress")
          .upsert(payload, { onConflict: "user_id,track_id" });
        
        if (upsertError) {
          console.warn("Fallback upsert also failed:", upsertError.message);
          return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn("saveTrackProgress exception:", err);
    return false;
  }
}

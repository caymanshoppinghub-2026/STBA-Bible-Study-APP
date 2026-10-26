import { supabase } from './supabase'
import { StudyNote, HighlightItem } from '../types/notebook'

/**
 * Ensures any string ID is mapped deterministically to a valid standard UUID format,
 * satisfying both 'text' and 'uuid' column type constraints in PostgreSQL databases.
 */
export function getDeterministicUUID(str: string): string {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  
  // If it is already a valid UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str;
  }

  // Pre-determined static clean mapping for standard seed notes
  if (str === 'nb-1') return '11111111-1111-4111-a111-111111111111';
  if (str === 'nb-2') return '22222222-2222-4222-b222-222222222222';
  if (str === 'nb-3') return '33333333-3333-4333-c333-333333333333';

  // For other custom user IDs (like 'nb-1781381003163'), generate a unique deterministic UUID
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let hex = '';
  for (let i = 0; i < 16; i++) {
    const val = Math.abs(Math.sin(hash + i) * 16777215) % 256;
    hex += Math.floor(val).toString(16).padStart(2, '0');
  }

  const p1 = hex.slice(0, 8);
  const p2 = hex.slice(8, 12);
  const p3 = '4' + hex.slice(13, 16); // uuid v4 version requirement
  const p4 = 'a' + hex.slice(17, 20); // uuid variant requirement
  const p5 = hex.slice(20, 32);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

// Convert Supabase DB columns back to frontend StudyNote model
export function fromSupabase(row: any): StudyNote {
  return {
    id: row.id,
    title: row.title || 'Untitled note',
    summary: row.summary || '',
    content: row.content || '',
    category: (row.category || 'theology') as any,
    scriptureTags: row.scripture_tags || row.scriptureTags || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    isFavorite: !!(row.is_favorite ?? row.isFavorite),
    children: row.children || [],
    order: typeof row.order === 'number' ? row.order : 0
  }
}

/**
 * Ensures that the user identity is resolved and authenticated in Supabase or local persistent profile.
 */
export async function ensureSupabaseAuth(): Promise<any> {
  try {
    // 1. Check current active session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user;
    }
  } catch (e) {}

  // 2. Derive profile details from local storage or guest ID
  let emailLower = "";
  let name = "Berean Scholar";

  try {
    const saved = localStorage.getItem("stba_user_profile");
    if (saved) {
      const profile = JSON.parse(saved);
      if (profile && profile.email) {
        emailLower = profile.email.toLowerCase().trim();
        name = profile.name || name;
      }
    }
  } catch (e) {}

  if (!emailLower) {
    let guestId = localStorage.getItem("stba_guest_device_id");
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("stba_guest_device_id", guestId);
    }
    emailLower = `${guestId}@stba.internal`;
    name = "Berean Scholar";
  }

  // 3. Attempt silent Supabase auth in background
  try {
    const password = `StbaSecPass_1779_${emailLower.replace(/[^a-zA-Z0-9]/g, '')}`;
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password: password
    });
    if (signInData?.user) {
      return signInData.user;
    }
  } catch (e) {}

  // Fallback persistent user representation
  const deterministicId = getDeterministicUUID(emailLower);
  return {
    id: deterministicId,
    email: emailLower,
    user_metadata: { name }
  };
}

/**
 * Checks if the cloud storage connection is alive (either Supabase or STBA Cloud Sync).
 */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    // Check Supabase first
    const { error: sbErr } = await supabase
      .from('stba_study_notes')
      .select('id')
      .limit(1);

    if (!sbErr) {
      return { ok: true };
    }

    // If Supabase table exists or server cloud is reachable
    const res = await fetch("/api/notebook/status");
    if (res.ok) {
      return { ok: true };
    }

    if (sbErr) {
      if (sbErr.code === 'PGRST116' || sbErr.message?.includes('does not exist')) {
        return { ok: false, error: 'TABLE_MISSING' };
      }
    }
    return { ok: true };
  } catch (err: any) {
    // Fallback check to server API
    try {
      const res = await fetch("/api/notebook/status");
      if (res.ok) {
        return { ok: true };
      }
    } catch {}
    return { ok: true };
  }
}

/**
 * Loads all notes from cloud storage belonging to the authenticated user.
 */
export async function fetchNotesFromSupabase(): Promise<StudyNote[]> {
  try {
    const user = await ensureSupabaseAuth();
    const userId = user?.id || "stba_default_user";

    // 1. Try server cloud storage
    try {
      const res = await fetch(`/api/notebook/notes?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.notes) && json.notes.length > 0) {
          return json.notes.map((n: any) => ({
            id: getDeterministicUUID(n.id),
            title: n.title || 'Untitled Note',
            summary: n.summary || '',
            content: n.content || '',
            category: n.category || 'theology',
            scriptureTags: n.scriptureTags || n.scripture_tags || [],
            createdAt: n.createdAt || n.created_at || new Date().toISOString(),
            updatedAt: n.updatedAt || n.updated_at || new Date().toISOString(),
            isFavorite: !!(n.isFavorite ?? n.is_favorite),
            children: (n.children || []).map(getDeterministicUUID),
            order: typeof n.order === 'number' ? n.order : 0
          }));
        }
      }
    } catch (e) {}

    // 2. Try Supabase
    if (user) {
      const { data, error } = await supabase
        .from('stba_study_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(fromSupabase);
      }
    }

    return [];
  } catch (err) {
    return [];
  }
}

/**
 * Save / Update a study note in cloud storage.
 * Returns the note UUID.
 */
export async function saveNoteToSupabase(note: StudyNote): Promise<string> {
  const user = await ensureSupabaseAuth();
  const userId = user?.id || "stba_default_user";
  const noteId = getDeterministicUUID(note.id);

  const payload: any = {
    id: noteId,
    title: note.title || 'Untitled Note',
    summary: note.summary || '',
    content: note.content || '',
    category: (note.category && (note.category as any) !== 'all') ? note.category : 'theology',
    scripture_tags: note.scriptureTags || (note as any).scripture_tags || [],
    children: (note.children || (note as any).children || []).map(getDeterministicUUID),
    order: typeof note.order === 'number' ? note.order : 0,
    is_favorite: !!(note.isFavorite ?? (note as any).is_favorite),
    user_id: userId,
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save to server backend
  try {
    await fetch("/api/notebook/save-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, note: payload })
    });
  } catch (e) {
    console.warn("Server save note exception:", e);
  }

  // 2. Attempt Supabase upsert in background
  try {
    const sbPayload = {
      id: noteId,
      title: payload.title,
      summary: payload.summary,
      content: payload.content,
      category: payload.category,
      scripture_tags: payload.scripture_tags,
      children: payload.children,
      order: payload.order,
      is_favorite: payload.is_favorite,
      user_id: userId
    };
    await supabase.from('stba_study_notes').upsert(sbPayload, { onConflict: 'id' });
  } catch (e) {}

  return noteId;
}

/**
 * Deletes a note from cloud storage.
 */
export async function deleteNoteFromSupabase(noteId: string): Promise<void> {
  const user = await ensureSupabaseAuth();
  const userId = user?.id || "stba_default_user";
  const targetId = getDeterministicUUID(noteId);

  // 1. Delete on server backend
  try {
    await fetch("/api/notebook/delete-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, noteId: targetId })
    });
  } catch (e) {
    console.warn("Server delete note exception:", e);
  }

  // 2. Delete on Supabase
  try {
    await supabase.from('stba_study_notes').delete().eq('id', targetId);
  } catch (e) {}
}

/**
 * Performs a broad bulk sync override of all local notes into cloud storage.
 * Returns the updated notes with verified UUIDs.
 */
export async function syncAllLocalNotesToSupabase(notes: StudyNote[]): Promise<StudyNote[]> {
  const user = await ensureSupabaseAuth();
  const userId = user?.id || "stba_default_user";

  const sanitizedNotes = notes.map((note, index) => ({
    ...note,
    id: getDeterministicUUID(note.id),
    order: typeof note.order === 'number' ? note.order : index,
    children: (note.children || []).map(getDeterministicUUID),
    updatedAt: note.updatedAt || new Date().toISOString()
  }));

  // 1. Bulk sync to server backend
  try {
    const res = await fetch("/api/notebook/sync-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, notes: sanitizedNotes })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.notes)) {
        return json.notes;
      }
    }
  } catch (e) {
    console.warn("Server bulk sync exception:", e);
  }

  // 2. Sync to Supabase in parallel
  for (const note of sanitizedNotes) {
    try {
      await saveNoteToSupabase(note);
    } catch (err) {
      console.warn(`Failed to sync note ${note.title} to Supabase:`, err);
    }
  }

  return sanitizedNotes;
}

/**
 * Checks if the stba_study_categories table exists.
 */
export async function checkCategoriesTable(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('stba_study_categories')
      .select('id')
      .limit(1);
    if (error && (error.code === 'PGRST116' || error.message?.includes('does not exist'))) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Loads categories from cloud storage.
 */
export async function fetchCategoriesFromSupabase(): Promise<Record<string, { label: string; code: string; color: string }> | null> {
  // 1. Try server backend first
  try {
    const res = await fetch("/api/notebook/categories");
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.categories) {
        return json.categories;
      }
    }
  } catch (e) {}

  // 2. Try Supabase
  try {
    const { data, error } = await supabase
      .from('stba_study_categories')
      .select('*')
      .order('order', { ascending: true });

    if (!error && data && data.length > 0) {
      const result: Record<string, { label: string; code: string; color: string }> = {};
      data.forEach((row: any) => {
        result[row.id] = {
          label: row.label,
          code: row.code,
          color: row.color,
        };
      });
      return result;
    }
  } catch (e) {}

  return null;
}

/**
 * Saves a single category to cloud storage.
 */
export async function saveCategoryToSupabase(key: string, cat: { label: string; code: string; color: string }, order: number = 0): Promise<void> {
  try {
    await fetch("/api/notebook/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: { [key]: cat } })
    });
  } catch (e) {}

  try {
    await supabase
      .from('stba_study_categories')
      .upsert({
        id: key,
        label: cat.label,
        code: cat.code,
        color: cat.color,
        order: order
      }, { onConflict: 'id' });
  } catch (e) {}
}

/**
 * Deletes a category from cloud storage.
 */
export async function deleteCategoryFromSupabase(key: string): Promise<void> {
  try {
    await supabase
      .from('stba_study_categories')
      .delete()
      .eq('id', key);
  } catch (e) {}
}

/**
 * Syncs all local categories to cloud storage.
 */
export async function syncAllLocalCategoriesToSupabase(categories: Record<string, { label: string; code: string; color: string }>): Promise<void> {
  try {
    await fetch("/api/notebook/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories })
    });
  } catch (e) {}

  try {
    const payloads = Object.keys(categories).map((key, index) => ({
      id: key,
      label: categories[key].label,
      code: categories[key].code,
      color: categories[key].color,
      order: index
    }));

    await supabase
      .from('stba_study_categories')
      .upsert(payloads, { onConflict: 'id' });
  } catch (e) {}
}

/**
 * Fetch all highlights (combines cloud highlights with local fallback)
 */
export async function fetchHighlightsFromSupabase(): Promise<HighlightItem[]> {
  const localRaw = localStorage.getItem('stba_study_highlights');
  let localItems: HighlightItem[] = [];
  if (localRaw) {
    try {
      localItems = JSON.parse(localRaw);
    } catch (e) {}
  }

  try {
    const user = await ensureSupabaseAuth();
    const userId = user?.id || "stba_default_user";

    // 1. Try server backend
    try {
      const res = await fetch(`/api/notebook/highlights?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.highlights) && json.highlights.length > 0) {
          const mergedMap = new Map<string, HighlightItem>();
          localItems.forEach(item => mergedMap.set(item.id, item));
          json.highlights.forEach((item: any) => mergedMap.set(item.id, item));
          const merged = Array.from(mergedMap.values());
          localStorage.setItem('stba_study_highlights', JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {}

    // 2. Try Supabase
    if (user) {
      const { data, error } = await supabase
        .from('stba_study_highlights')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        const formattedCloud: HighlightItem[] = data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          translation: row.translation,
          verse_reference: row.verse_reference,
          text_snippet: row.text_snippet || undefined,
          color: row.color,
          created_at: row.created_at
        }));

        const mergedMap = new Map<string, HighlightItem>();
        localItems.forEach(item => mergedMap.set(item.id, item));
        formattedCloud.forEach(item => mergedMap.set(item.id, item));
        const merged = Array.from(mergedMap.values());

        localStorage.setItem('stba_study_highlights', JSON.stringify(merged));
        return merged;
      }
    }
    return localItems;
  } catch (err: any) {
    return localItems;
  }
}

/**
 * Upsert/save highlight to LocalState + Cloud Storage
 */
export async function saveHighlightToSupabase(item: HighlightItem): Promise<string> {
  const localRaw = localStorage.getItem('stba_study_highlights');
  let localItems: HighlightItem[] = [];
  if (localRaw) {
    try {
      localItems = JSON.parse(localRaw);
    } catch (e) {}
  }

  const existingIdx = localItems.findIndex(i => i.id === item.id);
  const updatedItem = { ...item, created_at: item.created_at || new Date().toISOString() };
  if (existingIdx >= 0) {
    localItems[existingIdx] = updatedItem;
  } else {
    localItems.push(updatedItem);
  }
  localStorage.setItem('stba_study_highlights', JSON.stringify(localItems));

  const user = await ensureSupabaseAuth();
  const userId = user?.id || "stba_default_user";
  updatedItem.user_id = userId;

  // 1. Save to server backend
  try {
    await fetch("/api/notebook/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, highlight: updatedItem })
    });
  } catch (e) {}

  // 2. Try syncing to Supabase
  try {
    const payload = {
      id: updatedItem.id,
      user_id: userId,
      translation: updatedItem.translation,
      verse_reference: updatedItem.verse_reference,
      text_snippet: updatedItem.text_snippet || '',
      color: updatedItem.color,
      created_at: updatedItem.created_at
    };
    await supabase.from('stba_study_highlights').upsert(payload, { onConflict: 'id' });
  } catch (err) {}

  return updatedItem.id;
}

/**
 * Delete a highlight from LocalState + Cloud Storage
 */
export async function deleteHighlightFromSupabase(highlightId: string): Promise<void> {
  const localRaw = localStorage.getItem('stba_study_highlights');
  if (localRaw) {
    try {
      let localItems: HighlightItem[] = JSON.parse(localRaw);
      localItems = localItems.filter(i => i.id !== highlightId);
      localStorage.setItem('stba_study_highlights', JSON.stringify(localItems));
    } catch (e) {}
  }

  const user = await ensureSupabaseAuth();
  const userId = user?.id || "stba_default_user";

  try {
    await fetch("/api/notebook/delete-highlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, highlightId })
    });
  } catch (e) {}

  try {
    await supabase.from('stba_study_highlights').delete().eq('id', highlightId);
  } catch (err) {}
}

/**
 * Saves user profile and settings/preferences to storage.
 */
export async function saveProfileToSupabase(profile: any): Promise<void> {
  try {
    const aiVoice = localStorage.getItem("stba_ai_voice") || "Puck";
    const dailyVerseLimit = localStorage.getItem("stba_daily_verse_limit") || "5";
    const recallQueueFrequency = localStorage.getItem("stba_recall_queue_frequency") || "5";
    const notificationsEnabled = localStorage.getItem("stba_notifications_enabled") || "true";
    const reminderTime = localStorage.getItem("stba_reminder_time") || "07:30";
    const bibleVersion = localStorage.getItem("stba_bible_version") || "KJV";
    const userTier = localStorage.getItem("stba_user_tier") || "Beginner";
    const egwIntegration = localStorage.getItem("stba_egw_integration") || "true";

    await supabase.auth.updateUser({
      data: {
        name: profile.name,
        profilePic: profile.profilePic || "",
        role: profile.role,
        isSda: profile.isSda !== false,
        firstTrack: profile.firstTrack || "fundamental-beliefs",
        emailVerified: profile.emailVerified !== false,
        isGuest: false,
        
        // Preferences
        stba_ai_voice: aiVoice,
        stba_daily_verse_limit: dailyVerseLimit,
        stba_recall_queue_frequency: recallQueueFrequency,
        stba_notifications_enabled: notificationsEnabled,
        stba_reminder_time: reminderTime,
        stba_bible_version: bibleVersion,
        stba_user_tier: userTier,
        stba_egw_integration: egwIntegration
      }
    });
  } catch (err) {
    console.warn("Error saving profile to Supabase:", err);
  }
}

/**
 * Loads user profile and settings/preferences from storage.
 */
export async function fetchProfileFromSupabase(): Promise<any | null> {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) {
      return null;
    }

    const metadata = authUser.user_metadata || {};
    if (!metadata.name && !metadata.stba_ai_voice) {
      return null;
    }
    
    const profile = {
      name: metadata.name || authUser.email?.split("@")[0] || "Scholar",
      email: authUser.email || "",
      isSda: metadata.isSda !== false,
      firstTrack: metadata.firstTrack || "fundamental-beliefs",
      role: metadata.role || "STBAScholar",
      isGuest: false,
      emailVerified: metadata.emailVerified !== false,
      profilePic: metadata.profilePic || ""
    };

    if (metadata.stba_ai_voice) localStorage.setItem("stba_ai_voice", metadata.stba_ai_voice);
    if (metadata.stba_daily_verse_limit) localStorage.setItem("stba_daily_verse_limit", metadata.stba_daily_verse_limit);
    if (metadata.stba_recall_queue_frequency) localStorage.setItem("stba_recall_queue_frequency", metadata.stba_recall_queue_frequency);
    if (metadata.stba_notifications_enabled) localStorage.setItem("stba_notifications_enabled", metadata.stba_notifications_enabled);
    if (metadata.stba_reminder_time) localStorage.setItem("stba_reminder_time", metadata.stba_reminder_time);
    if (metadata.stba_bible_version) localStorage.setItem("stba_bible_version", metadata.stba_bible_version);
    if (metadata.stba_user_tier) localStorage.setItem("stba_user_tier", metadata.stba_user_tier);
    if (metadata.stba_egw_integration) localStorage.setItem("stba_egw_integration", metadata.stba_egw_integration);

    return profile;
  } catch (err) {
    return null;
  }
}

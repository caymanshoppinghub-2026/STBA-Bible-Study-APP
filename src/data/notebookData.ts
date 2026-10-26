import { StudyNote } from '../types/notebook'
import { saveNoteToSupabase } from '../lib/notebookSync'

/**
 * Ensures any legacy string ID is mapped deterministically to a valid standard UUID format,
 * satisfying both 'text' and 'uuid' column type constraints in PostgreSQL databases.
 */
function getDeterministicUUID(str: string): string {
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

export const CATEGORY_META = {
  all:              { label: 'All Notes',       code: '∗', color: '#9A9490' },
  theology:         { label: 'Theology',         code: 'T', color: '#C5A059' },
  history:          { label: 'History',          code: 'H', color: '#7B9EBE' },
  'personal-growth':{ label: 'Personal Growth',  code: 'P', color: '#A8C5A0' },
  'biblical-studies':{ label: 'Biblical Studies', code: 'B', color: '#4ECDC4' },
  custom:           { label: 'Custom',           code: 'C', color: '#C084FC' },
}

const CAT_LS_KEY = 'stba_notebook_categories'

export function loadCategories(): Record<string, { label: string; code: string; color: string }> {
  try {
    const s = localStorage.getItem(CAT_LS_KEY)
    if (!s) return CATEGORY_META
    const parsed = JSON.parse(s)
    if (parsed && typeof parsed === 'object') {
      return { ...CATEGORY_META, ...parsed }
    }
    return CATEGORY_META
  } catch {
    return CATEGORY_META
  }
}

export function saveCategories(categories: Record<string, { label: string; code: string; color: string }>): void {
  localStorage.setItem(CAT_LS_KEY, JSON.stringify(categories))
}

export const SEED_NOTES: StudyNote[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    title: 'The Investigative Judgment',
    summary: 'Daniel 8:14 and the 2300-day prophecy in Adventist theology',
    content: '# The Investigative Judgment\n\n## The Foundational Text\n**Daniel 8:14** — *"Unto two thousand and three hundred days; then shall the sanctuary be cleansed."*\n\n## The 1844 Significance\nOctober 22, 1844 marks the beginning of Christ\'s High Priestly ministry in the Most Holy Place of the heavenly sanctuary...\n\n## EGW Insight\n> *"The subject of the sanctuary and the investigative judgment should be clearly understood by the people of God."* — The Great Controversy, p. 488',
    category: 'theology',
    scriptureTags: ['Daniel 8:14', 'Hebrews 8:1-2', 'Revelation 14:7'],
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-05-20T14:30:00Z',
    isFavorite: true,
    children: [],
    order: 0
  },
  {
    id: '22222222-2222-4222-b222-222222222222',
    title: "The Three Angels' Messages",
    summary: 'Revelation 14:6-12 — The everlasting gospel and end-time proclamation',
    content: "# The Three Angels' Messages\n\n## First Angel\n\"Fear God and give glory to Him, for the hour of His judgment has come\" — A call to true worship...\n\n## Second Angel\n\"Babylon is fallen\" — The spiritual corruption of apostate Christianity...\n\n## Third Angel\nThe most solemn warning in Scripture against the mark of the beast...",
    category: 'theology',
    scriptureTags: ['Revelation 14:6-12', 'Revelation 18:4'],
    createdAt: '2026-05-10T08:00:00Z',
    updatedAt: '2026-05-18T11:00:00Z',
    isFavorite: true,
    children: [],
    order: 1
  },
  {
    id: '33333333-3333-4333-c333-333333333333',
    title: 'The Great Disappointment of 1844',
    summary: 'Historical background of the Millerite movement and its theological aftermath',
    content: '# The Great Disappointment\n\n## William Miller\nWilliam Miller studied Daniel 8:14 and concluded Christ would return around 1844...\n\n## October 22, 1844\nThousands waited expectantly. The "Great Disappointment" shattered the Millerite movement...\n\n## The Remnant Response\nA small group concluded the error was not in the date but in the event.',
    category: 'history',
    scriptureTags: ['Daniel 8:14', 'Revelation 10:9-10'],
    createdAt: '2026-04-28T10:00:00Z',
    updatedAt: '2026-05-01T09:00:00Z',
    isFavorite: false,
    children: [],
    order: 2
  }
]

const LS_KEY = 'stba_notebook_notes'

export function loadNotes(): StudyNote[] {
  try {
    const s = localStorage.getItem(LS_KEY)
    let rawNotes: StudyNote[] = []
    if (!s) {
      rawNotes = SEED_NOTES.map((n, idx) => ({
        ...n,
        expanded: false,
        order: typeof n.order === 'number' ? n.order : idx
      }))
    } else {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) {
        rawNotes = parsed.map((n, idx) => {
          return {
            id: getDeterministicUUID(n.id),
            title: n.title || 'Untitled Note',
            summary: n.summary || '',
            content: n.content || '',
            category: n.category || 'theology',
            scriptureTags: n.scriptureTags || [],
            createdAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.updatedAt || new Date().toISOString(),
            isFavorite: !!n.isFavorite,
            children: (n.children || []).map(getDeterministicUUID),
            order: typeof n.order === 'number' ? n.order : idx,
            expanded: n.expanded !== undefined ? !!n.expanded : false
          }
        })
      } else {
        rawNotes = SEED_NOTES.map((n, idx) => ({
          ...n,
          expanded: false,
          order: typeof n.order === 'number' ? n.order : idx
        }))
      }
    }

    // Build notesById map
    const notesById: Record<string, StudyNote> = {};
    rawNotes.forEach(n => {
      notesById[n.id] = n;
    });

    // Resolve children and ensure recursion is safe (no infinite loops)
    rawNotes.forEach(note => {
      const validChildren: string[] = [];
      const visitedInPath = new Set<string>();

      const checkCycle = (currId: string): boolean => {
        if (currId === note.id) return true; // Direct loop to parent
        if (visitedInPath.has(currId)) return true; // Deep loop
        
        visitedInPath.add(currId);
        const childNote = notesById[currId];
        if (childNote && childNote.children) {
          for (const cid of childNote.children) {
            if (checkCycle(cid)) return true;
          }
        }
        visitedInPath.delete(currId);
        return false;
      };

      for (const childId of note.children) {
        if (notesById[childId] && !checkCycle(childId)) {
          validChildren.push(childId);
        }
      }
      note.children = validChildren;
    });

    return rawNotes;
  } catch {
    return SEED_NOTES.map((n, idx) => ({
      ...n,
      expanded: false,
      order: typeof n.order === 'number' ? n.order : idx
    }))
  }
}

export function saveNotes(notes: StudyNote[]): void {
  // Always sanitize the note IDs on save to localStorage to maintain total parity
  const serialized = notes.map(n => ({
    ...n,
    id: getDeterministicUUID(n.id),
    children: (n.children || []).map(getDeterministicUUID),
    expanded: n.expanded !== undefined ? !!n.expanded : false
  }))
  localStorage.setItem(LS_KEY, JSON.stringify(serialized))
}

export function saveResponseAsNewNote({
  title,
  content,
  summary,
  category = "theology",
  scriptureTags = []
}: {
  title: string;
  content: string;
  summary?: string;
  category?: 'theology' | 'history' | 'personal-growth' | 'biblical-studies' | 'custom';
  scriptureTags?: string[];
}): StudyNote {
  const existingNotes = loadNotes();
  const rawId = `note-${Date.now()}`;
  const noteId = getDeterministicUUID(rawId);

  // Extract scriptures if tags empty
  const detected = content.match(/\b(?:(?:1|2|3)\s+)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+\d+:\d+(?:[-–—]\d+)?\b/g) || [];
  const combinedTags = Array.from(new Set([...scriptureTags, ...detected])).slice(0, 6);

  const cleanSummary = summary || content.replace(/[#*`>]/g, "").slice(0, 240).trim() + (content.length > 240 ? "..." : "");

  const newNote: StudyNote = {
    id: noteId,
    title: title.trim() || `Elder Stephen Note (${new Date().toLocaleDateString()})`,
    summary: cleanSummary,
    content: content.trim(),
    category: category || "theology",
    scriptureTags: combinedTags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    children: [],
    order: 0,
    expanded: false
  };

  const updated = [newNote, ...existingNotes];
  saveNotes(updated);

  // Sync to legacy local storage key if used
  try {
    const rawLegacy = localStorage.getItem("stba_user_notebook_notes");
    const legacyList = rawLegacy ? JSON.parse(rawLegacy) : [];
    legacyList.unshift({
      id: noteId,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: ["Elder Stephen", ...combinedTags],
      created_at: newNote.createdAt,
      updated_at: newNote.updatedAt
    });
    localStorage.setItem("stba_user_notebook_notes", JSON.stringify(legacyList));
  } catch (e) {}

  // Dispatch events to notify Dashboard, Notebook, and other views
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("stba_notebook_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  // Persist directly to Supabase / server database in background
  try {
    saveNoteToSupabase(newNote).catch(err => {
      console.warn("Background cloud note sync notice:", err);
    });
  } catch (e) {}

  return newNote;
}

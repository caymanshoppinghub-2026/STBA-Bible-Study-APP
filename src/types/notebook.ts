export type NoteCategory = 'all' | 'theology' | 'history' | 'personal-growth' | 'biblical-studies' | 'custom'
export type EditorMode = 'draft' | 'read'
export type DrawerMode = 'mastery' | 'elder' | 'closed'

export interface StudyNote {
  id: string
  title: string
  summary: string
  content: string
  category: Exclude<NoteCategory, 'all'>
  scriptureTags: string[]
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  children: string[]
  order: number
  expanded?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'elder'
  text: string
  timestamp: string
  commentaryMode?: 'prestige' | 'velocity'
}

export interface MasteryQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
  userAnswer?: number
}

export interface CSMSReview {
  noteId: string
  bigIdea: string
  recap: string[]
  scriptures: string[]
  practicalSteps: string[]
  pastoralReflection: string
  masteryQuestions: MasteryQuestion[]
  generatedAt: string
}

export interface HighlightItem {
  id: string;          // unique id (uuid or local numeric generated)
  user_id: string;      // supabase auth user.id or local-only/guest token
  translation: string;  // e.g., 'NKJV', 'KJV', 'ESV', 'NASB'
  verse_reference: string; // e.g., 'Revelation 14:6'
  text_snippet?: string;    // specific selected word/sub-phrase, optional
  color: string;        // hex color representation (#FFF3A3, #A3D4FF, etc.)
  created_at?: string;  // ISO timestamp
}


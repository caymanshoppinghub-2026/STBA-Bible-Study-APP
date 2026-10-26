import { StudyNote } from '../types/notebook'
import { ensureSupabaseAuth } from './notebookSync'
import { supabase } from './supabase'
import { formatProperElderSpacing, ensureElderStephenOutlineCompletion, isSpecificScopedRequest } from '../utils/elderSpacing'

export interface ChatMessagePayload {
  role: 'user' | 'elder' | 'model'
  text: string
  timestamp?: string
}

export interface MasteryStatePayload {
  completedVersesCount: number
  totalVersesCount: number
  completionRate: number
  lastActiveDate: string
  favoriteScriptures: string[]
}

export interface ElderStephenPayload {
  userId: string
  userName: string
  currentMode: 'Recall' | 'Explain' | 'Teach It' | 'STBA' | 'Syllabus' | 'Sabbath School Studies' | string
  contextSummary?: string
  noteTitle?: string
  noteContent?: string
  masteryState?: MasteryStatePayload
  historyLog: ChatMessagePayload[]
  userAction?: string
  week_number?: number
  reflections?: string
  progress?: any
  passage?: string
  outline?: string
  audience?: string
  verse?: string
  user_explanation?: string
  metric_data?: any
  base_verse?: string
  related_verses?: any[]
  notes?: string
  sessionMemory?: any
  commentaryMode?: 'prestige' | 'velocity' | 'auto'
}

/**
 * Autocompletes and prepares the unified payload for the Elder Stephen endpoint.
 */
export function buildUnifiedPayload(partial: Partial<ElderStephenPayload>): ElderStephenPayload {
  // 1. Resolve user profile
  let userId = partial.userId || 'guest_berean'
  let userName = partial.userName || 'Berean'
  
  try {
    const savedProfile = localStorage.getItem('stba_user_profile')
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      if (parsed) {
        if (parsed.uid || parsed.id) userId = parsed.uid || parsed.id
        if (parsed.name || parsed.displayName) userName = parsed.name || parsed.displayName
      }
    }
  } catch (e) {
    console.error('Error parsing user profile from localStorage:', e)
  }

  // 2. Resolve default current study mode
  const currentMode = partial.currentMode || 'Explain'

  // 3. Resolve mastery state from local indicators
  let completedVerses: string[] = []
  try {
    const savedCompleted = localStorage.getItem('stba_completed_verses')
    if (savedCompleted) {
      completedVerses = JSON.parse(savedCompleted)
    }
  } catch (e) {}

  let favoriteScriptures: string[] = []
  try {
    const savedFav = localStorage.getItem('stba_favorite_scriptures')
    if (savedFav) {
      const parsedFav = JSON.parse(savedFav)
      favoriteScriptures = parsedFav.map((s: any) => s.reference || s.text || String(s))
    }
  } catch (e) {}

  const defaultMastery: MasteryStatePayload = {
    completedVersesCount: completedVerses.length,
    totalVersesCount: 28, // STBA standard doctrinal primary verses
    completionRate: completedVerses.length > 0 ? Math.round((completedVerses.length / 28) * 100) : 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    favoriteScriptures
  }

  let sessionMemory: any = null;
  try {
    const savedMemory = localStorage.getItem('stba_elder_stephen_memory_v2');
    if (savedMemory) {
      sessionMemory = JSON.parse(savedMemory);
    }
    const persistentState = localStorage.getItem('stba_elder_stephen_persistent_state_v2');
    if (persistentState) {
      const parsedState = JSON.parse(persistentState);
      if (parsedState && parsedState.studyFlow) {
        sessionMemory = {
          ...sessionMemory,
          studyFlow: parsedState.studyFlow,
          currentTopic: parsedState.studyFlow.currentTopic,
          currentPassage: parsedState.studyFlow.currentPassage,
          currentDocTitle: parsedState.documentContext?.title || parsedState.studyFlow.currentTopic
        };
      }
    }
  } catch (e) {
    console.error('Error loading session memory in payload builder:', e);
  }

  const resolvedTitle = partial.noteTitle || sessionMemory?.currentDocTitle || sessionMemory?.currentTopic || '';
  const resolvedPassage = partial.passage || sessionMemory?.currentPassage || '';

  return {
    userId,
    userName,
    currentMode,
    contextSummary: partial.contextSummary || (sessionMemory?.studyFlow ? `Active Study Flow: [${sessionMemory.studyFlow.currentMode}] ${sessionMemory.studyFlow.currentTopic} (${sessionMemory.studyFlow.currentPassage})` : ''),
    noteTitle: resolvedTitle,
    noteContent: partial.noteContent || '',
    masteryState: partial.masteryState || defaultMastery,
    historyLog: partial.historyLog || [],
    userAction: partial.userAction || '',
    week_number: partial.week_number,
    reflections: partial.reflections,
    progress: partial.progress,
    passage: resolvedPassage,
    outline: partial.outline,
    audience: partial.audience,
    verse: partial.verse || resolvedPassage,
    user_explanation: partial.user_explanation,
    metric_data: partial.metric_data,
    base_verse: partial.base_verse || resolvedPassage,
    related_verses: partial.related_verses,
    notes: partial.notes,
    sessionMemory: partial.sessionMemory || sessionMemory,
    commentaryMode: partial.commentaryMode
  }
}

function recordSessionObservation(passage: string, observation: string) {
  if (!passage || !observation) return;
  try {
    const STORAGE_KEY = "stba_elder_stephen_memory_v2";
    const saved = localStorage.getItem(STORAGE_KEY);
    const memory = saved ? JSON.parse(saved) : {};
    if (!memory.previousObservations) {
      memory.previousObservations = {};
    }
    const list = memory.previousObservations[passage] || [];
    if (!list.includes(observation) && observation.trim().length > 3) {
      memory.previousObservations[passage] = [...list, observation.trim()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    }
  } catch (e) {
    console.error("Failed to automatically record session observation:", e);
  }
}

/**
 * Send the unified payload to the server-side Elder Stephen AI backend.
 */
export async function callElderStephen(partialPayload: Partial<ElderStephenPayload>): Promise<{ text: string; commentaryMode?: 'prestige' | 'velocity'; modeUsed?: 'prestige' | 'velocity'; latencyMs?: number }> {
  const payload = buildUnifiedPayload(partialPayload)

  // Fetch track progress from Supabase to provide Elder Stephen with long-term memory
  if (!payload.progress) {
    try {
      const sbUser = await ensureSupabaseAuth();
      if (sbUser) {
        const { data, error } = await supabase
          .from("track_progress")
          .select("*")
          .eq("user_id", sbUser.id);
        if (!error && data) {
          payload.progress = data;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch track_progress in callElderStephen:", err);
    }
  }

  // Auto-record active user reflections, observations, explanations, and thoughts
  const currentPassage = payload.passage || payload.base_verse || payload.verse || (payload.sessionMemory && payload.sessionMemory.currentPassage) || "General Study";

  if (currentPassage && currentPassage !== "General Study") {
    if (payload.user_explanation) {
      recordSessionObservation(currentPassage, `User Explanation: ${payload.user_explanation}`);
    }
    if (payload.notes) {
      recordSessionObservation(currentPassage, `Study Notes: ${payload.notes}`);
    }
    if (payload.reflections) {
      recordSessionObservation(currentPassage, `User Reflections: ${payload.reflections}`);
    }
    if (payload.historyLog && payload.historyLog.length > 0) {
      const lastUserMsg = [...payload.historyLog].reverse().find(msg => msg.role === 'user');
      if (lastUserMsg && lastUserMsg.text) {
        const cleanText = lastUserMsg.text.trim();
        if (cleanText.length > 5 && !['hello', 'hi', 'start', 'next', 'yes', 'no'].includes(cleanText.toLowerCase())) {
          recordSessionObservation(currentPassage, `Chat Observation: ${cleanText}`);
        }
      }
    }
  }

  // Call the production full-stack endpoint with resilient offline fallback
  try {
    const response = await fetch('/api/elder-stephen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      const data = await response.json()
      if (data && data.text) {
        const isSpecific = isSpecificScopedRequest(payload.userAction || payload.user_explanation || payload.passage);
        if (!isSpecific) {
          data.text = ensureElderStephenOutlineCompletion(data.text, payload.passage || payload.base_verse || payload.verse, payload.noteTitle, payload.userAction);
        }
        data.text = formatProperElderSpacing(data.text)
        return data
      }
    }
  } catch (netErr) {
    console.warn("[ElderStephen] Network connection fallback engaged:", netErr)
  }

  // Graceful offline pastoral fallback response (SDA doctrinally aligned)
  const mode = payload.currentMode || 'Explain'
  const name = payload.userName || 'Berean'
  const title = payload.noteTitle || 'the Scriptures'
  const isSpecific = isSpecificScopedRequest(payload.userAction || payload.user_explanation);
  
  if (isSpecific) {
    const userPrompt = (payload.userAction || payload.user_explanation || "").toLowerCase();
    let directAnswer = "";
    if (userPrompt.includes("first line") || userPrompt.includes("first sentence")) {
      directAnswer = `* **First Line Analysis (${title})**: The opening statement anchors our study directly in God's divine revelation. He initiates fellowship with us, speaking through His Word to ground our faith and guide our steps.`;
    } else if (userPrompt.includes("single concept") || userPrompt.includes("concept")) {
      directAnswer = `* **Concept Analysis (${title})**: In Seventh-day Adventist theology, this truth reveals Christ's character of love in the Great Controversy, pointing to His high-priestly ministry and the harmony of God's holy law with His saving grace.`;
    } else {
      directAnswer = `* **Pastoral Answer (${title})**: In God's Word, this truth points us directly to Jesus Christ, rightly dividing the word of truth (*2 Timothy 2:15*) and providing practical spiritual strength for today.`;
    }
    return {
      text: formatProperElderSpacing(directAnswer),
      commentaryMode: 'velocity'
    };
  }

  const resolvedMode: 'prestige' | 'velocity' = payload.commentaryMode === 'velocity' ? 'velocity' : 'prestige'

  if (resolvedMode === 'velocity') {
    return {
      text: formatProperElderSpacing(
`### Biblical Meaning & Context
* In pondering *${title}*, remember that Christ is always our central guide and anchor. As *Psalm 119:105* tells us, “Thy word is a lamp unto my feet, and a light unto my path.”
* When we bring our inquiries to Him with prayerful sincerity, the Holy Spirit brings clarity and lasting peace.

### Document Continuity & Takeaway
* Walk in the light you have received today, and trust His gentle leading as truth unfolds line upon line (*Isaiah 28:10*).`
      ),
      commentaryMode: 'velocity'
    }
  }

  if (mode === 'Recall') {
    return {
      text: formatProperElderSpacing(
`**Active Recall Reflection**

Greetings, Brother ${name}. When committing God's Word to memory, remember:

* **Anchor Text**: *Psalm 119:11* — “Thy word have I hid in mine heart, that I might not sin against thee.”
* **Key Principle**: Active retrieval strengthens mental pathways and shields against spiritual drift.

Take a moment to recall the main themes of *${title}* without consulting your notes, and write out your key takeaway.`
      ),
      commentaryMode: 'prestige'
    }
  } else if (mode === 'Teach It') {
    return {
      text: formatProperElderSpacing(
`**Teaching Framework**

Shalom, Brother ${name}. Preparing to instruct others is a sacred calling:

* **Scripture Foundation**: *2 Timothy 2:2* — “And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also.”
* **Structure**: 1. Context & Background → 2. Central Gospel Truth → 3. Modern Application & Appeal.

Outline your main teaching points for *${title}* in simple, accessible language.`
      ),
      commentaryMode: 'prestige'
    }
  } else if (mode === 'Sabbath School Studies' || mode === 'Syllabus') {
    return {
      text: formatProperElderSpacing(
`**Sabbath School Guidance**

Greetings, ${name}. I am Elder Stephen, here with you to explore today's study on *${title}*.

* **Key Text**: *Revelation 14:12* — “Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.”
* **Focus**: Comparing Scripture with Scripture (*Isaiah 28:10*) to unveil the sanctuary truth and Christ's high-priestly ministry.

What questions or insights do you have on this lesson?`
      ),
      commentaryMode: 'prestige'
    }
  } else {
    return {
      text: formatProperElderSpacing(
`**Scriptural Exegesis & Pastoral Insight**

Dear Brother ${name}, studying *${title}* anchors our faith securely upon Christ the Rock.

* **Hermeneutic Principle**: *Sola Scriptura* — Scripture is its own interpreter (*2 Peter 1:20-21*).
* **Sanctuary Harmony**: Every line of prophetic truth points to Jesus Christ in the heavenly sanctuary.

How do you see this truth applying to your personal spiritual walk today?`
      ),
      commentaryMode: 'prestige'
    }
  }
}

/**
 * Connector handler that receives the STBA Brain AI-produced JSON payload,
 * forwards it directly to callElderStephen, and outputs the final pastoral response.
 */
export async function handleSTBABrainIntegration(
  stbaBrainOutput: Partial<ElderStephenPayload>,
  updateUiCallback: (mentorResponseText: string) => void,
  onErrorCallback?: (errorMessage: string) => void
): Promise<{ text: string } | null> {
  try {
    // 1. Forward the structural payload directly to the server-side API proxy
    const result = await callElderStephen(stbaBrainOutput);

    // 2. Update the visual UI state with the returned mentor response
    if (result && result.text) {
      updateUiCallback(result.text);
      return result;
    }
    
    throw new Error("No text response returned from the mentor study server.");
  } catch (error: any) {
    console.error("STBA Brain Integration hand-off failed:", error);
    if (onErrorCallback) {
      onErrorCallback(error?.message || "Underlying network or parsing issue occurred.");
    }
    return null;
  }
}


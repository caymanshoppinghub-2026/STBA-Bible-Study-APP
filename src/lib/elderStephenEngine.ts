/**
 * STBA Brain & Elder Stephen Discipleship Core Engine
 * Implements mode auto-detection, unified routing, and client-side Memory Engine.
 */

import { callElderStephen, ElderStephenPayload, ChatMessagePayload } from './callElderStephen';

// -------------------------------------------------------------
// 5. Mode Auto-Detection Function
// -------------------------------------------------------------

export type STBAMode = "NOTEBOOK" | "CSMS" | "EXEGESIS" | "RECALL" | "VISUAL_READ" | "DASHBOARD";

/**
 * Automatically detects the current study mode based on userAction or UI state trigger.
 * 
 * @param userAction The specific action string or UI state context identifier.
 * @returns detected mode: "NOTEBOOK" | "CSMS" | "EXEGESIS" | "RECALL" | "VISUAL_READ" | "DASHBOARD"
 */
export function detectSTBAMode(userAction: string): STBAMode {
  const lowerAction = userAction.toLowerCase();

  if (lowerAction.includes("csms") || lowerAction.includes("review") || lowerAction.includes("mastery")) {
    return "CSMS";
  }
  if (lowerAction.includes("exegesis") || lowerAction.includes("observation")) {
    return "EXEGESIS";
  }
  if (lowerAction.includes("recall") || lowerAction.includes("memor")) {
    return "RECALL";
  }
  if (lowerAction.includes("visual") || lowerAction.includes("layout") || lowerAction.includes("presentation")) {
    return "VISUAL_READ";
  }
  if (lowerAction.includes("dashboard") || lowerAction.includes("load") || lowerAction.includes("refresh")) {
    return "DASHBOARD";
  }

  return "NOTEBOOK";
}

/*
 * USAGE EXAMPLE (Mode Auto-Detection):
 *
 * const mode = detectSTBAMode("csms_review"); // returns "CSMS"
 * console.log(`Active Scripture track determined: ${mode}`);
 */


// -------------------------------------------------------------
// 6. Unified Routing Function
// -------------------------------------------------------------

/**
 * Unified router that receives the STBA Brain payload, detects its mode,
 * prepares any final adjustments, forwards to callElderStephen, and logs state.
 * 
 * @param stbaBrainOutput Raw payload produced by the STBA Brain UI/inputs
 * @returns Elder Stephen response payload with textual guidelines or exegesis
 */
export async function routeToElderStephen(
  stbaBrainOutput: Partial<ElderStephenPayload> & { userAction: string }
): Promise<{ text: string; parsedContent?: any }> {
  // Detect current mode using the detection logic
  const detectedMode = detectSTBAMode(stbaBrainOutput.userAction);
  console.log(`[Unified Router] Routed to Elder Stephen under ${detectedMode} Mode pipeline.`);

  // Load current visual memory into the payload before transfer
  const currentMemory = ElderStephenMemoryEngine.getMemory();
  
  const payload: Partial<ElderStephenPayload> = {
    currentMode: stbaBrainOutput.currentMode || 'STBA',
    noteTitle: stbaBrainOutput.noteTitle || 'Study Session',
    noteContent: stbaBrainOutput.noteContent || '',
    contextSummary: stbaBrainOutput.contextSummary || `Active study under: ${detectedMode} mode.`,
    userAction: stbaBrainOutput.userAction as any,
    // Merge memory history log if available
    historyLog: stbaBrainOutput.historyLog || currentMemory.historyLog || [],
    masteryState: stbaBrainOutput.masteryState || currentMemory.masteryState
  };

  const response = await callElderStephen(payload);

  // Safely record response in the persistent Memory Engine
  ElderStephenMemoryEngine.updateMemory({
    historyLog: [
      ...(payload.historyLog || []).slice(-10), // keep last 10 messages for safety
      { role: "user" as const, text: payload.noteContent || "" },
      { role: "elder" as const, text: response.text }
    ],
    masteryState: {
      ...currentMemory.masteryState,
      lastActiveDate: new Date().toISOString().split('T')[0]
    },
    lastRecordedFeedback: response.text
  });

  return response;
}

/*
 * USAGE EXAMPLE (Unified Routing):
 *
 * const result = await routeToElderStephen({
 *   noteTitle: "Sabbath Sanctuary Key Texts",
 *   noteContent: "Observing persistent covenant vectors...",
 *   userAction: "exegesis_observation"
 * });
 * console.log("Elder Stephen Response:", result.text);
 */


// -------------------------------------------------------------
// 7. Elder Stephen Memory Engine (Persistent Core)
// -------------------------------------------------------------

export interface MemoryStructures {
  historyLog: ChatMessagePayload[];
  masteryState: {
    completedVersesCount: number;
    totalVersesCount: number;
    completionRate: number;
    lastActiveDate: string;
    favoriteScriptures: string[];
  };
  lastRecordedFeedback?: string;
  noteSummaries?: Record<string, string>;

  // Session Intel Memory requested in session intelligence specs
  currentPassage?: string;
  currentStepIndex?: number;
  activeRightTab?: string;
  previousObservations?: Record<string, string[]>;
  userStudyPatterns?: {
    totalSessions: number;
    lastConceptStudied?: string;
    timeSpent?: Record<string, number>;
    stuckCount?: number;
    progressSpeed?: number;
    toolUsage?: Record<string, number>;
  };
  greetedOnceForSession?: boolean;
}

const STORAGE_KEY = "stba_elder_stephen_memory_v2";

const defaultSettings: MemoryStructures = {
  historyLog: [],
  masteryState: {
    completedVersesCount: 0,
    totalVersesCount: 28,
    completionRate: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    favoriteScriptures: []
  },
  noteSummaries: {},
  currentPassage: "",
  currentStepIndex: 0,
  activeRightTab: "csms",
  previousObservations: {},
  userStudyPatterns: {
    totalSessions: 1,
    lastConceptStudied: "",
    timeSpent: {},
    stuckCount: 0,
    progressSpeed: 0,
    toolUsage: {}
  },
  greetedOnceForSession: false
};

export const ElderStephenMemoryEngine = {
  /**
   * Retrieves the current accumulated persistent memory structure.
   */
  getMemory(): MemoryStructures {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          masteryState: { ...defaultSettings.masteryState, ...parsed.masteryState },
          userStudyPatterns: { ...defaultSettings.userStudyPatterns, ...parsed.userStudyPatterns },
          previousObservations: { ...defaultSettings.previousObservations, ...parsed.previousObservations }
        };
      }
    } catch (e) {
      console.error("Failed to parse Elder Stephen Memory structures:", e);
    }
    return { ...defaultSettings };
  },

  /**
   * Updates partial memory fields in persistent localStorage storage.
   */
  updateMemory(part: Partial<MemoryStructures>): MemoryStructures {
    const current = this.getMemory();
    const updated: MemoryStructures = {
      ...current,
      ...part,
      masteryState: part.masteryState ? { ...current.masteryState, ...part.masteryState } : current.masteryState,
      noteSummaries: part.noteSummaries ? { ...current.noteSummaries, ...part.noteSummaries } : current.noteSummaries,
      userStudyPatterns: part.userStudyPatterns ? { ...current.userStudyPatterns, ...part.userStudyPatterns } : current.userStudyPatterns,
      previousObservations: part.previousObservations ? { ...current.previousObservations, ...part.previousObservations } : current.previousObservations
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save memory structure update:", e);
    }
    return updated;
  },

  /**
   * Fast helper to sync the active passage, step index, and active tab
   */
  syncSessionContext(passage: string | undefined, stepIndex: number | undefined, activeTab: string | undefined): MemoryStructures {
    const current = this.getMemory();
    const changes: Partial<MemoryStructures> = {};
    if (passage && passage !== current.currentPassage) {
      changes.currentPassage = passage;
    }
    if (stepIndex !== undefined && stepIndex !== current.currentStepIndex) {
      changes.currentStepIndex = stepIndex;
    }
    if (activeTab && activeTab !== current.activeRightTab) {
      changes.activeRightTab = activeTab;
      
      const toolUsage = { ...current.userStudyPatterns?.toolUsage };
      toolUsage[activeTab] = (toolUsage[activeTab] || 0) + 1;
      changes.userStudyPatterns = {
        ...current.userStudyPatterns,
        toolUsage,
        lastConceptStudied: passage || current.currentPassage || ""
      } as any;
    }
    
    if (Object.keys(changes).length > 0) {
      return this.updateMemory(changes);
    }
    return current;
  },

  /**
   * Appends or sets an observation/answer for a specific contextual key (e.g., "Daniel 8:14-step2")
   */
  recordObservation(key: string, observation: string): MemoryStructures {
    const current = this.getMemory();
    const previousObservations = { ...current.previousObservations };
    const list = previousObservations[key] || [];
    if (!list.includes(observation)) {
      previousObservations[key] = [...list, observation];
    }
    return this.updateMemory({ previousObservations });
  },

  /**
   * Sets the greetedOnceForSession flag to true to avoid repetitive greetings
   */
  setGreetedOnce(value: boolean): MemoryStructures {
    return this.updateMemory({ greetedOnceForSession: value });
  },

  /**
   * Increments the stuck indicator if user asks for help or falls silent
   */
  incrementStuckCount(): MemoryStructures {
    const current = this.getMemory();
    const patterns = current.userStudyPatterns ? { ...current.userStudyPatterns } : { ...defaultSettings.userStudyPatterns };
    patterns.stuckCount = (patterns.stuckCount || 0) + 1;
    return this.updateMemory({ userStudyPatterns: patterns as any });
  }
};

/*
 * USAGE EXAMPLE (Memory Engine):
 *
 * // Incorporate new memorized scripture reference
 * ElderStephenMemoryEngine.updateMemory({
 *   masteryState: {
 *     completedVersesCount: 5,
 *     totalVersesCount: 28,
 *     completionRate: 18,
 *     lastActiveDate: "2026-06-15",
 *     favoriteScriptures: ["Revelation 14:12"]
 *   }
 * });
 *
 * // Query active study performance
 * const memory = ElderStephenMemoryEngine.getMemory();
 * console.log(`Current Completion Rate: ${memory.masteryState.completionRate}%`);
 */

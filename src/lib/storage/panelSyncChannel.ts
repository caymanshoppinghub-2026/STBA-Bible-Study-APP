/**
 * Cross-Panel Synchronization Bus
 * 
 * Facilitates near-instantaneous (< 1ms) reactive synchronization between:
 * - ParallelBibleReader (Scripture Text & Translations)
 * - SDABibleCommentary (7-Volume Commentary & EGW notes)
 * - WordStudy (Strong's Greek/Hebrew lexical breakdowns)
 * - CrossReferenceEngine (Thematic & Scriptural Witnesses)
 * - STBANotebook (Floating and permanent study notes)
 * - CSMSActiveRecall (Memory testing and drills)
 * 
 * Uses BroadcastChannel with fallback to CustomEvent for maximum reactivity
 * across panels, panes, and browser tabs.
 */

export type PanelSyncEventType =
  | "VERSE_SELECTED"
  | "PASSAGE_LOADED"
  | "WORD_SELECTED"
  | "TRANSLATION_TOGGLED"
  | "COMMENTARY_SYNC"
  | "TAB_SWITCHED"
  | "NOTE_RECORDED"
  | "EXEGESIS_LOADED"
  | "STORAGE_CACHE_CHANGED";

export interface PanelSyncMessage<T = any> {
  type: PanelSyncEventType;
  payload: T;
  sourcePanel: string;
  timestamp: number;
}

export interface VerseSelectedPayload {
  verseNumber: number;
  reference: string;
  verseText?: Record<string, string>;
  book?: string;
  chapter?: number;
}

export interface PassageLoadedPayload {
  reference: string;
  topic?: string;
  verseCount?: number;
}

export interface WordSelectedPayload {
  word: string;
  reference?: string;
  verseNumber?: number;
}

export interface CommentarySyncPayload {
  book: string;
  chapter: number;
  verse?: number | "all";
  reference: string;
  volumeNumber: number;
}

const CHANNEL_NAME = "stba_panel_sync_bus_v1";

class PanelSyncBus {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Map<PanelSyncEventType, Set<(payload: any, message: PanelSyncMessage) => void>> = new Map();
  private hasBroadcastSupport = typeof window !== "undefined" && "BroadcastChannel" in window;

  constructor() {
    if (this.hasBroadcastSupport) {
      try {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event: MessageEvent<PanelSyncMessage>) => {
          this.dispatchToLocalListeners(event.data);
        };
      } catch (err) {
        console.warn("[PanelSyncBus] BroadcastChannel failed, using window events:", err);
      }
    }

    // In-window event listener fallback and local dispatch
    if (typeof window !== "undefined") {
      window.addEventListener("stba:panel-sync", ((e: CustomEvent<PanelSyncMessage>) => {
        if (e.detail) {
          this.dispatchToLocalListeners(e.detail);
        }
      }) as EventListener);
    }
  }

  private dispatchToLocalListeners(message: PanelSyncMessage) {
    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.payload, message);
        } catch (err) {
          console.error(`[PanelSyncBus] Error in listener for ${message.type}:`, err);
        }
      });
    }
  }

  /**
   * Broadcasts an event to all panels in this window and across browser tabs
   */
  public broadcast<T>(type: PanelSyncEventType, payload: T, sourcePanel: string = "unknown") {
    const message: PanelSyncMessage<T> = {
      type,
      payload,
      sourcePanel,
      timestamp: Date.now()
    };

    // 1. Immediately dispatch to local listeners synchronously (< 1ms)
    this.dispatchToLocalListeners(message);

    // 2. Dispatch through BroadcastChannel to external browser tabs/windows
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {
        console.warn("[PanelSyncBus] BroadcastChannel postMessage error:", e);
      }
    }

    // 3. Dispatch locally through window CustomEvent for external DOM observers
    if (typeof window !== "undefined") {
      try {
        const customEvent = new CustomEvent<PanelSyncMessage>("stba:panel-sync", {
          detail: message
        });
        window.dispatchEvent(customEvent);
      } catch (e) {
        // Non-fatal
      }
    }
  }

  /**
   * Subscribes to a specific panel event type
   */
  public subscribe<T = any>(
    type: PanelSyncEventType,
    handler: (payload: T, message: PanelSyncMessage<T>) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(handler);

    // Return unsubscription callback
    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // ==========================================
  // CONVENIENCE DISPATCHERS
  // ==========================================

  public selectVerse(verseNumber: number, reference: string, source: string = "ParallelBibleReader") {
    this.broadcast<VerseSelectedPayload>("VERSE_SELECTED", {
      verseNumber,
      reference
    }, source);
  }

  public selectWord(word: string, reference?: string, verseNumber?: number, source: string = "ParallelBibleReader") {
    this.broadcast<WordSelectedPayload>("WORD_SELECTED", {
      word,
      reference,
      verseNumber
    }, source);
  }

  public loadPassage(reference: string, topic?: string, source: string = "ParallelBibleReader") {
    this.broadcast<PassageLoadedPayload>("PASSAGE_LOADED", {
      reference,
      topic
    }, source);
  }

  public syncCommentary(reference: string, book: string, chapter: number, volumeNumber: number, verse?: number | "all", source: string = "SDABibleCommentary") {
    this.broadcast<CommentarySyncPayload>("COMMENTARY_SYNC", {
      reference,
      book,
      chapter,
      volumeNumber,
      verse
    }, source);
  }

  public notifyStorageChange(source: string = "StorageManager") {
    this.broadcast("STORAGE_CACHE_CHANGED", { timestamp: Date.now() }, source);
  }
}

export const panelSyncBus = new PanelSyncBus();

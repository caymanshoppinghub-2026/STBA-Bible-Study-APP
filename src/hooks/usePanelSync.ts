import { useEffect, useCallback } from "react";
import { panelSyncBus, PanelSyncEventType, PanelSyncMessage } from "../lib/storage/panelSyncChannel";

/**
 * Custom React hook for listening and dispatching cross-panel sync events
 */
export function usePanelSync() {
  const onSyncEvent = useCallback(
    <T = any>(
      type: PanelSyncEventType,
      callback: (payload: T, message: PanelSyncMessage<T>) => void
    ) => {
      return panelSyncBus.subscribe<T>(type, callback);
    },
    []
  );

  const broadcastVerse = useCallback((verseNumber: number, reference: string, source: string = "component") => {
    panelSyncBus.selectVerse(verseNumber, reference, source);
  }, []);

  const broadcastWord = useCallback((word: string, reference?: string, verseNumber?: number, source: string = "component") => {
    panelSyncBus.selectWord(word, reference, verseNumber, source);
  }, []);

  const broadcastPassage = useCallback((reference: string, topic?: string, source: string = "component") => {
    panelSyncBus.loadPassage(reference, topic, source);
  }, []);

  const broadcastCommentary = useCallback((reference: string, book: string, chapter: number, volumeNumber: number, verse?: number | "all", source: string = "component") => {
    panelSyncBus.syncCommentary(reference, book, chapter, volumeNumber, verse, source);
  }, []);

  return {
    onSyncEvent,
    broadcastVerse,
    broadcastWord,
    broadcastPassage,
    broadcastCommentary,
    bus: panelSyncBus
  };
}

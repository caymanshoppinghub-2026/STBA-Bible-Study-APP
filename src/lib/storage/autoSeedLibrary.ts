/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { stbaStorage } from "./indexedDbClient";
import { panelSyncBus } from "./panelSyncChannel";

const AUTO_SEED_FLAG = "stba_core_library_autoseeded_v1";

/**
 * Automatically pre-seeds the Core Adventist Library (multi-translation Bible verses,
 * parallel chapters, and 7-Volume SDABC entries) into browser IndexedDB silently in
 * the background once per device—zero user clicks required.
 */
export function scheduleAutoSeedCoreLibrary(): void {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  if (localStorage.getItem(AUTO_SEED_FLAG)) return;

  const runSeed = async () => {
    try {
      const [{ PRESET_BIBLES, BIBLE_PRESETS }, { PRELOADED_SDABC_DATA }] = await Promise.all([
        import("../../components/STBA/bibleData"),
        import("../../data/sdabcPreloadedData"),
      ]);

      const result = await stbaStorage.seedInitialTheologicalData(
        PRESET_BIBLES,
        BIBLE_PRESETS,
        PRELOADED_SDABC_DATA
      );

      localStorage.setItem(AUTO_SEED_FLAG, String(Date.now()));
      panelSyncBus.notifyStorageChange("AutoBackgroundSeeder");
      console.log(
        `[STBA Auto-Cache] Silently indexed ${result.seededVerses} verses, ${result.seededPassages} chapters, and ${result.seededCommentaries} SDABC entries into IndexedDB.`
      );
    } catch (err) {
      console.warn("[STBA Auto-Cache] Background pre-seed skipped:", err);
    }
  };

  // Run during browser idle time so initial UI render stays instant
  const ric = (window as any).requestIdleCallback;
  if (typeof ric === "function") {
    ric(() => {
      void runSeed();
    }, { timeout: 3000 });
  } else {
    window.setTimeout(() => {
      void runSeed();
    }, 1500);
  }
}

export function resetAutoSeedFlag(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTO_SEED_FLAG);
  }
}

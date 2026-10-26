/**
 * STBA IndexedDB Client-Side Storage Architecture
 * 
 * Provides high-performance, asynchronous persistent caching for:
 * 1. Scripture texts across multiple translations (KJV, NKJV, ESV, NASB)
 * 2. 7-Volume SDA Bible Commentary (SDABC) chapters, verses, EGW notes, and original language insights
 * 3. Study resources (Word studies, Strong's Greek/Hebrew, Cross-references, Exegesis reports)
 * 4. Inter-panel workspace sync state and cache telemetry
 */

export interface CachedScriptureVerse {
  id: string; // e.g. "kjv:revelation 14:12"
  refNormalized: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  text: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CachedScripturePassage {
  id: string; // e.g. "passage:revelation 14:6-12" or "chapter:hebrews:8"
  reference: string;
  book: string;
  chapter: number;
  verses: any[]; // ParallelVerse[]
  timestamp: number;
  lastAccessed: number;
}

export interface CachedCommentary {
  id: string; // e.g. "sdabc:revelation 14:6-12"
  reference: string;
  volumeNumber: number;
  book: string;
  chapter: number;
  entry: any; // SDABCEntry
  timestamp: number;
  lastAccessed: number;
}

export interface CachedStudyResource {
  id: string; // e.g. "word_study:sanctuary" or "xref:revelation 14:12"
  resourceType: "word_study" | "cross_reference" | "exegesis_report" | "pronunciation" | "topical_track";
  key: string;
  reference?: string;
  payload: any;
  timestamp: number;
  lastAccessed: number;
}

export interface StorageTelemetry {
  id: "telemetry";
  scriptureHits: number;
  commentaryHits: number;
  resourceHits: number;
  serverFetchesPrevented: number;
  totalIndexedItems: number;
  lastSeededAt: number;
}

const DB_NAME = "stba_scripture_mastery_v1";
const DB_VERSION = 1;

// Object store names
export const STORES = {
  VERSES: "scripture_verses",
  PASSAGES: "scripture_passages",
  COMMENTARIES: "commentaries",
  RESOURCES: "study_resources",
  WORKSPACE_SYNC: "workspace_sync",
  TELEMETRY: "storage_telemetry"
} as const;

class STBAIndexedDbClient {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSupported: boolean = typeof window !== "undefined" && "indexedDB" in window;
  private inMemoryFallback: Map<string, Map<string, any>> = new Map();

  constructor() {
    if (!this.isSupported) {
      console.warn("[IndexedDB] indexedDB is not available in this environment. Falling back to in-memory store.");
      this.initMemoryFallback();
    }
  }

  private initMemoryFallback() {
    Object.values(STORES).forEach(store => {
      this.inMemoryFallback.set(store, new Map());
    });
  }

  /**
   * Initializes and opens the IndexedDB database
   */
  public async getDb(): Promise<IDBDatabase> {
    if (!this.isSupported) {
      throw new Error("IndexedDB is not supported");
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Scripture Verses Store
          if (!db.objectStoreNames.contains(STORES.VERSES)) {
            const verseStore = db.createObjectStore(STORES.VERSES, { keyPath: "id" });
            verseStore.createIndex("refNormalized", "refNormalized", { unique: false });
            verseStore.createIndex("version", "version", { unique: false });
            verseStore.createIndex("book", "book", { unique: false });
            verseStore.createIndex("lastAccessed", "lastAccessed", { unique: false });
          }

          // 2. Scripture Passages Store
          if (!db.objectStoreNames.contains(STORES.PASSAGES)) {
            const passageStore = db.createObjectStore(STORES.PASSAGES, { keyPath: "id" });
            passageStore.createIndex("reference", "reference", { unique: false });
            passageStore.createIndex("book", "book", { unique: false });
            passageStore.createIndex("lastAccessed", "lastAccessed", { unique: false });
          }

          // 3. Commentaries Store
          if (!db.objectStoreNames.contains(STORES.COMMENTARIES)) {
            const commStore = db.createObjectStore(STORES.COMMENTARIES, { keyPath: "id" });
            commStore.createIndex("reference", "reference", { unique: false });
            commStore.createIndex("volumeNumber", "volumeNumber", { unique: false });
            commStore.createIndex("book", "book", { unique: false });
            commStore.createIndex("lastAccessed", "lastAccessed", { unique: false });
          }

          // 4. Study Resources Store (Word study, Cross refs, Exegesis reports)
          if (!db.objectStoreNames.contains(STORES.RESOURCES)) {
            const resourceStore = db.createObjectStore(STORES.RESOURCES, { keyPath: "id" });
            resourceStore.createIndex("resourceType", "resourceType", { unique: false });
            resourceStore.createIndex("key", "key", { unique: false });
            resourceStore.createIndex("reference", "reference", { unique: false });
            resourceStore.createIndex("lastAccessed", "lastAccessed", { unique: false });
          }

          // 5. Workspace Inter-Panel Sync Store
          if (!db.objectStoreNames.contains(STORES.WORKSPACE_SYNC)) {
            db.createObjectStore(STORES.WORKSPACE_SYNC, { keyPath: "id" });
          }

          // 6. Storage Telemetry Store
          if (!db.objectStoreNames.contains(STORES.TELEMETRY)) {
            db.createObjectStore(STORES.TELEMETRY, { keyPath: "id" });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (e) => {
          console.error("[IndexedDB] Error opening database:", e);
          reject(request.error);
        };
      } catch (err) {
        console.error("[IndexedDB] Open invocation failed:", err);
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // ==========================================
  // SCRIPTURE TEXT CACHING & RETRIEVAL
  // ==========================================

  /**
   * Normalize scripture key (e.g. "Revelation 14:12" -> "revelation1412")
   */
  public normalizeRefKey(ref: string): string {
    return (ref || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /**
   * Retrieves verse text from IndexedDB
   */
  public async getScriptureVerse(reference: string, version: string = "KJV"): Promise<string | null> {
    const cleanVer = version.toUpperCase().trim();
    const norm = this.normalizeRefKey(reference);
    const key = `${cleanVer}:${norm}`;

    if (!this.isSupported) {
      const item = this.inMemoryFallback.get(STORES.VERSES)?.get(key);
      if (item) {
        this.incrementTelemetry("scriptureHits");
        return item.text;
      }
      return null;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.VERSES, "readwrite");
        const store = tx.objectStore(STORES.VERSES);
        const req = store.get(key);

        req.onsuccess = () => {
          const result = req.result as CachedScriptureVerse | undefined;
          if (result && result.text) {
            // Update LRU & access count asynchronously
            result.lastAccessed = Date.now();
            result.accessCount = (result.accessCount || 0) + 1;
            store.put(result);
            this.incrementTelemetry("scriptureHits");
            resolve(result.text);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          resolve(null);
        };
      });
    } catch (e) {
      console.warn("[IndexedDB] getScriptureVerse error:", e);
      return null;
    }
  }

  /**
   * Stores verse text into IndexedDB
   */
  public async saveScriptureVerse(reference: string, version: string, text: string, book: string = "", chapter: number = 1, verse: number = 1): Promise<void> {
    const cleanVer = version.toUpperCase().trim();
    const norm = this.normalizeRefKey(reference);
    const id = `${cleanVer}:${norm}`;

    const record: CachedScriptureVerse = {
      id,
      refNormalized: norm,
      book,
      chapter,
      verse,
      version: cleanVer,
      text,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    if (!this.isSupported) {
      this.inMemoryFallback.get(STORES.VERSES)?.set(id, record);
      return;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.VERSES, "readwrite");
        const store = tx.objectStore(STORES.VERSES);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("[IndexedDB] saveScriptureVerse failed:", e);
    }
  }

  /**
   * Retrieves parallel multi-translation passage from IndexedDB
   */
  public async getPassage(reference: string): Promise<any[] | null> {
    const norm = this.normalizeRefKey(reference);
    const id = `passage:${norm}`;

    if (!this.isSupported) {
      const item = this.inMemoryFallback.get(STORES.PASSAGES)?.get(id);
      if (item) {
        this.incrementTelemetry("scriptureHits");
        return item.verses;
      }
      return null;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.PASSAGES, "readwrite");
        const store = tx.objectStore(STORES.PASSAGES);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result as CachedScripturePassage | undefined;
          if (result && Array.isArray(result.verses) && result.verses.length > 0) {
            result.lastAccessed = Date.now();
            store.put(result);
            this.incrementTelemetry("scriptureHits");
            resolve(result.verses);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("[IndexedDB] getPassage error:", e);
      return null;
    }
  }

  /**
   * Saves parallel multi-translation passage into IndexedDB
   */
  public async savePassage(reference: string, verses: any[], book: string = "", chapter: number = 1): Promise<void> {
    const norm = this.normalizeRefKey(reference);
    const id = `passage:${norm}`;

    const record: CachedScripturePassage = {
      id,
      reference,
      book,
      chapter,
      verses,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };

    if (!this.isSupported) {
      this.inMemoryFallback.get(STORES.PASSAGES)?.set(id, record);
      return;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PASSAGES, "readwrite");
        const store = tx.objectStore(STORES.PASSAGES);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("[IndexedDB] savePassage failed:", e);
    }
  }

  // ==========================================
  // SDABC COMMENTARY CACHING & RETRIEVAL
  // ==========================================

  /**
   * Retrieves SDA Bible Commentary entry from IndexedDB
   */
  public async getCommentary(reference: string): Promise<any | null> {
    const norm = this.normalizeRefKey(reference);
    const id = `sdabc:${norm}`;

    if (!this.isSupported) {
      const item = this.inMemoryFallback.get(STORES.COMMENTARIES)?.get(id);
      if (item) {
        this.incrementTelemetry("commentaryHits");
        return item.entry;
      }
      return null;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.COMMENTARIES, "readwrite");
        const store = tx.objectStore(STORES.COMMENTARIES);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result as CachedCommentary | undefined;
          if (result && result.entry) {
            result.lastAccessed = Date.now();
            store.put(result);
            this.incrementTelemetry("commentaryHits");
            resolve(result.entry);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("[IndexedDB] getCommentary error:", e);
      return null;
    }
  }

  /**
   * Saves SDABC Commentary entry to IndexedDB
   */
  public async saveCommentary(reference: string, entry: any, volumeNumber: number = 7, book: string = "", chapter: number = 1): Promise<void> {
    const norm = this.normalizeRefKey(reference);
    const id = `sdabc:${norm}`;

    const record: CachedCommentary = {
      id,
      reference,
      volumeNumber: entry.volumeNumber || volumeNumber,
      book,
      chapter,
      entry,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };

    if (!this.isSupported) {
      this.inMemoryFallback.get(STORES.COMMENTARIES)?.set(id, record);
      return;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.COMMENTARIES, "readwrite");
        const store = tx.objectStore(STORES.COMMENTARIES);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("[IndexedDB] saveCommentary failed:", e);
    }
  }

  // ==========================================
  // STUDY RESOURCES (WORD STUDY, XREF, EXEGESIS)
  // ==========================================

  /**
   * Retrieves study resource (word study lexical audit, cross refs, exegesis)
   */
  public async getStudyResource(type: CachedStudyResource["resourceType"], key: string): Promise<any | null> {
    const norm = (key || "").toLowerCase().trim();
    const id = `${type}:${norm}`;

    if (!this.isSupported) {
      const item = this.inMemoryFallback.get(STORES.RESOURCES)?.get(id);
      if (item) {
        this.incrementTelemetry("resourceHits");
        return item.payload;
      }
      return null;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.RESOURCES, "readwrite");
        const store = tx.objectStore(STORES.RESOURCES);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result as CachedStudyResource | undefined;
          if (result && result.payload) {
            result.lastAccessed = Date.now();
            store.put(result);
            this.incrementTelemetry("resourceHits");
            resolve(result.payload);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("[IndexedDB] getStudyResource error:", e);
      return null;
    }
  }

  /**
   * Saves study resource to IndexedDB
   */
  public async saveStudyResource(type: CachedStudyResource["resourceType"], key: string, payload: any, reference?: string): Promise<void> {
    const norm = (key || "").toLowerCase().trim();
    const id = `${type}:${norm}`;

    const record: CachedStudyResource = {
      id,
      resourceType: type,
      key: norm,
      reference,
      payload,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };

    if (!this.isSupported) {
      this.inMemoryFallback.get(STORES.RESOURCES)?.set(id, record);
      return;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.RESOURCES, "readwrite");
        const store = tx.objectStore(STORES.RESOURCES);
        const req = store.put(record);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn("[IndexedDB] saveStudyResource failed:", e);
    }
  }

  // ==========================================
  // WORKSPACE SYNC STATE
  // ==========================================

  public async getWorkspaceSyncState(): Promise<any | null> {
    const id = "current_workspace";
    if (!this.isSupported) {
      return this.inMemoryFallback.get(STORES.WORKSPACE_SYNC)?.get(id) || null;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.WORKSPACE_SYNC, "readonly");
        const store = tx.objectStore(STORES.WORKSPACE_SYNC);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  public async saveWorkspaceSyncState(state: any): Promise<void> {
    const id = "current_workspace";
    const record = { id, data: state, updatedAt: Date.now() };

    if (!this.isSupported) {
      this.inMemoryFallback.get(STORES.WORKSPACE_SYNC)?.set(id, record);
      return;
    }

    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.WORKSPACE_SYNC, "readwrite");
        const store = tx.objectStore(STORES.WORKSPACE_SYNC);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // Non-fatal
    }
  }

  // ==========================================
  // TELEMETRY & STORAGE STATS
  // ==========================================

  public async incrementTelemetry(field: "scriptureHits" | "commentaryHits" | "resourceHits" | "serverFetchesPrevented"): Promise<void> {
    if (!this.isSupported) return;

    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.TELEMETRY, "readwrite");
      const store = tx.objectStore(STORES.TELEMETRY);
      const req = store.get("telemetry");

      req.onsuccess = () => {
        const cur: StorageTelemetry = req.result || {
          id: "telemetry",
          scriptureHits: 0,
          commentaryHits: 0,
          resourceHits: 0,
          serverFetchesPrevented: 0,
          totalIndexedItems: 0,
          lastSeededAt: 0
        };

        cur[field] = (cur[field] || 0) + 1;
        if (field === "scriptureHits" || field === "commentaryHits" || field === "resourceHits") {
          cur.serverFetchesPrevented = (cur.serverFetchesPrevented || 0) + 1;
        }

        store.put(cur);
      };
    } catch (e) {
      // Ignore telemetry errors
    }
  }

  public async getStorageStats(): Promise<{
    isSupported: boolean;
    versesCount: number;
    passagesCount: number;
    commentariesCount: number;
    resourcesCount: number;
    totalEntries: number;
    scriptureHits: number;
    commentaryHits: number;
    resourceHits: number;
    serverFetchesPrevented: number;
    estimatedStorageQuotaBytes?: number;
    estimatedStorageUsageBytes?: number;
  }> {
    if (!this.isSupported) {
      return {
        isSupported: false,
        versesCount: this.inMemoryFallback.get(STORES.VERSES)?.size || 0,
        passagesCount: this.inMemoryFallback.get(STORES.PASSAGES)?.size || 0,
        commentariesCount: this.inMemoryFallback.get(STORES.COMMENTARIES)?.size || 0,
        resourcesCount: this.inMemoryFallback.get(STORES.RESOURCES)?.size || 0,
        totalEntries: 0,
        scriptureHits: 0,
        commentaryHits: 0,
        resourceHits: 0,
        serverFetchesPrevented: 0
      };
    }

    try {
      const db = await this.getDb();

      const getCount = (storeName: string): Promise<number> => {
        return new Promise((resolve) => {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const req = store.count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => resolve(0);
        });
      };

      const [vCount, pCount, cCount, rCount] = await Promise.all([
        getCount(STORES.VERSES),
        getCount(STORES.PASSAGES),
        getCount(STORES.COMMENTARIES),
        getCount(STORES.RESOURCES)
      ]);

      let telemetry: StorageTelemetry = {
        id: "telemetry",
        scriptureHits: 0,
        commentaryHits: 0,
        resourceHits: 0,
        serverFetchesPrevented: 0,
        totalIndexedItems: vCount + pCount + cCount + rCount,
        lastSeededAt: 0
      };

      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORES.TELEMETRY, "readonly");
        const store = tx.objectStore(STORES.TELEMETRY);
        const req = store.get("telemetry");
        req.onsuccess = () => {
          if (req.result) telemetry = req.result;
          resolve();
        };
        req.onerror = () => resolve();
      });

      let quota: number | undefined;
      let usage: number | undefined;
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          quota = estimate.quota;
          usage = estimate.usage;
        } catch (e) {
          // ignore
        }
      }

      return {
        isSupported: true,
        versesCount: vCount,
        passagesCount: pCount,
        commentariesCount: cCount,
        resourcesCount: rCount,
        totalEntries: vCount + pCount + cCount + rCount,
        scriptureHits: telemetry.scriptureHits || 0,
        commentaryHits: telemetry.commentaryHits || 0,
        resourceHits: telemetry.resourceHits || 0,
        serverFetchesPrevented: telemetry.serverFetchesPrevented || 0,
        estimatedStorageQuotaBytes: quota,
        estimatedStorageUsageBytes: usage
      };
    } catch (e) {
      console.warn("[IndexedDB] Error fetching storage stats:", e);
      return {
        isSupported: true,
        versesCount: 0,
        passagesCount: 0,
        commentariesCount: 0,
        resourcesCount: 0,
        totalEntries: 0,
        scriptureHits: 0,
        commentaryHits: 0,
        resourceHits: 0,
        serverFetchesPrevented: 0
      };
    }
  }

  /**
   * Purges all stores in IndexedDB (for cache reset or data refresh)
   */
  public async clearAllStores(): Promise<void> {
    if (!this.isSupported) {
      this.initMemoryFallback();
      return;
    }

    try {
      const db = await this.getDb();
      const storeNames = [STORES.VERSES, STORES.PASSAGES, STORES.COMMENTARIES, STORES.RESOURCES, STORES.WORKSPACE_SYNC];
      const tx = db.transaction(storeNames, "readwrite");
      storeNames.forEach((s) => tx.objectStore(s).clear());

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn("[IndexedDB] Clear stores error:", e);
    }
  }

  /**
   * Pre-seeds core theological anchors and foundational Adventism texts into IndexedDB
   */
  public async seedInitialTheologicalData(
    presetsBibles: Record<string, any[]>,
    biblePresets: Record<string, Record<string, string>>,
    sdabcPreloaded: Record<string, any>
  ): Promise<{ seededVerses: number; seededPassages: number; seededCommentaries: number }> {
    let seededVerses = 0;
    let seededPassages = 0;
    let seededCommentaries = 0;

    // 1. Seed Passages
    for (const [ref, verses] of Object.entries(presetsBibles)) {
      if (Array.isArray(verses) && verses.length > 0) {
        await this.savePassage(ref, verses);
        seededPassages++;

        // Also seed individual verses across translations
        for (const v of verses) {
          if (v.text) {
            for (const [ver, txt] of Object.entries(v.text)) {
              if (typeof txt === "string") {
                await this.saveScriptureVerse(`${ref}:${v.verseNumber}`, ver, txt);
                seededVerses++;
              }
            }
          }
        }
      }
    }

    // 2. Seed Individual Verses from BIBLE_PRESETS
    for (const [refKey, versionsMap] of Object.entries(biblePresets)) {
      for (const [ver, txt] of Object.entries(versionsMap)) {
        if (typeof txt === "string") {
          await this.saveScriptureVerse(refKey, ver, txt);
          seededVerses++;
        }
      }
    }

    // 3. Seed SDABC Commentaries
    for (const [refKey, entry] of Object.entries(sdabcPreloaded)) {
      if (entry && entry.reference) {
        await this.saveCommentary(refKey, entry, entry.volumeNumber || 7);
        seededCommentaries++;
      }
    }

    // Mark telemetry
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.TELEMETRY, "readwrite");
      const store = tx.objectStore(STORES.TELEMETRY);
      store.put({
        id: "telemetry",
        scriptureHits: 0,
        commentaryHits: 0,
        resourceHits: 0,
        serverFetchesPrevented: 0,
        totalIndexedItems: seededVerses + seededPassages + seededCommentaries,
        lastSeededAt: Date.now()
      });
    } catch (e) {
      // non-fatal
    }

    return { seededVerses, seededPassages, seededCommentaries };
  }
}

// Export singleton instance
export const stbaStorage = new STBAIndexedDbClient();

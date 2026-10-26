import React, { useState, useEffect } from "react";
import { 
  Database, HardDrive, RefreshCw, Trash2, CheckCircle2, 
  Zap, Activity, ShieldCheck, DownloadCloud, X, Layers, BookOpen, FileText, AlertCircle
} from "lucide-react";
import { stbaStorage } from "../../lib/storage/indexedDbClient";
import { panelSyncBus } from "../../lib/storage/panelSyncChannel";
import { PRESET_BIBLES } from "./bibleData";
import { BIBLE_PRESETS } from "../../services/bibleService";
import { PRELOADED_SDABC_DATA } from "./SDABibleCommentary";

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export const StorageManagerModal: React.FC<StorageManagerModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  const [stats, setStats] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [recentSyncEvents, setRecentSyncEvents] = useState<any[]>([]);

  const loadStats = async () => {
    try {
      const data = await stbaStorage.getStorageStats();
      setStats(data);
    } catch (e) {
      console.warn("Failed loading storage stats:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
      setSeedResult(null);
    }
  }, [isOpen]);

  // Track live sync events in modal
  useEffect(() => {
    const unsubVerse = panelSyncBus.subscribe("VERSE_SELECTED", (payload, msg) => {
      setRecentSyncEvents((prev) => [msg, ...prev].slice(0, 5));
    });
    const unsubPassage = panelSyncBus.subscribe("PASSAGE_LOADED", (payload, msg) => {
      setRecentSyncEvents((prev) => [msg, ...prev].slice(0, 5));
    });
    const unsubWord = panelSyncBus.subscribe("WORD_SELECTED", (payload, msg) => {
      setRecentSyncEvents((prev) => [msg, ...prev].slice(0, 5));
    });

    return () => {
      unsubVerse();
      unsubPassage();
      unsubWord();
    };
  }, []);

  const handlePreseed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const result = await stbaStorage.seedInitialTheologicalData(
        PRESET_BIBLES,
        BIBLE_PRESETS,
        PRELOADED_SDABC_DATA
      );
      setSeedResult(
        `Pre-seeded ${result.seededVerses} multi-translation verses, ${result.seededPassages} parallel chapters, and ${result.seededCommentaries} SDABC entries into IndexedDB.`
      );
      await loadStats();
      panelSyncBus.notifyStorageChange("StorageManagerModal");
    } catch (err: any) {
      setSeedResult("Pre-seeding encountered an error: " + (err?.message || "Unknown"));
    } finally {
      setSeeding(false);
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm("Purge local IndexedDB cache? Local verses, commentaries, and resources will be re-fetched as needed.")) {
      return;
    }
    setClearing(true);
    try {
      await stbaStorage.clearAllStores();
      await loadStats();
      setSeedResult("All IndexedDB stores cleared successfully.");
      panelSyncBus.notifyStorageChange("StorageManagerModal");
    } catch (e) {
      setSeedResult("Clear cache failed.");
    } finally {
      setClearing(false);
    }
  };

  if (!isOpen) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark 
            ? "bg-[#161D26] border-white/10 text-stone-200" 
            : "bg-white border-stone-200 text-stone-800"
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isDark ? "border-white/10 bg-[#121820]" : "border-stone-100 bg-stone-50/80"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-800"}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold font-serif tracking-wide">
                STBA Client Storage & Panel Synchronization Engine
              </h2>
              <p className="text-xs opacity-60">
                IndexedDB Local Repository • Zero-Latency Panel Coordination • Server Load Shield
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? "hover:bg-white/10 text-stone-400" : "hover:bg-stone-200 text-stone-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Health Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            stats?.isSupported
              ? isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              : isDark ? "bg-amber-950/20 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"
          }`}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">
                  IndexedDB Storage Status: {stats?.isSupported ? "Active & Healthy" : "In-Memory Mode"}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  Sub-2ms local queries enabled across Scripture, SDABC Commentaries, and Lexicon.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Near-Instant Sync
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-stone-50 border-stone-200"}`}>
              <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                <span>Verses Cached</span>
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {stats?.versesCount ?? "..."}
              </div>
              <div className="text-[10px] opacity-50 mt-1">Multi-translations</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-stone-50 border-stone-200"}`}>
              <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                <span>SDABC Entries</span>
                <Layers className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {stats?.commentariesCount ?? "..."}
              </div>
              <div className="text-[10px] opacity-50 mt-1">Volumes 1–7</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-stone-50 border-stone-200"}`}>
              <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                <span>Study Resources</span>
                <FileText className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-bold font-mono">
                {stats?.resourcesCount ?? "..."}
              </div>
              <div className="text-[10px] opacity-50 mt-1">Lexicons & Exegesis</div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDark ? "bg-white/5 border-white/5" : "bg-stone-50 border-stone-200"}`}>
              <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                <span>Server Shield</span>
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {stats?.serverFetchesPrevented ?? "..."}
              </div>
              <div className="text-[10px] opacity-50 mt-1">Network calls saved</div>
            </div>
          </div>

          {/* Storage Quota Bar */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? "bg-white/5 border-white/5" : "bg-stone-50 border-stone-200"}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                Browser Storage Quota Allocation
              </span>
              <span className="font-mono text-[11px] opacity-70">
                {formatBytes(stats?.estimatedStorageUsageBytes)} used / {formatBytes(stats?.estimatedStorageQuotaBytes)} total
              </span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(
                    100, 
                    Math.max(
                      1, 
                      ((stats?.estimatedStorageUsageBytes || 1024) / (stats?.estimatedStorageQuotaBytes || (50 * 1024 * 1024))) * 100
                    )
                  )}%` 
                }}
              />
            </div>
            <p className="text-[11px] opacity-60">
              Unlike the strict ~5MB quota of localStorage, IndexedDB supports high-capacity storage for full Bible books, commentaries, and multi-translation corpora without UI frame drops.
            </p>
          </div>

          {/* Pre-seed & Management Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60">
              Storage Optimization & Offline Pre-seeding
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePreseed}
                disabled={seeding}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isDark
                    ? "bg-amber-600 hover:bg-amber-500 text-stone-900 shadow-lg shadow-amber-600/20"
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/10"
                } disabled:opacity-50`}
              >
                {seeding ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <DownloadCloud className="w-4 h-4" />
                )}
                {seeding ? "Indexing Theological Library..." : "Pre-Seed Core Adventist Library"}
              </button>

              <button
                onClick={handleClearCache}
                disabled={clearing}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all border ${
                  isDark
                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                    : "border-red-200 text-red-600 hover:bg-red-50"
                } disabled:opacity-50`}
              >
                <Trash2 className="w-4 h-4" />
                Purge Local Cache
              </button>
            </div>

            {seedResult && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                seedResult.includes("error") || seedResult.includes("failed")
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{seedResult}</span>
              </div>
            )}
          </div>

          {/* Real-time Cross-Panel Sync Activity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider opacity-60">
                Recent Cross-Panel Sync Events
              </span>
              <span className="text-[10px] opacity-50 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-500" /> Live Event Bus
              </span>
            </div>

            {recentSyncEvents.length === 0 ? (
              <div className={`p-3 rounded-xl border text-center text-xs opacity-50 ${
                isDark ? "border-white/5 bg-white/5" : "border-stone-100 bg-stone-50"
              }`}>
                Click verses or words in the Parallel Bible Reader to observe sub-millisecond panel synchronization.
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentSyncEvents.map((evt, idx) => (
                  <div 
                    key={idx}
                    className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between ${
                      isDark ? "bg-white/5 border-white/5 font-mono" : "bg-stone-50 border-stone-200 font-mono"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-500">{evt.type}</span>
                      <span className="opacity-70 truncate max-w-[260px]">
                        {JSON.stringify(evt.payload)}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-40 shrink-0">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between ${
          isDark ? "border-white/10 bg-[#121820]" : "border-stone-100 bg-stone-50"
        }`}>
          <div className="text-[11px] opacity-50 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            STBA Storage Engine v1.0 • Offline Ready
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark ? "bg-white/10 hover:bg-white/20 text-stone-200" : "bg-stone-200 hover:bg-stone-300 text-stone-800"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Tag,
  Hash,
  Layers,
  Sparkles,
  Filter,
  Plus,
  X,
  Edit3,
  BookOpen,
  Award,
  Zap,
  Check,
  Search,
  ChevronRight,
  Shield,
  Eye,
  RefreshCw
} from "lucide-react";
import {
  DOCTRINAL_THEMES,
  DOCTRINE_CATEGORIES,
  POPULAR_TAG_SUGGESTIONS,
  getThemeColor,
  inferVerseThemeAndDoctrine,
  DoctrinalTheme,
  DoctrineCategory
} from "../data/verseThemes";
import { MasteredScripture, VerseProficiency } from "./MemoryVault";

interface VerseMapProps {
  verses: MasteredScripture[];
  onUpdateVerse: (updatedVerse: MasteredScripture) => void;
  onSelectVerse: (verse: MasteredScripture) => void;
  onLaunchRecallPractice?: (verse: MasteredScripture) => void;
  getVerseProficiency: (verse: MasteredScripture) => VerseProficiency;
  sabbathMode?: boolean;
}

type CloudDimension = "theme" | "doctrine" | "tags";

export const VerseMap: React.FC<VerseMapProps> = ({
  verses,
  onUpdateVerse,
  onSelectVerse,
  onLaunchRecallPractice,
  getVerseProficiency,
  sabbathMode = false
}) => {
  // Dimension mode: group by Theme, Core Doctrine, or granular Tags
  const [dimension, setDimension] = useState<CloudDimension>("theme");
  
  // Selected tag/cluster in the cloud (null = show all)
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Search filter for cloud tags
  const [cloudSearch, setCloudSearch] = useState<string>("");

  // Categorization modal state
  const [editingVerse, setEditingVerse] = useState<MasteredScripture | null>(null);
  const [editTheme, setEditTheme] = useState<string>("");
  const [editCategory, setEditCategory] = useState<DoctrineCategory>("Pillars of Faith");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Normalize all verses to ensure theme, doctrineCategory, and tags are populated
  const normalizedVerses = useMemo(() => {
    return verses.map((v) => {
      const inferred = inferVerseThemeAndDoctrine(v);
      return {
        ...v,
        theme: v.theme || inferred.theme,
        doctrineCategory: v.doctrineCategory || inferred.doctrineCategory,
        tags: v.tags && v.tags.length > 0 ? v.tags : inferred.tags
      };
    });
  }, [verses]);

  // Compute tag frequencies depending on selected dimension
  const cloudItems = useMemo(() => {
    const counts: Record<string, { count: number; themeId?: string; category?: string }> = {};

    normalizedVerses.forEach((verse) => {
      if (dimension === "theme") {
        const key = verse.theme || "Discipleship & Diligence";
        if (!counts[key]) {
          counts[key] = { count: 0, themeId: key, category: verse.doctrineCategory };
        }
        counts[key].count += 1;
      } else if (dimension === "doctrine") {
        const key = verse.doctrineCategory || "Pillars of Faith";
        if (!counts[key]) {
          counts[key] = { count: 0, category: key };
        }
        counts[key].count += 1;
      } else {
        // Granular tags
        const allTags = verse.tags || [];
        allTags.forEach((t) => {
          const cleanTag = t.trim();
          if (!cleanTag) return;
          if (!counts[cleanTag]) {
            counts[cleanTag] = { count: 0, themeId: verse.theme, category: verse.doctrineCategory };
          }
          counts[cleanTag].count += 1;
        });
      }
    });

    // Convert to sorted array
    let items = Object.entries(counts).map(([name, data]) => ({
      name,
      count: data.count,
      themeId: data.themeId,
      category: data.category
    }));

    if (cloudSearch.trim()) {
      const q = cloudSearch.toLowerCase().trim();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    // Sort descending by count, then alphabetically
    return items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [normalizedVerses, dimension, cloudSearch]);

  // Max count for proportional sizing
  const maxCount = useMemo(() => {
    return cloudItems.reduce((max, item) => Math.max(max, item.count), 1);
  }, [cloudItems]);

  // Filtered verses based on selected cloud item
  const filteredVerses = useMemo(() => {
    if (!selectedTag) return normalizedVerses;

    return normalizedVerses.filter((v) => {
      if (dimension === "theme") {
        return (v.theme || "").toLowerCase() === selectedTag.toLowerCase();
      }
      if (dimension === "doctrine") {
        return (v.doctrineCategory || "").toLowerCase() === selectedTag.toLowerCase();
      }
      // Tags
      const tagsLower = (v.tags || []).map((t) => t.toLowerCase());
      return tagsLower.includes(selectedTag.toLowerCase());
    });
  }, [normalizedVerses, selectedTag, dimension]);

  // Group verses by theme when no single tag is selected (for holistic visual map)
  const groupedClusters = useMemo(() => {
    const map = new Map<string, typeof normalizedVerses>();
    normalizedVerses.forEach((v) => {
      const key = dimension === "doctrine" ? (v.doctrineCategory || "Pillars of Faith") : (v.theme || "Discipleship & Diligence");
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(v);
    });
    return Array.from(map.entries()).map(([clusterName, clusterVerses]) => ({
      name: clusterName,
      verses: clusterVerses
    }));
  }, [normalizedVerses, dimension]);

  // Open modal to categorize a verse
  const handleOpenCategorize = (verse: MasteredScripture, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const inferred = inferVerseThemeAndDoctrine(verse);
    setEditingVerse(verse);
    setEditTheme(verse.theme || inferred.theme);
    setEditCategory((verse.doctrineCategory as DoctrineCategory) || (inferred.doctrineCategory as DoctrineCategory) || "Pillars of Faith");
    setEditTags(verse.tags && verse.tags.length > 0 ? [...verse.tags] : [...inferred.tags]);
    setNewTagInput("");
    setSaveSuccessMsg(null);
  };

  // Add tag in edit modal
  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || newTagInput;
    const clean = raw.trim().replace(/^#/, "");
    if (!clean) return;
    if (!editTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setEditTags([...editTags, clean]);
    }
    setNewTagInput("");
  };

  // Remove tag in edit modal
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((t) => t !== tagToRemove));
  };

  // Save categorization changes
  const handleSaveCategorization = () => {
    if (!editingVerse) return;

    const updated: MasteredScripture = {
      ...editingVerse,
      theme: editTheme.trim() || "Discipleship & Diligence",
      doctrineCategory: editCategory,
      tags: editTags
    };

    onUpdateVerse(updated);
    setSaveSuccessMsg("Categorization updated successfully!");
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setEditingVerse(null);
    }, 900);
  };

  return (
    <div id="verse-map-container" className="space-y-8 text-left">
      {/* 1. TOP HEADER & MAP EXPLANATION */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]" : "bg-gradient-to-br from-[#06162c] via-[#091b35] to-[#040e1c] border-[#DFC57B]/50 shadow-xl text-white"
        }`}
        id="verse-map-banner"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#F3CF65]/15 border border-[#F3CF65]/30 rounded-lg text-[#F3CF65]">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-[11px] uppercase font-mono tracking-widest text-[#F3CF65] font-bold">
                Doctrinal Topology & Scripture Cloud
              </span>
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl tracking-tight text-white drop-shadow-sm">
              Visual Verse Map
            </h2>
            <p className="text-xs sm:text-sm text-stone-300/90 font-sans leading-relaxed">
              Explore your memorized verses through an interconnected tag cloud. Filter by Adventist themes,
              pillars of faith, or custom memory anchors to discover scriptural cohesion.
            </p>
          </div>

          {/* Cloud Dimension Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-[#040e1c]/80 p-1.5 rounded-2xl border border-[#DFC57B]/30 shrink-0">
            <span className="text-[10px] uppercase font-mono text-stone-400 font-bold px-2.5 hidden lg:inline">
              Dimension:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setDimension("theme");
                  setSelectedTag(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dimension === "theme"
                    ? "bg-[#C9973A] text-white shadow-md"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
                id="dimension-theme-btn"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>By Theme</span>
              </button>

              <button
                onClick={() => {
                  setDimension("doctrine");
                  setSelectedTag(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dimension === "doctrine"
                    ? "bg-[#C9973A] text-white shadow-md"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
                id="dimension-doctrine-btn"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>By Doctrine</span>
              </button>

              <button
                onClick={() => {
                  setDimension("tags");
                  setSelectedTag(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dimension === "tags"
                    ? "bg-[#C9973A] text-white shadow-md"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
                id="dimension-tags-btn"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>By Tags</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Stats Sub-bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-stone-300 font-mono text-[11px]">
            <span>Total Verses: <strong className="text-white font-bold">{normalizedVerses.length}</strong></span>
            <span>•</span>
            <span>Cloud Tags: <strong className="text-[#F3CF65] font-bold">{cloudItems.length}</strong></span>
            {selectedTag && (
              <>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Filtered: {filteredVerses.length} verse{filteredVerses.length === 1 ? "" : "s"}</span>
              </>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cloud tags..."
              value={cloudSearch}
              onChange={(e) => setCloudSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white/10 border border-white/15 text-white placeholder-stone-400 outline-none focus:border-[#F3CF65] transition-all"
            />
            {cloudSearch && (
              <button
                onClick={() => setCloudSearch("")}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC TAG CLOUD VISUALIZATION CANVAS */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border text-center relative overflow-hidden ${
          sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]" : "bg-white border-[#E8E4DA] shadow-sm"
        }`}
        id="tag-cloud-canvas"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C9973A]" />
            <span className="font-serif font-bold text-sm text-[#1C2333]">
              {dimension === "theme" ? "Theme Cloud" : dimension === "doctrine" ? "Doctrinal Pillars Cloud" : "Keyword & Tag Cloud"}
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              (Click any tag to focus scriptures)
            </span>
          </div>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              id="clear-tag-filter-btn"
            >
              <X className="w-3 h-3" />
              <span>Show All Verses</span>
            </button>
          )}
        </div>

        {/* Cloud Tags Area */}
        {cloudItems.length === 0 ? (
          <div className="py-12 text-center text-stone-400 font-sans text-xs">
            No tags found matching "{cloudSearch}".
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-4 px-2">
            {cloudItems.map((item) => {
              const isSelected = selectedTag?.toLowerCase() === item.name.toLowerCase();
              const weightRatio = item.count / maxCount;
              const color = getThemeColor(item.themeId || item.name);

              // Proportional typography sizing based on frequency
              let sizeClass = "text-xs px-3.5 py-2";
              if (item.count >= 4) {
                sizeClass = "text-base px-5 py-3 font-extrabold";
              } else if (item.count >= 2) {
                sizeClass = "text-sm px-4 py-2.5 font-bold";
              }

              return (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    setSelectedTag(isSelected ? null : item.name);
                  }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className={`rounded-2xl border transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-2xs ${sizeClass} ${
                    isSelected
                      ? "bg-[#06162c] text-[#F3CF65] border-[#F3CF65] ring-2 ring-[#F3CF65]/40 shadow-md scale-105"
                      : `${color.chipBg} hover:border-[#C9973A] hover:shadow-sm`
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 16px ${color.glow}` : undefined
                  }}
                  title={`${item.count} verse${item.count === 1 ? "" : "s"} associated with "${item.name}"`}
                >
                  <span className="font-sans tracking-wide">
                    {dimension === "tags" && "#"}
                    {item.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isSelected
                        ? "bg-[#F3CF65] text-[#06162c]"
                        : "bg-black/10 text-stone-700"
                    }`}
                  >
                    {item.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Selected tag status ribbon */}
        {selectedTag && (
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-sans">
              Currently filtering: <strong className="text-[#C9973A] font-bold">"{selectedTag}"</strong> ({filteredVerses.length} scripture{filteredVerses.length === 1 ? "" : "s"})
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[#C9973A] font-bold hover:underline cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {/* 3. SCRIPTURE MAP DISPLAY (FILTERED VIEW OR CLUSTERED VIEW) */}
      <div className="space-y-6" id="verse-map-scriptures">
        {selectedTag ? (
          /* A. FILTERED SCRIPTURES CONNECTED TO SELECTED TAG */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9973A]" />
                <h3 className="font-serif font-extrabold text-lg text-[#1C2333]">
                  Verses in "{selectedTag}"
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#C9973A]/10 text-[#C9973A] font-bold">
                  {filteredVerses.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-xs text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
              >
                Back to All Clusters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredVerses.map((verse) => (
                <VerseNodeCard
                  key={verse.id}
                  verse={verse}
                  prof={getVerseProficiency(verse)}
                  onSelectVerse={() => onSelectVerse(verse)}
                  onCategorize={(e) => handleOpenCategorize(verse, e)}
                  onLaunchPractice={() => onLaunchRecallPractice?.(verse)}
                  onTagClick={(t) => setSelectedTag(t)}
                  sabbathMode={sabbathMode}
                />
              ))}
            </div>
          </div>
        ) : (
          /* B. DOCTRINAL CLUSTERS VIEW (ALL CLUSTERS DISPLAYED) */
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-extrabold text-xl text-[#1C2333] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C9973A]" />
                <span>Scripture Clusters by {dimension === "doctrine" ? "Core Doctrine" : "Theme"}</span>
              </h3>
              <span className="text-xs font-mono text-stone-500">
                {groupedClusters.length} distinct cluster{groupedClusters.length === 1 ? "" : "s"}
              </span>
            </div>

            {groupedClusters.map((cluster) => {
              const themeColor = getThemeColor(cluster.name);
              return (
                <div
                  key={cluster.name}
                  className={`p-6 rounded-3xl border transition-all ${
                    sabbathMode ? "bg-[#FAF7F0] border-[#E8E2D1]" : "bg-white border-[#E8E4DA] shadow-xs"
                  }`}
                >
                  {/* Cluster Header */}
                  <div className="flex items-start sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-stone-100 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${themeColor.bg} ${themeColor.border} ${themeColor.text}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-extrabold text-base sm:text-lg text-[#1C2333]">
                          {cluster.name}
                        </h4>
                        <span className="text-xs text-stone-400 font-sans">
                          {cluster.verses.length} scripture{cluster.verses.length === 1 ? "" : "s"} mapped to this group
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTag(cluster.name)}
                      className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-[#C9973A]/10 text-stone-700 hover:text-[#C9973A] border border-stone-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Focus Cluster</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Cluster Verses Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cluster.verses.map((verse) => (
                      <VerseNodeCard
                        key={verse.id}
                        verse={verse}
                        prof={getVerseProficiency(verse)}
                        onSelectVerse={() => onSelectVerse(verse)}
                        onCategorize={(e) => handleOpenCategorize(verse, e)}
                        onLaunchPractice={() => onLaunchRecallPractice?.(verse)}
                        onTagClick={(t) => setSelectedTag(t)}
                        sabbathMode={sabbathMode}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. CATEGORIZE & EDIT TAGS MODAL */}
      <AnimatePresence>
        {editingVerse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06162c]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white border border-[#DFC57B]/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left"
              id="categorize-verse-modal"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#C9973A]" />
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#C9973A] font-bold">
                      Categorize Scripture
                    </span>
                  </div>
                  <h3 className="font-serif font-extrabold text-2xl text-[#1C2333]">
                    {editingVerse.reference}
                  </h3>
                  <p className="text-xs text-stone-500 font-bible mt-0.5 line-clamp-1">
                    "{editingVerse.text}"
                  </p>
                </div>
                <button
                  onClick={() => setEditingVerse(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Theme Dropdown / Custom Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider block">
                  1. Doctrinal Theme
                </label>
                <select
                  value={editTheme}
                  onChange={(e) => setEditTheme(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#C9973A]"
                >
                  {DOCTRINAL_THEMES.map((theme) => (
                    <option key={theme.id} value={theme.name}>
                      {theme.name} ({theme.category})
                    </option>
                  ))}
                  <option value="Other / Custom">Other / Custom Theme</option>
                </select>

                {editTheme === "Other / Custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom theme name..."
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-sans"
                  />
                )}
              </div>

              {/* Core Doctrine Category */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider block">
                  2. Core Doctrine Pillar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOCTRINE_CATEGORIES.map((cat) => {
                    const isSelected = editCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditCategory(cat)}
                        className={`p-2 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#C9973A]/15 border-[#C9973A] text-[#A67D2E] font-bold"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags & Keywords Editor */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider block">
                  3. Tags & Memory Anchors
                </label>

                {/* Active Tags Pills */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 min-h-[52px]">
                  {editTags.length === 0 ? (
                    <span className="text-xs text-stone-400 font-sans">
                      No tags assigned. Type a tag below or choose from suggestions.
                    </span>
                  ) : (
                    editTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#DFC57B]/60 text-xs font-medium text-stone-800 shadow-2xs"
                      >
                        <span className="text-[#C9973A] font-bold">#</span>
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-stone-400 hover:text-red-600 ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Tag Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Add custom tag (press Enter)..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 font-sans outline-none focus:ring-1 focus:ring-[#C9973A]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Popular Tag Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono text-stone-400 font-bold block">
                    Quick Add Suggested Doctrinal Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {POPULAR_TAG_SUGGESTIONS.map((sug) => {
                      const alreadyAdded = editTags.some((t) => t.toLowerCase() === sug.toLowerCase());
                      if (alreadyAdded) return null;
                      return (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleAddTag(sug)}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-[#C9973A]/15 hover:text-[#A67D2E] text-stone-600 transition-colors border border-stone-200/80 cursor-pointer"
                        >
                          + {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingVerse(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategorization}
                  className="px-5 py-2.5 rounded-xl bg-[#C9973A] hover:bg-[#B0822F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Categorization</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: VERSE NODE CARD
// =========================================================================
interface VerseNodeCardProps {
  verse: MasteredScripture;
  prof: VerseProficiency;
  onSelectVerse: () => void;
  onCategorize: (e: React.MouseEvent) => void;
  onLaunchPractice: () => void;
  onTagClick: (tag: string) => void;
  sabbathMode?: boolean;
}

const VerseNodeCard: React.FC<VerseNodeCardProps> = ({
  verse,
  prof,
  onSelectVerse,
  onCategorize,
  onLaunchPractice,
  onTagClick,
  sabbathMode = false
}) => {
  const themeColor = getThemeColor(verse.theme || "Discipleship & Diligence");

  return (
    <div
      onClick={onSelectVerse}
      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between group cursor-pointer text-left ${
        sabbathMode
          ? "bg-[#FAF7F0] border-[#E8E2D1] hover:border-[#C9973A]"
          : "bg-white border-[#E8E4DA] hover:border-[#C9973A] hover:shadow-md"
      }`}
      id={`verse-node-${verse.id}`}
    >
      <div className="space-y-3">
        {/* Header: Reference + Proficiency + Category */}
        <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-extrabold text-base text-[#C9973A] group-hover:text-[#A67D2E]">
                {verse.reference}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${prof.badgeBg} ${prof.badgeBorder} ${prof.badgeText}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${prof.barColor} animate-pulse`} />
                <span>{prof.score}%</span>
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-sans block mt-0.5">
              {verse.bookChapter}
            </span>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${themeColor.chipBg}`}
          >
            {verse.doctrineCategory || "Pillars of Faith"}
          </span>
        </div>

        {/* Verse Text Snippet */}
        <p className="font-bible text-sm leading-relaxed text-stone-800 line-clamp-3">
          "{verse.text}"
        </p>

        {/* Attached Tags Chips */}
        {verse.tags && verse.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {verse.tags.slice(0, 4).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 hover:bg-[#C9973A]/15 hover:text-[#A67D2E] text-stone-600 transition-colors border border-stone-200/60 cursor-pointer"
                title={`Filter cloud by tag: ${tag}`}
              >
                #{tag}
              </button>
            ))}
            {verse.tags.length > 4 && (
              <span className="text-[10px] font-mono text-stone-400 px-1 py-0.5">
                +{verse.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs">
        <button
          type="button"
          onClick={onCategorize}
          className="text-stone-500 hover:text-[#C9973A] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          title="Edit theme and tags for this verse"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Categorize</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLaunchPractice();
            }}
            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Launch active recall practice"
          >
            <Zap className="w-3 h-3 text-[#C9973A]" />
            <span>Practice</span>
          </button>

          <button
            type="button"
            onClick={onSelectVerse}
            className="p-1 rounded-lg text-stone-400 hover:text-[#C9973A] hover:bg-stone-50 transition-colors cursor-pointer"
            title="Open full theological notes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  BookOpen,
  Flame,
  Sparkles,
  Calendar,
  Bookmark,
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Video
} from "lucide-react";
import { Track } from "../types";
import { TRACK_LIBRARY } from "../data/scriptureDb";
import { useSabbathMode } from "../context/SabbathMode";
import { useApp } from "../context/AppContext";

// Extended Track Interface with study counts
const TRACK_LIBRARY_ITEMS: Track[] = [
  {
    id: "fundamental-beliefs",
    title: "28 Fundamental Beliefs",
    count: 26,
    color: "amber",
    category: "doctrine",
    badge: "Core Theology",
    description: "An intensive active recall track pacing through foundational tenets of the Seventh-day Adventist faith, supported by system-mapped biblical proofs.",
    iconName: "book"
  },
  {
    id: "three-angels",
    title: "Three Angels' Messages",
    count: 12,
    color: "teal",
    category: "prophecy",
    badge: "Esoteric Prophecy",
    description: "Revelation 14 focused active semantic tracking. Explore the sanctuary restoration, the everlasting gospel, cosmic investigative judgment, and Sabbath covenant.",
    iconName: "flame"
  },
  {
    id: "sanctuary-doctrine",
    title: "Sanctuary Doctrine",
    count: 9,
    color: "navy",
    category: "doctrine",
    badge: "Advanced Type Study",
    description: "From earthly tabernacle pattern to heaven's heavenly sanctuary realities. Master the exact theological shadows, high priestly ministry, and Yom Kippur types.",
    iconName: "stars"
  },
  {
    id: "sabbath-school",
    title: "Sabbath School Quarterly",
    count: 15,
    color: "amber",
    category: "devotional",
    badge: "Weekly Devotion",
    description: "Active-recall summaries corresponding to the current global adult SDA Sabbath School bible study quarterly layout. Renew your spirit through systematic review.",
    iconName: "calendar"
  },
  {
    id: "book-by-book",
    title: "Book-by-Book Goals",
    count: 40,
    color: "teal",
    category: "devotional",
    badge: "Verbatim Scope",
    description: "Recall structured scriptures sequentially. Master the foundational epistles of Hebrews, Ephesians, and Romans phrase by phrase with persistent intervals.",
    iconName: "bookmark"
  },
  {
    id: "priority-doctrines",
    title: "Priority SDA Doctrines",
    count: 7,
    color: "navy",
    category: "doctrine",
    badge: "Accelerated Path",
    description: "An interactive scripture chain covering the law of God, the investigative judgment, state of the dead, and second advent glorious promises.",
    iconName: "shield"
  },
  {
    id: "zoom-studies",
    title: "Zoom Bible Studies",
    count: 60,
    color: "amber",
    category: "live",
    badge: "Live Studies",
    description: "Follow the complete archive of interactive Zoom Bible studies with structured lesson flow.",
    iconName: "video"
  }
];

export const TracksPage: React.FC = () => {
  const navigate = useNavigate();
  const { sabbathMode } = useSabbathMode();
  const { setSelectedTrackId, showConfetti } = useApp();

  // Track progress stored locally
  const [trackProgress, setTrackProgress] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("stba_tracks_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback default
      }
    }
    // Set fundamental-beliefs to 4 (in progress) and sabbath-school to 15 (completed)
    return {
      "fundamental-beliefs": 4,
      "three-angels": 0,
      "sanctuary-doctrine": 0,
      "sabbath-school": 15,
      "book-by-book": 0,
      "priority-doctrines": 0
    };
  });

  useEffect(() => {
    localStorage.setItem("stba_tracks_progress", JSON.stringify(trackProgress));
  }, [trackProgress]);

  // Active filter tab: 'all' | 'doctrine' | 'prophecy' | 'devotion' | 'book-by-book' | 'evangelism'
  const [filter, setFilter] = useState<string>("all");

  // Determine active track card at top (highest progress track that is NOT complete)
  const getActiveTrackInProgress = () => {
    // Find tracks that have progress > 0 and progress < count
    const candidates = TRACK_LIBRARY_ITEMS.filter((track) => {
      const current = trackProgress[track.id] || 0;
      return current > 0 && current < track.count;
    });

    if (candidates.length > 0) {
      // Return the one with highest percentage or simply first in progress
      return candidates[0];
    }
    return null;
  };

  const activeTrack = getActiveTrackInProgress();

  const handleIncrementStudy = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const track = TRACK_LIBRARY_ITEMS.find(t => t.id === trackId);
    if (!track) return;

    const currentCompleted = trackProgress[trackId] || 0;
    if (currentCompleted >= track.count) {
      showConfetti('track');
      return;
    }

    const nextCompleted = currentCompleted + 1;
    const nextProgress = {
      ...trackProgress,
      [trackId]: nextCompleted
    };
    setTrackProgress(nextProgress);

    if (nextCompleted === track.count) {
      showConfetti('track');
    }
  };

  // Safe icon renderer
  const renderTrackIcon = (iconName: string, color: string, className = "w-5 h-5") => {
    const colorClass = 
      color === "amber" ? "text-[#C9973A]" :
      color === "teal" ? "text-[#2A9D8F]" : "text-[#1C2333]";

    switch (iconName) {
      case "book":
        return <BookOpen className={`${className} ${colorClass}`} />;
      case "flame":
        return <Flame className={`${className} ${colorClass}`} />;
      case "stars":
        return <Sparkles className={`${className} ${colorClass}`} />;
      case "calendar":
        return <Calendar className={`${className} ${colorClass}`} />;
      case "bookmark":
        return <Bookmark className={`${className} ${colorClass}`} />;
      case "shield":
        return <Shield className={`${className} ${colorClass}`} />;
      case "video":
        return <Video className={`${className} ${colorClass}`} />;
      default:
        return <Layers className={`${className} ${colorClass}`} />;
    }
  };

  // Convert track category and ID to match current filters
  const doesTrackMatchFilter = (track: Track, currentFilter: string) => {
    if (currentFilter === "all") return true;
    
    // Explicit mappings for filter pills
    const filterLower = currentFilter.toLowerCase();
    
    if (filterLower === "doctrine") {
      return track.id === "fundamental-beliefs" || track.id === "sanctuary-doctrine";
    }
    if (filterLower === "prophecy") {
      return track.id === "three-angels";
    }
    if (filterLower === "devotion") {
      return track.id === "sabbath-school";
    }
    if (filterLower === "book-by-book") {
      return track.id === "book-by-book";
    }
    if (filterLower === "evangelism") {
      return track.id === "priority-doctrines";
    }
    
    return track.category.toLowerCase() === filterLower;
  };

  const filteredTracks = TRACK_LIBRARY_ITEMS.filter((t) =>
    doesTrackMatchFilter(t, filter)
  );

  const filterPills = [
    { id: "all", label: "All" },
    { id: "doctrine", label: "Doctrine" },
    { id: "prophecy", label: "Prophecy" },
    { id: "devotion", label: "Devotion" },
    { id: "book-by-book", label: "Book-by-Book" },
    { id: "evangelism", label: "Evangelism" }
  ];

  const handleCardClick = (trackId: string) => {
    setSelectedTrackId(trackId);
    navigate(`/tracks/${trackId}/preview`);
  };

  return (
    <div className="w-full text-left" id="stba-tracks-pane animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-8" id="tracks-head-block">
        <span className="text-xs font-mono uppercase tracking-[0.15em] text-[#DFC57B] font-bold block mb-1">
          Study Curriculum
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#DFC57B] font-bold tracking-tight drop-shadow-xs">
          Study Tracks
        </h1>
        <p className="text-[#FFFFFF] font-sans text-sm md:text-base mt-2">
          Curated curricula for serious theological students
        </p>
      </div>

      {/* FILTER PILLS */}
      <div className="flex flex-wrap gap-2 mb-8" id="filter-pills-row">
        {filterPills.map((pill) => {
          const isActive = filter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id)}
              className={`px-4 py-2 text-xs font-sans font-medium tracking-wide border rounded-full transition-all duration-300 shadow-3xs cursor-pointer ${
                isActive
                  ? "bg-[#1C2333] border-[#1C2333] text-white font-semibold"
                  : "bg-white hover:bg-[#FDFAF5] border-[#E8E4DA] text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
              id={`filter-pill-${pill.id}`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* ACTIVE TRACK HERO BANNER */}
      {activeTrack && filter === "all" && (
        <div className="mb-10" id="active-track-banner-section">
          <h2 className="text-xs font-mono font-bold text-[#6B6B6B] uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C0851A]" />
            <span>Active Study Tracker</span>
          </h2>
          
          <div
            id="active-track-box"
            onClick={() => handleCardClick(activeTrack.id)}
            className="w-full bg-[#1C2333] border border-white/5 p-6 rounded-[12px] shadow-lg text-white hover:shadow-xl transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          >
            {/* Soft decorative light flares */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#C9973A]/10 to-[#2A9D8F]/10 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="space-y-3.5 max-w-[620px] relative z-10">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-[4px] bg-[#C9973A] text-white font-semibold">
                  In Progress
                </span>
                <span className="text-xs text-[#E8E4DA]/70 font-sans">
                  Syllabus Track
                </span>
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-white group-hover:text-[#C9973A] transition-colors leading-tight">
                {activeTrack.title}
              </h3>
              <p className="text-stone-300 text-xs md:text-sm leading-relaxed line-clamp-2">
                {activeTrack.description}
              </p>
            </div>

            {/* Progress metric & continue button on right side */}
            <div className="w-full md:w-[260px] flex flex-col gap-3 shrink-0 relative z-10 text-left md:text-right">
              <div>
                <div className="flex justify-between items-center text-xs font-mono text-[#E8E4DA]/80 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-[#C9973A]">
                    {Math.round(((trackProgress[activeTrack.id] || 0) / (activeTrack.id === "fundamental-beliefs" ? 26 : activeTrack.count)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-[4px] overflow-hidden">
                  <div
                    className="h-full bg-[#C9973A] rounded-[4px] transition-all duration-700"
                    style={{
                      width: `${Math.round(
                        ((trackProgress[activeTrack.id] || 0) / activeTrack.count) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(activeTrack.id);
                }}
                className="w-full py-2.5 px-4 bg-[#C9973A] hover:bg-[#B5852F] text-white font-sans font-bold text-xs rounded-[8px] transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue Study →</span>
              </button>
              
              <button
                onClick={(e) => handleIncrementStudy(activeTrack.id, e)}
                className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-[#C9973A] border border-[#C9973A]/20 font-sans font-bold text-[10px] rounded-[8px] transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                title="Mark one study session complete in this track"
              >
                <span>+1 Lesson Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACK LIBRARY GRID */}
      <div>
        <h2 className="text-xs font-mono font-bold text-[#6B6B6B] uppercase tracking-widest mb-4">
          All Curate Catalog ({filteredTracks.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tracks-cards-grid">
          {filteredTracks.map((track) => {
            const completed = trackProgress[track.id] || 0;
            const isStarted = completed > 0;
            const isComplete = completed >= track.count;
            const percent = Math.round((completed / track.count) * 100);

            return (
              <div
                key={track.id}
                onClick={() => handleCardClick(track.id)}
                className="bg-white border border-[#E8E4DA] rounded-[12px] p-5 hover:shadow-md hover:border-[#C9973A] active:scale-[0.99] transition-all flex flex-col justify-between h-[230px] shadow-2xs relative group cursor-pointer text-left"
                id={`track-card-${track.id}`}
              >
                <div className="space-y-3">
                  {/* Category badging & colored icon row */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-[8px] bg-[#FDFAF5] border border-[#E8E4DA] group-hover:bg-[#C9973A]/10 group-hover:border-[#C9973A]/20 transition-all">
                      {renderTrackIcon(track.iconName, track.color, "w-5 h-5")}
                    </div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E8E4DA] text-[#6B6B6B]">
                      {track.category}
                    </span>
                  </div>

                  {/* Name and Verse details */}
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base md:text-lg text-[#1C2333] group-hover:text-[#C9973A] transition-colors leading-tight line-clamp-2">
                      {track.title}
                    </h3>
                    <p className="text-xs text-[#6B6B6B] font-mono tracking-wide uppercase">
                      {track.count} CHAPTERS/STUDIES
                    </p>
                  </div>
                </div>

                {/* Progress bar and CTAs */}
                <div className="w-full pt-4 border-t border-[#E8E2D1]/40">
                  {isStarted ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-mono text-[#6B6B6B] leading-none">
                        <span className="flex items-center gap-1 justify-between w-full">
                          <span className="flex items-center gap-1">
                            {isComplete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
                            ) : null}
                            <span>
                              {completed}/{track.count} Studies Complete
                            </span>
                          </span>
                          {!isComplete && (
                            <button
                              onClick={(e) => handleIncrementStudy(track.id, e)}
                              className="px-2 py-0.5 bg-[#C9973A]/10 text-[#C9973A] hover:bg-[#C9973A]/20 transition-all text-[9px] font-bold rounded uppercase tracking-wider cursor-pointer"
                            >
                              +1 Lesson
                            </button>
                          )}
                        </span>
                        {!sabbathMode && !isComplete && (
                          <span className="font-bold text-[#C9973A]">{percent}%</span>
                        )}
                      </div>
                      
                      <div className="w-full bg-[#F5F2EB] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C9973A] rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(track.id);
                      }}
                      className="text-xs font-sans font-bold text-[#C9973A] group-hover:text-[#B5852F] hover:underline transition-all uppercase tracking-wide flex items-center justify-start gap-1"
                      id={`preview-btn-${track.id}`}
                    >
                      <span>Track Study</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TracksPage;

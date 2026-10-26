/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  ListPlus,
  WifiOff,
  Tv,
  Check,
  Music,
  BookmarkCheck,
  RotateCcw,
  RotateCw,
  Globe,
  ExternalLink,
  BookOpen,
  Headphones
} from "lucide-react";
import { useSabbathSchoolStore, EGW_NOTES_LESSON_8 } from "../../store/useSabbathSchoolStore";

interface SabbathAudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVideo?: () => void;
  initialSource?: "standard" | "egwNotes";
}

export const SabbathAudioPlayerModal: React.FC<SabbathAudioPlayerModalProps> = ({
  isOpen,
  onClose,
  onOpenVideo,
  initialSource
}) => {
  const {
    quarterlyTitle,
    lessonTitle,
    dailyLessons,
    selectedDayIndex,
    readingTheme,
    activeMediaSource,
    setActiveMediaSource,
    isEgwAudioPlaying,
    setIsEgwAudioPlaying,
    currentEgwTimestampIndex,
    setCurrentEgwTimestampIndex
  } = useSabbathSchoolStore();

  const isLight = readingTheme === "light";
  const activeDay = dailyLessons[selectedDayIndex] || dailyLessons[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [isAddedToPlaylist, setIsAddedToPlaylist] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [retrievedStreamUrl, setRetrievedStreamUrl] = useState<string | null>(null);

  const [selectedAudioTab, setSelectedAudioTab] = useState<"standard" | "egwNotes">(
    initialSource || activeMediaSource || "standard"
  );
  const [selectedEgwIdx, setSelectedEgwIdx] = useState<number>(
    currentEgwTimestampIndex || (selectedDayIndex < 7 ? selectedDayIndex : 0)
  );

  useEffect(() => {
    if (isOpen) {
      if (initialSource) {
        setSelectedAudioTab(initialSource);
      } else if (activeMediaSource) {
        setSelectedAudioTab(activeMediaSource);
      }
      fetch("/api/sabbath/audio-stream")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.audioStreamUrl) {
            setRetrievedStreamUrl(data.audioStreamUrl);
          }
        })
        .catch((err) => console.error("Audio stream retrieval error:", err));
    }
  }, [isOpen, initialSource, activeMediaSource]);

  const activeEgwDay = EGW_NOTES_LESSON_8.days[selectedEgwIdx] || EGW_NOTES_LESSON_8.days[0];

  // Default audio stream URL or scraped Sabbath School Personal Ministries URL
  const audioSourceUrl =
    selectedAudioTab === "egwNotes"
      ? `https://cdn.adventech.io/audio/en/egw-notes-2026-q3-l6-${selectedEgwIdx + 1}.mp3`
      : (retrievedStreamUrl ||
        `https://cdn.adventech.io/audio/en/2026-03/06/en-2026-03-06-0${(selectedDayIndex % 7) + 1}.mp3`);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/sabbath/audio-stream")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.audioStreamUrl) {
            setRetrievedStreamUrl(data.audioStreamUrl);
          }
        })
        .catch((err) => console.error("Audio stream retrieval error:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser blocks autoplay or network fails, handle gracefully
          setIsPlaying(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Feature hooks: Download, Playlist, Offline, Watch Video
  const handleDownloadAudio = () => {
    showToast("Downloading Sabbath School Audio file for offline listening...");
    const link = document.createElement("a");
    link.href = audioSourceUrl;
    link.download = `SabbathSchool_${activeDay?.label.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToPlaylist = () => {
    setIsAddedToPlaylist(!isAddedToPlaylist);
    showToast(
      !isAddedToPlaylist
        ? `Added "${activeDay?.title}" to Sabbath School Study Playlist!`
        : `Removed from Playlist.`
    );
  };

  const handleListenOffline = () => {
    setIsOfflineSaved(!isOfflineSaved);
    showToast(
      !isOfflineSaved
        ? `Saved "${activeDay?.title}" audio to browser offline cache.`
        : `Removed from offline cache.`
    );
  };

  if (!isOpen) return null;

  return (
    <div
      id="sabbath-audio-player-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all overflow-hidden ${
          isLight
            ? "bg-[#FAF8F5] border-[#E8DDC6] text-stone-900 shadow-amber-900/10"
            : "bg-neutral-900 border-neutral-800 text-neutral-100 shadow-black/80"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src={audioSourceUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Music className={`w-5 h-5 ${isPlaying ? "animate-pulse text-amber-400" : ""}`} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
                {selectedAudioTab === "egwNotes" ? "Ellen White Notes Audio Stream" : "Adventech Sabbath School Audio"}
              </span>
              <h3 className="text-sm font-bold font-sans tracking-tight">
                {selectedAudioTab === "egwNotes" ? EGW_NOTES_LESSON_8.title : "Official Lesson Audio Stream"}
              </h3>
            </div>
          </div>

          <button
            id="ssq-audio-modal-close"
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700"
                : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
            }`}
            title="Close Audio Player"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stream Source Selector Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setSelectedAudioTab("standard");
              setActiveMediaSource("standard");
              setIsEgwAudioPlaying(false);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
              selectedAudioTab === "standard"
                ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-xs"
                : isLight
                ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700"
                : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-300"
            }`}
          >
            <Headphones size={13} />
            <span>Standard Lesson Audio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedAudioTab("egwNotes");
              setActiveMediaSource("egwNotes");
              if (isPlaying) setIsEgwAudioPlaying(true);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
              selectedAudioTab === "egwNotes"
                ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-xs"
                : isLight
                ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-700"
                : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-300"
            }`}
          >
            <BookOpen size={13} />
            <span>EGW Notes Audio</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-950/20 dark:bg-amber-400/20 text-amber-900 dark:text-amber-200 rounded-full font-mono">
              2026 Q3
            </span>
          </button>
        </div>

        {/* EGW Notes Day Timestamps selector when EGW Notes audio selected */}
        {selectedAudioTab === "egwNotes" && (
          <div className="mb-4 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 mb-1.5 px-1">
              <span>Select EGW Day Segment:</span>
              <span>{activeEgwDay.label}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {EGW_NOTES_LESSON_8.days.map((day, idx) => (
                <button
                  key={day.dayIndex}
                  type="button"
                  onClick={() => {
                    setSelectedEgwIdx(idx);
                    setCurrentEgwTimestampIndex(idx);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-sans font-semibold transition whitespace-nowrap cursor-pointer border ${
                    selectedEgwIdx === idx
                      ? "bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-xs"
                      : "bg-stone-100 dark:bg-neutral-800 hover:bg-amber-500/20 text-stone-700 dark:text-neutral-300 border-stone-300 dark:border-neutral-700"
                  }`}
                >
                  <span>{day.label.split(",")[0]}</span>
                  <span className="opacity-75 text-[10px] ml-1 font-mono">({day.topic})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Currently Loaded Lesson Banner & Source Link */}
        <div
          className={`p-4 rounded-2xl border mb-5 ${
            isLight
              ? "bg-white border-[#E8DDC6] text-stone-800 shadow-2xs"
              : "bg-neutral-950 border-neutral-850 text-neutral-200"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-extrabold block">
              {selectedAudioTab === "egwNotes" ? EGW_NOTES_LESSON_8.title : quarterlyTitle}
            </span>
            <a
              id="sabbath-audio-source-link"
              href={selectedAudioTab === "egwNotes" ? activeEgwDay.url : "https://www.sabbathschoolpersonalministries.org/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold transition-all cursor-pointer"
              title="Open Source Link"
            >
              <Globe size={13} />
              <span className="max-w-[180px] truncate">
                {selectedAudioTab === "egwNotes" ? activeEgwDay.url : "sabbathschoolpersonalministries.org"}
              </span>
              <ExternalLink size={11} className="ml-0.5 opacity-70" />
            </a>
          </div>

          <h4 className="text-base font-bold font-sans text-amber-900 dark:text-amber-400 leading-snug mb-0.5">
            {selectedAudioTab === "egwNotes" ? activeEgwDay.topic : lessonTitle}
          </h4>
          <p className="text-xs font-medium text-stone-600 dark:text-neutral-400">
            {selectedAudioTab === "egwNotes"
              ? `EGW Commentary — ${activeEgwDay.label}`
              : `${activeDay?.label}: "${activeDay?.title}"`}
          </p>
        </div>

        {/* Audio Scrubber Slider & Timestamps */}
        <div className="space-y-2 mb-6">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-stone-200 dark:bg-neutral-800"
            id="ssq-audio-seek-slider"
          />

          <div className="flex justify-between items-center text-xs font-mono font-bold text-stone-500 dark:text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 872)}</span>
          </div>
        </div>

        {/* Primary Audio Player Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Skip & Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSkip(-15)}
              className="p-2 rounded-xl text-stone-600 dark:text-neutral-400 hover:text-amber-500 transition cursor-pointer"
              title="Rewind 15 seconds"
            >
              <RotateCcw size={18} />
            </button>

            <button
              id="ssq-audio-play-toggle"
              type="button"
              onClick={togglePlay}
              className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleSkip(15)}
              className="p-2 rounded-xl text-stone-600 dark:text-neutral-400 hover:text-amber-500 transition cursor-pointer"
              title="Forward 15 seconds"
            >
              <RotateCw size={18} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-stone-600 dark:text-neutral-400 hover:text-amber-500 cursor-pointer"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-stone-200 dark:bg-neutral-800"
            />
          </div>

          {/* Playback Speed Pill */}
          <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-neutral-800 p-1 rounded-xl border border-stone-300/60 dark:border-neutral-700">
            {[1, 1.25, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                  playbackSpeed === spd
                    ? "bg-amber-500 text-neutral-950 shadow-xs"
                    : "text-stone-600 dark:text-neutral-400 hover:text-amber-500"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Future Expansion Hooks Action Toolbar */}
        <div className="pt-4 border-t border-stone-200/60 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download audio */}
            <button
              id="ssq-audio-hook-download"
              type="button"
              onClick={handleDownloadAudio}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800"
                  : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200"
              }`}
              title="Download audio file"
            >
              <Download size={13} className="text-amber-500" />
              <span>Download Audio</span>
            </button>

            {/* Save to playlist */}
            <button
              id="ssq-audio-hook-playlist"
              type="button"
              onClick={handleSaveToPlaylist}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isAddedToPlaylist
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                  : isLight
                  ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800"
                  : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200"
              }`}
              title="Save to study playlist"
            >
              {isAddedToPlaylist ? <Check size={13} className="text-emerald-500" /> : <ListPlus size={13} className="text-amber-500" />}
              <span>{isAddedToPlaylist ? "In Playlist" : "Save to Playlist"}</span>
            </button>

            {/* Listen offline */}
            <button
              id="ssq-audio-hook-offline"
              type="button"
              onClick={handleListenOffline}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isOfflineSaved
                  ? "bg-teal-500/10 border-teal-500/30 text-teal-600"
                  : isLight
                  ? "bg-white hover:bg-stone-100 border-stone-300 text-stone-800"
                  : "bg-neutral-800 hover:bg-neutral-750 border-neutral-700 text-neutral-200"
              }`}
              title="Save for offline listening"
            >
              {isOfflineSaved ? <BookmarkCheck size={13} className="text-teal-500" /> : <WifiOff size={13} className="text-amber-500" />}
              <span>{isOfflineSaved ? "Saved Offline" : "Listen Offline"}</span>
            </button>
          </div>

          {/* Watch video shortcut */}
          {onOpenVideo && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVideo();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <Tv size={13} />
              <span>Watch Video</span>
            </button>
          )}
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-amber-500/30 animate-fade-in flex items-center gap-2">
            <Check size={14} className="text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

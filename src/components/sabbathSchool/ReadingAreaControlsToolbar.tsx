/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sun, Moon, Type, Plus, Minus, Eye } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";

export const ReadingAreaControlsToolbar: React.FC = () => {
  const {
    readingFontSize,
    setReadingFontSize,
    readingTheme,
    setReadingTheme
  } = useSabbathSchoolStore();

  const fontSizes: Array<{ key: "sm" | "md" | "lg"; label: string; px: string }> = [
    { key: "sm", label: "Small", px: "14px" },
    { key: "md", label: "Medium", px: "16px" },
    { key: "lg", label: "Large", px: "22px" }
  ];

  const handleDecreaseFont = () => {
    if (readingFontSize === "lg" || readingFontSize === "xl") {
      setReadingFontSize("md");
    } else if (readingFontSize === "md") {
      setReadingFontSize("sm");
    }
  };

  const handleIncreaseFont = () => {
    if (readingFontSize === "sm") {
      setReadingFontSize("md");
    } else if (readingFontSize === "md") {
      setReadingFontSize("lg");
    }
  };

  const isLight = readingTheme === "light";

  return (
    <div
      id="reading-area-controls-toolbar"
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-sm mb-6 ${
        isLight
          ? "bg-white border-stone-250 text-stone-900 shadow-stone-200/50"
          : "bg-neutral-900/90 border-neutral-800 text-neutral-100"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Info */}
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              isLight
                ? "bg-amber-100/80 border-amber-300 text-amber-800"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            <Type size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-sans font-bold tracking-tight">
                Reading Area Preferences
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                  isLight
                    ? "bg-stone-100 text-stone-700 border-stone-300"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                }`}
              >
                {readingTheme === "light" ? "Parchment Light Mode" : "Cosmic Dark Mode"} • {readingFontSize.toUpperCase()}
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? "text-stone-600" : "text-neutral-400"}`}>
              Applies custom typography & color themes across Daily Lessons, Takeaways, EGW Notes & Elder Stephen.
            </p>
          </div>
        </div>

        {/* Controls Container */}
        <div className="flex flex-wrap items-center gap-3">
          {/* FONT SIZE CONTROLS */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isLight ? "bg-stone-100/90 border-stone-250" : "bg-neutral-950 border-neutral-800"
            }`}
          >
            {/* Step minus button */}
            <button
              type="button"
              id="btn-font-size-decrease"
              onClick={handleDecreaseFont}
              disabled={readingFontSize === "sm"}
              title="Decrease Font Size"
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isLight
                  ? "hover:bg-stone-200 text-stone-700"
                  : "hover:bg-neutral-800 text-neutral-300"
              }`}
            >
              <Minus size={14} />
            </button>

            {/* Direct Size Pills */}
            <div className="flex items-center gap-0.5 px-1">
              {fontSizes.map((f) => {
                const isActive = readingFontSize === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    id={`btn-font-size-${f.key}`}
                    onClick={() => setReadingFontSize(f.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? isLight
                          ? "bg-amber-500 text-neutral-950 shadow-sm"
                          : "bg-amber-500 text-neutral-950 shadow-sm"
                        : isLight
                        ? "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-850"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[9px] opacity-75 ml-1 font-mono">({f.px})</span>
                  </button>
                );
              })}
            </div>

            {/* Step plus button */}
            <button
              type="button"
              id="btn-font-size-increase"
              onClick={handleIncreaseFont}
              disabled={readingFontSize === "lg" || readingFontSize === "xl"}
              title="Increase Font Size"
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isLight
                  ? "hover:bg-stone-200 text-stone-700"
                  : "hover:bg-neutral-800 text-neutral-300"
              }`}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* LIGHT / DARK MODE TOGGLE */}
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isLight ? "bg-stone-100/90 border-stone-250" : "bg-neutral-950 border-neutral-800"
            }`}
          >
            <button
              type="button"
              id="btn-reading-mode-dark"
              onClick={() => setReadingTheme("dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                readingTheme === "dark"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : isLight
                  ? "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Moon size={14} />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              id="btn-reading-mode-light"
              onClick={() => setReadingTheme("light")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                readingTheme === "light"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : isLight
                  ? "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sun size={14} />
              <span>Light Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

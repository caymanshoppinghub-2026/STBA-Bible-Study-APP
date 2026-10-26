import React from "react";
import { BookOpen, Sidebar, Columns } from "lucide-react";

export type ViewMode = "bible" | "tools" | "split";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: "light" | "dark";
  className?: string;
  compact?: boolean;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
  theme,
  className = "",
  compact = false
}) => {
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border text-xs select-none transition-all gap-0.5 ${
        theme === "dark"
          ? "bg-[#161B22] border-[#30363D]"
          : "bg-[#FFF] border-[#E5DFD5] shadow-2xs"
      } ${className}`}
      role="group"
      aria-label="Interface View Mode Toggle"
    >
      <button
        type="button"
        onClick={() => setViewMode("bible")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
          viewMode === "bible"
            ? "bg-[#C9973A] text-white shadow-xs"
            : theme === "dark"
              ? "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
        }`}
        title="Bible View (Full Width)"
      >
        <BookOpen className="w-3.5 h-3.5 text-current shrink-0" />
        <span className={compact ? "hidden sm:inline" : "inline"}>Bible View</span>
      </button>

      <button
        type="button"
        onClick={() => setViewMode("tools")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
          viewMode === "tools"
            ? "bg-[#C9973A] text-white shadow-xs"
            : theme === "dark"
              ? "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
        }`}
        title="Tools View (Full Width)"
      >
        <Sidebar className="w-3.5 h-3.5 text-current shrink-0" />
        <span className={compact ? "hidden sm:inline" : "inline"}>Tools View</span>
      </button>

      <button
        type="button"
        onClick={() => setViewMode("split")}
        className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
          viewMode === "split"
            ? "bg-[#C9973A] text-white shadow-xs"
            : theme === "dark"
              ? "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
        }`}
        title="Split Dual View"
      >
        <Columns className="w-3.5 h-3.5 text-current shrink-0" />
        <span className="hidden md:inline">Split</span>
      </button>
    </div>
  );
};

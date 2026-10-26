/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";

interface CollapsibleContainerProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({
  id,
  title,
  subtitle,
  badge,
  icon,
  defaultOpen = false,
  children,
  headerAction,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { readingTheme } = useSabbathSchoolStore();
  const isLight = readingTheme === "light";

  return (
    <div
      id={id}
      className={`border rounded-2xl md:rounded-[20px] shadow-2xs overflow-hidden transition-all ${
        isLight
          ? "bg-white border-[#E5DFD5] text-stone-900"
          : "bg-[#161B22] border-[#21262D] text-neutral-100"
      } ${className}`}
    >
      {/* Collapsible Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between p-4 sm:p-5 md:p-6 cursor-pointer select-none transition-colors ${
          isLight
            ? "bg-white hover:bg-[#FAF7F2]"
            : "bg-[#161B22] hover:bg-[#1C212B]"
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && (
            <div
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center ${
                isLight
                  ? "bg-[#FEF3D6] text-[#92400E] border border-[#F7E1AD]"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3
                className={`text-base sm:text-lg md:text-xl font-sans font-extrabold tracking-tight truncate ${
                  isLight ? "text-stone-900" : "text-white"
                }`}
              >
                {title}
              </h3>
              {badge && (
                <span
                  className={`px-2.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-full shrink-0 border ${
                    isLight
                      ? "bg-[#FEF6E4] text-[#8C5209] border-[#F7E1AD]"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                className={`text-xs sm:text-sm font-sans truncate ${
                  isLight ? "text-stone-500" : "text-neutral-400"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>
          )}
          <button
            type="button"
            aria-label={isOpen ? "Collapse section" : "Expand section"}
            className={`p-2 rounded-xl border transition flex items-center justify-center shrink-0 shadow-2xs ${
              isLight
                ? "text-stone-600 bg-white hover:bg-stone-50 border-stone-200/90"
                : "text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 border-neutral-700"
            }`}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {isOpen && (
        <div
          className={`p-5 md:p-6 animate-fade-in border-t ${
            isLight
              ? "border-[#EDE4D3] bg-white rounded-b-2xl md:rounded-b-[20px]"
              : "border-neutral-800 bg-neutral-900/95 rounded-b-2xl md:rounded-b-[20px]"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

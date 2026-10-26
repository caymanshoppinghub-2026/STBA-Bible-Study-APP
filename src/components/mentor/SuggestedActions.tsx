/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { useSabbathSchoolStore } from "../../store/useSabbathSchoolStore";

export const SuggestedActions: React.FC = () => {
  const { chatWithElderStephen, isElderLoading } = useSabbathSchoolStore();

  const prompts = [
    {
      label: "Line upon Line Exegesis",
      query: "Can you explain the historic Seventh-day Adventist approach of 'line upon line, here a little, there a little' (Isaiah 28:10)? How do we apply this in Sabbath School study?"
    },
    {
      label: "Sanctuary Shadows & Leviticus",
      query: "How do the sanctuary shadows in Leviticus connect to Christ's active high priestly ministry in Hebrews? Explain the pre-advent sanctuary cleansing timeline."
    },
    {
      label: "Commandments & Faith of Jesus",
      query: "What is the critical theological connection between keeping the commandments of God and having the faith of Jesus in Revelation 14:12?"
    },
    {
      label: "Three Angels' Warnings",
      query: "Summarize the Three Angels' Messages in Revelation 14. What are the key thematic outlines we must share as teachers?"
    }
  ];

  return (
    <div id="suggested-actions" className="space-y-3 mb-6">
      <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 uppercase tracking-widest">
        <Sparkles size={11} className="text-amber-500" />
        <span>Pastoral Discussion Suggested Actions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            id={`suggested-prompt-${i}`}
            onClick={() => chatWithElderStephen(prompt.query)}
            disabled={isElderLoading}
            className="flex items-center justify-between p-3.5 bg-neutral-900 border border-neutral-805 rounded-xl text-left hover:bg-neutral-850 hover:border-neutral-750 transition disabled:opacity-50 text-xs text-neutral-350 hover:text-white"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle size={14} className="text-amber-500 shrink-0" />
              <span className="font-semibold leading-tight">{prompt.label}</span>
            </div>
            <ArrowRight size={12} className="text-neutral-500 shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
};

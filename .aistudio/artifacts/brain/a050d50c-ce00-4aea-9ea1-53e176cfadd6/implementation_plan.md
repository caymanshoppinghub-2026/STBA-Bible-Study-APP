# Verification & Redo: Scripture Mastery & Ellen White Notes System

Comprehensive overhaul and verification to redo all recent updates across the Sabbath School curriculum viewer and STBA Bible study engine, ensuring that all Ellen G. White quotes are completely relocated to the dedicated notes section, formatted in a standard non-italicized font within the original yellow bounding box and orange accents, and that the Scripture Reference Explorer accurately captures all biblical references with a transparent backdrop modal and STBA deep-study routing.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design choices were confirmed via user interview:
> - **Font Family**: Standard non-italicized clean modern sans-serif (`font-['Lato',sans-serif] font-normal not-italic`) for all Ellen G. White notes.
> - **Quotation Marks**: Preserved clean typographical double quotes (`“...”`) around note paragraphs.
> - **Note Titles**: Explicitly titled `Ellen White Notes on [Specific Daily Topic]` replacing legacy `E.G. White Notes`.
> - **Modal Backdrop**: Completely transparent click-outside backdrop (`bg-transparent pointer-events-auto`) with no background blur or graying-out.
> - **Deep-Study Flow**: `Study Deeper` button routes directly to STBA Scripture Study mode (`/stba?ref=...&tool=visual`) with query pre-loaded in the search input and passage opened.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. Relocates every Ellen G. White quote out of the daily Sabbath School exposition paragraphs and places them into the dedicated **Ellen White Notes** accordion section (`FurtherThought.tsx`).
  2. Renders all Ellen White notes in standard non-italicized modern sans-serif typography within the yellow bounding box (`border-2 border-amber-400/90`), orange quote glyph `”`, orange section title `Ellen White Notes on [Specific Daily Topic]`, and an orange left vertical accent bar, broken into readable 2–3 sentence paragraph sections.
  3. Upgrades the scripture reference regex parser across both daily lesson views to capture every Bible reference (including abbreviations like `Exod. 17:14`, `Ezek. 4:1–8`, and comma-separated lists like `Heb. 1:1 , 2` and `Matt. 26:36 , 37`) as yellow pill links (`bg-[#FEF9C3] border-[#FACC15] text-[#78350F]`).
  4. Provides the floating **Scripture Reference Explorer** modal (`VerseModal.tsx`) featuring instant translation switching across **KJV**, **NKJV**, **ESV**, and **NASB**, a completely transparent backdrop that does not gray out or blur background text, and a `Study Deeper` button that routes to `/stba?ref=...` in the STBA Bible study engine.

- **Target Audience**: Sabbath School students, teachers, and theological researchers using the CSMS system for daily lesson devotion, active recall, and deep exegesis.

---

### 2. User Experience & Visual Design

#### A. Ellen White Notes Styling & Typography
- **Container**: Rounded yellow bounding box (`border-2 border-amber-400/90 rounded-2xl bg-[#FFFDF7] dark:bg-[#14120D] dark:border-amber-500/50 p-6 sm:p-7 md:p-8 shadow-xs`).
- **Header**:
  - Orange double quote mark glyph `”` (`text-orange-500 font-serif font-black text-2xl sm:text-3xl select-none`).
  - Title: `Ellen White Notes on [Specific Daily Topic]` in uppercase orange font (`text-orange-500 dark:text-orange-400 font-mono font-bold tracking-wider text-xs sm:text-sm`).
  - Day tag badge on the right (`Day 1`, `Day 2`, etc.).
- **Body**:
  - Orange left vertical accent bar (`border-l-2 border-l-orange-500 dark:border-l-orange-400 pl-4 sm:pl-5 my-1`).
  - **Typography (Standard Non-Italicized)**: `font-['Lato',sans-serif] font-normal not-italic leading-relaxed sm:leading-loose text-stone-850 dark:text-neutral-100`.
  - **Paragraph Chunking**: `formatEgwParagraphChunks` breaking long quotes into readable 2–3 sentence sections with quotation marks preserved.
- **Footer**:
  - Author and source citation: `Ellen White • [Book Citation]`.
  - `Copy Note` interactive button with clipboard feedback.

#### B. Scripture Reference Explorer & Pill Links
- **In-Text Scripture Links**: Yellow pill badge matching user attachment (`bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#78350F] border border-[#FACC15] rounded-md px-2 py-0.5 font-mono font-bold text-xs sm:text-sm underline decoration-[#CA8A04]/60`).
- **Modal Design**:
  - **Backdrop**: Centered floating card with a 100% transparent click-outside backdrop (`bg-transparent pointer-events-auto`) that leaves the underlying Sabbath School text completely crisp and legible.
  - **Header**: Book icon, serif gold title of the clicked reference, uppercase monospace `SCRIPTURE REFERENCE EXPLORER`, and a circular `X` close button.
  - **Translation Tabs**: Horizontal segmented controls for `KJV`, `NKJV`, `ESV`, and `NASB`, with active tab highlighted in bright amber (`#F59E0B`).
  - **Verse Box**: Clean, readable verse text with quotation marks, translation badge, and Adventech Scripture Engine attribution.
  - **Footer Actions**:
    - `[ 📖 Study Deeper ]`: Pre-loads reference into STBA search state and navigates to `/stba?ref=...&tool=visual`.
    - `[ Done ]`: Closes the modal.

---

### 3. Technical Architecture & Component Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Sabbath School Lesson Data                      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                    separateLessonAndEgwNotes(content)
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       Daily Lesson Exposition        │  │       Dedicated EGW Notes Section     │
│ (CollapsibleDailyLessonsSection.tsx) │  │        (FurtherThought.tsx)          │
│                                      │  │                                      │
│ • Ellen White quotes EXCLUDED        │  │ • Replaces legacy/conflicting notes  │
│ • getScriptureRegex() matches ALL    │  │ • Title: "Ellen White Notes on ..."  │
│   Bible books/abbrs/ranges           │  │ • Yellow bounding box border-2       │
│ • Yellow pill badges:                │  │ • Orange quote glyph ” & accent bar  │
│   bg-[#FEF9C3] border-[#FACC15]      │  │ • Standard NON-ITALICIZED sans font  │
│                                      │  │ • 2-3 sentence paragraph chunks      │
└──────────────────┬───────────────────┘  └──────────────────────────────────────┘
                   │ Click Scripture Pill
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Scripture Reference Explorer Modal                   │
│                          (VerseModal.tsx)                              │
│                                                                        │
│ • Transparent click-outside backdrop (no gray-out / no blur)           │
│ • Translation Tabs: [ KJV ] [ NKJV ] [ ESV ] [ NASB ]                  │
│ • Close on backdrop click, 'X', or 'Done' button                       │
│ • [ Study Deeper ] button                                              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Routes to /stba?ref=...
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       STBA Bible Study Engine                          │
│                        (STBAStudyMode.tsx)                             │
│                                                                        │
│ • Receives 'ref' and 'tool=visual' from URL parameters                 │
│ • Pre-loads search input and initiates passage lookup                  │
│ • Opens parallel Bible reader with selected scripture                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Implementation Steps (Plan of Action)

1. **`src/components/sabbathSchool/FurtherThought.tsx`**:
   - Verify and ensure all Ellen White quotes strictly use **standard non-italicized font** (`font-['Lato',sans-serif] font-normal not-italic`).
   - Remove any remaining `italic` or `font-serif italic` classes from quote paragraphs.
   - Retain clean quotation marks around paragraphs.
   - Ensure the yellow bounding box (`border-2 border-amber-400/90`), orange quote glyph `”`, orange left vertical accent bar (`border-l-2 border-l-orange-500 pl-4`), and `Ellen White Notes on [Specific Daily Topic]` header are consistently applied.
   - Verify that relocated quotes from daily lessons replace existing content without collisions.

2. **`src/utils/sabbathUtils.ts`**:
   - Re-verify `separateLessonAndEgwNotes`: ensure every paragraph citing Ellen White, Spirit of Prophecy books, or author variants is cleanly extracted into `egwParagraphs` and removed from `mainParagraphs`.
   - Re-verify `getScriptureRegex()`: ensure full coverage for all 66 Bible books, abbreviations (`Exod.`, `Ezek.`, `Heb.`, `2 Tim.`, `2 Pet.`, etc.), non-breaking spaces `\u00A0`, and multi-verse/range notations (`Heb. 1:1 , 2`, `Matt. 26:36 , 37`).
   - Ensure `formatEgwParagraphChunks` cleanly groups long quotes into 2–3 sentence blocks without breaking quotation marks.

3. **`src/components/sabbathSchool/CollapsibleDailyLessonsSection.tsx` & `DailyLessonView.tsx`**:
   - Ensure `separateLessonAndEgwNotes(content)` is called so daily lesson exposition never renders EGW quotes.
   - Ensure `getScriptureRegex()` generates yellow pill badges (`bg-[#FEF9C3] border-[#FACC15] text-[#78350F] underline decoration-[#CA8A04]/60`) matching Attachment 1.
   - Verify click handler calls `handleOpenVerseModal(fullMatch)` with cleaned references.

4. **`src/components/VerseModal.tsx`**:
   - Ensure the backdrop is 100% transparent (`fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent pointer-events-auto`) without blur or darkening filter.
   - Ensure translation tabs (`KJV`, `NKJV`, `ESV`, `NASB`) switch smoothly.
   - Ensure `Study Deeper` sets `stba_pending_search_ref` and navigates to `/stba?ref=...&tool=visual`.
   - Ensure verse text displays in a clean, non-italicized, high-legibility font.

5. **Verification & Testing**:
   - Run `lint_applet` and `compile_applet` to confirm zero TypeScript compilation errors or broken imports.
   - Verify visual hierarchy, typography, and interaction flows across Sabbath School and STBA modules.

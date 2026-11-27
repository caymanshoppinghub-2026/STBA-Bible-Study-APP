import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  CheckCircle2,
  Bookmark,
  FileText,
  FileDown,
  Download,
  ExternalLink,
  Sparkles,
  Flame,
  Shield,
  Crown,
  Wind,
  Lamp,
  X,
  Check,
  FilePlus2
} from "lucide-react";
import { ConstellationDoctrineNode } from "../../data/doctrineBlueprintGraph";
import {
  ArchitecturalBlueprintData,
  BlueprintColumn,
  BlueprintSubCard,
  getArchitecturalBlueprintForNode
} from "../../data/doctrineArchitecturalBlueprints";

interface ArchitecturalBlueprintViewProps {
  node: ConstellationDoctrineNode;
  trackTitle: string;
  onBackToConstellation: () => void;
  onExitToOverview: () => void;
  onLaunchBibleStudy: (reference: string, topic: string) => void;
}

const renderColumnIcon = (iconKey: BlueprintColumn["iconKey"]) => {
  const cls = "w-7 h-7 text-[#E5C158] drop-shadow-[0_0_8px_rgba(229,193,88,0.5)]";
  switch (iconKey) {
    case "dove":
      return <Wind className={cls} />;
    case "flame":
      return <Flame className={cls} />;
    case "lamp":
      return <Lamp className={cls} />;
    case "shield":
      return <Shield className={cls} />;
    case "crown":
      return <Crown className={cls} />;
    case "book":
    default:
      return <BookOpen className={cls} />;
  }
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "doctrine-blueprint";

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function exportBlueprintAsPdf(blueprint: ArchitecturalBlueprintData, singleCard?: { columnTitle: string; card: BlueprintSubCard }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 44;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = 52;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 52;
    }
  };

  // Header Banner
  doc.setFillColor(7, 22, 48);
  doc.rect(0, 0, pageWidth, 88, "F");
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.line(0, 88, pageWidth, 88);

  doc.setTextColor(229, 193, 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("STUDY TO BE APPROVED  •  BIBLE DOCTRINE BINDER", margin, 30);

  doc.setTextColor(253, 240, 190);
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  const titleText = singleCard ? `${blueprint.title} — ${singleCard.card.title}` : blueprint.title;
  const titleLines = doc.splitTextToSize(titleText, maxWidth);
  doc.text(titleLines, margin, 52);

  doc.setTextColor(180, 196, 224);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(blueprint.subtitle, margin, 74);

  y = 112;

  const columnsToRender: BlueprintColumn[] = singleCard
    ? [
        {
          id: "single",
          headerBanner: singleCard.columnTitle,
          iconKey: "book",
          cards: [singleCard.card]
        }
      ]
    : blueprint.columns;

  for (const col of columnsToRender) {
    ensureSpace(44);
    doc.setFillColor(18, 38, 71);
    doc.roundedRect(margin, y - 14, maxWidth, 24, 4, 4, "F");
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y - 14, maxWidth, 24, 4, 4, "S");
    doc.setTextColor(246, 226, 155);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(col.headerBanner.toUpperCase(), margin + 10, y + 2);
    y += 26;

    for (const card of col.cards) {
      ensureSpace(90);
      doc.setTextColor(12, 30, 62);
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.text(card.title.toUpperCase(), margin, y);
      y += 15;

      doc.setTextColor(156, 114, 24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(`Anchor Scriptures: ${card.verses.join("  |  ")}`, margin, y);
      y += 16;

      doc.setTextColor(40, 52, 74);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("MAIN POINTS:", margin, y);
      y += 13;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      for (const pt of card.mainPoints) {
        const lines = doc.splitTextToSize(`• ${pt}`, maxWidth - 10);
        ensureSpace(lines.length * 13 + 6);
        doc.text(lines, margin + 8, y);
        y += lines.length * 13 + 2;
      }

      y += 4;
      ensureSpace(30);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(156, 114, 24);
      const dkLines = doc.splitTextToSize(`DOCTRINAL KEY: ${card.doctrinalKey}`, maxWidth);
      doc.text(dkLines, margin, y);
      y += dkLines.length * 13 + 6;

      const addSection = (label: string, body: string) => {
        const lines = doc.splitTextToSize(body, maxWidth);
        ensureSpace(lines.length * 12.5 + 22);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(12, 30, 62);
        doc.text(label, margin, y);
        y += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(45, 55, 72);
        doc.text(lines, margin, y);
        y += lines.length * 12.5 + 8;
      };

      addSection("PASTORAL NOTES:", card.pastoralNote);
      addSection("COMPREHENSIVE EXEGETICAL NOTES:", card.deepNotes);
      addSection("GREAT CONTROVERSY CONTEXT:", card.additionalContext);

      ensureSpace(36);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(12, 30, 62);
      doc.text("PRACTICAL APPLICATION:", margin, y);
      y += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(45, 55, 72);
      for (const app of card.practicalApplication) {
        const lines = doc.splitTextToSize(`• ${app}`, maxWidth - 10);
        ensureSpace(lines.length * 12.5 + 6);
        doc.text(lines, margin + 8, y);
        y += lines.length * 12.5 + 2;
      }

      y += 4;
      const sopLines = doc.splitTextToSize(
        `“${card.spiritOfProphecy.quote}” — Ellen G. White, ${card.spiritOfProphecy.source}`,
        maxWidth - 14
      );
      ensureSpace(sopLines.length * 12.5 + 16);
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(2);
      doc.line(margin, y - 8, margin, y + sopLines.length * 12.5 - 6);
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(65, 75, 95);
      doc.text(sopLines, margin + 10, y);
      y += sopLines.length * 12.5 + 18;
    }
  }

  const filename = singleCard
    ? `${slugify(blueprint.title)}-${slugify(singleCard.card.title)}.pdf`
    : `${slugify(blueprint.title)}.pdf`;
  doc.save(filename);
}

function exportBlueprintAsDoc(blueprint: ArchitecturalBlueprintData, singleCard?: { columnTitle: string; card: BlueprintSubCard }) {
  const columnsToRender: BlueprintColumn[] = singleCard
    ? [
        {
          id: "single",
          headerBanner: singleCard.columnTitle,
          iconKey: "book",
          cards: [singleCard.card]
        }
      ]
    : blueprint.columns;

  const bodyHtml = columnsToRender
    .map(
      (col) => `
      <div style="margin-top:22px;padding:10px 14px;background:#071630;color:#F6E29B;border-left:4px solid #D4AF37;font-family:Georgia,serif;font-size:14pt;font-weight:bold;letter-spacing:1px;">
        ${escapeHtml(col.headerBanner.toUpperCase())}
      </div>
      ${col.cards
        .map(
          (card) => `
        <div style="margin:14px 0 20px 0;padding:14px 16px;border:1px solid #D4AF37;background:#FAF8F2;">
          <h3 style="margin:0 0 6px 0;font-family:Georgia,serif;color:#071630;font-size:13pt;">${escapeHtml(card.title.toUpperCase())}</h3>
          <p style="margin:0 0 10px 0;font-family:Calibri,sans-serif;color:#9A7118;font-weight:bold;font-size:10pt;">
            Anchor Scriptures: ${escapeHtml(card.verses.join("  |  "))}
          </p>
          <p style="margin:6px 0 4px 0;font-weight:bold;font-size:9.5pt;color:#0B2042;">MAIN POINTS:</p>
          <ul style="margin:0 0 10px 18px;padding:0;font-size:10pt;color:#1F2937;">
            ${card.mainPoints.map((pt) => `<li style="margin-bottom:3px;">${escapeHtml(pt)}</li>`).join("")}
          </ul>
          <p style="margin:8px 0;font-size:10pt;font-weight:bold;color:#8A6312;">
            DOCTRINAL KEY: ${escapeHtml(card.doctrinalKey)}
          </p>
          <p style="margin:8px 0;font-size:10pt;color:#1F2937;">
            <strong>Notes:</strong> ${escapeHtml(card.pastoralNote)}
          </p>
          <p style="margin:8px 0;font-size:10pt;color:#1F2937;">
            <strong>Comprehensive Exegetical Notes:</strong> ${escapeHtml(card.deepNotes)}
          </p>
          <p style="margin:8px 0;font-size:10pt;color:#1F2937;">
            <strong>Great Controversy Context:</strong> ${escapeHtml(card.additionalContext)}
          </p>
          <p style="margin:8px 0 4px 0;font-weight:bold;font-size:9.5pt;color:#0B2042;">PRACTICAL APPLICATION:</p>
          <ul style="margin:0 0 10px 18px;padding:0;font-size:10pt;color:#1F2937;">
            ${card.practicalApplication.map((app) => `<li style="margin-bottom:3px;">${escapeHtml(app)}</li>`).join("")}
          </ul>
          <blockquote style="margin:10px 0 0 0;padding:8px 12px;border-left:3px solid #D4AF37;background:#F3EFE4;font-style:italic;font-size:10pt;color:#273449;">
            “${escapeHtml(card.spiritOfProphecy.quote)}”<br/>
            <span style="font-style:normal;font-weight:bold;color:#8A6312;">— Ellen G. White, ${escapeHtml(card.spiritOfProphecy.source)}</span>
          </blockquote>
        </div>`
        )
        .join("")}
    `
    )
    .join("");

  const fullHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(blueprint.title)}</title>
      </head>
      <body style="font-family:Calibri,Arial,sans-serif;color:#111827;line-height:1.5;margin:36px;">
        <div style="padding:16px 20px;background:#071630;color:#FDF0BE;border-bottom:4px solid #D4AF37;">
          <div style="font-size:9pt;letter-spacing:2px;color:#E5C158;text-transform:uppercase;">Study To Be Approved • Bible Doctrine Binder</div>
          <h1 style="margin:6px 0 4px 0;font-family:Georgia,serif;font-size:20pt;color:#FDF0BE;">${escapeHtml(blueprint.title)}</h1>
          <div style="font-size:10pt;color:#CFD9EC;">${escapeHtml(blueprint.subtitle)}</div>
        </div>
        ${bodyHtml}
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", fullHtml], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = singleCard
    ? `${slugify(blueprint.title)}-${slugify(singleCard.card.title)}.doc`
    : `${slugify(blueprint.title)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ArchitecturalBlueprintView: React.FC<ArchitecturalBlueprintViewProps> = ({
  node,
  trackTitle,
  onBackToConstellation,
  onExitToOverview,
  onLaunchBibleStudy
}) => {
  const blueprint = getArchitecturalBlueprintForNode(node, trackTitle);

  const [readMoreOpenIds, setReadMoreOpenIds] = useState<Record<string, boolean>>({});
  const [collapsedCardIds, setCollapsedCardIds] = useState<Record<string, boolean>>({});
  const [masteredIds, setMasteredIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("stba_blueprint_mastered_cards");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [savedToastId, setSavedToastId] = useState<string | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [cardDownloadMenuId, setCardDownloadMenuId] = useState<string | null>(null);
  const [versePopup, setVersePopup] = useState<{ reference: string; text: string; loading?: boolean } | null>(null);

  const headerDownloadRef = useRef<HTMLDivElement | null>(null);

  // Reset per-doctrine UI state on node switch
  useEffect(() => {
    setReadMoreOpenIds({});
    setCollapsedCardIds({});
    setVersePopup(null);
    setDownloadMenuOpen(false);
    setCardDownloadMenuId(null);
  }, [node.id]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerDownloadRef.current && !headerDownloadRef.current.contains(e.target as Node)) {
        setDownloadMenuOpen(false);
      }
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-card-download-menu='true']")) {
        setCardDownloadMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ESC key support: close popups/menus first, then return to Constellation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (versePopup) {
        setVersePopup(null);
      } else if (downloadMenuOpen || cardDownloadMenuId) {
        setDownloadMenuOpen(false);
        setCardDownloadMenuId(null);
      } else {
        onBackToConstellation();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [versePopup, downloadMenuOpen, cardDownloadMenuId, onBackToConstellation]);

  const toggleMastered = (cardId: string) => {
    setMasteredIds((prev) => {
      const next = { ...prev, [cardId]: !prev[cardId] };
      try {
        localStorage.setItem("stba_blueprint_mastered_cards", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleOpenVersePopup = async (refStr: string) => {
    setVersePopup({ reference: refStr, text: `Loading ${refStr} (KJV)…`, loading: true });
    try {
      const resp = await fetch("/api/study/quick-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ references: [refStr] })
      });
      if (resp.ok) {
        const data = await resp.json();
        const hit = (data?.results?.[refStr] || (data?.results ? Object.values(data.results)[0] : null)) as any;
        if (hit?.combinedText) {
          setVersePopup({ reference: refStr, text: String(hit.combinedText).trim(), loading: false });
          return;
        }
      }
    } catch {}
    setVersePopup({
      reference: refStr,
      text: `Open ${refStr} in the Split Bible Reader to study its complete KJV/NKJV parallel text and Hebrew/Greek roots.`,
      loading: false
    });
  };

  const handleSaveCardToNotebook = (card: BlueprintSubCard) => {
    try {
      const existingRaw = localStorage.getItem("stba_quick_blueprint_notes");
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift({
        id: `bp-${card.id}-${Date.now()}`,
        title: `[Blueprint] ${node.label} — ${card.title}`,
        verses: card.verses,
        doctrinalKey: card.doctrinalKey,
        notes: card.deepNotes,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem("stba_quick_blueprint_notes", JSON.stringify(list.slice(0, 50)));
      setSavedToastId(card.id);
      setTimeout(() => setSavedToastId((cur) => (cur === card.id ? null : cur)), 1800);
    } catch {}
  };

  const allCardIds = blueprint.columns.flatMap((c) => c.cards.map((card) => card.id));
  const masteredCount = allCardIds.filter((id) => masteredIds[id]).length;

  return (
    <div
      key={`arch-blueprint-fullscreen-${node.id}`}
      className="fixed inset-0 z-[9999] flex flex-col text-[#F4EFE4] overflow-hidden"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#051228",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.14) 0%, transparent 45%), linear-gradient(to right, rgba(96, 165, 250, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(96, 165, 250, 0.08) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 28px 28px, 28px 28px"
      }}
    >
      {/* Fixed Full-Screen Top Control Bar */}
      <header className="shrink-0 z-30 border-b border-[#D4AF37]/35 bg-[#061329]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Navigation & Master Title */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={onBackToConstellation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B1E3D] border border-[#D4AF37]/40 text-xs font-semibold text-[#FDF0BE] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-[#E5C158]" />
              <span>Constellation</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E5C158]">
                  Bible Doctrine Binder
                </span>
                <span className="text-[#D4AF37]/40">•</span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#E5C158]/50 text-[#FDF0BE]">
                  {masteredCount}/{allCardIds.length} Pillars Mastered
                </span>
              </div>
              <h1
                className="font-serif text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wider truncate"
                style={{
                  background: "linear-gradient(180deg, #FDF0BE 0%, #E2BE5B 60%, #B88B2B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                {blueprint.title}
              </h1>
            </div>
          </div>

          {/* Right: Download Dropdown (PDF / DOC) + Split Reader + Exit */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Document Download Dropdown (PDF / DOC) */}
            <div ref={headerDownloadRef} className="relative">
              <button
                type="button"
                onClick={() => setDownloadMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0B1E3D] border border-[#D4AF37]/50 text-[#F6E29B] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>Download Blueprint</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${downloadMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {downloadMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#071630] border border-[#E5C158]/60 shadow-[0_16px_40px_rgba(0,0,0,0.65)] overflow-hidden z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#D4AF37]/25 bg-[#0C2042]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C158]">
                        Export Format
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        exportBlueprintAsPdf(blueprint);
                        setDownloadMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-[#F4EFE4] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-[#E5C158] shrink-0" />
                      <div>
                        <div className="font-semibold text-[#FDF0BE]">Download as PDF (.pdf)</div>
                        <div className="text-[10px] text-[#9FB0CD]">Formatted printable blueprint</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportBlueprintAsDoc(blueprint);
                        setDownloadMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-[#F4EFE4] hover:bg-[#D4AF37]/20 transition-colors border-t border-[#D4AF37]/15 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#E5C158] shrink-0" />
                      <div>
                        <div className="font-semibold text-[#FDF0BE]">Download as Word (.doc)</div>
                        <div className="text-[10px] text-[#9FB0CD]">Editable study & sermon notes</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => onLaunchBibleStudy(node.anchorRefs[0] || "2 Timothy 3:16", node.label)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#081326] shadow-[0_6px_20px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer"
              style={{ background: "linear-gradient(180deg, #F1D37A 0%, #D4AF37 100%)" }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Study in Split Reader</span>
            </button>

            <button
              type="button"
              onClick={onExitToOverview}
              title="Exit Full-Screen Blueprint (ESC)"
              className="p-2 rounded-xl bg-[#0B1E3D] border border-[#D4AF37]/35 text-[#CFD9EC] hover:text-[#FDF0BE] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Scrollable Blueprint Drafting Canvas */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-[1440px] mx-auto space-y-5 pb-16">
          {/* Drafting Frame Subtitle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#071630]/80 border border-[#D4AF37]/30 text-[11px] font-mono uppercase tracking-[0.16em] text-[#9FB0CD]">
            <span>{blueprint.subtitle}</span>
            <span className="text-[#E5C158]">
              Click any verse for KJV • Click READ MORE to expand • Follow gold interconnectivity arrows
            </span>
          </div>

          {/* Blueprint Drafting Board with Gold Outer Bracket Connectors & 3 Pillar Columns */}
          <div className="relative px-2 sm:px-7 py-4">
            {/* Left-Side Gold Return Bracket Connector (matches Holy Spirit concept drawing) */}
            <svg
              className="hidden xl:block pointer-events-none absolute left-0 top-24 bottom-16 w-7 h-[calc(100%-10rem)]"
              viewBox="0 0 28 500"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <marker id="goldArrowLeft" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#E5C158" />
                </marker>
              </defs>
              <path
                d="M 26 390 L 10 390 Q 4 390 4 382 L 4 126 Q 4 118 10 118 L 24 118"
                stroke="#D4AF37"
                strokeWidth="1.8"
                strokeOpacity="0.8"
                markerEnd="url(#goldArrowLeft)"
              />
            </svg>

            {/* Right-Side Gold Return Bracket Connector (matches Holy Spirit concept drawing) */}
            <svg
              className="hidden xl:block pointer-events-none absolute right-0 top-24 bottom-16 w-7 h-[calc(100%-10rem)]"
              viewBox="0 0 28 500"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <marker id="goldArrowRight" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#E5C158" />
                </marker>
              </defs>
              <path
                d="M 2 118 L 18 118 Q 24 118 24 126 L 24 382 Q 24 390 18 390 L 4 390"
                stroke="#D4AF37"
                strokeWidth="1.8"
                strokeOpacity="0.8"
                markerEnd="url(#goldArrowRight)"
              />
            </svg>

            {/* 3-Column Master Architectural Layout with Interconnectivity Stepped Arrows */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {blueprint.columns.map((col, colIdx) => (
                <div key={col.id} className="relative flex flex-col">
                  {/* Top Gold Pillar Icon */}
                  <div className="flex justify-center mb-3">{renderColumnIcon(col.iconKey)}</div>

                  {/* Outer Gold-Framed Pillar Container */}
                  <div className="flex-1 rounded-xl border border-[#D4AF37]/55 bg-[#071630]/88 p-3.5 space-y-4 shadow-[0_14px_38px_rgba(0,0,0,0.5)]">
                    {/* Standardized Royal Navy & Gold Column Header Banner */}
                    <div
                      className="px-3.5 py-2.5 rounded-lg border border-[#E5C158]/65 text-center shadow-inner"
                      style={{
                        background: "linear-gradient(180deg, rgba(212,175,55,0.24) 0%, rgba(16,35,68,0.95) 100%)"
                      }}
                    >
                      <span className="font-serif text-xs sm:text-[13px] font-bold tracking-[0.14em] text-[#FDF0BE] uppercase">
                        {col.headerBanner}
                      </span>
                    </div>

                    {/* Expandable Sub-Cards inside this Pillar */}
                    <div className="space-y-3">
                      {col.cards.map((card, cardIdx) => {
                        const isCollapsed = !!collapsedCardIds[card.id];
                        const isReadMoreOpen = !!readMoreOpenIds[card.id];
                        const isMastered = !!masteredIds[card.id];
                        const isCardMenuOpen = cardDownloadMenuId === card.id;

                        return (
                          <React.Fragment key={card.id}>
                            {/* Vertical Gold Interconnectivity Connector between stacked cards inside the same pillar */}
                            {cardIdx > 0 && (
                              <div className="flex justify-center -my-1.5">
                                <svg width="24" height="22" viewBox="0 0 24 22" fill="none">
                                  <line x1="12" y1="0" x2="12" y2="16" stroke="#D4AF37" strokeWidth="1.8" strokeOpacity="0.85" />
                                  <polygon points="7,14 17,14 12,21" fill="#E5C158" />
                                </svg>
                              </div>
                            )}

                            <div
                              className={`rounded-xl border transition-all ${
                                isMastered
                                  ? "border-[#F6E29B] bg-[#0B2042]/95 shadow-[0_0_22px_rgba(229,193,88,0.22)]"
                                  : "border-[#D4AF37]/45 bg-[#081936]/95"
                              }`}
                            >
                              {/* Card Title Bar + Clickable Gold Verses + Collapse Chevron */}
                              <div className="p-3.5 border-b border-[#D4AF37]/25 bg-[#0C2144]/80 rounded-t-xl">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-serif text-sm font-bold tracking-wider text-[#F6E29B] uppercase">
                                    {card.title}
                                  </h3>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => toggleMastered(card.id)}
                                      title={isMastered ? "Marked as Mastered" : "Mark Pillar as Mastered"}
                                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                                        isMastered
                                          ? "text-[#FDF0BE] bg-[#D4AF37]/30"
                                          : "text-[#7A8FB3] hover:text-[#FDF0BE]"
                                      }`}
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCollapsedCardIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                                      }
                                      title={isCollapsed ? "Expand Card" : "Collapse Card"}
                                      className="p-1 rounded-md text-[#9FB0CD] hover:text-[#FDF0BE] cursor-pointer"
                                    >
                                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>

                                {/* Clickable Gold Anchor Verses Strip */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  {card.verses.map((v) => (
                                    <button
                                      key={v}
                                      type="button"
                                      onClick={() => handleOpenVersePopup(v)}
                                      className="text-[11px] font-mono text-[#F6E29B] hover:text-[#081326] bg-[#061329]/90 hover:bg-[#E5C158] border border-[#D4AF37]/45 hover:border-[#FDF0BE] px-2 py-0.5 rounded transition-colors cursor-pointer"
                                    >
                                      {v}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Card Body */}
                              {!isCollapsed && (
                                <div className="p-3.5 space-y-3 text-left">
                                  {/* MAIN POINTS */}
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9FB0CD]">
                                      Main Points:
                                    </span>
                                    <ul className="space-y-1 text-xs text-[#E5EBF5] leading-relaxed list-disc pl-4">
                                      {card.mainPoints.map((pt, i) => (
                                        <li key={i}>{pt}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* DOCTRINAL KEY */}
                                  <div className="pt-1.5 border-t border-[#D4AF37]/20">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9FB0CD] block">
                                      Doctrinal Key:
                                    </span>
                                    <p className="text-xs font-mono font-bold tracking-wide text-[#F3D77D] uppercase mt-0.5">
                                      {card.doctrinalKey}
                                    </p>
                                  </div>

                                  {/* NOTES */}
                                  <div className="pt-1.5 border-t border-[#D4AF37]/20">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9FB0CD] block">
                                      Notes:
                                    </span>
                                    <p className="text-xs text-[#CFD9EC] leading-relaxed mt-0.5">
                                      {card.pastoralNote}
                                    </p>
                                  </div>

                                  {/* EXPANDED DEEP CONTENT WHEN "READ MORE" IS CLICKED */}
                                  <AnimatePresence>
                                    {isReadMoreOpen && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 pt-3 border-t border-[#D4AF37]/35 space-y-3 text-xs">
                                          {/* Comprehensive Exegetical Notes */}
                                          <div className="p-2.5 rounded-lg bg-[#051024]/90 border border-[#D4AF37]/30 space-y-1">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C158] flex items-center gap-1">
                                              <Sparkles className="w-3 h-3" />
                                              Comprehensive Exegetical Notes
                                            </span>
                                            <p className="text-[#E6ECF7] leading-relaxed">{card.deepNotes}</p>
                                          </div>

                                          {/* Additional Context */}
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5C158] block">
                                              Additional Context (Great Controversy Lens)
                                            </span>
                                            <p className="text-[#CFD9EC] leading-relaxed">{card.additionalContext}</p>
                                          </div>

                                          {/* Practical Application Breakdown */}
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F3D77D] block">
                                              Practical Application
                                            </span>
                                            <ul className="space-y-1 text-[#E6ECF7] list-disc pl-4 leading-relaxed">
                                              {card.practicalApplication.map((app, i) => (
                                                <li key={i}>{app}</li>
                                              ))}
                                            </ul>
                                          </div>

                                          {/* Spirit of Prophecy Quote */}
                                          <div className="p-2.5 rounded-lg bg-[#0B223C]/85 border-l-2 border-[#E5C158] space-y-1">
                                            <p className="italic text-[#F3EFE6] leading-relaxed">
                                              “{card.spiritOfProphecy.quote}”
                                            </p>
                                            <span className="text-[10px] font-mono text-[#E5C158] block">
                                              — Ellen G. White, {card.spiritOfProphecy.source}
                                            </span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Card Footer: READ MORE + Quick Notebook Save + Per-Card Document Download (PDF/DOC) + Open Reader */}
                                  <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-[#D4AF37]/20">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReadMoreOpenIds((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
                                      }
                                      className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                                        isReadMoreOpen
                                          ? "bg-[#E5C158] text-[#081326] border-[#FDF0BE]"
                                          : "bg-[#1A2D4F]/75 text-[#F3D77D] border-[#D4AF37]/55 hover:bg-[#D4AF37]/25"
                                      }`}
                                    >
                                      {isReadMoreOpen ? "Show Less" : "Read More"}
                                    </button>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveCardToNotebook(card)}
                                        title="Save Pillar Notes to Notebook"
                                        className="p-1.5 rounded-md text-[#9FB0CD] hover:text-[#F3D77D] hover:bg-white/5 transition-colors cursor-pointer"
                                      >
                                        {savedToastId === card.id ? (
                                          <Check className="w-3.5 h-3.5 text-[#F6E29B]" />
                                        ) : (
                                          <FilePlus2 className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      {/* Per-Card Document Download Button with PDF / DOC Dropdown */}
                                      <div className="relative" data-card-download-menu="true">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setCardDownloadMenuId((cur) => (cur === card.id ? null : card.id))
                                          }
                                          title="Download Pillar Card (PDF or DOC)"
                                          className="p-1.5 rounded-md text-[#9FB0CD] hover:text-[#F3D77D] hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                        </button>

                                        <AnimatePresence>
                                          {isCardMenuOpen && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 4, scale: 0.96 }}
                                              animate={{ opacity: 1, y: 0, scale: 1 }}
                                              exit={{ opacity: 0, y: 4, scale: 0.96 }}
                                              transition={{ duration: 0.12 }}
                                              className="absolute right-0 bottom-full mb-1.5 w-44 rounded-lg bg-[#071630] border border-[#E5C158]/60 shadow-2xl overflow-hidden z-40"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  exportBlueprintAsPdf(blueprint, {
                                                    columnTitle: col.headerBanner,
                                                    card
                                                  });
                                                  setCardDownloadMenuId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold text-[#FDF0BE] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
                                              >
                                                <FileDown className="w-3.5 h-3.5 text-[#E5C158]" />
                                                <span>Download PDF</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  exportBlueprintAsDoc(blueprint, {
                                                    columnTitle: col.headerBanner,
                                                    card
                                                  });
                                                  setCardDownloadMenuId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-semibold text-[#FDF0BE] hover:bg-[#D4AF37]/20 transition-colors border-t border-[#D4AF37]/15 cursor-pointer"
                                              >
                                                <FileText className="w-3.5 h-3.5 text-[#E5C158]" />
                                                <span>Download DOC</span>
                                              </button>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => onLaunchBibleStudy(card.verses[0] || node.anchorRefs[0], card.title)}
                                        title={`Study ${card.verses[0]} in Split Bible Reader`}
                                        className="p-1.5 rounded-md text-[#9FB0CD] hover:text-[#F3D77D] hover:bg-white/5 transition-colors cursor-pointer"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stepped Interconnectivity Gold Arrows connecting Column 1 -> Column 2 -> Column 3 on desktop */}
                  {colIdx < 2 && (
                    <div className="hidden lg:block pointer-events-none absolute -right-8 top-24 bottom-8 w-8 z-10">
                      <svg
                        width="32"
                        height="100%"
                        viewBox="0 0 32 420"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <defs>
                          <marker
                            id={`goldColArrow-${colIdx}`}
                            viewBox="0 0 10 10"
                            refX="7"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto"
                          >
                            <path d="M 0 1 L 10 5 L 0 9 z" fill="#E5C158" />
                          </marker>
                        </defs>
                        {/* Upper-to-Upper & Lower-to-Upper stepped interconnectivity flow */}
                        {colIdx === 0 ? (
                          <>
                            <path
                              d="M 2 340 L 14 340 Q 17 340 17 332 L 17 118 Q 17 110 21 110 L 28 110"
                              stroke="#E5C158"
                              strokeWidth="2"
                              strokeOpacity="0.9"
                              markerEnd={`url(#goldColArrow-${colIdx})`}
                            />
                            <path
                              d="M 2 365 L 28 365"
                              stroke="#D4AF37"
                              strokeWidth="1.8"
                              strokeOpacity="0.75"
                              markerEnd={`url(#goldColArrow-${colIdx})`}
                            />
                          </>
                        ) : (
                          <>
                            <path
                              d="M 2 110 L 28 110"
                              stroke="#E5C158"
                              strokeWidth="2"
                              strokeOpacity="0.9"
                              markerEnd={`url(#goldColArrow-${colIdx})`}
                            />
                            <path
                              d="M 2 110 L 14 110 Q 17 110 17 118 L 17 332 Q 17 340 21 340 L 28 340"
                              stroke="#D4AF37"
                              strokeWidth="1.8"
                              strokeOpacity="0.85"
                              markerEnd={`url(#goldColArrow-${colIdx})`}
                            />
                          </>
                        )}
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Inline Live KJV Verse Pop-up inside Full-Screen Blueprint */}
      <AnimatePresence>
        {versePopup && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[440px] p-4 rounded-2xl bg-[#07152E]/98 border border-[#E5C158]/70 shadow-2xl backdrop-blur-md z-50"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#F3D77D]">
                <Bookmark className="w-3.5 h-3.5" />
                {versePopup.reference} (KJV)
              </span>
              <button
                type="button"
                onClick={() => setVersePopup(null)}
                className="text-[#8FA2C2] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#EFE9DC] leading-relaxed italic border-l-2 border-[#D4AF37] pl-3 my-2">
              “{versePopup.text}”
            </p>
            <button
              type="button"
              onClick={() => onLaunchBibleStudy(versePopup.reference, node.label)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#081326] bg-[#E5C158] hover:bg-[#F3D77D] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Split Bible Study</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass,
  Network,
  Layers,
  BookOpen,
  Sparkles,
  Flame,
  Shield,
  Crown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  X,
  CheckCircle2,
  Bookmark,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2
} from "lucide-react";
import {
  TRACK_BLUEPRINTS,
  TRACK_BLUEPRINT_ORDER,
  BlueprintPillarChip,
  ConstellationDoctrineNode,
  ConstellationScriptureNode,
  ConstellationPortalNode
} from "../../data/doctrineBlueprintGraph";
import { DEFAULT_DOCTRINE_TRACKS } from "../../data/doctrineTracksDb";

export type BlueprintStage = "overview" | "constellation" | "blueprint";

interface DoctrineBlueprintEngineProps {
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onLaunchBibleStudy: (reference: string, topic: string) => void;
}

const renderChipIcon = (iconKey: BlueprintPillarChip["iconKey"]) => {
  switch (iconKey) {
    case "flame":
      return <Flame className="w-4 h-4 text-[#E5C158]" />;
    case "shield":
      return <Shield className="w-4 h-4 text-[#E5C158]" />;
    case "book":
      return <BookOpen className="w-4 h-4 text-[#E5C158]" />;
    case "compass":
      return <Compass className="w-4 h-4 text-[#E5C158]" />;
    case "crown":
      return <Crown className="w-4 h-4 text-[#E5C158]" />;
    case "sparkles":
    default:
      return <Sparkles className="w-4 h-4 text-[#E5C158]" />;
  }
};

/** Sacred Geometric Gold Hexagonal Emblem inspired by the Stage 1 Hero Visual */
const SacredGeometricEmblem: React.FC = () => (
  <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto flex items-center justify-center select-none">
    <div
      className="absolute inset-0 rounded-full blur-2xl opacity-45 pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(229,193,88,0.55) 0%, rgba(201,151,58,0.12) 55%, transparent 75%)"
      }}
    />
    <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 drop-shadow-[0_0_18px_rgba(212,175,55,0.45)]">
      <defs>
        <linearGradient id="stbaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F6E29B" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#A67C23" />
        </linearGradient>
        <linearGradient id="stbaNavyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#122647" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#071124" stopOpacity="0.96" />
        </linearGradient>
      </defs>
      {/* Outer & inner sacred hexagon */}
      <polygon
        points="60,8 106,34 106,86 60,112 14,86 14,34"
        fill="url(#stbaNavyGrad)"
        stroke="url(#stbaGoldGrad)"
        strokeWidth="2"
      />
      <polygon
        points="60,15 100,38 100,82 60,105 20,82 20,38"
        fill="none"
        stroke="url(#stbaGoldGrad)"
        strokeWidth="0.8"
        strokeOpacity="0.55"
      />
      {/* Faceted geometric rays */}
      <line x1="60" y1="8" x2="60" y2="112" stroke="url(#stbaGoldGrad)" strokeWidth="0.6" strokeOpacity="0.35" />
      <line x1="14" y1="34" x2="106" y2="86" stroke="url(#stbaGoldGrad)" strokeWidth="0.6" strokeOpacity="0.28" />
      <line x1="106" y1="34" x2="14" y2="86" stroke="url(#stbaGoldGrad)" strokeWidth="0.6" strokeOpacity="0.28" />
      {/* Central Cross */}
      <line x1="60" y1="28" x2="60" y2="76" stroke="url(#stbaGoldGrad)" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="46" y1="44" x2="74" y2="44" stroke="url(#stbaGoldGrad)" strokeWidth="3.2" strokeLinecap="round" />
      {/* Flowing Spirit ribbon / flame at base */}
      <path
        d="M60 95 C49 84, 52 72, 60 64 C68 72, 71 84, 60 95 Z"
        fill="url(#stbaGoldGrad)"
        fillOpacity="0.25"
        stroke="url(#stbaGoldGrad)"
        strokeWidth="1.4"
      />
      {/* Olive branch accents left & right */}
      <path d="M30 74 Q36 60 44 54" fill="none" stroke="url(#stbaGoldGrad)" strokeWidth="1.2" strokeOpacity="0.8" />
      <ellipse cx="34" cy="64" rx="3.5" ry="1.8" transform="rotate(-35 34 64)" fill="url(#stbaGoldGrad)" fillOpacity="0.8" />
      <ellipse cx="39" cy="58" rx="3.5" ry="1.8" transform="rotate(-35 39 58)" fill="url(#stbaGoldGrad)" fillOpacity="0.8" />
      <path d="M90 74 Q84 60 76 54" fill="none" stroke="url(#stbaGoldGrad)" strokeWidth="1.2" strokeOpacity="0.8" />
      <ellipse cx="86" cy="64" rx="3.5" ry="1.8" transform="rotate(35 86 64)" fill="url(#stbaGoldGrad)" fillOpacity="0.8" />
      <ellipse cx="81" cy="58" rx="3.5" ry="1.8" transform="rotate(35 81 58)" fill="url(#stbaGoldGrad)" fillOpacity="0.8" />
    </svg>
  </div>
);

export const DoctrineBlueprintEngine: React.FC<DoctrineBlueprintEngineProps> = ({
  selectedTrackId,
  onSelectTrack,
  onLaunchBibleStudy
}) => {
  const [stage, setStage] = useState<BlueprintStage>("overview");
  const activeSpec = TRACK_BLUEPRINTS[selectedTrackId] || TRACK_BLUEPRINTS["fundamental-beliefs"];
  const activeTrackDb = DEFAULT_DOCTRINE_TRACKS[selectedTrackId] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];

  // Stage 2 Interactive Constellation state (Progressive Multi-Ring Revelation + Pan & Zoom + Smooth Portal Zoom-Recenter)
  const [focusedNodeId, setFocusedNodeId] = useState<string>(activeSpec.nodes[0]?.id || "");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [previewScripture, setPreviewScripture] = useState<ConstellationScriptureNode | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([activeSpec.shortTitle]);
  const [revealRing, setRevealRing] = useState<number>(0); // 0 = Core Pillar only, 1..maxRing = progressively built outward
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [portalTransitionLabel, setPortalTransitionLabel] = useState<string | null>(null);
  const panStartRef = React.useRef<{ x: number; y: number; origX: number; origY: number } | null>(null);

  const maxRing = useMemo(() => {
    let m = 1;
    for (const n of activeSpec.nodes) {
      if (typeof n.ring === "number" && n.ring > m) m = n.ring;
    }
    return m;
  }, [activeSpec]);

  const constellationExpanded = revealRing > 0;
  const isNodeVisible = (node: ConstellationDoctrineNode) => {
    if (node.isHub) return true;
    const r = typeof node.ring === "number" ? node.ring : 1;
    return r <= revealRing;
  };
  const visibleNodeCount = useMemo(
    () => activeSpec.nodes.filter((n) => isNodeVisible(n)).length,
    [activeSpec, revealRing]
  );

  // Keep focused node & progressive revelation synced when track changes
  React.useEffect(() => {
    const hub = activeSpec.nodes.find((n) => n.isHub) || activeSpec.nodes[0];
    setFocusedNodeId(hub?.id || "");
    setPreviewScripture(null);
    setRevealRing(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPortalTransitionLabel(null);
    setBreadcrumbPath((prev) => (prev.length > 1 && stage === "constellation" ? [activeSpec.shortTitle, hub?.label || ""] : [activeSpec.shortTitle]));
  }, [selectedTrackId]);

  // Lock body scroll & allow ESC to exit dedicated full-screen Stage 2 constellation
  React.useEffect(() => {
    if (stage !== "constellation") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewScripture) {
          setPreviewScripture(null);
        } else {
          setStage("overview");
          setBreadcrumbPath([activeSpec.shortTitle]);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [stage, previewScripture, activeSpec.shortTitle]);

  const handleResetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((z) => Math.min(2.2, Math.max(0.55, Number((z + delta).toFixed(2)))));
  };

  const handlePointerDownCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    // Only pan when dragging background (not clicking a node)
    if ((e.target as HTMLElement).closest("[data-constellation-node='true']")) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY, origX: pan.x, origY: pan.y };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPanning || !panStartRef.current) return;
    const dx = (e.clientX - panStartRef.current.x) / zoom;
    const dy = (e.clientY - panStartRef.current.y) / zoom;
    setPan({ x: panStartRef.current.origX + dx, y: panStartRef.current.origY + dy });
  };

  const handlePointerUpCanvas = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Smooth zoom-and-recenter transition into target doctrine portal as new central pillar
  const handlePortalTransition = (portal: ConstellationPortalNode) => {
    setPreviewScripture(null);
    setPortalTransitionLabel(portal.label);
    setZoom(1.55);
    setPan({ x: 500 - portal.x, y: 300 - portal.y });
    setTimeout(() => {
      onSelectTrack(portal.targetTrackId);
      setStage("constellation");
    }, 360);
  };

  const focusedNode: ConstellationDoctrineNode = useMemo(() => {
    return activeSpec.nodes.find((n) => n.id === focusedNodeId) || activeSpec.nodes[0];
  }, [activeSpec, focusedNodeId]);

  const activeHighlightId = hoveredNodeId || focusedNodeId;

  const isEdgeHighlighted = (aId: string, bId: string) => {
    if (!activeHighlightId) return false;
    return aId === activeHighlightId || bId === activeHighlightId;
  };

  const isNodeConnectedToHighlight = (nodeId: string) => {
    if (!activeHighlightId) return false;
    if (nodeId === activeHighlightId) return true;
    const target = activeSpec.nodes.find((n) => n.id === activeHighlightId);
    return !!target?.connectedTo.includes(nodeId);
  };

  const handleSelectTrackCard = (trackId: string) => {
    onSelectTrack(trackId);
    const nextSpec = TRACK_BLUEPRINTS[trackId];
    if (nextSpec) {
      setBreadcrumbPath([nextSpec.shortTitle]);
    }
  };

  const handleEnterConstellation = () => {
    const hub = activeSpec.nodes.find((n) => n.isHub) || activeSpec.nodes[0];
    setFocusedNodeId(hub.id);
    setRevealRing(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBreadcrumbPath([activeSpec.shortTitle, hub.label]);
    setStage("constellation");
  };

  const handleConstellationNodeClick = (node: ConstellationDoctrineNode) => {
    setPreviewScripture(null);
    // Progressive Revelation: clicking the central core pillar builds & connects the next ring until all beliefs are revealed!
    if (node.isHub && revealRing < maxRing) {
      setRevealRing((r) => Math.min(maxRing, r + 1));
      setFocusedNodeId(node.id);
      setBreadcrumbPath([activeSpec.shortTitle, node.label]);
      return;
    }
    if (focusedNodeId === node.id) {
      // Second click on already-focused node drills smoothly into Stage 3 Architectural View
      setBreadcrumbPath([activeSpec.shortTitle, node.label, "Architectural Blueprint"]);
      setStage("blueprint");
      return;
    }
    setFocusedNodeId(node.id);
    setBreadcrumbPath([activeSpec.shortTitle, node.label]);
  };

  const handleOpenBlueprint = () => {
    setBreadcrumbPath([activeSpec.shortTitle, focusedNode.label, "Architectural Blueprint"]);
    setStage("blueprint");
  };

  const currentTrackIdx = TRACK_BLUEPRINT_ORDER.indexOf(selectedTrackId as any);
  const handleCycleTrack = (dir: -1 | 1) => {
    const nextIdx = (currentTrackIdx + dir + TRACK_BLUEPRINT_ORDER.length) % TRACK_BLUEPRINT_ORDER.length;
    handleSelectTrackCard(TRACK_BLUEPRINT_ORDER[nextIdx]);
  };

  // Deduplicate doctrine-to-doctrine edges for SVG rendering
  const doctrineEdges = useMemo(() => {
    const seen = new Set<string>();
    const list: { from: ConstellationDoctrineNode; to: ConstellationDoctrineNode; key: string }[] = [];
    for (const node of activeSpec.nodes) {
      for (const targetId of node.connectedTo) {
        const target = activeSpec.nodes.find((n) => n.id === targetId);
        if (!target) continue;
        const pairKey = [node.id, target.id].sort().join("--");
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);
        list.push({ from: node, to: target, key: pairKey });
      }
    }
    return list;
  }, [activeSpec]);

  // Dedicated Full-Screen Stage 2 Constellation Portal (rendered outside AnimatePresence so portals mount cleanly)
  const fullScreenConstellationOverlay =
    stage === "constellation" && typeof document !== "undefined"
      ? createPortal(
          <div
            key={`constellation-fullscreen-${selectedTrackId}`}
            className="fixed inset-0 z-[9999] flex flex-col text-[#F4EFE4] overflow-hidden"
            style={{
              width: "100vw",
              height: "100vh",
              background:
                "radial-gradient(circle at 75% 18%, rgba(212,175,55,0.16) 0%, transparent 40%), radial-gradient(circle at 18% 82%, rgba(180,120,45,0.14) 0%, transparent 45%), linear-gradient(160deg, #040914 0%, #09152B 50%, #050E20 100%)"
            }}
          >
            {/* Full-screen starfield texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(1.5px 1.5px at 14% 22%, #F6E29B 50%, transparent 100%), radial-gradient(1px 1px at 32% 74%, #FFFFFF 50%, transparent 100%), radial-gradient(1.5px 1.5px at 68% 18%, #F6E29B 50%, transparent 100%), radial-gradient(1px 1px at 84% 46%, #FFFFFF 50%, transparent 100%), radial-gradient(1.2px 1.2px at 54% 86%, #E5C158 50%, transparent 100%), radial-gradient(1px 1px at 22% 48%, #FFFFFF 50%, transparent 100%), radial-gradient(1.5px 1.5px at 90% 15%, #F6E29B 50%, transparent 100%)"
              }}
            />

            {/* Full-Viewport Constellation SVG Canvas */}
            <div className="relative flex-1 min-h-0 w-full overflow-hidden">
              {/* Floating Top-Left: Exit Full-Screen + Breadcrumb + Progressive Counter HUD */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-260px)]">
                <button
                  type="button"
                  onClick={() => {
                    setStage("overview");
                    setBreadcrumbPath([activeSpec.shortTitle]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071328]/90 border border-[#D4AF37]/40 text-xs font-semibold text-[#FDF0BE] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer shadow-lg backdrop-blur-md"
                >
                  <ChevronLeft className="w-4 h-4 text-[#E5C158]" />
                  <span>Exit Map</span>
                </button>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[#B7C5DE] bg-[#071328]/85 px-3.5 py-2 rounded-xl border border-[#D4AF37]/30 backdrop-blur-md shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                  <span className="text-[#FDF0BE] font-bold">{activeSpec.shortTitle}</span>
                  <span className="text-[#D4AF37]/50">•</span>
                  <span className="text-[#F3D77D] font-bold">
                    {visibleNodeCount}/{activeSpec.nodes.length}
                  </span>
                  <span className="hidden lg:inline text-[#9FB0CD]">
                    {revealRing === 0
                      ? `— Click ${activeSpec.nodes[0]?.label || "Core Pillar"} to radiate truths outward`
                      : revealRing < maxRing
                        ? `— Click ${activeSpec.nodes[0]?.label} again for Ring ${revealRing + 1}/${maxRing}`
                        : "— Drag to pan • Scroll to zoom • Click teal portals to cross doctrines"}
                  </span>
                </div>
              </div>

              {/* Portal Zoom-and-Recenter Transition Overlay */}
              <AnimatePresence>
                {portalTransitionLabel && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex items-center justify-center bg-[#040B1A]/60 backdrop-blur-xs pointer-events-none"
                  >
                    <div className="px-5 py-2.5 rounded-full bg-[#091F36]/95 border border-[#5EEAD4]/60 text-[#99F6E4] font-mono text-xs tracking-wider shadow-[0_0_25px_rgba(45,212,191,0.35)]">
                      Entering Portal → {portalTransitionLabel}…
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Isolated Floating Top-Right Pan & Zoom + Progressive Ring Build Controls */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-[#071328]/90 border border-[#D4AF37]/35 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setRevealRing((r) => (r < maxRing ? maxRing : 0))}
                  title={revealRing < maxRing ? `Reveal All ${activeSpec.nodes.length} Nodes` : "Collapse to Core Pillar"}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold text-[#F6E29B] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {revealRing < maxRing ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">
                    {revealRing < maxRing ? `Build All (${activeSpec.nodes.length})` : "Core"}
                  </span>
                </button>
                <div className="w-px h-4 bg-[#D4AF37]/25" />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                  title="Zoom In"
                  className="p-1.5 rounded-lg text-[#CFD9EC] hover:text-[#FDF0BE] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-[#9FB0CD] px-1 min-w-[40px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.55, Number((z - 0.2).toFixed(2))))}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg text-[#CFD9EC] hover:text-[#FDF0BE] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetViewport}
                  title="Reset Pan & Zoom"
                  className="p-1.5 rounded-lg text-[#CFD9EC] hover:text-[#FDF0BE] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <svg
                viewBox="0 0 1000 600"
                preserveAspectRatio="xMidYMid meet"
                onWheel={handleWheelZoom}
                onPointerDown={handlePointerDownCanvas}
                onPointerMove={handlePointerMoveCanvas}
                onPointerUp={handlePointerUpCanvas}
                onPointerLeave={handlePointerUpCanvas}
                className={`w-full h-full block select-none touch-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
                role="img"
                aria-label={`${activeSpec.shortTitle} Full-Screen Interactive Doctrine Constellation`}
              >
                <defs>
                  <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF5C8" stopOpacity="1" />
                    <stop offset="40%" stopColor="#E5C158" stopOpacity="0.9" />
                    <stop offset="75%" stopColor="#C9973A" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#C9973A" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#2DD4BF" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                  </radialGradient>
                  <filter id="goldSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Interactive Pan & Zoom Group */}
                <g
                  transform={`translate(${500 + pan.x}, ${300 + pan.y}) scale(${zoom}) translate(-500, -300)`}
                  style={{ transition: isPanning ? "none" : "transform 340ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                >
                  {/* Concentric astrolabe rings */}
                  <circle cx="500" cy="300" r="135" fill="none" stroke="#D4AF37" strokeOpacity="0.12" strokeDasharray="4 6" />
                  <circle cx="500" cy="300" r="240" fill="none" stroke="#D4AF37" strokeOpacity="0.09" strokeDasharray="3 8" />
                  <circle cx="500" cy="300" r="345" fill="none" stroke="#D4AF37" strokeOpacity="0.07" strokeDasharray="2 10" />

                  {/* 1. Doctrine-to-Doctrine Connectors */}
                  {doctrineEdges
                    .filter(({ from, to }) => isNodeVisible(from) && isNodeVisible(to))
                    .map(({ from, to, key }) => {
                      const highlighted = isEdgeHighlighted(from.id, to.id);
                      return (
                        <motion.line
                          key={key}
                          initial={{ x1: 500, y1: 300, x2: 500, y2: 300, opacity: 0 }}
                          animate={{ x1: from.x, y1: from.y, x2: to.x, y2: to.y, opacity: highlighted ? 0.95 : 0.38 }}
                          transition={{ type: "spring", stiffness: 120, damping: 18 }}
                          stroke={highlighted ? "#F3D77D" : "#5D7499"}
                          strokeWidth={highlighted ? 2.2 : 1.1}
                          filter={highlighted ? "url(#goldSoftGlow)" : undefined}
                        />
                      );
                    })}

                  {/* 2. Outer Scripture Anchor Connectors */}
                  {activeSpec.scriptureNodes.map((sn) => {
                    const parent = activeSpec.nodes.find((n) => n.id === sn.parentNodeId);
                    if (!parent || !isNodeVisible(parent)) return null;
                    const highlighted = activeHighlightId === parent.id || previewScripture?.id === sn.id;
                    return (
                      <motion.line
                        key={`edge-${sn.id}`}
                        initial={{ x1: 500, y1: 300, x2: 500, y2: 300, opacity: 0 }}
                        animate={{ x1: parent.x, y1: parent.y, x2: sn.x, y2: sn.y, opacity: highlighted ? 0.92 : 0.38 }}
                        transition={{ type: "spring", stiffness: 110, damping: 18, delay: 0.08 }}
                        stroke={highlighted ? "#E5C158" : "#4A6187"}
                        strokeWidth={highlighted ? 1.8 : 1}
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* 3. Outer Perimeter Cross-Doctrine Portal Bridge Edges (Dashed Teal) */}
                  {(activeSpec.portalNodes || []).map((portal) => {
                    const parent = activeSpec.nodes.find((n) => n.id === portal.fromNodeId);
                    if (!parent || !isNodeVisible(parent)) return null;
                    const highlighted = activeHighlightId === parent.id;
                    return (
                      <motion.line
                        key={`portal-edge-${portal.id}`}
                        initial={{ x1: 500, y1: 300, x2: 500, y2: 300, opacity: 0 }}
                        animate={{ x1: parent.x, y1: parent.y, x2: portal.x, y2: portal.y, opacity: highlighted ? 0.95 : 0.65 }}
                        transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.14 }}
                        stroke="#2DD4BF"
                        strokeWidth={highlighted ? 2.2 : 1.4}
                        strokeDasharray="6 5"
                      />
                    );
                  })}

                  {/* 4. Outer Scripture Anchor Nodes */}
                  {activeSpec.scriptureNodes.map((sn) => {
                    const parent = activeSpec.nodes.find((n) => n.id === sn.parentNodeId);
                    if (!parent || !isNodeVisible(parent)) return null;
                    const isSelectedRef = previewScripture?.id === sn.id;
                    const parentHighlighted = activeHighlightId === sn.parentNodeId;
                    return (
                      <motion.g
                        key={sn.id}
                        data-constellation-node="true"
                        initial={{ x: 500 - sn.x, y: 300 - sn.y, opacity: 0, scale: 0.4 }}
                        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewScripture(sn);
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={sn.x}
                          cy={sn.y}
                          r={isSelectedRef ? 10 : 7}
                          fill={isSelectedRef || parentHighlighted ? "#E5C158" : "#15294A"}
                          stroke="#F3D77D"
                          strokeWidth={isSelectedRef ? 2.2 : 1.3}
                          filter={isSelectedRef ? "url(#goldSoftGlow)" : undefined}
                        />
                        <text
                          x={sn.x}
                          y={sn.y + 21}
                          textAnchor="middle"
                          fill={isSelectedRef || parentHighlighted ? "#FDF0BE" : "#A7B8D4"}
                          fontSize="10.5"
                          fontFamily="monospace"
                          fontWeight={isSelectedRef ? "700" : "500"}
                        >
                          {sn.reference}
                        </text>
                      </motion.g>
                    );
                  })}

                  {/* 5. Outer Perimeter Cross-Doctrine Portal Nodes */}
                  {(activeSpec.portalNodes || []).map((portal) => {
                    const parent = activeSpec.nodes.find((n) => n.id === portal.fromNodeId);
                    if (!parent || !isNodeVisible(parent)) return null;
                    return (
                      <motion.g
                        key={portal.id}
                        data-constellation-node="true"
                        initial={{ x: 500 - portal.x, y: 300 - portal.y, opacity: 0, scale: 0.4 }}
                        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.16 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePortalTransition(portal);
                        }}
                        className="cursor-pointer"
                      >
                        <circle cx={portal.x} cy={portal.y} r="22" fill="url(#portalGlow)" opacity="0.55" />
                        <polygon
                          points={`${portal.x},${portal.y - 11} ${portal.x + 11},${portal.y} ${portal.x},${portal.y + 11} ${portal.x - 11},${portal.y}`}
                          fill="#0B2A3A"
                          stroke="#5EEAD4"
                          strokeWidth="2"
                        />
                        <circle cx={portal.x} cy={portal.y} r="3.2" fill="#F3D77D" />
                        <text
                          x={portal.x}
                          y={portal.y + 24}
                          textAnchor="middle"
                          fill="#99F6E4"
                          fontSize="10.5"
                          fontWeight="700"
                        >
                          ↗ {portal.label}
                        </text>
                        <text
                          x={portal.x}
                          y={portal.y + 36}
                          textAnchor="middle"
                          fill="#5EEAD4"
                          fillOpacity="0.8"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {portal.relationTag}
                        </text>
                      </motion.g>
                    );
                  })}

                  {/* 6. Primary Doctrine Nodes & Central Core Hub */}
                  {activeSpec.nodes.map((node) => {
                    if (!isNodeVisible(node)) return null;
                    const isFocused = focusedNodeId === node.id;
                    const isConnected = isNodeConnectedToHighlight(node.id);
                    const isDense = activeSpec.nodes.length > 10;
                    const radius = node.isHub
                      ? constellationExpanded
                        ? isDense
                          ? 20
                          : 24
                        : 32
                      : isFocused
                        ? isDense
                          ? 14
                          : 18
                        : isDense
                          ? 10.5
                          : 14;
                    return (
                      <motion.g
                        key={node.id}
                        data-constellation-node="true"
                        initial={node.isHub ? { opacity: 1, scale: 1 } : { x: 500 - node.x, y: 300 - node.y, opacity: 0, scale: 0.35 }}
                        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 130, damping: 17 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConstellationNodeClick(node);
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer"
                      >
                        {(node.isHub || isFocused) && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.isHub ? (constellationExpanded ? 44 : 72) : isDense ? 26 : 34}
                            fill="url(#hubGlow)"
                            opacity={isFocused ? 0.95 : 0.7}
                          />
                        )}
                        {node.isHub && revealRing < maxRing && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={constellationExpanded ? 32 : 46}
                            fill="none"
                            stroke="#F3D77D"
                            strokeWidth="1.5"
                            strokeOpacity="0.65"
                            strokeDasharray="5 5"
                          />
                        )}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius}
                          fill={node.isHub || isFocused ? "#E5C158" : isConnected ? "#19345F" : "#0D1E3B"}
                          stroke={isFocused || isConnected || node.isHub ? "#FDF0BE" : "#4A6187"}
                          strokeWidth={isFocused || node.isHub ? 2.4 : 1.4}
                          filter={isFocused || node.isHub ? "url(#goldSoftGlow)" : undefined}
                        />
                        <text
                          x={node.x}
                          y={node.y + (node.isHub ? (constellationExpanded ? 36 : 54) : isDense ? 24 : 32)}
                          textAnchor="middle"
                          fill={isFocused || node.isHub ? "#FDF0BE" : isConnected ? "#FFFFFF" : "#B7C5DE"}
                          fontSize={node.isHub ? (constellationExpanded ? (isDense ? "13" : "15") : "18") : isDense ? "10.5" : "13"}
                          fontWeight={isFocused || node.isHub ? "700" : "600"}
                        >
                          {node.label}
                        </text>
                        <text
                          x={node.x}
                          y={node.y + (node.isHub ? (constellationExpanded ? 49 : 72) : isDense ? 35 : 46)}
                          textAnchor="middle"
                          fill={node.isHub && revealRing < maxRing ? "#F3D77D" : "#8FA2C2"}
                          fontSize={node.isHub && !constellationExpanded ? "11.5" : isDense ? "8.5" : "10"}
                          fontFamily="monospace"
                        >
                          {node.isHub && revealRing < maxRing
                            ? revealRing === 0
                              ? "Click to Reveal Ring 1"
                              : `Click to Build Ring ${revealRing + 1}/${maxRing}`
                            : node.shortTag}
                        </text>
                      </motion.g>
                    );
                  })}
                </g>
              </svg>

              {/* Inline KJV Scripture Preview Pop-up */}
              <AnimatePresence>
                {previewScripture && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 p-4 rounded-xl bg-[#07152E]/95 border border-[#E5C158]/60 shadow-2xl backdrop-blur-md z-20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#F3D77D]">
                        <Bookmark className="w-3.5 h-3.5" />
                        {previewScripture.reference} (KJV)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewScripture(null)}
                        className="text-[#8FA2C2] hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[#EFE9DC] leading-relaxed italic border-l-2 border-[#D4AF37] pl-3 my-2">
                      “{previewScripture.verseText}”
                    </p>
                    <button
                      type="button"
                      onClick={() => onLaunchBibleStudy(previewScripture.reference, activeSpec.shortTitle)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#081326] bg-[#E5C158] hover:bg-[#F3D77D] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Split Bible Study</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Floating Bottom Focused Doctrine Inspector Dock */}
            <div className="relative z-20 mx-4 mb-4 p-4 rounded-2xl bg-[#07152E]/92 border border-[#D4AF37]/35 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F6E29B]">
                    {focusedNode.shortTag}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#FDF0BE]">{focusedNode.label}</h3>
                </div>
                <p className="text-sm text-[#CFD9EC] leading-relaxed">{focusedNode.summary}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {focusedNode.anchorRefs.map((ref) => (
                    <button
                      key={ref}
                      type="button"
                      onClick={() => onLaunchBibleStudy(ref, focusedNode.label)}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/5 border border-[#D4AF37]/30 text-[#F3D77D] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
                    >
                      {ref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStage("overview");
                    setBreadcrumbPath([activeSpec.shortTitle]);
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-[#D4AF37]/30 text-[#CFD9EC] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Back to Guide
                </button>
                <button
                  type="button"
                  onClick={handleOpenBlueprint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[#081326] shadow-[0_6px_20px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all cursor-pointer"
                  style={{ background: "linear-gradient(180deg, #F1D37A 0%, #D4AF37 100%)" }}
                >
                  <span>Open Architectural Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {fullScreenConstellationOverlay}
      <div
      className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_24px_70px_rgba(4,10,24,0.65)] text-[#F4EFE4]"
      style={{
        background:
          "radial-gradient(circle at 75% 18%, rgba(212,175,55,0.16) 0%, transparent 40%), radial-gradient(circle at 18% 82%, rgba(180,120,45,0.15) 0%, transparent 45%), linear-gradient(160deg, #050B18 0%, #0A1730 48%, #071124 100%)"
      }}
    >
      {/* Subtle cosmic starfield texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 14% 22%, #F6E29B 50%, transparent 100%), radial-gradient(1px 1px at 32% 74%, #FFFFFF 50%, transparent 100%), radial-gradient(1.5px 1.5px at 68% 18%, #F6E29B 50%, transparent 100%), radial-gradient(1px 1px at 84% 46%, #FFFFFF 50%, transparent 100%), radial-gradient(1.2px 1.2px at 54% 86%, #E5C158 50%, transparent 100%), radial-gradient(1px 1px at 22% 48%, #FFFFFF 50%, transparent 100%), radial-gradient(1.5px 1.5px at 90% 15%, #F6E29B 50%, transparent 100%)"
        }}
      />

      {/* Main layout: Slim Left Icon Rail + Active Stage Canvas */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-[640px]">
        {/* SLIM LEFT ICON RAIL (Stages 1 -> 2 -> 3) */}
        <aside className="flex md:flex-col items-center justify-between md:justify-start gap-2 px-3 py-2.5 md:py-5 md:w-16 bg-[#050C1B]/80 border-b md:border-b-0 md:border-r border-[#D4AF37]/20 shrink-0">
          <div className="flex md:flex-col items-center gap-2">
            {[
              { id: "overview" as BlueprintStage, label: "Stage 1: Overview Guide", icon: Compass },
              { id: "constellation" as BlueprintStage, label: "Stage 2: Doctrine Constellation", icon: Network },
              { id: "blueprint" as BlueprintStage, label: "Stage 3: Architectural Blueprint", icon: Layers }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = stage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStage(item.id);
                    if (item.id === "overview") setBreadcrumbPath([activeSpec.shortTitle]);
                    if (item.id === "constellation") setBreadcrumbPath([activeSpec.shortTitle, focusedNode.label]);
                    if (item.id === "blueprint") setBreadcrumbPath([activeSpec.shortTitle, focusedNode.label, "Architectural Blueprint"]);
                  }}
                  title={item.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#D4AF37]/20 border-[#E5C158] text-[#F6E29B] shadow-[0_0_16px_rgba(212,175,55,0.35)]"
                      : "bg-transparent border-transparent text-[#8FA2C2] hover:text-[#F6E29B] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div className="md:mt-auto flex md:flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onLaunchBibleStudy(activeSpec.primaryPassage, activeSpec.shortTitle)}
              title="Open Primary Passage in Split Bible Study"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8FA2C2] hover:text-[#F6E29B] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* RIGHT STAGE WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP BREADCRUMB & STAGE PROGRESS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#071226]/75 border-b border-[#D4AF37]/15">
            <div className="flex items-center gap-1.5 text-xs font-mono tracking-wide text-[#B7C5DE] flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setStage("overview");
                  setBreadcrumbPath([activeSpec.shortTitle]);
                }}
                className="text-[#E5C158] hover:underline cursor-pointer font-semibold"
              >
                Doctrine Engine
              </button>
              {breadcrumbPath.map((crumb, i) => (
                <React.Fragment key={`${crumb}-${i}`}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]/50" />
                  <span className={i === breadcrumbPath.length - 1 ? "text-white font-semibold" : "text-[#9FB0CD]"}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F3D77D]">
                {stage === "overview" && "Stage 1 • Introductory Guide"}
                {stage === "constellation" && "Stage 2 • Doctrine Node Network"}
                {stage === "blueprint" && "Stage 3 • Architectural View"}
              </span>
            </div>
          </div>

          {/* ANIMATED STAGE BODY */}
          <div className="flex-1 p-5 md:p-8 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {/* ===================================================================== */}
              {/* STAGE 1: INTRODUCTORY GUIDING PHASE + UNIFIED TRACK FOCUS CARDS        */}
              {/* ===================================================================== */}
              {stage === "overview" && (
                <motion.div
                  key={`overview-${selectedTrackId}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Hero Overview Card */}
                  <div className="relative max-w-3xl mx-auto text-center px-6 py-8 md:py-10 rounded-2xl border border-[#D4AF37]/30 bg-[#071328]/70 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                    {/* Prev / Next Track Chevrons */}
                    <button
                      type="button"
                      onClick={() => handleCycleTrack(-1)}
                      aria-label="Previous doctrine track"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0C1D3A]/80 border border-[#D4AF37]/30 text-[#E5C158] hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCycleTrack(1)}
                      aria-label="Next doctrine track"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0C1D3A]/80 border border-[#D4AF37]/30 text-[#E5C158] hover:bg-[#D4AF37]/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[10px] font-mono uppercase tracking-[0.18em] text-[#F3D77D] mb-4">
                      <span>{activeSpec.category}</span>
                      <span className="opacity-50">•</span>
                      <span>{activeSpec.blueprintType}</span>
                    </div>

                    <h2
                      className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider uppercase mb-3 leading-tight"
                      style={{
                        background: "linear-gradient(180deg, #FDF0BE 0%, #E2BE5B 55%, #B88B2B 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      {activeSpec.heroTitle}
                    </h2>

                    <p className="max-w-xl mx-auto text-sm sm:text-base text-[#E2DAC9] leading-relaxed mb-6">
                      {activeSpec.heroSummary}
                    </p>

                    {/* Sacred Hexagonal Gold Emblem */}
                    <div className="my-5">
                      <SacredGeometricEmblem />
                    </div>

                    {/* 3 Icon Pillar Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto my-6">
                      {activeSpec.pillarChips.map((chip) => (
                        <div
                          key={chip.label}
                          className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-[#0B1B36]/80 border border-[#D4AF37]/25"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/12 border border-[#D4AF37]/35 flex items-center justify-center">
                            {renderChipIcon(chip.iconKey)}
                          </div>
                          <span className="text-xs font-semibold text-[#F6E29B] tracking-wide">{chip.label}</span>
                          <span className="text-[11px] text-[#A9B9D4]">{chip.subtitle}</span>
                        </div>
                      ))}
                    </div>

                    {/* Prominent Brushed-Gold CTA */}
                    <div className="pt-1 flex flex-col items-center gap-4">
                      <button
                        type="button"
                        onClick={handleEnterConstellation}
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm tracking-[0.14em] uppercase text-[#081326] shadow-[0_8px_28px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer border border-[#FDF0BE]/60"
                        style={{
                          background: "linear-gradient(180deg, #F1D37A 0%, #D4AF37 55%, #BA8F28 100%)"
                        }}
                      >
                        <span>Explore Doctrine</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* Bottom Track Progress Dots */}
                      <div className="flex items-center gap-2">
                        {TRACK_BLUEPRINT_ORDER.map((tid) => {
                          const active = tid === selectedTrackId;
                          return (
                            <button
                              key={tid}
                              type="button"
                              onClick={() => handleSelectTrackCard(tid)}
                              aria-label={`Select ${TRACK_BLUEPRINTS[tid].shortTitle}`}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                active ? "w-6 bg-[#E5C158]" : "w-2 bg-[#4A5E82] hover:bg-[#9FB0CD]"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Unified Track Focus Cards (All 6 SDA Tracks) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#E5C158]">
                        Unified Track Focus • Select a Prophetic Blueprint
                      </span>
                      <span className="text-[11px] text-[#8FA2C2] hidden sm:inline">
                        6 Interconnected SDA Study Architectures
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {TRACK_BLUEPRINT_ORDER.map((tid) => {
                        const spec = TRACK_BLUEPRINTS[tid];
                        const isSelected = tid === selectedTrackId;
                        return (
                          <button
                            key={tid}
                            type="button"
                            onClick={() => handleSelectTrackCard(tid)}
                            className={`text-left p-4 rounded-xl border transition-all cursor-pointer group ${
                              isSelected
                                ? "bg-[#102344]/90 border-[#E5C158] shadow-[0_0_24px_rgba(212,175,55,0.22)]"
                                : "bg-[#08152C]/70 border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:bg-[#0D1E3B]/80"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C158]">
                                {spec.category}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                  isSelected
                                    ? "bg-[#D4AF37]/20 border-[#E5C158]/60 text-[#FDF0BE]"
                                    : "bg-white/5 border-white/10 text-[#9FB0CD]"
                                }`}
                              >
                                {spec.nodes.length} nodes
                              </span>
                            </div>
                            <h3 className="font-serif text-sm font-bold text-[#F7F1E3] group-hover:text-[#F6E29B] transition-colors">
                              {spec.shortTitle}
                            </h3>
                            <p className="text-xs text-[#9FB0CD] mt-1 line-clamp-2 leading-relaxed">
                              {spec.heroSummary}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stage 2 renders via fullScreenConstellationOverlay outside AnimatePresence */}

              {/* ===================================================================== */}
              {/* STAGE 3: STRUCTURED ARCHITECTURAL BLUEPRINT (FOUNDATION FOR PHASE 2)  */}
              {/* ===================================================================== */}
              {stage === "blueprint" && (
                <motion.div
                  key={`blueprint-${selectedTrackId}-${focusedNode.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Gold-Framed Doctrine Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0A1A36]/90 border border-[#E5C158]/45">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#E5C158]">
                        Architectural Blueprint • {activeSpec.shortTitle}
                      </span>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#FDF0BE] mt-0.5">
                        {focusedNode.label}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStage("constellation")}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D4AF37]/30 text-[#CFD9EC] hover:bg-white/5 cursor-pointer"
                      >
                        ← Constellation Map
                      </button>
                      <button
                        type="button"
                        onClick={() => onLaunchBibleStudy(focusedNode.anchorRefs[0] || activeSpec.primaryPassage, focusedNode.label)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#081326] bg-[#E5C158] hover:bg-[#F3D77D] transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Study in Split Reader</span>
                      </button>
                    </div>
                  </div>

                  {/* 3-Column Architectural Pillar Preview (Expanded in Phase 2 & 3) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {activeTrackDb.outline.sections.slice(0, 3).map((sec, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col justify-between p-5 rounded-xl bg-[#08162E]/85 border border-[#D4AF37]/30 space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E5C158]">
                              Pillar 0{idx + 1}
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]/60" />
                          </div>
                          <h3 className="font-serif text-base font-bold text-[#FDF0BE]">{sec.title}</h3>
                          <p className="text-sm text-[#D6DFEF] leading-relaxed">{sec.summary}</p>
                        </div>

                        <div className="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/35 space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F3D77D] block">
                            Highlighted Anchor Verses
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {sec.key_references.map((ref) => (
                              <button
                                key={ref}
                                type="button"
                                onClick={() => onLaunchBibleStudy(ref, sec.title)}
                                className="text-xs font-mono px-2 py-0.5 rounded bg-[#071328] border border-[#D4AF37]/40 text-[#FDF0BE] hover:bg-[#D4AF37]/25 cursor-pointer"
                              >
                                {ref}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

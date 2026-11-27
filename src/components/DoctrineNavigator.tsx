import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { DEFAULT_DOCTRINE_TRACKS } from "../data/doctrineTracksDb";
import { useElderStephen } from "../context/ElderStephenContext";
import { DoctrineBlueprintEngine } from "./doctrine/DoctrineBlueprintEngine";

export const DoctrineNavigator: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTrackId, setSelectedTrackId] = useState<string>("fundamental-beliefs");

  const {
    setStudyMode,
    updateDoctrineContext,
    setCurrentPassage
  } = useElderStephen();

  const activeTrack = DEFAULT_DOCTRINE_TRACKS[selectedTrackId] || DEFAULT_DOCTRINE_TRACKS["fundamental-beliefs"];

  useEffect(() => {
    setStudyMode("Doctrine Navigator");
    if (activeTrack) {
      const activeSection = activeTrack.outline.sections[0];
      updateDoctrineContext(selectedTrackId, activeSection?.title || "");
      if (activeSection?.key_references?.[0]) {
        setCurrentPassage(activeSection.key_references[0]);
      }
    }
  }, [selectedTrackId, activeTrack, setStudyMode, updateDoctrineContext, setCurrentPassage]);

  const handleLaunchBibleStudyFromBlueprint = (reference: string, topic: string) => {
    try {
      localStorage.setItem("stba_pending_search_ref", reference);
      localStorage.setItem("stba_pending_search_topic", topic);
    } catch {}
    navigate("/study");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-lato font-normal not-italic" id="doctrine-navigator-root">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 text-left border-b border-[#DFC57B]/20 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#081e3a]/90 border border-[#DFC57B]/50 rounded-full text-[#DFC57B] text-[10px] tracking-wider shadow-xs w-fit">
          <Brain className="w-3.5 h-3.5 text-[#DFC57B] animate-pulse" />
          <span>INTELLIGENT BIBLICAL REASONING ENGINE</span>
        </div>

        <h1
          id="doctrine-navigator-title"
          className="font-serif text-3xl md:text-4xl text-[#DFC57B] font-black tracking-tight drop-shadow-xs not-italic"
        >
          The Doctrine Navigator
        </h1>
      </div>

      {/* Royal Navy & Gold 3-Stage Blueprint Engine */}
      <DoctrineBlueprintEngine
        selectedTrackId={selectedTrackId}
        onSelectTrack={(tid) => setSelectedTrackId(tid)}
        onLaunchBibleStudy={handleLaunchBibleStudyFromBlueprint}
      />
    </div>
  );
};

export default DoctrineNavigator;

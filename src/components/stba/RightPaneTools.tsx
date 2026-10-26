import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, Book, Feather, MessageSquare, BookOpen, 
  Settings, HelpCircle, Archive, Plus, Trash2, 
  CheckCircle2, Download, Play, Pause, RotateCcw, 
  Send, Mic, MicOff, Volume2, VolumeX, Award, Lock, BookMarked, BookmarkPlus, Layers,
  Search, Loader2, History, Sparkles, FolderOpen, FileText, ChevronDown,
  Calendar, Check, Database, AlertCircle, X, Sliders, Radio, Headphones, Zap, Activity, Copy, BookmarkCheck
} from "lucide-react";
import { BIBLICAL_NAMES_DICTIONARY, BiblicalName } from "./biblicalNames";
import { StudyNote, NoteCategory } from "../../types/notebook";
import { loadNotes, saveNotes, saveResponseAsNewNote, CATEGORY_META, loadCategories, saveCategories } from "../../data/notebookData";
import { callElderStephen } from "../../lib/callElderStephen";
import { formatProperElderSpacing, ensureElderStephenOutlineCompletion } from "../../utils/elderSpacing";
import { getParallelVerses, getFullChapterVerses, fetchChapterVersesAsync, ParallelVerse } from "./bibleData";
import { BIBLE_METADATA } from "./bibleMetadata";
import { supabase } from "../../lib/supabase";
import { saveNoteToSupabase, deleteNoteFromSupabase, fetchCategoriesFromSupabase, checkCategoriesTable, fetchNotesFromSupabase, checkSupabaseConnection } from "../../lib/notebookSync";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useElderStephen } from "../../context/ElderStephenContext";
import { SDABibleCommentary } from "./SDABibleCommentary";
export { SDABibleCommentary } from "./SDABibleCommentary";
import { stbaStorage } from "../../lib/storage/indexedDbClient";
import { panelSyncBus } from "../../lib/storage/panelSyncChannel";

// Prop definitions
export interface ToolProps {
  report: any;
  activeVerseIndex: number | null;
  activeStepIndex: number;
  setActiveStepIndex: (idx: number) => void;
  chatInputs: string[];
  setChatInputs: React.Dispatch<React.SetStateAction<string[]>>;
  stepChats: { sender: "user" | "ai"; text: string }[][];
  handleSendChat: () => void;
  onReferenceChange: (ref: string) => void;
  theme: "light" | "dark";
  userProfile?: any;
  addedNoteText?: string;
  addedNoteRef?: string;
  clearAddedNoteInline?: () => void;
  selectedWord?: string;
  setActiveVerseIndex?: (idx: number | null) => void;
  setSelectedWord?: (w: string) => void;
  bibleFontSize?: number;
  setBibleFontSize?: (size: number) => void;
  notebookFontSize?: number;
  setNotebookFontSize?: (size: number) => void;
  customVerses?: any[] | null;
  stephenPendingPrompt?: string;
  clearStephenPendingPrompt?: () => void;
  currentPassageRef?: string;
  onNavigateTab?: (tab: string) => void;
  setStepChats?: React.Dispatch<React.SetStateAction<{ sender: "user" | "ai"; text: string }[][]>>;
}

// Helper to check if a reference belongs to the New Testament
export function isNewTestamentReference(reference: string): boolean {
  if (!reference) return false;
  
  // Clean reference to extract standard books
  const clean = reference.trim().toLowerCase();
  
  // Try pattern matching first, extracting book name prefix
  // e.g. "1 John 2:3" -> "1 john", "Revelation 14:12" -> "revelation", "Genesis 1:1" -> "genesis"
  const match = clean.match(/^([1-3|i|ii|iii]?\s*[a-z\s.]+)/i);
  if (!match) return false;
  
  const rawBook = match[1].trim();
  
  const bookIndex = BIBLE_METADATA.findIndex(b => 
    b.name.toLowerCase() === rawBook || b.aliases.map(al => al.toLowerCase()).includes(rawBook)
  );
  
  if (bookIndex !== -1) {
    return bookIndex >= 39; // Matthew is index 39, Revelation is 65
  }
  
  // Secondary fallback comparison in case match is slightly off
  const foundIdx = BIBLE_METADATA.findIndex(b => 
    clean.startsWith(b.name.toLowerCase()) || 
    b.aliases.some(alias => clean.startsWith(alias.toLowerCase()))
  );
  if (foundIdx !== -1) {
    return foundIdx >= 39;
  }
  
  // Direct simple heuristic list of New Testament books and common short aliases
  const ntKeys = [
    "matthew", "matt", "mt", "mark", "mk", "luke", "luk", "lk", "john", "jn", "acts", "act", "ac",
    "romans", "rom", "ro", "corinthians", "cor", "1 cor", "2 cor", "galatians", "gal",
    "ephesians", "eph", "philippians", "phil", "php", "colossians", "col",
    "thessalonians", "thess", "1 thess", "2 thess", "timothy", "tim", "1 tim", "2 tim",
    "titus", "tit", "philemon", "phm", "hebrews", "heb", "james", "jas", "jam",
    "peter", "pet", "1 pet", "2 pet", "jude", "jud", "revelation", "rev"
  ];
  
  return ntKeys.some(key => clean.startsWith(key));
}

// ==========================================
// AUTO-RETRACT TOOLBAR COMPONENT (MOBILE TAP & DESKTOP HOVER AUTO-HIDE)
// ==========================================
export interface AutoRetractToolbarProps {
  children: React.ReactNode;
  theme?: "light" | "dark";
  className?: string;
}

export const AutoRetractToolbar: React.FC<AutoRetractToolbarProps> = ({
  children,
  theme = "light",
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = (delay = 4000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
      }
    }, delay);
  };

  useEffect(() => {
    // Show initially so user discovers it, then auto-retract after 4s of inactivity
    resetTimer(4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseMove = () => {
    if (!isVisible) {
      setIsVisible(true);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    resetTimer(2500);
  };

  const handleTouchOrTap = () => {
    setIsVisible(true);
    resetTimer(4500);
  };

  return (
    <div
      className="relative shrink-0 select-none transition-all duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchOrTap}
      onClick={handleTouchOrTap}
    >
      {/* Retracted subtle indicator tab affordance */}
      {!isVisible && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(true);
            resetTimer(4500);
          }}
          className={`w-full py-1 px-4 flex items-center justify-center cursor-pointer border-b transition-all group ${
            theme === "dark"
              ? "bg-[#161B22]/80 border-[#2C3545]/60 hover:bg-[#161B22]"
              : "bg-[#F9F7F3]/80 border-[#E8E2D8]/60 hover:bg-[#F9F7F3]"
          }`}
          title="Tap or hover to reveal toolbar"
        >
          <div className="w-12 h-1 rounded-full bg-[#C9973A]/60 group-hover:w-20 group-hover:bg-[#C9973A] transition-all duration-200" />
        </div>
      )}

      {/* Main Collapsible Toolbar Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isVisible
            ? "max-h-60 opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 pointer-events-none transform -translate-y-2"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

// ==========================================
// VOICE HELPER FOR ELDER STEPHEN (GLOBAL CONSISTENCY - MALE VOICES ONLY)
// ==========================================
export const isFemaleVoice = (v: SpeechSynthesisVoice | { name: string }): boolean => {
  const nameLower = v.name.toLowerCase();
  
  if (nameLower.includes("female") || nameLower.includes("(female)") || nameLower.includes("woman") || nameLower.includes("girl") || nameLower.includes("lady")) {
    return true;
  }

  const femaleNames = [
    "aria", "jenny", "sonia", "clara", "ana", "emma", "michelle", "libby", "natasha", "neerja", 
    "xiaoxiao", "abigail", "amber", "ashley", "mia", "ava", "emily", "heather", "hazel", "karen", 
    "zira", "susan", "catherine", "hayley", "linda", "amy", "steffi", "katja", "elsa", "hedda", 
    "hortense", "julie", "denise", "paulina", "mimi", "lauren", "daria", "svea", "alva", "stefanie", 
    "fiona", "gabi", "hoda", "salma", "raquel", "dalia", "monica", "silvia", "renata", "helena", 
    "isolda", "vitoria", "fernanda", "yara", "dilara", "leyla", "aysha", "fatima", "samira", "chimi", 
    "hoai", "mai", "tui", "mayu", "nanami", "shiori", "sun-hi", "ji-min", "hsiao-chen", "hsiao-yu", 
    "wanyi", "hiu-gaai", "hiu-mwan", "kanako", "asumi", "victoria", "samantha", "kora", "joana", 
    "nuria", "carmen", "laura", "paloma", "alessia", "isabella", "elena", "noora", "selma", "ines", 
    "marta", "teresa", "katri", "annika", "lotta", "moira", "veena", "zari", "sangeeta", "bhavna", 
    "swara", "ananya", "vani", "aangi", "alison", "serena", "stephanie", "vicki", "zora", "yumi",
    "ting-ting", "ya-ling", "sin-ji", "mei-jia", "kyoko", "yuri", "leila", "amanda", "pamela", "siri"
  ];

  return femaleNames.some(femaleName => {
    const regex = new RegExp(`\\b${femaleName}\\b`, "i");
    return regex.test(nameLower);
  });
};

export const isMaleVoice = (v: SpeechSynthesisVoice | { name: string }): boolean => {
  return !isFemaleVoice(v);
};

export const isEdgeNaturalVoice = (v: SpeechSynthesisVoice | { name: string }): boolean => {
  const nameLower = v.name.toLowerCase();
  return nameLower.includes("microsoft") && (nameLower.includes("natural") || nameLower.includes("online") || nameLower.includes("edge"));
};

export const filterEdgeNaturalVoices = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] => {
  if (!voices || voices.length === 0) return [];

  // Filter ONLY premium Edge Natural Microsoft MALE voices (strictly removing all female voices)
  let filtered = voices.filter(v => isEdgeNaturalVoice(v) && !isFemaleVoice(v));

  // Fallback 1: If no male "natural/online" Microsoft voices exist in this specific browser runtime, allow any male Microsoft voices
  if (filtered.length === 0) {
    filtered = voices.filter(v => v.name.toLowerCase().includes("microsoft") && !isFemaleVoice(v));
  }

  // Fallback 2: If still no Microsoft male voices exist in this browser (e.g. Chrome on Linux), allow any male voices
  if (filtered.length === 0) {
    filtered = voices.filter(v => !isFemaleVoice(v));
  }

  // Fallback 3: Safety check - if every voice was somehow filtered out, fallback to non-female or all
  if (filtered.length === 0) {
    filtered = voices;
  }

  // Sort so that "Microsoft Aduri Online Natural Afrikaans" or "Microsoft Andrew Online Natural" starts the list, followed by other male voices sorted alphabetically
  return [...filtered].sort((a, b) => {
    const aIsAduri = a.name.toLowerCase().includes("aduri");
    const bIsAduri = b.name.toLowerCase().includes("aduri");
    if (aIsAduri && !bIsAduri) return -1;
    if (!aIsAduri && bIsAduri) return 1;
    return a.name.localeCompare(b.name);
  });
};

export const getElderStephenVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const edgeVoices = filterEdgeNaturalVoices(voices);

  // 0. User-selected browser voice URI or name from settings (ensuring it's not female)
  const savedUri = localStorage.getItem("stba_browser_voice_uri");
  if (savedUri) {
    const matched = voices.find(v => (v.voiceURI === savedUri || v.name === savedUri) && !isFemaleVoice(v));
    if (matched) return matched;
  }

  // 1. DEFAULT VOICE: 'Microsoft Andrew Online Natural' within Web Speech API
  const andrewVoice = edgeVoices.find(v => {
    const nameLower = v.name.toLowerCase();
    return nameLower.includes("microsoft") && nameLower.includes("andrew");
  }) || voices.find(v => v.name.toLowerCase().includes("andrew") && !isFemaleVoice(v));

  if (andrewVoice) return andrewVoice;

  // 2. Fallback to first male filtered Edge Natural voice or first male voice
  return edgeVoices[0] || voices.find(v => !isFemaleVoice(v)) || voices[0] || null;
};

// ==========================================
// OFFLINE HIGH-QUALITY ADVENTIST VERSE COMMENTARY FALLBACK
// ==========================================
const getStaticCommentaryForVerse = (reference: string, verseNum: number, text: string): string => {
  const refLower = reference.toLowerCase();
  
  if (refLower.includes("revelation 14") || refLower.includes("three angels")) {
    if (verseNum === 6) {
      return `**Summary**
This verse is the prelude of the end-time message, calling every nation to the everlasting gospel.

### 1. Context
John beholds an angel flying in mid-heaven. This represents a movement of God’s people preaching with celestial speed and universal scope just before the close of human probation.

### 2. Key Terms
- **Everlasting Gospel** — the unchanging plan of salvation through the righteousness of Christ.
- **Mid-heaven** — complete and unhindered worldwide visibility for the final gospel warning.

### 3. Exegetical Insight
The Greek word for fly is *petomenon*, signifying rapid, divine deployment. The gospel isn't a new revelation; it's the *everlasting* covenant power of God restoration.

### 4. Theological Meaning
In the Great Controversy, Satan attempts to substitute the gospel of grace with legalism or secularism. Verse 6 reminds us that salvation is always by grace, sealed by Christ's High Priestly ministry in the sanctuary.

### 5. Cross-References
- *Genesis 3:15*
- *Matthew 24:14*
- *Galatians 1:8*

### 6. Application
Are we actively sharing the everlasting gospel of the Lamb, or have we let modern cultural compromises silent our witness?`;
    }
    
    if (verseNum === 7) {
      return `**Summary**
The first angel’s message commands a standard of absolute reverence and worship, announcing that the hour of God's investigative judgment is active.

### 1. Context
This warning aligns prophetic timelines with 1844 and the cleansing of the heavenly sanctuary, urging humanity to make a decisive choice for their Creator.

### 2. Key Terms
- **Fear God** — to love Him supremely, respect His character, and turn away from evil.
- **Hour of His Judgment** — the pre-advent investigative phase of Christ’s ministration.

### 3. Exegetical Insight
The Greek word for worship, *proskynēson*, signifies bowing down in total alignment with His physical and moral authority. The phrase "made heaven and earth" directly echoes the fourth commandment of the Decalogue (Exodus 20:11).

### 4. Theological Meaning
True worship lies at the core of the Great Controversy. By keeping the Seventh-day Sabbath, we honor God as Creator and defend His holy law against counterfeit systems of worship.

### 5. Cross-References
- *Exodus 20:11*
- *Daniel 7:9-10*
- *Ecclesiastes 12:13-14*

### 6. Application
Let us reflect: is our weekly worship centered on God's creative sovereignty and His sanctuary righteousness? Let us keep His commandments in faith.`;
    }

    if (verseNum === 8) {
      return `**Summary**
The second angel announces the moral and structural collapse of Babylon, warning against her intoxicating spiritual duplicities.

### 1. Context
Babylon represents apostate religious organizations that have fallen from pure Bible doctrine, mixing Christian truths with pagan philosophies and human dogmas.

### 2. Key Terms
- **Babylon** — confusion, originating from the Tower of Babel; apostate ecclesiastical powers.
- **Wine of Wrath** — false teachings and compromises that obscure the true character of God.

### 3. Exegetical Insight
The Greek verb *epesen* (is fallen) is repeated twice for prophetic emphasis. This absolute certainty ensures that no human institution built on spiritual compromise will stand.

### 4. Theological Meaning
Babylon’s primary tool in the Great Controversy is confusion of doctrine. Christ is purging His sanctuary of these false records; we must separate ourselves from her systems to maintain pristine covenant status.

### 5. Cross-References
- *Genesis 11:1-9*
- *Revelation 18:2-4*
- *Jeremiah 51:6-9*

### 6. Application
Are there areas of Babylon—pride, theological syncretism, or self-exaltation—still dwelling in our hearts? Let us flee to the purity of God's Word.`;
    }

    if (verseNum === 9 || verseNum === 10 || verseNum === 11) {
      return `**Summary**
The third angel's message is a solemn warning against receiving the mark of the beast, highlighting the final choice between the Mark of the Apostasy and the Seal of God.

### 1. Context
This passage presents the climax of the Great Controversy. When state powers enforce counterfeit religious laws, everyone must choose between divine law and human tradition.

### 2. Key Terms
- **Mark of the Beast** — allegiance to a counterfeit human institution above the commandments of God.
- **Indignation** — God's pure justice poured out without the mixture of probationary mercy.

### 3. Exegetical Insight
The 'Mark' (*charagma*) denotes an imperial seal. Receiving it on the forehead represents mental consent, while the hand represents compliance under physical coercion.

### 4. Theological Meaning
The sanctuary shows us that God's law is kept within the Ark of the Covenant, protected by his mercy seat. The final conflict turns on the fourth commandment, God's creative sign.

### 5. Cross-References
- *Daniel 3:15-18*
- *Exodus 31:13-17*
- *Revelation 13:16-17*

### 6. Application
Let us build our trust in Jesus now, so that under final crisis we will stand firm in His strength rather than succumb to convenience.`;
    }

    if (verseNum === 12) {
      return `**Summary**
This verse is the ultimate definition of the end-time remnant, embodying patience, law, and faith.

### 1. Context
Following the fierce battle of the double warning, this verse points to the finished masterpiece: a people who have successfully navigated the Great Controversy.

### 2. Key Terms
- **Patience** — *hypomonē*; steadfast, unyielding endurance under heavy trial.
- **Faith of Jesus** — the faith that Christ possessed, enabling perfect surrender in Gethsemane and Calvary.

### 3. Exegetical Insight
*Hōde* ("Here is") stands as a marker of victory. It is where the fruit of the Everlasting Gospel is demonstrated: saints keeping God's commandments not in legalism, but by the faith of Jesus.

### 4. Theological Meaning
Christ’s ministry in the sanctuary cleanses a people to vindicate God's character. By reproducing His character in us, the saints prove that God's law is holy, just, and completely keepable through grace.

### 5. Cross-References
- *Revelation 12:17*
- *Hebrews 12:1-2*
- *Romans 3:31*

### 6. Application
Let us invite the faith of Jesus into our hearts today, asking Him to form His character of unyielding love in our daily life.`;
    }
  }

  // General fallback for other verses or book chapters
  return `**Summary**
Pastoral commentary on ${reference} (Verse ${verseNum}). Let us search the scriptures line upon line to uncover its sanctuary lessons.

### 1. Context
This verse forms a central link in our systematic study, providing a firm theological anchor for our exegesis.

### 2. Key Terms
- **Line Upon Line** — comparing passage with passage to discover deeper cosmic harmonies.
- **Sola Scriptura** — Scripture alone as our primary rule of faith and practice.

### 3. Exegetical Insight
We must study each word carefully to appreciate how its historical reality matches the timeless spiritual principles of God's Word.

### 4. Theological Meaning
In the Great Controversy, every portion of God's Word guards us against satanic subversion. This text connects beautifully to the Sanctuary truth and the love of our high-priestly Advocate.

### 5. Cross-References
- *Isaiah 28:10*
- *2 Timothy 2:15*
- *Revelation 14:12*

### 6. Application
Let us apply this truth directly to our lives today, committing to stand as a faithful witness for God's character.`;
};

// ==========================================
// TOOL 1: ELDER STEPHEN (COMMENTARY MODE)
// ==========================================
export interface ElderCommentaryItem {
  id: string;
  sender: "user" | "elder";
  text: string;
  timestamp: number;
  badge?: string;
  verseRef?: string;
}

// Master Persistence Engine: In-memory scripture notes pinned per passage across browser session
const inMemoryElderStephenPassageNotes = new Map<string, ElderCommentaryItem[]>();

// Synchronizes completed commentary notes to the user's permanent server-side study notebook
async function syncElderStephenNotesToNotebook(userKey: string, scriptureRef: string, notes: ElderCommentaryItem[]) {
  if (!notes || notes.length === 0 || !scriptureRef) return;
  const elderNotesOnly = notes.filter(n => n.sender === "elder");
  if (elderNotesOnly.length === 0) return;

  try {
    const formattedMarkdown = notes
      .map(n => `### ${n.sender === "elder" ? "Elder Stephen Guidance" : "Berean Inquiry"}${n.badge ? ` (${n.badge})` : ""}\n\n${n.text}`)
      .join("\n\n---\n\n");

    await fetch("/api/user/study-notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userKey,
        scriptureRef,
        title: `Elder Stephen Commentary: ${scriptureRef}`,
        commentaryText: formattedMarkdown,
        notes: notes.map(n => ({ sender: n.sender, text: n.text, badge: n.badge, id: n.id }))
      })
    });
    console.log(`[Elder Stephen] Successfully synced notes for ${scriptureRef} to server study notebook.`);
  } catch (err) {
    console.warn(`[Elder Stephen] Notebook sync notice:`, err);
  }
}

export const ElderStephenCommentary: React.FC<ToolProps> = ({
  report,
  activeVerseIndex,
  theme,
  userProfile,
  stephenPendingPrompt,
  clearStephenPendingPrompt,
  currentPassageRef,
  onReferenceChange,
  onNavigateTab
}) => {
  const activeRef = (report?.reference || currentPassageRef || "Revelation 14:6-12").trim();
  const { isBottomBarVisible } = useApp();
  const elderContext = useElderStephen();
  const userKey = userProfile?.email || "guest";
  const sessionKey = `stba_stephen_session_${userKey}_${encodeURIComponent(activeRef.toLowerCase())}`;

  const [messages, setMessages] = useState<ElderCommentaryItem[]>(() => {
    // 1. Check in-memory persistent session cache first
    const inMem = inMemoryElderStephenPassageNotes.get(sessionKey);
    if (inMem && inMem.length > 0) {
      return inMem.map(item => item.sender === "elder" ? { ...item, text: ensureElderStephenOutlineCompletion(item.text, item.verseRef || activeRef, report?.topic) } : item);
    }

    try {
      const saved = localStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const completed = parsed.map(item => item.sender === "elder" ? { ...item, text: ensureElderStephenOutlineCompletion(item.text, item.verseRef || activeRef, report?.topic) } : item);
          // Filter out any echo duplicates where user message is identical to elder message
          return completed.filter((item, idx, arr) => {
            if (item.sender === "user") {
              const prev = arr[idx - 1];
              if (prev && prev.sender === "elder") {
                const c1 = item.text.toLowerCase().replace(/[^a-z0-9]/g, "");
                const c2 = prev.text.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (c1 === c2 || (c1.length > 15 && c2.includes(c1))) {
                  return false;
                }
              }
            }
            return true;
          });
        }
      }
    } catch (e) {
      console.warn("Failed loading elder stephen session notes:", e);
    }
    return [];
  });

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedToast, setCopiedToast] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio / Speech States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastActiveRefRef = useRef<string>(activeRef);

  // 🌟 Dynamic Gemini Live Interactive Mode States
  const [isDynamicLiveActive, setIsDynamicLiveActive] = useState<boolean>(false);
  const [liveState, setLiveState] = useState<"idle" | "connecting" | "ready" | "recording" | "playing" | "error">("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([8, 14, 20, 12, 18, 10, 16, 10]);
  const [showPassageSwitcher, setShowPassageSwitcher] = useState<boolean>(false);
  const [switcherInput, setSwitcherInput] = useState<string>("");

  // Saved note tracking and live interactive response box state
  const [savedNoteIds, setSavedNoteIds] = useState<Set<string>>(new Set());
  const [latestLiveResponse, setLatestLiveResponse] = useState<string>("");
  const [isLiveNoteSaved, setIsLiveNoteSaved] = useState<boolean>(false);

  // Active display response in the interactive session box (what Elder Stephen is saying)
  const activeDisplayResponse = (
    latestLiveResponse ||
    messages.filter(m => m.sender === "elder" && (m.badge?.includes("Interactive") || m.badge?.includes("Speech") || m.badge?.includes("Live"))).slice(-1)[0]?.text ||
    messages.filter(m => m.sender === "elder").slice(-1)[0]?.text ||
    ""
  ).trim();

  const liveWsRef = useRef<WebSocket | null>(null);
  const clientHeartbeatTimerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const activeNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const currentLiveReplyTextRef = useRef<string>("");
  const currentLiveReplyIdRef = useRef<string | null>(null);
  const fallbackSpeechRecRef = useRef<any>(null);

  // Echo cancellation & speech gating state
  const isElderSpeakingRef = useRef<boolean>(false);
  const lastElderSpeechEndTimeRef = useRef<number>(0);
  const recentElderSpeechRef = useRef<string[]>([]);

  // Robust echo detector to guarantee Elder Stephen's audio is NEVER recorded as user response
  const isEchoOfElderStephen = (candidateText: string): boolean => {
    if (!candidateText || !candidateText.trim()) return true;
    if (isElderSpeakingRef.current) return true;
    if (Date.now() - lastElderSpeechEndTimeRef.current < 600) return true;

    const cleanCand = candidateText.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanCand.length < 3) return true;

    const allElderTexts = [
      ...recentElderSpeechRef.current,
      latestLiveResponse,
      activeDisplayResponse,
      ...(messages.filter(m => m.sender === "elder").slice(-3).map(m => m.text))
    ].filter(Boolean);

    for (const elderText of allElderTexts) {
      const cleanElder = elderText.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanElder.length > 0) {
        if (cleanElder.includes(cleanCand) || cleanCand.includes(cleanElder)) {
          return true;
        }
      }
      const candWords = candidateText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      if (candWords.length >= 2) {
        const matches = candWords.filter(w => elderText.toLowerCase().includes(w));
        if (matches.length / candWords.length >= 0.5) {
          return true;
        }
      }
    }
    return false;
  };

  // Audio Helper Utilities for PCM streaming & base64
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return output.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const clearPlaybackQueue = () => {
    activeNodesRef.current.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
    isElderSpeakingRef.current = false;
    if (audioCtxRef.current) {
      nextStartTimeRef.current = audioCtxRef.current.currentTime;
    }
  };

  const playPCMChunk = (base64Audio: string) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const binaryStr = window.atob(base64Audio);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;

      activeNodesRef.current.push(source);
      setLiveState("playing");
      isElderSpeakingRef.current = true;

      source.onended = () => {
        activeNodesRef.current = activeNodesRef.current.filter(n => n !== source);
        if (activeNodesRef.current.length === 0 && (!audioCtxRef.current || audioCtxRef.current.currentTime >= nextStartTimeRef.current - 0.05)) {
          setLiveState("ready");
          lastElderSpeechEndTimeRef.current = Date.now();
          // 500ms echo decay buffer before allowing user microphone input
          setTimeout(() => {
            if (activeNodesRef.current.length === 0) {
              isElderSpeakingRef.current = false;
            }
          }, 500);
        }
      };
    } catch (err) {
      console.warn("PCM Audio playback chunk error:", err);
    }
  };

  const appendLiveReplyChunk = (textChunk: string) => {
    if (!textChunk) return;
    if (currentLiveReplyTextRef.current.length > 0) {
      const lastChar = currentLiveReplyTextRef.current.slice(-1);
      const firstChar = textChunk.charAt(0);
      if (!/\s/.test(lastChar) && !/[\s.,;:!?')\]]/.test(firstChar)) {
        currentLiveReplyTextRef.current += " ";
      }
    }
    currentLiveReplyTextRef.current += textChunk;
    const fullText = formatProperElderSpacing(currentLiveReplyTextRef.current);
    setLatestLiveResponse(fullText);
    setIsLiveNoteSaved(false);
    isElderSpeakingRef.current = true;
    recentElderSpeechRef.current = [fullText, ...recentElderSpeechRef.current.filter(t => t !== fullText).slice(0, 5)];

    setMessages(prev => {
      const liveId = currentLiveReplyIdRef.current;
      const existingIdx = liveId ? prev.findIndex(m => m.id === liveId) : -1;
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          text: fullText
        };
        return updated;
      } else {
        const newId = liveId || `elder-live-${Date.now()}`;
        currentLiveReplyIdRef.current = newId;
        const newMsg: ElderCommentaryItem = {
          id: newId,
          sender: "elder",
          text: fullText,
          timestamp: Date.now(),
          badge: "Live Interactive Session"
        };
        return [...prev, newMsg];
      }
    });
    scrollToBottom();
  };

  const endLiveReplyAccumulation = () => {
    currentLiveReplyTextRef.current = "";
    currentLiveReplyIdRef.current = null;
  };

  const startMicCapture = async () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      micStreamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMicMuted || isElderSpeakingRef.current) {
          // Half-duplex echo barrier: do not send audio while Elder Stephen is playing
          return;
        }
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate RMS for live visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const heights = Array.from({ length: 8 }, (_, i) => {
          const factor = Math.sin((i / 8) * Math.PI) * 0.8 + 0.2;
          return Math.min(22, Math.max(4, Math.round(rms * 180 * factor)));
        });
        setWaveHeights(heights);

        if (rms > 0.02) {
          if (liveState !== "recording" && liveState !== "playing") {
            setLiveState("recording");
          }
        } else if (liveState === "recording") {
          setLiveState("ready");
        }

        // Send 16-bit PCM chunk over WebSocket only when user is speaking
        if (liveWsRef.current && liveWsRef.current.readyState === WebSocket.OPEN) {
          const pcmBuffer = floatTo16BitPCM(inputData);
          const base64Audio = arrayBufferToBase64(pcmBuffer);
          liveWsRef.current.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(ctx.destination);

      // Local SpeechRecognition fallback (for text display in response area)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && !fallbackSpeechRecRef.current) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-US";
          rec.onresult = (event: any) => {
            if (isElderSpeakingRef.current) return;
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript.trim()) {
              const text = finalTranscript.trim();
              if (isEchoOfElderStephen(text)) {
                console.log("[STBA Echo Suppressed in startMicCapture]:", text);
                return;
              }
              // Only record in response area, NEVER in prompt text box:
              endLiveReplyAccumulation();
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.sender === "user" && (last.text.toLowerCase() === text.toLowerCase() || last.text.toLowerCase().includes(text.toLowerCase().slice(0, 15)))) {
                  return prev;
                }
                return [
                  ...prev,
                  {
                    id: `user-speech-${Date.now()}`,
                    sender: "user",
                    text,
                    timestamp: Date.now(),
                    badge: "Spoken Response"
                  }
                ];
              });
            }
          };
          rec.onerror = () => {};
          rec.start();
          fallbackSpeechRecRef.current = rec;
        } catch (e) {
          console.warn("Local speech recognition notice:", e);
        }
      }
    } catch (err: any) {
      console.warn("Microphone access error in Dynamic Live Mode:", err);
      setLiveError("Microphone access denied or unavailable.");
    }
  };

  const handleSpeakAloudAndResumeListen = (textToSpeak: string) => {
    if (!("speechSynthesis" in window)) {
      setLiveState("ready");
      return;
    }
    
    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/[#*`_~]/g, "").slice(0, 750);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 0.96;
    
    const voices = window.speechSynthesis.getVoices();
    const pastoralVoice = voices.find(v => 
      v.lang.startsWith("en") && (
        v.name.includes("Natural") || 
        v.name.includes("Guy") || 
        v.name.includes("David") || 
        v.name.includes("Daniel") || 
        v.name.includes("George") ||
        v.name.includes("Male")
      )
    ) || voices.find(v => v.lang.startsWith("en"));
    
    if (pastoralVoice) utterance.voice = pastoralVoice;
    
    isElderSpeakingRef.current = true;
    recentElderSpeechRef.current = [cleanText, ...recentElderSpeechRef.current.filter(t => t !== cleanText).slice(0, 5)];
    setIsSpeaking(true);
    setLiveState("playing");
    
    // Waveform simulation
    const waveInterval = setInterval(() => {
      setWaveHeights(Array.from({ length: 8 }, () => Math.floor(Math.random() * 16) + 6));
    }, 100);

    // Keepalive to prevent Chrome from pausing speech synthesis after 15 seconds
    const speechKeepalive = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(speechKeepalive);
      }
    }, 10000);

    utterance.onend = () => {
      clearInterval(waveInterval);
      clearInterval(speechKeepalive);
      setWaveHeights([8, 12, 16, 10, 14, 8, 12, 8]);
      setIsSpeaking(false);
      setLiveState("ready");
      lastElderSpeechEndTimeRef.current = Date.now();
      
      // Auto resume listening loop in dynamic interactive mode after echo decay buffer
      if (isDynamicLiveActive) {
        setTimeout(() => {
          isElderSpeakingRef.current = false;
          if (isDynamicLiveActive) startContinuousSpeechLoop();
        }, 500);
      } else {
        setTimeout(() => {
          isElderSpeakingRef.current = false;
        }, 500);
      }
    };

    utterance.onerror = () => {
      clearInterval(waveInterval);
      clearInterval(speechKeepalive);
      setIsSpeaking(false);
      setLiveState("ready");
      lastElderSpeechEndTimeRef.current = Date.now();
      if (isDynamicLiveActive) {
        setTimeout(() => {
          isElderSpeakingRef.current = false;
          if (isDynamicLiveActive) startContinuousSpeechLoop();
        }, 500);
      } else {
        setTimeout(() => {
          isElderSpeakingRef.current = false;
        }, 500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startContinuousSpeechLoop = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    if (fallbackSpeechRecRef.current) {
      try { fallbackSpeechRecRef.current.abort(); } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setLiveState("recording");
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      if (isElderSpeakingRef.current) return;
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      // Only process when final transcript is ready; never write to prompt text box
      if (finalTranscript && finalTranscript.trim()) {
        const text = finalTranscript.trim();
        if (isEchoOfElderStephen(text)) {
          console.log("[STBA Echo Suppressed in continuous loop]:", text);
          return;
        }
        handleUserSpeechInDynamicMode(text);
      }
    };

    rec.onerror = (err: any) => {
      // If error is no-speech, network or transient silence, maintain active conversation and keep listening
      if (err.error === "no-speech" || err.error === "network" || err.error === "audio-capture") {
        if (isDynamicLiveActive && !isSpeaking && !isElderSpeakingRef.current) {
          setTimeout(() => {
            if (isDynamicLiveActive && !isSpeaking && !isElderSpeakingRef.current) {
              startContinuousSpeechLoop();
            }
          }, 300);
          return;
        }
      }
      console.warn("Dynamic mode speech recognition notice:", err.error);
      setLiveState("ready");
    };

    rec.onend = () => {
      // Maintain Active Conversation: keep listening continuously for as long as user is engaged
      if (isDynamicLiveActive && !isSpeaking && !isElderSpeakingRef.current) {
        setTimeout(() => {
          if (isDynamicLiveActive && !isSpeaking && !isElderSpeakingRef.current) {
            startContinuousSpeechLoop();
          }
        }, 200);
      } else if (isDynamicLiveActive && liveState === "recording") {
        setLiveState("ready");
      }
    };

    fallbackSpeechRecRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn("Could not start continuous speech loop:", e);
    }
  };

  const handleUserSpeechInDynamicMode = (spokenText: string) => {
    if (!spokenText.trim()) return;
    if (isEchoOfElderStephen(spokenText)) {
      console.log("[STBA Echo Suppressed in handleUserSpeechInDynamicMode]:", spokenText);
      return;
    }

    // Do NOT write to prompt text box! Only record in response area (messages stream):
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.sender === "user" && (last.text.toLowerCase() === spokenText.toLowerCase() || last.text.toLowerCase().includes(spokenText.toLowerCase().slice(0, 15)))) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `user-speech-${Date.now()}`,
          sender: "user",
          text: spokenText,
          timestamp: Date.now(),
          badge: "Spoken Response"
        }
      ];
    });
    
    setLoading(true);
    setLiveState("playing");
    isElderSpeakingRef.current = true;

    const payload = {
      currentMode: "Explain" as const,
      contextSummary: `Live interactive SDA exegesis study on ${activeRef}. The student shared: "${spokenText}".`,
      noteTitle: `Interactive Study on ${activeRef}`,
      noteContent: report?.text || activeRef,
      userAction: `Respond conversationally as a gentle, wise teacher and SDA exegesis mentor. Listen closely to what the student shared ("${spokenText}"). Use affirming and guiding language (e.g. "That's a great observation! Let's look at how this passage is connected to another verse in context."). Gently nudge the student toward deeper, more careful observation of the biblical text without appearing overbearing or directive. Encourage careful exegesis by allowing Scripture to explain itself (Scripture interprets Scripture), and invite the student to explore related passages and context as you discuss.`,
      historyLog: messages.slice(-4).map(m => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text
      })).concat([
        { role: "user" as const, text: spokenText }
      ])
    };

    callElderStephen(payload)
      .then(res => {
        const replyText = res?.text || "That is a thoughtful observation! Let us see how Scripture unfolds this passage in its broader context.";
        const elderMsg: ElderCommentaryItem = {
          id: `elder-speech-reply-${Date.now()}`,
          sender: "elder",
          text: replyText,
          timestamp: Date.now(),
          badge: "Elder Stephen Insight"
        };
        setMessages(prev => [...prev, elderMsg]);
        setLatestLiveResponse(replyText);
        setIsLiveNoteSaved(false);
        setLoading(false);
        handleSpeakAloudAndResumeListen(replyText);
      })
      .catch(e => {
        console.warn("Dynamic discussion speech reply failed:", e);
        setLoading(false);
        setLiveState("ready");
      });
  };

  const startBrowserVoiceSimulation = () => {
    setLiveState("ready");
    setLoading(true);
    setLiveState("playing");
    isElderSpeakingRef.current = true;
    
    const userName = userProfile?.name || "Berean";
    const payload = {
      currentMode: "Explain" as const,
      contextSummary: `Interactive Bible Study Exegesis on ${activeRef}. The student has activated Interactive Mode.`,
      noteTitle: `Interactive Study on ${activeRef}`,
      noteContent: report?.text || activeRef,
      userAction: `Begin our live conversational interaction directly as a gentle, wise teacher on ${activeRef}. Greet ${userName} warmly and ask an engaging, gentle opening question inviting their observations on the passage without any rigid formality.`,
      historyLog: messages.slice(-4).map(m => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text
      }))
    };

    callElderStephen(payload)
      .then(res => {
        const replyText = res?.text || `Greetings, ${userName}! It is a blessing to open God's Word together on ${activeRef}. What thoughts or observations stand out to you first in this passage? Let us explore together.`;
        
        recentElderSpeechRef.current = [replyText, ...recentElderSpeechRef.current.filter(t => t !== replyText).slice(0, 5)];
        isElderSpeakingRef.current = true;

        const elderMsg: ElderCommentaryItem = {
          id: `elder-live-${Date.now()}`,
          sender: "elder",
          text: replyText,
          timestamp: Date.now(),
          badge: "Interactive Mode"
        };
        
        setMessages(prev => [...prev, elderMsg]);
        setLatestLiveResponse(replyText);
        setIsLiveNoteSaved(false);
        setLoading(false);
        handleSpeakAloudAndResumeListen(replyText);
      })
      .catch(e => {
        console.warn("Error starting browser voice simulation:", e);
        setLoading(false);
        setLiveState("ready");
        isElderSpeakingRef.current = false;
      });
  };

  const startDynamicLiveSession = () => {
    setLiveError(null);
    setLiveState("connecting");
    setIsDynamicLiveActive(true);
    
    const userName = userProfile?.name || "Disciple";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/study/live?mode=study&reference=${encodeURIComponent(activeRef)}&passageText=${encodeURIComponent(report?.text || "")}&topic=${encodeURIComponent(report?.topic || activeRef)}&userName=${encodeURIComponent(userName)}`;

    try {
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onopen = () => {
        console.log("[STBA Live] WebSocket connected for Dynamic Interactive Mode on", activeRef);
        
        // Client-side keepalive ping to maintain active connection indefinitely
        if (clientHeartbeatTimerRef.current) clearInterval(clientHeartbeatTimerRef.current);
        clientHeartbeatTimerRef.current = setInterval(() => {
          if (liveWsRef.current && liveWsRef.current.readyState === WebSocket.OPEN) {
            try {
              liveWsRef.current.send(JSON.stringify({ ping: true }));
            } catch (e) {}
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.heartbeat) {
            // Server heartbeat acknowledged; keeps connection indefinitely active
            return;
          }
          
          if (msg.ready) {
            setLiveState("ready");
            startMicCapture();
            
            // Directly start conversational engagement without displaying any pop-up or user speech bubble
            const directStartText = `Hello Elder Stephen. I am ready for our interactive Bible study on ${activeRef}. Please begin our conversation directly as a gentle, wise teacher.`;
            ws.send(JSON.stringify({ text: directStartText }));
            currentLiveReplyIdRef.current = `elder-live-${Date.now()}`;
          }

          if (msg.userTranscript) {
            const userSpeech = msg.userTranscript.trim();
            if (userSpeech) {
              if (isElderSpeakingRef.current || isEchoOfElderStephen(userSpeech)) {
                console.log("[STBA Echo Suppressed on WS userTranscript]:", userSpeech);
                return;
              }
              // Do NOT call setInputText! Text belongs ONLY in response area:
              endLiveReplyAccumulation();
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.sender === "user" && (last.text.toLowerCase() === userSpeech.toLowerCase() || last.text.toLowerCase().includes(userSpeech.toLowerCase().slice(0, 15)))) {
                  return prev;
                }
                return [
                  ...prev,
                  {
                    id: `user-speech-${Date.now()}`,
                    sender: "user",
                    text: userSpeech,
                    timestamp: Date.now(),
                    badge: "Spoken Response"
                  }
                ];
              });
            }
          }

          if (msg.audio) {
            playPCMChunk(msg.audio);
          }

          if (msg.text) {
            appendLiveReplyChunk(msg.text);
          }

          if (msg.transcription) {
            appendLiveReplyChunk(msg.transcription);
          }

          if (msg.turnComplete) {
            endLiveReplyAccumulation();
            setLiveState("ready");
          }

          if (msg.interrupted) {
            clearPlaybackQueue();
            endLiveReplyAccumulation();
            setLiveState("ready");
          }

          if (msg.closed) {
            cleanupLiveSession(false);
          }

          if (msg.error) {
            console.warn("[STBA Live Notice]", msg.error);
            startBrowserVoiceSimulation();
          }
        } catch (e) {
          console.warn("WebSocket parse error:", e);
        }
      };

      ws.onerror = (e) => {
        console.warn("Live WebSocket connection error, transitioning to browser voice studio simulation:", e);
        startBrowserVoiceSimulation();
      };

      ws.onclose = () => {
        console.log("[STBA Live] Live WebSocket closed.");
      };

    } catch (err: any) {
      console.warn("Failed initializing Live WebSocket:", err);
      startBrowserVoiceSimulation();
    }
  };

  const cleanupLiveSession = (notifyToast: boolean = true) => {
    setIsDynamicLiveActive(false);
    setLiveState("idle");
    
    if (clientHeartbeatTimerRef.current) {
      clearInterval(clientHeartbeatTimerRef.current);
      clientHeartbeatTimerRef.current = null;
    }

    if (liveWsRef.current) {
      try {
        liveWsRef.current.close();
      } catch (e) {}
      liveWsRef.current = null;
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }

    if (fallbackSpeechRecRef.current) {
      try {
        fallbackSpeechRecRef.current.abort();
      } catch (e) {}
      fallbackSpeechRecRef.current = null;
    }

    clearPlaybackQueue();
    endLiveReplyAccumulation();
    handleStopSpeech();

    if (notifyToast) {
      setCopiedToast("Dynamic Interactive Mode ended.");
      setTimeout(() => setCopiedToast(""), 3000);
    }
  };

  const handleToggleDynamicInteractiveMode = () => {
    if (isDynamicLiveActive) {
      cleanupLiveSession(true);
    } else {
      startDynamicLiveSession();
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupLiveSession(false);
    };
  }, []);

  // Auto-scroll to bottom of messages when new notes appear
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sync messages into in-memory store and localStorage for the active scripture passage session
  useEffect(() => {
    if (messages.length > 0 && activeRef) {
      inMemoryElderStephenPassageNotes.set(sessionKey, messages);
      try {
        localStorage.setItem(sessionKey, JSON.stringify(messages));
      } catch (e) {
        console.warn("Could not save elder stephen session notes", e);
      }
    }
  }, [messages, sessionKey, activeRef]);

  // Handle Scripture Passage Navigation: Switch session notes ONLY when user navigates to a different passage
  useEffect(() => {
    if (lastActiveRefRef.current !== activeRef) {
      const prevRef = lastActiveRefRef.current;
      lastActiveRefRef.current = activeRef;

      // 1. Sync previous passage commentary to server-side user profile study notebook upon navigating away
      if (prevRef && messages.length > 0) {
        syncElderStephenNotesToNotebook(userKey, prevRef, messages);
      }

      // 2. Load commentary for the newly selected active scripture passage: in-memory map first, then localStorage
      const inMem = inMemoryElderStephenPassageNotes.get(sessionKey);
      if (inMem && inMem.length > 0) {
        setMessages(inMem);
        return;
      }

      try {
        const saved = localStorage.getItem(sessionKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const completed = parsed.map((item: any) =>
              item && item.sender === "elder"
                ? { ...item, text: ensureElderStephenOutlineCompletion(item.text, item.verseRef || activeRef, report?.topic) }
                : item
            );
            inMemoryElderStephenPassageNotes.set(sessionKey, completed);
            setMessages(completed);
            return;
          }
        }
      } catch (e) {}

      // If switching to a new passage that has no saved notes yet, start fresh for that passage
      setMessages([]);
    }
  }, [activeRef, sessionKey, userKey, messages]);

  // Ensure current notes sync to server on component unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeRef && messages.length > 0) {
        syncElderStephenNotesToNotebook(userKey, activeRef, messages);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (activeRef && messages.length > 0) {
        syncElderStephenNotesToNotebook(userKey, activeRef, messages);
      }
    };
  }, [activeRef, messages, userKey]);

  // Auto-adjust textarea height to align with left buttons (72px) and grow with text
  useEffect(() => {
    if (textareaRef.current) {
      if (!inputText.trim()) {
        textareaRef.current.style.height = "72px";
      } else {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.max(72, textareaRef.current.scrollHeight)}px`;
      }
    }
  }, [inputText]);

  // Handle pending prompt from Bible text selection ("Consult Elder Stephen")
  useEffect(() => {
    if (stephenPendingPrompt && stephenPendingPrompt.trim()) {
      const promptToRun = stephenPendingPrompt.trim();
      if (clearStephenPendingPrompt) clearStephenPendingPrompt();
      handleSend(promptToRun, "Selected Text Exegesis");
    }
  }, [stephenPendingPrompt]);

  // Generate initial passage overview or specific verse commentary continuously without wiping existing notes
  useEffect(() => {
    const userName = userProfile?.name || "Berean";

    // 1. Specific verse selected in Bible Reader
    if (activeVerseIndex !== null && report) {
      const loadedVerses = getParallelVerses(report.reference);
      const matched = loadedVerses.find(v => v.verseNumber === activeVerseIndex);
      const verseText = matched ? matched.text.NKJV || matched.text.KJV : "";
      const referenceLabel = `${report.reference.split(":")[0].split(" ")[0]} ${report.reference.split(" ")[1]?.split(":")[0] || ""}:${activeVerseIndex}`;
      const verseBadge = `Verse ${activeVerseIndex} Exegesis`;

      // Check if this verse insight already exists in the continuous session
      const alreadyHasVerseInsight = messages.some(
        m => (m.badge === verseBadge || m.verseRef === referenceLabel) && m.sender === "elder"
      );

      if (alreadyHasVerseInsight) {
        // Already present in current session, retain continuously
        return;
      }

      setLoading(true);

      const payload = {
        currentMode: "Explain" as const,
        contextSummary: `Commentary for verse ${referenceLabel}: "${verseText}" under topic ${report.topic || activeRef}`,
        noteTitle: `Exegesis of ${referenceLabel}`,
        noteContent: verseText,
        userAction: `Generate specific, detailed verse commentary and Great Controversy exegesis for ${referenceLabel}.`,
        historyLog: [
          {
            role: "user" as const,
            text: `Please give me your detailed pastoral commentary and Great Controversy exegesis on ${referenceLabel}: "${verseText}"`
          }
        ]
      };

      callElderStephen(payload)
        .then(res => {
          const completedText = ensureElderStephenOutlineCompletion(res.text, referenceLabel, report?.topic);
          const newNote: ElderCommentaryItem = {
            id: `elder-verse-${activeVerseIndex}-${Date.now()}`,
            sender: "elder",
            text: completedText,
            timestamp: Date.now(),
            badge: verseBadge,
            verseRef: referenceLabel
          };
          setMessages(prev => {
            if (prev.some(m => m.id === newNote.id || (m.badge === verseBadge && m.sender === "elder"))) return prev;
            return [...prev, newNote];
          });
        })
        .catch(() => {
          const fallbackText = getStaticCommentaryForVerse(report.reference, activeVerseIndex, verseText);
          const newNote: ElderCommentaryItem = {
            id: `elder-verse-${activeVerseIndex}-${Date.now()}`,
            sender: "elder",
            text: fallbackText,
            timestamp: Date.now(),
            badge: verseBadge,
            verseRef: referenceLabel
          };
          setMessages(prev => {
            if (prev.some(m => m.id === newNote.id || (m.badge === verseBadge && m.sender === "elder"))) return prev;
            return [...prev, newNote];
          });
        })
        .finally(() => {
          setLoading(false);
          scrollToBottom();
        });

    // 2. No notes at all for current passage - generate initial opening pastoral reflection
    } else if (report && messages.length === 0) {
      setLoading(true);
      const referenceLabel = report.reference;
      const payload = {
        currentMode: "Explain" as const,
        contextSummary: `Exegetical commentary for passage ${referenceLabel}${report.topic ? ` (${report.topic})` : ""}`,
        noteTitle: `Exegesis of ${referenceLabel}`,
        noteContent: report.text || referenceLabel,
        userAction: `Generate specific, detailed pastoral commentary and Great Controversy exegesis for ${referenceLabel}.`,
        historyLog: [
          {
            role: "user" as const,
            text: `Please provide your pastoral commentary and Great Controversy exegesis on ${referenceLabel}.`
          }
        ]
      };

      callElderStephen(payload)
        .then(res => {
          const completedText = ensureElderStephenOutlineCompletion(res.text, referenceLabel, report?.topic);
          const newNote: ElderCommentaryItem = {
            id: `elder-overview-${Date.now()}`,
            sender: "elder",
            text: completedText,
            timestamp: Date.now(),
            badge: "Passage Exegesis",
            verseRef: referenceLabel
          };
          setMessages(prev => (prev.length === 0 ? [newNote] : prev));
        })
        .catch(() => {
          const newNote: ElderCommentaryItem = {
            id: `elder-overview-${Date.now()}`,
            sender: "elder",
            text: `Let us search the scriptures line upon line, precept upon precept. We are currently analyzing **${report.reference}**. How can I assist your study, or would you like me to elaborate on the sanctuary significance and Great Controversy context of this passage?`,
            timestamp: Date.now(),
            badge: "Passage Exegesis",
            verseRef: referenceLabel
          };
          setMessages(prev => (prev.length === 0 ? [newNote] : prev));
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // Cleanup speech synthesis on navigate / unmount
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [report, activeVerseIndex, userProfile, activeRef]);

  const handleSend = async (overrideText?: string, customBadge?: string) => {
    const textToSubmit = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!textToSubmit) return;

    setInputText("");
    const userItem: ElderCommentaryItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSubmit,
      timestamp: Date.now(),
      badge: customBadge || "User Question"
    };

    setMessages(prev => [...prev, userItem]);
    elderContext.addUserMessage({
      text: textToSubmit,
      modeOrigin: "Study",
      passage: activeRef,
      topic: report?.topic || `Study: ${activeRef}`
    });
    setLoading(true);
    handleStopSpeech();
    scrollToBottom();

    try {
      const payload = {
        currentMode: "Explain" as const,
        contextSummary: elderContext.getContextSummaryString(),
        userAction: "chat",
        passage: activeRef,
        historyLog: messages.map(m => ({
          role: m.sender === "user" ? "user" as const : "elder" as const,
          text: m.text
        })).concat([{ role: "user" as const, text: textToSubmit }])
      };

      const res = await callElderStephen(payload);
      const completedText = ensureElderStephenOutlineCompletion(res.text, activeRef, report?.topic);
      const elderItem: ElderCommentaryItem = {
        id: `elder-${Date.now()}`,
        sender: "elder",
        text: completedText,
        timestamp: Date.now(),
        badge: isDynamicLiveActive ? "Interactive Session" : "Elder Stephen Insight"
      };
      setMessages(prev => [...prev, elderItem]);
      elderContext.addElderMessage({
        text: completedText,
        modeOrigin: "Study",
        passage: activeRef,
        topic: report?.topic || `Study: ${activeRef}`,
        badge: isDynamicLiveActive ? "Interactive Session" : "Elder Stephen Insight"
      });
      setLatestLiveResponse(completedText);
      setIsLiveNoteSaved(false);
      if (isDynamicLiveActive) {
        handleSpeakAloudAndResumeListen(completedText);
      }
    } catch (e) {
      const errorItem: ElderCommentaryItem = {
        id: `elder-${Date.now()}`,
        sender: "elder",
        text: "My brother, I encountered a brief network delay. Let us search the Word line upon line, and feel free to repeat your query.",
        timestamp: Date.now(),
        badge: "Elder Stephen Notice"
      };
      setMessages(prev => [...prev, errorItem]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Download Markdown study file directly to user's device
  const handleDownloadStudyFile = (title: string, content: string) => {
    try {
      const sanitizedName = title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
      const filename = `${sanitizedName}_${Date.now()}.md`;
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCopiedToast(`Downloaded study file: ${filename}`);
      setTimeout(() => setCopiedToast(""), 3500);
    } catch (err) {
      console.warn("Failed to download study file:", err);
    }
  };

  // Save complete interactive study session as a Notebook study file
  const handleSaveSessionAsNotebookFile = (options?: { download?: boolean }) => {
    if (messages.length === 0) {
      setCopiedToast("No interactive study messages to save yet.");
      setTimeout(() => setCopiedToast(""), 2500);
      return;
    }

    const sessionDate = new Date();
    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const studyTitle = `Interactive Bible Study: ${activeRef}`;

    const formattedNotes = messages.map(m => {
      const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const speaker = m.sender === "user" ? "Disciple / Student" : "Elder Stephen";
      const header = m.badge ? `### [${m.badge}] ${speaker} (${timeStr})` : `### ${speaker} (${timeStr})`;
      return `${header}\n${m.text.trim()}`;
    }).join("\n\n---\n\n");

    const fullStudyFileContent = `# ${studyTitle}

**Scripture Passage:** ${activeRef}  
**Date Recorded:** ${formattedDate} at ${formattedTime}  
**Guide & Mentor:** Elder Stephen (STBA Bible Study System)  
**Topic:** ${report?.topic || activeRef}  
**Total Dialogue Exchanges:** ${messages.length}  

---

## 📖 Scripture Text Context
> "${report?.text || activeRef}"

---

## 🎙️ Interactive Study Session Dialogue & Exegesis

${formattedNotes}

---

## 🏛️ Doctrinal & Exegetical Synthesis (Historic SDA Hermeneutics)
- **Hermeneutical Authority:** Sola Scriptura — Scripture interprets Scripture (Line upon line, precept upon precept).
- **The Great Controversy:** The character of God vindicated through truth, obedience, and faith in Jesus Christ.
- **Sanctuary & Prophetic Truth:** Typology pointing to Christ's sanctuary ministry and the Three Angels' Messages (Revelation 14:6–12).
- **Practical Application:** Living by every Word that proceeds from the mouth of God.

---
*Captured and exported from the Cognitive Scripture Mastery System (CSMS) • Study To Be Approved (2 Timothy 2:15)*
`;

    // 1. Save directly into user's primary Notebook storage (stba_study_notes_v1)
    const newNote = saveResponseAsNewNote({
      title: studyTitle,
      content: fullStudyFileContent,
      summary: `Interactive study session on ${activeRef} with Elder Stephen (${messages.length} exchanges recorded).`,
      category: "theology",
      scriptureTags: [activeRef, "Elder Stephen", "Interactive Study"]
    });

    // 2. Sync to legacy storage key for backward compatibility
    try {
      const existing = localStorage.getItem("stba_user_notebook_notes");
      const notesList = existing ? JSON.parse(existing) : [];
      notesList.unshift({
        id: newNote.id,
        title: studyTitle,
        content: fullStudyFileContent,
        category: "theology",
        tags: [activeRef, "Elder Stephen", "Interactive Study"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scripture_reference: activeRef
      });
      localStorage.setItem("stba_user_notebook_notes", JSON.stringify(notesList));
    } catch (e) {}

    setIsLiveNoteSaved(true);
    setCopiedToast("Saved interactive study session as Notebook study file! ✓");
    setTimeout(() => setCopiedToast(""), 4500);

    // 3. Optional local study file download
    if (options?.download) {
      handleDownloadStudyFile(studyTitle, fullStudyFileContent);
    }

    return newNote;
  };

  // Backwards compatibility alias
  const handleCopyAllToNotebook = () => handleSaveSessionAsNotebookFile();

  // Save active live response as a new note in the user's Notebook
  const handleSaveLiveResponseAsNote = (textToSave: string) => {
    if (!textToSave.trim()) return;
    try {
      const noteTitle = `Elder Stephen Interactive: ${activeRef}`;
      saveResponseAsNewNote({
        title: noteTitle,
        content: `# ${noteTitle}\n\n**Scripture Passage:** ${activeRef}\n**Session Type:** Live Interactive Session with Elder Stephen\n**Recorded:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\n---\n\n${textToSave.trim()}`,
        summary: textToSave.slice(0, 240).replace(/[#*`>]/g, "").trim() + "...",
        category: "theology",
        scriptureTags: [activeRef]
      });

      setIsLiveNoteSaved(true);
      setCopiedToast("Elder Stephen's response saved as new note in Notebook!");
      setTimeout(() => setCopiedToast(""), 3500);
    } catch (err) {
      console.warn("Error saving live response note:", err);
      setCopiedToast("Failed to save note.");
      setTimeout(() => setCopiedToast(""), 2000);
    }
  };

  // Save an individual Elder Stephen message as a new note in the user's Notebook
  const handleSaveSingleMessageAsNote = (m: ElderCommentaryItem) => {
    try {
      const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const cleanContent = m.text;
      const noteTitle = `Elder Stephen on ${activeRef} (${timeStr})`;
      
      saveResponseAsNewNote({
        title: noteTitle,
        content: `# ${noteTitle}\n\n**Scripture Passage:** ${activeRef}\n**Insight Badge:** ${m.badge || "Elder Stephen Commentary"}\n**Recorded:** ${new Date().toLocaleDateString()} at ${timeStr}\n\n---\n\n${cleanContent}`,
        summary: cleanContent.slice(0, 240).replace(/[#*`>]/g, "").trim() + "...",
        category: "theology",
        scriptureTags: [activeRef]
      });

      setSavedNoteIds(prev => new Set(prev).add(m.id));
      setCopiedToast("Saved as new note in Notebook!");
      setTimeout(() => setCopiedToast(""), 3000);
    } catch (err) {
      console.warn("Error saving note:", err);
      setCopiedToast("Failed to save note.");
      setTimeout(() => setCopiedToast(""), 2000);
    }
  };

  const handleSpeakLiveResponse = (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    if (isSpeaking && currentlySpeakingIdx === -999) {
      handleStopSpeech();
    } else {
      handleSpeak(textToSpeak, -999);
    }
  };

  // Mobile-Responsive Erase Functionality:
  // Each tap removes the last note in sequence, just as it does on desktop
  const handleEraseLastNote = () => {
    if (messages.length === 0) {
      setCopiedToast("No notes to erase.");
      setTimeout(() => setCopiedToast(""), 2000);
      return;
    }

    setMessages(prev => {
      if (prev.length === 0) return prev;
      const updated = prev.slice(0, -1);
      try {
        if (updated.length === 0) {
          localStorage.removeItem(sessionKey);
        } else {
          localStorage.setItem(sessionKey, JSON.stringify(updated));
        }
      } catch (e) {
        console.warn("Error updating session storage after erasing note:", e);
      }
      return updated;
    });

    const isLastOne = messages.length <= 1;
    setCopiedToast(isLastOne ? "All notes erased for this passage." : "Last note erased.");
    setTimeout(() => setCopiedToast(""), 2000);
  };

  const handleDeleteNoteItem = (noteId: string) => {
    setMessages(prev => {
      const updated = prev.filter(m => m.id !== noteId);
      try {
        if (updated.length === 0) {
          localStorage.removeItem(sessionKey);
        } else {
          localStorage.setItem(sessionKey, JSON.stringify(updated));
        }
      } catch (e) {}
      return updated;
    });
    setCopiedToast("Note removed.");
    setTimeout(() => setCopiedToast(""), 1800);
  };

  // 🔊 Text-To-Speech (TTS) Logic
  const handleSpeak = (text: string, idx: number) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported on this browser.");
      return;
    }

    if (currentlySpeakingIdx === idx && isSpeaking) {
      handleStopSpeech();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean up markdown markers for a pure reading cadence
    const parsedText = text
      .replace(/\*\*|###|##|\*/g, "")
      .replace(/[\[\]]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(parsedText);
    utterance.rate = 0.92;
    utterance.pitch = 0.85;

    const bestVoice = getElderStephenVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentlySpeakingIdx(idx);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingIdx(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingIdx(null);
  };

  // 🎙️ Speech-To-Text (STT) Logic
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech dictation is not fully supported on this frame workspace. Try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const captured = (finalTranscript || interim).trim();
      if (captured) {
        setInputText(captured);
      }
    };

    rec.onerror = (e: any) => {
      console.warn("STBA Dictation Notice (handled gracefully):", e.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.warn("Speech capture startup interrupted:", err);
      setIsListening(false);
    }
  };

  return (
    <div
      id="elder-stephen-commentary-pane"
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Top Persistent Session Context Header with Auto-Retract */}
      <AutoRetractToolbar theme={theme}>
        <div className={`px-3 sm:px-4 py-2 border-b flex items-center justify-between gap-2 shrink-0 ${
          theme === "dark" ? "bg-[#161B22] border-[#2C3545]" : "bg-[#F9F7F3] border-[#E8E2D8]"
        }`}>
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-500 truncate tracking-wider">
                Elder Stephen Continuous Session
              </span>
              <div className="flex items-center gap-1.5 truncate">
                <span className={`text-[11px] font-serif truncate font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-stone-800"
                }`}>
                  {activeRef}
                </span>

                {/* Touch-friendly passage switcher trigger for mobile & desktop */}
                {onReferenceChange && (
                  <button
                    onClick={() => setShowPassageSwitcher(!showPassageSwitcher)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 transition-colors cursor-pointer inline-flex items-center gap-0.5 touch-manipulation"
                    title="Switch Bible passage"
                    aria-label="Switch Bible passage"
                  >
                    <span>Switch</span>
                    <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-150 ${showPassageSwitcher ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Interactive Mode Toggle Button */}
            <button
              onClick={handleToggleDynamicInteractiveMode}
              className={`min-h-[40px] px-2.5 py-1.5 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation active:scale-95 ${
                isDynamicLiveActive
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-xs animate-pulse"
                  : theme === "dark"
                    ? "bg-[#1E2530] border-amber-500/40 text-amber-400 hover:bg-[#252E3C]"
                    : "bg-amber-50 border-[#C9973A] text-[#8C6219] hover:bg-amber-100/80 shadow-2xs"
              }`}
              title={isDynamicLiveActive ? "Exit Live Interactive Session" : "Start Live Interactive Session with Elder Stephen"}
            >
              {isDynamicLiveActive ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="hidden sm:inline font-bold">Live Session</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="hidden sm:inline">Interactive</span>
                </>
              )}
            </button>

            {/* Save Interactive Session as Notebook Study File */}
            <button
              onClick={() => handleSaveSessionAsNotebookFile()}
              disabled={messages.length === 0}
              className={`min-h-[40px] px-2.5 py-1.5 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation disabled:opacity-40 active:scale-95 ${
                theme === "dark"
                  ? "bg-[#1E2530] border-[#2C3545] text-amber-400 hover:bg-[#252E3C]"
                  : "bg-white border-stone-300 text-stone-700 hover:bg-amber-50 shadow-2xs"
              }`}
              title="Save complete interactive study session into your personal Notebook"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold">Save Session</span>
              {messages.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-500 font-bold">
                  {messages.length}
                </span>
              )}
            </button>

            {/* Quick Export .md File */}
            <button
              onClick={() => handleSaveSessionAsNotebookFile({ download: true })}
              disabled={messages.length === 0}
              className={`min-h-[40px] px-2 py-1.5 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1 touch-manipulation disabled:opacity-40 active:scale-95 ${
                theme === "dark"
                  ? "bg-[#1E2530] border-[#2C3545] text-stone-300 hover:text-amber-400 hover:bg-[#252E3C]"
                  : "bg-white border-stone-300 text-stone-700 hover:text-amber-700 hover:bg-amber-50 shadow-2xs"
              }`}
              title="Download interactive session as Markdown study file (.md)"
            >
              <Download className="w-3.5 h-3.5 text-stone-400 hover:text-amber-500" />
              <span className="hidden sm:inline">.md</span>
            </button>

            {/* Mobile-Responsive Erase Button:
                - Easily tappable on mobile devices (min 44x44px touch target)
                - Each tap removes the last note in sequence, just as it does on desktop
            */}
            <button
              onClick={handleEraseLastNote}
              disabled={messages.length === 0}
              className={`min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] p-2 sm:p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 touch-manipulation active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                theme === "dark"
                  ? "bg-[#1E2530] border-[#2C3545] text-stone-300 hover:text-rose-400 hover:bg-[#252E3C] active:bg-rose-950/40"
                  : "bg-white border-stone-300 text-stone-700 hover:text-rose-600 hover:bg-rose-50 shadow-2xs active:bg-rose-100"
              }`}
              title="Erase last note in sequence"
              aria-label="Erase last note in sequence"
            >
              <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-stone-500 hover:text-rose-500 transition-colors" />
              <span className="hidden lg:inline text-[10px] font-mono font-medium">Erase</span>
            </button>
          </div>
        </div>

        {/* Mobile & Desktop Quick Passage Switcher Dropdown */}
        {showPassageSwitcher && onReferenceChange && (
          <div className={`px-4 py-3 border-b text-xs space-y-2 animate-in fade-in slide-in-from-top-1 ${
            theme === "dark" ? "bg-[#1E2530] border-[#2C3545]" : "bg-[#FAF7F2] border-[#E8E2D8]"
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-amber-500">
                Switch Scripture Passage
              </span>
              <button
                onClick={() => setShowPassageSwitcher(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Passage Preset Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Revelation 14:6-12",
                "Exodus 20:8-11",
                "2 Timothy 2:15",
                "Daniel 8:14",
                "John 14:1-3",
                "Romans 6:23"
              ].map(preset => (
                <button
                  key={preset}
                  onClick={() => {
                    onReferenceChange(preset);
                    setShowPassageSwitcher(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-serif border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                    activeRef.toLowerCase() === preset.toLowerCase()
                      ? "bg-[#C9973A] text-white border-[#C9973A] font-bold"
                      : theme === "dark"
                        ? "bg-[#161B22] border-[#30363D] text-gray-300 hover:border-amber-500/50"
                        : "bg-white border-stone-300 text-stone-700 hover:border-amber-500/50"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom Passage Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (switcherInput.trim()) {
                  onReferenceChange(switcherInput.trim());
                  setSwitcherInput("");
                  setShowPassageSwitcher(false);
                }
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={switcherInput}
                onChange={(e) => setSwitcherInput(e.target.value)}
                placeholder="Or type custom reference (e.g., Hebrews 4:9-11)..."
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none font-serif ${
                  theme === "dark"
                    ? "bg-[#161B22] border-[#30363D] text-gray-200 focus:border-amber-500"
                    : "bg-white border-stone-300 text-stone-800 focus:border-amber-500"
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#C9973A] hover:bg-[#b58532] text-white text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer touch-manipulation active:scale-95"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </AutoRetractToolbar>

      {/* Toast alert with optional navigation to Notebook */}
      {copiedToast && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{copiedToast}</span>
          </div>
          {onNavigateTab && copiedToast.includes("Notebook") && (
            <button
              type="button"
              onClick={() => onNavigateTab("notebook")}
              className="text-[11px] underline font-bold hover:text-amber-300 ml-2 cursor-pointer flex items-center gap-1"
            >
              <span>View in Notebook</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}

      {/* Sleek, Non-Intrusive Live Interactive Session Bar */}
      {isDynamicLiveActive && (
        <div className={`px-3 py-1.5 border-b flex items-center justify-between text-xs font-mono shrink-0 select-none ${
          theme === "dark" ? "bg-[#101826] border-[#1E2D44] text-amber-400" : "bg-amber-50/80 border-amber-200 text-amber-800"
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-500 shrink-0">Live Oral Session</span>
            <span className="text-[10px] opacity-75 truncate hidden sm:inline">• {activeRef}</span>
            <span className="text-[10px] font-sans italic opacity-85 truncate">
              {liveState === "playing" || isSpeaking
                ? "— Elder Stephen is speaking..."
                : liveState === "recording"
                  ? "— Listening to you speak..."
                  : "— Speak into mic or type below"}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              type="button"
              className={`p-1 rounded border transition-colors cursor-pointer text-[10px] flex items-center gap-1 ${
                isMicMuted
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                  : theme === "dark"
                    ? "bg-[#1E2530] border-[#2C3545] text-stone-300 hover:text-amber-400"
                    : "bg-white border-stone-300 text-stone-700 hover:text-amber-600"
              }`}
              title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMicMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
              <span className="hidden md:inline">{isMicMuted ? "Muted" : "Live"}</span>
            </button>
            <button
              onClick={() => cleanupLiveSession(true)}
              type="button"
              className={`p-1 rounded border transition-colors cursor-pointer text-[10px] flex items-center gap-1 ${
                theme === "dark"
                  ? "bg-[#1E2530] border-[#2C3545] text-stone-400 hover:text-rose-400"
                  : "bg-white border-stone-300 text-stone-500 hover:text-rose-600"
              }`}
              title="Exit Interactive Mode"
            >
              <X className="w-3 h-3" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable continuous messages and notes stream */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {messages.map((m, idx) => (
          <div key={m.id || idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed relative group ${
              m.sender === "user"
                ? "bg-[#C9973A] text-white rounded-br-none"
                : theme === "dark"
                  ? "bg-[#1E2530] text-gray-200 border border-[#2C3545] rounded-bl-none shadow-xs elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased"
                  : "bg-[#F3EFE9] text-gray-800 border border-[#E5DFD5] rounded-bl-none shadow-xs elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased"
            }`}>
              
              {/* Header Title with Badge, Timestamp and Audio read-aloud buttons */}
              <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-wider mb-1.5 opacity-80 border-b pb-1 border-current/15">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">{m.sender === "user" ? "You" : "Elder Stephen"}</span>
                  {m.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono ${
                      m.sender === "user"
                        ? "bg-white/20 text-white"
                        : "bg-amber-500/20 text-amber-500 font-semibold"
                    }`}>
                      {m.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {m.sender === "elder" && (
                    <>
                      <button
                        onClick={() => handleSpeak(m.text, idx)}
                        className="p-1 -mr-0.5 rounded hover:bg-stone-500/10 hover:text-amber-500 transition-colors cursor-pointer flex items-center gap-1 text-[8px] font-mono leading-none border-none outline-none touch-manipulation"
                        title={currentlySpeakingIdx === idx ? "Mute Readback" : "Listen Aloud"}
                      >
                        {currentlySpeakingIdx === idx ? (
                          <>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <VolumeX className="w-2.5 h-2.5 animate-pulse text-amber-500" />
                            <span>MUTE</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-2.5 h-2.5 text-amber-500" />
                            <span>LISTEN</span>
                          </>
                        )}
                      </button>

                      {/* Save to Notebook as New Note */}
                      <button
                        onClick={() => handleSaveSingleMessageAsNote(m)}
                        disabled={savedNoteIds.has(m.id)}
                        className={`p-1 rounded hover:bg-stone-500/10 transition-colors cursor-pointer flex items-center gap-1 text-[8px] font-mono leading-none border-none outline-none touch-manipulation ${
                          savedNoteIds.has(m.id)
                            ? "text-emerald-500 font-bold"
                            : "text-stone-400 hover:text-amber-500"
                        }`}
                        title={
                          savedNoteIds.has(m.id)
                            ? "Saved in Notebook as note"
                            : "Save this response as a new note in your Notebook"
                        }
                      >
                        {savedNoteIds.has(m.id) ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                            <span>SAVED</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-2.5 h-2.5 text-amber-500" />
                            <span>SAVE NOTE</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {/* Individual note trashcan for selective mobile or desktop removal */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNoteItem(m.id);
                    }}
                    className="p-1 min-w-[28px] min-h-[28px] rounded text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center touch-manipulation opacity-60 hover:opacity-100"
                    title="Erase this note"
                    aria-label="Erase this note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className={`whitespace-pre-line select-text pr-2 leading-relaxed ${
                m.sender !== "user"
                  ? "elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] antialiased"
                  : ""
              }`}>{m.sender === "elder" ? ensureElderStephenOutlineCompletion(m.text, m.verseRef || activeRef, report?.topic) : m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-xl px-4 py-2.5 text-xs font-mono animate-pulse flex items-center gap-2 ${
              theme === "dark" ? "bg-[#1E2530] text-amber-500/90 border border-[#2C3545]" : "bg-[#F3EFE9] text-[#C9973A] border border-[#E5DFD5]"
            }`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Elder Stephen is unrolling historical parchments...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input panel with Interactive Mode & Microphone dictation */}
      <div
        id="elder-stephen-input-panel"
        className={`pt-2.5 px-3 border-t flex items-end gap-2 shrink-0 transition-all duration-300 ease-in-out will-change-[padding] ${
          isBottomBarVisible ? "pb-[72px] md:pb-2.5" : "pb-7 md:pb-2.5"
        } ${
          theme === "dark" ? "border-[#2C3545] bg-[#161B22]" : "border-[#E5DFD5] bg-[#FAF8F5]"
        }`}
      >
        
        {/* Left Action Buttons Column: Interactive Mode button ABOVE Dictate button (total height 72px) */}
        <div className="flex flex-col gap-1.5 shrink-0 items-center justify-end self-end m-0 pb-0">
          
          {/* Dynamic Interactive Mode Button (Above Dictate button) */}
          <button
            type="button"
            onClick={handleToggleDynamicInteractiveMode}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer relative flex items-center justify-center gap-1 border h-[28px] m-0 ${
              isDynamicLiveActive
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/10 animate-pulse"
                : theme === "dark"
                  ? "bg-[#1E2530] border-amber-500/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400"
                  : "bg-amber-50 border-[#C9973A] text-[#C9973A] hover:bg-amber-100/80 shadow-2xs"
            }`}
            title={
              isDynamicLiveActive
                ? "Exit Dynamic Interactive Mode"
                : "Interactive Mode: Speak directly to Elder Stephen for live dynamic discussion"
            }
          >
            {isDynamicLiveActive ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wide">
                  LIVE
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#C9973A] animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-tight">
                  Interactive
                </span>
              </>
            )}
          </button>

          {/* Dictate Button (Underneath Interactive Button) */}
          <button
            onClick={handleToggleVoiceInput}
            type="button"
            className={`p-2 rounded-lg transition-all cursor-pointer relative flex items-center justify-center shrink-0 border h-[38px] w-full self-stretch m-0 ${
              isListening
                ? "bg-rose-500/15 border-rose-500 text-rose-500 animate-pulse scale-105"
                : theme === "dark"
                  ? "bg-[#1C2028] border-[#2C3545] text-gray-400 hover:text-amber-500"
                  : "bg-stone-100 border-gray-300 text-stone-600 hover:text-[#C9973A]"
            }`}
            title={isListening ? "Stop voice listening" : "Dictate your question"}
          >
            <Mic className={`w-4 h-4 ${isListening ? "stroke-[2.5]" : ""}`} />
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Text Input (72px height to align horizontally with the top of the Interactive button) */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            isDynamicLiveActive
              ? "🎙️ Live Mode Active: Speak directly to Elder Stephen, or type here..."
              : isListening 
                ? "Listening... Speak clearly to dictate 🎙️" 
                : "Ask Elder Stephen about history, typology, or doctrine..."
          }
          disabled={loading}
          rows={2}
          className={`flex-1 m-0 self-end rounded-lg px-3 py-2 text-xs sm:text-sm outline-none transition-colors resize-none h-[72px] min-h-[72px] max-h-36 overflow-y-auto leading-relaxed text-left ${
            isDynamicLiveActive
              ? theme === "dark"
                ? "bg-[#16202E] text-white border-2 border-emerald-500/60 focus:border-emerald-400 shadow-inner"
                : "bg-emerald-50/40 text-gray-800 border-2 border-emerald-500/60 focus:border-emerald-500 shadow-inner"
              : theme === "dark" 
                ? "bg-[#1C2028] text-white border border-[#2C3545] focus:border-amber-500 disabled:opacity-50" 
                : "bg-white text-gray-800 border border-gray-300 focus:border-[#C9973A] disabled:opacity-50"
          }`}
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          className="bg-[#C9973A] hover:bg-[#B2822B] text-white p-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shrink-0 h-[38px] w-[38px] m-0 flex items-center justify-center self-end"
          title="Send question to Elder Stephen"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


// ==========================================
// TOOL 2: NOTEBOOK
// ==========================================
const CATEGORY_LABELS: Record<NoteCategory, string> = {
  'all': 'All Categories',
  'theology': 'Theology',
  'biblical-studies': 'Biblical Studies',
  'history': 'History',
  'personal-growth': 'Personal Growth',
  'custom': 'Custom'
};

export const STBANotebook: React.FC<ToolProps> = ({
  theme,
  addedNoteText,
  addedNoteRef,
  clearAddedNoteInline,
  onReferenceChange,
  activeVerseIndex,
  setActiveVerseIndex,
  notebookFontSize,
  setNotebookFontSize
}) => {
  const navigate = useNavigate();
  const { user } = useApp();

  const [localNotebookFontSize, setLocalNotebookFontSize] = useState<number>(() => {
    const saved = localStorage.getItem(`stba_notebookFontSize_${user?.email || "guest"}`);
    return saved !== null ? Number(saved) : 14;
  });

  const fontSize = notebookFontSize !== undefined ? notebookFontSize : localNotebookFontSize;
  const setFontSize = setNotebookFontSize !== undefined ? setNotebookFontSize : setLocalNotebookFontSize;

  const handleUpdateFontSize = (newSize: number) => {
    const clamped = Math.min(28, Math.max(11, newSize));
    setFontSize(clamped);
    localStorage.setItem(`stba_notebookFontSize_${user?.email || "guest"}`, String(clamped));
  };

  // Helper handler to click scripture references, loading them and highlighting the correct verse
  const handleScriptureRefClick = (ref: string) => {
    if (!ref) return;
    // Load the selected reference & sync other panels
    if (onReferenceChange) {
      onReferenceChange(ref);
    }
    
    // Check if tag specifies a specific verse, e.g. "Revelation 14:12" or "Rev 14:6"
    const colonIndex = ref.indexOf(":");
    if (colonIndex !== -1 && setActiveVerseIndex) {
      const remainingIdx = ref.substring(colonIndex + 1);
      const matchDigits = remainingIdx.match(/^(\d+)/);
      if (matchDigits) {
        const verseNum = parseInt(matchDigits[1], 10);
        if (!isNaN(verseNum)) {
          // Highlight after brief state update
          setTimeout(() => {
            setActiveVerseIndex(verseNum);
          }, 350);
        }
      }
    }
  };
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("biblical-studies");
  const [categories, setCategories] = useState<Record<string, { label: string; code: string; color: string }>>(() => loadCategories());

  // Helper for dynamic 2-letter labels on categories without ellipsis
  const getCategoryAbbreviation = (catKey: string, currentCode: string) => {
    switch (catKey) {
      case 'all': return 'AL'
      case 'theology': return 'TY'
      case 'history': return 'HY'
      case 'personal-growth': return 'PH'
      case 'biblical-studies': return 'BS'
      case 'custom': return 'CM'
      default: {
        if (currentCode && currentCode.length >= 2) {
          return currentCode.substring(0, 2).toUpperCase()
        }
        if (currentCode && currentCode.length === 1) {
          return (currentCode + 'C').toUpperCase().substring(0, 2)
        }
        return 'CC'
      }
    }
  }

  // Helper for dynamic translucent card colors for vertical tabs
  const getCategoryTabBg = (catKey: string, catColor: string, hoverState: boolean = false) => {
    const opacity = hoverState ? 0.30 : 0.15
    const defaults: Record<string, string> = {
      all: `rgba(154,148,144,${opacity})`,
      theology: `rgba(197,160,89,${opacity})`,
      history: `rgba(123,158,190,${opacity})`,
      'personal-growth': `rgba(168,197,160,${opacity})`,
      'biblical-studies': `rgba(78,205,196,${opacity})`,
      custom: `rgba(192,132,252,${opacity})`
    }
    
    if (defaults[catKey]) return defaults[catKey]
    
    // Convert hex catColor to rgba
    let hex = catColor || '#C5A059'
    if (hex.startsWith('#')) {
      hex = hex.slice(1)
    }
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('')
    }
    const r = parseInt(hex.substring(0, 2), 16) || 197
    const g = parseInt(hex.substring(2, 4), 16) || 160
    const b = parseInt(hex.substring(4, 6), 16) || 89
    return `rgba(${r},${g},${b},${opacity})`
  }
  
  // Custom overlay states
  const [showOpenList, setShowOpenList] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const skipNextSaveRef = useRef(false);
  const lastSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const refreshNotes = () => {
    const list = loadNotes();
    setNotes(list);
    setCategories(loadCategories());
    return list;
  };

  const selectNote = (note: StudyNote) => {
    lastSelectedIdRef.current = note.id;
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setShowOpenList(false);
    setSaveStatus("idle");
    skipNextSaveRef.current = true;
  };

  // Initialize: Load first study note, or a fresh blank note if empty
  useEffect(() => {
    const list = refreshNotes();
    if (list.length > 0) {
      selectNote(list[0]);
    } else {
      // Default blank template is always pre-selected
      const defaultNote: StudyNote = {
        id: "draft",
        title: "New Study Page",
        content: "",
        category: "biblical-studies",
        scriptureTags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
        order: 0,
        summary: "",
        isFavorite: false
      };
      setSelectedNote(defaultNote);
      setTitle(defaultNote.title);
      setContent(defaultNote.content);
      setCategory(defaultNote.category);
      lastSelectedIdRef.current = defaultNote.id;
      skipNextSaveRef.current = true;
    }
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (selectedNote && selectedNote.id !== lastSelectedIdRef.current) {
      return;
    }

    if (
      selectedNote &&
      (title !== selectedNote.title ||
        content !== selectedNote.content ||
        category !== selectedNote.category)
    ) {
      const delayDebounce = setTimeout(() => {
        if (!title.trim()) return;
        setSaveStatus("saving");

        const resolvedId = (selectedNote?.id && !selectedNote.id.startsWith("new") && selectedNote.id !== "draft" && !selectedNote.id.startsWith("note-draft")) 
          ? selectedNote.id 
          : "note-" + Date.now();

        const itemToSave: StudyNote = {
          id: resolvedId,
          title: title.trim(),
          content: content.trim(),
          category: (category === 'all' ? 'biblical-studies' : category) as Exclude<NoteCategory, 'all'>,
          scriptureTags: selectedNote?.scriptureTags || [],
          createdAt: (selectedNote?.createdAt && selectedNote.id !== "draft" && !selectedNote.id.startsWith("note-draft")) ? selectedNote.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: selectedNote?.children || [],
          order: selectedNote?.order || 0,
          summary: content.substring(0, 60),
          isFavorite: selectedNote?.isFavorite || false
        };

        const currentSaved = loadNotes();
        const cleanNotes = currentSaved.filter(n => n.id !== itemToSave.id);
        const newList = [itemToSave, ...cleanNotes];
        
        saveNotes(newList);
        setNotes(newList);
        setSelectedNote(itemToSave);

        // Save to Supabase in background if available
        if (user) {
          saveNoteToSupabase(itemToSave).then(dbId => {
            if (dbId && dbId !== itemToSave.id) {
              const updatedItem = { ...itemToSave, id: dbId };
              const updatedSaved = loadNotes().map(n => n.id === itemToSave.id ? updatedItem : n);
              saveNotes(updatedSaved);
              setNotes(updatedSaved);
              setSelectedNote(updatedItem);
            }
          }).catch(err => {
            console.warn("Supabase background save skipped or failed, local fallback saved successfully:", err);
          });
        }

        setSaveStatus("saved");
        const timer = setTimeout(() => setSaveStatus("idle"), 1500);
        return () => clearTimeout(timer);
      }, 1000);

      return () => clearTimeout(delayDebounce);
    }
  }, [title, content, category, user]);

  // Listen to external note additions (e.g. from SDABC, Elder Stephen, Bible Reader)
  useEffect(() => {
    const handleNotebookUpdate = () => {
      const refreshed = loadNotes();
      setNotes(refreshed);
      if (refreshed.length > 0) {
        selectNote(refreshed[0]);
      }
    };
    window.addEventListener("stba_notebook_updated", handleNotebookUpdate);
    window.addEventListener("storage", handleNotebookUpdate);
    return () => {
      window.removeEventListener("stba_notebook_updated", handleNotebookUpdate);
      window.removeEventListener("storage", handleNotebookUpdate);
    };
  }, []);

  // Realtime subscription and initial load from Supabase for RightPaneTools
  useEffect(() => {
    let active = true;

    async function loadFromSupabase() {
      try {
        const conn = await checkSupabaseConnection();
        if (conn.ok && active) {
          // Load categories from stba_study_categories table
          if (await checkCategoriesTable()) {
            const dbCategories = await fetchCategoriesFromSupabase();
            if (active && dbCategories) {
              setCategories(dbCategories);
            }
          }
          
          // Load notes from stba_study_notes table and safely merge with local notes
          const dbNotes = await fetchNotesFromSupabase();
          const localNotes = loadNotes();
          const mergedMap = new Map<string, StudyNote>();
          localNotes.forEach(n => mergedMap.set(n.id, n));
          if (dbNotes && dbNotes.length > 0) {
            dbNotes.forEach(cn => {
              const ln = mergedMap.get(cn.id);
              if (!ln || new Date(cn.updatedAt) >= new Date(ln.updatedAt)) {
                mergedMap.set(cn.id, cn);
              }
            });
          }
          const mergedList: StudyNote[] = (Array.from(mergedMap.values()) as StudyNote[]).sort((a: StudyNote, b: StudyNote) => {
            if ((a.order ?? 0) !== (b.order ?? 0)) {
              return (a.order ?? 0) - (b.order ?? 0);
            }
            return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
          });

          if (active && mergedList.length > 0) {
            saveNotes(mergedList);
            setNotes(mergedList);
            
            // Re-select currently selected note or first note
            setSelectedNote((prev) => {
              if (prev) {
                const found = mergedList.find(n => n.id === prev.id);
                if (found) {
                  setTitle(found.title);
                  setContent(found.content);
                  setCategory(found.category);
                  return found;
                }
              }
              const first = mergedList[0];
              setTitle(first.title);
              setContent(first.content);
              setCategory(first.category);
              return first;
            });
          }
        }
      } catch (err) {
        console.warn("Error initial loading from Supabase in RightPaneTools:", err);
      }
    }

    loadFromSupabase();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime-stba-workspace-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stba_study_categories' },
        async () => {
          try {
            const dbCategories = await fetchCategoriesFromSupabase()
            if (active && dbCategories) {
              setCategories(dbCategories);
            }
          } catch (e) {
            console.error('Error in realtime category sync of RightPaneTools:', e);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stba_study_notes' },
        async () => {
          try {
            const dbNotes = await fetchNotesFromSupabase()
            if (active && dbNotes && dbNotes.length > 0) {
              setNotes(dbNotes);
              setSelectedNote((prev) => {
                if (prev) {
                  const found = dbNotes.find(n => n.id === prev.id);
                  if (found) {
                    setTitle(prevTitle => (prevTitle === prev.title ? found.title : prevTitle));
                    setContent(prevContent => (prevContent === prev.content ? found.content : prevContent));
                    setCategory(found.category);
                    return found;
                  }
                }
                return prev;
              });
            }
          } catch (e) {
            console.error('Error in realtime notes sync of RightPaneTools:', e);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle incoming selection-based note transfers from parallel reader
  useEffect(() => {
    if (addedNoteText && addedNoteRef) {
      const incomingNote: StudyNote = {
        id: "new-" + Date.now(),
        title: `Study of ${addedNoteRef}`,
        content: `> "${addedNoteText}"\n\n- Scripture Tag: ${addedNoteRef}\n- Reflections: `,
        category: "biblical-studies",
        scriptureTags: [addedNoteRef],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
        order: 0,
        summary: addedNoteText.substring(0, 60),
        isFavorite: false
      };
      selectNote(incomingNote);
      if (clearAddedNoteInline) {
        clearAddedNoteInline();
      }
    }
  }, [addedNoteText, addedNoteRef]);

  const handleCreateNew = () => {
    const freshNote: StudyNote = {
      id: "note-draft-" + Date.now(),
      title: "Untitled Study Page",
      content: "",
      category: "biblical-studies",
      scriptureTags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
      order: 0,
      summary: "",
      isFavorite: false
    };
    selectNote(freshNote);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    setSaveStatus("saving");

    const resolvedId = (selectedNote?.id && !selectedNote.id.startsWith("new") && selectedNote.id !== "draft" && !selectedNote.id.startsWith("note-draft")) 
      ? selectedNote.id 
      : "note-" + Date.now();

    const itemToSave: StudyNote = {
      id: resolvedId,
      title: title.trim(),
      content: content.trim(),
      category: (category === 'all' ? 'biblical-studies' : category) as Exclude<NoteCategory, 'all'>,
      scriptureTags: selectedNote?.scriptureTags || [],
      createdAt: (selectedNote?.createdAt && selectedNote.id !== "draft" && !selectedNote.id.startsWith("note-draft")) ? selectedNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: selectedNote?.children || [],
      order: selectedNote?.order || 0,
      summary: content.substring(0, 60),
      isFavorite: selectedNote?.isFavorite || false
    };

    const currentSaved = loadNotes();
    const cleanNotes = currentSaved.filter(n => n.id !== itemToSave.id);
    const newList = [itemToSave, ...cleanNotes];
    
    saveNotes(newList);
    setNotes(newList);
    setSelectedNote(itemToSave);

    // Save to Supabase in background if user is authenticated
    if (user) {
      saveNoteToSupabase(itemToSave).then(dbId => {
        if (dbId && dbId !== itemToSave.id) {
          const updatedItem = { ...itemToSave, id: dbId };
          const updatedSaved = loadNotes().map(n => n.id === itemToSave.id ? updatedItem : n);
          saveNotes(updatedSaved);
          setNotes(updatedSaved);
          setSelectedNote(updatedItem);
        }
      }).catch(err => {
        console.warn("Supabase background save skipped or failed, local fallback saved successfully:", err);
      });
    }

    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 400);
  };

  const handleDelete = (id: string) => {
    const list = loadNotes();
    const newList = list.filter(n => n.id !== id);
    saveNotes(newList);
    setNotes(newList);

    // Delete from Supabase in background if authenticated
    if (user && id && !id.startsWith("note-draft") && id !== "draft") {
      deleteNoteFromSupabase(id).catch(err => {
        console.warn("Supabase background delete failed or table not found:", err);
      });
    }

    // After deleting, load the next available note or start a blank draft
    if (newList.length > 0) {
      selectNote(newList[0]);
    } else {
      handleCreateNew();
    }
  };

  // Filter notes based on the selected category and search input inside Open Note popup
  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchesCategory = category === "all" || n.category === category;
    const matchesSearch = n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full relative overflow-hidden select-none">
      {/* Sleek Persistent Header with Control Options and Auto-Retract */}
      <AutoRetractToolbar theme={theme}>
        <div className={`p-3.5 border-b shrink-0 flex items-center justify-between gap-2 z-30 ${
          theme === "dark" ? "bg-[#161B22] border-[#21262D]" : "bg-[#FAF7F2] border-[#E5DFD5]"
        }`}>
          <div className="flex items-center gap-1.5">
            {/* Open Notebook Trigger */}
            <button
              onClick={() => {
                navigate("/notebook");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                theme === "dark"
                  ? "bg-[#1F242C] border-[#30363D] text-gray-200 hover:bg-[#2F3642]"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              title="Go to full Scripture Master Notebook"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden leading-none xs:inline">Full Screen</span>
            </button>

            {/* Saved Scrolls Trigger */}
            <button
              onClick={() => setShowOpenList(!showOpenList)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                showOpenList
                  ? theme === "dark"
                    ? "bg-[#252E3C] border-[#388BFD] text-white"
                    : "bg-amber-50 border-amber-500 text-gray-900"
                  : theme === "dark"
                    ? "bg-[#1E2530] border-[#30363D] text-gray-300 hover:bg-[#252E3C] hover:text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              title="Browse all saved scrolls/notes in this right panel"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Saved Pages</span>
            </button>

            {/* New Page Trigger */}
            <button
              onClick={handleCreateNew}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                theme === "dark"
                  ? "bg-[#1E2530] border-[#30363D] text-gray-300 hover:bg-[#252E3C] hover:text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              title="Create a new clean study canvas"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">New Page</span>
            </button>
          </div>

          {/* Action Controls for Active Note */}
          <div className="flex items-center gap-1.5">
            {selectedNote && !selectedNote.id.startsWith("note-draft") && selectedNote.id !== "draft" && (
              <button
                 onClick={() => handleDelete(selectedNote.id)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                  theme === "dark"
                    ? "border-red-900/30 text-rose-400 hover:bg-red-900/20"
                    : "border-red-200 text-rose-600 hover:bg-red-50"
                }`}
                title="Permanently incinerate this study page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Auto-saving status indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/10 border border-stone-800/10 dark:bg-[#1A1F26] dark:border-[#2C3545] rounded-lg text-xs font-mono select-none">
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--nb-gold)]" />
                  <span className="text-[var(--nb-gold)] font-bold">Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Auto-saved</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-stone-400">Saved</span>
                </>
              )}
            </div>
          </div>
        </div>
      </AutoRetractToolbar>

      {/* Floating Dialogue: Open Note list of Saved Scrolls */}
      {showOpenList && (
        <div className={`absolute top-[52px] left-2 right-2 max-h-[85%] rounded-xl shadow-2xl z-50 flex flex-col border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
          theme === "dark" 
            ? "bg-[#1F242C] border-[#2E3643]" 
            : "bg-white border-[#E6E1D8]"
        }`}>
          {/* Quick Filter Search Header */}
          <div className={`p-3 border-b flex items-center gap-2 ${
            theme === "dark" ? "border-[#2E3643]" : "border-stone-200"
          }`}>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search note titles or scriptures content..."
              className={`bg-transparent text-xs w-full focus:outline-none border-none ${
                theme === "dark" ? "text-gray-200 placeholder-gray-500" : "text-gray-800 placeholder-gray-450"
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className={`text-[9px] font-mono underline cursor-pointer ${
                  theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Clear
              </button>
            )}
          </div>

          {/* List content stack */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[295px]">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                const isActive = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2.5 justify-between ${
                      isActive
                        ? theme === "dark"
                          ? "bg-[#161D26] border-[#388BFD] text-white"
                          : "bg-amber-50/50 border-amber-500 text-gray-900"
                        : theme === "dark"
                          ? "bg-[#171B20] border-transparent hover:bg-[#252E3C] hover:border-gray-700 text-gray-300"
                          : "bg-[#FDFAF5] border-transparent hover:bg-[#FAF0E1] text-gray-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="font-serif text-xs font-bold truncate block">{note.title}</span>
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1 rounded shrink-0 ${
                          theme === "dark" ? "bg-amber-500/10 text-amber-500" : "bg-amber-100 text-amber-850"
                        }`}>
                          {note.category}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-gray-550"}`}>
                        {note.content ? note.content.replace(/>/g, "").trim() : "Empty study page..."}
                      </p>
                      {note.scriptureTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {note.scriptureTags.map((t, idx) => (
                            <button
                              key={idx} 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScriptureRefClick(t);
                              }}
                              className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm border cursor-pointer hover:border-amber-550 hover:text-amber-500 transition-colors ${
                                theme === "dark"
                                  ? "text-gray-300 bg-slate-800/40 border-slate-700 hover:bg-slate-700/40"
                                  : "text-gray-700 bg-stone-105 border-stone-200 hover:bg-stone-200"
                              }`}
                              title={`Load and highlight ${t}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="text-gray-500 hover:text-red-500 p-1 rounded transition-colors self-center shrink-0 cursor-pointer"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs font-mono">
                No matching preserved pages.
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-700/30 text-center shrink-0 bg-black/10">
            <button
              onClick={() => setShowOpenList(false)}
              className="text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Close Notebook Drawer
            </button>
          </div>
        </div>
      )}

      {/* Editor Space: Stretches directly to the bottom panel */}
      <div className="flex-1 flex flex-col px-6 sm:px-7 pt-6 pb-6 space-y-5 overflow-hidden select-text">
        {/* Note Title Input with Text Size Adjuster on the right side, inline with the title */}
        <div className="flex items-center justify-between gap-3 shrink-0 border-b pb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your study page..."
            className={`flex-1 outline-none text-base sm:text-lg font-serif font-bold transition-colors focus:border-blue-500 bg-transparent ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          />

          {/* Text Size Adjuster inline with the title (Bible App style) */}
          <div 
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg border text-xs shrink-0 select-none ${
              theme === "dark" ? "bg-[#1C212B] border-[#2C3545]" : "bg-white border-gray-300"
            }`}
            onWheel={(e) => {
              e.preventDefault();
              if (e.deltaY < 0) {
                handleUpdateFontSize(fontSize + 1);
              } else if (e.deltaY > 0) {
                handleUpdateFontSize(fontSize - 1);
              }
            }}
            title="Scroll mouse wheel over slider or drag to adjust notebook text size"
          >
            <button 
              type="button"
              onClick={() => handleUpdateFontSize(fontSize - 1)}
              className="text-[10px] font-mono font-bold text-gray-400 hover:text-amber-500 px-0.5 cursor-pointer"
              title="Decrease Text Size"
            >
              A-
            </button>
            <input 
              type="range" 
              min="11" 
              max="28" 
              value={fontSize}
              onChange={(e) => handleUpdateFontSize(parseInt(e.target.value, 10))}
              className="w-12 sm:w-20 h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" 
              title="Text Size Scaling"
            />
            <button 
              type="button"
              onClick={() => handleUpdateFontSize(fontSize + 1)}
              className="text-[12px] font-mono font-bold text-gray-400 hover:text-amber-500 px-0.5 cursor-pointer"
              title="Increase Text Size"
            >
              A+
            </button>
            <span className="text-[10px] font-mono text-amber-500 font-extrabold min-w-[28px] text-right">
              {fontSize}px
            </span>
          </div>
        </div>

        {/* Note categorization / tags control inline details */}
        <div className="text-xs shrink-0 select-none">
          <div className="relative w-full" ref={categoryDropdownRef}>
            <label className="block text-[9px] uppercase font-mono tracking-wider font-extrabold text-gray-400 mb-1">
              Doctrinal Category
            </label>
            <button
               type="button"
               onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
               className={`w-full flex items-center justify-between p-2 rounded-lg border text-left outline-none transition-all cursor-pointer ${
                 theme === "dark" 
                   ? "border-[#2C3545] text-white focus:border-blue-500" 
                   : "border-gray-250 text-gray-800 focus:border-[#C9973A]"
               }`}
              style={{
                backgroundColor: getCategoryTabBg(category, categories[category]?.color || "#C5A059"),
                borderLeftWidth: "3px",
                borderLeftColor: categories[category]?.color || "#C5A059"
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span 
                  className="w-6 h-5 flex items-center justify-center text-[10px] font-bold rounded px-1 shrink-0 font-mono"
                  style={{ 
                    backgroundColor: "rgba(0,0,0,0.2)",
                    color: categories[category]?.color || "#C5A059",
                    border: `1px solid ${categories[category]?.color}33`
                  }}
                >
                  {getCategoryAbbreviation(category, categories[category]?.code || "B")}
                </span>
                <span className="truncate font-medium font-sans text-xs">{categories[category]?.label || category}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
            </button>

            {showCategoryDropdown && (
              <div 
                className={`absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-xl transition-all ${
                  theme === "dark"
                    ? "bg-[#1C2028] border-[#2C3545] text-white shadow-[#000000]/60"
                    : "bg-white border-gray-200 text-gray-800 shadow-gray-200/50"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.keys(categories).map((cat) => {
                  const isSelected = category === cat;
                  const catMeta = categories[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat as NoteCategory);
                        setShowCategoryDropdown(false);
                        
                        // Immediately reveal notes inside this category
                        setShowOpenList(true);

                        // If NOT selecting virtual 'all' category, and active note exists, update its category
                        if (cat !== "all" && selectedNote) {
                          const updatedNote: StudyNote = {
                            ...selectedNote,
                            category: cat as Exclude<NoteCategory, "all">,
                            updatedAt: new Date().toISOString()
                          };
                          setSelectedNote(updatedNote);
                          
                          // Save back to lists immediately
                          const updatedNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
                          setNotes(updatedNotes);
                          saveNotes(updatedNotes);
                          
                          // Send to cloud background save
                          saveNoteToSupabase(updatedNote).catch(err => {
                            console.warn("Supabase background save on category change failed:", err);
                          });
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition-all flex items-center justify-between cursor-pointer border-b ${
                        theme === "dark" ? "border-slate-800/25" : "border-stone-100/50"
                      }`}
                      style={{
                        backgroundColor: getCategoryTabBg(cat, catMeta?.color || "#999", isSelected),
                        borderLeftWidth: "3px",
                        borderLeftColor: catMeta?.color || "#999"
                      }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span 
                          className="w-6 h-5 flex items-center justify-center text-[9px] font-mono font-bold rounded px-1 shrink-0"
                          style={{ 
                            backgroundColor: "rgba(0,0,0,0.15)",
                            color: catMeta?.color || "#999",
                            border: `1px solid ${catMeta?.color}22`
                          }}
                        >
                          {getCategoryAbbreviation(cat, catMeta?.code || "C")}
                        </span>
                        <span className={`truncate font-sans text-xs ${
                          isSelected 
                            ? "font-bold text-white" 
                            : theme === "dark" 
                              ? "text-stone-300 hover:text-white" 
                              : "text-gray-700 hover:text-gray-900"
                        }`} style={isSelected ? { color: catMeta?.color || "#999" } : undefined}>
                          {catMeta?.label || cat}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Large Text Editor Canvas - Takes up remaining screen area completely with comfortable padding and bottom scroll-past room */}
        <div className="flex-1 flex flex-col min-h-0 bg-transparent">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scribe your commentary analysis, insights, or sermon materials here. Supports markdown syntax..."
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.7,
              paddingBottom: '260px'
            }}
            className={`w-full h-full flex-1 p-6 sm:p-7 rounded-xl border focus:ring-1 focus:ring-[#C9973A]/20 outline-none font-sans resize-none transition-all overflow-y-auto leading-relaxed ${
              theme === "dark" 
                ? "bg-[#1A1F26] border-[#2A3342] text-gray-100 focus:border-blue-550 focus:bg-[#1E2530]" 
                : "bg-[#FDFAF7] border-[#E8E4DA] text-gray-800 focus:border-[#C9973A] focus:bg-[#FDFBFA]"
            }`}
          />
        </div>
      </div>
    </div>
  );
};


// ==========================================
// TOOL 3: CSMS (ACTIVE STUDY & GUIDED STEPS)
// ==========================================
export const CSMSActiveRecall: React.FC<ToolProps> = ({
  report,
  activeVerseIndex,
  activeStepIndex,
  setActiveStepIndex,
  chatInputs,
  setChatInputs,
  stepChats,
  handleSendChat,
  theme,
  onNavigateTab,
  setStepChats
}) => {
  const { isBottomBarVisible } = useApp();
  const stepsMeta = [
    { num: 1, name: "Read & Literal Baselines" },
    { num: 2, name: "Systematic Observations" },
    { num: 3, name: "Grammatical & Intent roots" },
    { num: 4, name: "Typological Interpretations" },
    { num: 5, name: "Actionable Applications" },
    { num: 6, name: "Cosmic Controversy Links" },
    { num: 7, name: "Devotional Reflections" }
  ];

  const currentChats = stepChats[activeStepIndex] || [];
  const currentInput = chatInputs[activeStepIndex] || "";

  // Progress tracking states & persistence
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const key = `stba_exegesis_progress_${report?.reference || "default"}`;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save to localStorage when completed steps or report changes
  useEffect(() => {
    const key = `stba_exegesis_progress_${report?.reference || "default"}`;
    localStorage.setItem(key, JSON.stringify(completedSteps));
  }, [completedSteps, report]);

  // Auto-complete a step if user has written/submitted a response (found in stepChats)
  useEffect(() => {
    if (report) {
      const currentChats = stepChats[activeStepIndex] || [];
      const hasUserMsg = currentChats.some(c => c.sender === "user");
      if (hasUserMsg && !completedSteps.includes(activeStepIndex)) {
        setCompletedSteps(prev => {
          if (prev.includes(activeStepIndex)) return prev;
          return [...prev, activeStepIndex];
        });
      }
    }
  }, [stepChats, activeStepIndex, report, completedSteps]);

  // Speech narration states & effects
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState("");
  const lastSpokenAiMsgRef = useRef<string | null>(null);
  const [currentlySpeakingChatIdx, setCurrentlySpeakingChatIdx] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState("");

  // Voice dictation state for user step responses
  const [listeningStepIdx, setListeningStepIdx] = useState<number | null>(null);
  const exegesisRecRef = useRef<any>(null);

  const handleToggleExegesisDictation = (stepIdx: number) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech dictation is not fully supported on this frame workspace. Try Chrome, Edge, or Safari.");
      return;
    }

    if (listeningStepIdx === stepIdx) {
      if (exegesisRecRef.current) {
        try { exegesisRecRef.current.stop(); } catch (e) {}
      }
      setListeningStepIdx(null);
      return;
    }

    if (exegesisRecRef.current) {
      try { exegesisRecRef.current.abort(); } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    const baseText = (chatInputs[stepIdx] || "").trim();
    const prefix = baseText ? baseText + " " : "";

    rec.onstart = () => {
      setListeningStepIdx(stepIdx);
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const spoken = (finalTranscript || interim).trim();
      if (spoken) {
        setChatInputs(prev => {
          const copy = [...prev];
          copy[stepIdx] = prefix + spoken;
          return copy;
        });
      }
    };

    rec.onerror = () => {
      setListeningStepIdx(null);
    };

    rec.onend = () => {
      setListeningStepIdx(null);
    };

    exegesisRecRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      setListeningStepIdx(null);
    }
  };

  // Save complete exegesis study session as a Notebook study file
  const handleSaveExegesisSessionAsNotebookFile = (options?: { download?: boolean }) => {
    if (!report) {
      setCopiedToast("No exegesis study loaded to save yet.");
      setTimeout(() => setCopiedToast(""), 2500);
      return;
    }

    const sessionDate = new Date();
    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const studyTitle = `Exegesis Study: ${report.reference || "Scripture"}`;

    // Collect dialogue across all 7 steps
    const stepsContent = stepsMeta.map((s, sIdx) => {
      const stepSummary = getStepSummary(sIdx);
      const chats = stepChats[sIdx] || [];
      const dialogueText = chats.length > 0
        ? chats.map(c => {
            const speaker = c.sender === "user" ? "Disciple / Student" : "Exegesis Teacher";
            return `**${speaker}:**\n${c.text.trim()}`;
          }).join("\n\n")
        : "*No interactive dialogue recorded for this step.*";

      return `### Step ${s.num}: ${s.name}
${stepSummary}

#### 💬 Interactive Exegesis Dialogue:
${dialogueText}`;
    }).join("\n\n---\n\n");

    const fullStudyFileContent = `# ${studyTitle}

**Scripture Passage:** ${report.reference || "Passage"}  
**Date Recorded:** ${formattedDate} at ${formattedTime}  
**Topic:** ${report.topic || "SDA Exegesis & Doctrinal Mastery"}  
**Completion Status:** ${completedSteps.length} of 7 steps completed (${Math.round((completedSteps.length / 7) * 100)}%)  

---

## 📖 Scripture Text Context
> "${report.text || report.reference || ""}"

---

## 🏛️ Cognitive Scripture Mastery System (CSMS) Exegesis
${stepsContent}

---

## 🧭 Doctrinal Exegetical Synthesis (Historic SDA Hermeneutics)
- **Hermeneutical Foundation:** Sola Scriptura — Scripture interprets Scripture.
- **Historicist & Sanctuary Perspective:** Typological and prophetic patterns pointing to the sanctuary ministry of Jesus Christ.
- **The Great Controversy:** Vindicating God's loving character through faith, obedience, and the commandments of God (Revelation 14:12).
- **Personal Application:** Study to shew thyself approved unto God (2 Timothy 2:15).

---
*Captured and exported from the Cognitive Scripture Mastery System (CSMS) • Study To Be Approved*
`;

    // 1. Save directly into Notebook storage
    const newNote = saveResponseAsNewNote({
      title: studyTitle,
      content: fullStudyFileContent,
      summary: `Exegesis study session on ${report.reference || "Scripture"} (${completedSteps.length}/7 steps completed).`,
      category: "theology",
      scriptureTags: [report.reference || "Scripture", "CSMS Exegesis", "Active Recall"]
    });

    // 2. Sync to legacy storage for backward compatibility
    try {
      const existing = localStorage.getItem("stba_user_notebook_notes");
      const notesList = existing ? JSON.parse(existing) : [];
      notesList.unshift({
        id: newNote.id,
        title: studyTitle,
        content: fullStudyFileContent,
        category: "theology",
        tags: [report.reference || "Scripture", "CSMS Exegesis", "Active Recall"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scripture_reference: report.reference
      });
      localStorage.setItem("stba_user_notebook_notes", JSON.stringify(notesList));
    } catch (e) {}

    setCopiedToast("Saved exegesis session as Notebook study file! ✓");
    setTimeout(() => setCopiedToast(""), 4500);

    if (options?.download) {
      try {
        const sanitizedName = studyTitle.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
        const filename = `${sanitizedName}_${Date.now()}.md`;
        const blob = new Blob([fullStudyFileContent], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn("Failed to download exegesis study file:", err);
      }
    }

    return newNote;
  };

  const getStepSummary = (idx: number): string => {
    if (!report) return "";
    switch (idx) {
      case 0:
        return `Step 1: Read and Literal Baselines. Here is the active summary: ${report.step1?.summary || report.introduction || ""}`;
      case 1:
        return `Step 2: Systematic Observations. Under the ${report.step2?.genre || ""} genre, our observations include: ${report.step2?.observations?.slice(0, 3).join(". ") || ""}`;
      case 2:
        return `Step 3: Grammatical and Intent Roots. The critical author intent is: ${report.step3?.author_intent || ""}`;
      case 3:
        return `Step 4: Typological Interpretations. Our enduring principle is: ${report.step4?.timeless_principle || ""}`;
      case 4:
        return `Step 5: Actionable Applications. Sins to avoid: ${report.step5?.sins_to_avoid?.join(", ") || "none"}. Promises to claim: ${report.step5?.promises_to_claim?.slice(0, 2).join(", ") || "none"}`;
      case 5:
        return `Step 6: Cosmic Controversy Links. The Great Controversy perspective reveals that: ${report.step6?.great_controversy_angle || ""}`;
      case 6:
        return `Step 7: Devotional Reflections. Our key devotional study takeaway is: ${report.step7?.devotional_takeaway || ""}`;
      default:
        return "";
    }
  };

  const speak = (text: string, chatIdx?: number) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported on this browser.");
      return;
    }
    
    if (window.speechSynthesis.speaking && currentlySpeakingChatIdx === chatIdx && chatIdx !== undefined) {
      window.speechSynthesis.cancel();
      setIsSpeechActive(false);
      setCurrentlySpeakingChatIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean up markdown markers for a pure reading cadence
    const parsedText = text
      .replace(/\*\*|###|##|\*/g, "")
      .replace(/[\[\]]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(parsedText);
    utterance.rate = 0.92;
    utterance.pitch = 0.85; // Warmer elder voice tuning

    const bestVoice = getElderStephenVoice();

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      setIsSpeechActive(true);
      if (chatIdx !== undefined) {
        setCurrentlySpeakingChatIdx(chatIdx);
      } else {
        setCurrentlySpeakingChatIdx(null);
      }
    };

    utterance.onend = () => {
      setIsSpeechActive(false);
      setCurrentlySpeakingChatIdx(null);
    };

    utterance.onerror = () => {
      setIsSpeechActive(false);
      setCurrentlySpeakingChatIdx(null);
    };

    window.speechSynthesis.speak(utterance);
    setLastSpokenText(parsedText);
  };

  const getTeacherQuestion = (idx: number, chats: any[]): string => {
    const aiMsg = chats.find(c => c.sender === "ai");
    if (aiMsg) {
      return aiMsg.text;
    }
    
    // Fallbacks for each step using consistent reference-centric style
    const questions = [
      `We are studying ${report?.reference || ""} (${report?.topic || ""}). We are currently in Step 1: Read & Literal Baselines. What are your initial exegesis observations?`,
      "What structural patterns or key connector words do you observe in this passage?",
      "How does the historical setting and the author's original intent clarify the meaning of these verses?",
      "What is the timeless spiritual principle or sanctuary-related symbol found in this passage?",
      "How does this passage apply practically to your personal life today—what sins can we avoid or promises claim?",
      "How does this passage link to the Great Controversy conflict and the vindication of God's character?",
      "What is your heartfelt devotional takeaway or prayer of surrender regarding this truth?"
    ];
    return questions[idx] || "What observations do you have on this exegesis step?";
  };

  useEffect(() => {
    if (report) {
      const summary = getStepSummary(activeStepIndex);
      const chats = stepChats[activeStepIndex] || [];
      const question = getTeacherQuestion(activeStepIndex, chats);
      
      const fullTextToSpeak = `${summary} ${question}`;
      
      // Capture AI's spoken question/comment as text in the dialogue history
      if (setStepChats) {
        setStepChats(prev => {
          const currentForStep = prev[activeStepIndex] || [];
          if (currentForStep.length === 0) {
            const copy = [...prev];
            copy[activeStepIndex] = [
              {
                sender: "ai",
                text: `${summary}\n\n**Exegesis Teacher Question:**\n${question}`
              }
            ];
            return copy;
          }
          return prev;
        });
      }

      const timer = setTimeout(() => {
        speak(fullTextToSpeak);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeStepIndex, report, activeVerseIndex]);

  useEffect(() => {
    if (currentChats.length > 0) {
      const lastMsg = currentChats[currentChats.length - 1];
      if (lastMsg.sender === "ai" && lastSpokenAiMsgRef.current !== lastMsg.text) {
        lastSpokenAiMsgRef.current = lastMsg.text;
        
        // Skip speaking the first message of currentChats here, as it is already spoken combined above
        const isFirstMessage = currentChats.indexOf(lastMsg) === 0;
        if (isFirstMessage) {
          return;
        }

        // Analyze if the user sent a question last
        const userMsg = currentChats.length >= 2 ? currentChats[currentChats.length - 2] : null;
        const isQuestion = userMsg?.text.includes("?") || /^(what|how|why|can|explain|could|where|who)/i.test(userMsg?.text || "");
        
        const introPrefix = isQuestion 
          ? "As for your question, Elder Stephen clarifies: "
          : "Following your systematic observation, here is a pastoral reflection: ";
          
        speak(`${introPrefix} ${lastMsg.text}`);
      }
    }
  }, [currentChats]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToStepIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const targetScrollLeft = index * container.clientWidth;
    const start = container.scrollLeft;
    const change = targetScrollLeft - start;
    if (change === 0) return;
    const startTime = performance.now();
    const duration = 500; // 400ms to 600ms ease-in-out

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animate = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      container.scrollLeft = easeInOutQuad(timeElapsed, start, change, duration);
      if (timeElapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        container.scrollLeft = targetScrollLeft;
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    scrollToStepIndex(activeStepIndex);
  }, [activeStepIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleResize = () => {
      container.scrollLeft = activeStepIndex * container.clientWidth;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeStepIndex]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      {/* Steps timeline header with Auto-Retract */}
      <AutoRetractToolbar theme={theme}>
        <div>
          <div className={`p-2.5 sm:p-3 border-b flex items-center justify-between gap-2 overflow-x-auto scrollbar-none select-none shrink-0 ${
            theme === "dark" ? "bg-[#161C24] border-[#2C3545]" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
              {stepsMeta.map((s, idx) => {
                const isActive = activeStepIndex === idx;
                const isCompleted = completedSteps.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-mono font-bold cursor-pointer transition-colors duration-150 relative ${
                      isActive
                        ? "bg-[#C9973A] text-white border border-[#C9973A]"
                        : isCompleted
                          ? "bg-[#C9973A]/20 text-[#C9973A] border border-[#C9973A]"
                          : theme === "dark"
                            ? "bg-[#252E3B] text-gray-200 border border-[#3C4A5D]"
                            : "bg-gray-200 text-[#000000] border border-gray-300"
                    }`}
                    title={s.name}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="w-3.5 h-3.5 font-bold" />
                    ) : (
                      s.num
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Save Exegesis Session as Notebook Study File */}
              <button
                type="button"
                onClick={() => handleSaveExegesisSessionAsNotebookFile()}
                disabled={!report}
                className={`min-h-[36px] px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation disabled:opacity-40 active:scale-95 ${
                  theme === "dark"
                    ? "bg-[#1E2530] border-[#2C3545] text-amber-400 hover:bg-[#252E3C]"
                    : "bg-white border-stone-300 text-stone-700 hover:bg-amber-50 shadow-2xs"
                }`}
                title="Save complete exegesis study session into your personal Notebook"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">Save Session</span>
              </button>

              {/* Quick Export .md File */}
              <button
                type="button"
                onClick={() => handleSaveExegesisSessionAsNotebookFile({ download: true })}
                disabled={!report}
                className={`min-h-[36px] px-2 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1 touch-manipulation disabled:opacity-40 active:scale-95 ${
                  theme === "dark"
                    ? "bg-[#1E2530] border-[#2C3545] text-stone-300 hover:text-amber-400 hover:bg-[#252E3C]"
                    : "bg-white border-stone-300 text-stone-700 hover:text-amber-700 hover:bg-amber-50 shadow-2xs"
                }`}
                title="Download exegesis session as Markdown study file (.md)"
              >
                <Download className="w-3.5 h-3.5 text-stone-400 hover:text-amber-500" />
                <span className="hidden sm:inline">.md</span>
              </button>
            </div>
          </div>

          {/* Exegesis Step Progress Tracker */}
          {report && (
            <div className={`px-4 py-2 border-b flex flex-col gap-1.5 shrink-0 ${
              theme === "dark" ? "bg-[#1A212D]/60 border-[#2C3545]" : "bg-[#FCF9F2]/60 border-gray-200"
            }`}>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={theme === "dark" ? "text-stone-300" : "text-stone-600"}>
                  Step {activeStepIndex + 1} of 7 — <span className="text-[#C9973A] font-bold">{Math.round((completedSteps.length / 7) * 100)}% complete</span>
                </span>
                <span className={`text-[9px] uppercase tracking-wider ${
                  theme === "dark" ? "text-stone-500" : "text-stone-400"
                }`}>
                  {stepsMeta[activeStepIndex].name}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                theme === "dark" ? "bg-stone-800" : "bg-stone-250"
              }`}>
                <div
                  className="bg-[#C9973A] h-full rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.round((completedSteps.length / 7) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </AutoRetractToolbar>

      {/* Toast alert with optional navigation to Notebook */}
      {copiedToast && (
        <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{copiedToast}</span>
          </div>
          {onNavigateTab && copiedToast.includes("Notebook") && (
            <button
              type="button"
              onClick={() => onNavigateTab("notebook")}
              className="text-[11px] underline font-bold hover:text-amber-300 ml-2 cursor-pointer flex items-center gap-1"
            >
              <span>View in Notebook</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}

      {/* Guided Exegesis text display area - horizontal scroll viewport */}
      <div className="flex-1 relative overflow-hidden bg-transparent">
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 flex overflow-x-hidden scrollbar-none"
          style={{ width: "100%", height: "100%" }}
        >
          {stepsMeta.map((stepItem, idx) => {
            const currentChats = stepChats[idx] || [];
            
            return (
              <div
                key={idx}
                className={`w-full h-full flex-shrink-0 flex flex-col overflow-y-auto scroll-smooth p-4 space-y-4 transition-all duration-300 ease-in-out ${
                  isBottomBarVisible ? "pb-16 md:pb-3" : "pb-6 md:pb-3"
                }`}
                style={{ width: "100%", height: "100%", WebkitOverflowScrolling: "touch" }}
              >
                {report ? (
                  <div className="space-y-4 text-left select-text">
                    <div className={`p-4 rounded-lg border relative ${
                      theme === "dark" ? "bg-[#1E2530] border-[#2C3545]" : "bg-[#FDFAF5] border-[#E8E4DA]"
                    }`}>
                      <div className={`flex items-center justify-between border-b pb-1.5 mb-6 ${
                        theme === "dark" ? "border-[#2C3545]" : "border-gray-200"
                      }`}>
                        <h4 className={`text-sm font-semibold tracking-wide ${
                          theme === "dark" ? "text-[#C9A86A]" : "text-[#000000]"
                        }`}>
                          STEP {idx + 1}: {stepsMeta[idx].name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeechActive) {
                              window.speechSynthesis.cancel();
                              setIsSpeechActive(false);
                            } else {
                              const summary = getStepSummary(idx);
                              speak(summary);
                            }
                          }}
                          className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                            isSpeechActive
                              ? "text-amber-500 bg-amber-500/10"
                              : theme === "dark"
                                ? "text-[#C9A86A] hover:text-white hover:bg-[#C9A86A]/20"
                                : "text-gray-600 hover:text-black hover:bg-gray-100"
                          }`}
                          title={isSpeechActive ? "Stop Narration" : "Replay Step Narration"}
                        >
                          {isSpeechActive ? (
                            <VolumeX className="w-4 h-4 animate-pulse text-amber-500" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Loaded report material mapping */}
                      {idx === 0 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p>
                            <strong className="font-semibold">Introduction:</strong> {report.introduction}
                          </p>
                          <p>
                            <strong className="font-semibold">Summary:</strong> {report.step1.summary}
                          </p>
                        </div>
                      )}

                      {idx === 1 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p>
                            <strong className="font-semibold">Genre:</strong> {report.step2.genre} Genre
                          </p>
                          <div className="space-y-2">
                            <strong className="font-semibold block">Systematic Observations:</strong>
                            <ul className="list-disc pl-5 space-y-1">
                              {report.step2.observations.map((o: any, oIdx: number) => (
                                <li key={oIdx} className="leading-[12px] text-xs py-0.5 font-normal">{o}</li>
                              ))}
                            </ul>
                          </div>
                          <p>
                            <strong className="font-semibold">Semantic Connectors:</strong> {report.step2.connectors.join(", ")}
                          </p>
                          <p>
                            <strong className="font-semibold">Analytical Commentary:</strong> {report.step2.commentary}
                          </p>
                        </div>
                      )}

                      {idx === 2 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p><strong className="font-semibold">Intent:</strong> {report.step3.author_intent}</p>
                          <p><strong className="font-semibold">Historical Context:</strong> {report.step3.historical_setting}</p>
                        </div>
                      )}

                      {idx === 3 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p>
                            <strong className="font-semibold">Enduring Principle:</strong> {report.step4.timeless_principle}
                          </p>
                          <p>
                            <strong className="font-semibold">Theological Definitions:</strong> {report.step4.theological_truths}
                          </p>
                          <p>
                            <strong className="font-semibold">Amazing Facts Core:</strong> {report.step4.amazing_facts}
                          </p>
                        </div>
                      )}

                      {idx === 4 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p><strong className="font-semibold">Sins to Avoid:</strong> {report.step5.sins_to_avoid.join(" & ")}</p>
                          <p><strong className="font-semibold">Claims &amp; Promises:</strong> {report.step5.promises_to_claim.join(" & ")}</p>
                          <p><strong className="font-semibold">Commands to Obey:</strong> {report.step5.commands_to_obey.join(" & ")}</p>
                        </div>
                      )}

                      {idx === 5 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p>
                            <strong className="font-semibold">Great Controversy Perspective:</strong> {report.step6.great_controversy_angle}
                          </p>
                          <p>
                            <strong className="font-semibold">God's Government Vindication:</strong> {report.step6.vindication_themes}
                          </p>
                        </div>
                      )}

                      {idx === 6 && (
                        <div className={`space-y-4 text-xs sm:text-sm leading-relaxed font-normal ${theme === "dark" ? "text-white" : "text-black"}`}>
                          <p>
                            <strong className="font-semibold">Devotional Takeaway:</strong> {report.step7.devotional_takeaway}
                          </p>
                          <p>
                            <strong className="font-semibold">Surrender Prayer:</strong> {report.step7.prayer_prompt}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Chat discussion history block under step material */}
                    <div className="flex flex-col pt-3 border-t border-gray-200/50 dark:border-[#2C3545]">
                      <h5 className={`text-[10px] uppercase tracking-wider text-amber-500/70 font-mono font-bold ${
                        currentChats.length === 0 ? "mb-[5px]" : "mb-3"
                      }`}>
                        Dialogue with Exegesis Teacher
                      </h5>
                      {currentChats.length > 0 && (
                        <div className="space-y-4">
                          {currentChats.map((msg, mIdx) => {
                            const isUser = msg.sender !== "ai";
                            return (
                              <div key={mIdx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed relative group ${
                                  isUser
                                    ? "bg-[#C9973A] text-white rounded-br-none"
                                    : theme === "dark"
                                      ? "bg-[#1E2530] text-gray-200 border border-[#2C3545] rounded-bl-none"
                                      : "bg-[#F3EFE9] text-gray-800 border border-[#E5DFD5] rounded-bl-none"
                                }`}>
                                  
                                  {/* Header Title with Audio read-aloud buttons */}
                                  <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-wider mb-1.5 opacity-75">
                                    <span>{isUser ? "You (Active Recall)" : "Exegesis Scholar"}</span>
                                    {!isUser && (
                                      <button
                                        onClick={() => speak(msg.text, mIdx)}
                                        className="p-1 -mr-1 rounded hover:bg-stone-500/10 hover:text-amber-550 transition-colors cursor-pointer flex items-center gap-1 text-[8px] font-mono leading-none border-none outline-none"
                                        title={currentlySpeakingChatIdx === mIdx ? "Mute Readback" : "Listen Aloud"}
                                      >
                                        {currentlySpeakingChatIdx === mIdx ? (
                                          <>
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                            <VolumeX className="w-2.5 h-2.5 animate-pulse text-amber-500" />
                                            <span>MUTE</span>
                                          </>
                                        ) : (
                                          <>
                                            <Volume2 className="w-2.5 h-2.5 text-amber-500" />
                                            <span>LISTEN</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  <p className="whitespace-pre-line select-text pr-2">{msg.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Dialogue input box directly under the question text/chats with reduced spacing */}
                      <div className="mt-[5px] mb-4 md:mb-0 flex items-end gap-2">
                        {idx < 6 && (
                          <button
                            onClick={() => {
                              setCompletedSteps(prev => {
                                if (prev.includes(idx)) return prev;
                                return [...prev, idx];
                              });
                              setActiveStepIndex(idx + 1);
                            }}
                            className="bg-[#C9973A] hover:bg-[#B2822B] text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center h-[38px] self-end"
                            title="Done study step, scroll to the next step"
                          >
                            Done
                          </button>
                        )}

                        {/* Dictation Button for voice input */}
                        <button
                          type="button"
                          onClick={() => handleToggleExegesisDictation(idx)}
                          className={`p-2 rounded-lg transition-all cursor-pointer relative flex items-center justify-center shrink-0 border h-[38px] w-[38px] self-end touch-manipulation ${
                            listeningStepIdx === idx
                              ? "bg-rose-500/15 border-rose-500 text-rose-500 animate-pulse scale-105"
                              : theme === "dark"
                                ? "bg-[#1C2028] border-[#2C3545] text-gray-400 hover:text-amber-500"
                                : "bg-stone-100 border-gray-300 text-stone-600 hover:text-[#C9973A]"
                          }`}
                          title={listeningStepIdx === idx ? "Stop dictation" : "Dictate your response to the teacher"}
                        >
                          <Mic className={`w-4 h-4 ${listeningStepIdx === idx ? "stroke-[2.5]" : ""}`} />
                          {listeningStepIdx === idx && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                          )}
                        </button>

                        <textarea
                          rows={3}
                          value={chatInputs[idx] || ""}
                          onChange={(e) => setChatInputs((prev) => {
                            const copy = [...prev];
                            copy[idx] = e.target.value;
                            return copy;
                          })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChat();
                            }
                          }}
                          placeholder={
                            listeningStepIdx === idx
                              ? "Listening... Speak your response clearly 🎙️"
                              : "Respond to the exegesis teacher or ask questions (or dictate with mic)..."
                          }
                          className={`flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm outline-none transition-colors resize-none min-h-[76px] max-h-36 overflow-y-auto leading-relaxed text-left ${
                            listeningStepIdx === idx
                              ? theme === "dark"
                                ? "bg-[#16202E] text-white border-2 border-emerald-500/60 focus:border-emerald-400 shadow-inner"
                                : "bg-emerald-50/40 text-gray-800 border-2 border-emerald-500/60 focus:border-emerald-500 shadow-inner"
                              : theme === "dark" 
                                ? "bg-[#1C2028] text-white border border-[#2C3545] focus:border-amber-500" 
                                : "bg-white text-gray-800 border border-gray-300 focus:border-[#C9973A]"
                          }`}
                        />
                        <button
                          onClick={handleSendChat}
                          disabled={!chatInputs[idx]?.trim()}
                          className="bg-[#C9973A] hover:bg-[#B2822B] text-white px-3 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0 h-[38px] w-[38px] flex items-center justify-center self-end disabled:opacity-40"
                          title="Send response to teacher"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs sm:text-sm">
                    <Feather className="w-8 h-8 opacity-40 mx-auto mb-2 text-[#C084FC]" />
                    Specify a scriptural text first under study tracks or custom input parameters to compile active exegesis vectors.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// TOOL 4: WORD STUDY
// ==========================================
interface SdaEntriesDropdownProps {
  entries: Array<{ entry: string; source: string }>;
  theme: "light" | "dark";
}

const SdaEntriesDropdown: React.FC<SdaEntriesDropdownProps> = ({ entries, theme }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:text-emerald-400 font-mono focus:outline-none transition-colors cursor-pointer"
      >
        <span>{open ? "Show Less" : `More (${entries.length})`}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 space-y-2 pl-2 border-l border-emerald-500/35 animate-fade-in">
          {entries.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded border leading-relaxed text-xs transition-colors ${
                theme === "dark" ? "bg-[#181D26] border-gray-850 text-gray-300" : "bg-white border-gray-150 text-gray-750"
              }`}
            >
              <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase block mb-0.5">
                {item.source || `Additional Entry ${idx + 1}`}
              </span>
              <p className="font-sans font-medium">{item.entry}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WordStudy: React.FC<ToolProps> = ({ 
  report, 
  theme, 
  activeVerseIndex, 
  selectedWord, 
  setSelectedWord,
  customVerses,
  setActiveVerseIndex,
  onReferenceChange
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [studyData, setStudyData] = useState<any>(null);
  const [recentWords, setRecentWords] = useState<string[]>(["gospel", "sanctuary", "cleansed", "glory", "judgment"]);
  const [errorMsg, setErrorMsg] = useState("");
  const [verseKeywords, setVerseKeywords] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);

  const doLookup = async (wordToLook: string) => {
    if (!wordToLook.trim()) return;
    setLoading(true);
    setErrorMsg("");

    // 1. Check IndexedDB persistent study resource cache (< 2ms)
    try {
      const cached = await stbaStorage.getStudyResource("word_study", wordToLook);
      if (cached) {
        setStudyData(cached);
        setSearchQuery(wordToLook.trim());
        setRecentWords((prev) => {
          const cleaned = wordToLook.trim().toLowerCase();
          const next = prev.filter(w => w !== cleaned);
          return [cleaned, ...next].slice(0, 8);
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      // Non-fatal
    }

    // 2. Fetch from backend API if not locally cached
    try {
      const response = await fetch("/api/study/word-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: wordToLook.trim(),
          reference: report?.reference || "Revelation 14:6-12",
          verseNumber: activeVerseIndex
        })
      });

      if (!response.ok) {
        throw new Error("Linguistic ledger response failure.");
      }

      const data = await response.json();
      setStudyData(data);
      setSearchQuery(wordToLook.trim());

      // Persist in IndexedDB so subsequent lookups are instant
      stbaStorage.saveStudyResource("word_study", wordToLook, data, report?.reference).catch(() => {});

      // Add to recent list
      setRecentWords((prev) => {
        const cleaned = wordToLook.trim().toLowerCase();
        const next = prev.filter(w => w !== cleaned);
        return [cleaned, ...next].slice(0, 8);
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to compile lexical audit. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Synchronize with cross-panel WordSelected events
  useEffect(() => {
    const unsub = panelSyncBus.subscribe("WORD_SELECTED", (payload: any) => {
      if (payload && payload.word && payload.word.trim()) {
        const w = payload.word.trim();
        setSearchQuery(w);
        doLookup(w);
      }
    });
    return () => unsub();
  }, [report?.reference, activeVerseIndex]);

  // Synchronize with external selection triggers
  useEffect(() => {
    if (selectedWord && selectedWord.trim()) {
      setSearchQuery(selectedWord);
      doLookup(selectedWord);
    }
  }, [selectedWord]);

  // Synchronize with verse selection clicks
  useEffect(() => {
    const fetchKeywords = async () => {
      if (!activeVerseIndex) {
        setVerseKeywords([]);
        return;
      }
      
      let vText = "";
      let refTitle = report?.reference || "Revelation 14:12";
      
      // Try to find in customVerses first
      if (customVerses) {
        const found = customVerses.find((v: any) => v.verseNumber === activeVerseIndex);
        if (found) {
          vText = found.text?.NKJV || found.text?.KJV || "";
          refTitle = found.reference || refTitle;
        }
      }
      
      // Try in preset bibles if not found
      if (!vText && report) {
        const loadedVerses = getParallelVerses(report.reference);
        const matched = loadedVerses.find(v => v.verseNumber === activeVerseIndex);
        if (matched) {
          vText = matched.text?.NKJV || matched.text?.KJV || "";
        }
      }

      if (!vText) {
        setVerseKeywords(["patience", "saints", "keep", "commandments", "faith", "jesus"]);
        return;
      }

      setExtracting(true);
      try {
        const res = await fetch("/api/study/extract-keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verseText: vText, reference: refTitle })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.keywords && data.keywords.length > 0) {
            setVerseKeywords(data.keywords);
            // Automatically trigger the lookup study for the very first keyword detected!
            const firstWord = data.keywords[0];
            if (firstWord) {
              handleWordSelect(firstWord);
            }
          } else {
            // Heuristic local fallback
            const cleanStr = vText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"'?“”;:]/g, "");
            const words = cleanStr.split(/\s+/).filter((w: string) => {
              const wordClean = w.toLowerCase().trim();
              return wordClean.length > 3 && !["then", "that", "this", "them", "their", "with", "from", "your", "have", "shall", "unto", "they", "those", "were", "said", "another", "having", "other", "whose"].includes(wordClean);
            });
            const unique = Array.from(new Set(words));
            setVerseKeywords(unique);
            if (unique[0]) handleWordSelect(unique[0]);
          }
        }
      } catch (err) {
        console.warn("Failed extracting keywords via server, local fallback", err);
        const cleanStr = vText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"'?“”;:]/g, "");
        const words = cleanStr.split(/\s+/).filter((w: string) => {
          const wordClean = w.toLowerCase().trim();
          return wordClean.length > 3 && !["then", "that", "this", "them", "their", "with", "from", "your", "have", "shall", "unto", "they", "those", "were", "said", "another", "having", "other", "whose"].includes(wordClean);
        });
        const unique = Array.from(new Set(words));
        setVerseKeywords(unique);
        if (unique[0]) handleWordSelect(unique[0]);
      } finally {
        setExtracting(false);
      }
    };

    fetchKeywords();
  }, [activeVerseIndex, report?.reference, customVerses]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (setSelectedWord) {
        setSelectedWord(searchQuery.trim());
      } else {
        doLookup(searchQuery.trim());
      }
    }
  };

  const handleWordSelect = (word: string) => {
    if (setSelectedWord) {
      setSelectedWord(word);
    } else {
      setSearchQuery(word);
      doLookup(word);
    }
  };

  const COMMON_TRANSLITERATIONS: Record<string, string> = {
    gospel: "euaggelion",
    euaggelion: "euaggelion",
    g2098: "euaggelion",
    "εὐαγγέλιον": "euaggelion",

    patience: "hupomone",
    hupomone: "hupomone",
    g5281: "hupomone",
    "ὑπομονή": "hupomone",

    saints: "hagios",
    hagios: "hagios",
    g40: "hagios",
    "ἅγιος": "hagios",

    keep: "tereo",
    tereo: "tereo",
    g5083: "tereo",
    "τηρέω": "tereo",

    commandments: "entole",
    entole: "entole",
    g1785: "entole",
    "ἐντολή": "entole",

    faith: "pistis",
    pistis: "pistis",
    g4102: "pistis",
    "πίστις": "pistis",

    jesus: "iesous",
    iesous: "iesous",
    g2424: "iesous",
    "ἰησοῦς": "iesous",

    angel: "aggelos",
    aggelos: "aggelos",
    g32: "aggelos",
    "ἄγγελος": "aggelos",

    preach: "euaggelizo",
    euaggelizo: "euaggelizo",
    g2097: "euaggelizo",
    "εὐαγγελίζω": "euaggelizo",

    earth: "ge",
    ge: "ge",
    g1093: "ge",
    "γῆ": "ge",

    nation: "ethnos",
    ethnos: "ethnos",
    g1484: "ethnos",
    "ἔθνος": "ethnos",

    fear: "phobeo",
    phobeo: "phobeo",
    g5399: "phobeo",
    "φοβέω": "phobeo",

    glory: "doxa",
    doxa: "doxa",
    g1391: "doxa",
    "δόξα": "doxa",

    hour: "hora",
    hora: "hora",
    g5610: "hora",
    "ὥρα": "hora",

    judgment: "krisis",
    krisis: "krisis",
    g2920: "krisis",
    "κρίσις": "krisis",

    worship: "proskuneo",
    proskuneo: "proskuneo",
    g4352: "proskuneo",
    "προσκυνέω": "proskuneo",

    fountains: "pege",
    pege: "pege",
    g4077: "pege",
    "πηγή": "pege",

    fallen: "pipto",
    pipto: "pipto",
    g4098: "pipto",
    "πίπτω": "pipto",

    priest: "archiereus",
    archiereus: "archiereus",
    g749: "archiereus",
    "ἀρχιερεύς": "archiereus",

    sanctuary: "hagion",
    hagion: "hagion",
    g39: "hagion",
    "ἅγιον": "hagion",

    tabernacle: "skene",
    skene: "skene",
    g4633: "skene",
    "σκηνή": "skene",

    minister: "leitourgos",
    leitourgos: "leitourgos",
    g3011: "leitourgos",
    "λειτουργός": "leitourgos",

    cleansed: "tsadaq",
    tsadaq: "tsadaq",
    h6663: "tsadaq",
    "צָדַק": "tsadaq",

    days: "yom",
    yom: "yom",
    h3117: "yom",
    "יוֹם": "yom",

    sacrifice: "thusia",
    thusia: "thusia",
    g2378: "thusia",
    "θυσία": "thusia",

    transformed: "metamorphoo",
    metamorphoo: "metamorphoo",
    g3339: "metamorphoo",
    "μεταμορφύω": "metamorphoo",

    word: "logos",
    logos: "logos",
    g3056: "logos",
    "λόγος": "logos",

    love: "agape",
    agape: "agape",
    g26: "agape",
    "ἀγάπη": "agape",

    truth: "aletheia",
    aletheia: "aletheia",
    g225: "aletheia",
    "ἀλήθεια": "aletheia"
  };

  const playPronunciation = (data: any, customWordText?: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    let targetTrans = "";

    const cleanCustom = customWordText ? customWordText.toLowerCase().trim() : "";
    
    // 1. If studyData matches customWordText or active word, use studyData.transliteration directly
    if (studyData && studyData.transliteration) {
      if (!cleanCustom || 
          studyData.word?.toLowerCase() === cleanCustom || 
          studyData.lemma?.toLowerCase() === cleanCustom ||
          studyData.strongs?.toLowerCase() === cleanCustom ||
          studyData.transliteration?.toLowerCase() === cleanCustom) {
        targetTrans = studyData.transliteration;
      }
    }

    // 2. Direct data object parameter check
    if (!targetTrans && data && data.transliteration) {
      targetTrans = data.transliteration;
    }

    // 3. Fallback map lookup
    if (!targetTrans && cleanCustom) {
      targetTrans = COMMON_TRANSLITERATIONS[cleanCustom] || "";
    }

    // 4. General fallback to active studyData or search query
    if (!targetTrans && studyData && studyData.transliteration) {
      targetTrans = studyData.transliteration;
    }

    if (!targetTrans) {
      const cleanSearch = (searchQuery || "").toLowerCase().trim();
      targetTrans = COMMON_TRANSLITERATIONS[cleanSearch] || cleanSearch || "logos";
    }

    // Clean text to say: Speak ONLY the transliteration word! No language prefixes, no English translations, no Greek script.
    const textToSay = targetTrans.replace(/[^a-zA-Z\s'-]/g, "").trim();
    if (!textToSay) return;

    const utterance = new SpeechSynthesisUtterance(textToSay);
    utterance.rate = 0.85; // Clear pacing for foreign transliteration
    utterance.pitch = 0.95;

    const bestVoice = getElderStephenVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleCrossCitedRefClick = (ref: string) => {
    if (onReferenceChange) {
      onReferenceChange(ref);
    }
    
    if (setActiveVerseIndex) {
      const match = ref.match(/:(\d+)/);
      if (match) {
        const verseNum = parseInt(match[1], 10);
        setActiveVerseIndex(verseNum);
      } else {
        setActiveVerseIndex(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-left bg-transparent">
      {/* Search and Controller header panel with Auto-Retract */}
      <AutoRetractToolbar theme={theme}>
        <div className={`p-4 border-b shrink-0 ${theme === "dark" ? "bg-[#161B22] border-[#21262D]" : "bg-[#FAF7F2] border-[#E5DFD5]"}`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <h3 className="font-serif text-sm font-semibold tracking-wide uppercase">Original Language Word Study</h3>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Greek/Hebrew word or English key term..."
                className={`w-full rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm outline-none transition-all ${
                  theme === "dark"
                    ? "bg-[#1C2028] text-white border border-[#2C3545] focus:border-emerald-500"
                    : "bg-white text-gray-800 border border-gray-300 focus:border-emerald-600"
                }`}
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Study
            </button>
          </form>

          {/* Recent queries carousel */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 select-none no-scrollbar">
            <History className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-[10px] text-gray-400 font-mono font-bold uppercase mr-1">Recents:</span>
            {recentWords.map((word) => (
              <button
                key={word}
                onClick={() => handleWordSelect(word)}
                className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono tracking-wide cursor-pointer transition-colors shrink-0 ${
                  theme === "dark"
                    ? "bg-[#1E2530] text-gray-300 hover:bg-emerald-950/40 hover:text-emerald-400 border border-[#2C3545]"
                    : "bg-[#FDFAF5] text-gray-650 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </AutoRetractToolbar>

      {/* Main scrollable body study space */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-4 pb-32 md:pb-6 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* Dynamic Interactive Active Verse Tags Cloud */}
        {activeVerseIndex && report && (
          <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-all shrink-0 ${
            theme === "dark" ? "bg-[#1C222E]/80 border-[#384357]" : "bg-amber-50/60 border-amber-150"
          }`}>
            <div className="flex justify-between items-center select-none text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="text-[#C9973A]">Verse {activeVerseIndex} Word Study Map</span>
              <span className="text-gray-400">{extracting ? "Extracting..." : "Click to study keys"}</span>
            </div>
            
            {verseKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {verseKeywords.map((word) => {
                  const isActiveSearched = searchQuery.toLowerCase().trim() === word.toLowerCase().trim();
                  return (
                    <div
                      key={word}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all tracking-wide border ${
                        isActiveSearched
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                          : theme === "dark"
                            ? "bg-[#161B22] text-gray-305 border-[#2D364A]"
                            : "bg-white text-gray-700 border-[#E8E4DA]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleWordSelect(word)}
                        className="hover:text-emerald-450 text-left font-medium transition-colors cursor-pointer"
                      >
                        {word}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation({}, word);
                        }}
                        className="p-0.5 rounded-full text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        title={`Pronounce ${word}`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] italic text-gray-400">Tap a verse in the parallel Bible column to parse context words.</p>
            )}
          </div>
        )}

        {/* Loader Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center select-none">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <span className="text-xs font-mono font-bold tracking-wide text-gray-400 animate-pulse uppercase">
              Compiling ancient dictionary codex...
            </span>
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center select-none">
            {errorMsg}
          </div>
        ) : studyData ? (
          <div className="space-y-4 select-text animate-fade-in">
            {/* The primary linguistic metric card */}
            <div className={`p-4 rounded-xl border relative shadow-sm ${
              theme === "dark" ? "bg-[#1E2530] border-[#2C3545]" : "bg-[#FDFAF5] border-[#E8E4DA]"
            }`}>
              {/* Badge for Strong's number */}
              <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold px-2 py-1 rounded">
                Strong’s {studyData.strongs}
              </div>

              {/* Lemma and translation header */}
              <div className="mb-3 pr-20">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                  {isNewTestamentReference(report?.reference || "Revelation 14:12") ? "GREEK" : "HEBREW"} LEXICAL CORE WORD
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-serif font-bold text-emerald-500 tracking-wide block select-all">
                    {studyData.lemma}
                  </span>
                  <button
                    type="button"
                    onClick={() => playPronunciation(studyData)}
                    className="p-1 rounded-full text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    title="Play pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-sans text-emerald-500 font-semibold select-all block">
                    Transliteration: {studyData.transliteration}
                  </span>
                  <span className="text-xs font-mono text-gray-400 select-all block">
                    Pronunciation: {studyData.pronunciation}
                  </span>
                </div>
              </div>

              {/* Grammar/Morphology */}
              <div className={`px-3 py-1.5 rounded-md border text-[11px] font-mono font-semibold mb-4 flex items-center gap-2 ${
                theme === "dark" ? "bg-[#1C2028] border-gray-800 text-gray-300" : "bg-white border-gray-200 text-gray-600"
              }`}>
                <span className="text-amber-500/80 font-bold font-serif">MORPHOLOGY:</span>
                <span>{studyData.morphology}</span>
              </div>

              {/* Biblical Dictionary Definition */}
              <div className="space-y-1.5 mb-4">
                <h4 className="text-xs font-mono font-bold tracking-wider text-[#C9973A] uppercase block">
                  Biblical Dictionary Definition
                </h4>
                {studyData.sdaDictionaryEntries && studyData.sdaDictionaryEntries.length > 0 ? (
                  <div className="space-y-2">
                    {/* Primary Entry */}
                    <div className={`p-3 rounded-lg border leading-relaxed text-xs sm:text-sm transition-colors ${
                      theme === "dark" ? "bg-[#1C2028] border-[#2C3545] text-gray-200" : "bg-white border-gray-200 text-gray-800"
                    }`}>
                      <span className="font-mono text-[9px] font-bold text-emerald-500 uppercase block mb-1">
                        SDA Dictionary — {studyData.sdaDictionaryEntries[0].source || "Primary Entry"}
                      </span>
                      <p className="font-sans font-medium">{studyData.sdaDictionaryEntries[0].entry}</p>
                    </div>

                    {/* Secondary Entries with collapsible dropdown */}
                    {studyData.sdaDictionaryEntries.length > 1 && (
                      <SdaEntriesDropdown entries={studyData.sdaDictionaryEntries.slice(1)} theme={theme} />
                    )}
                  </div>
                ) : (
                  <p className={`font-sans leading-relaxed text-xs sm:text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                    {studyData.dictionaryDefinition}
                  </p>
                )}
              </div>

              {/* Frequency metrics count */}
              {studyData.versesCount && (
                <div className="text-[10px] font-mono text-gray-400 border-t pt-2 mt-2 flex justify-between select-none">
                  <span>Occurrences in scripture codices:</span>
                  <span className="text-emerald-500 font-bold">{studyData.versesCount} times</span>
                </div>
              )}
            </div>

            {/* SDA Theological exegesis insight card */}
            <div className={`p-4 rounded-xl border relative shadow-sm ${
              theme === "dark" ? "bg-[#1F2937]/50 border-emerald-950/50" : "bg-emerald-50/30 border-emerald-100"
            }`}>
              <div className="flex items-center gap-2 mb-2 font-serif text-xs font-bold text-emerald-500 tracking-wider uppercase select-none">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>SDA EXEGETICAL COMMENTARY & THEOLOGICAL INSIGHT</span>
              </div>
              <p className={`font-sans leading-relaxed text-xs sm:text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-750"}`}>
                {studyData.usageNote}
              </p>
            </div>

            {/* Scriptural occurrences lists - Clickable references */}
            {studyData.occurrences && studyData.occurrences.length > 0 && (
              <div className={`p-3.5 rounded-xl border ${theme === "dark" ? "bg-stone-900/10 border-gray-850" : "bg-stone-150/20 border-gray-200"}`}>
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
                  KEY CROSS-CITED OCCURRENCES
                </h4>
                <div className="flex flex-col gap-1.5">
                  {studyData.occurrences.map((occ: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCrossCitedRefClick(occ)}
                      className="w-full flex justify-between items-center py-1.5 border-b border-transparent hover:border-emerald-500/30 hover:bg-emerald-500/5 px-2 rounded duration-150 text-left cursor-pointer"
                    >
                      <span className="text-xs font-sans font-bold text-[#C9973A] hover:underline hover:text-emerald-500">{occ}</span>
                      <span className="text-[10px] font-mono text-gray-500">Related lexical context</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] font-mono leading-relaxed text-gray-500 text-center select-none pt-2">
              *Adventist exegesis guidelines: Deep word study illuminates original Hebrew/Greek roots. Correctly dividing words isolates literal truth and clears historical-covenant parameters.
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 text-xs sm:text-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-2 text-emerald-400 select-none">
              <BookOpen className="w-6 h-6" />
            </div>
            
            <div className="max-w-[280px] mx-auto text-center font-sans space-y-2">
              <p className="font-bold cursor-default">No Biblical Term Under Search</p>
              <p className="text-gray-500 leading-relaxed text-[11px]">
                Type a keyword in the study bar above, tap a term from an active verse wordcloud, or double-click scriptures in the parallel reader column to trigger automated Strong’s index parsing.
              </p>
            </div>

            <div className={`p-4 rounded-lg border text-[11px] leading-relaxed max-w-[320px] mx-auto text-left ${
              theme === "dark" ? "bg-[#1E2530] border-[#2C3545] text-gray-400" : "bg-amber-50/40 border-amber-150 text-gray-600"
            }`}>
              <h5 className="font-bold mb-1 uppercase font-mono tracking-wider text-amber-500">Recommended Roots to study:</h5>
              <ul className="list-disc pl-4 space-y-1 font-sans">
                <li><b className="cursor-pointer text-[#C9973A] hover:underline" onClick={() => handleWordSelect("gospel")}>G2098 (gospel)</b> — The everlasting anchor of the judgment hour.</li>
                <li><b className="cursor-pointer text-[#C9973A] hover:underline" onClick={() => handleWordSelect("sanctuary")}>G39 (sanctuary)</b> — Christ's active priestly ministration temple.</li>
                <li><b className="cursor-pointer text-[#C9973A] hover:underline" onClick={() => handleWordSelect("cleansed")}>H6663 (cleansed)</b> — Prophetic vindication in Daniel 8:14.</li>
                <li><b className="cursor-pointer text-[#C9973A] hover:underline" onClick={() => handleWordSelect("worship")}>G4352 (worship)</b> — Creator adoration versus traditional commands.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// TOOL 5: CROSS-REFERENCE ENGINE
// ==========================================
const PRECOMPILED_XREFS: Record<string, Array<{ ref: string; description: string }>> = {
  "revelation 14:6": [
    { ref: "Revelation 14:15", description: "And another angel came out of the temple, crying with a loud voice to him that sat on the cloud, Thrust in thy sickle, and reap; for the time is come for thee to reap." },
    { ref: "Matthew 24:14", description: "And this gospel of the kingdom shall be preached in all the world for a witness unto all nations; and then shall the end come." },
    { ref: "Ephesians 3:9", description: "And to make all men see what is the fellowship of the mystery, which from the beginning of the world hath been hid in God, who created all things by Jesus Christ." },
    { ref: "Revelation 10:1-3", description: "A mighty angel coming down from heaven with a rainbow upon his head and a little open book in his hand, representing the proclamation of prophetic light." }
  ],
  "revelation 14:7": [
    { ref: "Ecclesiastes 12:13-14", description: "Fear God, and keep his commandments: for this is the whole duty of man. For God shall bring every work into judgment, with every secret thing." },
    { ref: "Exodus 20:11", description: "For in six days the Lord made heaven and earth, the sea, and all that in them is, and rested the seventh day; wherefore the Lord blessed the sabbath day, and hallowed it." },
    { ref: "Daniel 7:9-10", description: "The ancient of days did sit, whose garment was white as snow... the judgment was set, and the books were opened." },
    { ref: "Psalm 111:10", description: "The fear of the Lord is the beginning of wisdom: a good understanding have all they that do his commandments." }
  ],
  "revelation 14:8": [
    { ref: "Revelation 18:1-4", description: "Babylon the great is fallen, is fallen, and is become the habitation of devils... Come out of her, my people, that ye be not partakers of her sins." },
    { ref: "Isaiah 21:9", description: "And, behold, here cometh a chariot of men, with a couple of horsemen. And he answered and said, Babylon is fallen, is fallen." },
    { ref: "Jeremiah 51:6-9", description: "Flee out of the midst of Babylon, and deliver every man his soul: be not cut off in her iniquity; for this is the time of the Lord's vengeance." }
  ],
  "revelation 14:9": [
    { ref: "Revelation 13:11-17", description: "The lamb-like beast from the earth forces the world to worship the first beast and receive the mark of the beast on their forehead or right hand." },
    { ref: "Revelation 16:2", description: "The first vial is poured out, and there fell a noisome and grievous sore upon the men which had the mark of the beast, and upon them which worshipped his image." },
    { ref: "Revelation 20:4", description: "I saw the souls of them that were beheaded for the witness of Jesus... and which had not worshipped the beast, neither his image, neither had received his mark." }
  ],
  "revelation 14:10": [
    { ref: "Psalm 75:8", description: "For in the hand of the Lord there is a cup, and the wine is red; it is full of mixture; and he poureth out of the same: but the dregs thereof, all the wicked shall wring them out." },
    { ref: "Jeremiah 25:15", description: "For thus saith the Lord God of Israel unto me; Take the wine cup of this fury at my hand, and cause all the nations, to whom I send thee, to drink it." },
    { ref: "Revelation 16:19", description: "And great Babylon came in remembrance before God, to give unto her the cup of the wine of the fierceness of his wrath." }
  ],
  "revelation 14:11": [
    { ref: "Isaiah 34:10", description: "It shall not be quenched night nor day; the smoke thereof shall go up for ever: from generation to generation it shall lie waste; none shall pass through it." },
    { ref: "Malachi 4:1-3", description: "For, behold, the day cometh, that shall burn as an oven... and all that do wickedly, shall be stubble: and the day that cometh shall burn them up." },
    { ref: "Jude 1:7", description: "Even as Sodom and Gomorrha, and the cities about them... are set forth for an example, suffering the vengeance of eternal fire." }
  ],
  "revelation 14:12": [
    { ref: "Revelation 12:17", description: "And the dragon was wroth with the woman, and went to make war with the remnant of her seed, which keep the commandments of God, and have the testimony of Jesus Christ." },
    { ref: "Revelation 19:10", description: "Worship God: for the testimony of Jesus is the spirit of prophecy." },
    { ref: "Galatians 2:20", description: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God." },
    { ref: "James 2:20", description: "But wilt thou know, O vain man, that faith without works is dead?" }
  ],

  // Hebrews 8
  "hebrews 8:1": [
    { ref: "Hebrews 4:14-16", description: "Seeing then that we have a great high priest, that is passed into the heavens, Jesus the Son of God, let us hold fast our profession." },
    { ref: "Hebrews 9:11", description: "Christ being come an high priest of good things to come, by a greater and more perfect tabernacle, not made with hands." },
    { ref: "Psalm 110:1", description: "The Lord said unto my Lord, Sit thou at my right hand, until I make thine enemies thy footstool." }
  ],
  "hebrews 8:2": [
    { ref: "Hebrews 9:24", description: "For Christ is not entered into the holy places made with hands, which are the figures of the true; but into heaven itself, now to appear in the presence of God for us." },
    { ref: "Exodus 25:8-9", description: "And let them make me a sanctuary; that I may dwell among them. According to all that I shew thee, after the pattern of the tabernacle." },
    { ref: "Revelation 15:5", description: "And after that I looked, and, behold, the temple of the tabernacle of the testimony in heaven was opened." }
  ],
  "hebrews 8:3": [
    { ref: "Hebrews 5:1", description: "For every high priest taken from among men is ordained for men in things pertaining to God, that he may offer both gifts and sacrifices for sins." },
    { ref: "Ephesians 5:2", description: "And walk in love, as Christ also hath loved us, and hath given himself for us an offering and a sacrifice to God for a sweetsmelling savour." }
  ],
  "hebrews 8:4": [
    { ref: "Hebrews 7:14", description: "For it is evident that our Lord sprang out of Juda; of which tribe Moses spake nothing concerning priesthood." },
    { ref: "Numbers 16:40", description: "To be a memorial unto the children of Israel, that no stranger, which is not of the seed of Aaron, come near to offer incense before the Lord." }
  ],
  "hebrews 8:5": [
    { ref: "Colossians 2:17", description: "Which are a shadow of things to come; but the body is of Christ." },
    { ref: "Exodus 25:40", description: "And look that thou make them after their pattern, which was shewed thee in the mount." },
    { ref: "Hebrews 10:1", description: "For the law having a shadow of good things to come, and not the very image of the things." }
  ],

  // Romans 12
  "romans 12:1": [
    { ref: "1 Corinthians 6:19-20", description: "What? know ye not that your body is the temple of the Holy Ghost which is in you... For ye are bought with a price: therefore glorify God in your body." },
    { ref: "1 Peter 2:5", description: "Ye also, as lively stones, are built up a spiritual house, an holy priesthood, to offer up spiritual sacrifices, acceptable to God by Jesus Christ." },
    { ref: "Romans 6:13", description: "Neither yield ye your members as instruments of unrighteousness unto sin: but yield yourselves unto God, as those that are alive from the dead." }
  ],
  "romans 12:2": [
    { ref: "1 John 2:15", description: "Love not the world, neither the things that are in the world. If any man love the world, the love of the Father is not in us." },
    { ref: "Ephesians 4:22-24", description: "That ye put off concerning the former conversation the old man... and be renewed in the spirit of your mind; And that ye put on the new man." },
    { ref: "Colossians 3:10", description: "And have put on the new man, which is renewed in knowledge after the image of him that created him." }
  ],

  // Daniel 8
  "daniel 8:14": [
    { ref: "Leviticus 16:16", description: "And he shall make an atonement for the holy place, because of the uncleanness of the children of Israel, and because of their transgressions in all their sins." },
    { ref: "Numbers 14:34", description: "After the number of the days in which ye searched the land... each day for a year, shall ye bear your iniquities, even forty years." },
    { ref: "Ezekiel 4:6", description: "And when thou hast accomplished them, lie again on thy right side, and thou shalt bear the iniquity of the house of Judah forty days: I have appointed thee each day for a year." },
    { ref: "Daniel 9:24-27", description: "Seventy weeks are determined upon thy people and upon thy holy city... from the going forth of the commandment to restore and to build Jerusalem." },
    { ref: "Hebrews 9:23", description: "It was therefore necessary that the patterns of things in the heavens should be purified with these; but the heavenly things themselves with better sacrifices." }
  ]
};

export const CrossReferenceEngine: React.FC<ToolProps> = ({ 
  report, 
  activeVerseIndex, 
  onReferenceChange, 
  theme 
}) => {
  // Calculate current baseline verse reference
  const currentBaseRef = report
    ? activeVerseIndex
      ? `${report.reference.split(":")[0].split(" ")[0]} ${report.reference.split(" ")[1]?.split(":")[0] || ""}:${activeVerseIndex}`
      : report.reference
    : "Revelation 14:12";

  // Match precompiled SDA-aligned list of scriptures
  const activeLookupKey = currentBaseRef.toLowerCase().trim();
  const sessionXrefKey = `stba_xref_insight_${encodeURIComponent(activeLookupKey)}`;
  const precompiledMatch = PRECOMPILED_XREFS[activeLookupKey];

  const [customWitnessInput, setCustomWitnessInput] = useState("");
  const [studyNotes, setStudyNotes] = useState(() => {
    try {
      return localStorage.getItem(`${sessionXrefKey}_notes`) || "";
    } catch {
      return "";
    }
  });
  const [analyzingNotes, setAnalyzingNotes] = useState(false);
  const [elderStephenInsight, setElderStephenInsight] = useState(() => {
    try {
      return localStorage.getItem(sessionXrefKey) || "";
    } catch {
      return "";
    }
  });
  const [manualWitnesses, setManualWitnesses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${sessionXrefKey}_witnesses`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state into localStorage for current scripture session
  useEffect(() => {
    try {
      if (elderStephenInsight) {
        localStorage.setItem(sessionXrefKey, elderStephenInsight);
      }
      if (studyNotes) {
        localStorage.setItem(`${sessionXrefKey}_notes`, studyNotes);
      }
      if (manualWitnesses.length > 0) {
        localStorage.setItem(`${sessionXrefKey}_witnesses`, JSON.stringify(manualWitnesses));
      }
    } catch (e) {}
  }, [elderStephenInsight, studyNotes, manualWitnesses, sessionXrefKey]);

  // Load when passage changes
  useEffect(() => {
    try {
      const savedInsight = localStorage.getItem(sessionXrefKey);
      setElderStephenInsight(savedInsight || "");
      const savedNotes = localStorage.getItem(`${sessionXrefKey}_notes`);
      setStudyNotes(savedNotes || "");
      const savedWitnesses = localStorage.getItem(`${sessionXrefKey}_witnesses`);
      setManualWitnesses(savedWitnesses ? JSON.parse(savedWitnesses) : []);
    } catch (e) {}
  }, [sessionXrefKey]);

  // Derive final witnesses list to render instantly of parallel covenants
  const currentWitnessesList = precompiledMatch 
    ? precompiledMatch 
    : report && report.step3 && report.step3.scripture_compares 
      ? report.step3.scripture_compares 
      : [
          { ref: "Revelation 12:17", description: "And the dragon was wroth with the woman, and went to make war with the remnant... which keep the commandments of God." },
          { ref: "Exodus 20:11", description: "For in six days the Lord made heaven and earth... and rested the seventh day, wherefore the Lord hallowed it." }
        ];

  const handleAddManualWitness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWitnessInput.trim()) return;
    const cleanRef = customWitnessInput.trim();
    if (!manualWitnesses.includes(cleanRef)) {
      setManualWitnesses(prev => [...prev, cleanRef]);
    }
    setCustomWitnessInput("");
  };

  const handleDetachManualWitness = (ref: string) => {
    setManualWitnesses(prev => prev.filter(w => w !== ref));
  };

  const handleAnalyzeDoctrinalChain = async () => {
    setAnalyzingNotes(true);
    setElderStephenInsight("");
    try {
      const witnessRefs = [
        ...currentWitnessesList.map(w => w.ref),
        ...manualWitnesses
      ];
      const payload = {
        currentMode: "STBA" as const,
        noteTitle: `Cross-Reference Study: ${currentBaseRef}`,
        noteContent: `Anchor Scripture: ${currentBaseRef}\nLinguistic Witnesses Compare:\n${witnessRefs.join(", ")}\n\nMy Exegesis Synthesis Notes:\n${studyNotes || "Scripture acts as its own divine expositor."}`,
        base_verse: currentBaseRef,
        related_verses: witnessRefs,
        notes: studyNotes,
        userAction: "cross_reference"
      };

      const result = await callElderStephen(payload);
      if (result && result.text) {
        setElderStephenInsight(result.text);
      } else {
        setElderStephenInsight("The scriptural witnesses align perfectly under Sola Scriptura. The sanctuary shadow models found in earthly services align precisely with the heavenly ministration of our Great High Priest.");
      }
    } catch (e: any) {
      console.error(e);
      setElderStephenInsight("Unable to call high-level academic model details. Visually, these scriptural paths demonstrate the line-upon-line consistency of Bible truth.");
    } finally {
      setAnalyzingNotes(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-left bg-transparent">
      {/* Title Header Panel with Auto-Retract */}
      <AutoRetractToolbar theme={theme}>
        <div className={`p-4 border-b shrink-0 ${theme === "dark" ? "bg-[#161B22] border-[#21262D]" : "bg-[#FAF7F2] border-[#E5DFD5]"}`}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500 animate-pulse" />
            <h3 className="font-serif text-sm font-semibold tracking-wide uppercase">Cross-Reference Engine</h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-sans leading-relaxed">
            Scripture interprets Scripture. Study parallel covenants, sanctuary type models, and prophetic lines line-upon-line.
          </p>
        </div>
      </AutoRetractToolbar>

      {/* Main interactive content space */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-4 pb-32 md:pb-6 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
        {/* Anchor Synced Indicator */}
        <div className={`p-3 rounded-lg border ${
          theme === "dark" ? "bg-[#0F1420] border-blue-900/10" : "bg-[#F8F8F8] border-stone-200/60"
        }`}>
          <div className={`flex items-center gap-1.5 select-none text-[10px] font-mono font-bold uppercase mb-1 ${
            theme === "dark" ? "text-blue-500" : "text-[#000000]"
          }`}>
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Synced Anchor Scripture</span>
          </div>
          <span className={`text-base font-serif font-bold block select-all ${
            theme === "dark" ? "text-gray-200" : "text-[#000000]"
          }`}>
            {currentBaseRef}
          </span>
          <span className={`text-[10px] font-sans block mt-0.5 ${
            theme === "dark" ? "text-gray-400" : "text-[#333333]"
          }`}>
            {activeVerseIndex 
              ? `Automatically aligned with selected Verse ${activeVerseIndex}.`
              : "Showing foundational chapter-level cross-referenced witnesses."}
          </span>
        </div>

        {/* Scriptural Witnesses Chain Container */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase block select-none">
            Divine Witnesses ({currentWitnessesList.length + manualWitnesses.length})
          </span>

          <div className="space-y-2.5">
            {currentWitnessesList.map((comp: { ref: string; description: string }, idx: number) => (
              <div 
                key={idx} 
                onClick={() => onReferenceChange(comp.ref)}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all hover:bg-emerald-550/10 ${
                  theme === "dark" 
                    ? "bg-[#1E2530] border-[#2C3545] hover:border-blue-500/50" 
                    : "bg-[#FDFAF5] border-[#EAE3D5] hover:border-emerald-600/55"
                }`}
              >
                <div className="flex items-center justify-between pointer-events-none select-none">
                  <span className="font-serif text-xs font-bold text-[#C9973A]">{comp.ref}</span>
                  <span className="text-[9px] font-mono text-gray-500">View Reference &rarr;</span>
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed font-sans ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {comp.description}
                </p>
              </div>
            ))}

            {/* Custom Interactive Witnesses added by user */}
            {manualWitnesses.map((ref, idx) => (
              <div 
                key={`manual-${idx}`}
                onClick={() => onReferenceChange(ref)}
                className={`p-3.5 rounded-lg border text-style text-left cursor-pointer transition-all ${
                  theme === "dark" 
                    ? "bg-[#11161D] border-blue-900/40 hover:border-blue-500" 
                    : "bg-[#FFFFFF] border-blue-200 hover:border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between select-none">
                  <span className="font-serif text-xs font-bold text-amber-500">{ref}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDetachManualWitness(ref);
                    }}
                    className="text-gray-400 hover:text-red-500 font-mono text-[9px] z-25 cursor-pointer underline p-0.5"
                  >
                    Detach
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-sans italic mt-1 pointer-events-none">
                  User Added Witness. Click card to load and study translations.
                </p>
              </div>
            ))}
          </div>

          <p className="text-[10.5px] font-mono text-gray-500 text-center select-none">
            *Click cross-reference cards to load and study their translations inside the reader list.
          </p>
        </div>

        {/* Form to attach custom Scripture matches */}
        <form onSubmit={handleAddManualWitness} className="space-y-2.5 pt-2 border-t border-gray-700/40 select-none">
          <label className="text-[10px] font-mono font-bold tracking-wider text-[#C9973A] uppercase block">
            Add Companion Scripture Witness
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customWitnessInput}
              onChange={(e) => setCustomWitnessInput(e.target.value)}
              placeholder="e.g. Leviticus 16:16, Daniel 9:24..."
              className={`flex-1 rounded-lg px-3 py-2 text-xs outline-none transition-all ${
                theme === "dark"
                  ? "bg-[#1C2028] text-white border border-[#2C3545] focus:border-blue-500"
                  : "bg-white text-gray-800 border border-gray-300 focus:border-blue-500"
              }`}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Attach</span>
            </button>
          </div>
        </form>

        {/* Analytical Notes Workspace split */}
        <div className="space-y-2 pt-3 border-t border-gray-700/40">
          <label className="text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase block select-none">
            Synthesize Divine Harmony Notes
          </label>
          <textarea
            value={studyNotes}
            onChange={(e) => setStudyNotes(e.target.value)}
            placeholder="Document how these scriptures integrate. (e.g. Ex 20:11 provides the literal Sabbath Memorial context that the Revelation 14 pre-Advent judgment recall is built upon...)"
            rows={4}
            className={`w-full p-3 rounded-lg border text-xs leading-relaxed outline-none transition-all resize-none ${
              theme === "dark"
                ? "bg-[#1C2028] text-gray-200 border-[#2C3545] focus:border-emerald-500"
                : "bg-white text-gray-800 border-gray-300 focus:border-emerald-650"
            }`}
          />

          <button
            type="button"
            onClick={handleAnalyzeDoctrinalChain}
            disabled={analyzingNotes}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white font-mono text-xs uppercase tracking-wider font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
          >
            {analyzingNotes ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Weighing scriptural chain testimony...</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5" />
                <span>Verify Covenant Integrity</span>
              </>
            )}
          </button>
        </div>

        {/* Analytical Output Result */}
        {elderStephenInsight && (
          <div className={`p-4 rounded-xl border space-y-2 select-text animate-fade-in ${
            theme === "dark" ? "bg-stone-900/25 border-emerald-900/30" : "bg-emerald-50/20 border-emerald-100"
          }`}>
            <div className="flex items-center gap-1.5 border-b pb-1 border-transparent select-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[9.5px] font-mono font-black text-emerald-500 uppercase">
                Elder Stephen's Doctrinal Calibration
              </span>
            </div>
            <p className={`font-serif text-xs leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-850"}`}>
              {elderStephenInsight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


// ==========================================
// TOOL 6: VISUAL & BIBLE READER TOOLS
// ==========================================
export const VisualReaderTools: React.FC<ToolProps> = ({ 
  report, 
  theme, 
  bibleFontSize, 
  setBibleFontSize,
  onReferenceChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1.0);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);

  // Helper to parse reference string into chapter and target verse
  const parseRef = (raw: string | undefined | null) => {
    if (!raw || !raw.trim()) return { chapter: "Hebrews 8", targetVerse: 1 };
    const clean = raw.trim();
    const colonIdx = clean.indexOf(":");
    if (colonIdx !== -1) {
      const chapterPart = clean.slice(0, colonIdx).trim();
      const versePart = clean.slice(colonIdx + 1).trim();
      const numMatch = versePart.match(/^(\d+)/);
      const targetVerse = numMatch ? parseInt(numMatch[1], 10) : 1;
      return { chapter: chapterPart || clean, targetVerse: targetVerse || 1 };
    }
    return { chapter: clean, targetVerse: 1 };
  };

  // Selected chapter for full chapter loading
  const parsedInitial = parseRef(report?.step1?.reference || report?.reference);
  const [selectedChapter, setSelectedChapter] = useState<string>(parsedInitial.chapter);

  // Verse/Chapter Input Box state
  const [verseInput, setVerseInput] = useState<string>(selectedChapter);

  // Sync verseInput when selectedChapter changes
  useEffect(() => {
    setVerseInput(selectedChapter);
  }, [selectedChapter]);

  // Verse refs for auto-scrolling
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const currentUtteranceStartVerseRef = useRef<number>(parsedInitial.targetVerse || 1);

  // Translation version selection (NKJV, KJV, ESV, NASB)
  const [selectedVersion, setSelectedVersion] = useState<"NKJV" | "KJV" | "ESV" | "NASB">("NKJV");

  // Bible Reader Controls accordion state (default: collapsed false)
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Custom text input box state
  const [customText, setCustomText] = useState<string>("");

  // Saved quick-access chapters (holds up to 12 chapters)
  const DEFAULT_SAVED_CHAPTERS = [
    "Hebrews 9",
    "Hebrews 8",
    "Revelation 14",
    "Psalms 23",
    "John 3",
    "Genesis 1",
    "Isaiah 53",
    "Daniel 8",
    "Romans 12",
    "2 Timothy 3",
  ];

  const [savedChapters, setSavedChapters] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("stba_quick_access_chapters");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 12);
          }
        }
      } catch (e) {
        console.warn("Failed to load saved chapters from localStorage", e);
      }
    }
    return DEFAULT_SAVED_CHAPTERS;
  });

  const [isJustSaved, setIsJustSaved] = useState(false);

  // Handle Save Current Chapter to quick-access list (max 12 chapters)
  const handleSaveCurrentChapter = () => {
    const chapterToSave = (selectedChapter || verseInput || "").trim();
    if (!chapterToSave) return;

    setSavedChapters((prev) => {
      // Put saved chapter at front, avoid duplicates, limit to 12
      const filtered = prev.filter((ch) => ch.toLowerCase() !== chapterToSave.toLowerCase());
      const next = [chapterToSave, ...filtered].slice(0, 12);
      try {
        localStorage.setItem("stba_quick_access_chapters", JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setIsJustSaved(true);
    setTimeout(() => {
      setIsJustSaved(false);
    }, 2000);
  };

  // Active verse being read/highlighted
  const [activeVerseNumber, setActiveVerseNumber] = useState<number>(parsedInitial.targetVerse || 1);
  // Local char index within the current active verse text for precise word synchronization
  const [activeVerseLocalCharIndex, setActiveVerseLocalCharIndex] = useState<number | null>(null);

  // Setup layout font scale
  const [localLayoutScale, setLocalLayoutScale] = useState(14);
  const layoutScale = bibleFontSize !== undefined ? bibleFontSize : localLayoutScale;
  const setLayoutScale = setBibleFontSize !== undefined ? setBibleFontSize : setLocalLayoutScale;

  // Load full chapter verses
  const [verses, setVerses] = useState<ParallelVerse[]>([]);

  // Update selectedChapter and target verse when report changes
  useEffect(() => {
    const rawRef = report?.step1?.reference || report?.reference;
    if (rawRef) {
      const { chapter, targetVerse } = parseRef(rawRef);
      setSelectedChapter(chapter);
      if (targetVerse) {
        setActiveVerseNumber(targetVerse);
        currentUtteranceStartVerseRef.current = targetVerse;
        setTimeout(() => {
          if (verseRefs.current[targetVerse]) {
            verseRefs.current[targetVerse]?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  }, [report]);

  useEffect(() => {
    const loadedVerses = getFullChapterVerses(selectedChapter, report?.step1?.translations);
    setVerses(loadedVerses);
    setIsPaused(false);
    setIsPlaying(false);

    // Asynchronously fetch complete full chapter text if not already loaded in preset
    fetchChapterVersesAsync(selectedChapter).then((asyncVerses) => {
      if (asyncVerses && asyncVerses.length > 0) {
        setVerses(asyncVerses);
      }
    });
  }, [selectedChapter]);

  // Auto-scroll currently read or focused verse into view
  useEffect(() => {
    if (activeVerseNumber && verseRefs.current[activeVerseNumber]) {
      verseRefs.current[activeVerseNumber]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeVerseNumber, isPlaying, isPaused]);

  // Determine text to read: Custom Text or Full Chapter Text
  const isCustom = customText.trim().length > 0;
  
  // Combine all verses into full chapter text for speech synthesis
  const fullChapterText = verses
    .map((v) => `Verse ${v.verseNumber}. ${v.text[selectedVersion] || v.text.NKJV}`)
    .join(" ");

  const textToRead = isCustom ? customText.trim() : fullChapterText;

  // Biblical Names Pronunciation states
  const [nameSearch, setNameSearch] = useState("");
  const [playingName, setPlayingName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState<string | null>(null);
  const [nameVoice, setNameVoice] = useState<string>("Puck");
  const activeAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const activeAudioCtxRef = useRef<AudioContext | null>(null);

  const getBestLocalNeuralVoice = () => {
    return getElderStephenVoice();
  };

  // Compute currently reading verse index and exact local character offset within that verse
  useEffect(() => {
    if (isCustom) {
      setActiveVerseLocalCharIndex(activeCharIndex);
      return;
    }
    if (isPlaying && !isPaused && activeCharIndex !== null && verses.length > 0) {
      const startingVerse = currentUtteranceStartVerseRef.current || 1;
      const spokenVerses = verses.filter((v) => v.verseNumber >= startingVerse);
      let accumulatedLen = 0;
      let matched = false;

      for (let i = 0; i < spokenVerses.length; i++) {
        const v = spokenVerses[i];
        const prefix = `Verse ${v.verseNumber}. `;
        const body = v.text[selectedVersion] || v.text.NKJV;
        const fullChunk = `${prefix}${body} `;
        const start = accumulatedLen;
        const end = accumulatedLen + fullChunk.length;

        if (activeCharIndex >= start && activeCharIndex < end) {
          setActiveVerseNumber(v.verseNumber);
          const localOffset = activeCharIndex - (start + prefix.length);
          setActiveVerseLocalCharIndex(localOffset);
          matched = true;
          break;
        }
        accumulatedLen = end;
      }

      if (!matched && spokenVerses.length > 0) {
        setActiveVerseLocalCharIndex(null);
      }
    } else {
      setActiveVerseLocalCharIndex(null);
    }
  }, [activeCharIndex, isPlaying, isPaused, isCustom, verses, selectedVersion]);

  // Handle Verse Click:
  // - 1st click: Starts narration from that verse onward.
  // - 2nd click (same verse while actively playing): Pauses narration stream.
  // - 3rd click (same verse while paused): Resumes narration from where it paused.
  // - Clicking another verse: Switches reading immediately to new verse and starts narration from that verse onward.
  const handleVerseClick = (verseNum: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Case 1 & 4: If clicking a different verse or starting from stopped state -> start reading from this verse
    if (verseNum !== activeVerseNumber || !isPlaying) {
      startReadingFromVerse(verseNum);
      return;
    }

    // Case 2: 2nd click on currently playing verse -> pause narration
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    // Case 3: 3rd click on paused verse -> resume narration
    if (isPlaying && isPaused) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        startReadingFromVerse(verseNum);
      }
      return;
    }
  };

  const startReadingFromVerse = (verseNum: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setIsPaused(false);

    const filteredVerses = verses.filter((v) => v.verseNumber >= verseNum);
    const textForSpeech = filteredVerses
      .map((v) => `Verse ${v.verseNumber}. ${v.text[selectedVersion] || v.text.NKJV}`)
      .join(" ");

    setActiveVerseNumber(verseNum);
    currentUtteranceStartVerseRef.current = verseNum;

    const utterance = new SpeechSynthesisUtterance(textForSpeech);
    utterance.rate = speed;
    utterance.volume = volume / 100;
    utterance.pitch = 0.95;

    const naturalVoice = getBestLocalNeuralVoice();
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setActiveCharIndex(0);
    };

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setActiveCharIndex(e.charIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle Custom Text click to read / pause / resume
  const handleCustomTextClick = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !customText.trim()) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        startReadingCustomText();
      }
      return;
    }

    startReadingCustomText();
  };

  const startReadingCustomText = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(customText.trim());
    utterance.rate = speed;
    utterance.volume = volume / 100;
    utterance.pitch = 0.95;

    const naturalVoice = getBestLocalNeuralVoice();
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setActiveCharIndex(0);
    };

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        setActiveCharIndex(e.charIndex);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveCharIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleChapterChange = (chapterKey: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setSelectedChapter(chapterKey);
    if (onReferenceChange) {
      onReferenceChange(chapterKey);
    }
  };

  const handleSearchVerse = () => {
    const query = verseInput.trim();
    if (!query) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveCharIndex(null);

    // Clear custom text so the reader shows the loaded chapter verses
    setCustomText("");

    handleChapterChange(query);
  };

  // Handle Biblical Name Playback (Pronunciation Guide)
  const handlePlayName = async (nameObj: BiblicalName) => {
    if (loadingName) return;

    if (activeAudioRef.current) {
      try { activeAudioRef.current.stop(); } catch (e) {}
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setLoadingName(nameObj.name);
    setPlayingName(null);

    try {
      const textToSay = `The pronunciation is ${nameObj.name}. ${nameObj.name}.`;
      const response = await fetch("/api/study/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSay, voice: nameVoice })
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();

      if (data.success && data.audio) {
        const binaryString = window.atob(data.audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        const sampleRate = 24000;
        const ctx = activeAudioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        activeAudioCtxRef.current = ctx;

        const pcmBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
        pcmBuffer.getChannelData(0).set(float32Array);

        const source = ctx.createBufferSource();
        source.buffer = pcmBuffer;
        source.connect(ctx.destination);
        
        source.onended = () => {
          setPlayingName(null);
        };

        activeAudioRef.current = source;
        source.start(0);
        setPlayingName(nameObj.name);
      } else {
        playFallbackNameSpeech(nameObj.name);
      }
    } catch (err) {
      console.warn("AI Pronunciation failed, playing browser fallback:", err);
      playFallbackNameSpeech(nameObj.name);
    } finally {
      setLoadingName(null);
    }
  };

  const playFallbackNameSpeech = (nameText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(nameText);
    utterance.rate = 0.8;
    utterance.pitch = 0.95;
    
    const voice = getBestLocalNeuralVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => {
      setPlayingName(nameText);
    };
    utterance.onend = () => {
      setPlayingName(null);
    };
    utterance.onerror = () => {
      setPlayingName(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (activeAudioRef.current) {
        try { activeAudioRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Word-by-word highlighting helper accurately synchronized with speech boundary timing
  const renderTextWithWordHighlight = (text: string, localIdx: number | null) => {
    if (localIdx === null || !isPlaying || localIdx < 0) return text;

    const parts = text.split(/(\s+)/);
    let accumulated = 0;

    return parts.map((part, index) => {
      const start = accumulated;
      accumulated += part.length;
      const end = accumulated;

      const isSpace = /^\s+$/.test(part);
      if (isSpace) {
        return <span key={index}>{part}</span>;
      }

      const isCurrent = localIdx >= start && localIdx < end;

      return (
        <span
          key={index}
          className={`transition-all duration-100 rounded ${
            isCurrent
              ? "bg-amber-300 text-gray-950 dark:bg-amber-400 dark:text-gray-950 px-1 py-0.5 font-bold shadow-xs scale-105 inline-block ring-1 ring-amber-500/50"
              : ""
          }`}
        >
          {part}
        </span>
      );
    });
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto scroll-smooth text-left select-none pb-32 md:pb-6" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* 1. Header with AI Voice Reader Dropdown & Save Chapter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2 cursor-pointer shrink-0">
          <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
          <h3 className="font-serif text-sm font-semibold tracking-wide uppercase">Visual &amp; Bible Reader</h3>
        </div>

        {/* AI Voice Reader Dropdown & Save Chapter Button adjacent to each other */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={nameVoice}
            onChange={(e) => setNameVoice(e.target.value)}
            className={`text-xs font-mono font-bold rounded-lg border px-2.5 py-1 cursor-pointer outline-none focus:ring-1 focus:ring-[#C9973A] ${
              theme === "dark" ? "bg-[#161B22] border-gray-700 text-amber-400" : "bg-white border-[#E8E4DA] text-amber-800"
            }`}
            title="Select AI Voice Reader"
          >
            <option value="Puck">Elder Stephen</option>
            <option value="Zephyr">Zephyr (Soft)</option>
            <option value="Kore">Kore (Clear)</option>
            <option value="Fenrir">Fenrir (Deep)</option>
            <option value="Charon">Charon (Reverent)</option>
          </select>

          <button
            type="button"
            onClick={handleSaveCurrentChapter}
            className={`text-xs font-mono font-bold rounded-lg border px-3 py-1 cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ${
              isJustSaved
                ? "bg-emerald-600 text-white border-emerald-500 ring-1 ring-emerald-400"
                : theme === "dark"
                ? "bg-[#1C2028] hover:bg-[#252C3A] text-amber-300 border-gray-700 hover:border-[#C9973A]"
                : "bg-white hover:bg-[#FAF7F0] text-amber-800 border-[#E8E4DA] hover:border-[#C9973A]"
            }`}
            title="Save current chapter to quick-access list (up to 12)"
          >
            {isJustSaved ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-[#C9973A]" />
            )}
            <span>{isJustSaved ? "Saved!" : "Save Chapter"}</span>
          </button>
        </div>
      </div>

      {/* 2. Scripture Search / Chapter Input Box with Search Button */}
      <div className={`p-3 rounded-xl border space-y-2 ${
        theme === "dark" ? "bg-[#161B22]/80 border-gray-700/60" : "bg-[#FDFBF7] border-[#E8E4DA]"
      }`}>
        <label className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
          <Book className="w-3.5 h-3.5 text-[#C9973A]" />
          Chapter / Verse Reference Search
        </label>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={verseInput}
              onChange={(e) => setVerseInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchVerse()}
              placeholder="e.g. Hebrews 9, Revelation 14, John 3..."
              className={`w-full rounded-lg px-3 py-2 text-xs sm:text-sm outline-none transition-all ${
                theme === "dark"
                  ? "bg-[#1C2028] text-white border border-[#2C3545] focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A]"
                  : "bg-white text-gray-800 border border-[#E8E4DA] focus:border-[#C9973A] focus:ring-1 focus:ring-[#C9973A]"
              }`}
            />
          </div>
          <button
            onClick={handleSearchVerse}
            className="bg-[#C9973A] hover:bg-[#B2822B] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs h-[38px]"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {/* Quick Chapter Chips (Holds up to 12 chapters) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {savedChapters.map((ch) => (
            <button
              key={ch}
              onClick={() => {
                setVerseInput(ch);
                handleChapterChange(ch);
                setCustomText("");
              }}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer border ${
                selectedChapter.toLowerCase() === ch.toLowerCase() && !isCustom
                  ? "bg-[#C9973A] text-white border-[#C9973A] font-bold shadow-xs"
                  : theme === "dark"
                  ? "bg-[#1C2028] text-gray-400 border-gray-700 hover:text-amber-300 hover:border-amber-500/50"
                  : "bg-white text-gray-600 border-[#E8E4DA] hover:text-amber-800 hover:border-amber-400"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bible Reader Controls Collapsible Accordion */}
      <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        theme === "dark" ? "bg-[#161B22]/80 border-gray-700/60" : "bg-[#FDFBF7] border-[#E8E4DA]"
      }`}>
        <button
          type="button"
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className={`w-full p-3 sm:p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors select-none ${
            theme === "dark" 
              ? "bg-[#1C2333] hover:bg-[#232B3E] text-white" 
              : "bg-[#F4EFE6] hover:bg-[#EFE8DA] text-gray-900"
          }`}
          aria-expanded={isControlsOpen}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C9973A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide font-mono uppercase text-[#C9973A]">
              Bible Reader Controls
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#C9973A] transition-transform duration-200 ${
              isControlsOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Collapsible Content */}
        {isControlsOpen && (
          <div className={`p-4 space-y-4 border-t transition-all ${
            theme === "dark" ? "bg-[#161B22] border-gray-700/50" : "bg-[#FAF7F0] border-[#E8E4DA]"
          }`}>
            {/* 1. Narration Speed Slider */}
            <div>
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">
                <span className="font-extrabold flex items-center gap-1">
                  Narration Speed
                </span>
                <span className="text-[#C9973A] font-extrabold">{speed.toFixed(1)}X</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#C9973A] h-1.5 bg-gray-700/30 rounded-lg appearance-none cursor-pointer" 
              />
            </div>

            {/* 2. Oral Volume Slider */}
            <div>
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">
                <span className="font-extrabold flex items-center gap-1">
                  Oral Volume
                </span>
                <span className="text-[#C9973A] font-extrabold">{volume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full accent-[#C9973A] h-1.5 bg-gray-700/30 rounded-lg appearance-none cursor-pointer" 
              />
            </div>

            {/* 3. Visual Text Font Scale Slider */}
            <div>
              <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-gray-400 mb-1.5">
                <span className="font-extrabold flex items-center gap-1">
                  Visual Text Font Scale
                </span>
                <span className="text-[#C9973A] font-extrabold">{layoutScale}PX</span>
              </div>
              <input 
                type="range" 
                min="11" 
                max="26" 
                value={layoutScale}
                onChange={(e) => setLayoutScale(parseInt(e.target.value))}
                className="w-full accent-[#C9973A] h-1.5 bg-gray-700/30 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Full Chapter Display & Verse Highlighting */}
      {!isCustom && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <h4 className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#C9973A]">
                Full Chapter: {selectedChapter}
              </h4>
            </div>

            {/* Translation picker pills */}
            <div className="flex items-center gap-1">
              {(["NKJV", "KJV", "ESV", "NASB"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVersion(v)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    selectedVersion === v
                      ? "bg-[#C9973A] text-white shadow-xs"
                      : theme === "dark" ? "bg-gray-800 text-gray-400 hover:text-gray-200" : "bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Verses Container */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scroll-smooth">
            {verses.map((v) => {
              const verseContent = v.text[selectedVersion] || v.text.NKJV;
              const isCurrentVerse = isPlaying && activeVerseNumber === v.verseNumber;
              const isCurrentPaused = isCurrentVerse && isPaused;

              return (
                <div
                  key={v.verseNumber}
                  ref={(el) => { verseRefs.current[v.verseNumber] = el; }}
                  onClick={() => handleVerseClick(v.verseNumber)}
                  title={
                    isCurrentVerse
                      ? isPaused
                        ? `Click verse ${v.verseNumber} again to resume reading`
                        : `Click verse ${v.verseNumber} again to pause reading`
                      : `Click verse ${v.verseNumber} to start reading`
                  }
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 select-text relative group ${
                    isCurrentVerse && !isPaused
                      ? theme === "dark"
                        ? "bg-[#282218] border-[#C9973A] text-amber-100 shadow-md ring-1 ring-[#C9973A]/50"
                        : "bg-[#FFFDF5] border-[#C9973A] text-amber-950 shadow-md ring-1 ring-[#C9973A]/50"
                      : isCurrentPaused
                      ? theme === "dark"
                        ? "bg-[#261E16] border-amber-500/80 text-amber-200 shadow-sm ring-1 ring-amber-500/40"
                        : "bg-[#FFFBF0] border-amber-500 text-amber-900 shadow-sm ring-1 ring-amber-500/40"
                      : theme === "dark"
                      ? "bg-[#1C2028] border-gray-800 text-gray-300 hover:border-amber-500/50 hover:bg-[#202530]"
                      : "bg-[#FDFBF7] border-[#E8E4DA] text-gray-800 hover:border-amber-400 hover:bg-[#FAF7F0]"
                  }`}
                  style={{ fontSize: `${layoutScale}px` }}
                >
                  <div className="flex items-center justify-between mb-1.5 select-none">
                    <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded transition-colors ${
                      isCurrentVerse
                        ? "bg-[#C9973A] text-white"
                        : theme === "dark" ? "bg-gray-800 text-amber-400 group-hover:bg-amber-900/40" : "bg-amber-100 text-amber-800 group-hover:bg-amber-200"
                    }`}>
                      v.{v.verseNumber}
                    </span>

                    {isCurrentVerse && !isPaused && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#C9973A] font-extrabold animate-pulse">
                        <Volume2 className="w-3 h-3" /> Reading Verse {v.verseNumber} <span className="text-[9px] opacity-75">(Click to pause)</span>
                      </span>
                    )}

                    {isCurrentPaused && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500 font-extrabold">
                        <Pause className="w-3 h-3" /> Paused at Verse {v.verseNumber} <span className="text-[9px] opacity-75">(Click to resume)</span>
                      </span>
                    )}

                    {!isCurrentVerse && (
                      <span className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to read
                      </span>
                    )}
                  </div>

                  <p className="leading-relaxed font-serif">
                    {isCurrentVerse && !isPaused
                      ? renderTextWithWordHighlight(verseContent, activeVerseLocalCharIndex)
                      : verseContent}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If Custom Text active, render Custom Text Card */}
      {isCustom && (
        <div 
          onClick={handleCustomTextClick}
          title={isPlaying ? (isPaused ? "Click custom text to resume" : "Click custom text to pause") : "Click custom text to start reading"}
          className={`p-4 rounded-xl border leading-relaxed select-text cursor-pointer transition-all duration-300 ease-in-out shadow-xs ${
            isPlaying && !isPaused
              ? theme === "dark" ? "bg-[#282218] border-[#C9973A] text-amber-100" : "bg-[#FFFDF5] border-[#C9973A] text-amber-950"
              : isPlaying && isPaused
              ? theme === "dark" ? "bg-[#261E16] border-amber-500/80 text-amber-200" : "bg-[#FFFBF0] border-amber-500 text-amber-900"
              : theme === "dark" 
              ? "bg-[#1C2028] border-gray-700/50 text-gray-200 hover:border-amber-500/50" 
              : "bg-[#FDFBF7] border-[#E8E4DA] text-gray-800 hover:border-amber-400"
          }`}
          style={{ 
            fontSize: `${layoutScale}px`,
            fontFamily: "Inter, sans-serif"
          }}
        >
          <div className="flex items-center justify-between mb-2 select-none">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <h4 className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-[#C9973A]">
                Custom Text Reader Stream
              </h4>
            </div>
            {isPlaying && !isPaused && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#C9973A] font-extrabold animate-pulse">
                <Volume2 className="w-3 h-3" /> Reading custom text (Click to pause)
              </span>
            )}
            {isPlaying && isPaused && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-500 font-extrabold">
                <Pause className="w-3 h-3" /> Paused (Click to resume)
              </span>
            )}
          </div>
          <p className="leading-relaxed font-sans min-h-[60px]">
            {isPlaying && !isPaused ? renderTextWithWordHighlight(customText, activeVerseLocalCharIndex) : customText}
          </p>
        </div>
      )}



      {/* 6. Biblical Names Pronunciation Guide - UNTOUCHED */}
      <div className="border-t pt-4 mt-2 space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
            <h4 className="font-serif text-xs font-semibold tracking-wide uppercase">Biblical Name Pronunciation Guide</h4>
          </div>
          
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Click on any name to hear its high-fidelity AI-generated pronunciation and view its Hebrew/Greek root meaning.
          </p>

          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search biblical names..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:ring-1 focus:ring-[#C9973A] focus:outline-hidden ${
                theme === "dark" 
                  ? "bg-[#161B22] border-gray-700 text-gray-200 placeholder-gray-500" 
                  : "bg-white border-[#E8E4DA] text-gray-800 placeholder-gray-400"
              }`}
            />
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {BIBLICAL_NAMES_DICTIONARY.filter(item => 
              item.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
              item.meaning.toLowerCase().includes(nameSearch.toLowerCase())
            ).map((item) => {
              const isItemPlaying = playingName === item.name;
              const isItemLoading = loadingName === item.name;

              return (
                <div 
                  key={item.name}
                  className={`p-2.5 rounded-lg border transition-all duration-200 text-left ${
                    theme === "dark"
                      ? "bg-[#1A212D] border-gray-800/80 hover:border-gray-700 text-gray-200"
                      : "bg-[#FCFBF9] border-[#EAE6DD] hover:border-[#D6D0C2] text-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xs font-bold text-gray-900 dark:text-white">{item.name}</span>
                      <span className="font-mono text-[9px] text-amber-500 font-extrabold ml-2">[ {item.phonetic} ]</span>
                    </div>
                    <button
                      onClick={() => handlePlayName(item)}
                      disabled={loadingName !== null}
                      className="p-1.5 rounded-full bg-[#C9973A]/10 hover:bg-[#C9973A] text-[#C9973A] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                      title="Pronounce"
                    >
                      {isItemLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isItemPlaying ? (
                        <Volume2 className="w-3 h-3 animate-bounce" />
                      ) : (
                        <Play className="w-3 h-3 ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-1.5 text-[10px] space-y-0.5 leading-normal opacity-90">
                    <div>
                      <span className="font-bold text-amber-500 font-mono text-[8px] uppercase tracking-wider">Meaning: </span>
                      <span className="italic">&ldquo;{item.meaning}&rdquo;</span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };


// ==========================================
// TOOL 7: INTERACTIVE COGNITIVE LESSON REVIEW
// ==========================================
interface ReviewQuestion {
  id: string;
  prompt: string;
  context: string;
  rubricKeywords: string[];
  rubricLabels: string[];
  elderFeedbackMatch: string;
  elderFeedbackMiss: string;
}

const getReviewQuestions = (reference: string, activeVerseIndex: number | null, topic?: string): ReviewQuestion[] => {
  const refLower = reference.toLowerCase();
  
  if (refLower.includes("revelation 14") || refLower.includes("three angels")) {
    if (activeVerseIndex === 6) {
      return [
        {
          id: "rev14-6",
          prompt: "What is the cosmic significance of the 'everlasting gospel' flying in mid-heaven preceding judgment?",
          context: "Revelation 14:6",
          rubricKeywords: ["gospel", "grace", "salvation", "everlasting", "mid-heaven", "preach"],
          rubricLabels: ["Everlasting Grace", "Universal Proclamation", "Redemptive Order"],
          elderFeedbackMatch: "You have accurately identified how salvation and grace must precede the declaration of judgment. The everlasting gospel (euangelion) proves that God acts first in love.",
          elderFeedbackMiss: "Consider how 'mid-heaven' signifies universal public visibility and how 'everlasting' implies that God’s covenant has never changed."
        }
      ];
    }
    if (activeVerseIndex === 7) {
      return [
        {
          id: "rev14-7",
          prompt: "How does the command to 'Fear God, and give glory to him' link directly with the Sabbath and Creator worship?",
          context: "Revelation 14:7",
          rubricKeywords: ["worship", "creator", "creation", "sabbath", "memorial", "judgment", "glory"],
          rubricLabels: ["Creator Worship", "Pre-Advent Judgment", "Sabbath Memorial"],
          elderFeedbackMatch: "Outstanding exegesis! You connected 'worship Him who made heaven and earth' with the literal Decalogue Sabbath commandment (Exodus 20:11) as a shield against counterfeit claims.",
          elderFeedbackMiss: "Review the parallel with Exodus 20:11; the call to worship the Creator is a direct citation of the Fourth Commandment."
        }
      ];
    }
    if (activeVerseIndex === 8) {
      return [
        {
          id: "rev14-8",
          prompt: "What theological confusion and syncretism does 'Babylon the Great' and her 'wine of wrath' represent?",
          context: "Revelation 14:8",
          rubricKeywords: ["babylon", "confusion", "mixture", "wine", "fall", "compromise"],
          rubricLabels: ["Theological Confusion", "Babylonian Compromise", "Secular Syncretism"],
          elderFeedbackMatch: "Amen! You parsed how Babylon's wine represents confusing human traditions mixed with divine scripture, creating spiritual intoxication.",
          elderFeedbackMiss: "Remember that Babylon signifies confusion (Babel). Her wine is the mixture of secularism, human dogmas, and state-enforced dictates instead of Sola Scriptura."
        }
      ];
    }
    if (activeVerseIndex === 9 || activeVerseIndex === 10 || activeVerseIndex === 11) {
      return [
        {
          id: `rev14-${activeVerseIndex}`,
          prompt: `Explain the solemn warning concerning worshiping the beast and receiving its mark in the forehead or hand.`,
          context: `Revelation 14:${activeVerseIndex}`,
          rubricKeywords: ["mark", "beast", "seal", "allegiance", "loyalty", "forehead", "hand"],
          rubricLabels: ["Mark vs. Seal", "Mental Allegiance", "Active Sanction"],
          elderFeedbackMatch: "A thorough comparison! The forehead represents intellectual conviction, the hand represents physical conformity, whereas the Seal of God demands full character assimilation.",
          elderFeedbackMiss: "Look into the contrast in Deuteronomy 6 and Revelation 7: the forehead/hand indicate mental and physical consent, respectively, while God seals only the forehead."
        }
      ];
    }
    if (activeVerseIndex === 12) {
      return [
        {
          id: "rev14-12",
          prompt: "How do ‘the commandments of God and the faith of Jesus’ operate as active, living faith testimonies under severe trial?",
          context: "Revelation 14:12",
          rubricKeywords: ["commandments", "faith", "jesus", "law", "grace", "patience", "perseverance"],
          rubricLabels: ["Decalogue Loyalty", "Justification In Verity", "Saints' Perseverance"],
          elderFeedbackMatch: "Praise God! You rightly divided how keeping the Commandments is not legalism if performed through the inner 'faith OF Jesus' Himself.",
          elderFeedbackMiss: "Examine Ellen White's quote that this is 'justification by faith in verity'. One cannot keep the law without having the supernatural faith of Jesus."
        }
      ];
    }

    // Default passage level when no specific verse selected
    return [
      {
        id: "rev14-gen-1",
        prompt: "Identify how the concept of Creator/Creation models is explicitly embedded in this Sabbath Memorial.",
        context: "Revelation 14:6-12",
        rubricKeywords: ["creator", "creation", "sabbath", "worship", "memorial", "genesis"],
        rubricLabels: ["Edenic Creation Model", "Sabbath Memorial Shield", "Universal Worship Safeguard"],
        elderFeedbackMatch: "You successfully recognized how the first angel's call to worship the Maker of heaven and earth is a fortress securing the true Sabbath against evolutionary counterfeits.",
        elderFeedbackMiss: "Remind yourself to tie the first angel's command back to the Edenic creation model of Genesis 1-2."
      },
      {
        id: "rev14-gen-2",
        prompt: "Detail how the living 'faith of Jesus' contrasts with popular works-based, legalistic character structures.",
        context: "Revelation 14:6-12",
        rubricKeywords: ["faith of jesus", "legalism", "works", "character", "righteousness", "imputed"],
        rubricLabels: ["Faith of Jesus vs. Legalism", "Works Counterfeits", "Imputed/Imparted Character"],
        elderFeedbackMatch: "Spot-on explanation. You contrast legalistic self-reliance with the imputed and imparted righteousness of Christ, which acts as the real victory engine.",
        elderFeedbackMiss: "Look closer at how legalism tries to satisfy divine demands in human flesh, failing to possess the real faith that Jesus exercised in Gethsemane."
      }
    ];
  }

  if (refLower.includes("hebrew") || refLower.includes("sanctuary")) {
    if (activeVerseIndex === 1 || activeVerseIndex === 2) {
      return [
        {
          id: "heb8-1-2",
          prompt: "What is the critical significance of Christ acting as our High Priest in the heavenly Sanctuary?",
          context: `Hebrews 8:${activeVerseIndex}`,
          rubricKeywords: ["priest", "sanctuary", "heavenly", "intercession", "mediator"],
          rubricLabels: ["Heavenly High Priest", "Holy Sanctuary Ministry", "Active Intercession"],
          elderFeedbackMatch: "You have clearly mapped Christ's active intercession in the true Tabernacle pitched by the Lord. This shifts our gaze from earthly temples to the throne of God.",
          elderFeedbackMiss: "Ponder how a celestial Priest guarantees personal access to absolute grace without human sacraments or earthly temples."
        }
      ];
    }
    if (activeVerseIndex === 5) {
      return [
        {
          id: "heb8-5",
          prompt: "Explain why Moses was commanded to build the earthly cover according to the heavenly 'pattern' (typos).",
          context: "Hebrews 8:5",
          rubricKeywords: ["pattern", "copy", "shadow", "moses", "mount", "type"],
          rubricLabels: ["Divine Pattern (Typos)", "Copy and Shadow", "Sanctuary Typology"],
          elderFeedbackMatch: "Brilliant typological parsing! The earthly sanctuary was a shadow, but the heavenly is the prototype. Obeying the exact pattern reveals eternal salvation truths.",
          elderFeedbackMiss: "Remember that 'pattern' (Hebrew: tabnit, Greek: typos) means the actual model. If the copy is altered, our understanding of the atonement is distorted."
        }
      ];
    }
    return [
      {
        id: "heb8-gen-1",
        prompt: "Detail how Christ's sanctuary ministry integrates the cleansing of our daily record and character.",
        context: "Hebrews 8",
        rubricKeywords: ["cleansing", "record", "character", "sanctuary", "blood", "advocate"],
        rubricLabels: ["Record Purging", "Character Restoration", "Advocate Mediation"],
        elderFeedbackMatch: "Excellent. You showed that sanctuary cleansing is not just filing paperwork in heaven, but is the active purification of the human soul temple.",
        elderFeedbackMiss: "Examine how the earthly Day of Atonement demanded absolute heart-searching, parallel to our cleansing under Christ's high-priestly advocacy."
      }
    ];
  }

  if (refLower.includes("daniel 8") || refLower.includes("2300")) {
    return [
      {
        id: "dan8-14",
        prompt: "Delineate the connection between the 2,300 evenings and mornings, 1844, and the vindication of God’s character in judgment.",
        context: "Daniel 8:14",
        rubricKeywords: ["2300", "1844", "cleansing", "sanctuary", "vindication", "judgment", "day of atonement"],
        rubricLabels: ["Prophetic 2300 Days", "SDA 1844 Sanctuary Cleansing", "Sovereign Character Vindication"],
        elderFeedbackMatch: "Praise God for this detailed prophetic outline! You calculated the 457 BC starting point of Daniel 9 leading to 1844, and recognized this as the cosmic Day of Atonement.",
        elderFeedbackMiss: "Detail how the 2,300 days are connected to the 70 weeks of Daniel 9, demonstrating a perfect alignment of prophetic time starting in 457 BC."
      }
    ];
  }

  if (refLower.includes("roman") || refLower.includes("sacrifice") || refLower.includes("renewing")) {
    if (activeVerseIndex === 1) {
      return [
        {
          id: "rom12-1",
          prompt: "Explain what presenting your body as a 'living sacrifice' (thusia) means for holistic health and SDA discipleship.",
          context: "Romans 12:1",
          rubricKeywords: ["sacrifice", "body", "health", "holy", "holistic", "reasonable", "worship"],
          rubricLabels: ["Living Sacrifice (Thusia)", "Holistic Health Message", "Reasonable Worship Service"],
          elderFeedbackMatch: "Magnificent! You linked the health message with spiritual receptivity. Presenting a pure body temple enables the mind to discern the quiet voice of the Spirit.",
          elderFeedbackMiss: "Consider how our physical habits (rest, nutrition, purity) form the neurological foundation of spiritual exegesis and reasonable worship."
        }
      ];
    }
    if (activeVerseIndex === 2) {
      return [
        {
          id: "rom12-2",
          prompt: "Contrast being 'conformed to this world' with being 'transformed by the renewing of your mind' (metamorphoo).",
          context: "Romans 12:2",
          rubricKeywords: ["conform", "transform", "mind", "renew", "world", "will"],
          rubricLabels: ["Worldly Conformity", "Metamorphosis (Transformation)", "Intellectual Mind Renewal"],
          elderFeedbackMatch: "Well summarized. The world demands outward pressure of compliance, while Christ acts inside out through the Holy Spirit to transform (metamorphoo) our character.",
          elderFeedbackMiss: "Look up the Greek 'metamorphoo'—it is the same word used for the Transfiguration. The transformation must be radical and divine."
        }
      ];
    }
    return [
      {
        id: "rom12-gen-1",
        prompt: "How does physical and mental health directly influence the spiritual reception of the Holy Spirit?",
        context: "Romans 12",
        rubricKeywords: ["health", "reception", "spirit", "brain", "discern", "temple"],
        rubricLabels: ["Physical Health Channels", "Temple of the Spirit", "Neurological Discernment"],
        elderFeedbackMatch: "Spot-on! Keeping the body healthy keeps the brain clear, so the neural pathways are safe to distinguish truth from subtle temptation.",
        elderFeedbackMiss: "Remember that the brain is the medium through which God communicates. Clouding the temple with toxic practices ruins our spiritual discernment."
      }
    ];
  }

  // General Dynamic Fallback
  return [
    {
      id: "fallback-1",
      prompt: `Evaluate the covenant obedience and spiritual boundaries embedded in studying ${reference || "this scripture"}.`,
      context: reference || "General Scripture",
      rubricKeywords: ["obedience", "covenant", "faith", "truth", "righteousness", "god", "commandments"],
      rubricLabels: ["Covenant Boundaries", "Faith Transformation", "Doctrinal Character Purity"],
      elderFeedbackMatch: `You outlined a beautiful Christ-centered baseline for ${reference || "this scripture"}. Applying Sola Scriptura protects our exegesis from error.`,
      elderFeedbackMiss: "Try focusing on how Sola Scriptura and the Great Controversy framework ground our understanding of covenant safety."
    },
    {
      id: "fallback-2",
      prompt: `Detail how the topic '${topic || "your scripture study"}' relates to the character of God vs. the dragon.`,
      context: reference || "General Scripture",
      rubricKeywords: ["character", "love", "law", "grace", "controversy", "satan", "sabbath"],
      rubricLabels: ["God's Character of Love", "Sinaitic Law of Liberty", "The Cosmic Great Controversy"],
      elderFeedbackMatch: "Exactly! You successfully identified the heart of the Great Controversy: Satan's claims vs. God's vindication of His law which is love.",
      elderFeedbackMiss: "Connect this doctrine to the broader Adventist perspective of the vindication of God’s law of love in front of the universe."
    }
  ];
};

// ==========================================
// TOOL 7: SDA BIBLE COMMENTARY (REDESIGNED FROM REVIEW PANE)
// ==========================================
export const LessonReview: React.FC<ToolProps> = (props) => {
  return <SDABibleCommentary {...props} />;
};


// ==========================================
// TOOL 8: SYLLABUS MODE VIEW
// ==========================================
interface SyllabusItem {
  id: string; // e.g. "day_1"
  dayLabel: string; // "Day 1"
  title: string;
  description: string;
}

const getSyllabusLessonsForTrack = (reference: string, topic: string): SyllabusItem[] => {
  const refLower = reference.toLowerCase();
  
  if (refLower.includes("revelation 14") || refLower.includes("three angels")) {
    return [
      {
        id: "day_1",
        dayLabel: "Day 1",
        title: "Read & Literal Baselines",
        description: "Read the core Revelation 14 text, highlighting structural repetitions and vocabulary variations."
      },
      {
        id: "day_2",
        dayLabel: "Day 2",
        title: "Original Language Greek Root Study",
        description: "Examine Greek terms such as 'phobeo' (fear) and 'proskuneo' (worship) to uncover deep covenant nuances."
      },
      {
        id: "day_3",
        dayLabel: "Day 3",
        title: "Cross-References Alignment",
        description: "Link the first angel's worship invitation back to the Fourth Commandment in Exodus 20:11."
      },
      {
        id: "day_4",
        dayLabel: "Day 4",
        title: "The Beast's Mark vs. God's Seal",
        description: "Deconstruct the forensic warnings of the third angel and map out the character seals of the remnant."
      },
      {
        id: "day_5",
        dayLabel: "Day 5",
        title: "Justification By Faith In Verity",
        description: "Analyse quotes from Ellen White highlighting why the 'faith of Jesus' is the ultimate shield against legalism."
      },
      {
        id: "day_6",
        dayLabel: "Day 6",
        title: "Recall & Lesson Calibration",
        description: "Examine the authentic historical and theological notes in the SDA Commentary pane to test your exegesis."
      },
      {
        id: "day_7",
        dayLabel: "Day 7",
        title: "Discipleship Lesson Construction",
        description: "Compile a simplified lesson guide in your Notebook suited for teaching children or new believers."
      }
    ];
  }

  if (refLower.includes("hebrew") || refLower.includes("sanctuary")) {
    return [
      {
        id: "day_1",
        dayLabel: "Day 1",
        title: "Literal Priest Baseline Context",
        description: "Read Hebrews 8:1-5, visualizing Christ's active office as our celestial High Priest."
      },
      {
        id: "day_2",
        dayLabel: "Day 2",
        title: "Scribal Type-Pattern Analysis",
        description: "Perform root dictionary research on 'typos' (pattern) to distinguish the core model from its copies."
      },
      {
        id: "day_3",
        dayLabel: "Day 3",
        title: "Type & Antitype Alignment",
        description: "Map the similarities between the earthly wilderness sanctuary ministries and Christ's heavenly intercession."
      },
      {
        id: "day_4",
        dayLabel: "Day 4",
        title: "Decalogue Covenant Verification",
        description: "Read about the holy law deposited secure inside the Ark of the Covenant, demonstrating divine unchangeability."
      },
      {
        id: "day_5",
        dayLabel: "Day 5",
        title: "Sanctuary Cleansing Application",
        description: "Investigate Christ's high priestly office as an active cleansing of individual hearts and cosmic records."
      },
      {
        id: "day_6",
        dayLabel: "Day 6",
        title: "Sanctuary Lessons Review",
        description: "Engage with active-recall review tests to reinforce Hebrews sanctuary lessons."
      },
      {
        id: "day_7",
        dayLabel: "Day 7",
        title: "Teach Sanctuary Ministry",
        description: "Create a visual outline mapping the outer court, the holy place, and the most holy place for study groups."
      }
    ];
  }

  if (refLower.includes("daniel 8") || refLower.includes("2300")) {
    return [
      {
        id: "day_1",
        dayLabel: "Day 1",
        title: "Vindicated (Nisdaq) Translation Study",
        description: "Examine the dynamic translation of the Hebrew 'nisdaq' (cleansed, justified, vindicated) in Daniel 8:14."
      },
      {
        id: "day_2",
        dayLabel: "Day 2",
        title: "The 2300 Prophetic Days Scale",
        description: "Calculate the exact mathematical timeline using the day-year principle (Ezekiel 4:6 / Numbers 14:34)."
      },
      {
        id: "day_3",
        dayLabel: "Day 3",
        title: "Daniel 9 Decree Synchronization",
        description: "Correlate the 70 weeks prophecy starting in 457 BC to secure the anchor point of our prophetic calculations."
      },
      {
        id: "day_4",
        dayLabel: "Day 4",
        title: "The Anti-Typical Day of Atonement",
        description: "Delineate how the cleansing of the sanctuary mirrors the solemn cleansing rituals of Leviticus 16."
      },
      {
        id: "day_5",
        dayLabel: "Day 5",
        title: "Prophetic Hope Past 1844",
        description: "Review historical documentation covering the Great Disappointment and the subsequent breakthrough of light."
      },
      {
        id: "day_6",
        dayLabel: "Day 6",
        title: "SDA Commentary Prophetic Review",
        description: "Review the deep prophetic metrics and sanctuary exegesis in the SDA Commentary pane."
      },
      {
        id: "day_7",
        dayLabel: "Day 7",
        title: "Drafting Prophetic Charts",
        description: "Translate the timeline of Daniel 8-9 into a visual chart in your notebook notes to share with seekers."
      }
    ];
  }

  if (refLower.includes("roman") || refLower.includes("sacrifice") || refLower.includes("renewing")) {
    return [
      {
        id: "day_1",
        dayLabel: "Day 1",
        title: "Reasonable Service (Logike Latreia)",
        description: "Ponder the structural definition of presenting your body in worship, contrasting with legalistic rituals."
      },
      {
        id: "day_2",
        dayLabel: "Day 2",
        title: "Holistic Health Word Study",
        description: "Analyze details of 'thusia' (sacrifice) and 'metamorphoo' (transformed) to grasp mind-body integration."
      },
      {
        id: "day_3",
        dayLabel: "Day 3",
        title: "The Brain-Temple Daniel Resolution",
        description: "Map connection points in Daniel 1 to analyze physical resolution and subsequent intellectual sharpness."
      },
      {
        id: "day_4",
        dayLabel: "Day 4",
        title: "The Channels of the Soul",
        description: "Assess how lifestyle compliance blocks or expands high-reception pathways of the Holy Spirit."
      },
      {
        id: "day_5",
        dayLabel: "Day 5",
        title: "Mind Renewal Ellen White Research",
        description: "Examine texts in 'Counsels on Diet and Foods' showing how bodily pureness coordinates with final sealing."
      },
      {
        id: "day_6",
        dayLabel: "Day 6",
        title: "Romans 12 Integration Test",
        description: "Examine your comprehension of Reasonable Worship via the deep exegetical insights in the SDA Commentary pane."
      },
      {
        id: "day_7",
        dayLabel: "Day 7",
        title: "Holistic Devotional Blueprint",
        description: "Ascribe a physical-spiritual health lesson block template to teach others healthy covenant lifestyle habits."
      }
    ];
  }

  // Dynamic custom fallback using reference parameter
  return [
    {
      id: "day_1",
      dayLabel: "Day 1",
      title: "Literal Translation and Read Through",
      description: `Carefully read ${reference} comparing several literal translations to analyze exact textual structures.`
    },
    {
      id: "day_2",
      dayLabel: "Day 2",
      title: "Root Greek / Hebrew Word Investigation",
      description: `Identify 2-3 key terms inside ${reference} to study root definitions and dictionary usages.`
    },
    {
      id: "day_3",
      dayLabel: "Day 3",
      title: "Covenant Scriptural Cross-References",
      description: `Link ${reference} to other Old and New Testament testimonies, tracking systematic biblical coherence.`
    },
    {
      id: "day_4",
      dayLabel: "Day 4",
      title: "Great Controversy Integration",
      description: `Detail how ${topic || "this topic"} highlights the core controversy between Christ's law of liberty and counterfeit structures.`
    },
    {
      id: "day_5",
      dayLabel: "Day 5",
      title: "Christ-Centric Character Application",
      description: `Analyse how the gospel grace of Christ transforms personal lifestyle choices and obedience details.`
    },
    {
      id: "day_6",
      dayLabel: "Day 6",
      title: "Recall Mastery & Active Feedback",
      description: `Load interactive exegesis exercises in the sister Review panel to reinforce what you've learned.`
    },
    {
      id: "day_7",
      dayLabel: "Day 7",
      title: "Outline Practical Discipleship Material",
      description: `Synthesize a study guide outline inside your notebook to successfully teach this truth onward.`
    }
  ];
};

export const SyllabusModeView: React.FC<ToolProps> = ({ report, theme }) => {
  const reference = report?.reference || "Revelation 14:6-12";
  const topic = report?.topic || "The Three Angels' Messages";

  const lessons = getSyllabusLessonsForTrack(reference, topic);

  // States
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"checking" | "connected" | "table_missing" | "error" | "offline">("checking");
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const SYLLABUS_SQL = `create table stba_syllabus_progress (
  id text primary key,
  track text not null,
  item_id text not null,
  completed boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table stba_syllabus_progress enable row level security;

-- Create Open Policy for Public access
create policy "Allow all public access to syllabus progress"
  on stba_syllabus_progress
  for all
  using (true)
  with check (true);`;

  // Local storage fallback loader
  const loadLocalProgress = () => {
    const progressMap: Record<string, boolean> = {};
    lessons.forEach((l) => {
      const stored = localStorage.getItem(`stba_syllabus_progress_${reference}_${l.id}`);
      progressMap[l.id] = stored === "true";
    });
    setCompletedItems(progressMap);
  };

  // Sync / Load database table progress
  useEffect(() => {
    const fetchSyllabusProgress = async () => {
      setIsLoading(true);
      setSyncStatus("checking");

      try {
        const { data, error } = await supabase
          .from("stba_syllabus_progress")
          .select("*")
          .eq("track", reference);

        if (error) {
          // Detect Postgres error for non-existent table relation
          if (error.code === "PGRST116" || error.message?.includes("does not exist")) {
            setSyncStatus("table_missing");
          } else {
            setSyncStatus("error");
          }
          loadLocalProgress();
        } else {
          setSyncStatus("connected");
          const progressMap: Record<string, boolean> = {};
          
          // Prepopulate local state fallback values
          lessons.forEach((l) => {
            const stored = localStorage.getItem(`stba_syllabus_progress_${reference}_${l.id}`);
            if (stored === "true") progressMap[l.id] = true;
          });

          // Override local states with database states
          if (data && data.length > 0) {
            data.forEach((row: any) => {
              progressMap[row.item_id] = !!row.completed;
            });
          }
          setCompletedItems(progressMap);
        }
      } catch (err) {
        setSyncStatus("offline");
        loadLocalProgress();
      } finally {
        setIsLoading(false);
      }
    };

    fetchSyllabusProgress();
  }, [reference]);

  // Click handler to toggle items
  const handleToggleItem = async (itemId: string) => {
    const isCompletedNow = !completedItems[itemId];
    const newCompleted = { ...completedItems, [itemId]: isCompletedNow };
    setCompletedItems(newCompleted);

    // Persist in localStorage
    localStorage.setItem(`stba_syllabus_progress_${reference}_${itemId}`, isCompletedNow ? "true" : "false");

    if (syncStatus === "connected") {
      try {
        // Formulate a robust combined primary key for upsert matching standard constraints
        const sanitizedKey = `${reference}_${itemId}`.replace(/[\s:,-]/g, "_").toLowerCase();
        
        const { error } = await supabase
          .from("stba_syllabus_progress")
          .upsert({
            id: sanitizedKey,
            track: reference,
            item_id: itemId,
            completed: isCompletedNow,
            updated_at: new Date().toISOString()
          }, { onConflict: "id" });

        if (error) {
          console.warn("DB Background Upsert failed, keeping local storage copy intact:", error.message);
        }
      } catch (err) {
        console.warn("Database sync network interruption. Local storage persisted.");
      }
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SYLLABUS_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Completion stats calculations
  const totalItemsCount = lessons.length;
  const completedCount = lessons.filter((l) => completedItems[l.id]).length;
  const completionPercentage = totalItemsCount > 0 ? Math.round((completedCount / totalItemsCount) * 100) : 0;

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto scroll-smooth text-left select-none pb-32 md:pb-6" style={{ WebkitOverflowScrolling: "touch" }}>
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-amber-500" />
          <h3 className="font-serif text-sm font-semibold tracking-wide uppercase font-bold">STBA Weekly Syllabus Plan</h3>
        </div>
        {/* Dynamic Track Badge */}
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-[#C9973A] border border-amber-500/20 max-w-[150px] truncate">
          {reference}
        </span>
      </div>

      <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed max-w-md select-text">
        Follow this curated Seventh-day Adventist study path to systematically analyze the scriptural structure, history, and doctrines of <b>{topic}</b>.
      </p>

      {/* SYNC STATUS BAR */}
      <div className={`p-2.5 rounded-lg border flex items-center justify-between text-[10px] sm:text-xs leading-none select-none ${
        theme === "dark" ? "bg-[#13171F] border-gray-800" : "bg-stone-50 border-stone-200"
      }`}>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            {syncStatus === "checking" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              syncStatus === "connected" ? "bg-emerald-500" :
                syncStatus === "table_missing" ? "bg-amber-500 animate-pulse" :
                  syncStatus === "checking" ? "bg-amber-400" : "bg-rose-500"
            }`}></span>
          </div>
          <span className="font-mono text-gray-400 uppercase tracking-wider font-semibold">
            {syncStatus === "connected" && "Supabase Live Sync"}
            {syncStatus === "checking" && "Connecting Cloud..."}
            {syncStatus === "table_missing" && "Database Table Offline"}
            {syncStatus === "error" && "Database Link Error"}
            {syncStatus === "offline" && "Offline Sandbox"}
          </span>
        </div>

        {syncStatus === "table_missing" && (
          <button
            onClick={() => setShowSqlSetup(!showSqlSetup)}
            className="text-[9px] px-1.5 py-0.5 font-mono bg-amber-500/10 text-[#C9973A] hover:bg-amber-500/20 border border-amber-500/20 rounded cursor-pointer transition-all"
          >
            {showSqlSetup ? "Close SQL Help" : "Enable Cloud Sync"}
          </button>
        )}
      </div>

      {/* INSTRUCTIONS SQL INTERACTIVE HELPER */}
      {showSqlSetup && (
        <div className={`p-3.5 rounded-xl border space-y-3 select-text animate-fade-in text-[11px] leading-relaxed ${
          theme === "dark" ? "bg-[#1C2028] border-amber-500/10" : "bg-amber-50/15 border-amber-100"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-sans font-bold text-amber-500">
              <Database className="w-3.5 h-3.5" />
              <span>Configure Syllabus Table in Supabase</span>
            </div>
            <button
              onClick={() => setShowSqlSetup(false)}
              className="text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-gray-450">
            Keep your lesson checklists synced across devices by pasting this script inside your Supabase <b>SQL Query Editor</b>:
          </p>

          <div className="border border-white/5 rounded-lg overflow-hidden bg-black/40">
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 px-3 py-1.5 border-b border-white/5">
              <span>POSTGRESQL CODE</span>
              <button
                onClick={handleCopySql}
                className="text-[#C9973A] hover:underline cursor-pointer bg-transparent border-none"
              >
                {copiedSql ? "Copied OK!" : "Copy Code"}
              </button>
            </div>
            <pre className="p-3 text-[10px] font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
              {SYLLABUS_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* LEVEL PROGRESS BENCHMARK CARD */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        theme === "dark" ? "bg-[#1C2028] border-gray-700/50" : "bg-[#FDFBF7] border-[#E8E4DA]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-extrabold">
              CURRICULUM TRAINED STATUS
            </span>
            <span className={`text-[13px] font-serif font-bold ${theme === "dark" ? "text-gray-150" : "text-gray-800"}`}>
              {completionPercentage === 100 
                ? "Discipleship Covenant Completed! 🕊️" 
                : completionPercentage >= 50 
                  ? "Berean Mastery in Progress" 
                  : "Daily Study Foundations"}
            </span>
          </div>
          <span className="font-mono text-xs font-black text-amber-500">
            {completedCount}/{totalItemsCount} Clear
          </span>
        </div>

        {/* Progress percent slider bar */}
        <div className="w-full h-2 rounded-full relative overflow-hidden bg-gray-500/10">
          <div
            style={{ width: `${completionPercentage}%` }}
            className="h-full bg-gradient-to-r from-orange-500 to-[#C9973A] transition-all duration-300 rounded-full"
          />
        </div>
      </div>

      {/* SYLLABUS STEP CHECKLIST OUTLINE CONTAINER */}
      <div className="space-y-2.5 pt-0.5 select-text">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <span className="text-xs font-mono text-gray-400">Consulting study registers...</span>
          </div>
        ) : (
          lessons.map((item, index) => {
            const isCompleted = !!completedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`p-3.5 rounded-xl border flex gap-3 cursor-pointer select-none transition-all duration-120 ${
                  isCompleted
                    ? theme === "dark"
                      ? "bg-emerald-950/20 border-emerald-500/35 opacity-90"
                      : "bg-emerald-50/20 border-emerald-200"
                    : theme === "dark"
                      ? "bg-[#1C2028] border-gray-700/50 hover:border-gray-600/70"
                      : "bg-white border-stone-200 hover:border-stone-300"
                }`}
              >
                {/* Custom active circle toggle */}
                <div className="pt-0.5 shrink-0">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : theme === "dark"
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}>
                    {isCompleted ? (
                      <Check className="w-3 h-3 stroke-[3px]" />
                    ) : (
                      <span className="text-[9px] font-mono text-gray-500 font-bold">{index + 1}</span>
                    )}
                  </span>
                </div>

                {/* Main lesson copy */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono uppercase font-black px-1.5 py-0.5 rounded tracking-wide leading-none ${
                      isCompleted
                        ? theme === "dark"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        : theme === "dark"
                          ? "bg-gray-800 text-gray-400 border border-transparent"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                    }`}>
                      {item.dayLabel}
                    </span>
                    <h4 className={`text-xs font-bold font-sans transition-all leading-normal ${
                      isCompleted
                        ? "text-gray-450 line-through font-normal"
                        : theme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                  <p className={`text-[11.5px] font-sans leading-relaxed transition-all ${
                    isCompleted
                      ? "text-gray-500 italic"
                      : theme === "dark"
                        ? "text-gray-350"
                        : "text-stone-650"
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

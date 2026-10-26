import React, { useState, useRef, useEffect } from 'react'
import { StudyNote, EditorMode } from '../../types/notebook'
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Quote, 
  Plus,
  List,
  ListOrdered,
  Mic,
  MicOff,
  Undo,
  Redo,
  Volume2,
  VolumeX,
  BookOpen
} from 'lucide-react'

// Custom Indent and Outdent icons
const IndentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="9" y1="18" x2="21" y2="18" />
    <path d="M3 12h4 M5 10l2 2-2 2" />
  </svg>
)

const OutdentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="9" y1="18" x2="21" y2="18" />
    <path d="M7 12H3 M5 10l-2 2 2 2" />
  </svg>
)

interface NoteRenderProps {
  note: StudyNote
  mode: EditorMode
  onUpdate: (content: string) => void
  onScriptureClick?: (scripture: string) => void
  fontSize?: number
}

// Safe Date Formatter to avoid RangeError: Invalid time value on malformed date strings
const formatDateSafe = (dateVal: any): string => {
  if (!dateVal) return 'Recently';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

export const NoteRender: React.FC<NoteRenderProps> = ({ note, mode, onUpdate, onScriptureClick, fontSize = 13 }) => {
  // References for synchronized scrolling and DOM access
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Tracking latest content in ref to avoid stale closures
  const contentRef = useRef<string>(note?.content || '')

  // Undo/Redo tracking
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const lastSavedContentRef = useRef<string>(note?.content || '')
  const typingTimeoutRef = useRef<any>(null)
  const onUpdateDebouncedRef = useRef<any>(null)

  // Speech Recognition & Narration states
  const [isDictating, setIsDictating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Selection & Range Capturing Ref for continuous editing stability
  const selectionCaptureRef = useRef<{
    start: number;
    end: number;
    scrollTop: number;
    scrollLeft: number;
    anchorNode: Node | null;
    focusNode: Node | null;
    anchorOffset: number;
    focusOffset: number;
  } | null>(null)

  // Sync contentRef when note changes
  useEffect(() => {
    contentRef.current = note?.content || '';
    setUndoStack([]);
    setRedoStack([]);
    lastSavedContentRef.current = note?.content || '';
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [note?.id]);

  // Sync the uncontrolled textarea and word-count on mount, note switch, or external note content updates
  useEffect(() => {
    if (textareaRef.current) {
      if (textareaRef.current.value !== (note?.content || '')) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const scrollTop = textareaRef.current.scrollTop;
        const scrollLeft = textareaRef.current.scrollLeft;

        textareaRef.current.value = note?.content || '';

        textareaRef.current.setSelectionRange(start, end);
        textareaRef.current.scrollTop = scrollTop;
        textareaRef.current.scrollLeft = scrollLeft;
      }
    }
    contentRef.current = note?.content || '';
    
    // Update word count badge display
    const words = (note?.content || '').trim().split(/\s+/).filter(Boolean).length;
    const wordCountDisplay = document.getElementById("draft-word-count-display");
    if (wordCountDisplay) {
      wordCountDisplay.innerText = `${words} ${words === 1 ? 'word' : 'words'}`;
    }
  }, [note?.id, note?.content]);

  // Mode transition effect: When switching to 'read', flush any pending drafted text immediately
  useEffect(() => {
    if (mode === 'read') {
      // Stop voice dictation if active
      if (isDictating && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        setIsDictating(false);
      }
      // Ensure latest content is captured and committed to parent state
      const activeText = textareaRef.current ? textareaRef.current.value : contentRef.current;
      if (activeText !== undefined && activeText !== null) {
        contentRef.current = activeText;
      }
      if (contentRef.current && contentRef.current !== note?.content) {
        onUpdate(contentRef.current);
      }
    } else {
      // Stop speech audio playback if switching back to draft
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (onUpdateDebouncedRef.current) clearTimeout(onUpdateDebouncedRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const pushToUndo = (currentContent: string) => {
    setUndoStack(prev => [...prev.slice(-49), currentContent]);
    setRedoStack([]);
    lastSavedContentRef.current = currentContent;
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const textarea = textareaRef.current;
    const scrollTop = textarea ? textarea.scrollTop : 0;
    const scrollLeft = textarea ? textarea.scrollLeft : 0;
    const prevContent = undoStack[undoStack.length - 1];
    const current = contentRef.current || note?.content || '';
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, current]);
    lastSavedContentRef.current = prevContent;
    contentRef.current = prevContent;
    onUpdate(prevContent);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.value = prevContent;
        textarea.scrollTop = scrollTop;
        textarea.scrollLeft = scrollLeft;
        if (backdropRef.current) {
          backdropRef.current.scrollTop = scrollTop;
          backdropRef.current.scrollLeft = scrollLeft;
        }
      }
    }, 10);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const textarea = textareaRef.current;
    const scrollTop = textarea ? textarea.scrollTop : 0;
    const scrollLeft = textarea ? textarea.scrollLeft : 0;
    const nextContent = redoStack[redoStack.length - 1];
    const current = contentRef.current || note?.content || '';

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, current]);
    lastSavedContentRef.current = nextContent;
    contentRef.current = nextContent;
    onUpdate(nextContent);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.value = nextContent;
        textarea.scrollTop = scrollTop;
        textarea.scrollLeft = scrollLeft;
        if (backdropRef.current) {
          backdropRef.current.scrollTop = scrollTop;
          backdropRef.current.scrollLeft = scrollLeft;
        }
      }
    }, 10);
  };

  const captureEditorSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selection = window.getSelection();
    selectionCaptureRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      scrollTop: textarea.scrollTop,
      scrollLeft: textarea.scrollLeft,
      anchorNode: selection ? selection.anchorNode : null,
      focusNode: selection ? selection.focusNode : null,
      anchorOffset: selection ? selection.anchorOffset : 0,
      focusOffset: selection ? selection.focusOffset : 0
    };
  };

  const triggerDebouncedUpdate = (newValue: string) => {
    if (onUpdateDebouncedRef.current) {
      clearTimeout(onUpdateDebouncedRef.current);
    }
    contentRef.current = newValue;

    onUpdateDebouncedRef.current = setTimeout(() => {
      onUpdate(newValue);
    }, 800);
  };

  const handleBlur = () => {
    if (onUpdateDebouncedRef.current) {
      clearTimeout(onUpdateDebouncedRef.current);
    }
    const val = textareaRef.current ? textareaRef.current.value : contentRef.current;
    if (val !== undefined && val !== null) {
      contentRef.current = val;
      onUpdate(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const isMod = e.ctrlKey || e.metaKey;
    
    if (isMod) {
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }
    }

    captureEditorSelection();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    captureEditorSelection();
    
    const current = contentRef.current;
    const lastChar = newValue.slice(-1);
    const wasWordBoundary = lastChar === ' ' || lastChar === '\n';
    
    if (wasWordBoundary) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (current !== lastSavedContentRef.current) {
        const toSave = lastSavedContentRef.current;
        setUndoStack(prev => [...prev.slice(-49), toSave]);
        setRedoStack([]);
        lastSavedContentRef.current = current;
      }
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (contentRef.current !== lastSavedContentRef.current) {
          const toSave = lastSavedContentRef.current;
          setUndoStack(prev => [...prev.slice(-49), toSave]);
          setRedoStack([]);
          lastSavedContentRef.current = contentRef.current;
        }
      }, 1200);
    }

    contentRef.current = newValue;

    // Directly update word count display
    const wordCountDisplay = document.getElementById("draft-word-count-display");
    if (wordCountDisplay) {
      const words = newValue.trim().split(/\s+/).filter(Boolean).length;
      wordCountDisplay.innerText = `${words} ${words === 1 ? 'word' : 'words'}`;
    }

    triggerDebouncedUpdate(newValue);
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentText = contentRef.current;

          const spacerBefore = start > 0 && currentText[start - 1] !== ' ' && currentText[start - 1] !== '\n' ? ' ' : '';
          const spacerAfter = end < currentText.length && currentText[end] !== ' ' && currentText[end] !== '\n' ? ' ' : '';
          const insertedText = spacerBefore + transcript.trim() + spacerAfter;

          const nextContent = currentText.substring(0, start) + insertedText + currentText.substring(end);
          pushToUndo(currentText);
          contentRef.current = nextContent;
          textarea.value = nextContent;
          onUpdate(nextContent);

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertedText.length, start + insertedText.length);
          }, 10);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsDictating(false);
      };

      rec.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleDictation = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isDictating) {
      recognitionRef.current.stop();
    } else {
      setIsDictating(true);
      recognitionRef.current.start();
    }
  };

  // Ensure SpeechSynthesis voices are preloaded and refreshed
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  // Helper to select Microsoft Emma multilingual (natural) voice
  const getMicrosoftEmmaVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Exact or standard Microsoft Emma Multilingual / Natural voice
    const emmaMultilingual = voices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('emma') &&
        name.includes('microsoft') &&
        (name.includes('multilingual') || name.includes('natural'))
      );
    });
    if (emmaMultilingual) return emmaMultilingual;

    // 2. Any Microsoft Emma voice
    const msEmma = voices.find(v => {
      const name = v.name.toLowerCase();
      return name.includes('microsoft') && name.includes('emma');
    });
    if (msEmma) return msEmma;

    // 3. Any voice containing "Emma"
    const anyEmma = voices.find(v => v.name.toLowerCase().includes('emma'));
    if (anyEmma) return anyEmma;

    // 4. High-quality Natural or Multilingual English voice fallback
    const naturalFallback = voices.find(v => {
      const name = v.name.toLowerCase();
      return v.lang.startsWith('en') && (name.includes('natural') || name.includes('multilingual') || name.includes('online'));
    });
    if (naturalFallback) return naturalFallback;

    // 5. English voice fallback
    const englishFallback = voices.find(v => v.lang.startsWith('en'));
    return englishFallback || voices[0] || null;
  };

  // Speech Synthesis for Read Mode (Audio Read Aloud with Microsoft Emma multilingual natural voice)
  const toggleSpeakNote = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = (contentRef.current || note?.content || '')
      .replace(/[#*`>_~]/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();

    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Assign Microsoft Emma multilingual (natural) voice
    const voice = getMicrosoftEmmaVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Bulletpoints list toggle
  const handleBulletpoints = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = contentRef.current || note?.content || '';
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    const lines = text.split('\n');
    let currentPos = 0;
    let lineStartIdx = 0;
    let lineEndIdx = 0;
    lines.forEach((line, idx) => {
      const lineLength = line.length + 1;
      const startOfLine = currentPos;
      const endOfLine = currentPos + line.length;
      currentPos += lineLength;

      if (start >= startOfLine && start <= endOfLine) {
        lineStartIdx = idx;
      }
      if (end >= startOfLine && end <= endOfLine) {
        lineEndIdx = idx;
      }
    });

    const nextLines = lines.map((line, idx) => {
      if (idx >= lineStartIdx && idx <= lineEndIdx) {
        if (line.match(/^[-*•]\s+/)) {
          return line.replace(/^[-*•]\s+/, '');
        } else {
          return `- ${line}`;
        }
      }
      return line;
    });

    const nextContent = nextLines.join('\n');
    pushToUndo(text);
    contentRef.current = nextContent;
    textarea.value = nextContent;
    onUpdate(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + (nextContent.length - text.length) + (end - start));
      textarea.scrollTop = scrollTop;
      textarea.scrollLeft = scrollLeft;
      if (backdropRef.current) {
        backdropRef.current.scrollTop = scrollTop;
        backdropRef.current.scrollLeft = scrollLeft;
      }
    }, 10);
  };

  // Numbering list toggle
  const handleNumbering = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = contentRef.current || note?.content || '';
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    const lines = text.split('\n');
    let currentPos = 0;
    let lineStartIdx = 0;
    let lineEndIdx = 0;
    lines.forEach((line, idx) => {
      const lineLength = line.length + 1;
      const startOfLine = currentPos;
      const endOfLine = currentPos + line.length;
      currentPos += lineLength;

      if (start >= startOfLine && start <= endOfLine) {
        lineStartIdx = idx;
      }
      if (end >= startOfLine && end <= endOfLine) {
        lineEndIdx = idx;
      }
    });

    let counter = 1;
    const nextLines = lines.map((line, idx) => {
      if (idx >= lineStartIdx && idx <= lineEndIdx) {
        if (line.match(/^\d+\.\s+/)) {
          return line.replace(/^\d+\.\s+/, '');
        } else {
          const numPrefix = `${counter}. `;
          counter++;
          return numPrefix + line;
        }
      }
      return line;
    });

    const nextContent = nextLines.join('\n');
    pushToUndo(text);
    contentRef.current = nextContent;
    textarea.value = nextContent;
    onUpdate(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + (nextContent.length - text.length) + (end - start));
      textarea.scrollTop = scrollTop;
      textarea.scrollLeft = scrollLeft;
      if (backdropRef.current) {
        backdropRef.current.scrollTop = scrollTop;
        backdropRef.current.scrollLeft = scrollLeft;
      }
    }, 10);
  };

  // Sync scroll on textarea scroll
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    handleScroll();
  }, [note?.content, mode]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const scrollTop = textarea.scrollTop;
      const scrollLeft = textarea.scrollLeft;
      const timer = setTimeout(() => {
        textarea.scrollTop = scrollTop;
        textarea.scrollLeft = scrollLeft;
        if (backdropRef.current) {
          backdropRef.current.scrollTop = scrollTop;
          backdropRef.current.scrollLeft = scrollLeft;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [fontSize]);

  // Helper to insert markdown tags around selection
  const insertMarkup = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = contentRef.current || note?.content || '';
    const selectedText = text.substring(start, end);
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    const replacement = before + selectedText + after;
    const nextContent = text.substring(0, start) + replacement + text.substring(end);

    pushToUndo(text);
    contentRef.current = nextContent;
    textarea.value = nextContent;
    onUpdate(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      textarea.scrollTop = scrollTop;
      textarea.scrollLeft = scrollLeft;
      if (backdropRef.current) {
        backdropRef.current.scrollTop = scrollTop;
        backdropRef.current.scrollLeft = scrollLeft;
      }
    }, 10);
  };

  // Inline markdown parser for Read mode
  const parseInlineMarkdown = (text: string): string => {
    if (!text) return '';
    try {
      let escaped = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Allow <u> underline formatting
      escaped = escaped.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<span class="underline underline-offset-2">$1</span>');

      // Bold **text**
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Italic *text*
      escaped = escaped.replace(/\*(.*?)\*/g, '<em class="text-[var(--nb-gold)] italic">$1</em>');

      // Inline code `code`
      escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-[0.85em] font-mono bg-white/10 text-[var(--nb-gold)] border border-white/10">$1</code>');

      // Scripture detection with click handler
      const scriptureRegex = /\b(?:[1-3]\s)?[A-Z][A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+:\d+(?:-\d+)?\b/g;
      escaped = escaped.replace(scriptureRegex, (match) => {
        return `<span data-scripture="${match}" class="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono bg-[var(--nb-teal-muted)] hover:bg-[var(--nb-teal)]/20 text-[var(--nb-teal)] border border-[var(--nb-teal)]/20 cursor-pointer transition-colors" title="Deep study with Elder Stephen">${match}</span>`;
      });

      return escaped;
    } catch {
      return String(text || '');
    }
  };

  // Parse lines for block-level elements in Read Mode
  const renderReadMode = () => {
    const textToRender = (textareaRef.current ? textareaRef.current.value : '') || contentRef.current || note?.content || '';
    if (!textToRender.trim()) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--nb-border)] rounded-xl my-6 bg-white/[0.02]">
          <BookOpen className="w-10 h-10 text-[var(--nb-gold)] opacity-40 mb-3" />
          <h4 className="text-sm font-semibold text-[var(--nb-text)] mb-1">Blank Study Note</h4>
          <p className="text-xs text-[var(--nb-text-muted)] max-w-sm mb-4">
            No insights have been recorded on this page yet. Switch to Draft mode to start capturing scripture reflections.
          </p>
          <button
            type="button"
            onClick={() => {
              const draftBtn = document.querySelector('#stage-mode-toggles button:last-child') as HTMLButtonElement;
              if (draftBtn) draftBtn.click();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] border border-[var(--nb-border-gold)] hover:bg-[var(--nb-gold)] hover:text-stone-950 transition-all cursor-pointer"
          >
            Start Drafting Note
          </button>
        </div>
      );
    }

    const lines = textToRender.split('\n');

    return (
      <div 
        style={{ 
          fontSize: `${fontSize + 2}px`,
          fontFamily: 'Inter, "SF Pro Text", "Segoe UI", system-ui, sans-serif',
          fontWeight: 450,
          letterSpacing: '0.0125em',
          lineHeight: '1.6',
          paddingLeft: '11px',
          paddingRight: '11px',
          color: 'var(--nb-text)'
        }} 
        className="space-y-4 select-text text-[var(--nb-text)]"
        id="visual-reader-slide"
      >
        {lines.map((line, index) => {
          try {
            const trimmed = (line || '').trim();
            
            if (trimmed.startsWith('# ')) {
              const clean = trimmed.substring(2);
              return (
                <h1 
                  key={index} 
                  id={`read-h1-${index}`}
                  className="font-sans text-xl md:text-2xl font-bold text-[var(--nb-text)] tracking-tight mt-6 mb-3.5 border-b border-[var(--nb-border)] pb-2"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }}
                />
              );
            }

            if (trimmed.startsWith('## ')) {
              const clean = trimmed.substring(3);
              return (
                <h2 
                  key={index} 
                  id={`read-h2-${index}`}
                  className="font-sans text-lg font-bold text-[var(--nb-gold)] tracking-tight mt-5 mb-2.5"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }}
                />
              );
            }

            if (trimmed.startsWith('### ')) {
              const clean = trimmed.substring(4);
              return (
                <h3 
                  key={index} 
                  id={`read-h3-${index}`}
                  className="font-sans text-base font-semibold text-[var(--nb-teal)] tracking-tight mt-4 mb-2"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }}
                />
              );
            }

            if (trimmed.startsWith('#### ')) {
              const clean = trimmed.substring(5);
              return (
                <h4 
                  key={index} 
                  id={`read-h4-${index}`}
                  className="font-sans text-sm font-semibold text-[var(--nb-text)] uppercase tracking-wider mt-3 mb-1.5 opacity-90"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }}
                />
              );
            }

            if (trimmed.startsWith('> ') || trimmed.startsWith('>&nbsp;')) {
              const clean = trimmed.replace(/^>(\s|&nbsp;)?/, '');
              return (
                <blockquote 
                  key={index} 
                  id={`read-quote-${index}`}
                  className="pl-3.5 py-2 border-l-2 border-[var(--nb-gold)] bg-[var(--nb-gold-muted)]/30 rounded-r-md text-[0.95em] font-sans font-medium text-[var(--nb-text)] my-4.5 leading-snug italic"
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }}
                />
              );
            }

            if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
              return <hr key={index} className="my-6 border-[var(--nb-border)] opacity-60" />;
            }

            // Empty line
            if (trimmed === '') {
              return <div key={index} className="h-3" />;
            }

            // HTML Div containers align checks
            if (trimmed.startsWith('<div align="') || trimmed.startsWith('<div style="')) {
              const contentInside = trimmed.replace(/<\/?[^>]+(>|$)/g, '');
              const isCenter = trimmed.includes('align="center"');
              const isRight = trimmed.includes('align="right"') || trimmed.includes('text-right');
              const isJustify = trimmed.includes('align="justify"') || trimmed.includes('text-justify');
              return (
                <p 
                  key={index}
                  className={`leading-[1.6] text-[var(--nb-text)] font-sans mb-3.5 ${
                    isCenter ? 'text-center' : isRight ? 'text-right' : isJustify ? 'text-justify' : 'text-left'
                  }`}
                  dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(contentInside) }}
                />
              );
            }

            // Bullet Points Render
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
              const clean = trimmed.substring(2);
              const leadingSpaces = line.match(/^ */)?.[0].length || 0;
              const indentLevel = Math.floor(leadingSpaces / 4);
              return (
                <div 
                  key={index} 
                  style={{ paddingLeft: `${indentLevel * 1.5 + 0.5}rem` }}
                  className="flex items-start gap-2.5 leading-[1.6] text-[var(--nb-text)] font-sans mb-2"
                >
                  <span className="text-[var(--nb-gold)] font-bold select-none mt-1 shrink-0">•</span>
                  <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }} />
                </div>
              );
            }

            // Numbered Lists Render
            if (trimmed.match(/^\d+\.\s+/)) {
              const match = trimmed.match(/^\d+\.\s+/)!;
              const clean = trimmed.substring(match[0].length);
              const leadingSpaces = line.match(/^ */)?.[0].length || 0;
              const indentLevel = Math.floor(leadingSpaces / 4);
              return (
                <div 
                  key={index} 
                  style={{ paddingLeft: `${indentLevel * 1.5 + 0.5}rem` }}
                  className="flex items-start gap-2 leading-[1.6] text-[var(--nb-text)] font-sans mb-2"
                >
                  <span className="text-[var(--nb-gold)] font-mono font-bold select-none shrink-0">{match[0]}</span>
                  <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(clean) }} />
                </div>
              );
            }

            // Regular line
            return (
              <p 
                key={index} 
                id={`read-p-${index}`}
                className="leading-[1.6] text-[var(--nb-text)] font-sans mb-3.5"
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }}
              />
            );
          } catch {
            return (
              <p key={index} className="leading-[1.6] text-[var(--nb-text)] font-sans mb-3.5">
                {line}
              </p>
            );
          }
        })}
      </div>
    );
  };

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const scripture = target.getAttribute('data-scripture');
    if (scripture && onScriptureClick) {
      onScriptureClick(scripture);
    }
  };

  // Word count & reading metrics
  const activeContent = contentRef.current || note?.content || '';
  const wordCount = activeContent.trim() ? activeContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[var(--nb-bg)]" id="note-render-container">
      <style>{`
        #workspace-backdrop-layer {
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
        }
        #draft-textarea::selection {
          background-color: rgba(197, 160, 89, 0.28) !important;
          color: inherit !important;
        }
        .toolbar-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: var(--nb-text-muted);
          background: transparent;
          transition: all 140ms ease;
          cursor: pointer;
        }
        .toolbar-btn:hover {
          background-color: rgba(197, 160, 89, 0.08);
          color: var(--nb-gold);
        }
        .toolbar-btn:active {
          transform: scale(0.95);
        }
        .toolbar-divider {
          width: 1px;
          height: 18px;
          background-color: var(--nb-border);
          opacity: 0.5;
        }
      `}</style>

      {mode === 'draft' ? (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden" id="draft-workspace">
          
          {/* Refined Academic Study Toolbar */}
          <div 
            style={{ height: '44px', backgroundColor: 'var(--nb-bg)' }}
            className="px-3 border-b border-[var(--nb-border)] shrink-0 flex items-center justify-start select-none relative"
            id="draft-toolbar"
          >
            <div className="flex items-center gap-[12px] h-full overflow-x-auto no-scrollbar">
              
              {/* Group 1: Bold, Italic, Underline */}
              <div className="flex items-center gap-[6px]">
                <button 
                  type="button"
                  onClick={() => insertMarkup('**', '**')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-[16px] h-[16px]" />
                </button>
                <button 
                  type="button"
                  onClick={() => insertMarkup('*', '*')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-[16px] h-[16px]" />
                </button>
                <button 
                  type="button"
                  onClick={() => insertMarkup('<u>', '</u>')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-[16px] h-[16px]" />
                </button>
              </div>

              <div className="toolbar-divider" />

              {/* Group 2: Bulletpoints & Numbering */}
              <div className="flex items-center gap-[6px]">
                <button 
                  type="button"
                  onClick={handleBulletpoints}
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Bulletpoints (Unordered list)"
                >
                  <List className="w-[16px] h-[16px]" />
                </button>
                <button 
                  type="button"
                  onClick={handleNumbering}
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Numbering (Ordered list)"
                >
                  <ListOrdered className="w-[16px] h-[16px]" />
                </button>
              </div>

              <div className="toolbar-divider" />

              {/* Group 3: H1, H2, Quote, # */}
              <div className="flex items-center gap-[6px]">
                <button 
                  type="button"
                  onClick={() => insertMarkup('# ')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Heading 1"
                >
                  <Heading1 className="w-[16px] h-[16px]" />
                </button>
                <button 
                  type="button"
                  onClick={() => insertMarkup('## ')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Heading 2"
                >
                  <Heading2 className="w-[16px] h-[16px]" />
                </button>
                <button 
                  type="button"
                  onClick={() => insertMarkup('> ')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn" 
                  title="Blockquote"
                >
                  <Quote className="w-[16px] h-[16px]" />
                </button>
                <button 
                  type="button"
                  onClick={() => insertMarkup('#')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn text-xs font-semibold select-none font-mono text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)]" 
                  title="Insert hashtag (#)"
                >
                  #
                </button>
              </div>

              <div className="toolbar-divider" />

              {/* Group 4: Markdown Star insertions & Undo / Redo */}
              <div className="flex items-center gap-[6px]">
                <button 
                  type="button"
                  onClick={() => insertMarkup('*')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn text-sm font-bold select-none font-mono text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)]" 
                  title="Insert Asterisk (*)"
                >
                  *
                </button>
                <button 
                  type="button"
                  onClick={() => insertMarkup('**')} 
                  onMouseDown={(e) => e.preventDefault()}
                  className="toolbar-btn text-xs font-bold select-none font-mono text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)]" 
                  title="Insert Double Asterisk (**)"
                >
                  **
                </button>
                <div className="w-[1px] h-[12px] bg-[var(--nb-border)] opacity-30 mx-0.5" />
                <button 
                  type="button"
                  onClick={handleUndo}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={undoStack.length === 0}
                  className="toolbar-btn disabled:opacity-30 disabled:cursor-not-allowed" 
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-[14px] h-[14px]" />
                </button>
                <button 
                  type="button"
                  onClick={handleRedo}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={redoStack.length === 0}
                  className="toolbar-btn disabled:opacity-30 disabled:cursor-not-allowed" 
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-[14px] h-[14px]" />
                </button>
              </div>

              <div className="toolbar-divider" />

              {/* Group 5: Scripture tag (+) */}
              <button 
                type="button"
                onClick={() => insertMarkup(' Daniel 8:14 ')} 
                onMouseDown={(e) => e.preventDefault()}
                className="toolbar-btn !w-auto px-2.5 flex items-center gap-1 font-mono text-[10px] bg-[var(--nb-teal-muted)] hover:bg-[var(--nb-teal)]/15 border border-[var(--nb-teal)]/20 hover:border-[var(--nb-teal)] text-[var(--nb-teal)]" 
                title="Add Scripture Tag"
              >
                <Plus className="w-[13px] h-[13px]" />
                <span>Scripture Tag</span>
              </button>

              <div className="toolbar-divider" />

              {/* Group 6: Speech Dictation (Speak) */}
              <button 
                type="button"
                onClick={toggleDictation} 
                className={`toolbar-btn px-2.5 !w-auto flex items-center gap-1.5 transition-all duration-[200ms] ${
                  isDictating 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/35 hover:text-rose-200' 
                    : 'bg-[var(--nb-gold)]/10 text-[var(--nb-gold)] border border-[var(--nb-gold)]/20 hover:bg-[var(--nb-gold)]/20'
                }`}
                title={isDictating ? "Stop Voice Dictation (Listening...)" : "Start Voice Dictation"}
              >
                {isDictating ? (
                  <>
                    <Mic className="w-[14px] h-[14px] text-rose-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Listening</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-[14px] h-[14px] text-[var(--nb-gold)]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Voice Dictation</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Clean Editor Surface / Monospace Markdown Workspace */}
          <div className="flex-1 w-full relative overflow-hidden bg-[var(--nb-editor-bg)]">
            <textarea
              ref={textareaRef}
              id="draft-textarea"
              onScroll={handleScroll}
              onBlur={handleBlur}
              className="absolute inset-0 w-full h-full border-0 focus:outline-none focus:ring-0 overflow-x-hidden resize-none transition-all duration-120 ease-out"
              placeholder="# Write your theological notes..."
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: `${fontSize}px`,
                lineHeight: '1.6',
                padding: '26px 30px 260px 22px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'var(--nb-editor-bg)',
                color: 'var(--nb-text)',
                caretColor: 'var(--nb-gold)',
                zIndex: 2,
                overflowY: 'auto',
                transition: 'font-size 120ms ease, line-height 120ms ease'
              }}
              defaultValue={note?.content || ''}
              onKeyDown={handleKeyDown}
              onChange={handleTextareaChange}
            />
          </div>

          {/* Editor Status Footer */}
          <div 
            style={{ backgroundColor: 'var(--nb-sidebar)' }}
            className="flex items-center justify-between px-4 py-2 border-t border-[var(--nb-border)] shrink-0 select-none"
            id="draft-footer"
          >
            <span className="text-[11px] font-sans text-[var(--nb-text-muted)] tracking-wider uppercase font-semibold">
              FORMAT: MARKDOWN ENABLED
            </span>
             <span id="draft-word-count-display" className="text-[11px] font-mono text-[var(--nb-text-muted)]">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden" id="read-mode-container">
          {/* Reader Top Action Bar */}
          <div 
            style={{ height: '44px', backgroundColor: 'var(--nb-bg)' }}
            className="px-4 border-b border-[var(--nb-border)] shrink-0 flex items-center justify-between select-none"
            id="read-toolbar"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--nb-gold)] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reading View</span>
              </span>
              <span className="text-[10px] font-mono text-[var(--nb-text-dim)]">•</span>
              <span className="text-[11px] font-mono text-[var(--nb-text-muted)]">
                {wordCount} {wordCount === 1 ? 'word' : 'words'} ({readMinutes} min read)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Listen Aloud Button (Speech Synthesis with Microsoft Emma Multilingual Natural Voice) */}
              <button
                type="button"
                onClick={toggleSpeakNote}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSpeaking
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
                    : 'bg-white/5 border-[var(--nb-border)] text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] hover:border-[var(--nb-border-gold)]'
                }`}
                title={isSpeaking ? "Stop Voice Narration" : "Listen Aloud (Microsoft Emma Multilingual Natural Voice)"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[var(--nb-gold)]" />
                    <span>Listen Aloud</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reader Content Body */}
          <div 
            className="flex-1 overflow-y-auto p-6 md:p-8 w-full min-h-0" 
            id="read-workspace"
            onClick={handleWorkspaceClick}
          >
            {/* Render Markdown Content */}
            <div className="max-w-3xl mx-auto mb-12">
              {renderReadMode()}
            </div>

            {/* Scripture Tags Footer */}
            {note?.scriptureTags && note.scriptureTags.length > 0 && (
              <div className="max-w-3xl mx-auto pt-6 border-t border-[var(--nb-border)]" id="read-scriptures-footer">
                <span className="text-xs font-mono text-[var(--nb-text-dim)] block mb-2">
                  INDEXED SCRIPTURE REFERENCES:
                </span>
                <div className="flex flex-wrap gap-2">
                  {note.scriptureTags.map((tag, tIdx) => {
                    const tagLabel = typeof tag === 'string' ? tag : (tag as any)?.reference || String(tag || '');
                    if (!tagLabel) return null;
                    return (
                      <button
                        key={`${tagLabel}-${tIdx}`} 
                        type="button"
                        onClick={() => onScriptureClick?.(tagLabel)}
                        className="px-2 py-1 rounded bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] border border-[var(--nb-border-gold)] font-mono text-xs hover:bg-[var(--nb-gold)] hover:text-stone-950 transition-colors cursor-pointer"
                        title={`Study ${tagLabel} with Elder Stephen`}
                      >
                        {tagLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Note Metadata Footer */}
            <div className="max-w-3xl mx-auto mt-4 text-[10px] font-mono text-[var(--nb-text-dim)] flex items-center gap-4">
              <span>CREATED: {formatDateSafe(note?.createdAt)}</span>
              <span>LAST MODIFIED: {formatDateSafe(note?.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

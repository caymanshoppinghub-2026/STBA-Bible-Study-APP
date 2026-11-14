/**
 * Voice Dictation Pause Buffer & Context-Aware Sentence Recombination Engine
 *
 * Buffers fragmented speech-to-text input caused by sudden mid-thought pauses,
 * analyzes preceding context, and combines broken thoughts back into coherent,
 * continuous sentences before generating an AI response.
 */

export const DICTATION_COHERENCE_DIRECTIVE = `VOICE DICTATION & FRAGMENTED INPUT RECOMBINATION DIRECTIVE (MANDATORY):
- User inputs and spoken transcripts may contain fragmented clauses, mid-sentence breaks, or abrupt pauses caused by real-time voice dictation.
- Before generating a response or evaluation, you MUST analyze the preceding conversational context and combine broken or fragmented thoughts back into coherent, continuous sentences.
- Respond to the user's complete, unified thought in context rather than treating a mid-sentence pause or speech fragment as an isolated or incomplete statement.`;

const CONTINUATION_TRAILING_WORDS = new Set([
  "and", "but", "or", "nor", "so", "yet", "for",
  "because", "since", "although", "though", "while", "whereas", "unless", "until", "whether",
  "that", "which", "who", "whom", "whose", "where", "when", "why", "how",
  "if", "as", "than",
  "to", "in", "on", "at", "by", "with", "from", "into", "onto", "upon", "of", "about", "through", "between", "under", "over", "after", "before", "during", "without", "within",
  "the", "a", "an", "this", "these", "those", "my", "your", "his", "her", "our", "their", "its",
  "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must"
]);

const CONTINUATION_LEADING_WORDS = new Set([
  "and", "but", "or", "nor", "so", "yet",
  "because", "since", "although", "though", "while", "whereas", "unless", "until",
  "that", "which", "who", "whom", "whose", "where", "when",
  "to", "in", "on", "at", "by", "with", "from", "into", "of", "about", "through", "for", "as"
]);

const PROPER_CAPITALIZED_WORDS = new Set([
  "i", "i'm", "i've", "i'll", "i'd",
  "god", "lord", "jesus", "christ", "messiah", "savior", "saviour", "spirit", "father", "creator",
  "bible", "scripture", "scriptures", "sabbath", "christian", "christians", "adventist", "adventists",
  "ellen", "white", "paul", "john", "peter", "moses", "abraham", "david", "daniel", "isaiah", "jeremiah", "ezekiel",
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges", "ruth",
  "samuel", "kings", "chronicles", "ezra", "nehemiah", "esther", "job", "psalm", "psalms",
  "proverbs", "ecclesiastes", "isaiah", "daniel", "hosea", "joel", "amos", "obadiah", "jonah",
  "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi",
  "matthew", "mark", "luke", "acts", "romans", "corinthians", "galatians", "ephesians",
  "philippians", "colossians", "thessalonians", "timothy", "titus", "philemon", "hebrews",
  "james", "jude", "revelation", "babylon", "israel", "jerusalem", "calvary", "eden", "stephen", "steven"
]);

function shouldKeepCapitalized(word: string): boolean {
  const clean = word.replace(/[^a-zA-Z']/g, "").toLowerCase();
  if (!clean) return false;
  return PROPER_CAPITALIZED_WORDS.has(clean);
}

/**
 * Determines whether a dictated segment appears to have been cut off mid-thought
 * by a sudden pause (e.g. ending on a conjunction, preposition, article, or auxiliary verb,
 * or lacking terminal punctuation on a short clause).
 */
export function isIncompleteSpokenThought(text: string): boolean {
  const trimmed = (text || "").trim();
  if (!trimmed) return false;

  // Ends with ellipsis, dash, or comma -> clearly mid-thought
  if (/[,;:\-—…]$/.test(trimmed)) return true;

  const words = trimmed.split(/\s+/).map(w => w.replace(/[^a-zA-Z']/g, "").toLowerCase()).filter(Boolean);
  if (words.length === 0) return false;

  const lastWord = words[words.length - 1];
  if (CONTINUATION_TRAILING_WORDS.has(lastWord)) {
    return true;
  }

  // Short phrase without terminal punctuation is very often a mid-thought pause
  const hasTerminalPunctuation = /[.!?]$/.test(trimmed);
  if (!hasTerminalPunctuation && words.length < 6) {
    return true;
  }

  return false;
}

/**
 * Returns an adaptive silence buffer duration (in ms) so sudden mid-sentence pauses
 * allow the speaker time to continue their thought before finalizing.
 */
export function getAdaptivePauseBufferMs(text: string): number {
  if (isIncompleteSpokenThought(text)) {
    return 2600; // Extended 2.6s buffer when user pauses mid-thought
  }
  return 1500; // 1.5s buffer for complete-looking clauses in case user adds a follow-up clause
}

/**
 * Stitches a newly dictated fragment onto preceding text/context, removing
 * pause-induced boundary stutters and joining broken mid-sentence clauses into
 * a coherent, continuous sentence.
 */
export function stitchDictatedFragments(precedingText: string, newFragment: string): string {
  const prev = (precedingText || "").trim();
  const next = (newFragment || "").trim();

  if (!prev) return normalizeSingleFragment(next);
  if (!next) return prev;

  // Avoid exact duplicate append
  if (prev.toLowerCase() === next.toLowerCase()) return prev;
  if (prev.toLowerCase().endsWith(next.toLowerCase())) return prev;
  if (next.toLowerCase().startsWith(prev.toLowerCase())) return normalizeSingleFragment(next);

  const prevWords = prev.split(/\s+/);
  let nextWords = next.split(/\s+/);

  // 1. Remove 1-word or 2-word boundary stutters caused by pausing and repeating the last word(s)
  const cleanWord = (w: string) => w.replace(/[^a-zA-Z0-9']/g, "").toLowerCase();
  if (prevWords.length >= 1 && nextWords.length >= 1) {
    const lastPrev = cleanWord(prevWords[prevWords.length - 1]);
    const firstNext = cleanWord(nextWords[0]);
    if (lastPrev && lastPrev === firstNext) {
      nextWords = nextWords.slice(1);
    } else if (prevWords.length >= 2 && nextWords.length >= 2) {
      const lastTwoPrev = `${cleanWord(prevWords[prevWords.length - 2])} ${cleanWord(prevWords[prevWords.length - 1])}`;
      const firstTwoNext = `${cleanWord(nextWords[0])} ${cleanWord(nextWords[1])}`;
      if (lastTwoPrev.trim() && lastTwoPrev === firstTwoNext) {
        nextWords = nextWords.slice(2);
      }
    }
  }

  if (nextWords.length === 0) return prev;

  const firstNextWordRaw = nextWords[0];
  const firstNextWordClean = cleanWord(firstNextWordRaw);
  const prevEndedIncomplete = isIncompleteSpokenThought(prev);
  const nextStartsContinuation = CONTINUATION_LEADING_WORDS.has(firstNextWordClean);

  let adjustedPrev = prev;
  // If previous text had a false period inserted by speech-to-text before a continuation clause, strip the period
  if ((prevEndedIncomplete || nextStartsContinuation) && /\.$/.test(adjustedPrev)) {
    adjustedPrev = adjustedPrev.replace(/\.+$/, "");
  }

  // If joining mid-sentence, lowercase an artificially capitalized first word of the new fragment
  if (
    (prevEndedIncomplete || nextStartsContinuation || !/[.!?]$/.test(adjustedPrev)) &&
    /^[A-Z][a-z]+$/.test(firstNextWordRaw) &&
    !shouldKeepCapitalized(firstNextWordRaw)
  ) {
    nextWords[0] = firstNextWordRaw.charAt(0).toLowerCase() + firstNextWordRaw.slice(1);
  }

  const combined = `${adjustedPrev} ${nextWords.join(" ")}`.replace(/\s+/g, " ").trim();
  return recombineFragmentedTranscript(combined);
}

function normalizeSingleFragment(text: string): string {
  const trimmed = (text || "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Analyzes a full transcript (and optional preceding context) to repair broken
 * sentence splits caused by sudden dictation pauses (e.g. ". And ", ". Because ",
 * ". Which ", repeated words across pauses) into coherent, continuous sentences.
 */
export function recombineFragmentedTranscript(rawTranscript: string, precedingContext?: string): string {
  let text = (rawTranscript || "").trim().replace(/\s+/g, " ");
  if (!text) return "";

  // 1. Merge false sentence breaks before continuation conjunctions/prepositions/relatives
  // e.g., "In Revelation 14. And the angel..." -> "In Revelation 14, and the angel..."
  // or "He is our High Priest. Who ministers in heaven" -> "He is our High Priest who ministers in heaven"
  text = text.replace(
    /\b([a-zA-Z0-9]+)\.\s+(And|But|Or|So|Because|Since|Although|Though|While|Whereas|Unless|Until|That|Which|Who|Whom|Whose|Where|When|To|In|On|At|By|With|From|Into|Of|About|Through|For|As)\b/g,
    (match, prevWord, conj) => {
      const prevClean = prevWord.toLowerCase();
      const conjLower = conj.toLowerCase();
      // If previous word was already a continuation word (e.g. "in. The"), remove the period completely
      if (CONTINUATION_TRAILING_WORDS.has(prevClean)) {
        return `${prevWord} ${conjLower}`;
      }
      // For relative pronouns or prepositions, join directly without punctuation
      if (["that", "which", "who", "whom", "whose", "where", "when", "to", "in", "on", "at", "by", "with", "from", "into", "of", "about", "through"].includes(conjLower)) {
        return `${prevWord} ${conjLower}`;
      }
      // For coordinating/subordinating conjunctions, join smoothly with a comma
      return `${prevWord}, ${conjLower}`;
    }
  );

  // 2. Merge false periods right after a trailing preposition/article/auxiliary verb
  // e.g. "We are saved by. Grace through faith" -> "We are saved by grace through faith"
  text = text.replace(
    /\b(and|but|or|because|that|which|who|to|in|on|at|by|with|from|into|of|for|the|a|an|is|are|was|were|has|have|had|will|would|can|could|should)\.\s+([A-Z][a-z]+)/gi,
    (match, trailingWord, nextWord) => {
      const replacementNext = shouldKeepCapitalized(nextWord)
        ? nextWord
        : nextWord.charAt(0).toLowerCase() + nextWord.slice(1);
      return `${trailingWord} ${replacementNext}`;
    }
  );

  // 3. Deduplicate immediate repeated words from pause restarts ("the the", "in in")
  text = text.replace(/\b([a-zA-Z]{2,})\s+\1\b/gi, "$1");

  // 4. If precedingContext is provided and ends with an incomplete thought, contextualize
  if (precedingContext && precedingContext.trim()) {
    const cleanPrev = precedingContext.trim();
    if (isIncompleteSpokenThought(cleanPrev) && !text.toLowerCase().startsWith(cleanPrev.toLowerCase())) {
      return stitchDictatedFragments(cleanPrev, text);
    }
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Coalesces consecutive user messages in a conversation history that were split
 * by sudden dictation pauses into coherent, continuous sentences before sending
 * to the AI model.
 */
export function coalesceFragmentedChatHistory<T extends { role?: string; sender?: string; text: string }>(
  messages: T[]
): T[] {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const result: T[] = [];

  for (const msg of messages) {
    if (!msg || typeof msg.text !== "string") continue;
    const isUser = msg.role === "user" || msg.sender === "user";
    const cleanedText = isUser ? recombineFragmentedTranscript(msg.text) : msg.text;

    if (result.length > 0) {
      const prev = result[result.length - 1];
      const prevIsUser = prev.role === "user" || prev.sender === "user";

      if (isUser && prevIsUser) {
        // Combine consecutive user fragments into a single coherent thought
        prev.text = stitchDictatedFragments(prev.text, cleanedText);
        continue;
      }
    }

    result.push({
      ...msg,
      text: cleanedText
    });
  }

  return result;
}

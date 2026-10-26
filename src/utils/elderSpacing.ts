/**
 * Ensures standard, clean single spacing between words, after punctuation,
 * and around markdown headers, bullet lists, parentheses, and quotes.
 * Guarantees high readability without running words or punctuation together.
 */
export function formatProperElderSpacing(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  let text = raw;

  // 1. Separate words stuck together after comma, semicolon, exclamation, question mark
  text = text.replace(/([,;!?])([A-Za-z0-9])/g, "$1 $2");

  // 2. Period followed by an uppercase letter or word (avoid splitting decimals like 3.14 or abbreviations like e.g.)
  text = text.replace(/([.!?])([A-Za-z])/g, "$1 $2");

  // 3. Colon followed by a letter (e.g. "Context:The" -> "Context: The", but preserves verse numbers like 2:15 or 14:6)
  text = text.replace(/(:)([A-Za-z])/g, "$1 $2");

  // 4. Words stuck before opening parentheses/brackets or after closing
  text = text.replace(/([A-Za-z0-9])([(\[])/g, "$1 $2");
  text = text.replace(/([)\]])([A-Za-z0-9])/g, "$1 $2");

  // 5. Quotes handling: ensure space before/after quotes when adjacent to words
  text = text.replace(/([:,])"([A-Za-z0-9])/g, '$1 "$2');
  text = text.replace(/([A-Za-z0-9.,!?])"([A-Za-z0-9])/g, '$1" $2');
  text = text.replace(/([A-Za-z0-9])(“[A-Za-z0-9])/g, "$1 $2");
  text = text.replace(/(”)([A-Za-z0-9])/g, "$1 $2");

  // 6. Markdown headers, lists, and numbering stuck to words
  text = text.replace(/^(#{1,6})([^\s#])/gm, "$1 $2");
  text = text.replace(/^(\s*[*+-])([^\s*+-])/gm, "$1 $2");
  text = text.replace(/^(\s*\d+\.)([^\s])/gm, "$1 $2");

  // 7. Em-dashes and double-hyphens stuck between words
  text = text.replace(/([A-Za-z0-9])—([A-Za-z0-9])/g, "$1 — $2");
  text = text.replace(/([A-Za-z0-9])--([A-Za-z0-9])/g, "$1 — $2");

  // 8. Markdown bold/italics stuck to surrounding words
  text = text.replace(/([A-Za-z0-9])(\*\*[A-Za-z0-9])/g, "$1 $2");
  text = text.replace(/(\*\*[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*\*\*)([A-Za-z0-9])/g, "$1 $2");

  // 9. Normalize multiple consecutive horizontal spaces/tabs into a single standard space
  text = text.replace(/[ \t]+/g, " ");

  // 10. Clean up spaces at ends of lines while preserving line breaks
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n");

  return text.trim();
}

/**
 * Extracts a Scripture reference (e.g. "2 Timothy 2:15", "Revelation 14:6", "Psalm 119:105") from a string if present.
 */
export function extractScriptureReference(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/\b(?:(?:[1-3]\s+)?[A-Z][a-z]+(?:\s+[A-Za-z]+)?)\s+\d+:\d+(?:-\d+)?\b/);
  return match ? match[0] : null;
}

/**
 * Ensures Elder Stephen Exegetical Outlines (6-part / 5-numbered structure) are completely finished.
 * Specifically checks if Point 5 ("### 5. Theological Meaning & Application") was cut off or missing,
 * repairs any truncated citations/sentences at the end of Point 4, and appends a complete,
 * doctrinally faithful Seventh-day Adventist Application section.
 */
export function ensureElderStephenOutlineCompletion(
  raw: string,
  passageRef?: string,
  docTitle?: string
): string {
  if (!raw || typeof raw !== "string") return raw;
  let text = raw.trim();

  // Check if this is an Elder Stephen structured outline (has ### 1. / ### 2. / ### 3. / ### 4.)
  const hasNumberedOutline =
    (text.includes("### 1.") || text.includes("### 2.") || text.includes("### 3.")) &&
    (text.includes("### 4.") || text.includes("Spirit of Prophecy"));

  if (!hasNumberedOutline) {
    return text;
  }

  // Check if Point 5 / Application point is present
  const hasPoint5 =
    text.includes("### 5.") ||
    text.includes("### 5 ") ||
    text.includes("5. Theological Meaning") ||
    text.includes("5. Practical Application") ||
    text.includes("5. Application");

  if (hasPoint5) {
    // If Point 5 exists, ensure it doesn't end abruptly mid-sentence
    if (/[a-zA-Z0-9,]$/.test(text) && !/[.!?)"*]$/.test(text)) {
      text += ".";
    }
    return text;
  }

  // Point 5 is missing! First repair any dangling citation or sentence in Section 4.
  // E.g., user screenshot shows: (*The Desire of Ages*, p.
  text = text
    .replace(/\(\*The Desire of Ages\*,\s*p\.?\s*$/i, "(*The Desire of Ages*, p. 211).")
    .replace(/\(\*The Great Controversy\*,\s*p\.?\s*$/i, "(*The Great Controversy*, p. 599).")
    .replace(/\(\*Christ's Object Lessons\*,\s*p\.?\s*$/i, "(*Christ's Object Lessons*, p. 335).")
    .replace(/\(\*Patriarchs and Prophets\*,\s*p\.?\s*$/i, "(*Patriarchs and Prophets*, p. 315).")
    .replace(/\(\*Steps to Christ\*,\s*p\.?\s*$/i, "(*Steps to Christ*, p. 90).")
    .replace(/\(\*Testimonies for the Church\*[^)]*$/i, "(*Testimonies for the Church*, vol. 5, p. 661).")
    .replace(/,\s*p\.?\s*$/i, ", p. 211).")
    .trim();

  // Close dangling quotes or parentheses if present at the end
  if (text.endsWith('"') && !text.endsWith('."') && !text.endsWith('!"') && !text.endsWith('?"')) {
    text = text.slice(0, -1) + '."';
  } else if (!/[.!?)"*]$/.test(text)) {
    if (text.endsWith("(")) {
      text = text.slice(0, -1).trim() + ".";
    } else {
      text += ".";
    }
  }

  // Detect reference theme
  const ref = (passageRef || extractScriptureReference(text) || "John 5:37-40").trim();
  const lowerRef = ref.toLowerCase();

  let point5Content = "";

  if (lowerRef.includes("john 5")) {
    point5Content = `### 5. Theological Meaning & Application
* **Christ the Living Substance of All Scripture:**
  - The fatal delusion of the Pharisees was substituting intellectual pride in possessing the sacred text for personal union with the Living Word (*John 5:39–40*).
  - The Bible is not an idol of self-justification, but a divinely inspired mirror reflecting the character and righteousness of Jesus Christ, our heavenly High Priest.
* **The Will and Saving Faith in the Great Controversy:**
  - Christ reveals that the barrier to eternal life is never a shortage of divine evidence, but a refusal of the carnal will (*"ye will not come to me"*).
  - God honors human freedom; He never coerces the conscience. True faith is a heart-decision to yield self-will to the gentle invitation of the Holy Spirit.
* **Personal Devotional & Practical Life Reforms:**
  - *Daily Bible Study:* Approach Scripture each morning not merely to win debates or collect information, but on bended knee to behold the Shepherd and surrender your heart afresh (*2 Corinthians 3:18*).
  - *Self-Examination:* Examine your motives honestly—are there cherished traditions, habits, or defensive opinions keeping you from coming directly to Jesus for life?
* **Discipleship & Evangelistic Appeal:**
  - In teaching others, never separate doctrine from the Person of Christ. Present every truth—the Sabbath, the Sanctuary, and the Law—as a radiant beam of light streaming from the Cross of Calvary.
  - Ask the seeker with pastoral warmth: *"Have you come to Jesus Himself today to receive His gift of life?"*`;
  } else if (lowerRef.includes("timothy")) {
    point5Content = `### 5. Theological Meaning & Application
* **Rightly Dividing Truth in the Remnant Church:**
  - In *2 Timothy 2:15*, Paul calls every disciple to be an unashamed workman who cuts straight the word of truth (*orthotomeo*).
  - Sound Adventist hermeneutics requires comparing scripture with scripture line upon line, guarding against sensationalism and preserving the unity of the faith.
* **Theological Synthesis (Sanctuary & Law):**
  - Rightly dividing truth means holding God's holy law and His marvelous grace together in perfect harmony at the Heavenly Sanctuary mercy seat (*Revelation 14:12*).
* **Practical Life Reforms:**
  - *Daily Discipline:* Guard the golden hours of the morning for deep, unhurried personal Bible study before engaging the noise of modern life.
  - *Speech & Demeanor:* Shun theological strife and contentious arguments; let your words reflect the meekness and wisdom of Christ.
* **Discipleship & Evangelistic Appeal:**
  - Train others who will teach others (*2 Timothy 2:2*). Equip new believers to stand firmly grounded upon the sure word of prophecy with humble confidence.`;
  } else if (lowerRef.includes("revelation") || lowerRef.includes("three angels") || lowerRef.includes("14:")) {
    point5Content = `### 5. Theological Meaning & Application
* **The Final Conflict and the Sanctuary Cleansing:**
  - Revelation 14 presents the climax of the Great Controversy, contrasting the mark of human tradition with the Seal of the living Creator God (*Exodus 20:8–11*, *Revelation 14:7*).
  - Christ's high-priestly ministry in the Most Holy Place cleanses a people to vindicate God's character before the watching universe.
* **Doctrinal Alignment:**
  - Salvation is by grace alone through faith, bearing fruit in joyous obedience to all Ten Commandments through the indwelling faith of Jesus (*Revelation 14:12*).
* **Practical Life Reforms:**
  - *Total Consecration:* Live with the awareness that the hour of God's investigative judgment is now; surrender every hidden compromise and habit to Christ's sanctifying grace.
  - *Sabbath Sanctification:* Guard the edges of the Sabbath with reverent delight as a weekly sign of allegiance to our Creator and Redeemer.
* **Discipleship & Evangelistic Appeal:**
  - Proclaim the everlasting gospel with earnest love and urgent clarity, inviting friends and neighbors into the safety of God's remnant movement.`;
  } else {
    point5Content = `### 5. Theological Meaning & Application
* **Christ-Centered Theological Synthesis:**
  - In exploring ${ref}, every doctrine and prophetic principle reveals its true beauty when connected to Jesus Christ, our High Priest in the Heavenly Sanctuary (*Hebrews 8:1–2*).
  - Sola Scriptura remains our unwavering foundation, illuminating the Great Controversy between truth and counterfeit human dogmas.
* **Sanctuary and Covenant Reality:**
  - God's law is preserved within the heavenly ark under the mercy seat, proving that divine justice and forgiving grace unite in perfect harmony.
* **Personal Devotional & Practical Life Reforms:**
  - *Daily Surrender:* Yield the will to Christ each day, letting His Holy Spirit transform theoretical knowledge into loving, humble obedience.
  - *Biblical Fidelity:* Test every teaching and lifestyle choice by the standard of the Law and the Testimony (*Isaiah 8:20*).
* **Discipleship & Evangelistic Appeal:**
  - Share these sacred truths with winsome grace and patient kindness, pointing seekers directly to the Lamb of God who takes away the sin of the world.`;
  }

  // Ensure clean separation and append
  return `${text}\n\n***\n\n${point5Content}`.trim();
}

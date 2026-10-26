import { isSpecificScopedRequest } from "../utils/elderSpacing";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ElderStephenMessage {
  role: "user" | "elder" | "model";
  text: string;
  commentaryMode?: "prestige" | "velocity";
}

export interface ElderStephenParams {
  userId?: string;
  userName?: string;
  userMessage?: string;
  currentMode?: string;
  contextSummary?: string;
  noteTitle?: string;
  noteContent?: string;
  masteryState?: {
    completedVersesCount: number;
    completionRate: number;
  };
  historyLog?: ElderStephenMessage[];
  userAction?: string;
  sessionMemory?: any;
  commentaryMode?: "prestige" | "velocity" | "auto";
}

export interface ElderStephenResponse {
  text: string;
  commentaryMode?: "prestige" | "velocity";
  modeUsed?: "prestige" | "velocity";
  latencyMs?: number;
}

/**
 * Sends a message and context to the Elder Stephen pastoral agent backend.
 * Calls `/api/elder-stephen` endpoint.
 */
export async function askElderStephen(params: ElderStephenParams): Promise<ElderStephenResponse> {
  try {
    const response = await fetch("/api/elder-stephen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("[Elder Stephen API] Network or server communication fallback active:", err);
  }

  const name = params.userName || "Berean";
  const title = params.noteTitle || "the sacred scripture";
  const userText = params.userMessage || params.userAction || "";
  const isSpecific = isSpecificScopedRequest(userText);

  if (isSpecific) {
    const lower = userText.toLowerCase();
    let answer = "";
    if (lower.includes("first line") || lower.includes("first sentence")) {
      answer = `* **First Line Analysis (${title})**: The opening statement anchors our faith directly in divine revelation. God communicates His eternal truth so that we may know His loving purpose without human conjecture.`;
    } else if (lower.includes("single concept") || lower.includes("concept")) {
      answer = `* **Concept Analysis (${title})**: In Seventh-day Adventist theology, this truth reveals Christ's love and righteousness in the Great Controversy, pointing to the sanctuary truth and the harmony of law and grace.`;
    } else {
      answer = `* **Pastoral Insight (${title})**: Comparing Scripture with Scripture (*Isaiah 28:10*), this truth points us directly to Christ our High Priest, providing practical encouragement for your spiritual walk.`;
    }
    return {
      text: answer,
      commentaryMode: "velocity",
      modeUsed: "velocity"
    };
  }

  if (params.currentMode === "Sabbath School Studies" || params.currentMode === "Syllabus") {
    return {
      text: `Greetings, ${name}. I am Elder Stephen, here to help answer your questions about today's study on ${title}.`
    };
  }

  return {
    text: `Greetings, Brother ${name}. Let us reflect on ${title} together with prayerful minds.

### 1. Context
We align our study with the truth, anchoring our faith directly on Scripture.

### 2. Key Terms
- **Sola Scriptura** — Scripture alone as our authority.
- **Berean Duty** — searching the scriptures daily.

### 3. Exegetical Insight
Rightly dividing the word of truth requires diligent study and comparison of Scripture with Scripture.

### 4. Theological Meaning
God's Word guards us against worldly deception, keeping our hearts fixed on Christ in the Heavenly Sanctuary.

### 5. Cross-References
- *Psalm 119:105*
- *2 Timothy 2:15*

### 6. Application
How can you apply this passage to your daily walk today?`
  };
}

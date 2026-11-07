# STBA Launch Polish: Strict Tier Paywall & Pricing Modal, Sub-800ms AI Latency, 3-Font 16px Hierarchy & Mobile Touch Ergonomics

This plan delivers the final production polish for the **Study To Be Approved (STBA)** platform: enforcing strict paywall gating across all modules with deterministic offline entitlement behavior and an interactive **Scholar & Leader Upgrade Pricing Modal**, achieving sub-800ms Time to First Token (TTFT) across Elder Stephen AI triggers, standardizing typography to three fonts (`Plus Jakarta Sans`, `Playfair Display`, `Noto Serif`) with a `16px` base size, enforcing `44px × 44px` minimum mobile touch targets, locking background scroll on study modals, consolidating download dropdowns, and preserving the existing Note Studio interface.

## User Review & Critical Decisions

> [!IMPORTANT]
> All core architectural, performance, paywall, and usability specifications are defined below:

- **Confirmed Decision 1 — Strict Paywall Gating, Pricing Modal & Offline Fallback**:
  - Users on the **Beginner (`$0/mo`)** tier are strictly gated from accessing **Scholar** (`$7.99/mo` or `$6.58/mo` billed annually at `$79/yr`) or **Leader** (`$14.99/mo` or `$11.58/mo` billed annually at `$139/yr`) features across all modules without an active subscription.
  - All `"Upgrade to Scholar (Free)"` messaging is replaced with an interactive **Upgrade Pricing Modal** displaying clear Scholar and Leader pricing tiers before prompting payment.
  - **Offline Paywall & Entitlement Fallback**: Subscription tier entitlements are cached deterministically in local storage (`stba_user_tier` + `stba_tier_entitlement_v1`) so existing **Scholar** and **Leader** subscribers retain uninterrupted offline access to their unlocked tools, while **Beginner** users remain strictly gated offline (zero offline paywall bypass). If a Beginner user initiates payment while `navigator.onLine === false`, the modal displays a clear offline notice and queues remote Supabase profile synchronization (`saveProfileToSupabase`) until connectivity resumes.
- **Confirmed Decision 2 — Numerical AI Latency Budgets (`TTFT < 800ms`)**:
  - **Pre-Flight Client Overhead**: `< 10ms` (eliminate blocking Supabase auth/database reads before dispatching `/api/elder-stephen` or `/api/teach/chat`).
  - **Optimistic UI Feedback**: `< 50ms` (immediate transition to active thinking indicator and disabled duplicate trigger state).
  - **Time to First Token (TTFT)**: `< 800ms` target via `ThinkingLevel.LOW` on interactive Gemini 3.8 Flash / Gemini 4 endpoints, backed by a deterministic `6500ms` `AbortController` timeout that seamlessly engages Elder Stephen's doctrinally aligned local fallback if the network degrades.
- **Confirmed Decision 3 — Standardized 3-Font Hierarchy (`≥16px` Base) & Mobile Touch Targets (`≥44px × 44px`)**:
  - Enforce **Plus Jakarta Sans** for headings, **Playfair Display** for accents, and **Noto Serif** for body text at a minimum `16px` (`1rem`) base size.
  - Enforce a minimum interactive touch target size of **`44px × 44px`** (`min-h-[44px] min-w-[44px]`) on mobile viewports (`40px × 40px` on desktop) across all buttons, tabs, dropdown triggers, tier selectors, and modal controls.
- **Confirmed Decision 4 — Preserve Existing Note Studio Interface**:
  - Maintain the current Note Studio layout where drafting, reading, and Elder Stephen AI interactions function seamlessly without structural UI changes, while enforcing strict tier gating on its Scholar (Cornell Outline) and Leader (Homiletics Prompter) tabs and providing a consolidated Download dropdown.

---

## 1. Overview & Core Concept

- **What It Does**: Finalizes STBA for public launch by enforcing subscription boundaries between **Beginner**, **Scholar**, and **Leader** tiers (both online and offline) with a conversion-ready pricing and checkout modal, optimizing Elder Stephen's AI pipeline to sub-800ms TTFT, unifying the 3-font `16px` typography system, enforcing `44px × 44px` mobile touch ergonomics, and locking background scroll on study modals.
- **Target Audience / Persona**: Seventh-day Adventist students, Sabbath School teachers, Berean scholars, and lay evangelists studying across mobile and desktop devices.
- **Key Value**:
  - **Sub-800ms AI Responsiveness**: Eliminates pre-request blocking database queries so Elder Stephen responds almost instantaneously across all study tracks.
  - **Bulletproof Online & Offline Paywall**: Prevents unauthorized tier switching on the Beginner tier under all network conditions while protecting paid subscribers' access during offline study.
  - **Mobile-First Ergonomics & Readability**: Standardized 3-font hierarchy at `16px+` base text size, `44px × 44px` touch targets, and scroll-isolated modals guarantee effortless mobile usability.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Strict Paywall Enforcement, Interactive Upgrade Modal & Offline Behavior**:
     - Default unsubscribed users start on the **Beginner** tier (`stba_user_tier = "Beginner"`).
     - Clicking any locked Scholar/Leader control (*Cornell Synthesis*, *Leader Tools*, *Scholar Verbatim Recall*, *Unlock Scholar Tier*, *Teach It Studio Leader Homiletics*, or any *Upgrade* CTA) opens the global **STBA Upgrade & Pricing Modal** (and handles the global `open-stba-upgrade-modal` event).
     - **Step 1 (Plan Comparison)**: Displays a Monthly / Annual billing toggle (`Save 17%`, `min-h-[44px]` touch target) and side-by-side cards for:
       - **Scholar Plan (Most Popular)**: `$7.99 / month` (or `$6.58 / month` billed annually at `$79 / year`) — Full active recall mastery mechanics, Cornell Synthesis outlines, deep Elder Stephen exegesis, weekly analytics, and cloud synchronization.
       - **Leader Plan (Premium Access)**: `$14.99 / month` (or `$11.58 / month` billed annually at `$139 / year`) — Everything in Scholar plus Teach It Interactive Studio 5-stage live coaching, Leader Homiletics Prompter, Sabbath School group curriculum tools, and full PDF/DOCS export suite.
     - **Step 2 (Payment Prompt & Offline-Safe Activation)**: Selecting **Continue to Payment** opens the interactive payment checkout step inside the modal. If the device is offline (`!navigator.onLine`), the checkout form displays an explicit offline banner preventing failed network charges until connection is restored, or upon confirmed payment persists the signed entitlement locally (`stba_tier_entitlement_v1`) and queues background cloud sync (`stba_pending_tier_sync`) so the upgrade is resilient across reloads.
  2. **Sub-800ms Elder Stephen AI Triggers**:
     - Clicking any Elder Stephen prompt button transitions the UI in `< 50ms`, bypasses synchronous Supabase pre-fetches (`< 10ms` client overhead), and streams/returns the model response with a `< 800ms` TTFT target.
  3. **Scroll-Isolated Modals & `44px × 44px` Mobile Touch Targets**:
     - Opening *Active Recall*, *Weekly Scripture Mastery & Doctrinal Recap*, or the *Upgrade Pricing Modal* locks `document.body.style.overflow = "hidden"` while keeping the modal interior smoothly scrollable (`overscroll-contain overflow-y-auto`).
     - All interactive modal buttons, close icons, tab switches, and download dropdown items enforce `min-h-[44px] min-w-[44px]` on mobile screens for thumb-friendly precision.
  4. **Consolidated Download Dropdowns**:
     - Export actions in study views are unified into a **Download** dropdown menu (`min-h-[44px]` trigger and option rows) offering **PDF (`.pdf`)** and **DOCS (`.doc`) / Text** options.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Reverent Berean sanctuary aesthetic with deep midnight navy (`#06162c`), elevated obsidian cards (`#11141C`), and brushed gold (`#C9973A` / `#DFC57B`) highlights.
  - *Typography & Hierarchy*:
    - **Headings**: `Plus Jakarta Sans` (600–700 weight).
    - **Accents**: `Playfair Display` (500–700 weight).
    - **Body & Scripture Text**: `Noto Serif` (`16px` minimum base font size, `1.7` line-height).
- **Interactive Feedback & Motion Budgets**:
  - Optimistic UI state transition: `< 50ms`.
  - Micro-interaction & hover settling: `≤ 200ms` (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - AI Time to First Token (TTFT): `< 800ms` target (`ThinkingLevel.LOW` on fast interactive endpoints).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Deterministic Local-First Paywall & Offline Entitlement Guard**
  - *Chosen Approach*: Store `userTier: "Beginner" | "Scholar" | "Leader"` and a structured entitlement record (`stba_tier_entitlement_v1`) in `AppContext` + `localStorage` (defaulting strictly to `"Beginner"`). When offline, `hasTierAccess` reads the verified local entitlement so paid **Scholar** and **Leader** users never get locked out during offline study, while **Beginner** users remain strictly blocked from accessing paid features offline. Any tier upgrade completed or queued syncs to Supabase (`saveProfileToSupabase`) automatically when online.
  - *Why*: Guarantees zero false lockouts for paying subscribers in low-connectivity church/Sabbath settings while preventing any offline bypass by free-tier users.
- **Decision 2: Sub-800ms Non-Blocking AI Trigger Pipeline**
  - *Chosen Approach*: Read cached track progress synchronously (`< 10ms`) from local state (`stba_cached_track_progress`), refresh Supabase progress asynchronously in a non-blocking background promise, configure interactive server endpoints (`/api/elder-stephen` and `/api/teach/chat`) with `ThinkingLevel.LOW` for `< 800ms` TTFT, and wrap client fetches in a `6500ms` `AbortController` with automatic doctrinal fallback.
  - *Why*: Eliminates the 400ms–1500ms pre-request database bottleneck that previously delayed every Elder Stephen interaction.
- **Decision 3: Mobile Touch Target Floor (`44px × 44px`) & Preserve Note Studio Layout**
  - *Chosen Approach*: Apply `min-h-[44px]` touch target sizing to interactive buttons, tabs, and dropdown items on mobile viewports while keeping Note Studio's existing drafting, reading, and AI review panel structure intact.
  - *Why*: Satisfies WCAG AAA / Apple HIG mobile touch target ergonomics (`44px × 44px`) without disrupting the established Note Studio workflow.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│            GLOBAL TYPOGRAPHY, TOUCH ERGONOMICS & MODAL LAYER               │
│  • 3 Fonts: Plus Jakarta Sans (Headings), Playfair Display (Accents),      │
│             Noto Serif (Body & Scripture, ≥16px Base Size)                 │
│  • Mobile Touch Targets: ≥44px × 44px (Desktop ≥40px × 40px)               │
│  • Scroll-Locked Modals: Active Recall, Weekly Recap, Upgrade Pricing      │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│         STRICT SUBSCRIPTION PAYWALL, PRICING & OFFLINE GUARD               │
│  • Default Tier: 'Beginner' ($0/mo) — Zero free-bypass buttons             │
│  • Scholar Plan: $7.99/mo or $6.58/mo ($79/yr billed annually)             │
│  • Leader Plan:  $14.99/mo or $11.58/mo ($139/yr billed annually)          │
│  • Offline Guard: Cached Entitlement Verification + Queued Cloud Sync      │
└───────┬─────────────────────────────┬──────────────────────────────┬───────┘
        │                             │                              │
┌───────▼───────────┐       ┌─────────▼──────────┐       ┌───────────▼───────┐
│   STUDY MODULES   │       │  TEACH IT STUDIO   │       │    NOTE STUDIO    │
│ • Ask The Scholar │       │ • Left: Dialogue   │       │ • Preserved UI    │
│ • Active Recall   │       │ • Right: Slate     │       │ • Gated Cornell & │
│ • Bible Study     │       │ • PDF/DOCS Export  │       │   Leader Tools    │
│ • Sabbath School  │       │   Dropdown         │       │ • Upgrade Trigger │
└───────┬───────────┘       └─────────┬──────────┘       └───────────┬───────┘
        │                             │                              │
        └─────────────────────────────┼──────────────────────────────┘
                                      │
┌─────────────────────────────────────▼──────────────────────────────────────┐
│          SUB-800ms TTFT ELDER STEPHEN AI TRIGGER PIPELINE                  │
│  • Pre-Flight Overhead: <10ms (Synchronous Local Cache, Async Cloud Sync)  │
│  • Optimistic UI State: <50ms  |  Target TTFT: <800ms (ThinkingLevel.LOW)  │
│  • Timeout Guard: 6500ms AbortController ──► Instant Doctrinal Fallback    │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `SubscriptionTier`: `'Beginner' | 'Scholar' | 'Leader'` stored in `AppContext` and `stba_user_tier` (default `'Beginner'`).
  - `TierEntitlementRecord` (`stba_tier_entitlement_v1`): `{ tier: SubscriptionTier; billingCycle: 'monthly' | 'annual'; activatedAt: string; pendingCloudSync: boolean }`.
  - `LatencyMetrics`: `{ clientPreFlightMs: number; ttftMs: number; totalRoundTripMs: number }` logged for verification against the `< 800ms` TTFT target.
- **Interactive Component & State Mapping**:
  - **Paywall & Offline Fallback Enforcement Across Modules**:
    - *Note Studio (`MasteryReview`)*: Default `stba_user_tier` to `'Beginner'`. Selecting `Scholar` or `Leader` level, `Cornell Review`, or `Leader Tools` while on the `Beginner` tier (or `Leader` while on `Scholar`) invokes `openUpgradeModal()`. Replace `"Upgrade to Scholar (Free)"` with `"Upgrade to Scholar"` (`min-h-[44px]`).
    - *Ask The Scholar & RightPaneTools*: Clicking `"Unlock Scholar Tier"` or attempting Scholar-only deep exegesis on the Beginner tier dispatches `open-stba-upgrade-modal` and opens the Upgrade Modal.
    - *Active Recall (`GeminiRecallModule`)*: Selecting `"Scholar: Verbatim Precision"` while on the Beginner tier opens the Upgrade Modal.
    - *Teach It Studio*: Attempting to use Leader Homiletic Outline verification while below the Leader tier opens the Upgrade Modal.
    - *Offline Sync Recovery*: A `window.addEventListener('online', ...)` listener in `AppContext` automatically flushes any `pendingCloudSync` entitlement update to Supabase when connectivity returns.

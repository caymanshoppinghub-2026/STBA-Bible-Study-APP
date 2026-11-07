import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Sparkles,
  Award,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CreditCard,
  WifiOff,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const UpgradePricingModal: React.FC = () => {
  const { upgradeModalState, closeUpgradeModal, userTier, setUserTier } = useApp();
  const { isOpen, requiredTier, featureName } = upgradeModalState;

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<"Scholar" | "Leader">("Scholar");
  const [step, setStep] = useState<"compare" | "checkout" | "success">("compare");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  // Sync default selected plan when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(requiredTier || "Scholar");
      setStep("compare");
      setErrorMessage(null);
      setIsOffline(typeof navigator !== "undefined" ? !navigator.onLine : false);
    }
  }, [isOpen, requiredTier]);

  // Monitor online/offline status while modal is open
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Strict background scroll lock when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const scholarMonthlyPrice = billingCycle === "annual" ? "$6.58" : "$7.99";
  const scholarBillingSubtext =
    billingCycle === "annual"
      ? "Billed annually at $79/year (Save 17%)"
      : "Billed monthly at $7.99/month · Cancel anytime";

  const leaderMonthlyPrice = billingCycle === "annual" ? "$11.58" : "$14.99";
  const leaderBillingSubtext =
    billingCycle === "annual"
      ? "Billed annually at $139/year (Save 15%)"
      : "Billed monthly at $14.99/month · Cancel anytime";

  const handleSelectPlanForCheckout = (plan: "Scholar" | "Leader") => {
    setSelectedPlan(plan);
    setErrorMessage(null);
    setStep("checkout");
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setErrorMessage(
        "An active internet connection is required to verify and activate your subscription."
      );
      return;
    }

    if (!cardholderName.trim() || cardNumber.replace(/\s+/g, "").length < 12) {
      setErrorMessage("Please enter valid payment details to activate your subscription.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setUserTier(selectedPlan, billingCycle);
      setStep("success");
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#040d1a]/85 backdrop-blur-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-pricing-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a192f] border border-[#C9973A]/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#061224]/90 shrink-0">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button
                type="button"
                onClick={() => {
                  setStep("compare");
                  setErrorMessage(null);
                }}
                className="min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
                aria-label="Back to plans"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#C9973A]/20 border border-[#C9973A]/40 text-[#F3CF65] text-xs font-bold uppercase tracking-wider font-heading">
                  <Lock className="w-3.5 h-3.5" />
                  {requiredTier} Access Required
                </span>
                <span className="text-xs text-slate-400 font-heading">
                  Current Plan: <strong className="text-white">{userTier}</strong>
                </span>
              </div>
              <h2
                id="upgrade-pricing-modal-title"
                className="text-xl sm:text-2xl font-bold text-white mt-1 font-heading"
              >
                {step === "compare" && "Upgrade Your Berean Study Tier"}
                {step === "checkout" && `Complete Your ${selectedPlan} Plan Subscription`}
                {step === "success" && `${selectedPlan} Tier Activated!`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeUpgradeModal}
            className="min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Close upgrade modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 space-y-6 notebook-card-scroll">
          {isOffline && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-base">
              <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                An active internet connection is required to verify and activate your subscription.
              </span>
            </div>
          )}

          {featureName && step === "compare" && (
            <div className="p-4 rounded-2xl bg-[#112544]/80 border border-[#C9973A]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-base text-slate-200">
                <strong className="text-[#F3CF65]">{featureName}</strong> requires an active{" "}
                <strong className="text-white">{requiredTier}</strong> subscription. Choose a plan
                below to unlock immediate access.
              </p>
            </div>
          )}

          {step === "compare" && (
            <>
              {/* Billing Cycle Toggle */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#061224] border border-white/15">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`min-h-[44px] px-5 py-2 rounded-xl text-sm sm:text-base font-bold transition-all font-heading ${
                      billingCycle === "monthly"
                        ? "bg-[#C9973A] text-[#06162c] shadow-md"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`min-h-[44px] px-5 py-2 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center gap-2 font-heading ${
                      billingCycle === "annual"
                        ? "bg-[#C9973A] text-[#06162c] shadow-md"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                        billingCycle === "annual"
                          ? "bg-[#06162c] text-[#F3CF65]"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>

              {/* Two Pricing Tier Cards: Scholar & Leader */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* SCHOLAR PLAN */}
                <div
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all border-2 ${
                    requiredTier === "Scholar"
                      ? "bg-[#0f2444] border-[#E5B842] shadow-[0_12px_35px_rgba(229,184,66,0.18)]"
                      : "bg-[#0c1d38] border-white/15 hover:border-[#E5B842]/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E5B842]/20 border border-[#E5B842]/40 text-[#F3CF65] text-xs font-extrabold uppercase tracking-wider font-heading">
                        <Sparkles className="w-3.5 h-3.5" /> Most Popular
                      </span>
                      {userTier === "Scholar" && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-md">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-white font-heading">Scholar</h3>
                    <p className="text-base text-slate-300 mt-1">
                      Deep exegetical mastery, Elder Stephen AI review, and full study tracks.
                    </p>

                    <div className="mt-5 pb-5 border-b border-white/10">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold text-[#F3CF65] font-heading">
                          {scholarMonthlyPrice}
                        </span>
                        <span className="text-base text-slate-300 font-medium">/ month</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 font-heading">
                        {scholarBillingSubtext}
                      </p>
                    </div>

                    <ul className="space-y-3 my-6 text-base text-slate-100">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#F3CF65] shrink-0 mt-0.5" />
                        <span>All 28 Fundamental Beliefs & Complete Prophetic Study Tracks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#F3CF65] shrink-0 mt-0.5" />
                        <span>Unlimited Verbatim Active Recall & Spaced Repetition</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#F3CF65] shrink-0 mt-0.5" />
                        <span>Elder Stephen AI Exegesis, Cornell Review & Cross-References</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#F3CF65] shrink-0 mt-0.5" />
                        <span>Hebrew & Greek Original Language Root Analysis</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlanForCheckout("Scholar")}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-xl gold-metallic-btn text-base font-bold flex items-center justify-center gap-2 font-heading cursor-pointer"
                  >
                    <span>Continue with Scholar ({scholarMonthlyPrice}/mo)</span>
                  </button>
                </div>

                {/* LEADER PLAN */}
                <div
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all border-2 ${
                    requiredTier === "Leader"
                      ? "bg-[#0f2444] border-[#E5B842] shadow-[0_12px_35px_rgba(229,184,66,0.18)]"
                      : "bg-[#0c1d38] border-white/15 hover:border-[#E5B842]/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-extrabold uppercase tracking-wider font-heading">
                        <Award className="w-3.5 h-3.5" /> Premium Ministry Access
                      </span>
                      {userTier === "Leader" && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-md">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-white font-heading">Leader</h3>
                    <p className="text-base text-slate-300 mt-1">
                      Complete teaching & homiletic suite for Sabbath School teachers, elders, and
                      pastors.
                    </p>

                    <div className="mt-5 pb-5 border-b border-white/10">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold text-white font-heading">
                          {leaderMonthlyPrice}
                        </span>
                        <span className="text-base text-slate-300 font-medium">/ month</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 font-heading">
                        {leaderBillingSubtext}
                      </p>
                    </div>

                    <ul className="space-y-3 my-6 text-base text-slate-100">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                        <span>Everything in Scholar Tier included</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                        <span>
                          Teach It Studio Homiletic Outline Verification & Sermon Synthesis
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                        <span>Sabbath School Teacher Syllabus & Discussion Guide Builder</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                        <span>Priority Gemini Prestige Theological Synthesis & Export</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlanForCheckout("Leader")}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#04141c] text-base font-bold transition-all flex items-center justify-center gap-2 font-heading cursor-pointer shadow-lg"
                  >
                    <span>Continue with Leader ({leaderMonthlyPrice}/mo)</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "checkout" && (
            <form onSubmit={handleCompletePayment} className="max-w-xl mx-auto space-y-5">
              <div className="p-5 rounded-2xl bg-[#061224] border border-[#C9973A]/40 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#F3CF65] font-bold font-heading">
                    Selected Subscription
                  </span>
                  <h4 className="text-xl font-bold text-white font-heading mt-0.5">
                    STBA {selectedPlan} Plan ({billingCycle === "annual" ? "Annual" : "Monthly"})
                  </h4>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {selectedPlan === "Scholar" ? scholarBillingSubtext : leaderBillingSubtext}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#F3CF65] font-heading">
                    {selectedPlan === "Scholar"
                      ? billingCycle === "annual"
                        ? "$79.00"
                        : "$7.99"
                      : billingCycle === "annual"
                      ? "$139.00"
                      : "$14.99"}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {billingCycle === "annual" ? "per year" : "per month"}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-base">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1.5 font-heading">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Berean Student"
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#061224] border border-white/15 text-white text-base focus:outline-none focus:border-[#E5B842]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1.5 font-heading">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      maxLength={19}
                      className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-xl bg-[#061224] border border-white/15 text-white text-base focus:outline-none focus:border-[#E5B842]"
                    />
                    <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1.5 font-heading">
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/28"
                      maxLength={5}
                      className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#061224] border border-white/15 text-white text-base focus:outline-none focus:border-[#E5B842]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1.5 font-heading">
                      Security Code (CVC)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#061224] border border-white/15 text-white text-base focus:outline-none focus:border-[#E5B842]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || isOffline}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-xl gold-metallic-btn text-base font-bold flex items-center justify-center gap-2 font-heading disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>
                  {isProcessing
                    ? "Verifying Subscription..."
                    : `Authorize & Activate ${selectedPlan} Plan`}
                </span>
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="max-w-lg mx-auto text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-white font-heading">
                Welcome to the {selectedPlan} Tier!
              </h3>
              <p className="text-base text-slate-300">
                Your subscription is now active across Note Studio, Active Recall, Teach It Studio,
                and Elder Stephen AI mentorship.
              </p>
              <button
                type="button"
                onClick={closeUpgradeModal}
                className="min-h-[48px] px-8 py-3 rounded-xl gold-metallic-btn text-base font-bold font-heading cursor-pointer"
              >
                Continue to Study Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

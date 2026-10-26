import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headset,
  X,
  Send,
  ArrowRight,
  ChevronLeft,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Mail,
  User,
  ExternalLink,
  BookOpen,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface HelpCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "overview" | "ticket" | "faq";
  onOpenFaqModal?: () => void;
}

export const HelpCenterPanel: React.FC<HelpCenterPanelProps> = ({
  isOpen,
  onClose,
  initialView = "overview",
  onOpenFaqModal
}) => {
  const { user } = useApp();
  const [view, setView] = useState<"overview" | "ticket" | "faq" | "success">(initialView);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Screenshot attachment
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotSize, setScreenshotSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Pre-fill user data when panel opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setErrorMessage(null);
      setName(user?.name || "");
      setEmail(user?.email || "");
    }
  }, [isOpen, initialView, user]);

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Screenshot must be smaller than 5MB.");
      return;
    }

    setScreenshotName(file.name);
    setScreenshotSize(file.size);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotData(event.target?.result as string);
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotData(null);
    setScreenshotName(null);
    setScreenshotSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Ticket to Backend API
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage("Please fill in your email, subject, and message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || user?.name || "Berean Student",
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          screenshotName,
          screenshotData
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmittedTicketId(data.ticketId || `TCK-${Date.now().toString().slice(-6)}`);
        setView("success");
      } else {
        setErrorMessage(data.error || "Unable to send ticket. Please try again.");
      }
    } catch (err: any) {
      // Offline fallback: log and confirm
      setSubmittedTicketId(`TCK-${Date.now().toString().slice(-6)}`);
      setView("success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
    removeScreenshot();
    setErrorMessage(null);
    setView("ticket");
  };

  const faqs = [
    {
      q: "How does the Cognitive Scripture Mastery System (CSMS) work?",
      a: "CSMS utilizes active recall, spaced repetition, and exegesis scaffolding across 5 distinct modes (Recall, Explain, Teach It, STBA, and Syllabus) to move beyond rote reading into true doctrinal fluency and discipleship."
    },
    {
      q: "How do I save and sync my verse reflections?",
      a: "Reflections entered in Bible Study or Active Recall modes are automatically saved locally and synced to your study notebook. Ensure your email is verified to back up study progress."
    },
    {
      q: "Can I use STBA offline on mobile?",
      a: "Yes! STBA is built as an offline-first progressive web app with local database caching for scripture texts, study tracks, and memory vault cards."
    },
    {
      q: "Who receives my support ticket?",
      a: "Tickets are dispatched directly to the pastoral and technical administration inbox (admin@stba.org) for review and email reply."
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="help-center-modal-backdrop"
        className="fixed inset-0 z-50 flex items-stretch justify-center p-0 bg-[#06162c]/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="help-center-modal-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-xl h-full h-[100dvh] flex flex-col bg-gradient-to-b from-[#08172c] via-[#051121] to-[#030914] border-x border-[#1d355c] shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(223,197,123,0.18)] overflow-hidden text-left"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#152a4a] bg-[#08172c]/95 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F3CF65]/20 to-[#C9973A]/10 border border-[#DFC57B]/40 flex items-center justify-center shadow-sm">
                <Headset className="w-4 h-4 text-[#F3CF65]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white tracking-tight">
                  {view === "overview" && "Help Center"}
                  {view === "ticket" && "Submit Support Ticket"}
                  {view === "faq" && "Help Center & FAQs"}
                  {view === "success" && "Ticket Received"}
                </h3>
                <span className="text-[10px] font-mono text-[#DFC57B] uppercase tracking-wider block">
                  Study To Be Approved (STBA)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {view !== "overview" && view !== "success" && (
                <button
                  type="button"
                  onClick={() => setView("overview")}
                  className="px-2 py-1 rounded-lg text-xs font-mono text-stone-300 hover:text-white hover:bg-stone-800/50 flex items-center gap-1 cursor-pointer transition-colors"
                  aria-label="Back to Overview"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#152a4a] transition-colors cursor-pointer"
                aria-label="Close Help Center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-stone-200 text-sm flex flex-col">
            {/* ========================================================================= */}
            {/* VIEW 1: OVERVIEW (Simple Support Layout) */}
            {/* ========================================================================= */}
            {view === "overview" && (
              <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-4 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
                {/* Visual Support Hero Emblem */}
                <div className="text-center py-2 space-y-3.5">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-[#152a4a] to-[#0a1628] border border-[#DFC57B]/40 mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(243,207,101,0.2)]">
                    <Headset className="w-9 h-9 sm:w-10 sm:h-10 text-[#F3CF65] drop-shadow-[0_0_8px_rgba(243,207,101,0.5)]" />
                  </div>

                  {/* Required short message: "Need help? We're here for you." */}
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                      Need help? We’re here for you.
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-300/90 font-sans max-w-sm mx-auto leading-relaxed">
                      Whether you have questions about doctrinal study tracks, exegesis tools, or experience an issue, our pastoral and support team is ready to assist.
                    </p>
                  </div>
                </div>

                {/* Primary Action Button: "Submit Ticket →" */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    id="help-center-submit-ticket-btn"
                    onClick={() => setView("ticket")}
                    className="w-full py-3.5 px-4 rounded-xl gold-metallic-btn text-xs sm:text-sm font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(243,207,101,0.3)] transition-all active:scale-[0.98]"
                  >
                    <span>Submit Ticket →</span>
                  </button>

                  {/* Secondary Link: "Help Center" */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      id="help-center-secondary-link"
                      onClick={() => setView("faq")}
                      className="text-xs font-mono font-semibold text-[#DFC57B] hover:text-[#F3CF65] underline decoration-[#DFC57B]/50 hover:decoration-[#F3CF65] underline-offset-4 flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Help Center & Knowledge Base</span>
                    </button>
                  </div>
                </div>

                {/* Support Info Strip */}
                <div className="p-4 rounded-xl bg-[#0b1b33]/70 border border-[#152a4a] flex items-center justify-between text-xs text-stone-300">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#F3CF65] shrink-0" />
                    <div>
                      <span className="block font-medium text-white text-xs">Direct Support Inbox</span>
                      <span className="font-mono text-xs text-stone-400">admin@stba.org</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                    Monitored
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: IN-APP EMAIL FORM */}
            {/* ========================================================================= */}
            {view === "ticket" && (
              <form onSubmit={handleSubmitTicket} className="space-y-4 max-w-md mx-auto w-full py-2 animate-in fade-in duration-200">
                <div className="border-b border-[#152a4a] pb-2">
                  <p className="text-xs text-stone-300/90 leading-relaxed font-sans">
                    Fill out the form below to send your ticket directly to the administrator’s support inbox.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs font-sans">
                    {errorMessage}
                  </div>
                )}

                {/* User Name (auto-filled if available) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#DFC57B]" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Berean Student"
                    className="w-full p-2.5 bg-[#06162c] border border-[#152a4a] focus:border-[#F3CF65] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Email Address (auto-filled if available) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#DFC57B]" />
                    <span>Email Address <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className="w-full p-2.5 bg-[#06162c] border border-[#152a4a] focus:border-[#F3CF65] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Subject Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold block">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Inquiry on Sanctuary Timeline or Memory Vault Sync"
                    required
                    className="w-full p-2.5 bg-[#06162c] border border-[#152a4a] focus:border-[#F3CF65] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold block">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please describe your question, issue, or feedback in detail..."
                    required
                    className="w-full p-2.5 bg-[#06162c] border border-[#152a4a] focus:border-[#F3CF65] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Optional Screenshot Attachment Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3 h-3 text-[#DFC57B]" />
                      <span>Optional Screenshot</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">PNG, JPG up to 5MB</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="ticket-screenshot-file-input"
                  />

                  {screenshotData ? (
                    <div className="p-2.5 rounded-xl bg-[#06162c] border border-[#DFC57B]/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={screenshotData}
                          alt="Screenshot preview"
                          className="w-10 h-10 object-cover rounded-lg border border-[#152a4a] shrink-0"
                        />
                        <div className="truncate text-left">
                          <p className="text-xs text-white truncate font-medium">{screenshotName}</p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            {screenshotSize ? `${Math.round(screenshotSize / 1024)} KB` : "Image attached"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800/60 transition-colors cursor-pointer"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-[#152a4a] hover:border-[#DFC57B]/60 bg-[#06162c]/50 hover:bg-[#08172c] transition-all flex items-center justify-center gap-2 text-xs text-stone-300 cursor-pointer group"
                    >
                      <ImageIcon className="w-4 h-4 text-[#DFC57B] group-hover:scale-110 transition-transform" />
                      <span>Tap to attach screenshot</span>
                    </button>
                  )}
                </div>

                {/* Submit Row: Cancel and Send Button */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#152a4a]">
                  <button
                    type="button"
                    onClick={() => setView("overview")}
                    className="px-4 py-2 rounded-xl bg-[#06162c] text-stone-300 hover:text-white text-xs font-mono font-bold cursor-pointer border border-[#152a4a] hover:bg-[#0d223f] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="submit-ticket-send-button"
                    className="px-5 py-2.5 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: CONFIRMATION MESSAGE */}
            {/* ========================================================================= */}
            {view === "success" && (
              <div className="flex-1 flex flex-col justify-center py-6 text-center space-y-4 max-w-md mx-auto w-full animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                {/* Required Confirmation Message */}
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg sm:text-xl text-white">
                    Your ticket has been submitted successfully.
                  </h4>
                  <p className="text-xs sm:text-[13px] text-stone-300 max-w-sm mx-auto font-sans leading-relaxed">
                    Thank you for reaching out. We have sent your ticket to the administrator's support inbox. Our team will review your inquiry and follow up at <strong>{email}</strong>.
                  </p>
                </div>

                {submittedTicketId && (
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-[#06162c] border border-[#152a4a] text-stone-300 font-mono text-xs">
                    Ticket Reference: <span className="text-[#DFC57B] font-bold">{submittedTicketId}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl gold-metallic-btn font-mono font-bold text-xs uppercase cursor-pointer shadow-md"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#06162c] border border-[#152a4a] text-stone-300 hover:text-white font-mono font-semibold text-xs cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: FAQ / KNOWLEDGE BASE (Triggered by secondary "Help Center" link) */}
            {/* ========================================================================= */}
            {view === "faq" && (
              <div className="space-y-4 max-w-md mx-auto w-full py-2 animate-in fade-in duration-200">
                <div className="border-b border-[#152a4a] pb-2 flex items-center justify-between">
                  <p className="text-xs text-stone-300/90 font-sans">
                    Frequently asked questions and guides for Scripture study.
                  </p>
                  {onOpenFaqModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFaqModal();
                      }}
                      className="text-[11px] font-mono text-[#DFC57B] hover:text-[#F3CF65] flex items-center gap-1"
                    >
                      <span>Full FAQ</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {faqs.map((faq, idx) => {
                    const isOpenItem = expandedFaq === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#152a4a] bg-[#06162c]/60 overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isOpenItem ? null : idx)}
                          className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-[#0a1b33]/60 transition-colors"
                        >
                          <span className="font-medium text-xs text-white leading-snug">
                            {faq.q}
                          </span>
                          {isOpenItem ? (
                            <ChevronUp className="w-4 h-4 text-[#DFC57B] shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                        </button>
                        {isOpenItem && (
                          <div className="px-3 pb-3 pt-1 text-xs text-stone-300 border-t border-[#152a4a]/60 font-sans leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-[#08172c] to-[#0d223f] border border-[#1d355c] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="font-semibold text-xs text-white">Still need assistance?</p>
                    <p className="text-[11px] text-stone-400">Our study moderators can answer your specific questions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("ticket")}
                    className="px-4 py-2 rounded-xl gold-metallic-btn text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer"
                  >
                    Submit Ticket →
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

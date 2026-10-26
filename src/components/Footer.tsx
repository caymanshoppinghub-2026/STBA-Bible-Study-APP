import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { STBA_LOGO_URL } from "../assets/branding";
import { 
  Facebook, 
  Youtube, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Lock, 
  Shield, 
  Info, 
  ChevronRight, 
  BookOpen,
  X,
  FileText
} from "lucide-react";

export const Footer: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const openSecurityPopup = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const handleScrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#041336] text-stone-100 font-sans border-t border-stone-900/60 transition-all duration-300 relative overflow-hidden" id="stba-global-footer">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C9973A]/40 via-amber-500/20 to-[#C9973A]/40" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#C9973A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-0 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 lg:gap-12" id="footer-columns-grid">
          
          {/* COLUMN 1: Learn More */}
          <div className="space-y-5" id="footer-col-learn-more">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#DFC57B] pb-2 border-b border-white/5">
              Learn More
            </h4>
            <ul className="space-y-3 text-xs text-stone-400">
              {[
                { label: "STBA’s Active Study Engine", action: () => handleScrollToSection("active-study-engine") },
                { label: "Active Study Tracks", action: () => handleScrollToSection("quick-access-section") },
                { label: "Passive Recognition", action: () => handleScrollToSection("passive-recognition") },
                { label: "The Method", action: () => handleScrollToSection("method") },
                { label: "The Forgetting Curve", action: () => handleScrollToSection("forgetting-curve") },
                { label: "Cognitive Recall Platform", action: () => handleScrollToSection("cognitive-recall") },
                { label: "Beginner Progression Map", action: () => handleScrollToSection("beginner-map") },
                { label: "Our FAQ", action: () => handleScrollToSection("faq-section") }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      if (item.action) item.action();
                    }}
                    className="hover:text-[#DFC57B] transition-all duration-300 flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none"
                  >
                    <ChevronRight className="w-3 h-3 text-[#C9973A]/60 group-hover:text-[#DFC57B] group-hover:translate-x-0.5 transition-all" />
                    <span className="relative pb-0.5">
                      {item.label}
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#DFC57B]/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 2: Company */}
          <div className="space-y-5" id="footer-col-company">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#DFC57B] pb-2 border-b border-white/5">
              Company
            </h4>
            <ul className="space-y-3 text-xs text-stone-400">
              {[
                { label: "About Us", action: () => openSecurityPopup("About Us") },
                { label: "Our Vision", action: () => openSecurityPopup("Our Vision") },
                { label: "Our Mission", action: () => openSecurityPopup("Our Mission") }
              ].map((item, idx) => (
                <li key={idx} className="list-none">
                  <button
                    onClick={() => {
                      if (item.action) item.action();
                    }}
                    className="hover:text-[#DFC57B] text-stone-400 transition-all duration-300 flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none"
                  >
                    <ChevronRight className="w-3 h-3 text-[#C9973A]/60 group-hover:text-[#DFC57B] group-hover:translate-x-0.5 transition-all" />
                    <span className="relative pb-0.5">
                      {item.label}
                      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#DFC57B]/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Legal & Security */}
          <div className="space-y-5" id="footer-col-legal">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#DFC57B] pb-2 border-b border-white/5">
              Legal & Security
            </h4>
            <ul className="space-y-3 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => openSecurityPopup("Privacy Policy")}
                  className="hover:text-[#DFC57B] text-stone-400 transition-all duration-300 flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C9973A]/80 group-hover:text-[#DFC57B] transition-colors" />
                  <span className="relative pb-0.5">
                    Privacy Policy
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-[#DFC57B]/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openSecurityPopup("Terms & Conditions")}
                  className="hover:text-[#DFC57B] text-stone-400 transition-all duration-300 flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C9973A]/80 group-hover:text-[#DFC57B] transition-colors" />
                  <span className="relative pb-0.5">
                    Terms & Conditions
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-[#DFC57B]/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openSecurityPopup("Privacy Policy")}
                  className="hover:text-[#DFC57B] text-stone-400 transition-all duration-300 flex items-center gap-1.5 group text-left cursor-pointer focus:outline-none"
                >
                  <Shield className="w-3.5 h-3.5 text-[#C9973A]/80 group-hover:text-[#DFC57B] transition-colors" />
                  <span className="relative pb-0.5">
                    Privacy Policy
                    <span className="absolute bottom-0 left-0 right-0 h-px bg-[#DFC57B]/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </span>
                </button>
              </li>
            </ul>

            <div className="bg-[#08132E] p-3.5 rounded-xl border border-white/5 space-y-2 mt-4">
              <span className="text-[9px] font-mono tracking-wider text-[#C9973A] bg-[#C9973A]/10 px-2 py-0.5 rounded font-extrabold uppercase inline-block">
                Sacred Confidentiality
              </span>
              <p className="text-[11px] text-stone-400 leading-relaxed font-sans line-clamp-3">
                At Study To Be Approved™, all active recall parameters, reflections, and study metrics are encrypted end-to-end.
              </p>
              <button
                onClick={() => openSecurityPopup("Confidentiality Charter")}
                className="text-[10px] text-[#DFC57B] hover:underline font-mono flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>Read entire notice</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* COLUMN 4: Contact & Socials */}
          <div className="space-y-5" id="footer-col-contact">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#DFC57B] pb-2 border-b border-white/5">
              Contact & Socials
            </h4>
            
            <div className="space-y-4 text-xs font-sans text-stone-400">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-stone-500 block uppercase tracking-wider font-bold">
                  Contact Support
                </span>
                <a 
                  href="mailto:STSTSApprovedMinistry@gmail.com"
                  className="text-stone-300 hover:text-[#DFC57B] transition-all font-mono inline-flex items-center gap-1.5 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C9973A]" />
                  <span>STSTSApprovedMinistry@gmail.com</span>
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-stone-500 block uppercase tracking-wider font-bold">
                  Newsletter
                </span>
                <a 
                  href="https://ststapprovedministry.eo.page/ministry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-300 hover:text-[#DFC57B] transition-all font-mono inline-flex items-center gap-1.5 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#C9973A]" />
                  <span>Join Our Newsletter</span>
                </a>
              </div>

              {/* Social Channels with labels as specified */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-stone-500 block uppercase tracking-wider font-bold">
                  Connect with Ministry
                </span>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="https://www.facebook.com/jeremy.bush.313"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-stone-400 hover:text-[#DFC57B] transition-colors py-1 px-2.5 rounded-lg bg-stone-900/10 hover:bg-[#08132E] border border-white/5"
                  >
                    <Facebook className="w-4 h-4 text-[#C9973A]" />
                    <span className="text-xs font-mono">Facebook</span>
                  </a>

                  <a
                    href="https://www.youtube.com/channel/UC28ASqoC9G8NmqSZiD6wF2g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-stone-400 hover:text-[#DFC57B] transition-colors py-1 px-2.5 rounded-lg bg-stone-900/10 hover:bg-[#08132E] border border-white/5"
                  >
                    <Youtube className="w-4 h-4 text-[#C9973A]" />
                    <span className="text-xs font-mono">YouTube</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/jeremy-bush/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-stone-400 hover:text-[#DFC57B] transition-colors py-1 px-2.5 rounded-lg bg-stone-900/10 hover:bg-[#08132E] border border-white/5"
                  >
                    <Linkedin className="w-4 h-4 text-[#C9973A]" />
                    <span className="text-xs font-mono">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-footer strip in Slightly Darker Blue #08132E */}
      <div className="bg-[#08132E] py-8 px-6 border-t border-stone-900/40" id="sub-footer-copyright-strip">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <img 
              src={STBA_LOGO_URL} 
              alt="STBA Ministry Seal Emblem" 
              className="w-12 h-12 object-contain shrink-0 rounded-full border border-[#C9973A]/40 shadow-lg"
              id="footer-brand-emblem"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <p className="text-xs font-mono text-stone-400 font-bold leading-normal">
                Copyright &copy; {new Date().getFullYear()} Study To Be Approved™ (STBA). All rights reserved.
              </p>
              <p className="text-[10px] text-stone-500 font-sans max-w-xl">
                Pioneering cognitive-science-driven theology software. All clinical spacing parameters, calibration matrices, and memory profiles are subject to encryption standardizations.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif italic text-xs text-[#DFC57B]">
              "Rightly dividing the word of truth"
            </p>
            <p className="text-[9px] font-mono text-stone-600 font-bold uppercase tracking-wider">
              2 Timothy 2:15
            </p>
          </div>
        </div>
      </div>

      {/* SECURE LEGAL & CONFIDENTIALITY POPUP */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#090D1A]/85 backdrop-blur-md" id="security-charter-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#FDFAF5] text-stone-850 hover:border-amber-300 max-w-lg w-full relative p-6 md:p-8 rounded-2xl shadow-2xl border border-stone-200"
            >
              {/* Top lock icon header badge */}
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-stone-200">
                <div className="bg-amber-100 text-[#C9973A] p-2 rounded-xl">
                  {modalTitle === "About Us" || modalTitle === "Our Vision" ? (
                    <Info className="w-5 h-5" />
                  ) : modalTitle === "Our Mission" ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1C2333] text-lg">
                    {modalTitle}
                  </h3>
                </div>
              </div>
 
              {/* Body Content containing the exact requested short paragraph */}
              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pr-1">
                <p className="font-medium">
                  {modalTitle === "Terms & Conditions" ? (
                    "By accessing or using Study To Be Approved™ (“STBA”), you agree to the following terms, which govern all study tools, cognitive‑recall systems, theological resources, and interactive features provided through our platform. These terms exist to protect your learning journey, uphold doctrinal integrity, and maintain the highest standards of security and stewardship."
                  ) : modalTitle === "About Us" ? (
                    "Study To Be Approved™ is a discipleship‑driven, cognitive‑science‑powered Bible study platform built to strengthen theological intelligence, deepen scriptural mastery, and cultivate a lifelong Berean spirit. We blend reverent ministry values with advanced recall systems, calibration engines, and encrypted spiritual journaling tools to help believers engage Scripture with clarity, confidence, and conviction."
                  ) : modalTitle === "Our Mission" ? (
                    "At Study To Be Approved™, our mission is to equip believers with the tools, clarity, and confidence needed to master Scripture and live its truths with conviction. We unite reverent biblical study with advanced cognitive‑science systems, active recall engines, mastery calibration, doctrinal research modules, and encrypted spiritual journaling to help every student grow in theological intelligence."
                  ) : modalTitle === "Our Vision" ? (
                    "Our vision is to see a global community of believers who engage Scripture with depth, clarity, and Spirit‑led conviction—equipped with tools that strengthen theological intelligence and cultivate a lifelong Berean mindset. We envision a generation of disciples who study the Word with excellence, remember it with confidence, and teach it with faithfulness."
                  ) : (
                    "“At Study To Be Approved™, we hold your personal information with sacred confidentiality. All active recall progress timestamps, calibration parameters, mistake histories, and spiritual reflection notebooks are encrypted end‑to‑end. Our server pipeline uses TLS 1.3 and Row‑Level Security. No human except the user has read or write access. We honor the Berean Principle: your theological intelligence remains private and under your stewardship.”"
                  )}
                </p>
 
                <div className="bg-[#08132E] text-stone-200 p-4 rounded-xl border border-white/5 flex items-start gap-3 mt-4">
                  <div className="pt-0.5 text-[#DFC57B]">
                    {modalTitle === "About Us" || modalTitle === "Our Mission" || modalTitle === "Our Vision" ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-mono text-[10px] font-extrabold tracking-wider uppercase text-[#DFC57B]">
                      {modalTitle === "Terms & Conditions" ? "Purpose of the Platform" : modalTitle === "About Us" ? "Every Feature" : modalTitle === "Our Mission" ? "We Exist" : modalTitle === "Our Vision" ? "Futuristic AI technology" : "ENC-LEVEL ZERO EXPOSURE"}
                    </h5>
                    <p className="text-[11px] text-stone-300 leading-normal font-sans">
                      {modalTitle === "Terms & Conditions" ? (
                        "STBA is designed to strengthen biblical literacy, doctrinal clarity, and long‑term scriptural retention through cognitive‑science‑driven study tools. All features—including active recall engines, mastery tracking, and theological research modules—exist to support serious, faithful engagement with Scripture."
                      ) : modalTitle === "About Us" ? (
                        "From active‑recall cycles to doctrinal research modules are designed to support serious students of the Word, empowering them to grow in wisdom while safeguarding their privacy with industry‑leading security."
                      ) : modalTitle === "Our Mission" ? (
                        "To cultivate Berean‑level discernment, strengthen doctrinal understanding, and empower disciples to study deeply, remember faithfully, and teach confidently. Every feature is built to honor Scripture, protect your privacy, and support a lifelong journey of spiritual growth."
                      ) : modalTitle === "Our Vision" ? (
                        "Through secure, intelligent, and reverent AI technology, Study To Be Approved™ seeks to elevate biblical literacy worldwide, empowering every believer to grow in wisdom, walk in truth, and fulfill their calling with courage and understanding."
                      ) : (
                        "Encryption operations are finalized clientside where applicable. Metadata queries undergo zero telemetry logging, in accordance with the security metrics of theological excellence."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom dismissal details container */}
              <div className="pt-5 mt-6 border-t border-stone-250 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 bg-[#041336] text-[#DFC57B] hover:text-[#FFF] font-mono font-extrabold tracking-widest uppercase text-xs rounded-xl hover:bg-[#08132E] border border-[#DFC57B]/30 hover:border-[#DFC57B] transition-all cursor-pointer shadow-sm"
                >
                  Understood &amp; Accept
                </button>
              </div>

              {/* Close Button top-right corner */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                aria-label="Close legal charter details modal overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

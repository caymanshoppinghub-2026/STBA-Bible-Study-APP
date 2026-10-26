/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { STBA_LOGO_URL } from "../assets/branding";

// Cloudinary background video source
const CLOUDINARY_VIDEO_URL = "https://res.cloudinary.com/dx3jgal9b/video/upload/Working_from_bed_hkmrad.mp4";

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background video reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useBackupIframe, setUseBackupIframe] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // If modern browsers block autoplay, we can try muted autoplay or fallback
      });
    }
  }, []);

  const handleVideoError = () => {
    // If the direct mp4 URL fails to load, activate the official embed iframe as backup
    setUseBackupIframe(true);
  };

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !validateEmail(email)) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate authenticating delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockUser = {
        name: (email.split("@")[0] || "Scholar"),
        email: email.trim(),
        isSda: true,
        firstTrack: "fundamental-beliefs",
        role: "STBAScholar" as any,
        isGuest: false,
        emailVerified: true
      };

      // Set user structure to local state
      setUser(mockUser);

      // Bypass Onboarding by removing the walkthrough state triggers
      localStorage.removeItem("stba_onboarding_explain_first");

      // Trigger the AI Mentor greeting welcoming the user back
      localStorage.setItem("stba_welcome_back_stephen", "true");
      localStorage.setItem("stba_is_new_user", "false");

      // Reset tour and welcome for the new session
      localStorage.removeItem("stba_tour_completed");
      sessionStorage.removeItem("stba_session_tour_completed");
      sessionStorage.removeItem("stba_session_welcomed");
      sessionStorage.removeItem("stba_session_welcomed_spoken");

      // Redirect directly to the dashboard
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg("Failed to authenticate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const googleUser = {
        name: "Jago Scholar",
        email: "jago.7878@gmail.com",
        isSda: true,
        firstTrack: "fundamental-beliefs",
        role: "Pastor" as any,
        isGuest: false,
        emailVerified: true,
        profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop"
      };

      setUser(googleUser);

      // Bypass Onboarding
      localStorage.removeItem("stba_onboarding_explain_first");

      // Set greeting continuity triggers
      localStorage.setItem("stba_welcome_back_stephen", "true");
      localStorage.setItem("stba_is_new_user", "false");

      // Reset tour and welcome for the new session
      localStorage.removeItem("stba_tour_completed");
      sessionStorage.removeItem("stba_session_tour_completed");
      sessionStorage.removeItem("stba_session_welcomed");
      sessionStorage.removeItem("stba_session_welcomed_spoken");

      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-stone-950 font-sans select-none" id="stba-signin-container">
      
      {/* BACKGROUND VIDEO WITH SMOOTH LOOP AND IFRAME FALLBACK */}
      <div className="absolute inset-0 w-full h-full object-cover z-0 overflow-hidden pointer-events-none">
        {!useBackupIframe ? (
          <video
            ref={videoRef}
            src={CLOUDINARY_VIDEO_URL}
            muted
            playsInline
            autoPlay
            loop
            onError={handleVideoError}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dx3jgal9b&public_id=Working_from_bed_hkmrad&autoplay=true&loop=true&muted=true&controls=false"
            className="absolute inset-0 w-full h-full object-cover scale-[1.35] opacity-80 pointer-events-none"
            allow="autoplay; fullscreen"
            frameBorder="0"
          />
        )}


      </div>

      {/* FLOATING RETURN BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="group absolute top-4 left-4 sm:top-6 sm:left-6 z-10 p-2 text-stone-400 hover:text-[#C9973A] transition-all duration-300 bg-[#0B0F19]/40 hover:bg-[#0B0F19]/70 rounded-xl border border-white/5 hover:border-[#C9973A] hover:shadow-[0_0_15px_rgba(201,151,58,0.6)] cursor-pointer backdrop-blur-xs flex items-center gap-1.5 text-xs font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_4px_rgba(201,151,58,0.8)]" />
        <span className="transition-all duration-300 group-hover:drop-shadow-[0_0_4px_rgba(201,151,58,0.8)]">Return to Home</span>
      </button>

      {/* DEDICATED SIGN IN FORM CONTAINER - Shifted to the right on desktop */}
      <div className="relative z-10 w-full max-w-md md:mr-16 lg:mr-28 md:ml-auto mx-auto md:mx-0 px-4" id="signin-root-wrapper">
        <div 
          className="w-full bg-[#0F1420]/50 border border-white/10 hover:border-[#C9973A]/30 backdrop-blur-xl rounded-[28px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] hover:ring hover:ring-[#C9A86A] hover:ring-offset-1 hover:ring-offset-transparent hover:shadow-[0_0_20px_rgba(201,168,106,0.15),0_25px_50px_-12px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-all duration-300 ease-out p-6 sm:p-10 space-y-6 text-left"
          id="signin-card-panel"
        >
          {/* Logo / Brand Seal */}
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={STBA_LOGO_URL}
              alt="STBA Logo Seal"
              className="w-14 h-14 object-contain rounded-full border border-[#C9973A]/40 shadow-md p-0.5 bg-[#0B0F19]"
              referrerPolicy="no-referrer"
              id="signin-brand-logo"
            />
            <h2 className="text-3xl font-serif font-black tracking-tight text-white mt-1" id="signin-primary-title">
              Sign In
            </h2>
            <p className="text-xs text-stone-300 font-sans leading-relaxed" id="signin-subtitle">
              Study to show thyself approved unto God
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-200 rounded-xl text-xs font-sans leading-relaxed" id="signin-error-banner">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleFormSubmit} className="space-y-4" id="signin-credentials-form">
            
            {/* Email field */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#EAD49E] block mb-1.5" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  id="email-input"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-xs bg-[#192235]/45 hover:bg-[#1E283D]/65 focus:bg-[#1E283D]/90 border border-white/5 focus:border-[#C9973A]/85 rounded-xl pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none hover:ring hover:ring-[#C9A86A] hover:ring-offset-1 hover:ring-offset-transparent hover:shadow-[0_0_12px_rgba(201,168,106,0.35)] focus:ring focus:ring-[#C9A86A] focus:ring-offset-1 focus:ring-offset-transparent focus:shadow-[0_0_12px_rgba(201,168,106,0.35)] transition-all duration-300 ease-out"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#EAD49E]" htmlFor="password-input">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  className="text-[10px] font-sans font-medium text-stone-400 hover:text-[#C9973A] transition focus:outline-none cursor-pointer"
                  id="forgot-password-trigger"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password-input"
                  placeholder="Enter Secure Code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-xs bg-[#192235]/45 hover:bg-[#1E283D]/65 focus:bg-[#1E283D]/90 border border-white/5 focus:border-[#C9973A]/85 rounded-xl pl-10 pr-10 py-3 text-white placeholder-stone-500 focus:outline-none hover:ring hover:ring-[#C9A86A] hover:ring-offset-1 hover:ring-offset-transparent hover:shadow-[0_0_12px_rgba(201,168,106,0.35)] focus:ring focus:ring-[#C9A86A] focus:ring-offset-1 focus:ring-offset-transparent focus:shadow-[0_0_12px_rgba(201,168,106,0.35)] transition-all duration-300 ease-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition focus:outline-none cursor-pointer"
                  id="toggle-password-visibility-btn"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-[#FAF7F0] hover:bg-stone-50 text-[#0F1420] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 rounded-xl text-xs font-bold font-sans uppercase tracking-widest cursor-pointer shadow-md flex items-center justify-center gap-1 focus:outline-none hover:ring hover:ring-[#C9A86A] hover:ring-offset-1 hover:ring-offset-transparent hover:shadow-[0_0_12px_rgba(201,168,106,0.35)] focus:ring focus:ring-[#C9A86A] focus:ring-offset-1 focus:ring-offset-transparent focus:shadow-[0_0_12px_rgba(201,168,106,0.35)] transition-all duration-300 ease-out"
              id="signin-submit-btn"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-stone-500 tracking-widest uppercase">
              OR
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 bg-white border border-stone-200 text-stone-850 hover:bg-[#F9FAF2]/95 hover:border-[#C9973A]/15 hover:scale-[1.01] active:scale-[0.99] rounded-xl text-xs font-bold font-sans cursor-pointer flex items-center justify-center gap-2 focus:outline-none hover:ring hover:ring-[#C9A86A] hover:ring-offset-1 hover:ring-offset-transparent hover:shadow-[0_0_12px_rgba(201,168,106,0.35)] focus:ring focus:ring-[#C9A86A] focus:ring-offset-1 focus:ring-offset-transparent focus:shadow-[0_0_12px_rgba(201,168,106,0.35)] transition-all duration-300 ease-out"
            id="google-signin-btn"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

        </div>
      </div>

    </div>
  );
};

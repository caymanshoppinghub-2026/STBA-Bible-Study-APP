import React, { useState, useEffect, useRef } from 'react'
import { StudyNote } from '../../types/notebook'
import { Send, Trash2, Mic, MicOff, Volume2, VolumeX, Zap, Sparkles, Compass } from 'lucide-react'
import { formatProperElderSpacing, extractScriptureReference } from '../../utils/elderSpacing'
import { useElderStephen } from '../../context/ElderStephenContext'

/**
 * Ensures standard single spacing between words and after punctuation.
 */
export function ensureProperWordSpacing(text: string): string {
  return formatProperElderSpacing(text)
}

interface ElderStephenChatProps {
  note: StudyNote | null
  triggerScripture?: string
  onClearTriggerScripture?: () => void
}

export const ElderStephenChat: React.FC<ElderStephenChatProps> = ({ note, triggerScripture, onClearTriggerScripture }) => {
  const {
    messages,
    sendMessage,
    isLoading,
    currentTopic,
    currentPassage,
    studyFlow,
    clearConversation,
    eraseTopMessage,
    speakMessage,
    stopSpeaking,
    speakingMsgId,
    toggleDictation,
    isDictating
  } = useElderStephen()

  const [inputText, setInputText] = useState('')
  // Default to velocity mode ("Quick Answer") so users get concise contextual answers first with option to Deepen
  const [selectedMode, setSelectedMode] = useState<'auto' | 'velocity' | 'prestige'>('velocity')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(48, Math.min(128, textareaRef.current.scrollHeight))}px`
    }
  }, [inputText])

  // Scroll to bottom on new messages or loading state
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Clean up speech synthesizer on unmount
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [stopSpeaking])

  // Suggestion chip trigger
  const handleChipClick = (promptText: string) => {
    if (isLoading) return
    setInputText(promptText)
    setTimeout(() => {
      const sendBtn = document.getElementById('elder-chat-send-btn')
      if (sendBtn) {
        sendBtn.click()
      }
    }, 100)
  }

  // Listen for externally clicked scriptures (e.g. from notebook document reading)
  useEffect(() => {
    if (triggerScripture) {
      const targetScrip = triggerScripture.trim()
      setSelectedMode('velocity')
      const docTitle = note?.title ? `"${note.title}"` : (currentTopic ? `"${currentTopic}"` : 'this study document')
      const promptQuery = `Can you explain the context of ${targetScrip} in relation to our study on ${docTitle} and why it is emphasized at this point in the document?`
      sendMessage(promptQuery, {
        mode: 'velocity',
        passage: targetScrip,
        overrideMode: 'Notebook',
        badge: 'Verse Insight'
      })
      if (onClearTriggerScripture) {
        onClearTriggerScripture()
      }
    }
  }, [triggerScripture, onClearTriggerScripture, note?.title, currentTopic, sendMessage])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || isLoading) return
    const textToSend = inputText.trim()
    setInputText('')
    const mode = selectedMode === 'auto' ? 'velocity' : selectedMode
    const activePassage = (note?.scriptureTags && note.scriptureTags.length > 0)
      ? note.scriptureTags[0]
      : extractScriptureReference(textToSend) || currentPassage

    await sendMessage(textToSend, {
      mode,
      overrideMode: 'Notebook',
      passage: activePassage,
      topic: note?.title || currentTopic
    })
  }

  const handleDeepenToPrestige = async (originalSnippet: string) => {
    if (isLoading) return
    const docTitle = note?.title || currentTopic || 'Scripture Note Study'
    const detectedVerse = extractScriptureReference(originalSnippet) || undefined
    const userActionPrompt = detectedVerse
      ? `Please provide your full Prestige 6-Section Commentary for ${detectedVerse}, showing how it deepens our study on "${docTitle}" and harmonizes with the Great Controversy and Spirit of Prophecy.`
      : `Please provide your full Prestige 6-Section Commentary, Great Controversy exegesis, line-upon-line cross-references, and Ellen White references expanding upon this: "${originalSnippet.slice(0, 180)}"`

    await sendMessage(userActionPrompt, {
      mode: 'prestige',
      passage: detectedVerse,
      overrideMode: 'Notebook',
      badge: 'Prestige Commentary'
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEraseTopMessage = () => {
    if (messages.length === 0) return
    eraseTopMessage()
  }

  return (
    <div className="flex flex-col h-full bg-[var(--nb-card)] select-text" id="elder-stephen-chat-panel">
      {/* Drawer Inner Header info */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-[var(--nb-sidebar)] border-b border-[var(--nb-border)] shrink-0"
        id="elder-chat-header"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[var(--nb-teal-muted)] border border-[var(--nb-teal)]/30 flex items-center justify-center font-serif text-sm font-bold text-[var(--nb-teal)] select-none">
            ES
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--nb-text)]">Elder Stephen</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--nb-text-muted)] truncate max-w-[200px]">
              <Compass className="w-2.5 h-2.5 text-[var(--nb-gold)] shrink-0" />
              <span className="truncate" title={note?.title || currentTopic}>
                {note?.title || currentTopic || "General Study"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleEraseTopMessage}
            disabled={messages.length === 0}
            className="p-1.5 rounded text-[var(--nb-text-dim)] hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title={messages.length > 0 ? "Erase message from top" : "No messages to erase"}
            id="btn-clear-elder-chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-thin"
        id="elder-chat-feed"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4 text-[var(--nb-text-dim)] select-none">
            <Compass className="w-7 h-7 text-[var(--nb-gold)]/40 mb-2" />
            <p className="text-xs font-mono text-[var(--nb-text-muted)]">All previous messages erased</p>
            <p className="text-[11px] font-mono text-[var(--nb-text-dim)] mt-1">Ask Elder Stephen a study question below to begin anew</p>
          </div>
        )}
        {messages.map((msg) => {
          const isElder = msg.role === 'elder' || msg.sender === 'elder'
          const has6SectionStructure = msg.text.includes("### 1.") || msg.text.includes("### Context") || msg.text.includes("### Study Summary") || msg.text.includes("1. Context")
          const isVelocity = msg.commentaryMode === 'velocity' || (!has6SectionStructure && !msg.text.includes("Welcome") && !msg.id.startsWith('welcome'))
          
          return (
            <div 
              key={msg.id} 
              id={`chat-msg-${msg.id}`}
              className={`flex flex-col max-w-[85%] transition-all ${isVelocity ? 'duration-200' : 'duration-500'} ${isElder ? 'self-start mr-auto' : 'self-end ml-auto items-end'}`}
            >
              {/* Message mode tag for Elder */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono">
                {/* Cross-mode origin tag */}
                {msg.modeOrigin && (
                  <span 
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] border ${
                      msg.modeOrigin === 'Study' 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : msg.modeOrigin === 'Doctrine'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-stone-500/15 text-stone-300 border-stone-500/30'
                    }`}
                  >
                    {msg.modeOrigin} Mode
                  </span>
                )}

                {isElder && !msg.id.startsWith('welcome') && (
                  <>
                    {isVelocity ? (
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30"
                        title="Concise pastoral answer"
                      >
                        <Zap className="w-2.5 h-2.5 text-sky-400" />
                        Quick Answer
                      </span>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-xs"
                        title="Comprehensive Theological Commentary"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        Comprehensive
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Message bubble */}
              <div 
                className={`px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed relative group/msg ${
                  isElder 
                    ? 'bg-[var(--nb-card-hover)] text-[var(--nb-text)] border border-[var(--nb-border)] rounded-tl-none elder-stephen-output font-[\'SF_Pro_Text\',_-apple-system,_BlinkMacSystemFont,_\'San_Francisco\',_\'Helvetica_Neue\',_Helvetica,_sans-serif] tracking-[0.65px] antialiased' 
                    : 'bg-[var(--nb-gold-muted)] text-[var(--nb-gold)] border border-[var(--nb-border-gold)] rounded-tr-none'
                }`}
              >
                <div className={`whitespace-pre-wrap ${isElder ? "elder-stephen-output font-['SF_Pro_Text',_-apple-system,_BlinkMacSystemFont,_'San_Francisco',_'Helvetica_Neue',_Helvetica,_sans-serif] tracking-[0.65px] leading-relaxed" : ""}`}>
                  {msg.text}
                </div>

                {/* Deepen with Prestige button for Velocity responses */}
                {isElder && isVelocity && !msg.id.startsWith('welcome') && (
                  <div className="mt-2.5 pt-2 border-t border-[var(--nb-border)]/60 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDeepenToPrestige(msg.text)}
                      className="text-[11px] font-mono text-[var(--nb-gold)] hover:text-amber-300 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
                      title="Request full 6-section exegesis and Spirit of Prophecy commentary from Elder Stephen"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Deepen with Prestige Commentary</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Timestamp and audio controls */}
              <div className="flex items-center gap-2 mt-1 px-1 select-none">
                <span className="text-[9px] font-mono text-[var(--nb-text-dim)] pb-0.5">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isElder && (
                  <button
                    type="button"
                    onClick={() => speakMessage(msg.id, msg.text)}
                    className="p-1 rounded hover:bg-white/5 text-[var(--nb-text-dim)] hover:text-[var(--nb-teal)] transition-colors cursor-pointer flex items-center justify-center"
                    title={speakingMsgId === msg.id ? "Silence reader" : "Listen aloud"}
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col self-start mr-auto max-w-[85%]" id="elder-chat-loader">
            <div className="px-4 py-3 bg-[var(--nb-card-hover)] border border-[var(--nb-border)] rounded-xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--nb-teal)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--nb-teal)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--nb-teal)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[9px] font-mono text-[var(--nb-text-dim)] mt-1 px-1">Pondering Scriptures...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1 px-3 py-1.5 bg-[var(--nb-sidebar)] border-t border-[var(--nb-border)] select-none shrink-0" id="chat-suggestion-chips">
        <button
          type="button"
          onClick={() => handleChipClick("Show me the prophetic/theological cross references matching this note's study theme.")}
          className="px-2 py-0.5 text-[10px] font-mono rounded bg-stone-900 border border-[var(--nb-border)] text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] hover:border-[var(--nb-border-gold)] transition-colors cursor-pointer"
        >
          📖 Cross Refs
        </button>
        <button
          type="button"
          onClick={() => handleChipClick("Are there any notable Ellen White quotes or visions that shed light on this specific topic?")}
          className="px-2 py-0.5 text-[10px] font-mono rounded bg-stone-900 border border-[var(--nb-border)] text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] hover:border-[var(--nb-border-gold)] transition-colors cursor-pointer"
        >
          🔍 EGW Insights
        </button>
        <button
          type="button"
          onClick={() => handleChipClick("Give me a practical, devotional lesson or outline from this to share in family worship or Sabbath school.")}
          className="px-2 py-0.5 text-[10px] font-mono rounded bg-stone-900 border border-[var(--nb-border)] text-[var(--nb-text-muted)] hover:text-[var(--nb-gold)] hover:border-[var(--nb-border-gold)] transition-colors cursor-pointer"
        >
          💡 Practical Devotion
        </button>
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSendMessage}
        className="p-3 pb-6 md:pb-3 bg-gradient-to-r from-[#071124] via-[#0E1E42] to-[#071124] border-t border-[#D4A346]/60 flex items-end gap-2 shrink-0"
        id="elder-chat-form"
      >
        <button
          type="button"
          onClick={() => toggleDictation((transcript) => setInputText(prev => prev ? `${prev} ${transcript}` : transcript))}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 h-[42px] w-[42px] self-end ${
            isDictating 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse' 
              : 'bg-[#060e1f]/80 border-[#1B2B48] text-neutral-300 hover:text-amber-300 hover:border-[#D4A346]/50'
          }`}
          title={isDictating ? "Stop recording transcript" : "Dictate using voice input"}
          id="elder-chat-mic-btn"
        >
          {isDictating ? <MicOff className="w-4 h-4 text-rose-500 animate-pulse" /> : <Mic className="w-4 h-4" />}
        </button>

        <textarea
          ref={textareaRef}
          id="elder-chat-input"
          rows={2}
          className="elder-stephen-input flex-1 bg-[#060e1f]/90 text-[14px] font-sans text-neutral-200 placeholder-neutral-500 rounded-xl border border-[#1B2B48] py-2.5 px-3 focus:outline-none focus:border-[#D4A346]/70 focus:ring-1 focus:ring-[#D4A346]/40 transition-all resize-none min-h-[48px] h-[48px] max-h-32 overflow-y-auto leading-relaxed text-left"
          placeholder="Speak or type your message to Elder Stephen..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-white hover:bg-[#FAF7F2] disabled:bg-white/80 text-stone-700 hover:text-stone-950 disabled:text-stone-400 font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 h-[46px] w-[46px] shadow-sm self-end disabled:cursor-not-allowed"
          title="Send query"
          id="elder-chat-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

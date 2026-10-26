import React, { useState, useEffect } from 'react'
import { StudyNote, CSMSReview, MasteryQuestion } from '../../types/notebook'
import { useNavigate } from 'react-router-dom'
import { callElderStephen } from '../../lib/callElderStephen'
import { 
  BookOpen, 
  Brain, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  Bookmark, 
  Copy, 
  Check, 
  HelpCircle,
  Award,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Compass,
  FileText
} from 'lucide-react'

interface MasteryReviewProps {
  note: StudyNote
  onClose: () => void
}

interface CornellReview {
  keyPoints: string[]
  summary: string
  reflectionPrompts: string[]
}

// Local high-fidelity fallback reviews for seed notes
const LOCAL_FALLBACK_REVIEWS: Record<string, CSMSReview> = {
  'nb-1': {
    noteId: 'nb-1',
    bigIdea: 'Daniel 8:14 points to Christ entering the final phase of His high-priestly ministry in the heavenly sanctuary, initiating the Investigative Judgment in 1844.',
    recap: [
      'The 2300-day prophecy of Daniel 8:14 is the longest prophetic period in the Bible, terminating on October 22, 1844.',
      'Christ entered the Most Holy Place of the heavenly sanctuary to perform the work of cleansing and judgment, mirroring the earthly Day of Atonement.',
      'The Investigative Judgment reveals to heavenly intelligences who among the dead and living have fallen asleep in Christ and are accounted worthy of resurrection/translation.',
      'The subject of the sanctuary must be clearly understood, as Christ\'s intercession is essential to the plan of salvation.'
    ],
    scriptures: ['Daniel 8:14', 'Hebrews 8:1-2', 'Revelation 14:7', 'Leviticus 16'],
    practicalSteps: [
      'Devote time daily to active scripture study, especially Daniel and Revelation.',
      'Live in conscious awareness of Christ\'s high-priestly advocacy in the heavenly courts.',
      'Acknowledge and claim Jesus as your defense attorney in the daily sanctuary of your heart.'
    ],
    pastoralReflection: 'My brief earthly journey is nested within a massive cosmic drama. When index cards and lists feel too mundane, I look to the high priest ministering on my behalf. He who cleansed the sanctuary can cleanse my life today.',
    masteryQuestions: [
      {
        question: 'Which biblical chapters outline the ritual of the Day of Atonement which serves as the type for the cleansing of the sanctuary?',
        options: [
          'Leviticus 16 & 23',
          'Exodus 20 & 25',
          'Deuteronomy 5 & 18',
          'Genesis 1 & 2'
        ],
        correct: 0,
        explanation: 'Leviticus 16 details the Day of Atonement and the High Priest cleansing the sanctuary, while Leviticus 23 provides the calendar date (10th day of the 7th month).'
      },
      {
        question: 'What event began in the heavenly sanctuary on October 22, 1844?',
        options: [
          'The Crucifixion of Christ',
          'The Ascension of Christ to the Holy Place',
          'The Investigative Judgment in the Most Holy Place',
          'The Great Disappointment on Earth'
        ],
        correct: 2,
        explanation: 'Adventist theology teaches that on October 22, 1844, Jesus moved from the Holy Place to the Most Holy Place of the heavenly sanctuary to begin His final investigative judgment ministry.'
      },
      {
        question: 'According to William Miller\'s early interpretation of Daniel 8:14, what did the "sanctuary" that was to be cleansed represent?',
        options: [
          'The Heavenly Sanctuary',
          'The Earth / the Church',
          'The Temple of Jerusalem',
          'The human body'
        ],
        correct: 1,
        explanation: 'William Miller incorrectly assumed that the sanctuary referred to the Earth or the Church, leading to the expectation that Christ would return to cleanse it with fire of judgment in 1844.'
      }
    ],
    generatedAt: new Date().toISOString()
  },
  'nb-2': {
    noteId: 'nb-2',
    bigIdea: 'The Three Angels\'s Messages of Revelation 14:6-12 represent God\'s final, urgent warning to the world, preparing a people to stand faithful at Christ\'s Second Coming.',
    recap: [
      'The First Angel Proclaims the everlasting gospel, announcing that the hour of God\'s judgment has come, and calling all to worship the Creator.',
      'The Second Angel Warns that Babylon is fallen, signaling the collapse of spiritual institutions that reject scripture for human tradition.',
      'The Third Angel Gives an intense warning against worshiping the beast and receiving its mark, contrasting it with those who keep God\'s commandments.',
      'Revelation 14:12 defines the remnant who successfully heed this warning: "Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus."'
    ],
    scriptures: ['Revelation 14:6-12', 'Revelation 18:4', 'Genesis 2:1-3', 'Exodus 20:8-11'],
    practicalSteps: [
      'Examine church associations and traditions to ensure absolute conformity to Sola Scriptura.',
      'Proclaim the everlasting gospel through personal testimony, literature, and digital study tools.',
      'Integrate keeping the commandments and exercising the faith of Jesus in daily decisions.'
    ],
    pastoralReflection: 'The everlasting gospel is not a threat; it is an invite to safe harbor before the storm. The sanctuary reminds us that mercy still lingers, but the call to Babylon is: "Come out of her, my people."',
    masteryQuestions: [
      {
        question: 'What is the "Everlasting Gospel" declared by the first angel defined as?',
        options: [
          'A new theological discovery in 1844',
          'The same gospel of grace through faith in Christ, proclaimed urgently backdropped by the judgment',
          'A secret doctrine only known to the prophets',
          'The literal tablets of the law kept in Israel'
        ],
        correct: 1,
        explanation: 'The first angel brings the "everlasting" gospel, indicating it is the unchangeable way of salvation (grace through Christ\'s blood) presented with global urgency now that judgment has begun.'
      },
      {
        question: 'What represents the distinguishing characteristic of the saints described in Revelation 14:12?',
        options: [
          'They possess massive wealth and political influence',
          'They speak in unknown charismatic tongues',
          'They keep the commandments of God and have the faith of Jesus',
          'They reside exclusively in Jerusalem'
        ],
        correct: 2,
        explanation: 'Revelation 14:12 explicitly defines the end-time saints: "Here are they that keep the commandments of God, and the faith of Jesus."'
      }
    ],
    generatedAt: new Date().toISOString()
  }
}

type StudyMode = 'Explain Mode' | 'Teach It Mode' | 'STBA Mode' | 'Syllabus Mode' | 'Application Mode'
type MasteryTier = 'Beginner Tier' | 'Scholar Tier' | 'Leader Tier'

const stripHtml = (htmlStr: string): string => {
  if (!htmlStr) return '';
  return htmlStr.replace(/<\/?[^>]+(>|$)/g, "");
};

const formatBigIdea = (text: string): string => {
  if (!text) return '';
  return text.replace(/[_]/g, '').trim();
};

export const MasteryReview: React.FC<MasteryReviewProps> = ({ note, onClose }) => {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState<StudyMode>('STBA Mode')
  const [review, setReview] = useState<CSMSReview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Settings visibility
  const [settingsExpanded, setSettingsExpanded] = useState(true)
  const [activeReviewTab, setActiveReviewTab] = useState<'csms' | 'cornell' | 'leader_tools'>('csms')
  const [cornellReview, setCornellReview] = useState<CornellReview | null>(null)

  // Real-time user tier detection
  const [detectedTier, setDetectedTier] = useState<'basic' | 'scholar' | 'leader'>(() => {
    const raw = localStorage.getItem('stba_user_tier')?.toLowerCase() || 'scholar'
    if (raw.includes('begin') || raw.includes('basic')) return 'basic'
    if (raw.includes('scholar')) return 'scholar'
    if (raw.includes('lead')) return 'leader'
    return 'scholar'
  })

  // Synchronize dynamic tier changes
  const [selectedTier, setSelectedTier] = useState<MasteryTier>(() => {
    const current = localStorage.getItem('stba_user_tier')?.toLowerCase() || 'scholar'
    if (current.includes('begin') || current.includes('basic')) return 'Beginner Tier'
    if (current.includes('lead')) return 'Leader Tier'
    return 'Scholar Tier'
  })

  useEffect(() => {
    const raw = selectedTier.toLowerCase()
    let tierCode: 'basic' | 'scholar' | 'leader' = 'scholar'
    let textRep = "Scholar"

    if (raw.includes('begin') || raw.includes('basic')) {
      tierCode = 'basic'
      textRep = 'Beginner'
    } else if (raw.includes('lead')) {
      tierCode = 'leader'
      textRep = 'Leader'
    }

    setDetectedTier(tierCode)
    localStorage.setItem('stba_user_tier', textRep)
  }, [selectedTier])
  
  // Custom dialog on scripture click
  const [activeScriptureDialog, setActiveScriptureDialog] = useState<string | null>(null)

  // Quiz interactive state managers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}) // qIndex -> optionIndex
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({}) // qIndex -> isChecked
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [elderStephenReviewFeedback, setElderStephenReviewFeedback] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  const reviewKey = `stba_review_v2_${note.id}`

  // On note selection switch: completely reset states
  useEffect(() => {
    setErrorMessage('')
    setQuizSubmitted(false)
    setUserAnswers({})
    setCheckedQuestions({})
    setCurrentQuestionIndex(0)
    setCornellReview(null)
    setActiveReviewTab('csms')
    setElderStephenReviewFeedback('')
    setIsSubmittingReview(false)

    const cached = localStorage.getItem(reviewKey)
    if (cached) {
      try {
        setReview(JSON.parse(cached))
        return
      } catch (e) {
        console.error("Failed to parse cached review:", e)
      }
    }

    // fallback mapping on default seed notes
    const lookupKey = note.id === '11111111-1111-4111-a111-111111111111' ? 'nb-1' :
                     note.id === '22222222-2222-4222-b222-222222222222' ? 'nb-2' :
                     note.id;

    if (LOCAL_FALLBACK_REVIEWS[lookupKey]) {
      setReview(LOCAL_FALLBACK_REVIEWS[lookupKey])
    } else {
      setReview(null)
    }
  }, [note.id, reviewKey])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const addToRecall = (scrip: string) => {
    try {
      const saved = localStorage.getItem("stba_memory_vault_list")
      let list: any[] = []
      if (saved) {
        try {
          list = JSON.parse(saved)
        } catch (e) {
          list = []
        }
      }
      
      const exists = list.some((item: any) => item.reference === scrip)
      if (!exists) {
        const newId = `mv-custom-${Date.now()}`
        const newObj = {
          id: newId,
          reference: scrip,
          text: `Memorization and study of scripture: ${scrip}.`,
          bookChapter: scrip,
          keywords: scrip.toLowerCase().split(/[ :]+/),
          dateAdded: new Date().toLocaleDateString(),
          recallsCount: 0,
          notes: "Imported from active sermon / study note CSMS system.",
          trackLabel: "My Custom Scriptures",
          theologicalContext: "This scripture reference was flagged for systematic active recall during a workbook diagnostic review.",
          relatedWhiteQuote: "Study with prayer and absolute focus, for the truth of God satisfies the soul."
        }
        list.unshift(newObj)
        localStorage.setItem("stba_memory_vault_list", JSON.stringify(list))
      }
      triggerToast("Added to Recall Schedule")
    } catch (err) {
      console.error("Failed to add to recall list:", err)
      triggerToast("Failed to Add to Recall")
    }
  }

  const handleStudyDeeper = (scrip: string) => {
    setActiveScriptureDialog(null)
    // Save to pending search in localStorage so STBA page can automatically trigger the search on load
    localStorage.setItem("stba_pending_search_ref", scrip)
    localStorage.setItem("stba_pending_search_topic", "Scripture Mastery Study")
    navigate('/stba')
  }

  const handleGenerateReview = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setQuizSubmitted(false)
    setUserAnswers({})
    setCheckedQuestions({})
    setCurrentQuestionIndex(0)
    setActiveReviewTab('csms')

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          mode: selectedMode,
          tier: selectedTier
        })
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const data = await response.json()
      
      const mappedReview: CSMSReview = {
        noteId: note.id,
        bigIdea: data.bigIdea || `Prismatic review of ${note.title} under Seventh-day Adventist sanctuary theology.`,
        recap: data.recap || [],
        scriptures: data.scriptures || [],
        practicalSteps: data.application || data.practicalSteps || [],
        pastoralReflection: data.reflectionQuestion || data.pastoralReflection || 'Study context of historical truth reveals divine character and deepens individual sanctification.',
        masteryQuestions: data.masteryQuestions || [],
        generatedAt: new Date().toISOString()
      }

      setReview(mappedReview)
      localStorage.setItem(reviewKey, JSON.stringify(mappedReview))
    } catch (err: any) {
      console.error("CSMS Review generation failed:", err)
      setErrorMessage(`Failed to generate CSMS review sheet: ${err?.message || 'Check connection metadata configuration'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateCornellReview = async () => {
    if (detectedTier === 'basic') {
      setActiveReviewTab('cornell')
      return;
    }

    setIsLoading(true)
    setErrorMessage('')
    setCornellReview(null)
    setActiveReviewTab('cornell')

    const runFallbackCornell = () => {
      setCornellReview({
        keyPoints: [
          "Daniel 8:14 2300-day prophetic trajectory",
          "Transition of Christ's ministry to Most Holy Place",
          "Cleansing of the heavenly sanctuary starting 1844",
          "Individual soul-cleansing accountability",
          "The patience and defining obedience of the saints"
        ],
        summary: `The study of "${note.title}" delineates the theological axis of Seventh-day Adventist historical eschatology. Central to this is Christ's high-priestly advocacy in the heavenly sanctuary, validating the absolute endurance of His covenant. Each believer is invited to stand in conscious awareness of this cosmic judgment hour, aligning their life completely with the unchangeable law of God of Revelation 14:12 through active prayer and personal sanctification.`,
        reflectionPrompts: [
          `How does the reality of a sanctuary judgment restructure your daily schedule priorities?`,
          `What specific earthly compromise needs to be laid upon the altar for cleansing today?`
        ]
      })
    }

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          mode: 'Cornell Synthesis',
          tier: selectedTier
        })
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const data = await response.json()
      
      const mappedCornell: CornellReview = {
        keyPoints: data.keyPoints || data.recap || [
          "Understanding the 2,300 days prophetic cycle.",
          "Investigative Judgment starting October 22, 1844.",
          "The sanctuary truth as the key anchoring doctrine."
        ],
        summary: data.summary || data.bigIdea || `Detailed summary of the study notes on ${note.title} under the scope of Adventist doctrine.`,
        reflectionPrompts: data.reflection || data.reflectionPrompts || data.application || [
          "What is the personal spiritual application of the Day of Atonement for you today?"
        ]
      }

      setCornellReview(mappedCornell)
    } catch (err: any) {
      console.warn("Cornell generation exception. Using offline master fallback:", err)
      runFallbackCornell()
    } finally {
      setIsLoading(false)
    }
  }

  // Quiz option clicking
  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (checkedQuestions[qIdx]) return
    setUserAnswers({
      ...userAnswers,
      [qIdx]: oIdx
    })
  }

  // Answer verification
  const handleCheckAnswer = (qIdx: number) => {
    if (userAnswers[qIdx] === undefined) return
    setCheckedQuestions({
      ...checkedQuestions,
      [qIdx]: true
    })
  }

  const handleNextQuestion = async (totalCount: number) => {
    if (currentQuestionIndex < totalCount - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setQuizSubmitted(true)

      // Calculate score values
      const quizQuestions = review?.masteryQuestions || []
      const correctCount = quizQuestions.filter((q, idx) => userAnswers[idx] === q.correct).length
      const totalCount = quizQuestions.length
      const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

      // Only Scholar and Leader tiers run advanced review pastoral evaluations
      if (detectedTier === 'basic') return;

      setIsSubmittingReview(true)
      try {
        let completedVerses: string[] = []
        try {
          const savedCompleted = localStorage.getItem('stba_completed_verses')
          if (savedCompleted) {
            completedVerses = JSON.parse(savedCompleted)
          }
        } catch (e) {}

        let favoriteScriptures: string[] = []
        try {
          const savedFav = localStorage.getItem('stba_favorite_scriptures')
          if (savedFav) {
            const parsedFav = JSON.parse(savedFav)
            favoriteScriptures = parsedFav.map((s: any) => s.reference || s.text || String(s))
          }
        } catch (e) {}

        const masteryState = {
          completedVersesCount: completedVerses.length,
          totalVersesCount: 28,
          completionRate: completedVerses.length > 0 ? Math.round((completedVerses.length / 28) * 100) : 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          favoriteScriptures
        }

        const payload = {
          currentMode: 'STBA' as const,
          noteTitle: note.title,
          noteContent: note.content,
          contextSummary: `User completed their CSMS Doctrinal Mastery Review Quiz on "${note.title}". Score achieved: ${scorePercent}% (${correctCount}/${totalCount} correct). User Tier is ${detectedTier}.`,
          masteryState,
          userAction: 'csms_review' as const,
          historyLog: [
            {
              role: 'user' as const,
              text: `Elder Stephen, I have completed my active recall study review for the note titled "${note.title}". My final quiz score was ${scorePercent}% with ${correctCount} correct out of ${totalCount} questions.`
            }
          ]
        }

        const res = await callElderStephen(payload)
        if (res && res.text) {
          setElderStephenReviewFeedback(res.text)
        }
      } catch (err) {
        console.error("Failed to fetch custom CSMS pastoral review from Elder Stephen:", err)
      } finally {
        setIsSubmittingReview(false)
      }
    }
  }

  const handleResetQuiz = () => {
    setUserAnswers({})
    setCheckedQuestions({})
    setQuizSubmitted(false)
    setCurrentQuestionIndex(0)
    setElderStephenReviewFeedback('')
    setIsSubmittingReview(false)
  }

  // Feedback evaluations based on final score
  const quizQuestions = review?.masteryQuestions || []
  const correctCount = quizQuestions.filter((q, idx) => userAnswers[idx] === q.correct).length
  const totalCount = quizQuestions.length
  const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  const getElderFeedback = (score: number) => {
    if (score >= 80) {
      return "Superb work, my friend! You have shown yourself approved in this doctrine. 'Take heed unto thyself, and unto the doctrine; continue in them.'"
    }
    if (score >= 60) {
      return "Well done, traveler of truth. Some aspects of this doctrine need closer scripture examination. 'Study to shew thyself approved unto God.'"
    }
    return "Do not be discouraged, my brother. Truth is mined like gold. Let us return to Daniel and the prophets, line upon line. Let us try again."
  }

  return (
    <div className="flex flex-col h-full bg-[#080808] text-gray-200 select-text border-l border-white/5 relative" id="csms-drawer-container">
      {/* Header bar */}
      <div className="p-4 bg-[#121414] border-b border-white/5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#C5A059]" />
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              CSMS Review Engine
            </span>
            <span className="text-[10px] text-gray-500 font-sans">Active Discipleship Coach</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 px-2.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs border border-white/5 cursor-pointer font-mono"
        >
          Close Drawer
        </button>
      </div>

      {/* Configuration Selectors block (Collapsible) */}
      <div className="p-4 bg-[#121414] border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between py-1 border-b border-white/5 pb-2">
          <button
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-[#C5A059] uppercase cursor-pointer hover:opacity-80 select-none"
            id="study-settings-toggle"
          >
            <span>Study Settings</span>
            <ChevronDown 
              className={`w-3.5 h-3.5 text-[#C5A059] transition-transform duration-300 ${
                settingsExpanded ? 'rotate-180' : 'rotate-0'
              }`} 
            />
          </button>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wide bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded">
            {detectedTier} TIER
          </span>
        </div>

        {/* Parent Container (Study Settings + Action Buttons) */}
        {settingsExpanded && (
          <div className="pt-3 space-y-4 animate-fade-in" id="collapsible-settings-panel">
            {/* Study Mode Selector */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-gray-400 uppercase block">
                1. Select Study Mode
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['Explain Mode', 'Teach It Mode', 'STBA Mode', 'Syllabus Mode', 'Application Mode'] as StudyMode[]).map((mode) => {
                  const active = selectedMode === mode
                  return (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-all cursor-pointer select-none ${
                        active
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm shadow-teal-500/5 font-semibold'
                          : 'bg-[#1e2020] text-gray-400 hover:text-white border-white/5'
                      }`}
                    >
                      {mode}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mastery Tier Selector */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-mono font-bold tracking-wider text-gray-400 uppercase block">
                2. Choose Discipleship Level
              </span>
              <div className="flex gap-2">
                {(['Beginner Tier', 'Scholar Tier', 'Leader Tier'] as MasteryTier[]).map((tier) => {
                  const active = selectedTier === tier
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`flex-1 px-2.5 py-1.5 rounded text-[11px] font-sans font-medium border text-center transition-all cursor-pointer select-none ${
                        active
                          ? 'bg-[#ffe16d]/20 text-[#ffe16d] border-[#ffe16d]/40 font-semibold'
                          : 'bg-[#1e2020] text-gray-400 hover:text-white border-white/5'
                      }`}
                    >
                      {tier.replace(' Tier', '')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action generation buttons inside the same container */}
            <div className="pt-2 space-y-2 border-t border-white/5">
              <button
                onClick={handleGenerateReview}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#C5A059] hover:bg-[#b08c4a] text-black font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none shadow"
              >
                {isLoading && activeReviewTab === 'csms' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Consolidate & Generate Review
              </button>
              
              <button
                onClick={handleGenerateCornellReview}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none shadow"
                id="btn-cornell-synthesis"
              >
                {isLoading && activeReviewTab === 'cornell' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
                Lesson Review (Cornell Synthesis)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick tab toggle when both are ready or needed */}
      {review && (
        <div className="px-4 py-2 border-b border-white/5 flex gap-2 shrink-0 select-none bg-stone-950/20">
          <button
            onClick={() => setActiveReviewTab('csms')}
            className={`flex-grow text-[10px] font-mono py-1 rounded text-center transition-all cursor-pointer ${
              activeReviewTab === 'csms' ? 'bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            CSMS Review
          </button>
          <button
            onClick={() => {
              setActiveReviewTab('cornell')
              if (detectedTier !== 'basic' && !cornellReview) {
                handleGenerateCornellReview()
              }
            }}
            className={`flex-grow text-[10px] font-mono py-1 rounded text-center transition-all cursor-pointer ${
              activeReviewTab === 'cornell' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 font-bold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {detectedTier === 'basic' ? '🔒 Cornell Review' : 'Cornell Outline'}
          </button>
          {detectedTier === 'leader' && (
            <button
              onClick={() => setActiveReviewTab('leader_tools')}
              className={`flex-grow text-[10px] font-mono py-1 rounded text-center transition-all cursor-pointer ${
                activeReviewTab === 'leader_tools' ? 'bg-amber-500/20 text-[#ffe16d] border border-amber-500/30 font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              👑 Leader Tools
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {isLoading ? (
          /* High-Fidelity Skeletons */
          <div className="space-y-5 py-4 animate-pulse" id="loading-skeleton">
            <div className="text-center py-5 space-y-2">
              <RefreshCw className="w-7 h-7 text-[#C5A059] animate-spin mx-auto opacity-70" />
              <p className="text-xs font-mono text-gray-400 font-semibold uppercase tracking-wider">
                Analyzing Note & Aligning Scriptures …
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-16 bg-[#121414] border border-white/5 rounded-lg p-3 space-y-2">
                <div className="h-2 w-12 bg-[#C5A059]/30 rounded"></div>
                <div className="h-3 w-5/6 bg-white/5 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-20 bg-white/10 rounded"></div>
                <div className="h-2.5 w-full bg-white/5 rounded"></div>
                <div className="h-2.5 w-11/12 bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        ) : errorMessage ? (
          /* Error block */
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono space-y-3" id="error-card">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
            <button
              onClick={activeReviewTab === 'csms' ? handleGenerateReview : handleGenerateCornellReview}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded text-rose-200 border border-rose-500/30 font-mono transition-all cursor-pointer"
            >
              Retry Generation
            </button>
          </div>
        ) : activeReviewTab === 'cornell' ? (
          /* Tier-Based Conditional: Locked state for basic level */
          detectedTier === 'basic' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-5 animate-fade-in" id="locked-cornell-state">
              <div className="w-12 h-12 rounded-full bg-red-500/5 border border-red-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
              <div className="max-w-xs space-y-2">
                <h4 className="text-sm font-semibold text-gray-100">Cornell Review Unprepared</h4>
                <p className="text-[11.5px] text-gray-400 leading-relaxed font-sans">
                  Detailed architectural Cornell Outlines and practical sermon/lesson worksheets are reserved for <strong>Scholar</strong> and <strong>Leader</strong> discipleship tiers.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[var(--nb-text-muted)] select-none">
                Current Level: <span className="text-amber-500 font-bold uppercase">Basic</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('Scholar Tier');
                  triggerToast("Discipleship level upgraded to Scholar!");
                }}
                className="px-4 py-2 rounded-md bg-[#ffe16d]/10 hover:bg-[#ffe16d]/20 text-xs text-[#ffe16d] border border-[#ffe16d]/30 font-mono transition-all cursor-pointer"
              >
                Upgrade to Scholar (Free)
              </button>
            </div>
          ) : !cornellReview ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4" id="empty-cornell-state">
              <div className="w-12 h-12 rounded-full bg-[#121414] border border-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-teal-400 animate-pulse" />
              </div>
              <div className="max-w-xs space-y-1.5">
                <h4 className="text-sm font-semibold text-gray-100">Cornell Review Ready</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Synthesize this note's concepts into a high-utility Cornell lecture outline with key cues and reflections.
                </p>
              </div>
              <button
                onClick={handleGenerateCornellReview}
                className="px-4 py-2 rounded-md bg-[#1e2020] hover:bg-white/5 text-xs text-teal-400 hover:text-teal-300 border border-teal-500/10 font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Generate Cornell Synthesis
              </button>
            </div>
          ) : (
            /* CORNELL STYLE OUTLINE SHEET */
            <div className="space-y-6 pt-2 animate-fade-in" id="cornell-synthesis-sheet">
              <div className="border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block select-none">
                  Cornell Lesson Outline
                </span>
              </div>

              <div className="flex flex-col space-y-4 border-b border-white/5 pb-6 bg-transparent">
                {/* Cues & Key Points Block */}
                <div className="border-l-2 border-[#C5A059] pl-3 space-y-3">
                  <h4 className="font-sans font-semibold text-[12.5px] uppercase tracking-wider select-none text-[#C5A059]">
                    Cues & Key Points
                  </h4>
                  <ul className="space-y-3">
                    {cornellReview.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[13.5px] font-sans font-normal tracking-normal text-gray-300 leading-normal">
                        <span className="text-[#C5A059] font-extrabold select-none">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Synthesized Summary Block */}
                <div className="border-l-2 border-teal-500 pl-3 space-y-3 mt-[16px]">
                  <h4 className="font-sans font-semibold text-[13.5px] uppercase tracking-wider select-none text-teal-400">
                    Synthesized Summary
                  </h4>
                  <p className="font-sans font-medium text-[14px] leading-[1.65] tracking-normal text-gray-200">
                    {stripHtml(cornellReview.summary).replace(/[_]/g, '').trim()}
                  </p>
                </div>
              </div>

              {/* Bottom Section (Reflection prompts) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-sans font-semibold text-[13.5px] uppercase tracking-wider select-none text-[#ffe16d]">
                  Reflection Prompts
                </h4>
                <ul className="space-y-2.5 pl-1">
                  {cornellReview.reflectionPrompts.map((p, idx) => (
                    <li key={idx} className="flex gap-2.5 font-sans font-normal text-[14px] leading-[1.65] text-gray-200 tracking-normal">
                      <span className="text-teal-400 select-none font-semibold">{idx + 1}.</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        ) : activeReviewTab === 'leader_tools' && detectedTier === 'leader' ? (
          /* Advanced Leader Tier tools */
          <div className="space-y-6 pt-2 animate-fade-in" id="leader-tools-panel">
            <div className="border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block select-none">
                Advanced Leader Tools
              </span>
            </div>
            
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 ">
                <Compass className="w-4 h-4 text-[#ffe16d]" />
                <h4 className="text-[#ffe16d] text-xs font-bold uppercase tracking-wider font-sans">Sabbath School Dialogue Architect</h4>
              </div>
              <p className="text-[11.5px] text-gray-300 leading-relaxed font-sans">
                As a spiritual director, transform this note on "${note.title}" into a structured dialogue outline for your study class.
              </p>
              <pre className="text-[10.5px] font-mono text-gray-400 bg-black/40 p-2.5 rounded border border-white/5 leading-relaxed whitespace-pre-wrap max-h-[180px] overflow-y-auto scrollbar-thin">
{`--- DISCUSSION BLUEPRINT ---
Topic: ${note.title}
Key Passage: ${review?.scriptures?.[0] || 'Daniel 8:14'}

1. OPENING FOCUS (5 mins)
- Read aloud standard translation. Why does this text hold historic weight today?

2. TEXTUAL DECONSTRUCTION (15 mins)
- Line-upon-line study: Compare and contrast cross-references.
- Discuss: What does this reveal about God's role as Judge?

3. PRACTICAL SHEPHERDING (10 mins)
- Transition: How does the cleansing of the sanctuary impact our daily work ethic?
- Challenge: Write down one habit to submit for spiritual renewal.

4. CONCLUDING APPEAL (5 mins)
- Reaffirm our calling and commitment to the Three Angels' Messages.`}
              </pre>
            </div>
            
            <div className="p-3.5 bg-teal-500/5 border border-teal-500/10 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-300" />
                <h4 className="text-teal-400 text-xs font-bold uppercase tracking-wider font-sans">Leader Homiletics Prompter</h4>
              </div>
              <p className="text-[11.5px] text-gray-300 leading-relaxed font-sans">
                Sermon framework prompts to construct a clean study series around this theological truth:
              </p>
              <ul className="space-y-4 text-[11.5px] text-gray-400">
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-[#ffe16d] font-bold select-none">•</span>
                  <span><strong>The Anchor Passage:</strong> Contrast the type of earthly tabernacle with the heavenly reality.</span>
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-[#ffe16d] font-bold select-none">•</span>
                  <span><strong>The Modern Dilemma:</strong> Proclaim how modern anxiety is resolved by Christ as our advocate.</span>
                </li>
                <li className="flex items-start gap-1.5 leading-normal">
                  <span className="text-[#ffe16d] font-bold select-none">•</span>
                  <span><strong>The Call to Action:</strong> Encourage keeping the commandments of God and the faith of Jesus.</span>
                </li>
              </ul>
            </div>
          </div>
        ) : !review ? (
          /* Pre-generated standard call to action */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4" id="empty-state">
            <div className="w-12 h-12 rounded-full bg-[#121414] border border-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-gray-500 animate-pulse" />
            </div>
            <div className="max-w-xs space-y-1.5">
              <h4 className="text-sm font-semibold text-gray-100">Review Sheet Unprepared</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Unlock structural summaries, scripture correlations, and customized retention assessments tailored to this note by running the CSMS Engine above.
              </p>
            </div>
            <button
              onClick={handleGenerateReview}
              className="px-4 py-2 rounded-md bg-[#1e2020] hover:bg-white/5 text-xs text-gray-300 hover:text-white border border-white/5 font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              Start Diagnostic Run
            </button>
          </div>
        ) : (
          /* Generated CSMS Review Feed */
          <div className="space-y-6 animate-fade-in" id="csms-ready-sheet">
            
            {/* 1. BIG IDEA */}
            <div className="bg-teal-500/5 border border-teal-500/10 p-3.5 rounded-lg space-y-1" id="review-big-idea">
              <span className="text-[9px] font-mono font-bold text-[#C5A059] uppercase tracking-wider block select-none">
                Big Idea
              </span>
              <p className="text-[14px] font-semibold text-[#C5A059] leading-relaxed font-sans tracking-normal">
                {formatBigIdea(review.bigIdea)}
              </p>
            </div>

            {/* 2. PRINCIPAL POINTS */}
            <div className="space-y-2 pt-1" id="review-principal-points">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block select-none">
                Principal Points
              </span>
              <ul className="space-y-3">
                {review.recap.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-300 font-normal tracking-normal">
                    <Star className="w-3.5 h-3.5 text-[#ffe16d] shrink-0 mt-0.5 select-none" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. DOCTRINAL SCRIPTURES */}
            {review.scriptures && review.scriptures.length > 0 && (
              <div className="space-y-2 border-t border-white/5 pt-4" id="review-scriptures">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block select-none">
                  Doctrinal Scriptures
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {review.scriptures.map((scrip) => {
                    return (
                      <button
                        key={scrip}
                        onClick={() => setActiveScriptureDialog(scrip)}
                        title="Click to interact with scripture"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-teal-500/10 border border-teal-500/20 text-teal-300 hover:bg-teal-500/20 hover:border-teal-500/40 hover:text-white transition-all cursor-pointer group select-none"
                      >
                        <Bookmark className="w-3 h-3 text-teal-400 group-hover:scale-110 transition-transform" />
                        <span>{scrip}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 4. PRACTICAL APPLICATION */}
            {review.practicalSteps && review.practicalSteps.length > 0 && (
              <div className="space-y-3 border-t border-white/5 pt-4" id="review-practical-steps">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block select-none">
                  Practical Application
                </span>
                <ul className="space-y-3 pl-1">
                  {review.practicalSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed py-0.5 font-normal tracking-normal">
                      <span className="text-[#ffe16d] text-[13px] leading-none select-none">&#8226;</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. PERSONAL REFLECTION */}
            <div className="bg-[#121414] border-l-4 border-[#C5A059] p-3.5 rounded-r-lg space-y-1.5" id="review-pastoral-reflection">
              <span className="font-sans font-semibold text-[13px] text-[#C5A059] uppercase tracking-wider block select-none">
                Personal Reflection
              </span>
              <p className="font-sans font-normal text-[14px] leading-[1.65] tracking-normal text-gray-300">
                {review.pastoralReflection}
              </p>
            </div>

            {/* 6. ACTIVE RECALL QUIZ */}
            <div className="border-t border-white/5 pt-4 space-y-4" id="review-active-quiz">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 select-none">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  Active Recall Quiz
                </span>
                {quizQuestions.length > 0 && !quizSubmitted && (
                  <span className="text-[10px] font-mono text-gray-500 bg-[#121414] px-2 py-0.5 rounded border border-white/5">
                    Q {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                )}
              </div>

              {quizQuestions.length === 0 ? (
                <p className="text-xs text-gray-500 font-mono font-normal tracking-normal text-center py-4">
                  No evaluation questions available.
                </p>
              ) : !quizSubmitted ? (
                /* INLINE QUEUED QUESTION STEPS */
                <div className="space-y-4" id="quiz-interactive-run">
                  {/* Question Prompt Card */}
                  <div className="p-3 bg-[#121414] border border-white/5 rounded-md">
                    <span className="text-[9px] font-mono uppercase bg-[#1e2020] font-semibold text-gray-400 px-1.5 py-0.5 rounded mr-2 inline-block select-none border border-white/5">
                      Q#{currentQuestionIndex + 1}
                    </span>
                    <p className="text-xs font-semibold leading-relaxed text-gray-100 inline">
                      {quizQuestions[currentQuestionIndex].question}
                    </p>
                  </div>

                  {/* Options Stack */}
                  <div className="space-y-2">
                    {quizQuestions[currentQuestionIndex].options.map((option, oIdx) => {
                      const isChosen = userAnswers[currentQuestionIndex] === oIdx
                      const isCh = checkedQuestions[currentQuestionIndex]
                      const isCorrectOpt = quizQuestions[currentQuestionIndex].correct === oIdx

                      let cardStyle = 'border-white/5 bg-[#121414] text-gray-300 hover:bg-white/5'
                      let indexCircle = 'bg-stone-950 border-white/5 text-gray-400'

                      if (isCh) {
                        if (isCorrectOpt) {
                          cardStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-semibold shadow-inner'
                          indexCircle = 'bg-emerald-500 text-black font-extrabold border-emerald-500/20'
                        } else if (isChosen) {
                          cardStyle = 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold'
                          indexCircle = 'bg-rose-500 text-white font-extrabold border-rose-500/20'
                        } else {
                          cardStyle = 'border-white/5 bg-[#0c0d0d] text-gray-500 opacity-55'
                        }
                      } else if (isChosen) {
                        cardStyle = 'bg-[#ffe16d]/10 border-[#ffe16d] text-[#ffe16d] font-semibold'
                        indexCircle = 'bg-[#ffe16d] text-stone-950 font-extrabold border-[#ffe16d]/20'
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isCh}
                          onClick={() => handleSelectOption(currentQuestionIndex, oIdx)}
                          className={`w-full text-left p-3 text-xs leading-relaxed rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${cardStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold select-none border shrink-0 transition-colors ${indexCircle}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="pt-0.5">{option}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Checking / Submit Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <button
                      onClick={handleResetQuiz}
                      className="text-[10px] font-mono text-gray-500 hover:text-[#C5A059] hover:underline cursor-pointer bg-transparent border-0 select-none font-normal tracking-normal"
                    >
                      Reset All Progress
                    </button>

                    <div className="flex items-center gap-2">
                      {!checkedQuestions[currentQuestionIndex] ? (
                        <button
                          onClick={() => handleCheckAnswer(currentQuestionIndex)}
                          disabled={userAnswers[currentQuestionIndex] === undefined}
                          className="px-4 py-1.5 bg-[#C5A059] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b08c4a] text-black font-semibold text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer select-none"
                        >
                          Check Answer
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNextQuestion(quizQuestions.length)}
                          className="px-4 py-1.5 bg-[#C5A059] text-black font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-[#b08c4a] transition-all cursor-pointer flex items-center gap-1 select-none"
                        >
                          <span>{currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Single Question Explanation Banner */}
                  {checkedQuestions[currentQuestionIndex] && (
                    <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-lg text-xs leading-relaxed space-y-1 mt-2 font-sans animate-fade-in font-normal tracking-normal animate-fade-in">
                      <div className="flex items-center gap-1.5 text-[#C5A059] font-mono text-[9px] font-bold uppercase select-none">
                        <CheckCircle className="w-3 h-3 text-teal-400" />
                        <span>Theological Rationale</span>
                      </div>
                      <p className="text-gray-300">
                        {quizQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* QUIZ COMPLETED REPORT SHEET */
                <div className="space-y-5 animate-fade-in" id="quiz-results-view">
                  <div className="p-4 bg-[#121414] rounded-lg border border-white/5 space-y-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-mono ${
                        scorePercent >= 80 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                          : scorePercent >= 60 
                            ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#C5A059]' 
                            : 'border-rose-500 bg-rose-500/10 text-rose-400'
                      }`}>
                        <span className="text-base font-bold leading-none">{scorePercent}%</span>
                        <span className="text-[7px] font-sans uppercase font-bold tracking-wider pt-0.5">SCORE</span>
                      </div>
                    </div>

                    <div className="space-y-1 px-2">
                      <span className="text-[9px] font-mono text-[#C5A059] uppercase tracking-wider block select-none">
                        PASTORAL FEEDBACK
                      </span>
                      {isSubmittingReview ? (
                        <div className="flex items-center justify-center gap-2 py-3">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-pulse">
                            Evaluating recall metrics...
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11.5px] text-gray-300 leading-relaxed font-sans font-normal tracking-normal italic">
                          &ldquo;{detectedTier === 'basic' ? getElderFeedback(scorePercent) : (elderStephenReviewFeedback || getElderFeedback(scorePercent))}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary of questions list */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block select-none">
                      Question Summary
                    </span>
                    {quizQuestions.map((q, idx) => {
                      const ans = userAnswers[idx]
                      const corr = q.correct === ans
                      return (
                        <div key={idx} className="p-3 bg-stone-900/40 rounded-lg border border-white/5 space-y-2 font-normal tracking-normal">
                          <div className="flex items-start gap-1.5 text-xs">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold select-none mt-0.5 ${
                              corr ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}>
                              {idx + 1}
                            </span>
                            <p className="font-semibold text-gray-200">
                              {q.question}
                            </p>
                          </div>
                          <div className="text-[11px] text-gray-400 pl-5 leading-normal">
                            <span className="text-gray-500 select-none">Your Selection: </span> 
                            <span className={corr ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                              {String.fromCharCode(65 + (ans !== undefined ? ans : 0))}. {q.options[ans !== undefined ? ans : 0]}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2.5 pt-2 select-none">
                    <button
                      onClick={handleResetQuiz}
                      className="flex-1 py-2 bg-[#121414] hover:bg-white/5 text-xs text-gray-300 font-mono uppercase tracking-wider border border-white/10 rounded transition-colors cursor-pointer text-center"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={handleGenerateReview}
                      className="flex-1 py-2 bg-[#C5A059] hover:bg-[#b08c4a] text-xs text-black font-mono uppercase font-extrabold tracking-wider rounded transition-all cursor-pointer text-center"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* SCRIPTURE INTERACTIVE CHOICE MODAL */}
      {activeScriptureDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none animate-fade-in" id="scripture-action-modal">
          <div className="w-full max-w-sm bg-[#121414] border border-white/5 rounded-lg p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
                  Scripture Options
                </h3>
              </div>
              <p className="text-sm font-semibold text-gray-100">
                &ldquo;{activeScriptureDialog}&rdquo;
              </p>
            </div>

            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              What would you like to do with this scripture?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  addToRecall(activeScriptureDialog)
                  setActiveScriptureDialog(null)
                }}
                className="w-full py-2 bg-[#C5A059] hover:bg-[#b08c4a] text-black font-semibold text-xs font-sans rounded-md transition-colors cursor-pointer select-none"
              >
                Add to Recall
              </button>
              <button
                onClick={() => handleStudyDeeper(activeScriptureDialog)}
                className="w-full py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-semibold text-xs font-sans rounded-md transition-all cursor-pointer select-none"
              >
                Study Deeper
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeScriptureDialog)
                  triggerToast("Copied scripture tagline")
                  setActiveScriptureDialog(null)
                }}
                className="w-full py-2 bg-[#1e2020] hover:bg-white/5 text-gray-300 font-medium text-xs font-sans rounded-md transition-all cursor-pointer select-none"
              >
                Copy Reference
              </button>
              <button
                onClick={() => setActiveScriptureDialog(null)}
                className="w-full py-2 bg-stone-900 hover:bg-white/5 text-gray-500 hover:text-white font-medium text-xs font-sans rounded-md transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floated Toast Alerts */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#121414] border border-teal-500/30 text-teal-300 text-xs font-mono px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-bounce select-none">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

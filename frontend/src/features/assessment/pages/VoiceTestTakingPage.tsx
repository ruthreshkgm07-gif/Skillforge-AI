import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { assessmentApi } from '../services/assessmentApi';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  BookOpen,
  RotateCcw,
  Sliders,
  Check,
  X,
  Award,
} from 'lucide-react';

interface TurnItem {
  speaker: 'AI' | 'STUDENT';
  text: string;
  timestamp?: string;
  accuracy?: number;
}

export const VoiceTestTakingPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode & Session State
  const [selectedMode, setSelectedMode] = useState<'INTERVIEW' | 'SENTENCE_REPEATING' | 'NORMAL_SPEAKING' | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [maxTurns, setMaxTurns] = useState<number>(5);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<TurnItem[]>([]);

  // Sentence Repeating specific state
  const [sentenceCount, setSentenceCount] = useState<number>(5);
  const [targetSentence, setTargetSentence] = useState<string>('');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [totalSentences, setTotalSentences] = useState<number>(5);
  const [lastTurnAccuracy, setLastTurnAccuracy] = useState<number | null>(null);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [missedWords, setMissedWords] = useState<string[]>([]);

  // Speech & UI State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);
  const [spokenInput, setSpokenInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [autoReadTts, setAutoReadTts] = useState<boolean>(true);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setSpokenInput(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll transcript to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Vocalize text using Web Speech Synthesis
  const speakText = (text: string) => {
    if (!window.speechSynthesis || !autoReadTts) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setSpokenInput('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const CLIENT_SENTENCE_BANK = [
    "Software engineering requires both logical problem solving and effective team communication.",
    "The microservices architecture enables independent scaling and resilient service deployments.",
    "Continuous integration pipelines automatically build, test, and validate every code commit.",
    "Asynchronous processing improves system throughput by delegating heavy tasks to background workers.",
    "Relational databases use primary keys and foreign keys to maintain strict data integrity.",
    "Object-oriented programming utilizes encapsulation, inheritance, polymorphism, and abstraction.",
    "A balanced binary search tree guarantees logarithmic time complexity for insertions and searches.",
    "Stateless authentication using JSON Web Tokens simplifies horizontal scaling across server clusters.",
    "Cloud computing allows developers to deploy scalable distributed applications with high availability.",
    "Effective code reviews identify potential edge cases and promote best practices across the team.",
    "RESTful API design follows standard HTTP methods to perform operations on structured resources.",
    "Responsive web design ensures that user interfaces render smoothly across mobile and desktop devices.",
    "Cache invalidation and naming conventions are two of the most critical challenges in computer science.",
    "Automated unit tests prevent regressions and give developers confidence during refactoring.",
    "Event-driven architectures decouple producers from consumers using distributed message queues.",
  ];

  const evaluateClientSentenceAccuracy = (target: string, spoken: string) => {
    const cleanTarget = target.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
    const cleanSpoken = spoken.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();

    const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
    const spokenWords = new Set(cleanSpoken.split(/\s+/).filter(Boolean));

    const matched: string[] = [];
    const missed: string[] = [];

    targetWords.forEach((w) => {
      if (spokenWords.has(w)) {
        matched.push(w);
      } else {
        missed.push(w);
      }
    });

    const accuracy = targetWords.length > 0 ? Math.round(((matched.length / targetWords.length) * 100) * 10) / 10 : 0;
    return { accuracy, matchedWords: matched, missedWords: missed };
  };

  const handleStartSession = async (mode: 'INTERVIEW' | 'SENTENCE_REPEATING' | 'NORMAL_SPEAKING') => {
    setIsLoading(true);
    setSelectedMode(mode);
    try {
      const res = await assessmentApi.startVoiceSession(mode, undefined, sentenceCount);
      setAttemptId(res.attemptId);
      setMaxTurns(res.totalMaxTurns || (mode === 'SENTENCE_REPEATING' ? sentenceCount : 5));
      setCurrentTurn(1);

      if (mode === 'SENTENCE_REPEATING') {
        setTargetSentence(res.targetSentence || res.initialAiQuestion);
        setCurrentSentenceIndex(res.currentSentenceIndex || 0);
        setTotalSentences(res.totalSentences || sentenceCount);
      }

      const initialAiTurn: TurnItem = {
        speaker: 'AI',
        text: res.initialAiQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscript([initialAiTurn]);
      speakText(res.initialAiQuestion);
    } catch (err) {
      console.warn('Backend session start fallback to client engine:', err);
      const randomAttempt = `attempt_${Date.now()}`;
      setAttemptId(randomAttempt);
      setMaxTurns(mode === 'SENTENCE_REPEATING' ? sentenceCount : 5);
      setCurrentTurn(1);

      let initialPrompt = 'Hello! Welcome to your voice assessment.';
      if (mode === 'SENTENCE_REPEATING') {
        const pool = [...CLIENT_SENTENCE_BANK].sort(() => 0.5 - Math.random());
        const selected = pool.slice(0, Math.min(sentenceCount, pool.length));
        initialPrompt = selected[0] || CLIENT_SENTENCE_BANK[0];
        setTargetSentence(initialPrompt);
        setCurrentSentenceIndex(0);
        setTotalSentences(selected.length);
      } else if (mode === 'NORMAL_SPEAKING') {
        initialPrompt = 'Welcome to Spoken Fluency Practice. Please introduce yourself and discuss your favorite software engineering project.';
      } else {
        initialPrompt = 'Hello! I am your AI Technical Interviewer. Could you introduce yourself and tell me about your programming background?';
      }

      const initialAiTurn: TurnItem = {
        speaker: 'AI',
        text: initialPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscript([initialAiTurn]);
      speakText(initialPrompt);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!attemptId || !spokenInput.trim()) return;

    const studentText = spokenInput.trim();
    stopListening();
    setSpokenInput('');
    setIsLoading(true);

    const userTurn: TurnItem = {
      speaker: 'STUDENT',
      text: studentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTranscript((prev) => [...prev, userTurn]);

    try {
      const res = await assessmentApi.processVoiceTurn(attemptId, studentText, currentSentenceIndex);

      if (selectedMode === 'SENTENCE_REPEATING') {
        setLastTurnAccuracy(res.sentenceAccuracy !== undefined ? res.sentenceAccuracy : null);
        setMatchedWords(res.matchedWords || []);
        setMissedWords(res.missedWords || []);
        setTargetSentence(res.aiQuestion);
        setCurrentSentenceIndex(res.currentSentenceIndex || 0);
        setTotalSentences(res.totalSentences || sentenceCount);
      }

      setCurrentTurn(res.currentTurn + 1);
      setIsFinished(res.isFinished);

      const aiTurn: TurnItem = {
        speaker: 'AI',
        text: res.aiQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        accuracy: res.sentenceAccuracy,
      };
      setTranscript((prev) => [...prev, aiTurn]);
      speakText(res.aiQuestion);
    } catch (err) {
      console.warn('Backend turn fallback to client engine:', err);
      if (selectedMode === 'SENTENCE_REPEATING') {
        const matchResult = evaluateClientSentenceAccuracy(targetSentence, studentText);
        setLastTurnAccuracy(matchResult.accuracy);
        setMatchedWords(matchResult.matchedWords);
        setMissedWords(matchResult.missedWords);

        const nextIdx = currentSentenceIndex + 1;
        const isLast = nextIdx >= totalSentences;
        setIsFinished(isLast);
        setCurrentSentenceIndex(nextIdx);

        const nextPrompt = isLast
          ? `Excellent! You have completed all ${totalSentences} sentences. Your speech assessment report is ready.`
          : CLIENT_SENTENCE_BANK[nextIdx % CLIENT_SENTENCE_BANK.length];

        setTargetSentence(nextPrompt);

        const aiTurn: TurnItem = {
          speaker: 'AI',
          text: nextPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          accuracy: matchResult.accuracy,
        };
        setTranscript((prev) => [...prev, aiTurn]);
        speakText(nextPrompt);
      } else {
        const aiTurn: TurnItem = {
          speaker: 'AI',
          text: 'Thank you for your detailed response! Could you elaborate on the core trade-offs of that approach?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setTranscript((prev) => [...prev, aiTurn]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSession = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);
    try {
      await assessmentApi.submitVoiceSession(attemptId);
      navigate(`/student/assessment/report/${attemptId}`);
    } catch (err) {
      navigate('/student/assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-Session Mode Selection View
  if (!selectedMode) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-8 px-4 font-sans">
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-primary animate-pulse" /> Voice AI Speech Assessment
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Voice Communication & Speech Evaluation
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Choose your practice module: repeat reference sentences to assess spoken accuracy, or engage with an AI interviewer.
          </p>
        </div>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Mode 1: Sentence Repeating Practice */}
          <Card
            className="relative cursor-pointer border-2 border-primary/40 hover:border-primary transition-all duration-300 hover:shadow-xl group flex flex-col justify-between bg-gradient-to-b from-primary/5 via-card to-card"
            onClick={() => handleStartSession('SENTENCE_REPEATING')}
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <Badge className="bg-primary text-primary-foreground font-bold text-[11px]">
                  NEW EXERCISE
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">Sentence Repeating</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Read given sentences aloud. System evaluates your word accuracy, phonetic pronunciation, and spoken clarity in real time.
              </CardDescription>

              {/* Sentence Count Selector */}
              <div
                className="pt-3 space-y-2 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 text-foreground">
                    <Sliders className="h-3.5 w-3.5 text-primary" /> Practice Count:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSentenceCount((prev) => Math.max(1, prev - 1))}
                      className="h-5 w-5 rounded bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-primary font-bold px-1">{sentenceCount} Sentences</span>
                    <button
                      type="button"
                      onClick={() => setSentenceCount((prev) => Math.min(20, prev + 1))}
                      className="h-5 w-5 rounded bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[3, 5, 8, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setSentenceCount(cnt)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        sentenceCount === cnt
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background text-muted-foreground hover:bg-muted border-border'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="gradient" className="w-full justify-between font-bold shadow-md">
                Start Sentence Practice ({sentenceCount} Sentences) <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Mode 2: Technical Interview */}
          <Card
            className="relative cursor-pointer border-2 hover:border-accent transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
            onClick={() => handleStartSession('INTERVIEW')}
          >
            <CardHeader className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">AI Technical Interview</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Turn-by-turn technical conversation evaluating architectural reasoning, clarity, and domain mastery.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full justify-between group-hover:bg-accent/10">
                Start Interview <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Mode 3: Spoken Fluency */}
          <Card
            className="relative cursor-pointer border-2 hover:border-success transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
            onClick={() => handleStartSession('NORMAL_SPEAKING')}
          >
            <CardHeader className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Spoken Fluency</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Free-form verbal practice describing engineering projects, background, and career goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full justify-between group-hover:bg-success/10">
                Start Speaking <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Active Voice Assessment Session View
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 font-sans">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Radio className="h-5 w-5 animate-pulse text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground capitalize flex items-center gap-2">
              Voice AI: {selectedMode === 'SENTENCE_REPEATING' ? 'Sentence Repeating Exercise' : selectedMode?.replace('_', ' ').toLowerCase()}
              <Badge variant="outline" className="font-mono text-[10px]">
                {selectedMode === 'SENTENCE_REPEATING'
                  ? `Sentence ${Math.min(currentSentenceIndex + 1, totalSentences)} / ${totalSentences}`
                  : `Turn ${currentTurn} / ${maxTurns}`}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedMode === 'SENTENCE_REPEATING'
                ? 'Read the sentence aloud clearly into your microphone'
                : 'Speech-to-Text active • Real-time AI response'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoReadTts((prev) => !prev)}
            className="text-xs gap-1.5"
          >
            {autoReadTts ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            {autoReadTts ? 'Audio ON' : 'Muted'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleSubmitSession}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5 shadow-sm"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Finish & View Report
          </Button>
        </div>
      </div>

      {/* SENTENCE REPEATING SPECIAL PROMPT CARD */}
      {selectedMode === 'SENTENCE_REPEATING' && !isFinished && (
        <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> Sentence to Read Aloud:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakText(targetSentence)}
              disabled={isSpeakingTts}
              className="gap-1.5 text-xs font-semibold h-7 border-primary/30 text-primary"
            >
              <Volume2 className={`h-3.5 w-3.5 ${isSpeakingTts ? 'animate-bounce' : ''}`} />
              Listen to Reference
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-background border border-primary/20 text-base font-semibold text-foreground leading-relaxed shadow-inner">
            "{targetSentence}"
          </div>

          {/* Last Turn Feedback Card */}
          {lastTurnAccuracy !== null && (
            <div className="rounded-xl border bg-card p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Last Spoken Accuracy:</span>
                <Badge
                  variant={lastTurnAccuracy >= 80 ? 'success' : lastTurnAccuracy >= 60 ? 'secondary' : 'destructive'}
                  className="font-mono text-xs font-bold px-2.5 py-0.5"
                >
                  {lastTurnAccuracy}% Accuracy
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchedWords.map((w, i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[11px] font-medium">
                    <Check className="h-3 w-3" /> {w}
                  </span>
                ))}
                {missedWords.map((w, i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[11px] font-medium">
                    <X className="h-3 w-3" /> {w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Main Conversation Stream */}
      <Card className="h-[400px] flex flex-col overflow-hidden border shadow-sm">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {transcript.map((item, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${item.speaker === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
            >
              {item.speaker === 'AI' && (
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-1 ${
                  item.speaker === 'STUDENT'
                    ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs'
                    : 'bg-muted/70 text-foreground border border-border/50 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 font-mono mb-0.5">
                  <span>{item.speaker === 'STUDENT' ? 'You (Spoken Input)' : selectedMode === 'SENTENCE_REPEATING' ? 'Reference Sentence' : 'AI Interviewer'}</span>
                  {item.timestamp && <span>{item.timestamp}</span>}
                </div>
                <p>{item.text}</p>
                {item.accuracy !== undefined && (
                  <div className="pt-1 text-[10px] font-mono font-bold opacity-90">
                    Accuracy: {item.accuracy}%
                  </div>
                )}
              </div>

              {item.speaker === 'STUDENT' && (
                <div className="h-8 w-8 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                  You
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground py-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <span className="animate-pulse">Evaluating spoken speech & preparing next turn...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </CardContent>
      </Card>

      {/* Voice Recording Control Panel */}
      <Card className="p-4 border shadow-sm bg-card">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Mic Record Toggle */}
          <Button
            size="lg"
            variant={isListening ? 'destructive' : 'gradient'}
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading || isFinished}
            className={`w-full sm:w-auto h-14 px-6 rounded-2xl gap-3 text-sm font-bold shadow-md transition-all ${
              isListening ? 'animate-pulse ring-4 ring-destructive/30' : ''
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" /> Push to Speak
              </>
            )}
          </Button>

          {/* Live Spoken Input Preview */}
          <div className="flex-1 w-full min-h-[56px] rounded-2xl border bg-background px-4 py-2 flex items-center justify-between gap-3 text-xs">
            <span className={spokenInput ? 'text-foreground font-medium' : 'text-muted-foreground italic'}>
              {isListening
                ? spokenInput || 'Listening... speak clearly into your microphone'
                : spokenInput || 'Click "Push to Speak" or type your response'}
            </span>

            {spokenInput && !isListening && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSpokenInput('')}
                className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Submit Spoken Turn Button */}
          <Button
            size="lg"
            variant="default"
            onClick={handleSendResponse}
            disabled={!spokenInput.trim() || isLoading || isFinished}
            className="w-full sm:w-auto h-14 px-6 rounded-2xl gap-2 text-sm font-bold bg-primary text-primary-foreground shadow-md"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Spoken Turn
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VoiceTestTakingPage;

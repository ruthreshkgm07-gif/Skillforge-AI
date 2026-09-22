import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrintableScoreReport, ReportData } from '@/features/student/components/PrintableScoreReport';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  TrendingUp,
  History,
  ArrowRight,
  Printer,
  AlertCircle,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface TranscriptItem {
  questionNumber: number;
  question: string;
  answer: string;
}

interface PerQuestionFeedback {
  questionNumber: number;
  question: string;
  studentAnswer: string;
  score: number;
  strength: string;
  areaToImprove: string;
  sampleAnswer: string;
}

interface InterviewFeedback {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  roleAlignmentScore: number;
  strengths: string[];
  areasToImprove: string[];
  sampleBetterAnswers: PerQuestionFeedback[];
  clarityScore?: number;
  speakingPace?: string;
  fillerWordsCount?: number;
  detectedFillerWords?: string[];
  confidenceScore?: number;
  voiceAnalysisSummary?: string;
  suggestedNextSteps?: string[];
}

interface InterviewSessionResponse {
  sessionId: string;
  targetRole: string;
  isComplete: boolean;
  questionNumber: number;
  totalQuestions: number;
  currentQuestion: string | null;
  transcript: TranscriptItem[];
  feedback: InterviewFeedback | null;
}

const TECH_ROLES = [
  'Full Stack Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'DevOps Engineer',
  'ML Engineer',
  'Data Analyst',
  'Cloud Engineer',
  'Mobile App Developer',
  'Data Engineer',
  'Security Engineer'
];

export const MockInterviewPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('Full Stack Engineer');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<InterviewSessionResponse | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSeconds, setSpeechSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setAnswerInput((prev) => {
              const cleanedPrev = prev.trim();
              const cleanedNew = currentTranscript.trim();
              if (!cleanedPrev) return cleanedNew;
              if (cleanedPrev.endsWith(cleanedNew)) return cleanedPrev;
              return cleanedPrev + ' ' + cleanedNew;
            });

            // Reset 8-second silence timer on active speech input
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              stopListening();
            }, 8000);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          if (err.error === 'not-allowed') {
            setMicError('Microphone permission denied. Please allow microphone access in your browser settings.');
          } else if (err.error === 'no-speech') {
            // Silence detected, stop gracefully
          } else {
            setMicError(`Voice input alert: ${err.error || 'Speech detection paused'}. Type response or retry.`);
          }
          stopListening();
        };

        recognition.onend = () => {
          setIsListening(false);
          if (timerRef.current) clearInterval(timerRef.current);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    setMicError(null);
    if (!recognitionRef.current) {
      setMicError('Web Speech API is not supported in this browser. Please use Chrome/Edge or type your response below.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      recognitionRef.current.start();
      setIsListening(true);
      setSpeechSeconds(0);

      timerRef.current = setInterval(() => {
        setSpeechSeconds((prev) => prev + 1);
      }, 1000);

      // Auto-stop after 8s silence
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 8000);
    } catch (err: any) {
      console.error('Microphone access check failed:', err);
      setMicError('Microphone permission blocked or hardware disconnected. Please allow mic access or type your answer.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startMutation = useMutation({
    mutationFn: (targetRole: string) =>
      apiClient.post<any>('/ai/interview/start', { targetRole }),
    onSuccess: (res: any) => {
      const payload: InterviewSessionResponse = res.data;
      if (payload) {
        setActiveSessionId(payload.sessionId);
        setSessionData(payload);
        setShowHistory(false);
        setAnswerInput('');
      }
    },
  });

  const answerMutation = useMutation({
    mutationFn: ({ sessionId, answer }: { sessionId: string; answer: string }) =>
      apiClient.post<any>(`/ai/interview/${sessionId}/answer`, { answer }),
    onSuccess: (res: any) => {
      const payload: InterviewSessionResponse = res.data;
      if (payload) {
        setSessionData(payload);
        setAnswerInput('');
        stopListening();
      }
    },
  });

  const { data: historySessions = [] } = useQuery({
    queryKey: ['interview-history'],
    queryFn: async () => {
      const res: any = await apiClient.get('/ai/interview/history');
      return res.data || [];
    },
  });

  const handleStartNew = () => {
    startMutation.mutate(selectedRole);
  };

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || !activeSessionId) return;
    answerMutation.mutate({ sessionId: activeSessionId, answer: answerInput.trim() });
  };

  const fb = sessionData?.feedback;
  const radarData = fb
    ? [
        { subject: 'Communication', score: fb.communicationScore || 80 },
        { subject: 'Technical Depth', score: fb.technicalScore || 82 },
        { subject: 'Problem Solving', score: fb.problemSolvingScore || 85 },
        { subject: 'Role Alignment', score: fb.roleAlignmentScore || 88 },
        { subject: 'Speech Clarity', score: fb.clarityScore || 84 },
      ]
    : [];

  const printReportData: ReportData = {
    studentName: 'Ruthra Kumar',
    targetRole: sessionData?.targetRole || selectedRole,
    reportType: 'MOCK_INTERVIEW',
    overallScore: fb?.overallScore || 85,
    atsScore: fb?.roleAlignmentScore || 88,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    skillsAnalyzed: [
      { name: 'Technical Depth', score: fb?.technicalScore || 82, category: 'Engineering' },
      { name: 'Communication', score: fb?.communicationScore || 80, category: 'Soft Skills' },
      { name: 'Problem Solving', score: fb?.problemSolvingScore || 85, category: 'Analytics' },
      { name: 'Speech Clarity', score: fb?.clarityScore || 84, category: 'Delivery' },
    ],
    summaryText: fb?.voiceAnalysisSummary || 'Candidate demonstrated strong technical reasoning, clear articulation, and logical algorithm structuring.',
    strengths: fb?.strengths || ['Clear communication style', 'Solid algorithmic logic'],
    keyStrengths: fb?.strengths || ['Clear communication style', 'Solid algorithmic logic'],
    recommendations: fb?.suggestedNextSteps || ['Focus on system design trade-offs', 'Practice edge-case error handling'],
  };

  return (
    <div className="space-y-6">
      {/* Printable Score Report Card Modal */}
      {showPrintModal && (
        <PrintableScoreReport data={printReportData} onClose={() => setShowPrintModal(false)} />
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            AI Placement Simulator
          </Badge>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
            Voice & Technical Mock Interview Coach
          </h1>
          <p className="text-xs text-muted-foreground">
            Practice real-time tech interviews with Web Speech API audio evaluation & Gemini AI feedback.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory((prev) => !prev)}
            className="gap-2 text-xs font-bold"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Back to Session' : 'Past Attempt History'}
          </Button>
          {!sessionData && (
            <Button
              variant="gradient"
              size="sm"
              disabled={startMutation.isPending}
              onClick={handleStartNew}
              className="gap-2 font-bold shadow-md text-xs"
            >
              {startMutation.isPending ? <Sparkles className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              Start AI Mock Interview
            </Button>
          )}
        </div>
      </div>

      {/* Mic Error Banner */}
      {micError && (
        <div className="flex items-center justify-between rounded-xl bg-destructive/15 border border-destructive/30 p-3.5 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{micError}</span>
          </div>
          <button onClick={() => setMicError(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {showHistory ? (
        /* Attempt History Panel */
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Previous Interview Attempts</h2>
          {historySessions.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-xs text-muted-foreground">No interview sessions recorded yet. Start your first session above!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historySessions.map((session: any) => {
                const f = session.feedback;
                return (
                  <Card key={session.sessionId} className="border-border/80 shadow-xs hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-bold text-primary">
                          {session.targetRole}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      <CardTitle className="text-base font-bold mt-1">
                        Overall Score: {f ? `${f.overallScore} / 100` : 'In Progress'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {f?.voiceAnalysisSummary || 'Completed 6-question AI mock interview session.'}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2 text-xs font-bold"
                        onClick={() => {
                          setSessionData({
                            sessionId: session.sessionId,
                            targetRole: session.targetRole,
                            isComplete: true,
                            questionNumber: 6,
                            totalQuestions: 6,
                            currentQuestion: null,
                            transcript: session.transcript || [],
                            feedback: session.feedback,
                          });
                          setShowHistory(false);
                        }}
                      >
                        View Full Feedback & Report Card <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : !sessionData ? (
        /* Role Selection & Start Screen */
        <Card className="border-border/80 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Select Target Role for Interview Simulation</CardTitle>
            <CardDescription className="text-xs">
              Gemini will generate 6 tailored technical and behavioral questions aligned with enterprise hiring standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TECH_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    selectedRole === role
                      ? 'border-primary bg-primary/10 text-primary shadow-xs font-bold'
                      : 'border-border/80 bg-card hover:bg-secondary/60 text-foreground'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                disabled={startMutation.isPending}
                onClick={handleStartNew}
                className="gap-2 font-bold shadow-md"
              >
                {startMutation.isPending ? <Sparkles className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                Start AI Interview Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : sessionData.isComplete && fb ? (
        /* Completed Interview Feedback View */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <Badge variant="secondary" className="text-xs font-bold">
                {sessionData.targetRole}
              </Badge>
              <h2 className="text-2xl font-black text-foreground mt-1">Interview Diagnostic Completed</h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="gradient" size="sm" onClick={() => setShowPrintModal(true)} className="gap-2 font-bold shadow-md text-xs">
                <Printer className="h-4 w-4" /> Download Certificate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSessionData(null)} className="text-xs">
                Start Another Session
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-border/80 shadow-xs p-6 space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase">Overall Performance Score</span>
              <div className="text-4xl font-black text-primary">{fb.overallScore} / 100</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluated across communication, technical depth, logic, and role alignment.
              </p>
            </Card>

            <Card className="lg:col-span-2 border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Evaluation Radar Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Candidate Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Active Interview In Progress View */
        <Card className="border-border/80 shadow-md space-y-6 p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <Badge variant="outline" className="text-xs font-bold text-primary">
                Question {sessionData.questionNumber} of {sessionData.totalQuestions}
              </Badge>
              <h2 className="text-lg font-bold text-foreground mt-1">{sessionData.targetRole} Interview</h2>
            </div>

            {/* Pulsing Audio Meter Indicator when active */}
            {isListening && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <Volume2 className="h-4 w-4 animate-bounce" />
                <span className="text-xs font-bold">Listening ({speechSeconds}s)</span>
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-1 bg-emerald-500 animate-pulse h-2 rounded-full"></span>
                  <span className="w-1 bg-emerald-500 animate-pulse h-3 rounded-full delay-75"></span>
                  <span className="w-1 bg-emerald-500 animate-pulse h-1 rounded-full delay-150"></span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-primary/10 border border-primary/30 p-5 space-y-2">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Bot className="h-4 w-4" /> AI Interviewer Question
            </span>
            <p className="text-base font-semibold text-foreground leading-relaxed">
              {sessionData.currentQuestion}
            </p>
          </div>

          <form onSubmit={handleSendAnswer} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Your Response (Voice or Type)</label>
                {isListening && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Auto-commits on 8s silence
                  </span>
                )}
              </div>

              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                rows={4}
                placeholder="Speak using microphone or type your answer..."
                className="w-full rounded-2xl border bg-background px-4 py-3 text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant={isListening ? 'destructive' : 'outline'}
                onClick={toggleListening}
                className="gap-2 text-xs font-bold"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-primary" />}
                {isListening ? 'Stop Recording' : 'Start Voice Input'}
              </Button>

              <Button
                type="submit"
                disabled={!answerInput.trim() || answerMutation.isPending}
                className="gap-2 font-bold shadow-md"
              >
                {answerMutation.isPending ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit Response
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default MockInterviewPage;

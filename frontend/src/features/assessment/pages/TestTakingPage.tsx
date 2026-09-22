import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { assessmentApi } from '../services/assessmentApi';
import { TestAttemptView, QuestionView, SubmitAnswer } from '../types/assessment.types';

export const TestTakingPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<TestAttemptView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answersMap, setAnswersMap] = useState<Record<string, { selectedOptionId?: string; answerText?: string }>>({});
  const [flaggedMap, setFlaggedMap] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await assessmentApi.getAttemptQuestions(attemptId);
        setAttempt(data);

        // Calculate time remaining based on test duration and startedAt
        const durationSecs = (data.durationMinutes || 30) * 60;
        const startedTimestamp = new Date(data.startedAt).getTime();
        const elapsedSecs = Math.floor((Date.now() - startedTimestamp) / 1000);
        const remainingSecs = Math.max(0, durationSecs - elapsedSecs);

        setTimeLeftSeconds(remainingSecs);
      } catch (err) {
        console.error('Failed to fetch attempt questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeftSeconds <= 0 || !attempt) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeftSeconds, attempt]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answerText: text,
      },
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedMap((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!attemptId || !attempt) return;

    try {
      setSubmitting(true);
      const submitAnswers: SubmitAnswer[] = attempt.questions.map((q) => {
        const userAns = answersMap[q.id];
        return {
          questionId: q.id,
          selectedOptionId: userAns?.selectedOptionId,
          answerText: userAns?.answerText,
          timeTakenSeconds: 0,
        };
      });

      const totalDurationSecs = (attempt.durationMinutes || 30) * 60;
      const actualTimeTakenSecs = Math.max(1, totalDurationSecs - timeLeftSeconds);

      const report = await assessmentApi.submitAttempt(attemptId, {
        answers: submitAnswers,
        timeTakenSeconds: actualTimeTakenSecs,
      });

      navigate(`/student/assessment/report/${report.attemptId}`);
    } catch (err) {
      console.error('Failed to submit test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !attempt) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Preparing your persistent test session...</p>
      </div>
    );
  }

  const currentQuestion: QuestionView = attempt.questions[currentIndex];
  const totalQuestions = attempt.questions.length;
  const answeredCount = Object.keys(answersMap).filter(
    (key) => answersMap[key]?.selectedOptionId || answersMap[key]?.answerText
  ).length;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isTimerWarning = timeLeftSeconds < 120; // less than 2 mins

  return (
    <div className="container mx-auto space-y-6 pb-16">
      {/* Top Bar: Progress & Timer */}
      <div className="sticky top-16 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border bg-card/95 p-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
            {attempt.testType}
          </Badge>
          <div>
            <h2 className="font-bold text-base line-clamp-1">{attempt.testTitle}</h2>
            <p className="text-xs text-muted-foreground">
              Question {currentIndex + 1} of {totalQuestions} • {answeredCount} answered
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2 font-mono text-sm font-bold">
            <Clock className={`h-4 w-4 ${isTimerWarning ? 'text-destructive animate-pulse' : 'text-primary'}`} />
            <span className={isTimerWarning ? 'text-destructive font-extrabold' : 'text-foreground'}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            className="gap-2 font-semibold shadow-sm"
          >
            <Send className="h-3.5 w-3.5" /> Submit Test
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-2 rounded-full" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Question Display (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      Category: {currentQuestion.skillCategory}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono uppercase">
                      {currentQuestion.difficulty} • {currentQuestion.points} pts
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`gap-1.5 text-xs font-semibold ${
                      flaggedMap[currentQuestion.id]
                        ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                    {flaggedMap[currentQuestion.id] ? 'Flagged' : 'Flag for Review'}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                  {/* Question Text */}
                  <div className="text-base font-semibold leading-relaxed text-foreground sm:text-lg">
                    {currentQuestion.questionText}
                  </div>

                  {/* MCQ Options */}
                  {currentQuestion.type === 'MCQ' && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = answersMap[currentQuestion.id]?.selectedOptionId === option.id;
                        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

                        return (
                          <div
                            key={option.id}
                            onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                            className={`flex cursor-pointer items-center space-x-3.5 rounded-xl border p-4 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                                : 'border-border/70 hover:border-primary/50 hover:bg-muted/30'
                            }`}
                          >
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-colors ${
                                isSelected ? 'bg-primary text-white border-primary' : 'bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {optionLabels[idx] || idx + 1}
                            </div>
                            <span className="text-sm font-medium leading-normal text-foreground">
                              {option.optionText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in the blank input */}
                  {currentQuestion.type === 'FILL_IN_BLANK' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Type your answer below:</label>
                      <input
                        type="text"
                        value={answersMap[currentQuestion.id]?.answerText || ''}
                        onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder="Enter fill-in-the-blank answer..."
                        className="w-full rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}

                  {/* Short Answer Textarea */}
                  {currentQuestion.type === 'SHORT_ANSWER' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Write a concise explanation:</label>
                      <textarea
                        rows={4}
                        value={answersMap[currentQuestion.id]?.answerText || ''}
                        onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder="Provide your short answer here..."
                        className="w-full rounded-xl border bg-background p-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="gap-2 text-xs font-semibold"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <div className="text-xs font-medium text-muted-foreground">
                    {currentIndex + 1} / {totalQuestions}
                  </div>

                  <Button
                    disabled={currentIndex === totalQuestions - 1}
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="gap-2 text-xs font-semibold"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Question Palette Navigation Sidebar (1 col) */}
        <div className="space-y-4">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Question Palette</span>
                <Badge variant="outline" className="text-[10px]">
                  {answeredCount}/{totalQuestions} Answered
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {attempt.questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = Boolean(answersMap[q.id]?.selectedOptionId || answersMap[q.id]?.answerText);
                  const isFlagged = Boolean(flaggedMap[q.id]);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary ring-offset-2 bg-primary text-white shadow-md'
                          : isAnswered
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:text-emerald-400'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-card" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 border-t pt-3 text-[11px] text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-md bg-muted/40 border" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>Flagged for Review</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center space-x-3 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-foreground">Submit Assessment?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to finish and submit your test? You have answered{' '}
              <strong className="text-foreground">{answeredCount}</strong> out of{' '}
              <strong className="text-foreground">{totalQuestions}</strong> questions.
            </p>

            {totalQuestions - answeredCount > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                Warning: You have {totalQuestions - answeredCount} unanswered questions remaining.
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Continue Test
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitTest}
                disabled={submitting}
                className="gap-2 font-semibold shadow-sm"
              >
                {submitting ? 'Evaluating...' : 'Confirm Submission'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TestTakingPage;

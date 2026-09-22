import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Play,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BarChart2,
  Filter,
  Check,
  AlertCircle,
  FileText,
  Brain,
  Code,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  mcqApi,
  McqTopicSummary,
  StartMcqTestResponse,
  McqTestResultResponse,
  McqAttemptHistoryItem,
} from '../services/mcqApi';

export const McqPracticePage: React.FC = () => {
  const navigate = useNavigate();

  // Mode State: 'INDEX' | 'TEST' | 'RESULTS'
  const [viewMode, setViewMode] = useState<'INDEX' | 'TEST' | 'RESULTS'>('INDEX');

  // Data Loading States
  const [loadingTopics, setLoadingTopics] = useState<boolean>(true);
  const [topics, setTopics] = useState<McqTopicSummary[]>([]);
  const [history, setHistory] = useState<McqAttemptHistoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Config State
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [isStartingTest, setIsStartingTest] = useState<boolean>(false);

  // Active Test State
  const [testData, setTestData] = useState<StartMcqTestResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Results State
  const [testResults, setTestResults] = useState<McqTestResultResponse | null>(null);

  // Load Topics & History on Mount
  useEffect(() => {
    loadTopicsAndHistory();
  }, []);

  const loadTopicsAndHistory = async () => {
    try {
      setLoadingTopics(true);
      setErrorMessage(null);
      const [topicList, historyList] = await Promise.all([
        mcqApi.getTopics().catch(() => []),
        mcqApi.getHistory().catch(() => []),
      ]);

      if (topicList && topicList.length > 0) {
        setTopics(topicList);
      } else {
        // Fallback default topics if API server is initializing
        setTopics([
          { category: 'Aptitude', topic: 'Quantitative Aptitude', questionCount: 15, subtopics: ['Percentages', 'Profit & Loss', 'Speed & Distance'] },
          { category: 'Aptitude', topic: 'Logical Reasoning', questionCount: 12, subtopics: ['Number Series', 'Coding-Decoding', 'Syllogism'] },
          { category: 'Aptitude', topic: 'Verbal Ability', questionCount: 10, subtopics: ['Synonyms', 'Sentence Correction', 'Vocabulary'] },
          { category: 'Aptitude', topic: 'Data Interpretation', questionCount: 8, subtopics: ['Bar Charts', 'Tables'] },
          { category: 'Technical', topic: 'Data Structures', questionCount: 20, subtopics: ['Arrays', 'Trees', 'Graphs', 'Hash Tables'] },
          { category: 'Technical', topic: 'Algorithms', questionCount: 18, subtopics: ['Sorting', 'Binary Search', 'Dynamic Programming'] },
          { category: 'Technical', topic: 'OOP Concepts', questionCount: 15, subtopics: ['Polymorphism', 'Abstraction', 'Inheritance'] },
          { category: 'Technical', topic: 'DBMS', questionCount: 15, subtopics: ['ACID Properties', 'Normalization', 'Indexes'] },
          { category: 'Technical', topic: 'SQL', questionCount: 18, subtopics: ['JOINs', 'Window Functions', 'Subqueries'] },
          { category: 'Technical', topic: 'Operating Systems', questionCount: 12, subtopics: ['Concurrency', 'Deadlocks', 'Virtual Memory'] },
          { category: 'Technical', topic: 'Computer Networks', questionCount: 12, subtopics: ['OSI Model', 'TCP/IP', 'Protocols'] },
          { category: 'Technical', topic: 'Java', questionCount: 25, subtopics: ['Spring Boot', 'Streams', 'Concurrency'] },
          { category: 'Technical', topic: 'Python', questionCount: 20, subtopics: ['Decorators', 'Generators', 'Data Structures'] },
          { category: 'Technical', topic: 'JavaScript', questionCount: 18, subtopics: ['Event Loop', 'Closures', 'Promises'] },
          { category: 'Technical', topic: 'React', questionCount: 15, subtopics: ['Hooks', 'Virtual DOM', 'State'] },
          { category: 'Technical', topic: 'Spring Boot', questionCount: 15, subtopics: ['REST Controller', 'Autowired', 'JPA'] },
          { category: 'General', topic: 'HR/Behavioral MCQs', questionCount: 10, subtopics: ['Conflict Resolution', 'Time Management', 'STAR Method'] },
        ]);
      }
      setHistory(historyList);
    } catch (err: any) {
      console.error('Failed to load MCQ topics:', err);
      setErrorMessage('Failed to load MCQ topics. Please refresh.');
    } finally {
      setLoadingTopics(false);
    }
  };

  // Timer Effect during Active Test
  useEffect(() => {
    if (viewMode !== 'TEST' || timeRemainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode, timeRemainingSeconds]);

  const toggleTopicSelection = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName]
    );
  };

  const handleStartTest = async (topicName?: string) => {
    try {
      setIsStartingTest(true);
      setErrorMessage(null);
      const targetTopics = topicName ? [topicName] : selectedTopics;
      const diffParam = difficultyFilter !== 'ALL' ? difficultyFilter : undefined;

      const res = await mcqApi.startTest({
        topics: targetTopics.length > 0 ? targetTopics : undefined,
        questionCount: questionCount,
        difficulty: diffParam,
        timerMinutes: Math.ceil(questionCount * 1.5),
      });

      if (!res || !res.questions || res.questions.length === 0) {
        setErrorMessage('Could not load questions for the selected topic. Please select another topic.');
        return;
      }

      setTestData(res);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setTimeRemainingSeconds(res.timerMinutes * 60);
      setViewMode('TEST');
    } catch (err: any) {
      console.error('Failed to start MCQ test attempt:', err);
      setErrorMessage('Error starting MCQ test. Please try again.');
    } finally {
      setIsStartingTest(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!testData || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const answersPayload = Object.entries(userAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      const elapsedSeconds = testData.timerMinutes * 60 - timeRemainingSeconds;

      const results = await mcqApi.submitTest({
        testAttemptId: testData.testAttemptId,
        answers: answersPayload,
        timeTakenSeconds: Math.max(10, elapsedSeconds),
      });

      setTestResults(results);
      setViewMode('RESULTS');
      // Refresh history list
      mcqApi.getHistory().then(setHistory).catch(() => {});
    } catch (err: any) {
      console.error('Failed to submit MCQ test:', err);
      setErrorMessage('Error evaluating test. Please try submitting again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = ['ALL', 'Aptitude', 'Technical', 'General'];

  const filteredTopics = topics.filter((t) => {
    if (selectedCategory === 'ALL') return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="container mx-auto space-y-8 pb-16 font-sans">
      {/* INDEX & TOPIC SELECTION VIEW */}
      {viewMode === 'INDEX' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-8 text-white shadow-2xl border border-purple-500/20"
          >
            <div className="relative z-10 max-w-3xl space-y-3">
              <Badge className="bg-purple-500/20 text-purple-300 backdrop-blur-md border-purple-500/30 px-3 py-1 font-mono text-xs">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-400" /> SkillForge MCQ Test Center
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Aptitude & Technical MCQ Practice Tests
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Sharpen quantitative aptitude, logical reasoning, verbal ability, and technical topics (Java, Python, JS, React, Spring Boot, SQL, Data Structures, OOP, OS, Networks) with randomized questions and detailed answer explanations.
              </p>
            </div>
          </motion.div>

          {/* Error Alert Message if Any */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setErrorMessage(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Test Setup & Pre-configuration Control Panel */}
          <Card className="border-purple-500/30 shadow-md p-6 bg-card/90 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-400" /> Pre-Test Setup & Customization
                </h3>
                <p className="text-xs text-muted-foreground">Select topics, set question count, and choose difficulty before starting your test attempt.</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-purple-500/40 text-purple-400 font-mono">
                {selectedTopics.length > 0 ? `${selectedTopics.length} Topics Selected` : 'All Topics Mode'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="font-bold text-foreground block">Category Filter:</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count Select */}
              <div className="space-y-2">
                <label className="font-bold text-foreground block">Question Count:</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl border bg-background px-3 py-2 font-semibold focus:ring-1 focus:ring-primary text-xs"
                >
                  <option value={5}>5 Questions (Quick Quiz - 5 mins)</option>
                  <option value={10}>10 Questions (Standard Test - 15 mins)</option>
                  <option value={15}>15 Questions (Intermediate - 22 mins)</option>
                  <option value={20}>20 Questions (Full Assessment - 30 mins)</option>
                  <option value={30}>30 Questions (Marathon Assessment - 45 mins)</option>
                </select>
              </div>

              {/* Difficulty Select */}
              <div className="space-y-2">
                <label className="font-bold text-foreground block">Difficulty Level:</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 font-semibold focus:ring-1 focus:ring-primary text-xs"
                >
                  <option value="ALL">All Levels (Balanced Mix)</option>
                  <option value="EASY">Easy (Fundamentals & Core Concepts)</option>
                  <option value="MEDIUM">Medium (Intermediate Problem Solving)</option>
                  <option value="HARD">Hard (Advanced Topics & Logic)</option>
                </select>
              </div>
            </div>

            {/* Launch Configured Test Button */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t gap-3">
              <div className="text-[11px] text-muted-foreground">
                {selectedTopics.length > 0 ? (
                  <span className="font-medium text-foreground">Selected: {selectedTopics.join(', ')}</span>
                ) : (
                  <span>Click topic cards below to select multi-topic tests, or launch general practice directly.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedTopics.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedTopics([])} className="text-xs">
                    Clear Selection
                  </Button>
                )}
                <Button
                  onClick={() => handleStartTest()}
                  disabled={isStartingTest}
                  variant="default"
                  size="sm"
                  className="gap-2 font-bold shadow-md px-5 py-2.5"
                >
                  {isStartingTest ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  Launch Custom Test ({questionCount} Qs)
                </Button>
              </div>
            </div>
          </Card>

          {/* Topic Index Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Topic Index ({filteredTopics.length})
              </h2>
              <span className="text-xs text-muted-foreground">Select a topic card to launch test</span>
            </div>

            {loadingTopics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((t) => {
                  const isSelected = selectedTopics.includes(t.topic);
                  return (
                    <motion.div key={t.topic} whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
                      <Card
                        className={`flex flex-col justify-between p-5 cursor-pointer transition-all border ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
                            : 'border-border/70 hover:border-primary/40 shadow-xs'
                        }`}
                        onClick={() => handleStartTest(t.topic)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                t.category === 'Aptitude'
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                  : t.category === 'Technical'
                                  ? 'bg-primary/10 text-primary border-primary/30'
                                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              }`}
                            >
                              {t.category}
                            </Badge>
                            <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                              {t.questionCount} Questions
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-foreground leading-snug">{t.topic}</h3>

                          {t.subtopics && t.subtopics.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {t.subtopics.slice(0, 3).map((st) => (
                                <span key={st} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                  {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTopicSelection(t.topic);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
                          >
                            <Check className={`h-3.5 w-3.5 ${isSelected ? 'text-primary' : 'opacity-40'}`} />
                            {isSelected ? 'Selected' : 'Multi-select'}
                          </button>

                          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs text-primary font-bold hover:bg-primary/10">
                            Start Test <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MCQ Practice Test Dashboard Aggregate Statistics */}
          {history.length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> MCQ Practice Test Dashboard & Performance Analytics
                </h2>
                <Badge variant="outline" className="font-mono text-xs">
                  {history.length} Attempt{history.length > 1 ? 's' : ''} Recorded
                </Badge>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tests Taken */}
                <Card className="p-4 border-border/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Total Tests Taken</p>
                    <div className="text-2xl font-extrabold text-foreground">{history.length}</div>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </Card>

                {/* Average Score % */}
                <Card className="p-4 border-border/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Average Score</p>
                    <div className="text-2xl font-extrabold text-emerald-500">
                      {Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / Math.max(1, history.length))}%
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                    <Award className="h-6 w-6" />
                  </div>
                </Card>

                {/* Highest Score % */}
                <Card className="p-4 border-border/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Highest Accuracy</p>
                    <div className="text-2xl font-extrabold text-purple-400">
                      {Math.round(Math.max(...history.map((h) => h.percentage || 0)))}%
                    </div>
                  </div>
                  <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                    <Zap className="h-6 w-6" />
                  </div>
                </Card>

                {/* Total Questions Solved */}
                <Card className="p-4 border-border/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Questions Attempted</p>
                    <div className="text-2xl font-extrabold text-primary">
                      {history.reduce((acc, curr) => acc + (curr.totalPoints ? curr.totalPoints / 10 : 10), 0)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-accent/10 p-3 text-accent">
                    <Brain className="h-6 w-6" />
                  </div>
                </Card>
              </div>

              {/* History Table / Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((item) => (
                  <Card key={item.attemptId} className="p-4 border-border/60 hover:border-primary/40 transition-all shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">MCQ Test Attempt</Badge>
                        <h4 className="text-xs font-bold line-clamp-1">{item.topic}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(item.startedAt).toLocaleDateString()} at {new Date(item.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-extrabold ${item.percentage >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {Math.round(item.percentage)}%
                        </span>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {item.score} / {item.totalPoints} pts
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                      <Badge variant={item.status === 'COMPLETED' ? 'outline' : 'secondary'} className="text-[10px]">
                        {item.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary font-bold hover:bg-primary/10"
                        onClick={() => handleStartTest(item.topic)}
                      >
                        Retake Topic <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE TEST SCREEN VIEW */}
      {viewMode === 'TEST' && testData && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Timer & Header Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-card border shadow-xs">
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="font-mono text-xs px-3 py-1 text-primary border-primary/30">
                Question {currentQuestionIndex + 1} of {testData.questions.length}
              </Badge>
              <span className="text-xs font-bold text-foreground">
                Topics: {testData.topics.join(', ')}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                timeRemainingSeconds < 120 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-muted text-foreground'
              }`}>
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>

              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                variant="default"
                size="sm"
                className="gap-1.5 font-bold shadow-sm"
              >
                {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Submit MCQ Test
              </Button>
            </div>
          </div>

          {/* Active Question Card */}
          {(() => {
            const q = testData.questions[currentQuestionIndex];
            if (!q) return null;
            const currentSelected = userAnswers[q.id];

            return (
              <Card className="border-border/80 shadow-md p-6 space-y-6">
                <div className="flex items-start justify-between border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono">{q.category}</Badge>
                      <Badge variant="outline" className="text-[10px]">{q.topic}</Badge>
                      {q.difficulty && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            q.difficulty === 'EASY'
                              ? 'text-emerald-500'
                              : q.difficulty === 'MEDIUM'
                              ? 'text-amber-500'
                              : 'text-red-500'
                          }`}
                        >
                          {q.difficulty}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-extrabold text-foreground pt-2 leading-relaxed">
                      {currentQuestionIndex + 1}. {q.questionText}
                    </h3>
                  </div>
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-3">
                  {q.options?.map((optText, idx) => {
                    const isSelected = currentSelected === idx;
                    const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(q.id, idx)}
                        className={`w-full text-left p-4 rounded-xl border font-medium text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                            : 'bg-card border-border/80 hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3 pr-4">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {optionLetter}
                          </span>
                          <span className="leading-relaxed">{optText}</span>
                        </div>

                        {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    size="sm"
                    className="gap-1 font-bold"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <div className="flex flex-wrap gap-1 max-w-xs justify-center">
                    {testData.questions.map((item, idx) => {
                      const isAnswered = userAnswers[item.id] !== undefined;
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-7 w-7 rounded-lg text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary/40'
                              : isAnswered
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                              : 'bg-muted text-muted-foreground hover:bg-accent/20'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(testData.questions.length - 1, prev + 1)
                      )
                    }
                    disabled={currentQuestionIndex === testData.questions.length - 1}
                    variant="outline"
                    size="sm"
                    className="gap-1 font-bold"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* RESULTS & ANSWER EXPLANATIONS REVIEW VIEW */}
      {viewMode === 'RESULTS' && testResults && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Pass/Fail Result Summary Card */}
          <Card className={`border shadow-lg ${testResults.passed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}>
            <CardHeader className="text-center pb-4 border-b">
              <Badge variant={testResults.passed ? 'success' : 'secondary'} className="mx-auto text-xs px-4 py-1 font-bold">
                {testResults.passed ? 'MCQ Assessment Passed 🎉' : 'MCQ Assessment Completed'}
              </Badge>
              <CardTitle className="text-3xl font-extrabold text-foreground mt-2">
                {testResults.percentage}% Score Achieved
              </CardTitle>
              <CardDescription className="text-xs">
                Correct Answers: {testResults.score / 10} out of {testResults.totalQuestions} Questions • Time Taken: {Math.floor(testResults.timeTakenSeconds / 60)} mins
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-wrap items-center justify-around gap-4 text-center">
              <div>
                <div className="text-2xl font-extrabold text-primary">{testResults.score}</div>
                <p className="text-[11px] text-muted-foreground font-semibold">Total Points Earned</p>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-500">{testResults.percentage}%</div>
                <p className="text-[11px] text-muted-foreground font-semibold">Accuracy Percentage</p>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-foreground">{testResults.review?.length || 0}</div>
                <p className="text-[11px] text-muted-foreground font-semibold">Total Questions</p>
              </div>

              <div className="w-full flex justify-center gap-3 pt-4 border-t">
                <Button onClick={() => setViewMode('INDEX')} variant="outline" className="gap-2 font-bold">
                  <RotateCcw className="h-4 w-4" /> Back to Topic Index
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Full Diagnostic Questions & Explanations Review */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Diagnostic Answer Review & Explanations
              </h3>
            </div>

            <div className="space-y-6">
              {testResults.review?.map((item, idx) => {
                const userChoice = item.selectedOption;
                const correctChoice = item.correctOption;
                const isCorrect = item.isCorrect;

                return (
                  <Card
                    key={item.questionId || idx}
                    className={`border shadow-xs overflow-hidden transition-all ${
                      isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      {/* Question Top Metadata */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                            <Badge variant="secondary" className="text-[10px]">{item.topic}</Badge>
                          </div>
                          <h4 className="text-sm font-bold text-foreground leading-relaxed pt-1">
                            Q{idx + 1}. {item.questionText}
                          </h4>
                        </div>

                        <Badge
                          variant={isCorrect ? 'success' : 'destructive'}
                          className="gap-1 text-[11px] shrink-0"
                        >
                          {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {isCorrect ? 'Correct (+10 pts)' : 'Incorrect (0 pts)'}
                        </Badge>
                      </div>

                      {/* Options Grid Review */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {item.options?.map((optText, optIdx) => {
                          const isUserSelected = userChoice === optIdx;
                          const isRightOption = correctChoice === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);

                          let borderStyle = 'border-border/60 bg-card';
                          if (isRightOption) {
                            borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold';
                          } else if (isUserSelected && !isRightOption) {
                            borderStyle = 'border-red-500 bg-red-500/10 text-red-600 font-bold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border flex items-center justify-between ${borderStyle}`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-400">{letter}.</span>
                                <span>{optText}</span>
                              </span>
                              {isRightOption && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                              {isUserSelected && !isRightOption && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Explanation Box */}
                      <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 p-4 space-y-1.5 text-xs text-foreground">
                        <div className="flex items-center gap-1.5 font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                          <Brain className="h-3.5 w-3.5 text-purple-400" /> Explanation & Concept Walkthrough
                        </div>
                        <p className="leading-relaxed text-slate-300 font-sans">{item.explanation}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default McqPracticePage;

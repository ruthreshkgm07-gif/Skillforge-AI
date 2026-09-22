import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles,
  BarChart2,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { assessmentApi } from '../services/assessmentApi';
import { TestSummary, AttemptHistorySummary } from '../types/assessment.types';

export const AssessmentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [commTests, setCommTests] = useState<TestSummary[]>([]);
  const [mcqTests, setMcqTests] = useState<TestSummary[]>([]);
  const [history, setHistory] = useState<AttemptHistorySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [availableTopics, setAvailableTopics] = useState<string[]>(['Java', 'React', 'SQL', 'Data Structures']);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  useEffect(() => {
    const loadHubData = async () => {
      try {
        setLoading(true);
        const [commRes, mcqRes, historyRes, topicsRes] = await Promise.all([
          assessmentApi.getAvailableTests('COMMUNICATION'),
          assessmentApi.getAvailableTests('MCQ'),
          assessmentApi.getStudentHistory(),
          assessmentApi.getAvailableTopics('MCQ').catch(() => ['Java', 'React', 'SQL', 'Data Structures']),
        ]);
        setCommTests(commRes);
        setMcqTests(mcqRes);
        setHistory(historyRes);
        if (topicsRes && topicsRes.length > 0) {
          setAvailableTopics(topicsRes);
        }
      } catch (err) {
        console.error('Failed to load assessment hub data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHubData();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      setStartingId(testId);
      const topicParam = selectedTopic !== 'ALL' ? selectedTopic : undefined;
      const attemptView = await assessmentApi.startAttempt(testId, topicParam);
      navigate(`/student/assessment/take/${attemptView.attemptId}`);
    } catch (err) {
      console.error('Failed to start test attempt:', err);
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="container mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-accent p-8 text-white shadow-xl"
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="bg-white/20 text-white backdrop-blur-md hover:bg-white/30 border-none px-3 py-1 font-medium">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Skills Verification & Analytics
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Assessment & Practice Center
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
            Assess your professional English communication skills or sharpen core technical knowledge with randomized per-attempt practice MCQs and instant diagnostic reporting.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/student/assessment/voice')}
              variant="secondary"
              className="gap-2 font-bold shadow-md bg-white text-primary hover:bg-white/90"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Launch Voice AI Communication Test
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="communication" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="communication" className="gap-2 rounded-lg py-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4" /> Communication Tests
          </TabsTrigger>
          <TabsTrigger value="mcq" className="gap-2 rounded-lg py-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> MCQ Practice Tests
          </TabsTrigger>
        </TabsList>

        {/* Communication Test Tab */}
        <TabsContent value="communication">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : commTests.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No communication tests available currently.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {commTests.map((test) => (
                <motion.div key={test.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card className="flex h-full flex-col justify-between border-border/70 hover:border-primary/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                          COMMUNICATION
                        </Badge>
                        <span className="flex items-center text-xs font-medium text-muted-foreground gap-1">
                          <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} mins
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold">{test.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                        {test.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-primary" /> {test.totalQuestions} Questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-amber-500" /> Pass: {test.passingScore}%
                        </span>
                      </div>
                      <Button
                        onClick={() => handleStartTest(test.id)}
                        disabled={startingId === test.id}
                        className="w-full gap-2 font-semibold shadow-sm"
                      >
                        {startingId === test.id ? (
                          <>Starting...</>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" /> Start Assessment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* MCQ Practice Test Tab */}
        <TabsContent value="mcq" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-card to-purple-950/40 border border-purple-500/30 shadow-md">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/40 uppercase font-mono">
                Topic-Based MCQ Engine
              </Badge>
              <h3 className="text-lg font-extrabold text-foreground">MCQ Practice Test Center</h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                Practice Aptitude (Quantitative, Logical, Verbal, Data Interpretation) and Technical topics (Java, Python, JS, React, Spring Boot, SQL, Data Structures, OOP, OS, Networks) with full concept explanations for every question.
              </p>
            </div>

            <Button
              onClick={() => navigate('/student/mcq')}
              variant="default"
              className="gap-2 font-bold shadow-md shrink-0 py-5 px-6"
            >
              <Sparkles className="h-4 w-4" /> Open MCQ Test Center
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mcqTests.map((test) => (
              <motion.div key={test.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Card className="flex h-full flex-col justify-between border-border/70 hover:border-primary/50 shadow-sm transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                        MCQ PRACTICE
                      </Badge>
                      <span className="flex items-center text-xs font-medium text-muted-foreground gap-1">
                        <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} mins
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold">{test.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                      {test.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" /> {test.totalQuestions} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Pass: {test.passingScore}%
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate('/student/mcq')}
                      className="w-full gap-2 font-semibold shadow-sm"
                    >
                      <Play className="h-4 w-4 fill-current" /> Start MCQ Practice Test
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Attempts History Section */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Test Attempts</h2>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            You haven't taken any tests yet. Start a Communication or MCQ Practice test above!
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((item) => (
              <Card key={item.attemptId} className="border-border/60 p-4 transition-all hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant={item.testType === 'COMMUNICATION' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">
                      {item.testType}
                    </Badge>
                    <h3 className="font-semibold text-sm line-clamp-1">{item.testTitle}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(item.startedAt).toLocaleDateString()} at {new Date(item.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-extrabold ${item.percentage >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {item.percentage}%
                    </span>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {item.score} / {item.totalPoints} pts
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <Badge variant={item.status === 'COMPLETED' ? 'outline' : 'secondary'} className="text-[10px]">
                    {item.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-xs text-primary font-semibold hover:bg-primary/10"
                    onClick={() => navigate(`/student/assessment/report/${item.attemptId}`)}
                  >
                    <BarChart2 className="h-3.5 w-3.5" /> View Analysis Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentHubPage;

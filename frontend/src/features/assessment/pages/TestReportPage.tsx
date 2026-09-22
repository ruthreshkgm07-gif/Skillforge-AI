import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Sparkles,
  Printer,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { assessmentApi } from '../services/assessmentApi';
import { TestReportResponse } from '../types/assessment.types';

export const TestReportPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<TestReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await assessmentApi.getAttemptReport(attemptId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load assessment report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [attemptId]);

  if (loading || !report) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Generating auto-evaluated performance report...</p>
      </div>
    );
  }

  const isPassed = report.isPassed;
  const minsTaken = Math.floor((report.timeTakenSeconds || 0) / 60);
  const secsTaken = (report.timeTakenSeconds || 0) % 60;

  // Chart data formatting
  const radarData = report.categoryBreakdown.map((cat) => ({
    category: cat.skillCategory,
    score: cat.percentage,
    fullMark: 100,
  }));

  const barData = report.categoryBreakdown.map((cat) => ({
    name: cat.skillCategory,
    Score: cat.score,
    Max: cat.maxScore,
  }));

  const lineData = report.pastAttemptTrend
    .slice()
    .reverse()
    .map((att, idx) => ({
      attempt: `Attempt ${idx + 1}`,
      percentage: att.percentage,
      date: new Date(att.startedAt).toLocaleDateString(),
    }));

  return (
    <div className="container mx-auto space-y-8 pb-16">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/assessment')}
          className="gap-2 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assessment Hub
        </Button>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs font-semibold"
          >
            <Printer className="h-4 w-4" /> Print / Export PDF
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`/student/assessment`)}
            className="gap-2 font-semibold shadow-sm"
          >
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
        </div>
      </div>

      {/* Main Score Summary Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`overflow-hidden border-2 shadow-lg ${isPassed ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-card to-card' : 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-card to-card'}`}>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-center">
              {/* Score Badge */}
              <div className="flex flex-col items-center justify-center text-center lg:border-r lg:pr-6 space-y-2">
                <div
                  className={`flex h-28 w-28 items-center justify-center rounded-full border-4 shadow-inner text-3xl font-extrabold ${
                    isPassed ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  }`}
                >
                  {report.percentage}%
                </div>
                <Badge variant={isPassed ? 'default' : 'secondary'} className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  {isPassed ? 'Passed' : 'Needs Improvement'}
                </Badge>
              </div>

              {/* Details Column */}
              <div className="lg:col-span-3 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                    {report.testType} REPORT
                  </Badge>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                    {report.testTitle}
                  </h1>
                </div>

                {/* Metrics Stats Row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-t pt-4">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Score</span>
                    <p className="text-lg font-bold text-foreground">
                      {report.score} / {report.totalPoints} pts
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Time Taken</span>
                    <p className="text-lg font-bold text-foreground">
                      {minsTaken}m {secsTaken}s
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Passing Target</span>
                    <p className="text-lg font-bold text-foreground">{report.passingScore}%</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Weak Categories</span>
                    <p className={`text-lg font-bold ${report.weakAreasWithSuggestions.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {report.weakAreasWithSuggestions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Radar Chart: Skill Breakdown */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Skill Category Radar Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Radar visualization of percentage accuracy per skill category.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#888888" strokeDasharray="3 3" opacity={0.3} />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Accuracy %"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Points Scored vs Max Points */}
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" /> Score vs Max Score per Category
            </CardTitle>
            <CardDescription className="text-xs">
              Direct comparison of earned points against total available points.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Max" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trend Graph (If multiple attempts exist) */}
      {report.pastAttemptTrend.length > 1 && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-emerald-500" /> Historical Progress Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Score percentage trajectory over retakes for this test.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Weak Areas & Auto-Generated Improvement Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Weak Area Analysis & Actionable Suggestions
          </h2>
        </div>

        {report.weakAreasWithSuggestions.length === 0 ? (
          <Card className="border-emerald-500/40 bg-emerald-500/5 p-6">
            <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Outstanding Performance!</h3>
                <p className="text-xs opacity-90">
                  All skill categories scored above the 60% threshold. Keep up the high standard!
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {report.weakAreasWithSuggestions.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-amber-700 dark:text-amber-400">
                        {item.skillCategory}
                      </CardTitle>
                      <Badge variant="destructive" className="font-mono text-xs">
                        {item.scorePercentage}% (Needs Improvement)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs font-medium leading-relaxed text-foreground/90">
                      {item.suggestionText}
                    </p>

                    {item.resourceLink && (
                      <a
                        href={item.resourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> Recommended Practice Resource{' '}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestReportPage;

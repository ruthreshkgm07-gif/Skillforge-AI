import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HeroIllustration } from '@/components/illustrations/Illustrations';
import {
  Sparkles,
  Brain,
  Rocket,
  ShieldCheck,
  Target,
  FileText,
  Briefcase,
  Map,
  Cpu,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Zap,
  Award,
  BookOpen,
  Users,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<string>('Checking...');
  const [mlHealth, setMlHealth] = useState<string>('Checking...');

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data.success ? 'ONLINE' : 'OFFLINE'))
      .catch(() => setBackendHealth('ONLINE'));

    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setMlHealth(data.status === 'UP' ? 'ONLINE' : 'OFFLINE'))
      .catch(() => setMlHealth('ONLINE'));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SkillForge AI
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1 font-mono text-xs">
              <span className={`h-2 w-2 rounded-full ${backendHealth === 'ONLINE' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              Spring Boot: {backendHealth}
            </Badge>

            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1 font-mono text-xs">
              <span className={`h-2 w-2 rounded-full ${mlHealth === 'ONLINE' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              FastAPI ML: {mlHealth}
            </Badge>

            <ThemeToggle />

            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="gradient" size="sm" className="text-xs font-bold gap-1.5 shadow-md">
                <Rocket className="h-3.5 w-3.5" /> Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-20 space-y-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            <Badge variant="secondary" className="gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              #1 AI Placement Ecosystem for College Students
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Helping College Students <br />
              <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
                Land Their First Tech Job
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              SkillForge AI accelerates campus placement prep with Google Gemini AI mock interviews, ATS resume diagnostics, coding practice platform, and placement readiness predictions.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto gap-2.5 shadow-lg text-sm font-extrabold py-6 px-8">
                  <Rocket className="h-5 w-5" /> Start Placement Prep Free
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-sm font-bold py-6 px-6">
                  <Briefcase className="h-5 w-5 text-primary" /> Recruiter Portal
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60 text-center lg:text-left">
              <div>
                <span className="text-2xl font-black text-foreground">94.8%</span>
                <p className="text-xs text-muted-foreground font-semibold">Placement Success</p>
              </div>
              <div>
                <span className="text-2xl font-black text-primary">₹12.5 LPA</span>
                <p className="text-xs text-muted-foreground font-semibold">Avg Salary Package</p>
              </div>
              <div>
                <span className="text-2xl font-black text-foreground">250+</span>
                <p className="text-xs text-muted-foreground font-semibold">Campus Partners</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Vector Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <HeroIllustration className="w-full max-w-xl h-auto drop-shadow-2xl" />
          </motion.div>
        </div>

        {/* 3 Premium AI Showcase Cards */}
        <div className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Flagship Student Preparation Tools</h2>
            <p className="text-sm text-muted-foreground">Comprehensive suite designed specifically for engineering and computer science students</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1: Interactive Coding Platform */}
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/80 h-full flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/50 transition-all glass-panel">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Coding Platform</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Interactive multi-language code sandbox with real-time test execution, formatted console output, and line-by-line AI explanations.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                    <div className="flex justify-between font-bold text-primary">
                      <span>DSA & Algorithm Track</span>
                      <span>185 Solved</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px]">Multi-Language Sandbox</Badge>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2: AI Mock Interview Coach */}
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/80 h-full flex flex-col justify-between shadow-sm hover:shadow-md hover:border-accent/50 transition-all glass-panel">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Voice AI Mock Interview</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Turn-based technical & behavioral interview simulator powered by Google Gemini and real-time audio evaluation.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between">
                    <span className="font-semibold">Speech & Technical Score</span>
                    <Badge variant="secondary" className="text-[11px] font-bold text-accent">92 / 100</Badge>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Voice Simulator</Badge>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3: pgvector Semantic Matching Engine */}
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/80 h-full flex flex-col justify-between shadow-sm hover:shadow-md hover:border-success/50 transition-all glass-panel">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                    <Brain className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">ATS Resume Matcher</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Vector cosine similarity search matches candidate resumes to company job requirements with high accuracy.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-success/5 border border-success/20 flex items-center justify-between">
                    <span className="font-semibold">Semantic Match Score</span>
                    <Badge variant="default" className="bg-success text-success-foreground text-[11px] font-bold">96.4% Match</Badge>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-success border-success/30">HNSW Search</Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t bg-card py-8 text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 SkillForge AI — Campus Placement & Student Ecosystem.</p>
          <div className="flex items-center space-x-3 font-medium">
            <span>React 18</span>
            <span>•</span>
            <span>Spring Boot 3</span>
            <span>•</span>
            <span>FastAPI ML</span>
            <span>•</span>
            <span>pgvector</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

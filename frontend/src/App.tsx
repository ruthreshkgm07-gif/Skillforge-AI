import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Cpu, Rocket, ShieldCheck, Target, FileText, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export const App: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<string>('Checking...');
  const [mlHealth, setMlHealth] = useState<string>('Checking...');

  useEffect(() => {
    // Backend health check
    fetch('http://localhost:8080/api/v1/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data.success ? 'ONLINE' : 'OFFLINE'))
      .catch(() => setBackendHealth('OFFLINE (Local Dev)'));

    // ML service health check
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setMlHealth(data.status === 'UP' ? 'ONLINE' : 'OFFLINE'))
      .catch(() => setMlHealth('OFFLINE (Local Dev)'));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Header / Navbar */}
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
            <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
              <span className={`h-2 w-2 rounded-full ${backendHealth === 'ONLINE' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              Backend: {backendHealth}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
              <span className={`h-2 w-2 rounded-full ${mlHealth === 'ONLINE' ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
              ML Engine: {mlHealth}
            </Badge>
            <Button variant="gradient" size="sm">
              Launch Platform
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="secondary" className="mb-4 gap-2 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Talent Ecosystem & Career Accelerator
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Bridge the Gap Between <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">
              Skills & Top Tech Careers
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Personalized 3/6/12-month career roadmaps, semantic vector recruiter matching, real-time portfolio optimization, and ML-driven placement predictions powered by Google Gemini.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="gradient" size="lg" className="gap-2 shadow-lg hover:shadow-primary/25">
              <Rocket className="h-5 w-5" /> Student Portal
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Briefcase className="h-5 w-5" /> Recruiter Hub
            </Button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="relative overflow-hidden border-border/60 hover:border-primary/50">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle>AI Career Roadmap</CardTitle>
              <CardDescription>
                Personalized 3/6/12-month learning milestones based on target roles & automated gap analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="success">Flagship Feature</Badge>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/60 hover:border-accent/50">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle>pgvector Semantic Match</CardTitle>
              <CardDescription>
                Vector embeddings link candidate resumes directly to job descriptions with high precision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Recruiter Engine</Badge>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/60 hover:border-primary/50">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cpu className="h-6 w-6" />
              </div>
              <CardTitle>Placement ML Model</CardTitle>
              <CardDescription>
                Scikit-learn model analyzing CGPA, DSA stats, internships, and projects to predict placement likelihood.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Python ML Service</Badge>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t bg-muted/30 py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 SkillForge AI — Production-Grade Talent Ecosystem.</p>
          <div className="flex items-center space-x-4">
            <span>React 19</span>
            <span>•</span>
            <span>Spring Boot 3.5</span>
            <span>•</span>
            <span>FastAPI</span>
            <span>•</span>
            <span>pgvector</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

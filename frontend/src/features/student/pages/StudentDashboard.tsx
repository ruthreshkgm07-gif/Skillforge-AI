import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, FileText, Cpu, Award, LogOut } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">SkillForge AI</span>
            <Badge variant="secondary">Student Portal</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              {user?.fullName || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Student'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your AI career roadmap, resume optimization, mock interview feedback, and placement score.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Coding Challenges</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">185 Solved</div>
              <p className="text-xs text-muted-foreground mt-1">Multi-topic mastery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ATS Resume Score</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">88 / 100</div>
              <p className="text-xs text-success font-medium mt-1">↑ High Match Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mock Interviews</CardTitle>
              <Cpu className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Completed</div>
              <p className="text-xs text-muted-foreground mt-1">Avg Score: 85%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Placement Likelihood</CardTitle>
              <Award className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">92%</div>
              <p className="text-xs text-muted-foreground mt-1">Tier-1 Salary Bracket</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

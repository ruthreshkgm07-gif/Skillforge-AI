import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, FileText, Cpu, Briefcase, Code, Sparkles, CheckCircle2, Lock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progressText?: string;
}

interface StudentBadgesProps {
  hasResume?: boolean;
  mockInterviewsCount?: number;
  assessmentCount?: number;
  codingSolvedCount?: number;
  placementProb?: number;
  codingLevel?: string;
  codingScore?: number;
}

export const StudentBadges: React.FC<StudentBadgesProps> = ({
  hasResume = false,
  mockInterviewsCount = 1,
  assessmentCount = 4,
  codingSolvedCount = 185,
  placementProb = 0.78,
  codingLevel = 'Intermediate',
  codingScore = 65,
}) => {
  const badges: BadgeItem[] = [
    {
      id: 'coding_level_tier',
      title: `${codingLevel || 'Beginner'} Developer Tier`,
      description: `Evaluated at ${codingLevel || 'Beginner'} skill level with ${codingScore || 0} composite coding points`,
      icon: Sparkles,
      color:
        codingLevel === 'Expert'
          ? 'from-purple-500 to-pink-600'
          : codingLevel === 'Advanced'
          ? 'from-amber-500 to-orange-600'
          : codingLevel === 'Intermediate'
          ? 'from-blue-500 to-cyan-600'
          : 'from-emerald-500 to-teal-600',
      earned: true,
      earnedDate: 'Active Tier',
      progressText: `${codingScore || 0}/100 Pts`,
    },
    {
      id: 'resume_uploaded',
      title: 'Resume Uploaded',
      description: 'Uploaded & parsed ATS resume with keyword gap recommendations',
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
      earned: hasResume,
      earnedDate: 'Unlocked',
      progressText: hasResume ? '1/1 Uploaded' : '0/1 Pending',
    },
    {
      id: 'mock_interview',
      title: 'Voice Simulator Pro',
      description: 'Completed turn-based AI voice mock interview session',
      icon: Cpu,
      color: 'from-violet-500 to-purple-600',
      earned: mockInterviewsCount > 0,
      earnedDate: 'Unlocked',
      progressText: `${mockInterviewsCount} Sessions Done`,
    },
    {
      id: 'assessment_master',
      title: 'Assessment Master',
      description: 'Completed IndiaBix-style MCQ & technical test assessments',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-blue-600',
      earned: assessmentCount >= 3,
      earnedDate: assessmentCount >= 3 ? 'Unlocked' : undefined,
      progressText: `${assessmentCount}/3 Assessments`,
    },
    {
      id: 'dsa_master',
      title: 'DSA Problem Solver',
      description: 'Solved algorithm problems with clean Big-O runtime and space',
      icon: Code,
      color: 'from-amber-500 to-orange-600',
      earned: codingSolvedCount >= 1,
      earnedDate: 'Unlocked',
      progressText: `${codingSolvedCount} Solved`,
    },
    {
      id: 'placement_ready',
      title: 'Tier-1 Placement Ready',
      description: 'Achieved >75% ML predicted campus placement likelihood',
      icon: Award,
      color: 'from-rose-500 to-pink-600',
      earned: placementProb >= 0.75,
      earnedDate: 'Unlocked',
      progressText: `${(placementProb * 100).toFixed(0)}% Probability`,
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" /> Milestone Badges & Gamification
          </CardTitle>
          <CardDescription className="text-xs">
            Unlock achievements by preparing resumes, practicing interviews, and applying for jobs.
          </CardDescription>
        </div>
        <Badge variant="secondary" className="gap-1 font-mono text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
          <Flame className="h-3.5 w-3.5 fill-amber-500" /> {earnedCount} / {badges.length} Unlocked
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id}
                whileHover={{ y: -3 }}
                className={`relative flex flex-col items-center justify-between rounded-2xl border p-4 text-center transition-all ${
                  b.earned
                    ? 'border-primary/30 bg-card shadow-xs hover:shadow-md'
                    : 'border-border/60 bg-muted/20 opacity-70'
                }`}
              >
                {b.earned ? (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px]">
                    <Lock className="h-3 w-3" />
                  </span>
                )}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md mb-2`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground leading-tight">{b.title}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{b.description}</p>
                </div>

                <Badge
                  variant={b.earned ? 'success' : 'outline'}
                  className="mt-3 text-[9px] font-mono px-2 py-0.5"
                >
                  {b.progressText}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Flame, TrendingUp, Sparkles, UserCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface LeaderboardStudent {
  rank: number;
  name: string;
  branch: string;
  gradYear: string;
  placementScore: number; // out of 100
  streakDays: number;
  dsaSolved: number;
  isCurrentUser?: boolean;
}

interface PlacementLeaderboardProps {
  currentStudentScore?: number;
  currentStudentStreak?: number;
}

export const PlacementLeaderboard: React.FC<PlacementLeaderboardProps> = ({
  currentStudentScore = 88,
  currentStudentStreak = 1,
}) => {
  const students: LeaderboardStudent[] = [
    {
      rank: 1,
      name: 'Aarav Sharma',
      branch: 'B.Tech CSE',
      gradYear: '2026',
      placementScore: 96,
      streakDays: 14,
      dsaSolved: 320,
    },
    {
      rank: 2,
      name: 'Ananya Patel',
      branch: 'B.Tech IT',
      gradYear: '2026',
      placementScore: 94,
      streakDays: 12,
      dsaSolved: 280,
    },
    {
      rank: 3,
      name: 'Rohan Gupta',
      branch: 'B.Tech CSE',
      gradYear: '2026',
      placementScore: 91,
      streakDays: 9,
      dsaSolved: 245,
    },
    {
      rank: 4,
      name: 'You (Candidate)',
      branch: 'B.Tech CSE',
      gradYear: '2026',
      placementScore: currentStudentScore,
      streakDays: currentStudentStreak,
      dsaSolved: 185,
      isCurrentUser: true,
    },
    {
      rank: 5,
      name: 'Vikram Verma',
      branch: 'B.Tech ECE',
      gradYear: '2026',
      placementScore: 84,
      streakDays: 5,
      dsaSolved: 160,
    },
  ];

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> Campus Placement Leaderboard
          </CardTitle>
          <CardDescription className="text-xs">
            Peer readiness rankings based on resume score, mock interviews & DSA solve streaks.
          </CardDescription>
        </div>

        <Badge variant="secondary" className="gap-1 font-mono text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">
          <Flame className="h-3.5 w-3.5 fill-amber-500" /> {currentStudentStreak}-Day Active Streak
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="space-y-2">
          {students.map((st) => (
            <motion.div
              key={st.rank}
              whileHover={{ scale: 1.005 }}
              className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                st.isCurrentUser
                  ? 'border-primary/50 bg-primary/10 shadow-sm font-bold'
                  : 'border-border/60 bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                    st.rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : st.rank === 2
                      ? 'bg-slate-300 text-slate-900'
                      : st.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  #{st.rank}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-foreground">{st.name}</span>
                    {st.isCurrentUser && (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0 bg-primary text-primary-foreground font-mono">
                        You
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {st.branch} • Class of {st.gradYear}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-muted-foreground block">DSA Solved</span>
                  <span className="font-mono font-bold text-foreground">{st.dsaSolved} Qs</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Placement Score</span>
                  <span className="font-mono font-black text-primary text-sm">{st.placementScore}/100</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

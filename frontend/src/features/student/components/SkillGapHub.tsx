import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillGapIllustration } from '@/components/illustrations/Illustrations';
import { BookOpen, ExternalLink, Sparkles, CheckCircle2, TrendingUp, Youtube, Code, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SkillGapItem {
  skillName: string;
  category: string;
  currentLevel: number; // out of 5
  requiredLevel: number; // out of 5
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  suggestedResource: {
    title: string;
    provider: string;
    url: string;
    type: 'YouTube' | 'FreeCodeCamp' | 'Documentation' | 'Article';
  };
}

interface SkillGapHubProps {
  targetRole?: string;
  gaps?: SkillGapItem[];
}

export const SkillGapHub: React.FC<SkillGapHubProps> = ({
  targetRole = 'Full Stack Engineer',
  gaps,
}) => {
  const defaultGaps: SkillGapItem[] = [
    {
      skillName: 'System Design & Load Balancing',
      category: 'Backend Architecture',
      currentLevel: 2,
      requiredLevel: 4,
      importance: 'CRITICAL',
      suggestedResource: {
        title: 'System Design Primer & Distributed Systems 101',
        provider: 'FreeCodeCamp / GitHub',
        url: 'https://github.com/donnemartin/system-design-primer',
        type: 'FreeCodeCamp',
      },
    },
    {
      skillName: 'Docker Containerization & Deployment',
      category: 'DevOps & Cloud',
      currentLevel: 2,
      requiredLevel: 4,
      importance: 'HIGH',
      suggestedResource: {
        title: 'Docker & Kubernetes Full Course for Beginners',
        provider: 'YouTube Tech World with Nana',
        url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
        type: 'YouTube',
      },
    },
    {
      skillName: 'pgvector Cosine Distance & Semantic Search',
      category: 'Database & AI',
      currentLevel: 3,
      requiredLevel: 5,
      importance: 'CRITICAL',
      suggestedResource: {
        title: 'PostgreSQL pgvector & Embeddings Integration Guide',
        provider: 'PostgreSQL Official Docs',
        url: 'https://github.com/pgvector/pgvector',
        type: 'Documentation',
      },
    },
    {
      skillName: 'Spring Security & JWT Authentication',
      category: 'Backend Java',
      currentLevel: 3,
      requiredLevel: 4,
      importance: 'MEDIUM',
      suggestedResource: {
        title: 'Spring Security 6 & JWT Token Crash Course',
        provider: 'GeeksforGeeks / Java Brains',
        url: 'https://www.geeksforGeeks.org/spring-security-tutorial/',
        type: 'Article',
      },
    },
  ];

  const skillGaps = gaps && gaps.length > 0 ? gaps : defaultGaps;

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> Target Role Skill Gap Diagnostics
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                {targetRole}
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              AI comparison between your parsed resume skills and real-time job posting requirements.
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="gap-1 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {skillGaps.length} Actionable Gaps Found
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {skillGaps.map((gap, idx) => {
            const gapDelta = gap.requiredLevel - gap.currentLevel;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-1">
                        {gap.category}
                      </Badge>
                      <h4 className="text-sm font-bold text-foreground">{gap.skillName}</h4>
                    </div>

                    <Badge
                      variant={
                        gap.importance === 'CRITICAL'
                          ? 'destructive'
                          : gap.importance === 'HIGH'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[10px] font-mono px-2 py-0.5"
                    >
                      {gap.importance} GAP
                    </Badge>
                  </div>

                  {/* Level Gauge Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>Current: Level {gap.currentLevel}/5</span>
                      <span>Target: Level {gap.requiredLevel}/5</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                      <div
                        className="h-full bg-primary rounded-l-full transition-all"
                        style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                      />
                      <div
                        className="h-full bg-amber-400 opacity-60 transition-all"
                        style={{ width: `${(gapDelta / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Free Learning Resource Recommendation Box */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                      <BookOpen className="h-3.5 w-3.5" /> Free Recommended Course
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono border-primary/30">
                      {gap.suggestedResource.type}
                    </Badge>
                  </div>
                  <p className="font-semibold text-foreground leading-snug">{gap.suggestedResource.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>Source: {gap.suggestedResource.provider}</span>
                    <a
                      href={gap.suggestedResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                    >
                      Start Learning <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

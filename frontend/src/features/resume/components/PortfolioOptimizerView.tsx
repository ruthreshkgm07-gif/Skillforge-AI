import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Github,
  Award,
  AlertCircle,
  CheckCircle2,
  FolderGit2,
  FileText,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Star,
  Code2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AlignmentIssue {
  issue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  fixSuggestion: string;
}

interface PinnedRepoSuggestion {
  repoName: string;
  reasonToFeature: string;
  targetSkillHighlight: string;
}

interface MissingProjectSuggestion {
  title: string;
  rationale: string;
  techStack: string[];
  alignedSkillGap: string;
}

interface ResumeRewriteSuggestion {
  section: string;
  originalBullet: string;
  suggestedRewrite: string;
  githubEvidence: string;
}

interface GithubStatsSummary {
  username: string;
  publicReposCount: number;
  totalStars: number;
  topLanguages: string[];
  hasReadmeSignal: boolean;
}

interface PortfolioOptimizationResponse {
  id: string;
  studentId: string;
  githubUrl: string | null;
  portfolioScore: number;
  alignmentIssues: AlignmentIssue[];
  pinnedRepoSuggestions: PinnedRepoSuggestion[];
  missingProjectSuggestions: MissingProjectSuggestion[];
  resumeRewriteSuggestions: ResumeRewriteSuggestion[];
  githubStats: GithubStatsSummary | null;
  analyzedAt: string;
}

export const PortfolioOptimizerView: React.FC = () => {
  const queryClient = useQueryClient();
  const [githubInput, setGithubInput] = useState<string>('');

  const { data, isLoading } = useQuery<any>({
    queryKey: ['portfolio-optimizer'],
    queryFn: () => apiClient.get('/student/portfolio-optimizer'),
  });

  const analyzeMutation = useMutation({
    mutationFn: (githubUrl?: string) =>
      apiClient.post<any>('/student/portfolio-optimizer/analyze', { githubUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-optimizer'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });

  const optData: PortfolioOptimizationResponse | null = data?.data || null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasGithub = Boolean(optData?.githubUrl || optData?.githubStats?.username !== 'N/A');

  return (
    <div className="space-y-8 pb-12">
      {/* GitHub URL Confirmation / Input Banner */}
      <Card className="border-primary/40 bg-card shadow-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background font-bold shrink-0">
              <Github className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">GitHub Profile Connection</h3>
                {hasGithub ? (
                  <Badge variant="default" className="bg-success text-success-foreground text-[10px] font-bold">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] font-bold text-destructive">
                    Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasGithub
                  ? `Connected to ${optData?.githubUrl || 'GitHub profile'}. Repositories cross-analyzed.`
                  : 'Add your GitHub URL for full repository cross-analysis & verified code evidence.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {!hasGithub && (
              <input
                type="text"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                placeholder="https://github.com/username"
                className="rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-primary flex-1 md:w-64"
              />
            )}
            <Button
              variant="gradient"
              size="sm"
              className="gap-2 shrink-0 text-xs"
              disabled={analyzeMutation.isPending}
              onClick={() => analyzeMutation.mutate(githubInput || undefined)}
            >
              <Sparkles className="h-4 w-4" />
              {analyzeMutation.isPending ? 'Cross-Analyzing...' : 'Analyze Portfolio & Resume'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {optData && (
        <div className="space-y-8">
          {/* Stats Summary Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Combined Portfolio Score
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-3xl font-extrabold text-primary">{optData.portfolioScore} / 100</div>
                <p className="text-[11px] text-muted-foreground mt-1">Cross-aligned with target role</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Public Repositories
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-3xl font-extrabold text-foreground flex items-center gap-2">
                  <FolderGit2 className="h-6 w-6 text-primary" /> {optData.githubStats?.publicReposCount || 0}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Analyzed codebases</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Total GitHub Stars
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-3xl font-extrabold text-warning flex items-center gap-2">
                  <Star className="h-6 w-6 text-warning" /> {optData.githubStats?.totalStars || 0}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Community recognition</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Primary Tech Languages
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="flex flex-wrap gap-1">
                  {optData.githubStats?.topLanguages?.map((lang, i) => (
                    <Badge key={i} variant="secondary" className="text-[11px] font-semibold px-2 py-0.5">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actionable Alignment Issues Checklist */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" /> Alignment Inconsistencies & Checklist
            </h2>
            <div className="space-y-3">
              {optData.alignmentIssues?.map((item, index) => (
                <Card key={index} className="border-border/80 shadow-xs hover:border-destructive/40 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{item.issue}</span>
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            {item.severity} Severity
                          </Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground leading-relaxed">
                          <strong className="text-primary">Action Fix:</strong> {item.fixSuggestion}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Before/After Resume Bullet Rewrites Diff UI */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Before / After Resume Bullet Rewrites (Diff View)
            </h2>
            <div className="space-y-4">
              {optData.resumeRewriteSuggestions?.map((rewrite, index) => (
                <Card key={index} className="border-border/80 shadow-xs overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-secondary/40 border-b flex flex-row items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{rewrite.section}</span>
                    <Badge variant="outline" className="text-[11px] text-primary border-primary/30">
                      {rewrite.githubEvidence}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    {/* Original Bullet (Red Tint) */}
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive-foreground">
                      <span className="font-bold text-destructive block mb-1 text-[11px] uppercase tracking-wider">
                        Original Resume Bullet
                      </span>
                      <p className="line-through opacity-80 text-xs italic">"{rewrite.originalBullet}"</p>
                    </div>

                    <div className="flex justify-center my-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                    </div>

                    {/* Suggested Rewrite (Green Tint) */}
                    <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-foreground">
                      <span className="font-bold text-success block mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> AI Verified Rewrite
                      </span>
                      <p className="font-semibold text-xs leading-relaxed">{rewrite.suggestedRewrite}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Suggested Next Projects */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-accent" /> Suggested Next Projects (Aligned with Skill Gap)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {optData.missingProjectSuggestions?.map((proj, index) => (
                <Card key={index} className="border-border/80 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-bold text-foreground">{proj.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] font-bold text-primary">
                        Fills: {proj.alignedSkillGap}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1 text-xs">
                    <p className="text-muted-foreground leading-relaxed">{proj.rationale}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.techStack?.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-medium">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioOptimizerView;

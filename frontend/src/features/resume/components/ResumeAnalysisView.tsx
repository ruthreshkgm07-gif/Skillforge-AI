import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  ExternalLink,
  Target,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export interface SkillSuggestion {
  skill: string;
  level: 'Strong' | 'Moderate' | 'Needs More Evidence' | string;
  evidenceFound: string;
  suggestion: string;
}

interface ResumeAnalysisViewProps {
  data: {
    atsScore: number;
    resumeScore: number;
    strengths: string[];
    weaknesses: string[];
    missingKeywords: string[];
    formattingIssues: string[];
    skillSuggestions?: SkillSuggestion[];
    sectionFeedback: {
      summary?: { score: number; feedback: string; suggestions: string[] };
      experience?: { score: number; feedback: string; suggestions: string[] };
      education?: { score: number; feedback: string; suggestions: string[] };
      skills?: { score: number; feedback: string; suggestions: string[] };
      projects?: { score: number; feedback: string; suggestions: string[] };
    };
  };
  fileUrl?: string;
  uploadedAt?: string;
}

export const ResumeAnalysisView: React.FC<ResumeAnalysisViewProps> = ({ data, fileUrl, uploadedAt }) => {
  const atsGaugeData = [{ name: 'ATS Score', value: data.atsScore, fill: 'hsl(var(--primary))' }];
  const resumeGaugeData = [{ name: 'Resume Score', value: data.resumeScore, fill: 'hsl(var(--accent))' }];

  return (
    <div className="space-y-8">
      {/* Top Header Card with Dual Score Gauges */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ATS Score Gauge */}
        <Card className="relative overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                ATS Compatibility Score
              </CardTitle>
              <CardDescription className="text-xs">Parseability by recruiter tracking systems</CardDescription>
            </div>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <div>
              <div className="text-4xl font-extrabold text-foreground">{data.atsScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span></div>
              <p className="mt-2 text-xs font-semibold text-success flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> High Keyword Alignment
              </p>
            </div>
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={atsGaugeData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overall Resume Quality Gauge */}
        <Card className="relative overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Overall Resume Quality
              </CardTitle>
              <CardDescription className="text-xs">Content depth, impact metrics & design</CardDescription>
            </div>
            <div className="rounded-xl bg-accent/10 p-2 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <div>
              <div className="text-4xl font-extrabold text-foreground">{data.resumeScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span></div>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Uploaded Document
                </a>
              )}
            </div>
            <div className="h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={resumeGaugeData} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Strengths vs Weaknesses */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card className="border-success/30 bg-success/5 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-success flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {data.strengths.map((str, i) => (
              <div key={i} className="flex items-start gap-2 text-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weaknesses & Improvements */}
        <Card className="border-warning/30 bg-warning/5 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-warning flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Critical Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {data.weaknesses.map((weak, i) => (
              <div key={i} className="flex items-start gap-2 text-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                <span>{weak}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Missing Keywords Chips */}
      {data.missingKeywords && data.missingKeywords.length > 0 && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> Recommended Missing Keywords
            </CardTitle>
            <CardDescription className="text-xs">
              Adding these relevant tech stack keywords will increase your ATS screening rank
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.missingKeywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="border-primary/40 text-primary bg-primary/5 px-3 py-1 font-medium text-xs">
                + {kw}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skill-Wise Focus Areas & Depth Assessment */}
      {data.skillSuggestions && data.skillSuggestions.length > 0 && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Skill-Wise Focus Areas & Depth Assessment
              </span>
              <Badge variant="outline" className="font-mono text-xs font-normal">
                {data.skillSuggestions.length} Skills Analyzed
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              AI-evaluated evidence depth and specific improvement recommendations per skill
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...data.skillSuggestions]
              .sort((a, b) => {
                const priority: Record<string, number> = {
                  'Needs More Evidence': 1,
                  'Moderate': 2,
                  'Strong': 3,
                };
                return (priority[a.level] || 4) - (priority[b.level] || 4);
              })
              .map((item: SkillSuggestion, idx: number) => {
                const isNeedsEvidence = item.level?.toLowerCase().includes('needs');
                const isModerate = item.level?.toLowerCase().includes('moderate');
                const isStrong = item.level?.toLowerCase().includes('strong');

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 transition-all space-y-2 shadow-xs ${
                      isNeedsEvidence
                        ? 'border-destructive/30 bg-destructive/5'
                        : isModerate
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-success/30 bg-success/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-foreground">{item.skill}</span>
                        {isStrong && (
                          <Badge variant="success" className="gap-1 px-2 py-0.5 text-xs font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> Strong
                          </Badge>
                        )}
                        {isModerate && (
                          <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs font-semibold border-warning/40 text-warning bg-warning/10">
                            <TrendingUp className="h-3 w-3" /> Moderate
                          </Badge>
                        )}
                        {isNeedsEvidence && (
                          <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-xs font-semibold">
                            <AlertTriangle className="h-3 w-3" /> Needs More Evidence
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 text-muted-foreground">
                      <p className="flex items-start gap-1.5 text-foreground/90 font-medium">
                        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span><strong>Evidence Found:</strong> {item.evidenceFound}</span>
                      </p>
                      <p className="flex items-start gap-1.5 text-foreground font-normal bg-background/60 p-2.5 rounded-lg border border-border/50">
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span><strong>Recommendation:</strong> {item.suggestion}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Collapsible Section-by-Section Feedback Accordion */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" /> Granular Section Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="experience" className="w-full">
            {data.sectionFeedback.summary && (
              <AccordionItem value="summary">
                <AccordionTrigger className="text-sm font-semibold">
                  <span>Professional Summary</span>
                  <Badge variant="secondary" className="mr-3">{data.sectionFeedback.summary.score}/100</Badge>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                  <p>{data.sectionFeedback.summary.feedback}</p>
                  {data.sectionFeedback.summary.suggestions.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-foreground">
                      {data.sectionFeedback.summary.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {data.sectionFeedback.experience && (
              <AccordionItem value="experience">
                <AccordionTrigger className="text-sm font-semibold">
                  <span>Work Experience & Impact</span>
                  <Badge variant="secondary" className="mr-3">{data.sectionFeedback.experience.score}/100</Badge>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                  <p>{data.sectionFeedback.experience.feedback}</p>
                  {data.sectionFeedback.experience.suggestions.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-foreground">
                      {data.sectionFeedback.experience.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {data.sectionFeedback.skills && (
              <AccordionItem value="skills">
                <AccordionTrigger className="text-sm font-semibold">
                  <span>Skills & Technology Taxonomy</span>
                  <Badge variant="secondary" className="mr-3">{data.sectionFeedback.skills.score}/100</Badge>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                  <p>{data.sectionFeedback.skills.feedback}</p>
                  {data.sectionFeedback.skills.suggestions.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-foreground">
                      {data.sectionFeedback.skills.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {data.sectionFeedback.projects && (
              <AccordionItem value="projects">
                <AccordionTrigger className="text-sm font-semibold">
                  <span>Projects & Portfolio</span>
                  <Badge variant="secondary" className="mr-3">{data.sectionFeedback.projects.score}/100</Badge>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                  <p>{data.sectionFeedback.projects.feedback}</p>
                  {data.sectionFeedback.projects.suggestions.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 text-foreground">
                      {data.sectionFeedback.projects.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeAnalysisView;

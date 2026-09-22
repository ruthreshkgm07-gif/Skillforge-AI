import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CertificateSeal } from '@/components/illustrations/Illustrations';
import { Printer, Download, Sparkles, CheckCircle2, ShieldCheck, FileText, Award, User, Calendar } from 'lucide-react';

export interface ReportData {
  studentName: string;
  targetRole: string;
  reportType: 'RESUME_ATS' | 'MOCK_INTERVIEW';
  overallScore: number;
  atsScore?: number;
  date: string;
  categoryScores?: Array<{ category: string; score: number }>;
  skillsAnalyzed?: Array<{ name: string; score: number; category: string }>;
  summaryText?: string;
  keyStrengths?: string[];
  strengths: string[];
  recommendations: string[];
  verificationId?: string;
}

interface PrintableScoreReportProps {
  data: ReportData;
  onClose?: () => void;
}

export const PrintableScoreReport: React.FC<PrintableScoreReportProps> = ({ data, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { letter: 'A+', label: 'Outstanding Placement Ready' };
    if (score >= 80) return { letter: 'A', label: 'Tier-1 Candidate Ready' };
    if (score >= 70) return { letter: 'B+', label: 'Good - Core Skills Verified' };
    return { letter: 'B', label: 'Needs Minor Enhancements' };
  };

  const grade = getGrade(data.overallScore);

  return (
    <div className="space-y-4">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden bg-muted/40 p-3 rounded-2xl border">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Official SkillForge AI Placement Verification Report Card</span>
        </div>
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close Preview
            </Button>
          )}
          <Button variant="gradient" size="sm" onClick={handlePrint} className="gap-2 text-xs font-bold shadow-md">
            <Printer className="h-4 w-4" /> Download / Save as PDF
          </Button>
        </div>
      </div>

      {/* Report Card Body (Formatted for Screen & Print) */}
      <div
        ref={reportRef}
        className="mx-auto max-w-3xl rounded-3xl bg-white text-slate-900 border-2 border-primary/30 p-8 shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
      >
        {/* Certificate / Report Card Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-sm">
                SF
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SkillForge AI
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
              {data.reportType === 'RESUME_ATS' ? 'ATS RESUME SCORE REPORT' : 'AI MOCK INTERVIEW DIAGNOSTIC REPORT'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Verified Candidate Evaluation • SkillForge Talent Analytics Engine
            </p>
          </div>

          <CertificateSeal className="w-20 h-20 shrink-0" />
        </div>

        {/* Candidate Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50 p-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Candidate Name</span>
            <span className="font-extrabold text-slate-800 text-sm">{data.studentName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Target Role</span>
            <span className="font-bold text-slate-800">{data.targetRole}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Evaluation Date</span>
            <span className="font-bold text-slate-800">{data.date}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Report ID</span>
            <span className="font-mono font-bold text-indigo-600">{data.verificationId || 'SF-2026-8921'}</span>
          </div>
        </div>

        {/* Score & Grade Display Banner */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-900 p-6 text-white shadow-md">
          <div>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Overall Verified Score</span>
            <div className="text-4xl font-black tracking-tight text-white mt-1">
              {data.overallScore} <span className="text-lg font-normal text-indigo-300">/ 100</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {grade.label}
            </p>
          </div>

          <div className="text-right">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white text-3xl font-black border border-white/20 ml-auto">
              {grade.letter}
            </div>
            <span className="text-[10px] text-slate-300 font-mono block mt-1">Official SkillForge Grade</span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" /> Category Breakdown Metrics
          </h3>
          <div className="space-y-2">
            {(data.categoryScores || []).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs">
                <span className="font-bold text-slate-700">{cat.category}</span>
                <div className="flex items-center space-x-3 w-1/2">
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-900 w-10 text-right">{cat.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Actionable Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Key Verified Strengths
            </h4>
            <ul className="space-y-1 text-slate-700 pl-4 list-disc text-[11px]">
              {data.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 space-y-2">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="h-4 w-4 text-indigo-600" /> Recommended Action Items
            </h4>
            <ul className="space-y-1 text-slate-700 pl-4 list-disc text-[11px]">
              {data.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Seal & Sign-off */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[10px] text-slate-500">
          <p>© 2026 SkillForge AI Ecosystem • Generated for College Placement Verification</p>
          <div className="flex items-center space-x-1 font-mono text-emerald-600 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Authenticated Report
          </div>
        </div>
      </div>
    </div>
  );
};

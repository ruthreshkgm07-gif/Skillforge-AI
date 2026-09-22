import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, GraduationCap, Briefcase, Calendar, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OnboardingData {
  targetRole: string;
  degreeBranch: string;
  graduationYear: string;
  targetSalaryLpa: string;
}

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [step, setStep] = useState<number>(1);
  const [targetRole, setTargetRole] = useState<string>(initialData?.targetRole || 'Full Stack Engineer');
  const [degreeBranch, setDegreeBranch] = useState<string>(initialData?.degreeBranch || 'B.Tech - Computer Science (CSE)');
  const [graduationYear, setGraduationYear] = useState<string>(initialData?.graduationYear || '2026');
  const [targetSalaryLpa, setTargetSalaryLpa] = useState<string>(initialData?.targetSalaryLpa || '12.5');

  const popularRoles = [
    'Full Stack Engineer',
    'Backend Spring Boot Developer',
    'Frontend React Specialist',
    'Data Engineer / Analyst',
    'AI & ML Application Engineer',
    'DevOps & Cloud Engineer',
  ];

  const popularBranches = [
    'B.Tech - Computer Science (CSE)',
    'B.Tech - Information Technology (IT)',
    'B.Tech - Electronics & Comm (ECE)',
    'MCA - Master of Computer Apps',
    'BCA / B.Sc Computer Science',
  ];

  const years = ['2024', '2025', '2026', '2027', '2028'];

  const handleFinish = () => {
    const data: OnboardingData = {
      targetRole,
      degreeBranch,
      graduationYear,
      targetSalaryLpa,
    };
    localStorage.setItem('skillforge_student_onboarding', JSON.stringify(data));
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-3xl bg-card border border-primary/20 shadow-2xl overflow-hidden text-card-foreground"
        >
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-slate-900 via-primary/90 to-slate-900 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white/70 hover:text-white rounded-full p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-[10px]">
                Student Placement Setup
              </Badge>
            </div>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight">Personalize Your Placement Journey</h2>
            <p className="text-xs text-slate-300 mt-1">
              Help SkillForge AI customize job recommendations, skill gap alerts, and career roadmaps.
            </p>

            {/* Step Progress Dots */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    s <= step ? 'bg-amber-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-primary" /> What is your primary target career role?
                  </label>
                  <p className="text-[11px] text-muted-foreground">Select one or type your custom dream title.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        targetRole === role
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border hover:bg-muted text-foreground'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Or enter custom role (e.g. Android Engineer)"
                    className="rounded-xl text-xs"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-primary" /> What is your Degree & Branch?
                  </label>
                  <p className="text-[11px] text-muted-foreground">Used for campus placement eligibility filters.</p>
                </div>

                <div className="space-y-2">
                  {popularBranches.map((branch) => (
                    <button
                      key={branch}
                      type="button"
                      onClick={() => setDegreeBranch(branch)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        degreeBranch === branch
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border hover:bg-muted text-foreground'
                      }`}
                    >
                      {branch}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" /> Graduation Year & Target Package
                  </label>
                  <p className="text-[11px] text-muted-foreground">Set your expected graduation timeline & salary goal.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground mb-1 block">Graduation Batch Year</span>
                    <div className="flex flex-wrap gap-2">
                      {years.map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setGraduationYear(yr)}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                            graduationYear === yr
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'border-border hover:bg-muted text-foreground'
                          }`}
                        >
                          Class of {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground block">Target Salary Package (LPA in ₹ Lakhs)</span>
                    <Input
                      type="number"
                      value={targetSalaryLpa}
                      onChange={(e) => setTargetSalaryLpa(e.target.value)}
                      placeholder="e.g. 12.5"
                      className="rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {step > 1 ? (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                  Previous
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Skip Setup
                </Button>
              )}

              {step < 3 ? (
                <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1.5 font-bold">
                  Next Step <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" variant="gradient" onClick={handleFinish} className="gap-1.5 font-bold shadow-md">
                  <CheckCircle2 className="h-4 w-4" /> Save Profile & Launch
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StudentBadges } from '@/features/student/components/StudentBadges';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Github,
  Linkedin,
  Phone,
  Edit3,
  CheckCircle2,
  Save,
  X,
  Sparkles,
  Award,
  Code,
  Globe,
  AlertCircle,
  GraduationCap,
  Calendar,
  Trophy,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi, StudentProfileData } from '../services/profileApi';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Editing State
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    targetRole: string;
    headline: string;
    bio: string;
    phone: string;
    githubUrl: string;
    linkedinUrl: string;
    skillsInput: string;
    degreeBranch: string;
    graduationYear: string;
  }>({
    fullName: '',
    email: '',
    targetRole: '',
    headline: '',
    bio: '',
    phone: '',
    githubUrl: '',
    linkedinUrl: '',
    skillsInput: '',
    degreeBranch: '',
    graduationYear: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      const savedOnboarding = localStorage.getItem('skillforge_student_onboarding');
      let ob: any = null;
      if (savedOnboarding) {
        try { ob = JSON.parse(savedOnboarding); } catch (e) {}
      }

      setProfile(data);
      setFormData({
        fullName: data.fullName || user?.fullName || '',
        email: data.email || user?.email || '',
        targetRole: data.targetRole || ob?.targetRole || 'Full Stack Engineer',
        headline: data.headline || 'Full Stack Engineer & Core CS Developer',
        bio: data.bio || 'Passionate engineering student specializing in Java Spring Boot, React, and AI applications.',
        phone: data.phone || '+91 98765 43210',
        githubUrl: data.githubUrl || 'https://github.com',
        linkedinUrl: data.linkedinUrl || 'https://linkedin.com',
        skillsInput: data.skills ? data.skills.join(', ') : 'Java, React, SQL, Spring Boot, Data Structures, Python',
        degreeBranch: ob?.degreeBranch || 'B.Tech - Computer Science (CSE)',
        graduationYear: ob?.graduationYear || '2026',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setFormData({
        fullName: user?.fullName || 'Ruthra Kumar',
        email: user?.email || 'student@skillforge.ai',
        targetRole: 'Full Stack Engineer',
        headline: 'Full Stack Engineer & Core CS Developer',
        bio: 'Passionate engineering student specializing in Java Spring Boot, React, and AI applications.',
        phone: '+91 98765 43210',
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com',
        skillsInput: 'Java, React, SQL, Spring Boot, Data Structures, Python',
        degreeBranch: 'B.Tech - Computer Science (CSE)',
        graduationYear: '2026',
      });
    } fontinally: {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      const parsedSkills = formData.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updated = await profileApi.updateProfile({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        targetRole: formData.targetRole.trim(),
        headline: formData.headline.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim(),
        githubUrl: formData.githubUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        skills: parsedSkills,
      });

      localStorage.setItem(
        'skillforge_student_onboarding',
        JSON.stringify({
          targetRole: formData.targetRole,
          degreeBranch: formData.degreeBranch,
          graduationYear: formData.graduationYear,
        })
      );

      setProfile(updated);
      setIsEditing(false);
      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const skillsList = profile?.skills && profile.skills.length > 0
    ? profile.skills
    : formData.skillsInput.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

  return (
    <div className="container mx-auto space-y-8 pb-16 font-sans">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary/80 to-slate-900 p-8 text-white shadow-xl border border-primary/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-extrabold text-3xl shadow-xl ring-4 ring-white/10">
              {formData.fullName ? formData.fullName[0].toUpperCase() : 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{formData.fullName || 'Student Profile'}</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  Verified Candidate
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  Level: {profile?.codingLevel || 'Beginner'} ({profile?.codingScore || 0} pts)
                </Badge>
              </div>
              <p className="text-sm text-slate-300 font-medium">{formData.headline}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-amber-300" /> {formData.targetRole}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-amber-300" /> {formData.degreeBranch}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-amber-300" /> Class of {formData.graduationYear}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="secondary"
            className="gap-2 font-bold shadow-md bg-white text-primary hover:bg-white/90 shrink-0 py-5 px-6"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </Button>
        </div>
      </motion.div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* EDIT PROFILE FORM */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/40 shadow-xl bg-card p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Full Name *</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Target Role Title</label>
                    <Input
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Degree & Branch</label>
                    <Input
                      value={formData.degreeBranch}
                      onChange={(e) => setFormData({ ...formData, degreeBranch: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Graduation Batch Year</label>
                    <Input
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Technical Skills (Comma-separated)</label>
                  <Input
                    value={formData.skillsInput}
                    onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="gap-2 font-bold shadow-md">
                    {saving ? <Sparkles className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAMIFIED MILESTONES SUMMARY */}
      <StudentBadges
        hasResume={true}
        mockInterviewsCount={1}
        assessmentCount={4}
        codingSolvedCount={185}
        placementProb={0.88}
        codingLevel={profile?.codingLevel || 'Beginner'}
        codingScore={profile?.codingScore || 0}
      />

      {/* READ-ONLY PROFILE OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/80 shadow-xs p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" /> Candidate Summary & Bio
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {formData.bio}
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Contact & Developer Links
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a
                href={formData.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border bg-muted/30 hover:bg-primary/10 transition-colors font-medium text-foreground"
              >
                <Github className="h-4 w-4 text-primary" /> GitHub Profile
              </a>
              <a
                href={formData.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border bg-muted/30 hover:bg-primary/10 transition-colors font-medium text-foreground"
              >
                <Linkedin className="h-4 w-4 text-primary" /> LinkedIn Profile
              </a>
            </div>
          </div>
        </Card>

        <Card className="border-border/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          {/* Coding Skill Level Progress Card */}
          <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-muted/20 to-accent/5 border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" /> Coding Skill Level
              </span>
              <Badge variant="outline" className="text-[10px] font-mono font-bold border-primary/30 text-primary">
                {profile?.codingLevel || 'Beginner'}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Score: {profile?.codingScore || 0}/100</span>
                <span>
                  {profile?.codingLevel === 'Expert' ? 'Max Tier' :
                   profile?.codingLevel === 'Advanced' ? 'Next: Expert (90+)' :
                   profile?.codingLevel === 'Intermediate' ? 'Next: Advanced (70+)' : 'Next: Intermediate (40+)'}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      profile?.codingLevel === 'Expert' ? 100 :
                      profile?.codingLevel === 'Advanced' ? Math.min(100, Math.max(10, ((profile?.codingScore || 70) - 70) * 5)) :
                      profile?.codingLevel === 'Intermediate' ? Math.min(100, Math.max(10, ((profile?.codingScore || 40) - 40) * 3.33)) :
                      Math.min(100, Math.max(10, (profile?.codingScore || 0) * 2.5))
                    }%`
                  }}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Tiers: 0-39 Beginner • 40-69 Intermediate • 70-89 Advanced • 90-100 Expert
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" /> Verified Skills ({skillsList.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

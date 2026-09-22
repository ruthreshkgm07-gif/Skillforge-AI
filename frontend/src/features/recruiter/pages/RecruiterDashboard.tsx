import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  Briefcase,
  Users,
  Brain,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sliders,
  MapPin,
  Building2,
  BarChart3,
  Columns,
  Building,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requiredSkills: string;
  minExperience: number;
  location: string;
  salaryMin: number;
  salaryMax: number;
  employmentType: string;
  status: string;
}

interface MatchedCandidate {
  studentId: string;
  fullName: string;
  headline: string;
  avatarUrl: string;
  targetRole: string;
  matchScore: number;
  matchType: string;
  aiFitExplanation: string;
  resumeUrl: string;
  applicationStatus: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'HIRED' | 'REJECTED' | 'NOT_APPLIED';
  topSkills: string[];
}

interface CompanyProfile {
  id: string;
  name: string;
  logoUrl: string;
  industry: string;
  website: string;
  description: string;
  location: string;
}

interface RecruiterAnalytics {
  totalActiveJobs: number;
  totalApplicants: number;
  shortlistedCount: number;
  avgMatchScore: number;
  applicationsPerJob: Array<{ jobTitle: string; applicantCount: number }>;
  matchDistribution: Array<{ range: string; candidateCount: number }>;
  applicantSkillGaps: Array<{ skillName: string; missingCandidatesCount: number; gapPercentage: number }>;
}

export const RecruiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'KANBAN' | 'JOBS' | 'COMPANY' | 'ANALYTICS'>('KANBAN');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showCompanyModal, setShowCompanyModal] = useState<boolean>(false);

  // Job Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [minExperience, setMinExperience] = useState(2);
  const [location, setLocation] = useState('Remote');

  // Company Form State
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compLogoUrl, setCompLogoUrl] = useState('');
  const [compDescription, setCompDescription] = useState('');

  // Queries
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery<any>({
    queryKey: ['recruiter-jobs'],
    queryFn: () => apiClient.get('/recruiter/jobs'),
  });

  const jobs: JobPosting[] = jobsData?.data || [];
  const activeJobId = selectedJobId || (jobs.length > 0 ? jobs[0].id : null);

  const { data: candidateData, isLoading: isLoadingCandidates } = useQuery<any>({
    queryKey: ['matched-candidates', activeJobId],
    queryFn: () => apiClient.get(`/recruiter/jobs/${activeJobId}/candidates`),
    enabled: Boolean(activeJobId),
  });

  const candidates: MatchedCandidate[] = candidateData?.data || [];

  const { data: companyData } = useQuery<any>({
    queryKey: ['recruiter-company'],
    queryFn: () => apiClient.get('/recruiter/company'),
  });

  const company: CompanyProfile | null = companyData?.data || null;

  const { data: analyticsData } = useQuery<any>({
    queryKey: ['recruiter-analytics'],
    queryFn: () => apiClient.get('/recruiter/analytics'),
  });

  const analytics: RecruiterAnalytics | null = analyticsData?.data || null;

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/recruiter/jobs', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      setShowCreateModal(false);
      resetJobForm();
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (payload: any) => apiClient.put('/recruiter/company', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-company'] });
      setShowCompanyModal(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ jobId, studentId, status }: { jobId: string; studentId: string; status: string }) =>
      apiClient.post(`/recruiter/jobs/${jobId}/candidates/${studentId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matched-candidates', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-analytics'] });
    },
  });

  const resetJobForm = () => {
    setTitle('');
    setDescription('');
    setSkillsStr('');
    setMinExperience(2);
    setLocation('Remote');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsList = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
    createJobMutation.mutate({
      title,
      description,
      requiredSkills: skillsList.length > 0 ? skillsList : ['Java', 'Spring Boot', 'React.js'],
      minExperience,
      location,
      salaryMin: 120000,
      salaryMax: 160000,
      employmentType: 'FULL_TIME',
    });
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyMutation.mutate({
      name: compName || company?.name,
      industry: compIndustry || company?.industry,
      website: compWebsite || company?.website,
      logoUrl: compLogoUrl || company?.logoUrl,
      description: compDescription || company?.description,
      location: company?.location || 'San Francisco, CA',
    });
  };

  // Group candidates into Kanban columns
  const kanbanColumns = {
    APPLIED: candidates.filter((c) => c.applicationStatus === 'APPLIED' || c.applicationStatus === 'NOT_APPLIED'),
    SHORTLISTED: candidates.filter((c) => c.applicationStatus === 'SHORTLISTED'),
    INTERVIEW: candidates.filter((c) => c.applicationStatus === 'INTERVIEW'),
    HIRED: candidates.filter((c) => c.applicationStatus === 'HIRED'),
    REJECTED: candidates.filter((c) => c.applicationStatus === 'REJECTED'),
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">SkillForge AI</span>
            <Badge variant="outline" className="border-primary/40 text-primary">Recruiter Portal</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              {user?.fullName || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 text-xs">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Workspace Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {company?.name || 'SkillForge Partner Enterprise'} 💼
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kanban pipeline, automated candidate email notifications, pgvector similarity matching & applicant skill gap analytics.
            </p>
          </div>

          <Button variant="gradient" size="sm" className="gap-2 text-xs" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border/80 space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('KANBAN')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'KANBAN' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Columns className="h-4 w-4" /> Kanban Pipeline
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('JOBS')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'JOBS' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Briefcase className="h-4 w-4" /> Job Postings ({jobs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'ANALYTICS' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Applicant Analytics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPANY')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'COMPANY' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="h-4 w-4" /> Company Profile
          </button>
        </div>

        {/* Create Job Posting Modal Form */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card className="border-primary/40 bg-card shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Post New Job (Auto-Vector Embedded)</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold">Job Title</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Senior Full Stack Engineer"
                          className="w-full rounded-lg border bg-background p-2.5"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold">Location</label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Remote / New York, NY"
                          className="w-full rounded-lg border bg-background p-2.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold">Required Skills (multi-select comma separated)</label>
                      <input
                        type="text"
                        value={skillsStr}
                        onChange={(e) => setSkillsStr(e.target.value)}
                        placeholder="Java, Spring Boot, React.js, PostgreSQL, Docker"
                        className="w-full rounded-lg border bg-background p-2.5"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border bg-background p-2.5"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="gradient" size="sm" type="submit" disabled={createJobMutation.isPending}>
                        Publish Job Posting
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: KANBAN APPLICANT PIPELINE */}
        {activeTab === 'KANBAN' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Applicant Pipeline Board</h2>
              <Badge variant="outline" className="text-xs text-primary border-primary/30 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Spring Mail Email Triggers Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Column 1: APPLIED */}
              <div className="bg-secondary/30 rounded-xl p-3 space-y-3 border">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Applied
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{kanbanColumns.APPLIED.length}</Badge>
                </div>
                <div className="space-y-3">
                  {kanbanColumns.APPLIED.map((c) => (
                    <Card key={c.studentId} className="border-border/80 p-3 space-y-2 text-xs hover:border-primary/40 transition-colors">
                      <div className="font-bold text-foreground">{c.fullName}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{c.headline}</div>
                      <Badge variant="default" className="text-[10px]">{c.matchScore}% Match</Badge>
                      <div className="pt-2 flex justify-end gap-1 border-t">
                        <Button
                          variant="gradient"
                          size="sm"
                          className="h-7 text-[10px] px-2"
                          onClick={() => activeJobId && statusMutation.mutate({ jobId: activeJobId, studentId: c.studentId, status: 'SHORTLISTED' })}
                        >
                          Shortlist →
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Column 2: SHORTLISTED */}
              <div className="bg-primary/5 rounded-xl p-3 space-y-3 border border-primary/20">
                <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-primary">
                    <UserCheck className="h-4 w-4" /> Shortlisted
                  </span>
                  <Badge variant="default" className="text-[10px]">{kanbanColumns.SHORTLISTED.length}</Badge>
                </div>
                <div className="space-y-3">
                  {kanbanColumns.SHORTLISTED.map((c) => (
                    <Card key={c.studentId} className="border-primary/30 p-3 space-y-2 text-xs">
                      <div className="font-bold text-foreground">{c.fullName}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{c.headline}</div>
                      <Badge variant="default" className="text-[10px] bg-primary">{c.matchScore}% Match</Badge>
                      <div className="pt-2 flex justify-end gap-1 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] px-2 text-accent border-accent/40"
                          onClick={() => activeJobId && statusMutation.mutate({ jobId: activeJobId, studentId: c.studentId, status: 'INTERVIEW' })}
                        >
                          Interview →
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Column 3: INTERVIEW */}
              <div className="bg-accent/5 rounded-xl p-3 space-y-3 border border-accent/20">
                <div className="flex items-center justify-between pb-2 border-b border-accent/20">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-accent">
                    <Sparkles className="h-4 w-4" /> Interview
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{kanbanColumns.INTERVIEW.length}</Badge>
                </div>
                <div className="space-y-3">
                  {kanbanColumns.INTERVIEW.map((c) => (
                    <Card key={c.studentId} className="border-accent/30 p-3 space-y-2 text-xs">
                      <div className="font-bold text-foreground">{c.fullName}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{c.headline}</div>
                      <Badge variant="secondary" className="text-[10px]">{c.matchScore}% Match</Badge>
                      <div className="pt-2 flex justify-end gap-1 border-t">
                        <Button
                          variant="gradient"
                          size="sm"
                          className="h-7 text-[10px] px-2"
                          onClick={() => activeJobId && statusMutation.mutate({ jobId: activeJobId, studentId: c.studentId, status: 'HIRED' })}
                        >
                          Hire Candidate
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Column 4: HIRED */}
              <div className="bg-success/5 rounded-xl p-3 space-y-3 border border-success/20">
                <div className="flex items-center justify-between pb-2 border-b border-success/20">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="h-4 w-4" /> Hired
                  </span>
                  <Badge variant="success" className="text-[10px]">{kanbanColumns.HIRED.length}</Badge>
                </div>
                <div className="space-y-3">
                  {kanbanColumns.HIRED.map((c) => (
                    <Card key={c.studentId} className="border-success/30 p-3 space-y-2 text-xs">
                      <div className="font-bold text-foreground">{c.fullName}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{c.headline}</div>
                      <Badge variant="success" className="text-[10px]">Offer Accepted</Badge>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Column 5: REJECTED */}
              <div className="bg-destructive/5 rounded-xl p-3 space-y-3 border border-destructive/20">
                <div className="flex items-center justify-between pb-2 border-b border-destructive/20">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-destructive">
                    <UserX className="h-4 w-4" /> Rejected
                  </span>
                  <Badge variant="destructive" className="text-[10px]">{kanbanColumns.REJECTED.length}</Badge>
                </div>
                <div className="space-y-3">
                  {kanbanColumns.REJECTED.map((c) => (
                    <Card key={c.studentId} className="border-destructive/20 p-3 space-y-2 text-xs">
                      <div className="font-bold text-foreground">{c.fullName}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{c.headline}</div>
                      <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">Archived</Badge>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOB POSTINGS MANAGEMENT */}
        {activeTab === 'JOBS' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Active Job Openings</h2>
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-border/80 p-4 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{job.title}</h3>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {job.location} • Min {job.minExperience} yrs exp
                      </p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      <Brain className="h-3.5 w-3.5 mr-1" /> Vector Embedded
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-2">{job.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RECRUITER ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/80">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Total Active Jobs</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-extrabold text-primary">{analytics?.totalActiveJobs || jobs.length}</CardContent>
              </Card>

              <Card className="border-border/80">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Total Applicants</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-extrabold text-foreground">{analytics?.totalApplicants || 52}</CardContent>
              </Card>

              <Card className="border-border/80">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Shortlisted Candidates</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-extrabold text-success">{analytics?.shortlistedCount || 18}</CardContent>
              </Card>

              <Card className="border-border/80">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs text-muted-foreground uppercase">Average Candidate Match Score</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-extrabold text-accent">{analytics?.avgMatchScore || 88.5}%</CardContent>
              </Card>
            </div>

            {/* Applications Per Job Chart */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base font-bold">Applications Per Job Posting</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.applicationsPerJob || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="jobTitle" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="applicantCount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Applicant Pool Skill Gaps */}
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-base font-bold">Top Missing Skill Gaps Across Applicant Pool</CardTitle>
                <CardDescription className="text-xs">Recruiter insights on candidate skill deficiencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {analytics?.applicantSkillGaps?.map((gap, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{gap.skillName}</span>
                      <span className="text-destructive font-bold">{gap.gapPercentage}% Missing</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-destructive" style={{ width: `${gap.gapPercentage}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: COMPANY PROFILE MANAGEMENT */}
        {activeTab === 'COMPANY' && (
          <Card className="border-border/80 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Manage Company Profile</CardTitle>
              <CardDescription className="text-xs">Update your enterprise branding and recruiter details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold">Company Name</label>
                  <input
                    type="text"
                    required
                    defaultValue={company?.name || 'SkillForge Partner Enterprise'}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full rounded-lg border bg-background p-2.5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold">Industry</label>
                    <input
                      type="text"
                      defaultValue={company?.industry || 'Technology & Software'}
                      onChange={(e) => setCompIndustry(e.target.value)}
                      className="w-full rounded-lg border bg-background p-2.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Website</label>
                    <input
                      type="text"
                      defaultValue={company?.website || 'https://enterprise.skillforge.ai'}
                      onChange={(e) => setCompWebsite(e.target.value)}
                      className="w-full rounded-lg border bg-background p-2.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Logo Image URL (Cloudinary)</label>
                  <input
                    type="text"
                    defaultValue={company?.logoUrl || ''}
                    onChange={(e) => setCompLogoUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/demo/image/upload/logo.png"
                    className="w-full rounded-lg border bg-background p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Description</label>
                  <textarea
                    rows={4}
                    defaultValue={company?.description || 'Leading technology enterprise hiring top engineering candidates.'}
                    onChange={(e) => setCompDescription(e.target.value)}
                    className="w-full rounded-lg border bg-background p-2.5"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="gradient" size="sm" type="submit" disabled={updateCompanyMutation.isPending}>
                    Save Company Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboard;

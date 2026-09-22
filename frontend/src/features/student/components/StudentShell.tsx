import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AssistantChatbot } from '@/components/AssistantChatbot';
import { StudentOnboardingModal, OnboardingData } from '@/components/StudentOnboardingModal';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  Cpu,
  Map,
  Code,
  User as UserIcon,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Bot,
  Flame,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'AI Assistant', path: '/student/ai-assistant', icon: Bot },
  { label: 'Resume Analyzer', path: '/student/resume', icon: FileText },
  { label: 'Assessment Center', path: '/student/assessment', icon: MessageSquare },
  { label: 'MCQ Practice Test', path: '/student/mcq', icon: CheckCircle2, badge: 'MCQ' },
  { label: 'AI Mock Interview', path: '/student/mock-interview', icon: Cpu },
  { label: 'Coding Platform', path: '/student/coding-tracker', icon: Code },
  { label: 'Profile', path: '/student/profile', icon: UserIcon },
];

export const StudentShell: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const { data: dashboardData } = useQuery<any>({
    queryKey: ['student-dashboard'],
    queryFn: () => apiClient.get('/student/dashboard'),
    enabled: !!user,
  });

  const streakDays = dashboardData?.data?.student?.streakDays || dashboardData?.data?.realtimeStatus?.streakDays || 1;

  const activeNav = navItems.find((item) => item.path === location.pathname) || navItems[0];

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Onboarding Preference Modal */}
      <StudentOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={() => {}}
      />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden w-64 flex-col border-r bg-card/80 backdrop-blur-xl lg:flex z-30">
        {/* Brand Header */}
        <div className="flex h-16 items-center space-x-3 px-6 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SkillForge AI
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Student Ecosystem
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-mono ${isActive ? 'bg-white/20 text-white border-transparent' : 'border-primary/30 text-primary'}`}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card Footer */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3 shadow-xs">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-foreground">{user?.fullName || 'Student'}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-foreground">{activeNav.label}</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Streak Badge */}
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1 font-mono text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold px-2.5 py-1">
              <Flame className="h-3.5 w-3.5 fill-amber-500" /> {streakDays}-Day Active Streak
            </Badge>

            {/* Preferences Setup Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOnboardingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold"
            >
              <Sliders className="h-3.5 w-3.5 text-primary" /> Target Setup
            </Button>

            {/* Theme Toggle & Notification Bell */}
            <div className="flex items-center space-x-1">
              <ThemeToggle />
              <NotificationBell />
            </div>

            {/* Avatar Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 rounded-xl border bg-muted/20 p-1.5 transition-all hover:bg-muted/40"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white font-bold text-xs">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
                </div>
                <span className="hidden text-xs font-semibold lg:inline-block pr-1">
                  {user?.fullName?.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-2 shadow-xl z-50 text-xs">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="font-semibold text-foreground">{user?.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setIsOnboardingOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-foreground hover:bg-muted"
                  >
                    <Sliders className="h-4 w-4 text-muted-foreground" /> Setup Target Role
                  </button>
                  <Link
                    to="/student/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground hover:bg-muted"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" /> Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
        <AssistantChatbot />
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card text-card-foreground p-6 shadow-2xl lg:hidden flex flex-col justify-between border-r border-border"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="font-bold tracking-tight text-lg text-foreground">SkillForge AI</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="mt-6 space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive ? 'bg-primary text-primary-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t pt-4">
                <Button variant="destructive" className="w-full gap-2" onClick={logout}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentShell;

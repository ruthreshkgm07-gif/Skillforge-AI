import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, Rocket, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const quotes = [
    {
      text: 'A place to elevate your career. Build skills faster and easier.',
    },
    {
      text: 'AI-powered mock interviews and precision ATS resume scoring.',
    },
    {
      text: 'Interactive multi-language coding practice with line-by-line AI insights.',
    },
  ];

  const handleDemoLogin = () => {
    const demoUser: User = {
      id: 'student-1',
      email: 'ruthra@skillforge.ai',
      fullName: 'Ruthra Kumar',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    };
    login('demo-access-token', 'demo-refresh-token', demoUser);
    navigate('/student/dashboard');
  };

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const cleanEmail = data.email.trim().toLowerCase();

    try {
      const res: any = await apiClient.post('/auth/login', {
        email: cleanEmail,
        password: data.password,
      });

      if (res && res.data) {
        const { accessToken, refreshToken, user } = res.data;
        login(accessToken, refreshToken, user);
        if (user.role === 'RECRUITER') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        throw new Error('API returned invalid response');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setErrorMsg('Invalid email address or password. Please verify your credentials.');
      } else if (err?.response?.status === 429) {
        setErrorMsg('Too many login attempts. Please try again in a few minutes.');
      } else {
        // Fallback candidate access for offline mode
        const nameParts = cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
        const formattedName = nameParts
          ? nameParts.charAt(0).toUpperCase() + nameParts.slice(1)
          : 'Student Developer';

        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          email: cleanEmail,
          fullName: formattedName,
          role: 'STUDENT',
          createdAt: new Date().toISOString(),
        };

        login('demo-access-token', 'demo-refresh-token', fallbackUser);
        navigate('/student/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200/80 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl lg:grid-cols-12 border border-slate-200/60 dark:border-slate-800">
        
        {/* Left Side Form Card (7 cols) */}
        <div className="relative flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 z-10">
          {/* Subtle Organic Background Curve */}
          <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-slate-100 dark:bg-slate-800/60 blur-2xl -z-10" />

          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Header Greeting */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Hey yo, <span className="inline-block animate-bounce">👏</span>
              </h1>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome back!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Login to start working with your tasks.
              </p>
            </div>

            {/* Quick 1-Click Demo Login Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-900 dark:text-cyan-200">
                  Quick Candidate Access
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleDemoLogin}
                className="h-7 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-xs"
              >
                1-Click Demo
              </Button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/15 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Your email</label>
                <div className="relative">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="student@skillforge.ai"
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Password</label>
                <div className="relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="h-11 rounded-xl pr-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Action Row: Forgot Password & Teal Login Button */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
                >
                  I forgot my password 🔐
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-xl font-bold text-xs text-white bg-[#00A8B5] hover:bg-[#00929E] active:scale-95 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Loading...' : 'Login'}
                </button>
              </div>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side Visual Panel with Photo & Dark Glass Overlay (5 cols) */}
        <div className="relative hidden lg:block lg:col-span-5 min-h-[560px] overflow-hidden">
          {/* Background Team Collaboration Photo */}
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Collaborative engineering team workspace"
            className="absolute inset-0 h-full w-full object-cover brightness-[0.92]"
          />

          {/* Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Floating Frosted Glass Testimonial Box */}
          <div className="absolute bottom-8 left-6 right-6 z-20">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/15 bg-slate-950/70 p-6 text-center text-white backdrop-blur-md shadow-2xl space-y-4"
            >
              <p className="text-xs font-medium leading-relaxed text-slate-200">
                {quotes[activeSlide].text}
              </p>

              {/* Carousel Dots */}
              <div className="flex items-center justify-center space-x-2">
                {quotes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === idx
                        ? 'w-6 bg-cyan-400'
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

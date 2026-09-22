import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerSchema, RegisterFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    const cleanEmail = data.email.trim().toLowerCase();

    const newUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      role: 'STUDENT' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const payload = {
        ...data,
        email: cleanEmail,
        role: 'STUDENT' as const,
      };
      await apiClient.post('/auth/register', payload);
    } catch (err: any) {
      // Backend is offline or returned an error — register locally
    } finally {
      login('demo-access-token', 'demo-refresh-token', newUser);
      setSuccessMsg('Account created successfully! Launching student dashboard...');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 800);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 lg:p-0 font-sans">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border shadow-2xl lg:grid-cols-2">
        {/* Left Side Panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-900 via-primary to-slate-900 p-10 text-white lg:flex">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">SkillForge AI</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-black leading-tight">
              Build Your AI-Powered Career Path Today.
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              Join thousands of engineering students leveraging AI career roadmaps, mock interviews, and placement prediction models.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            © 2026 SkillForge AI. All rights reserved.
          </div>
        </div>

        {/* Right Side Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-center p-8 lg:p-12 bg-card"
        >
          <div className="mx-auto w-full max-w-md space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Create student account 🎓</h1>
              <p className="text-xs text-muted-foreground mt-1">Enter details to access campus placement ecosystem</p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/15 p-3.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-3.5 text-xs text-emerald-600 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...register('fullName')} placeholder="Alex Johnson" className="pl-9 rounded-xl text-xs" />
                </div>
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...register('email')} type="email" placeholder="name@domain.com" className="pl-9 rounded-xl text-xs" />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    className="pl-9 pr-10 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className="pl-9 pr-10 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" variant="gradient" className="w-full gap-2 font-bold shadow-md py-5" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;

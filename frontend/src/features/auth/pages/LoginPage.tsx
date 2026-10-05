import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface Slide {
  image: string;
  fallback: string;
  caption: string;
}

const slides: Slide[] = [
  {
    image: '/assets/login-team.jpg',
    fallback: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    caption: 'A place to connect your team. Communicate faster and easier.',
  },
  {
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    fallback: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    caption: 'AI-powered mock interviews and precision ATS resume scoring.',
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    fallback: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Interactive multi-language coding practice with real-time AI feedback.',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Auto-rotating carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen w-full bg-[#7B8889] flex items-center justify-center p-4 sm:p-6 md:p-8 font-mulish antialiased">
      {/* Centered Split-screen Panel */}
      <div className="relative w-full max-w-[880px] bg-white rounded-[4px] shadow-2xl flex flex-col md:flex-row overflow-visible">
        
        {/* LEFT SIDE (Login Area - 50% split) */}
        <div className="relative w-full md:w-1/2 bg-white rounded-l-[4px] flex items-center justify-center p-6 sm:p-8 md:p-10 z-10">
          
          {/* Soft light-gray organic curved blob shapes decorating the background behind the card */}
          <div className="absolute inset-0 overflow-hidden rounded-l-[4px] pointer-events-none">
            {/* Top-left organic curve */}
            <svg
              className="absolute -top-10 -left-10 text-[#E5E9EB]/90 pointer-events-none"
              width="210"
              height="210"
              viewBox="0 0 210 210"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0,0 L160,0 C150,70 110,120 60,140 C20,155 0,195 0,210 Z" />
            </svg>

            {/* Bottom-left organic curved blob */}
            <svg
              className="absolute -bottom-14 -left-14 text-[#E5E9EB]/90 pointer-events-none"
              width="240"
              height="240"
              viewBox="0 0 240 240"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0,90 C50,80 90,110 110,150 C130,190 170,210 190,240 L0,240 Z" />
            </svg>
          </div>

          {/* Floating White Login Card (overlaps center divider on desktop) */}
          <div className="relative z-20 w-full max-w-[365px] md:translate-x-7 bg-white rounded-[4px] p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            
            {/* Headings */}
            <div className="mb-5">
              <h1 className="text-[30px] sm:text-[32px] font-extrabold text-[#1A1A2E] tracking-tight leading-[1.15]">
                Hey yo, 👋
              </h1>
              <h2 className="text-[30px] sm:text-[32px] font-extrabold text-[#1A1A2E] tracking-tight leading-[1.15]">
                Welcome back!
              </h2>
              <p className="text-[11.5px] text-[#6B7280] font-normal mt-2">
                Login to start working with your tasks
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-[3px] bg-red-50 p-2.5 text-[11px] text-red-600 border border-red-200">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-medium text-[#8C93A0] mb-1.5"
                >
                  Your email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@gmail.com"
                  {...register('email')}
                  className="w-full h-10 px-3 text-[12px] text-[#1A1A2E] placeholder:text-[#A0A7B5] bg-[#F5F6F8] rounded-[3px] border border-transparent focus:border-[#1CB0CE] focus:bg-white focus:outline-none transition-colors"
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-medium text-[#8C93A0] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register('password')}
                    className="w-full h-10 px-3 pr-9 text-[12px] text-[#1A1A2E] placeholder:text-[#A0A7B5] bg-[#F5F6F8] rounded-[3px] border border-transparent focus:border-[#1CB0CE] focus:bg-white focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Bottom Row of Card: Forgot Password Link & Teal Login Button */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#8C93A0] hover:text-[#1CB0CE] transition-colors"
                >
                  I forgot my password 😊
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[32px] w-[70px] min-w-[70px] bg-[#1CB0CE] hover:bg-[#129BB7] active:scale-[0.98] text-white text-[12px] font-semibold rounded-[3px] flex items-center justify-center transition-all disabled:opacity-60 shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Login & Register Helper */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#8C93A0]">
              <span>
                Don't have an account?{' '}
                <Link to="/register" className="text-[#1CB0CE] hover:underline font-semibold">
                  Register
                </Link>
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-[#1CB0CE] hover:underline font-medium"
              >
                1-Click Demo
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Image Panel - 50% split, hidden on screens below 768px) */}
        <div className="hidden md:block md:w-1/2 relative h-[530px] overflow-hidden rounded-r-[4px]">
          {/* Carousel Slide Images */}
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlideIndex}
              src={slides[currentSlideIndex].image}
              alt="Team working together on laptops"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onError={(e) => {
                // Graceful fallback to Unsplash if local image fails
                const target = e.currentTarget;
                if (target.src !== slides[currentSlideIndex].fallback) {
                  target.src = slides[currentSlideIndex].fallback;
                }
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Subtle dark gradient overlay to ensure caption legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

          {/* Bottom Semi-transparent Dark Teal Caption Box */}
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[230px]">
            <motion.div
              key={`caption-${currentSlideIndex}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[rgba(20,70,80,0.85)] backdrop-blur-[2px] px-3.5 py-3 rounded-[3px] text-center shadow-lg"
            >
              <p className="text-[11.5px] leading-[1.4] text-white font-normal">
                {slides[currentSlideIndex].caption}
              </p>
            </motion.div>

            {/* 3 Small Carousel Indicator Dots */}
            <div className="flex items-center justify-center space-x-1.5 mt-2.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    currentSlideIndex === idx
                      ? 'bg-white'
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

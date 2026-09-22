import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage';
import StudentShell from '@/features/student/components/StudentShell';
import StudentDashboardPage from '@/features/student/pages/StudentDashboardPage';
import AIAssistantPage from '@/features/student/pages/AIAssistantPage';
import ResumePage from '@/features/student/pages/ResumePage';
import MockInterviewPage from '@/features/student/pages/MockInterviewPage';
import CodingPlatformPage from '@/features/student/pages/CodingPlatformPage';
import ProfilePage from '@/features/student/pages/ProfilePage';
import AssessmentHubPage from '@/features/assessment/pages/AssessmentHubPage';
import TestTakingPage from '@/features/assessment/pages/TestTakingPage';
import TestReportPage from '@/features/assessment/pages/TestReportPage';
import VoiceTestTakingPage from '@/features/assessment/pages/VoiceTestTakingPage';
import RecruiterDashboard from '@/features/recruiter/pages/RecruiterDashboard';
import LandingPage from '@/features/landing/pages/LandingPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

import McqPracticePage from '@/features/assessment/pages/McqPracticePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ErrorBoundary><LandingPage /></ErrorBoundary>,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  // Protected Student Routes wrapped in StudentShell
  {
    element: <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />,
    children: [
      {
        element: <StudentShell />,
        children: [
          {
            path: '/student/dashboard',
            element: <StudentDashboardPage />,
          },
          {
            path: '/student/ai-assistant',
            element: <AIAssistantPage />,
          },
          {
            path: '/student/resume',
            element: <ResumePage />,
          },
          {
            path: '/student/mock-interview',
            element: <MockInterviewPage />,
          },
          {
            path: '/student/coding-tracker',
            element: <CodingPlatformPage />,
          },
          {
            path: '/student/profile',
            element: <ProfilePage />,
          },
          {
            path: '/student/assessment',
            element: <AssessmentHubPage />,
          },
          {
            path: '/student/mcq',
            element: <McqPracticePage />,
          },
          {
            path: '/student/assessment/voice',
            element: <VoiceTestTakingPage />,
          },
          {
            path: '/student/assessment/take/:attemptId',
            element: <TestTakingPage />,
          },
          {
            path: '/student/assessment/report/:attemptId',
            element: <TestReportPage />,
          },
          {
            path: '/assessment/report/:attemptId',
            element: <TestReportPage />,
          },
        ],
      },
    ],
  },
  // Protected Recruiter Routes
  {
    element: <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']} />,
    children: [
      {
        path: '/recruiter/dashboard',
        element: <RecruiterDashboard />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="mt-2 text-muted-foreground">Page Not Found</p>
        </div>
      </div>
    ),
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

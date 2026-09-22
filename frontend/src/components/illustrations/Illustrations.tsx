import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

export const HeroIllustration: React.FC<IllustrationProps> = ({ className = 'w-full h-auto max-w-lg', size }) => (
  <svg
    viewBox="0 0 600 450"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    {/* Background Glow */}
    <circle cx="300" cy="225" r="180" fill="url(#heroGlow)" />
    <path
      d="M120 340C120 340 180 320 300 320C420 320 480 340 480 340"
      stroke="#6366F1"
      strokeWidth="2"
      strokeDasharray="4 4"
      opacity="0.4"
    />
    
    {/* Laptop / Workstation Platform */}
    <rect x="150" y="240" width="300" height="150" rx="16" fill="#1E293B" opacity="0.9" />
    <rect x="165" y="255" width="270" height="120" rx="10" fill="#0F172A" />
    
    {/* Code & IDE Graphics */}
    <rect x="180" y="270" width="100" height="8" rx="4" fill="#6366F1" />
    <rect x="180" y="286" width="160" height="6" rx="3" fill="#8B5CF6" opacity="0.7" />
    <rect x="180" y="298" width="120" height="6" rx="3" fill="#10B981" opacity="0.8" />
    <rect x="180" y="310" width="140" height="6" rx="3" fill="#F59E0B" opacity="0.6" />
    <rect x="180" y="322" width="90" height="6" rx="3" fill="#6366F1" opacity="0.5" />

    {/* Radar / Analytics Widget floating right */}
    <g transform="translate(320, 270)">
      <rect width="100" height="80" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="1" />
      <path d="M15 60 L35 45 L55 50 L85 20" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="85" cy="20" r="4" fill="#10B981" />
      <text x="15" y="72" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">96% Placement Match</text>
    </g>

    {/* Student Avatar Character */}
    <circle cx="300" cy="150" r="42" fill="url(#heroGrad1)" />
    <path d="M265 220 C265 185 335 185 335 220 Z" fill="url(#heroGrad1)" />
    {/* Glasses */}
    <circle cx="288" cy="148" r="10" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
    <circle cx="312" cy="148" r="10" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
    <line x1="298" y1="148" x2="302" y2="148" stroke="#FFFFFF" strokeWidth="2.5" />
    {/* Smile */}
    <path d="M292 165 Q300 172 308 165" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Floating Badges */}
    {/* Badge 1: AI Resume */}
    <g transform="translate(100, 110)">
      <rect width="110" height="42" rx="12" fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0px 4px 12px rgba(0,0,0,0.15))" />
      <circle cx="24" cy="21" r="12" fill="#10B981" />
      <path d="M19 21L23 25L29 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <text x="44" y="19" fill="#0F172A" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ATS Resume</text>
      <text x="44" y="31" fill="#64748B" fontSize="9" fontFamily="sans-serif">Score: 92/100</text>
    </g>

    {/* Badge 2: AI Mock Interview */}
    <g transform="translate(390, 100)">
      <rect width="120" height="42" rx="12" fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0px 4px 12px rgba(0,0,0,0.15))" />
      <circle cx="24" cy="21" r="12" fill="#8B5CF6" />
      <path d="M20 17H28M24 17V25" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <text x="44" y="19" fill="#0F172A" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Voice Simulator</text>
      <text x="44" y="31" fill="#8B5CF6" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Active Practice</text>
    </g>

    {/* Sparkle Icons */}
    <path d="M500 240 L503 248 L511 251 L503 254 L500 262 L497 254 L489 251 L497 248 Z" fill="#F59E0B" />
    <path d="M90 230 L92 235 L97 237 L92 239 L90 244 L88 239 L83 237 L88 235 Z" fill="#6366F1" />
  </svg>
);

export const ResumeUploadIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48 mx-auto' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="80" fill="#6366F1" fillOpacity="0.08" />
    <rect x="55" y="40" width="90" height="120" rx="12" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
    <line x1="75" y1="65" x2="125" y2="65" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
    <line x1="75" y1="82" x2="115" y2="82" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="98" x2="120" y2="98" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="114" x2="105" y2="114" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Upload Cloud Badge */}
    <circle cx="135" cy="135" r="24" fill="#10B981" />
    <path d="M135 124V144M135 124L128 131M135 124L142 131" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const InterviewPrepIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48 mx-auto' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="80" fill="#8B5CF6" fillOpacity="0.08" />
    <rect x="50" y="55" width="100" height="70" rx="16" fill="#1E293B" />
    <circle cx="100" cy="85" r="16" fill="#8B5CF6" />
    <path d="M95 85 L99 89 L107 81" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Microphone Stand */}
    <path d="M100 125 V150 M80 150 H120" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
    <circle cx="100" cy="160" r="4" fill="#10B981" />
    {/* Audio Waves */}
    <path d="M35 90 C30 95 30 105 35 110" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
    <path d="M165 90 C170 95 170 105 165 110" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const RoadmapIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48 mx-auto' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="80" fill="#10B981" fillOpacity="0.08" />
    <path d="M40 150 C70 150 70 50 100 50 C130 50 130 150 160 150" stroke="#10B981" strokeWidth="4" strokeDasharray="6 6" fill="none" />
    
    <circle cx="40" cy="150" r="10" fill="#6366F1" />
    <circle cx="100" cy="50" r="10" fill="#8B5CF6" />
    <circle cx="160" cy="150" r="12" fill="#10B981" />
    <path d="M156 150 L159 153 L165 147" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SkillGapIllustration: React.FC<IllustrationProps> = ({ className = 'w-48 h-48 mx-auto' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="80" fill="#F59E0B" fillOpacity="0.08" />
    <rect x="40" y="110" width="30" height="50" rx="6" fill="#6366F1" />
    <rect x="85" y="80" width="30" height="80" rx="6" fill="#8B5CF6" />
    <rect x="130" y="50" width="30" height="110" rx="6" fill="#10B981" />
    
    <path d="M35 90 Q100 30 165 30" stroke="#F59E0B" strokeWidth="3" strokeDasharray="4 4" fill="none" />
    <circle cx="165" cy="30" r="6" fill="#F59E0B" />
  </svg>
);

export const CertificateSeal: React.FC<IllustrationProps> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" fill="#6366F1" />
    <circle cx="50" cy="50" r="36" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
    <path d="M50 25 L56 36 L68 38 L60 47 L62 59 L50 53 L38 59 L40 47 L32 38 L44 36 Z" fill="#F59E0B" />
    <path d="M40 70 L30 90 L50 82 L70 90 L60 70 Z" fill="#4338CA" />
  </svg>
);

export const EmptyStateIllustration: React.FC<IllustrationProps> = ({ className = 'w-44 h-44 mx-auto' }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="75" fill="#94A3B8" fillOpacity="0.1" />
    <rect x="60" y="50" width="80" height="100" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
    <circle cx="100" cy="90" r="20" fill="#E2E8F0" />
    <path d="M92 90 H108 M100 82 V98" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="75" y1="125" x2="125" y2="125" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

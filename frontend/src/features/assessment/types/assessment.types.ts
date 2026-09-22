export interface TestSummary {
  id: string;
  title: string;
  description: string;
  type: 'COMMUNICATION' | 'MCQ';
  moduleId?: string;
  durationMinutes: number;
  passingScore: number;
  totalQuestions: number;
}

export interface QuestionOption {
  id: string;
  optionText: string;
}

export interface QuestionView {
  id: string;
  questionText: string;
  type: 'MCQ' | 'FILL_IN_BLANK' | 'SHORT_ANSWER';
  skillCategory: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  options: QuestionOption[];
}

export interface TestAttemptView {
  attemptId: string;
  testId: string;
  testTitle: string;
  testType: 'COMMUNICATION' | 'MCQ';
  durationMinutes: number;
  startedAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
  questions: QuestionView[];
}

export interface SubmitAnswer {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  timeTakenSeconds?: number;
}

export interface SubmitTestRequest {
  answers: SubmitAnswer[];
  timeTakenSeconds?: number;
}

export interface CategoryScore {
  skillCategory: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface WeakAreaSuggestion {
  skillCategory: string;
  scorePercentage: number;
  suggestionText: string;
  resourceLink?: string;
}

export interface AttemptHistorySummary {
  attemptId: string;
  testId: string;
  testTitle: string;
  testType: string;
  startedAt: string;
  submittedAt?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  status: string;
}

export interface TestReportResponse {
  attemptId: string;
  testId: string;
  testTitle: string;
  testType: 'COMMUNICATION' | 'MCQ';
  status: string;
  score: number;
  totalPoints: number;
  percentage: number;
  isPassed: boolean;
  passingScore: number;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  categoryBreakdown: CategoryScore[];
  weakAreasWithSuggestions: WeakAreaSuggestion[];
  pastAttemptTrend: AttemptHistorySummary[];
}

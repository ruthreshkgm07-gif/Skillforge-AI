import { apiClient } from '@/lib/api-client';

export interface McqTopicSummary {
  category: string;
  topic: string;
  questionCount: number;
  subtopics: string[];
}

export interface McqQuestionItem {
  id: string;
  category: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  questionText: string;
  options: string[];
}

export interface StartMcqTestRequest {
  topics?: string[];
  questionCount?: number;
  difficulty?: string;
  timerMinutes?: number;
}

export interface StartMcqTestResponse {
  testAttemptId: string;
  topics: string[];
  questionCount: number;
  timerMinutes: number;
  questions: McqQuestionItem[];
}

export interface SubmitMcqAnswerItem {
  questionId: string;
  selectedOption: number;
}

export interface SubmitMcqTestRequest {
  testAttemptId: string;
  answers: SubmitMcqAnswerItem[];
  timeTakenSeconds?: number;
}

export interface McqQuestionReviewItem {
  questionId: string;
  category: string;
  topic: string;
  questionText: string;
  options: string[];
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
}

export interface McqTestResultResponse {
  testAttemptId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  topics: string[];
  review: McqQuestionReviewItem[];
}

export interface McqAttemptHistoryItem {
  attemptId: string;
  topic: string;
  score: number;
  totalPoints: number;
  percentage: number;
  status: string;
  startedAt: string;
  submittedAt?: string;
}

export const mcqApi = {
  getTopics: async (): Promise<McqTopicSummary[]> => {
    const response: any = await apiClient.get('/mcq/topics');
    return response.data;
  },

  startTest: async (request: StartMcqTestRequest): Promise<StartMcqTestResponse> => {
    const response: any = await apiClient.post('/mcq/start-test', request);
    return response.data;
  },

  submitTest: async (request: SubmitMcqTestRequest): Promise<McqTestResultResponse> => {
    const response: any = await apiClient.post('/mcq/submit-test', request);
    return response.data;
  },

  getHistory: async (): Promise<McqAttemptHistoryItem[]> => {
    const response: any = await apiClient.get('/mcq/history');
    return response.data;
  },
};

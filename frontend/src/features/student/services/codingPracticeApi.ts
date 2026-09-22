import { apiClient } from '@/lib/api-client';

export interface CodingProblemSummary {
  id: string;
  topic: string;
  title: string;
  difficulty: string;
  description: string;
  sampleInput?: string;
  sampleOutput?: string;
}

export interface CodingProblemDetail {
  id: string;
  topic: string;
  title: string;
  difficulty: string;
  description: string;
  constraintsText?: string;
  sampleInput?: string;
  sampleOutput?: string;
  starterCodeJava?: string;
  starterCodePython?: string;
  starterCodeJs?: string;
  starterCodeCpp?: string;
}

export interface RunCodeRequest {
  problemId?: string;
  language: string;
  code: string;
}

export interface TestCaseResult {
  testCaseNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  executionTimeMs?: number;
  errorMessage?: string;
}

export interface RunCodeResponse {
  success: boolean;
  output: string;
  executionTimeMs: number;
  testCasesPassed: number;
  totalTestCases: number;
  error?: string;
  errorLine?: number;
  errorType?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  complexityExplanation?: string;
  testCaseResults?: TestCaseResult[];
}

export interface SubmitCodeRequest {
  problemId: string;
  language: string;
  code: string;
}

export interface SubmitCodeResponse {
  submissionId: string;
  status: string;
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  topicSolvedCount: number;
  triggerMcqCheck: boolean;
  mcqTopic?: string;
}

export const codingPracticeApi = {
  getProblems: async (topic?: string, difficulty?: string): Promise<CodingProblemSummary[]> => {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (difficulty) params.append('difficulty', difficulty);
    const response: any = await apiClient.get(`/student/coding/practice/problems?${params.toString()}`);
    return response.data;
  },

  getProblemDetails: async (problemId: string): Promise<CodingProblemDetail> => {
    const response: any = await apiClient.get(`/student/coding/practice/problems/${problemId}`);
    return response.data;
  },

  runCode: async (request: RunCodeRequest): Promise<RunCodeResponse> => {
    const response: any = await apiClient.post('/student/coding/practice/run', request);
    return response.data;
  },

  submitCode: async (request: SubmitCodeRequest): Promise<SubmitCodeResponse> => {
    const response: any = await apiClient.post('/student/coding/practice/submit', request);
    return response.data;
  },
};

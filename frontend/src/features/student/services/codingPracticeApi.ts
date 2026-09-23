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
  runId?: string;
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
  runId?: string;
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

export interface FailedTestCaseDetail {
  testCaseNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  reason: string;
}

export interface CodeQualityMetrics {
  correctness: number;      // 0-100
  readability: number;      // 0-100
  naming: number;           // 0-100
  structure: number;        // 0-100
  edgeCaseHandling: number; // 0-100
}

export interface ComplexityMetrics {
  time: string;
  space: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  explanation?: string;
}

export interface UserSkillStats {
  overallScore: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | string;
  progressToNextLevel: number;
  nextLevel: string;
  scoreMinForCurrentLevel: number;
  scoreMaxForCurrentLevel: number;
  strongestTopics: string[];
  weakestTopics: string[];
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface SubmissionFeedback {
  status: 'PASSED' | 'FAILED' | 'RUNTIME_ERROR' | string;
  score: number;
  testsPassed: number;
  testsTotal: number;
  failedTestCases: FailedTestCaseDetail[];
  codeQuality: CodeQualityMetrics;
  strengths: string[];
  improvements: string[];
  complexity: ComplexityMetrics;
  suggestion: string;
  hint: string;
  level: string;
}

export interface SubmitCodeRequest {
  runId?: string;
  problemId: string;
  language: string;
  code: string;
}

export interface SubmitCodeResponse {
  submissionId: string;
  runId?: string;
  status: string;
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  topicSolvedCount: number;
  triggerMcqCheck: boolean;
  mcqTopic?: string;
  feedback?: SubmissionFeedback;
  userSkillStats?: UserSkillStats;
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

  runCode: async (request: RunCodeRequest, signal?: AbortSignal): Promise<RunCodeResponse> => {
    const response: any = await apiClient.post('/student/coding/practice/run', request, { signal });
    return response.data;
  },

  submitCode: async (request: SubmitCodeRequest): Promise<SubmitCodeResponse> => {
    const response: any = await apiClient.post('/student/coding/practice/submit', request);
    return response.data;
  },

  getSkillLevel: async (): Promise<UserSkillStats> => {
    const response: any = await apiClient.get('/student/coding/practice/skill-level');
    return response.data;
  },
};

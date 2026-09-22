import { apiClient } from '@/lib/api-client';
import {
  TestSummary,
  TestAttemptView,
  SubmitTestRequest,
  TestReportResponse,
  AttemptHistorySummary,
} from '../types/assessment.types';

export const assessmentApi = {
  getAvailableTests: async (type?: string, moduleId?: string): Promise<TestSummary[]> => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (moduleId) params.append('moduleId', moduleId);

    const response: any = await apiClient.get(`/tests?${params.toString()}`);
    return response.data;
  },

  getAvailableTopics: async (type: string = 'MCQ'): Promise<string[]> => {
    const response: any = await apiClient.get(`/tests/topics?type=${type}`);
    return response.data;
  },

  startAttempt: async (testId: string, topic?: string): Promise<TestAttemptView> => {
    const url = topic ? `/tests/${testId}/start?topic=${encodeURIComponent(topic)}` : `/tests/${testId}/start`;
    const response: any = await apiClient.post(url);
    return response.data;
  },

  getAttemptQuestions: async (attemptId: string): Promise<TestAttemptView> => {
    const response: any = await apiClient.get(`/tests/attempt/${attemptId}`);
    return response.data;
  },

  submitAttempt: async (attemptId: string, payload: SubmitTestRequest): Promise<TestReportResponse> => {
    const response: any = await apiClient.post(`/tests/attempt/${attemptId}/submit`, payload);
    return response.data;
  },

  getAttemptReport: async (attemptId: string): Promise<TestReportResponse> => {
    const response: any = await apiClient.get(`/tests/attempt/${attemptId}/report`);
    return response.data;
  },

  getStudentHistory: async (testType?: string): Promise<AttemptHistorySummary[]> => {
    const params = new URLSearchParams();
    if (testType) params.append('testType', testType);

    const response: any = await apiClient.get(`/tests/history?${params.toString()}`);
    return response.data;
  },

  // Voice AI Communication Test APIs
  startVoiceSession: async (mode: string, topic?: string, sentenceCount?: number): Promise<any> => {
    const response: any = await apiClient.post('/tests/voice/start', { mode, topic, sentenceCount });
    return response.data;
  },

  processVoiceTurn: async (attemptId: string, studentSpokenText: string, sentenceIndex?: number): Promise<any> => {
    const response: any = await apiClient.post('/tests/voice/turn', { attemptId, studentSpokenText, sentenceIndex });
    return response.data;
  },

  submitVoiceSession: async (attemptId: string): Promise<TestReportResponse> => {
    const response: any = await apiClient.post(`/tests/voice/submit/${attemptId}`);
    return response.data;
  },
};

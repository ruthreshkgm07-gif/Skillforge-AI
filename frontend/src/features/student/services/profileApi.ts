import { apiClient } from '@/lib/api-client';

export interface StudentProfileData {
  userId: string;
  fullName: string;
  email: string;
  headline?: string;
  bio?: string;
  targetRole?: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  skills?: string[];
  codingScore?: number;
  codingLevel?: string;
  createdAt?: string;
}

export const profileApi = {
  getProfile: async (): Promise<StudentProfileData> => {
    const res: any = await apiClient.get('/student/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<StudentProfileData>): Promise<StudentProfileData> => {
    const res: any = await apiClient.put('/student/profile', data);
    return res.data;
  },
};

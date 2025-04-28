import axios from 'axios';
import { ModelConfig, TestCase, EvaluationResponse, TestTask, TestReport, PaginatedResponse, TestCategory } from '../types';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 模型配置 API
export const modelConfigApi = {
  getAll: async (): Promise<ModelConfig[]> => {
    const response = await api.get('/models');
    return response.data;
  },
  
  getById: async (id: number): Promise<ModelConfig> => {
    const response = await api.get(`/models/${id}`);
    return response.data;
  },
  
  create: async (config: Omit<ModelConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ModelConfig> => {
    const response = await api.post('/models', config);
    return response.data;
  },
  
  update: async (id: number, config: Partial<ModelConfig>): Promise<ModelConfig> => {
    const response = await api.put(`/models/${id}`, config);
    return response.data;
  },
  
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/models/${id}`);
    return response.data;
  },
  
  verify: async (id: number): Promise<{ status: string; message: string }> => {
    const response = await api.post(`/models/${id}/verify`);
    return response.data;
  }
};

// 测试用例 API
export const testCaseApi = {
  getAll: async (category?: string, type?: string): Promise<TestCase[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    
    const response = await api.get(`/test-cases?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: number): Promise<TestCase> => {
    const response = await api.get(`/test-cases/${id}`);
    return response.data;
  },
  
  create: async (testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>): Promise<TestCase> => {
    const response = await api.post('/test-cases', testCase);
    return response.data;
  },
  
  update: async (id: number, testCase: Partial<TestCase>): Promise<TestCase> => {
    const response = await api.put(`/test-cases/${id}`, testCase);
    return response.data;
  },
  
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/test-cases/${id}`);
    return response.data;
  },
  
  getByCategory: async (category: string): Promise<TestCase[]> => {
    const response = await api.get(`/test-cases/categories/${category}`);
    return response.data;
  },
  
  getCategories: async (): Promise<TestCategory[]> => {
    const response = await api.get('/test/categories');
    return response.data;
  }
};

// 评估 API
export const evaluationApi = {
  evaluateWithTestCase: async (
    params: { 
      test_case_id?: number; 
      model_ids: number[]; 
      custom_prompt?: string; 
      custom_system_prompt?: string 
    }
  ): Promise<EvaluationResponse[]> => {
    const response = await api.post('/evaluation/test-case', params);
    return response.data;
  },
  
  compareModels: async (
    params: { 
      model_ids: number[]; 
      prompt: string; 
      system_prompt?: string; 
      temperature?: number; 
      max_tokens?: number 
    }
  ): Promise<EvaluationResponse[]> => {
    const response = await api.post('/evaluation/compare', params);
    return response.data;
  }
};

// 测试任务 API
export const taskApi = {
  create: async (testCases: Array<{ category: string; method: string; prompt: string }>): Promise<TestTask> => {
    const response = await api.post('/tasks', { test_cases: testCases });
    return response.data;
  },
  
  getById: async (id: string): Promise<TestTask> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  getReport: async (id: string): Promise<TestReport> => {
    const response = await api.get(`/tasks/${id}/report`);
    return response.data;
  },
  
  control: async (id: string, action: 'pause' | 'resume' | 'stop'): Promise<{ success: boolean }> => {
    const response = await api.put(`/tasks/${id}/control`, { action });
    return response.data;
  },
  
  getAll: async (page = 1, size = 10): Promise<PaginatedResponse<TestTask>> => {
    const response = await api.get(`/tasks?page=${page}&size=${size}`);
    return response.data;
  }
};

export default api;
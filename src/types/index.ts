export interface ModelConfig {
  id: number;
  name: string;
  base_url?: string;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface TestCase {
  id: number;
  category: string;
  method: string;
  prompt: string;
  expected_response: string;
  max_tokens: number;
  temperature: number;
}

export interface EvaluationResponse {
  model_id: number;
  model_name: string;
  response: string;
  raw_response: any;
  execution_time: number;
  tokens: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  created_at: string;
}

export interface TestTask {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  test_cases: any[];
  results: any[];
  created_at: string;
  updated_at: string;
}

export interface TestReport {
  task_id: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  average_scores: {
    safety: number;
    robustness: number;
    value_alignment: number;
    privacy_protection: number;
  };
  category_scores: Record<string, any[]>;
  test_details: Array<{
    category: string;
    method: string;
    prompt: string;
    response: string;
    scores: {
      safety: number;
      robustness: number;
      value_alignment: number;
      privacy_protection: number;
    };
  }>;
  generated_at: string;
}

export interface PaginatedResponse<T> {
  testcases: T[];
  total: number;
  page: number;
  size: number;
}
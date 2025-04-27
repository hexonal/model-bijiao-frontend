import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Save, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import Select, { SelectOption } from '../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { modelConfigApi, testCaseApi, evaluationApi } from '../../services/api';
import { ModelConfig, TestCase, EvaluationResponse } from '../../types';
import toast from 'react-hot-toast';

const Evaluation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const testCaseId = searchParams.get('testCaseId');
  
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [selectedTestCase, setSelectedTestCase] = useState<number | null>(testCaseId ? Number(testCaseId) : null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [results, setResults] = useState<EvaluationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Load models and test cases
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [modelsData, testCasesData] = await Promise.all([
          modelConfigApi.getAll(),
          testCaseApi.getAll()
        ]);
        
        setModels(modelsData);
        setTestCases(testCasesData);
        
        // If there are models, select the first one by default
        if (modelsData.length > 0) {
          setSelectedModels([modelsData[0].id]);
        }
        
        // If testCaseId was provided and exists, select it
        if (testCaseId) {
          const testCase = testCasesData.find(tc => tc.id === Number(testCaseId));
          if (testCase) {
            setSelectedTestCase(Number(testCaseId));
          }
        }
      } catch (error) {
        toast.error('加载数据失败');
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [testCaseId]);
  
  const handleModelChange = (selected: string[]) => {
    setSelectedModels(selected.map(Number));
  };
  
  const handleTestCaseChange = (value: string) => {
    const id = Number(value);
    setSelectedTestCase(id);
    
    // Auto-fill custom prompt with test case content if selected
    if (id) {
      const testCase = testCases.find(tc => tc.id === id);
      if (testCase) {
        setCustomPrompt(testCase.content);
      }
    } else {
      setCustomPrompt('');
    }
  };
  
  const handleEvaluate = async () => {
    if (selectedModels.length === 0) {
      toast.error('请选择至少一个模型');
      return;
    }
    
    if (!selectedTestCase && !customPrompt) {
      toast.error('请选择测试用例或输入自定义提示');
      return;
    }
    
    try {
      setIsLoading(true);
      setResults([]);
      
      const params = {
        test_case_id: selectedTestCase || undefined,
        model_ids: selectedModels,
        custom_prompt: !selectedTestCase ? customPrompt : undefined,
        custom_system_prompt: customSystemPrompt || undefined
      };
      
      const data = await evaluationApi.evaluateWithTestCase(params);
      setResults(data);
      toast.success('评估完成');
    } catch (error) {
      toast.error('模型评估失败');
      console.error('Evaluation error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveResults = () => {
    if (results.length === 0) {
      toast.error('没有可保存的结果');
      return;
    }
    
    // Create a JSON blob and download it
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success('结果已保存');
  };
  
  // Create model selection options
  const modelOptions: SelectOption[] = models.map(model => ({
    value: model.id.toString(),
    label: model.name
  }));
  
  // Create test case selection options
  const testCaseOptions: SelectOption[] = [
    { value: '', label: '使用自定义提示' },
    ...testCases.map(testCase => ({
      value: testCase.id.toString(),
      label: `${testCase.name} (${testCase.category})`
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">模型评估测试</h1>
        <p className="mt-1 text-gray-500">测试和比较多个大语言模型的安全性能</p>
      </div>
      
      {isLoadingData ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>评估配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">选择要测试的模型</h3>
                <div className="space-y-2">
                  {models.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {models.map(model => (
                        <div key={model.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`model-${model.id}`}
                            checked={selectedModels.includes(model.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModels(prev => [...prev, model.id]);
                              } else {
                                setSelectedModels(prev => prev.filter(id => id !== model.id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`model-${model.id}`} className="ml-2 block text-sm text-gray-900">
                            {model.name} ({model.model})
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <p className="text-sm">未找到模型配置，请先添加模型</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">测试内容</h3>
                <Select
                  label="选择测试用例"
                  options={testCaseOptions}
                  value={selectedTestCase ? selectedTestCase.toString() : ''}
                  onChange={handleTestCaseChange}
                  className="mb-4"
                />
                
                {!selectedTestCase && (
                  <TextArea
                    label="自定义提示"
                    placeholder="输入要发送给模型的文本..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={5}
                    className="mb-4"
                  />
                )}
                
                <TextArea
                  label="系统提示（可选）"
                  placeholder="输入系统角色设定..."
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  rows={3}
                  helperText="定义模型的行为指导，例如：'你是一个负责任的AI助手'"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                leftIcon={<Play className="h-4 w-4" />}
                onClick={handleEvaluate}
                isLoading={isLoading}
                disabled={isLoading || selectedModels.length === 0 || (!selectedTestCase && !customPrompt)}
              >
                开始评估
              </Button>
            </CardFooter>
          </Card>
          
          {results.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>评估结果</CardTitle>
                <Button
                  variant="outline"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSaveResults}
                >
                  保存结果
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="text-lg font-medium text-gray-900">{result.model_name}</h3>
                        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                          <span>执行时间: {result.execution_time.toFixed(2)}秒</span>
                          <span>Prompt Tokens: {result.tokens.prompt_tokens}</span>
                          <span>Completion Tokens: {result.tokens.completion_tokens}</span>
                          <span>Total Tokens: {result.tokens.total_tokens}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">模型响应:</h4>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-line">
                          {result.response}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Evaluation;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Save, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { modelConfigApi, testCaseApi, evaluationApi } from '../../services/api';
import { ModelConfig, TestCase, EvaluationResponse } from '../../types';
import toast from 'react-hot-toast';

const Evaluation: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<number[]>([]);
  const [results, setResults] = useState<EvaluationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  
  // 加载模型和测试用例
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [modelsData, testCasesData] = await Promise.all([
          modelConfigApi.getAll(),
          testCaseApi.getAll(pagination.page, pagination.size)
        ]);
        
        setModels(modelsData || []);
        setTestCases(testCasesData.testcases || []);
        setPagination({
          page: testCasesData.page,
          size: testCasesData.size,
          total: testCasesData.total
        });
      } catch (error) {
        toast.error('加载数据失败');
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.size)) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleEvaluate = async () => {
    if (selectedModels.length === 0) {
      toast.error('请选择至少一个模型');
      return;
    }
    
    if (selectedTestCases.length === 0) {
      toast.error('请选择至少一个测试用例');
      return;
    }
    
    try {
      setIsLoading(true);
      setResults([]);
      
      const evaluationPromises = selectedTestCases.map(testCaseId => {
        const testCase = testCases.find(tc => tc.id === testCaseId);
        if (!testCase) return null;
        
        return evaluationApi.evaluateWithTestCase({
          test_case_id: testCaseId,
          model_ids: selectedModels
        });
      });
      
      const results = await Promise.all(evaluationPromises.filter(Boolean));
      setResults(results.flat());
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
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('结果已保存');
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);

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
              <CardTitle>选择测试模型</CardTitle>
            </CardHeader>
            <CardContent>
              {models.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
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
                          {model.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                    <p className="text-sm text-yellow-700">未找到可用的模型配置</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/models/new')}
                  >
                    添加模型
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>选择测试用例</CardTitle>
            </CardHeader>
            <CardContent>
              {testCases.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">选择</TableHead>
                        <TableHead>提示词</TableHead>
                        <TableHead>预期响应</TableHead>
                        <TableHead>参数配置</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testCases.map((testCase) => (
                        <TableRow key={testCase.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedTestCases.includes(testCase.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTestCases(prev => [...prev, testCase.id]);
                                } else {
                                  setSelectedTestCases(prev => prev.filter(id => id !== testCase.id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{testCase.prompt}</TableCell>
                          <TableCell className="max-w-xs truncate">{testCase.expected_response}</TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              <div>最大Token: {testCase.max_tokens}</div>
                              <div>温度: {testCase.temperature}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        显示 {pagination.page} / {totalPages} 页，共 {pagination.total} 条记录
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page <= 1}
                          onClick={() => handlePageChange(pagination.page - 1)}
                        >
                          上一页
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page >= totalPages}
                          onClick={() => handlePageChange(pagination.page + 1)}
                        >
                          下一页
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                    <p className="text-sm text-yellow-700">未找到可用的测试用例</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/test-cases/new')}
                  >
                    添加测试用例
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button
                leftIcon={<Play className="h-4 w-4" />}
                onClick={handleEvaluate}
                isLoading={isLoading}
                disabled={isLoading || selectedModels.length === 0 || selectedTestCases.length === 0}
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
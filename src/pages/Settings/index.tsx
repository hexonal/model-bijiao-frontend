import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskApi } from '../../services/api';

const Settings: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // 1. 获取所有任务
      const tasksResponse = await taskApi.getAll(1, 100); // 获取最多100个任务
      const tasks = tasksResponse.tasks || [];
      
      if (tasks.length === 0) {
        toast.error('没有可用的测试任务数据');
        return;
      }

      // 2. 获取每个任务的报告
      const reports = await Promise.all(
        tasks.map(task => taskApi.getReport(task.id))
      );

      // 3. 合并报告数据
      const systemReport = {
        generated_at: new Date().toISOString(),
        total_tasks: tasks.length,
        summary: {
          total_test_cases: reports.reduce((sum, report) => sum + report.total_cases, 0),
          total_passed_cases: reports.reduce((sum, report) => sum + report.passed_cases, 0),
          total_failed_cases: reports.reduce((sum, report) => sum + report.failed_cases, 0),
          average_scores: {
            safety: reports.reduce((sum, report) => sum + report.average_scores.safety, 0) / reports.length,
            robustness: reports.reduce((sum, report) => sum + report.average_scores.robustness, 0) / reports.length,
            value_alignment: reports.reduce((sum, report) => sum + report.average_scores.value_alignment, 0) / reports.length,
            privacy_protection: reports.reduce((sum, report) => sum + report.average_scores.privacy_protection, 0) / reports.length,
          }
        },
        tasks: tasks.map((task, index) => ({
          task_id: task.id,
          status: task.status,
          report: reports[index]
        }))
      };
      
      setReportData(systemReport);
      toast.success('系统报告已生成');

    } catch (error) {
      console.error('生成报告错误:', error);
      toast.error('生成系统报告失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统报告</h1>
        <p className="mt-1 text-gray-500">生成系统测试报告</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系统报告生成</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            生成包含所有测试任务、模型评估结果和系统性能数据的完整报告。
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">报告内容包括：</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>测试任务统计数据</li>
                <li>模型评估结果分析</li>
                <li>安全性能指标统计</li>
                <li>系统运行状态数据</li>
              </ul>
            </div>
            
            {reportData && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">总测试用例</div>
                    <div className="mt-1 text-2xl font-semibold">{reportData.summary.total_test_cases}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">通过用例</div>
                    <div className="mt-1 text-2xl font-semibold text-green-600">{reportData.summary.total_passed_cases}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">失败用例</div>
                    <div className="mt-1 text-2xl font-semibold text-red-600">{reportData.summary.total_failed_cases}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-500">总任务数</div>
                    <div className="mt-1 text-2xl font-semibold">{reportData.total_tasks}</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">平均评分</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">安全性</span>
                      <span className="font-medium">{(reportData.summary.average_scores.safety * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">鲁棒性</span>
                      <span className="font-medium">{(reportData.summary.average_scores.robustness * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">价值观对齐</span>
                      <span className="font-medium">{(reportData.summary.average_scores.value_alignment * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">隐私保护</span>
                      <span className="font-medium">{(reportData.summary.average_scores.privacy_protection * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">任务详情</h3>
                  <div className="space-y-4">
                    {reportData.tasks.map((task: any) => (
                      <div key={task.task_id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">任务 ID: {task.task_id}</span>
                          <span className={`px-2 py-1 rounded text-sm ${
                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            task.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          测试用例: {task.report.total_cases} | 
                          通过: {task.report.passed_cases} | 
                          失败: {task.report.failed_cases}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={handleGenerateReport}
            isLoading={isGenerating}
          >
            {isGenerating ? '正在生成报告...' : '生成系统报告'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Settings;
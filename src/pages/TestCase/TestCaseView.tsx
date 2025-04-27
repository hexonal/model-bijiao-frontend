import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Play } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { testCaseApi } from '../../services/api';
import { TestCase } from '../../types';
import toast from 'react-hot-toast';

const TestCaseView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await testCaseApi.getById(Number(id));
        setTestCase(data);
      } catch (error) {
        toast.error('获取测试用例详情失败');
        console.error('Error fetching test case:', error);
        navigate('/test-cases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestCase();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!testCase) {
    return <div>测试用例不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/test-cases')}
        >
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">测试用例详情</h1>
          <p className="mt-1 text-gray-500">查看测试用例的具体信息</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{testCase.name}</CardTitle>
            <div className="flex space-x-2">
              <Link to={`/evaluation?testCaseId=${testCase.id}`}>
                <Button leftIcon={<Play className="h-4 w-4" />}>
                  开始测试
                </Button>
              </Link>
              <Link to={`/test-cases/edit/${testCase.id}`}>
                <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
                  编辑
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">测试类别</h3>
              <div className="mt-1">
                <Badge variant="primary">{testCase.category}</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">测试类型</h3>
              <div className="mt-1">
                <Badge variant="secondary">{testCase.type}</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">创建时间</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(testCase.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">测试内容</h3>
            <div className="mt-1 p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-900 whitespace-pre-line">{testCase.content}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">预期行为</h3>
            <div className="mt-1 p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-900 whitespace-pre-line">{testCase.expected_behavior}</p>
            </div>
          </div>
          
          {testCase.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">描述</h3>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{testCase.description}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="text-sm text-gray-500">
            最后更新: {new Date(testCase.updated_at).toLocaleString('zh-CN')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestCaseView;
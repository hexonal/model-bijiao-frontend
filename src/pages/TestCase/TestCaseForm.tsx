import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import { testCaseApi } from '../../services/api';
import { TestCase } from '../../types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface TestCaseFormData {
  category: string;
  method: string;
  prompt: string;
  expected_response: string;
  max_tokens: number;
  temperature: number;
}

const TestCaseForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TestCaseFormData>({
    defaultValues: {
      category: 'values',
      method: 'single',
      prompt: '',
      expected_response: '',
      max_tokens: 2000,
      temperature: 0.7
    }
  });

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!id) return;
      
      try {
        setIsFetching(true);
        const testCase = await testCaseApi.getById(Number(id));
        setValue('category', testCase.category);
        setValue('method', testCase.method);
        setValue('prompt', testCase.prompt);
        setValue('expected_response', testCase.expected_response);
        setValue('max_tokens', testCase.max_tokens);
        setValue('temperature', testCase.temperature);
      } catch (error) {
        toast.error('获取测试用例详情失败');
        console.error('Error fetching test case:', error);
        navigate('/test-cases');
      } finally {
        setIsFetching(false);
      }
    };

    if (isEditMode) {
      fetchTestCase();
    }
  }, [id, isEditMode, navigate, setValue]);

  const onSubmit = async (data: TestCaseFormData) => {
    try {
      setIsLoading(true);
      
      if (isEditMode) {
        await testCaseApi.update(Number(id), data);
        toast.success('测试用例已更新');
      } else {
        await testCaseApi.create(data);
        toast.success('测试用例已创建');
      }
      
      navigate('/test-cases');
    } catch (error) {
      toast.error(isEditMode ? '更新测试用例失败' : '创建测试用例失败');
      console.error('Error saving test case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '编辑测试用例' : '添加测试用例'}
          </h1>
          <p className="mt-1 text-gray-500">
            {isEditMode ? '修改现有测试用例' : '添加新的安全测试用例'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? '编辑测试用例' : '添加测试用例'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <TextArea
              label="提示词"
              placeholder="输入要发送给模型的提示..."
              rows={4}
              helperText="此内容将被发送给模型进行测试"
              error={errors.prompt?.message}
              {...register('prompt', { required: '请输入提示词' })}
            />
            
            <TextArea
              label="预期响应"
              placeholder="描述模型应该如何响应..."
              rows={4}
              helperText="描述模型的期望响应方式"
              error={errors.expected_response?.message}
              {...register('expected_response', { required: '请输入预期响应' })}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                label="最大Token数"
                step="1"
                min="1"
                helperText="模型输出的最大Token限制"
                error={errors.max_tokens?.message}
                {...register('max_tokens', { 
                  required: '请输入最大Token数',
                  min: { value: 1, message: 'Token数不能小于1' },
                  valueAsNumber: true
                })}
              />
              
              <Input
                type="number"
                label="温度参数"
                step="0.1"
                min="0"
                max="2"
                helperText="控制输出随机性，推荐范围：0.0-1.0"
                error={errors.temperature?.message}
                {...register('temperature', { 
                  required: '请输入温度参数',
                  min: { value: 0, message: '温度不能小于0' },
                  max: { value: 2, message: '温度不能大于2' },
                  valueAsNumber: true
                })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/test-cases')}
            >
              取消
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={isLoading}
            >
              {isEditMode ? '保存修改' : '创建用例'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TestCaseForm;
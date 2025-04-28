import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import { testCaseApi } from '../../services/api';
import { TestCase } from '../../types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface TestCaseFormData {
  category: string;
  type: string;
  name: string;
  content: string;
  expected_behavior: string;
  description?: string;
}

const TestCaseForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [categories, setCategories] = useState<string[]>([]);
  const [testTypes, setTestTypes] = useState<string[]>([]);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TestCaseFormData>({
    defaultValues: {
      category: '',
      type: '',
      name: '',
      content: '',
      expected_behavior: '',
      description: ''
    }
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await testCaseApi.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!id) return;
      
      try {
        setIsFetching(true);
        const testCase = await testCaseApi.getById(Number(id));
        setValue('category', testCase.category);
        setValue('type', testCase.type);
        setValue('name', testCase.name);
        setValue('content', testCase.content);
        setValue('expected_behavior', testCase.expected_behavior);
        setValue('description', testCase.description || '');
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

  useEffect(() => {
    if (selectedCategory) {
      const fetchTypesForCategory = async () => {
        try {
          const testCases = await testCaseApi.getByCategory(selectedCategory);
          const types = Array.from(new Set((Array.isArray(testCases) ? testCases : []).map(tc => tc.type)));
          setTestTypes(types);
        } catch (error) {
          console.error('Error fetching test types:', error);
          setTestTypes([]);
        }
      };
      
      fetchTypesForCategory();
    } else {
      setTestTypes([]);
    }
  }, [selectedCategory]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="测试类别"
                options={[
                  { value: '', label: '选择测试类别' },
                  ...(categories || []).map(cat => ({ value: cat, label: cat }))
                ]}
                helperText="选择测试用例的类别"
                error={errors.category?.message}
                {...register('category', { required: '请选择测试类别' })}
              />
              
              <div>
                <Select
                  label="测试类型"
                  options={[
                    { value: '', label: '选择测试类型' },
                    ...(testTypes || []).map(type => ({ value: type, label: type })),
                    { value: '_new_', label: '+ 添加新类型' }
                  ]}
                  helperText="选择或添加新的测试类型"
                  error={errors.type?.message}
                  {...register('type', { required: '请选择或输入测试类型' })}
                />
                {watch('type') === '_new_' && (
                  <Input 
                    className="mt-2"
                    placeholder="输入新的测试类型"
                    {...register('type', { required: '请输入测试类型' })}
                  />
                )}
              </div>
            </div>
            
            <Input
              label="测试名称"
              placeholder="输入测试用例名称"
              helperText="简洁描述测试目的"
              error={errors.name?.message}
              {...register('name', { 
                required: '请输入测试名称',
                maxLength: { value: 100, message: '名称不能超过100个字符' }
              })}
            />
            
            <TextArea
              label="测试内容"
              placeholder="输入要发送给模型的提示..."
              rows={4}
              helperText="此内容将被发送给模型进行测试"
              error={errors.content?.message}
              {...register('content', { required: '请输入测试内容' })}
            />
            
            <TextArea
              label="预期行为"
              placeholder="描述模型应该如何响应..."
              rows={4}
              helperText="描述模型的期望响应方式"
              error={errors.expected_behavior?.message}
              {...register('expected_behavior', { required: '请输入预期行为' })}
            />
            
            <TextArea
              label="描述"
              placeholder="输入测试用例的其他信息（可选）"
              rows={3}
              helperText="提供额外的测试用例上下文或说明"
              {...register('description')}
            />
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
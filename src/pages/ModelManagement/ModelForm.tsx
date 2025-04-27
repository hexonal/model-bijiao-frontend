import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { modelConfigApi } from '../../services/api';
import { ModelConfig } from '../../types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface ModelFormData {
  name: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

const ModelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ModelFormData>({
    defaultValues: {
      name: '',
      model: '',
      temperature: 0.7,
      max_tokens: 2000
    }
  });

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return;
      
      try {
        setIsFetching(true);
        const model = await modelConfigApi.getById(Number(id));
        setValue('name', model.name);
        setValue('model', model.model);
        setValue('temperature', model.temperature);
        setValue('max_tokens', model.max_tokens);
      } catch (error) {
        toast.error('获取模型详情失败');
        console.error('Error fetching model:', error);
        navigate('/models');
      } finally {
        setIsFetching(false);
      }
    };

    if (isEditMode) {
      fetchModel();
    }
  }, [id, isEditMode, navigate, setValue]);

  const onSubmit = async (data: ModelFormData) => {
    try {
      setIsLoading(true);
      
      if (isEditMode) {
        await modelConfigApi.update(Number(id), data);
        toast.success('模型配置已更新');
      } else {
        await modelConfigApi.create(data);
        toast.success('模型配置已创建');
      }
      
      navigate('/models');
    } catch (error) {
      toast.error(isEditMode ? '更新模型配置失败' : '创建模型配置失败');
      console.error('Error saving model:', error);
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
          onClick={() => navigate('/models')}
        >
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? '编辑模型' : '添加模型'}
          </h1>
          <p className="mt-1 text-gray-500">
            {isEditMode ? '修改现有模型的配置信息' : '添加新的大语言模型配置'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? '编辑模型配置' : '添加模型配置'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="模型名称"
                placeholder="如: ChatGPT-3.5, 文心一言等"
                helperText="为模型配置指定一个易于识别的名称"
                error={errors.name?.message}
                {...register('name', { 
                  required: '请输入模型名称',
                  maxLength: { value: 50, message: '名称不能超过50个字符' }
                })}
              />
              
              <Input
                label="模型标识符"
                placeholder="如: gpt-3.5-turbo, ERNIE-4.0等"
                helperText="模型的技术标识符，需与API要求匹配"
                error={errors.model?.message}
                {...register('model', { 
                  required: '请输入模型标识符',
                  maxLength: { value: 50, message: '标识符不能超过50个字符' }
                })}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/models')}
            >
              取消
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={isLoading}
            >
              {isEditMode ? '保存修改' : '创建模型'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ModelForm;
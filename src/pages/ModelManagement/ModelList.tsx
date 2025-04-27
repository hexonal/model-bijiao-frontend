import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { modelConfigApi } from '../../services/api';
import { ModelConfig } from '../../types';
import toast from 'react-hot-toast';

const ModelList: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingModel, setVerifyingModel] = useState<number | null>(null);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const data = await modelConfigApi.getAll();
      setModels(data);
    } catch (error) {
      toast.error('获取模型列表失败');
      console.error('Error fetching models:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      setVerifyingModel(id);
      const response = await modelConfigApi.verify(id);
      if (response.status === 'success') {
        toast.success('模型连接验证成功');
      } else {
        toast.error(`验证失败: ${response.message}`);
      }
    } catch (error) {
      toast.error('验证模型连接失败');
      console.error('Error verifying model:', error);
    } finally {
      setVerifyingModel(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个模型配置吗？')) return;
    
    try {
      await modelConfigApi.delete(id);
      toast.success('模型配置已删除');
      fetchModels();
    } catch (error) {
      toast.error('删除模型配置失败');
      console.error('Error deleting model:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型管理</h1>
          <p className="mt-1 text-gray-500">管理和配置测试用的大语言模型</p>
        </div>
        <Link to="/models/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            添加模型
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>模型列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          ) : models.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>模型标识</TableHead>
                  <TableHead>温度</TableHead>
                  <TableHead>最大Token</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>{model.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{model.name}</TableCell>
                    <TableCell>{model.model}</TableCell>
                    <TableCell>{model.temperature}</TableCell>
                    <TableCell>{model.max_tokens}</TableCell>
                    <TableCell>{new Date(model.created_at).toLocaleString('zh-CN')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={verifyingModel === model.id}
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                          onClick={() => handleVerify(model.id)}
                        >
                          验证
                        </Button>
                        <Link to={`/models/edit/${model.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                            编辑
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(model.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">暂无模型配置</h3>
              <p className="mt-1 text-gray-500">添加一个模型配置开始使用平台功能</p>
              <div className="mt-6">
                <Link to="/models/new">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    添加模型
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelList;
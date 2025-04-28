import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { testCaseApi } from '../../services/api';
import { TestCase } from '../../types';
import toast from 'react-hot-toast';

const TestCaseList: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });

  const fetchTestCases = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await testCaseApi.getAll(page, pagination.size);
      setTestCases(response.data);
      setPagination({
        page: response.page,
        size: response.size,
        total: response.total
      });
    } catch (error) {
      toast.error('获取测试用例失败');
      console.error('Error fetching test cases:', error);
      setTestCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个测试用例吗？')) return;
    
    try {
      await testCaseApi.delete(id);
      toast.success('测试用例已删除');
      fetchTestCases(pagination.page);
    } catch (error) {
      toast.error('删除测试用例失败');
      console.error('Error deleting test case:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.size)) return;
    fetchTestCases(newPage);
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">测试用例</h1>
          <p className="mt-1 text-gray-500">管理和配置安全测试用例</p>
        </div>
        <Link to="/test-cases/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            添加用例
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>测试用例列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          ) : testCases.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((testCase) => (
                    <TableRow key={testCase.id}>
                      <TableCell>{testCase.id}</TableCell>
                      <TableCell className="font-medium text-gray-900">{testCase.name}</TableCell>
                      <TableCell>{new Date(testCase.created_at).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/test-cases/view/${testCase.id}`}>
                            <Button variant="outline" size="sm">
                              详情
                            </Button>
                          </Link>
                          <Link to={`/test-cases/edit/${testCase.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />}>
                              编辑
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(testCase.id)}
                          >
                            删除
                          </Button>
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
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">暂无测试用例</h3>
              <p className="mt-1 text-gray-500">添加一个测试用例开始测试</p>
              <div className="mt-6">
                <Link to="/test-cases/new">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    添加用例
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

export default TestCaseList;
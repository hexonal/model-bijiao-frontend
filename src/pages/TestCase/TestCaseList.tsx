import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Filter, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { testCaseApi } from '../../services/api';
import { TestCase } from '../../types';
import toast from 'react-hot-toast';

const TestCaseList: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', type: '', search: '' });

  const fetchTestCases = async () => {
    try {
      setIsLoading(true);
      const data = await testCaseApi.getAll(filter.category || undefined, filter.type || undefined);
      
      // Apply search filter client-side
      let filteredData = data;
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredData = data.filter((testCase) => 
          testCase.name.toLowerCase().includes(searchTerm) || 
          testCase.content.toLowerCase().includes(searchTerm) ||
          testCase.expected_behavior.toLowerCase().includes(searchTerm)
        );
      }
      
      setTestCases(filteredData);
    } catch (error) {
      toast.error('获取测试用例失败');
      console.error('Error fetching test cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await testCaseApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTestCases();
  }, [filter.category, filter.type]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTestCases();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个测试用例吗？')) return;
    
    try {
      await testCaseApi.delete(id);
      toast.success('测试用例已删除');
      fetchTestCases();
    } catch (error) {
      toast.error('删除测试用例失败');
      console.error('Error deleting test case:', error);
    }
  };

  const resetFilters = () => {
    setFilter({ category: '', type: '', search: '' });
    fetchTestCases();
  };

  // Get unique test types
  const testTypes = Array.from(new Set(testCases.map(tc => tc.type)));

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>筛选器</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              重置
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="测试类别"
              options={[
                { value: '', label: '全部类别' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              value={filter.category}
              onChange={(value) => setFilter(prev => ({ ...prev, category: value }))}
            />
            
            <Select
              label="测试类型"
              options={[
                { value: '', label: '全部类型' },
                ...testTypes.map(type => ({ value: type, label: type }))
              ]}
              value={filter.type}
              onChange={(value) => setFilter(prev => ({ ...prev, type: value }))}
            />
            
            <div className="flex items-end gap-2">
              <Input
                label="搜索"
                placeholder="搜索用例名称或内容..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="flex-1"
              />
              <Button type="submit" leftIcon={<Filter className="h-4 w-4" />}>
                搜索
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Cases Table */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>测试类别</TableHead>
                  <TableHead>测试类型</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase) => (
                  <TableRow key={testCase.id}>
                    <TableCell>{testCase.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{testCase.name}</TableCell>
                    <TableCell>
                      <Badge variant="primary">{testCase.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{testCase.type}</Badge>
                    </TableCell>
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
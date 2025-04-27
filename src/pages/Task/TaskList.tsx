import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FilePlus, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { taskApi } from '../../services/api';
import { TestTask, PaginatedResponse } from '../../types';
import toast from 'react-hot-toast';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TestTask[]>([]);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await taskApi.getAll(page, pagination.size);
      setTasks(response.data);
      setPagination({
        page: response.page,
        size: response.size,
        total: response.total
      });
    } catch (error) {
      toast.error('获取任务列表失败');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = () => {
    fetchTasks(pagination.page);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.size)) return;
    fetchTasks(newPage);
  };

  const statusColors: Record<string, string> = {
    'PENDING': 'bg-blue-100 text-blue-800',
    'RUNNING': 'bg-amber-100 text-amber-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'FAILED': 'bg-red-100 text-red-800',
    'PAUSED': 'bg-gray-100 text-gray-800'
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">测试任务</h1>
          <p className="mt-1 text-gray-500">管理和查看测试任务记录</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
          <Link to="/tasks/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              新建任务
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          ) : tasks.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务ID</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>测试用例数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium text-gray-900">
                        {task.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>{task.test_cases?.length || 0}</TableCell>
                      <TableCell>{new Date(task.created_at).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>{new Date(task.updated_at).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/tasks/${task.id}`}>
                            <Button variant="outline" size="sm">
                              详情
                            </Button>
                          </Link>
                          {task.status === 'COMPLETED' && (
                            <Link to={`/tasks/${task.id}/report`}>
                              <Button variant="outline" size="sm" leftIcon={<FilePlus className="h-4 w-4" />}>
                                报告
                              </Button>
                            </Link>
                          )}
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
              <h3 className="text-lg font-medium text-gray-900">暂无测试任务</h3>
              <p className="mt-1 text-gray-500">创建一个测试任务开始测试</p>
              <div className="mt-6">
                <Link to="/tasks/new">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>
                    新建任务
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

export default TaskList;
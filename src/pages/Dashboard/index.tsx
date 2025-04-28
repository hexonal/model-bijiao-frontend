import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ArrowRight, Zap, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { taskApi } from '../../services/api';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await taskApi.getAll(1, 5);
        setRecentTasks(response.tasks || []);
      } catch (error: any) {
        console.error('获取任务列表失败:', error);
        setError("获取任务列表失败，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Sample stats data
  const statsData = [
    { name: '政治敏感内容', passed: 25, failed: 5 },
    { name: '暴力极端内容', passed: 18, failed: 2 },
    { name: '歧视偏见言论', passed: 15, failed: 3 },
    { name: '违法犯罪活动', passed: 22, failed: 1 },
    { name: '隐私侵犯行为', passed: 20, failed: 2 },
  ];
  
  const pieData = [
    { name: '通过', value: 75, color: '#10B981' },
    { name: '不确定', value: 15, color: '#F59E0B' },
    { name: '失败', value: 10, color: '#EF4444' },
  ];
  
  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
  
  const statusColors: Record<string, string> = {
    'PENDING': 'bg-blue-100 text-blue-800',
    'RUNNING': 'bg-amber-100 text-amber-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'FAILED': 'bg-red-100 text-red-800',
    'PAUSED': 'bg-gray-100 text-gray-800'
  };
  
  const statCards = [
    { 
      title: '总测试次数', 
      value: '247', 
      change: '+12%', 
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50' 
    },
    { 
      title: '安全性能合格率', 
      value: '94.3%', 
      change: '+2.1%', 
      icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50' 
    },
    { 
      title: '风险检测项', 
      value: '12', 
      change: '-3', 
      icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
      color: 'bg-amber-50' 
    },
    { 
      title: '测试通过率', 
      value: '88.2%', 
      change: '+1.5%', 
      icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50' 
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-1 text-gray-500">监控模型安全性能和测试状态</p>
        {error && (
          <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>测试类别分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passed" name="通过" fill="#10B981" />
                  <Bar dataKey="failed" name="失败" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>整体测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Tests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>近期测试任务</CardTitle>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
            查看全部
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
            </div>
          ) : recentTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      任务ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      测试用例数
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.test_cases?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link to={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-900">
                          查看详情
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">暂无测试任务</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
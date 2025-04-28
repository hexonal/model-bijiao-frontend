import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, BarChart2, Settings, Database, FileText, LayoutGrid } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigation = [
    { name: '仪表盘', path: '/', icon: <BarChart2 className="h-5 w-5" /> },
    { name: '模型管理', path: '/models', icon: <Database className="h-5 w-5" /> },
    { name: '测试用例', path: '/test-cases', icon: <FileText className="h-5 w-5" /> },
    { name: '评估测试', path: '/evaluation', icon: <LayoutGrid className="h-5 w-5" /> },
    { name: '系统设置', path: '/models', icon: <Settings className="h-5 w-5" /> },
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-800">中文大模型安全测试平台</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`${
                    isActive(item.path)
                      ? 'bg-gray-100 text-blue-800'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-800'
                  } inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">打开主菜单</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`${
                  isActive(item.path)
                    ? 'bg-gray-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-800'
                } block px-3 py-2 rounded-md text-base font-medium flex items-center w-full`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
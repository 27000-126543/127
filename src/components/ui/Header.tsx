import React from 'react';
import { Library, Settings, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibraryStore } from '@/store';
import NotificationCenter from './NotificationCenter';
import type { UserRole } from '../../../shared/types';

interface HeaderProps {
  title?: string;
}

const roleNames: Record<UserRole, string> = {
  reader: '读者',
  librarian: '馆员',
  director: '馆长',
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useLibraryStore();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length === 0) return '智慧图书馆运营调度平台';
    
    const pageNames: Record<string, string> = {
      'home': '首页',
      'books': '图书管理',
      'seats': '座位管理',
      'environment': '环境监测',
      'inventory': '盘点管理',
      'analytics': '数据分析',
      'emergency': '应急指挥',
      'settings': '系统设置',
      'reservation': '座位预约',
    };
    
    return pageNames[path[path.length - 1]] || '智慧图书馆运营调度平台';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/main/settings');
  };

  return (
    <header className="h-14 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/50 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-library-500 to-library-600 flex items-center justify-center shadow-lg shadow-library-500/30">
            <Library size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gradient hidden sm:block">
            智慧图书馆
          </span>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <h1 className="text-base font-medium text-dark-200 truncate">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <NotificationCenter />
        
        <button
          onClick={handleSettings}
          className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-300 hover:text-white transition-all duration-200"
          title="系统设置"
        >
          <Settings size={20} />
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-dark-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-library-500 to-library-700 flex items-center justify-center">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white leading-tight">
                {currentUser.name}
              </p>
              <p className="text-xs text-dark-400 leading-tight">
                {roleNames[currentUser.role]}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-500/20 text-dark-300 hover:text-red-400 transition-all duration-200 ml-1"
          title="退出登录"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;

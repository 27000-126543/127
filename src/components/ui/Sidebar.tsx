import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Armchair,
  Thermometer,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
} from 'lucide-react';
import { useLibraryStore } from '@/store';
import type { UserRole } from '../../../shared/types';

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    path: '/main/home',
    label: '首页',
    icon: <Home size={20} />,
    roles: ['reader', 'librarian', 'director'],
  },
  {
    id: 'books',
    path: '/main/books',
    label: '图书管理',
    icon: <BookOpen size={20} />,
    roles: ['librarian', 'director'],
  },
  {
    id: 'seats',
    path: '/main/seats',
    label: '座位管理',
    icon: <Armchair size={20} />,
    roles: ['librarian', 'director'],
  },
  {
    id: 'reservation',
    path: '/main/reservation',
    label: '座位预约',
    icon: <CalendarClock size={20} />,
    roles: ['reader'],
  },
  {
    id: 'environment',
    path: '/main/environment',
    label: '环境监测',
    icon: <Thermometer size={20} />,
    roles: ['librarian', 'director'],
  },
  {
    id: 'inventory',
    path: '/main/inventory',
    label: '盘点管理',
    icon: <ClipboardList size={20} />,
    roles: ['librarian', 'director'],
  },
  {
    id: 'analytics',
    path: '/main/analytics',
    label: '数据分析',
    icon: <BarChart3 size={20} />,
    roles: ['director'],
  },
  {
    id: 'emergency',
    path: '/main/emergency',
    label: '应急指挥',
    icon: <AlertTriangle size={20} />,
    roles: ['director'],
  },
  {
    id: 'settings',
    path: '/main/settings',
    label: '系统设置',
    icon: <Settings size={20} />,
    roles: ['director'],
  },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser } = useLibraryStore();

  const userRole = currentUser?.role || 'reader';
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`h-full bg-dark-900/90 backdrop-blur-md border-r border-dark-700/50 flex flex-col transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex-1 py-3 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-library-500/20 text-white border-l-2 border-library-500'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800/50 border-l-2 border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-library-400' : 'group-hover:text-library-400'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-2 border-t border-dark-700/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-dark-800/50 text-dark-400 hover:text-white transition-all duration-200"
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm ml-2">收起</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

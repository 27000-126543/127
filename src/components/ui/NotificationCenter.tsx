import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useLibraryStore } from '@/store';
import type { Notification } from '../../../shared/types';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markNotificationRead } = useLibraryStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Info size={16} className="text-library-500" />;
    }
  };

  const getTypeBg = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      default:
        return 'bg-library-500/10 border-library-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return time.toLocaleDateString('zh-CN');
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        markNotificationRead(n.id);
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-dark-700/50 text-dark-300 hover:text-white transition-all duration-200"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-panel shadow-xl animate-fade-in z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700/50">
            <h3 className="font-semibold text-white">通知中心</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-library-400 hover:text-library-300 flex items-center gap-1 transition-colors"
              >
                <Check size={12} />
                全部已读
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-dark-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>暂无通知</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-700/30">
                {notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-dark-800/50 transition-colors ${!notification.read ? 'bg-dark-800/30' : ''}`}
                    onClick={() => !notification.read && markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg border ${getTypeBg(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-dark-300'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-library-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-dark-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

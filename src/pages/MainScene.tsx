import React, { useEffect, useState } from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, BookOpen, Users, Armchair, AlertTriangle, TrendingUp, Clock, MapPin, X, Flame, Siren, FileSpreadsheet } from 'lucide-react';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import StatusBar from '@/components/ui/StatusBar';
import { LibraryScene } from '@/components/scene3d';
import {
  BookDetailPanel,
  SeatReservationPanel,
  EnvironmentPanel,
  InventoryPanel,
  HotPredictionPanel,
  EmergencyPanel,
  DailyReportPanel,
} from '@/components/panels';
import { useLibraryStore } from '@/store';
import type { UserRole } from '../../shared/types';

const roleTitles: Record<UserRole, string> = {
  reader: '读者',
  librarian: '馆员',
  director: '馆长',
};

type PanelType = 'info' | 'book' | 'seat' | 'environment' | 'inventory' | 'prediction' | 'emergency' | 'report' | null;

const InfoPanel: React.FC = () => {
  const { currentUser, books, seats, robots, envData, notifications } = useLibraryStore();
  
  const availableBooks = books.filter(b => b.status === 'available').length;
  const borrowedBooks = books.filter(b => b.status === 'borrowed').length;
  const availableSeats = seats.filter(s => s.status === 'available').length;
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const activeRobots = robots.filter(r => r.status !== 'idle').length;
  const latestEnv = envData.length > 0 ? envData[envData.length - 1] : null;

  const stats = [
    { icon: <BookOpen size={20} />, label: '可借图书', value: availableBooks, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: <BookOpen size={20} />, label: '已借图书', value: borrowedBooks, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: <Armchair size={20} />, label: '可用座位', value: availableSeats, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: <Users size={20} />, label: '使用中', value: occupiedSeats, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: <TrendingUp size={20} />, label: '活跃机器人', value: activeRobots, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: <AlertTriangle size={20} />, label: '未读通知', value: unreadNotifications, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="h-full bg-dark-900/50 border-l border-dark-700/50 flex flex-col">
      <div className="p-4 border-b border-dark-700/50">
        <h3 className="font-semibold text-white">实时数据概览</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentUser && (
          <div className="glass-panel p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-library-500 to-library-700 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{currentUser.name}</p>
                <p className="text-sm text-dark-400">{roleTitles[currentUser.role]}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-dark-700/50 flex items-center gap-2 text-xs text-dark-400">
              <Clock size={12} />
              <span>上次登录: {currentUser.lastLogin || '首次登录'}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => (
            <div key={index} className="glass-panel p-3">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-dark-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {latestEnv && (
          <div className="glass-panel p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-library-400" />
              环境数据
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">温度</span>
                  <span className="text-white">{latestEnv.temperature.toFixed(1)}°C</span>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((latestEnv.temperature / 35) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">湿度</span>
                  <span className="text-white">{latestEnv.humidity.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${latestEnv.humidity}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">光照</span>
                  <span className="text-white">{latestEnv.illumination.toFixed(0)} lux</span>
                </div>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((latestEnv.illumination / 800) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {robots.length > 0 && (
          <div className="glass-panel p-4">
            <h4 className="font-medium text-white mb-3">盘点机器人状态</h4>
            <div className="space-y-2">
              {robots.slice(0, 3).map((robot) => (
                <div key={robot.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      robot.status === 'idle' ? 'bg-green-500' :
                      robot.status === 'scanning' ? 'bg-blue-500 animate-pulse' :
                      robot.status === 'charging' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm text-dark-300">{robot.name}</span>
                  </div>
                  <span className="text-xs text-dark-500">
                    {robot.status === 'idle' ? '空闲' :
                     robot.status === 'scanning' ? '盘点中' :
                     robot.status === 'returning' ? '返回中' : '充电中'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('info');
  const { selectedBook, selectBook, selectedSeat, selectSeat, books, seats, returnBook, reserveSeat, currentUser, borrowHistory, addMisshelvedBook, misshelvedBooks, resolveMisshelved, getDailyReport } = useLibraryStore();

  useEffect(() => {
    if (selectedBook) {
      setActivePanel('book');
    } else if (selectedSeat) {
      setActivePanel('seat');
    }
  }, [selectedBook, selectedSeat]);

  const handleTestBookClick = () => {
    const booksWithHistory = books.filter(b =>
      borrowHistory.some(h => h.bookId === b.id)
    );
    if (booksWithHistory.length > 0) {
      selectBook(booksWithHistory[0]);
    }
  };

  const handleTestReturnBook = () => {
    const borrowedBook = books.find(b => b.status === 'borrowed');
    if (borrowedBook) {
      returnBook(borrowedBook.id);
    }
  };

  const handleTestReserveSeat = () => {
    const availableSeat = seats.find(s => s.status === 'available');
    if (availableSeat && currentUser) {
      selectSeat(availableSeat);
      setTimeout(() => {
        reserveSeat(availableSeat.id, currentUser.id, 2);
      }, 500);
    }
  };

  const handleTestHotPath = () => {
    setActivePanel('prediction');
  };

  const handleTestEnvironment = () => {
    setActivePanel('environment');
  };

  const handleTestInventory = () => {
    setActivePanel('inventory');
    setTimeout(() => {
      const randomBook = books[Math.floor(Math.random() * books.length)];
      const randomShelf = books[Math.floor(Math.random() * books.length)]?.location.shelfId;
      addMisshelvedBook({
        id: Math.random().toString(36).substr(2, 9),
        bookId: randomBook.id,
        bookTitle: randomBook.title,
        currentShelfId: randomShelf,
        currentShelfName: randomShelf.replace('shelf-', '') + '区',
        targetShelfId: randomBook.location.shelfId,
        targetShelfName: randomBook.location.shelfId.replace('shelf-', '') + '区',
        status: 'pending',
        detectedTime: new Date().toISOString(),
      });
    }, 500);
  };

  const handleTestEmergency = () => {
    setActivePanel('emergency');
  };

  const handleTestExport = () => {
    setActivePanel('report');
  };

  const panelButtons: { type: PanelType; label: string; icon: React.ReactNode }[] = [
    { type: 'info', label: '概览', icon: <Box size={16} /> },
    { type: 'environment', label: '环境', icon: <MapPin size={16} /> },
    { type: 'inventory', label: '盘点', icon: <TrendingUp size={16} /> },
    { type: 'prediction', label: '预测', icon: <TrendingUp size={16} /> },
    { type: 'emergency', label: '应急', icon: <AlertTriangle size={16} /> },
    { type: 'report', label: '报表', icon: <BookOpen size={16} /> },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'info':
        return <InfoPanel />;
      case 'book':
        return selectedBook ? (
          <div className="h-full">
            <BookDetailPanel />
          </div>
        ) : <InfoPanel />;
      case 'seat':
        return (
          <div className="h-full">
            <SeatReservationPanel />
          </div>
        );
      case 'environment':
        return <EnvironmentPanel />;
      case 'inventory':
        return <InventoryPanel />;
      case 'prediction':
        return <HotPredictionPanel />;
      case 'emergency':
        return <EmergencyPanel />;
      case 'report':
        return <DailyReportPanel />;
      default:
        return <InfoPanel />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-3/4 h-full relative bg-dark-950">
        <LibraryScene />
        <div className="absolute top-4 left-4 glass-panel px-4 py-2 flex items-center gap-2">
          <Box size={16} className="text-library-400" />
          <span className="text-sm text-dark-300">3D 智慧图书馆</span>
        </div>
        <div className="absolute top-4 right-4 glass-panel p-3 flex flex-col gap-2 max-w-[200px]">
          <div className="text-xs font-medium text-white mb-1">功能测试按钮</div>
          <button onClick={handleTestBookClick} className="px-2 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-xs transition-colors">
            1. 点击图书查看借阅历史
          </button>
          <button onClick={handleTestReturnBook} className="px-2 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors">
            2. 还书分拣动画
          </button>
          <button onClick={handleTestReserveSeat} className="px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors">
            3. 座位预约
          </button>
          <button onClick={handleTestHotPath} className="px-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs transition-colors">
            4. 热门图书绿色路径
          </button>
          <button onClick={handleTestEnvironment} className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
            5. 环境监测联动
          </button>
          <button onClick={handleTestInventory} className="px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs transition-colors">
            6. 盘点错架工单
          </button>
          <button onClick={handleTestEmergency} className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors">
            7. 应急疏散路线
          </button>
          <button onClick={handleTestExport} className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs transition-colors">
            8. 导出运营日报
          </button>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <div className="glass-panel px-3 py-1.5 text-xs text-dark-400">
            鼠标左键: 旋转
          </div>
          <div className="glass-panel px-3 py-1.5 text-xs text-dark-400">
            滚轮: 缩放
          </div>
          <div className="glass-panel px-3 py-1.5 text-xs text-dark-400">
            右键: 平移
          </div>
        </div>
      </div>
      <div className="w-1/4 h-full flex flex-col">
        <div className="flex gap-1 p-2 border-b border-dark-700/50 bg-dark-900/50 overflow-x-auto">
          {panelButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => setActivePanel(btn.type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activePanel === btn.type
                  ? 'bg-library-600 text-white shadow-lg shadow-library-600/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

const PanelWrapper: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div className="flex-1 flex bg-dark-950">
      <div className="w-1/2 h-full p-6">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        {children}
      </div>
      <div className="w-1/2 h-full">
        <LibraryScene />
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, init, isInitialized, updateEnvironmentData, robots, updateRobotPosition } = useLibraryStore();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    
    if (!isInitialized) {
      init();
    }
  }, [currentUser, isInitialized, init, navigate]);

  useEffect(() => {
    if (!isInitialized) return;

    const envInterval = setInterval(() => {
      const baseTemp = 23;
      const baseHumidity = 50;
      const baseIllumination = 350;
      
      const newData = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        temperature: baseTemp + (Math.random() - 0.5) * 4,
        humidity: Math.max(30, Math.min(70, baseHumidity + (Math.random() - 0.5) * 10)),
        illumination: Math.max(100, Math.min(600, baseIllumination + (Math.random() - 0.5) * 150)),
        pm25: 15 + Math.random() * 10,
        co2: 400 + Math.random() * 200,
        areaId: 'reading-1',
      };
      updateEnvironmentData(newData);
    }, 5000);

    const robotInterval = setInterval(() => {
      robots.forEach(robot => {
        if (robot.status === 'scanning') {
          const points = robot.currentPath;
          if (points.length === 0) return;
          
          const newProgress = Math.min(robot.progress + 0.01, 1);
          const segmentIndex = Math.min(Math.floor(newProgress * (points.length - 1)), points.length - 2);
          const segmentProgress = (newProgress * (points.length - 1)) % 1;
          
          const start = points[segmentIndex];
          const end = points[Math.min(segmentIndex + 1, points.length - 1)];
          
          const newPosition = {
            x: start.x + (end.x - start.x) * segmentProgress,
            y: start.y + (end.y - start.y) * segmentProgress,
            z: start.z + (end.z - start.z) * segmentProgress,
          };
          
          updateRobotPosition(robot.id, newPosition, newProgress >= 1 ? 0 : newProgress);
        }
      });
    }, 100);

    return () => {
      clearInterval(envInterval);
      clearInterval(robotInterval);
    };
  }, [isInitialized, robots, updateEnvironmentData, updateRobotPosition]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="home" element={<HomePage />} />
            <Route path="books" element={
              <PanelWrapper title="图书管理">
                <BookDetailPanel />
              </PanelWrapper>
            } />
            <Route path="seats" element={
              <PanelWrapper title="座位管理">
                <SeatReservationPanel />
              </PanelWrapper>
            } />
            <Route path="reservation" element={
              <PanelWrapper title="座位预约">
                <SeatReservationPanel />
              </PanelWrapper>
            } />
            <Route path="environment" element={
              <PanelWrapper title="环境监测">
                <EnvironmentPanel />
              </PanelWrapper>
            } />
            <Route path="inventory" element={
              <PanelWrapper title="盘点管理">
                <InventoryPanel />
              </PanelWrapper>
            } />
            <Route path="analytics" element={
              <PanelWrapper title="数据分析">
                <HotPredictionPanel />
              </PanelWrapper>
            } />
            <Route path="emergency" element={
              <PanelWrapper title="应急指挥">
                <EmergencyPanel />
              </PanelWrapper>
            } />
            <Route path="report" element={
              <PanelWrapper title="运营日报">
                <DailyReportPanel />
              </PanelWrapper>
            } />
            <Route path="settings" element={
              <PanelWrapper title="系统设置">
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">系统设置</h3>
                  <p className="text-dark-400">系统设置模块正在开发中...</p>
                </div>
              </PanelWrapper>
            } />
            <Route path="" element={<HomePage />} />
          </Routes>
          <Outlet />
        </div>
      </div>
      <StatusBar />
    </div>
  );
};

const MainScene: React.FC = () => {
  return <MainLayout />;
};

export default MainScene;

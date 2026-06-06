import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, User, UserCog, Crown, ScanFace, LogIn } from 'lucide-react';
import { useLibraryStore } from '@/store';
import type { UserRole } from '../../shared/types';

interface RoleCard {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const roleCards: RoleCard[] = [
  {
    role: 'reader',
    title: '读者',
    description: '图书借阅、座位预约、个人中心',
    icon: <User size={28} />,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    role: 'librarian',
    title: '馆员',
    description: '图书管理、座位管理、环境监测、盘点',
    icon: <UserCog size={28} />,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    role: 'director',
    title: '馆长',
    description: '全功能权限、数据分析、应急指挥',
    icon: <Crown size={28} />,
    gradient: 'from-amber-500 to-orange-500',
  },
];

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const navigate = useNavigate();
  const { login, init } = useLibraryStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    if (!selectedRole || isScanning) return;

    setIsScanning(true);
    setScanProgress(0);

    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    setTimeout(async () => {
      try {
        init();
        await login(selectedRole);
        navigate('/main/home');
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        clearInterval(scanInterval);
        setIsScanning(false);
      }
    }, 2000);
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden grid-bg">
      <div className="absolute inset-0 radial-glow" />
      
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-5xl px-6 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-library-500 to-library-700 mb-4 shadow-xl shadow-library-500/30 animate-float">
            <Library size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-gradient">3D智慧图书馆</span>
          </h1>
          <p className="text-dark-400 text-lg">智能运营调度平台</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="face-scan-container glass-panel p-6">
            <div className="corner-decoration corner-tl" />
            <div className="corner-decoration corner-tr" />
            <div className="corner-decoration corner-bl" />
            <div className="corner-decoration corner-br" />
            <div className="face-scan-grid" />
            
            <div className="relative z-10 flex flex-col items-center justify-center py-8">
              <div className="relative mb-6">
                <div className={`w-48 h-48 rounded-full border-4 ${isScanning ? 'border-library-500 animate-pulse' : 'border-dark-600'} bg-dark-800 flex items-center justify-center overflow-hidden transition-all duration-500`}>
                  {isScanning ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-gradient-to-b from-library-500/0 via-library-500/30 to-library-500/0 animate-scan-line" />
                      <ScanFace size={64} className="absolute inset-0 m-auto text-library-400" />
                    </div>
                  ) : (
                    <ScanFace size={64} className="text-dark-500" />
                  )}
                </div>
                
                {isScanning && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48">
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-library-500 to-library-400 rounded-full transition-all duration-100"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-xs text-library-400 mt-2">
                      人脸识别中... {scanProgress}%
                    </p>
                  </div>
                )}
              </div>

              {!isScanning && (
                <p className="text-dark-400 text-sm">
                  {selectedRole 
                    ? `已选择身份：${roleCards.find(r => r.role === selectedRole)?.title}`
                    : '请选择您的身份后进行人脸识别'
                  }
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">选择您的身份</h2>
            
            {roleCards.map((card) => (
              <div
                key={card.role}
                onClick={() => handleRoleSelect(card.role)}
                className={`glass-panel-hover p-4 cursor-pointer border-2 transition-all duration-300 ${
                  selectedRole === card.role
                    ? 'border-library-500 shadow-lg shadow-library-500/20'
                    : 'border-transparent hover:border-dark-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{card.title}</h3>
                    <p className="text-dark-400 text-sm">{card.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    selectedRole === card.role
                      ? 'border-library-500 bg-library-500'
                      : 'border-dark-600'
                  }`}>
                    {selectedRole === card.role && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleLogin}
              disabled={!selectedRole || isScanning}
              className="w-full btn-primary py-3.5 mt-6 flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {isScanning ? '识别中...' : '人脸识别登录'}
            </button>

            <p className="text-center text-dark-500 text-xs mt-4">
              © 2024 智慧图书馆运营调度平台 v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { X, AlertTriangle, Flame, Activity, Shield, AlertOctagon, Clock, Users, CheckCircle, Play, Square } from 'lucide-react';
import { useLibraryStore } from '@/store';
import { cn } from '@/lib/utils';
import type { EmergencyType } from '../../../shared/types';

const emergencyTypeConfig: Record<EmergencyType, { label: string; icon: typeof Flame; color: string; bgClass: string }> = {
  fire: { label: '火灾', icon: Flame, color: '#ef4444', bgClass: 'bg-red-500/20' },
  earthquake: { label: '地震', icon: Activity, color: '#f59e0b', bgClass: 'bg-yellow-500/20' },
  security: { label: '安全事件', icon: Shield, color: '#3b82f6', bgClass: 'bg-blue-500/20' },
};

export default function EmergencyPanel() {
  const { emergencyEvent, startEmergency, stopEmergency, setActivePanel } = useLibraryStore();
  const [selectedType, setSelectedType] = useState<EmergencyType>('fire');

  const handleStart = () => {
    startEmergency(selectedType);
  };

  const handleStop = () => {
    stopEmergency();
  };

  const handleClose = () => {
    setActivePanel(null);
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diff = now - start;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          应急指挥
        </h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        {!emergencyEvent ? (
          <>
            <div className="text-sm text-gray-400 mb-3">选择紧急事件类型</div>
            <div className="space-y-2 mb-6">
              {(Object.keys(emergencyTypeConfig) as EmergencyType[]).map((type) => {
                const config = emergencyTypeConfig[type];
                const Icon = config.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'w-full p-3 rounded-xl border transition-all flex items-center gap-3',
                      selectedType === type
                        ? `${config.bgClass} border-white/30`
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">{config.label}</div>
                      <div className="text-xs text-gray-400">
                        {type === 'fire' && '启动火灾应急预案，开启消防广播'}
                        {type === 'earthquake' && '启动地震应急预案，引导就近躲避'}
                        {type === 'security' && '启动安全预案，通知安保人员'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-400 mb-1">重要提示</div>
                  <p className="text-xs text-gray-400">
                    启动应急疏散将触发全场警报，并在3D场景中显示疏散路线。请谨慎操作。
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Play className="w-4 h-4" />
              一键启动疏散
            </button>
          </>
        ) : (
          <>
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center">
                  {(() => {
                    const Icon = emergencyTypeConfig[emergencyEvent.type].icon;
                    return <Icon className="w-6 h-6 text-red-400" />;
                  })()}
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">
                    {emergencyTypeConfig[emergencyEvent.type].label}警报
                  </div>
                  <div className="text-xs text-gray-400">
                    状态: <span className={cn(
                      'px-2 py-0.5 rounded-full ml-1',
                      emergencyEvent.status === 'active'
                        ? 'bg-red-500/30 text-red-400'
                        : 'bg-green-500/30 text-green-400'
                    )}>
                      {emergencyEvent.status === 'active' ? '应急中' : '已解除'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/20 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-lg font-bold">
                      {emergencyEvent.status === 'active'
                        ? formatDuration(emergencyEvent.startTime)
                        : '已结束'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">持续时间</div>
                </div>
                <div className="bg-black/20 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                    <Users className="w-3 h-3" />
                    <span className="text-lg font-bold">
                      {emergencyEvent.escapeRoutes.length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">疏散路线</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-400 mb-2">疏散路线</div>
              {emergencyEvent.escapeRoutes.map((route, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-xs text-green-400 font-bold">{index + 1}</span>
                      </div>
                      <span className="text-sm text-white">疏散通道 {index + 1}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      启用
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    途经点: {route.points.length} 个
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-400 mb-1">疏散指引</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• 保持冷静，按照指示标志疏散</li>
                    <li>• 就近选择安全出口撤离</li>
                    <li>• 不要乘坐电梯，使用楼梯</li>
                    <li>• 照顾老人和儿童</li>
                  </ul>
                </div>
              </div>
            </div>

            {emergencyEvent.status === 'active' ? (
              <button
                onClick={handleStop}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Square className="w-4 h-4" />
                解除应急状态
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 bg-green-500/20 text-green-400 rounded-xl font-medium text-sm">
                <CheckCircle className="w-4 h-4" />
                应急状态已解除
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

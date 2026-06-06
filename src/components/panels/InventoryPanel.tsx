import { useState } from 'react';
import { X, Bot, Battery, MapPin, Activity, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { useLibraryStore } from '@/store';
import Tabs from './Tabs';
import { cn } from '@/lib/utils';
import type { MisshelvedBook } from '../../../shared/types';

const robotStatusMap = {
  idle: { label: '待机', className: 'bg-gray-500/20 text-gray-400' },
  scanning: { label: '盘点中', className: 'bg-cyan-500/20 text-cyan-400' },
  returning: { label: '返回中', className: 'bg-yellow-500/20 text-yellow-400' },
  charging: { label: '充电中', className: 'bg-green-500/20 text-green-400' },
};

const misshelvedStatusMap = {
  pending: { label: '待处理', className: 'bg-yellow-500/20 text-yellow-400' },
  processing: { label: '处理中', className: 'bg-blue-500/20 text-blue-400' },
  resolved: { label: '已解决', className: 'bg-green-500/20 text-green-400' },
};

export default function InventoryPanel() {
  const { robots, misshelvedBooks, resolveMisshelved, setActivePanel } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('robot');

  const handleClose = () => {
    setActivePanel(null);
  };

  const handleResolve = (id: string) => {
    resolveMisshelved(id);
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-400';
    if (battery > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBatteryBg = (battery: number) => {
    if (battery > 60) return 'bg-green-400';
    if (battery > 30) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          盘点监控
        </h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <Tabs
        tabs={[
          { key: 'robot', label: '机器人状态' },
          { key: 'misshelved', label: '错架工单' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-4">
        {activeTab === 'robot' ? (
          <div className="space-y-3">
            {robots.map((robot) => (
              <div key={robot.id} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{robot.name}</div>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', robotStatusMap[robot.status].className)}>
                        {robotStatusMap[robot.status].label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Battery className="w-3 h-3" />
                        电量
                      </div>
                      <span className={cn('text-xs font-medium', getBatteryColor(robot.battery))}>
                        {robot.battery}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getBatteryBg(robot.battery))}
                        style={{ width: `${robot.battery}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Activity className="w-3 h-3" />
                        盘点进度
                      </div>
                      <span className="text-xs font-medium text-cyan-400">
                        {robot.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all"
                        style={{ width: `${robot.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    位置: ({robot.position.x.toFixed(1)}, {robot.position.y.toFixed(1)}, {robot.position.z.toFixed(1)})
                  </div>

                  {robot.misshelvedBooks.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <AlertTriangle className="w-3 h-3" />
                      发现错架: {robot.misshelvedBooks.length} 本
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-cyan-400">{robots.filter(r => r.status === 'scanning').length}</div>
                <div className="text-xs text-gray-400">盘点中</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">{robots.filter(r => r.status === 'idle').length}</div>
                <div className="text-xs text-gray-400">待机</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">{robots.reduce((acc, r) => acc + r.misshelvedBooks.length, 0)}</div>
                <div className="text-xs text-gray-400">待处理</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {misshelvedBooks.length > 0 ? (
              <div className="space-y-2">
                {misshelvedBooks.map((item: MisshelvedBook) => (
                  <div key={item.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white truncate">{item.bookTitle}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          {item.detectedTime}
                        </div>
                      </div>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs ml-2 flex-shrink-0', misshelvedStatusMap[item.status].className)}>
                        {misshelvedStatusMap[item.status].label}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded p-2 text-xs space-y-1 mb-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 flex-shrink-0">当前:</span>
                        <span className="text-red-400">{item.currentShelfName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 flex-shrink-0">应在:</span>
                        <span className="text-green-400">{item.targetShelfName}</span>
                      </div>
                    </div>

                    {item.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        {item.status === 'pending' ? (
                          <>
                            <Wrench className="w-3 h-3" />
                            开始处理
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            标记完成
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                暂无错架工单
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

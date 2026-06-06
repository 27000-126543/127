import { useState, useMemo } from 'react';
import { X, TrendingUp, Flame, BookOpen, MapPin, Clock, CheckCircle, Truck, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLibraryStore } from '@/store';
import Tabs from './Tabs';
import { cn } from '@/lib/utils';
import type { HotBookPrediction } from '../../../shared/types';

const transferStatusMap = {
  pending: { label: '待调配', className: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  in_transit: { label: '调配中', className: 'bg-blue-500/20 text-blue-400', icon: Truck },
  completed: { label: '已完成', className: 'bg-green-500/20 text-green-400', icon: CheckCircle },
};

export default function HotPredictionPanel() {
  const { hotPredictions, setActivePanel } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('list');

  const sortedPredictions = useMemo(() => {
    return [...hotPredictions].sort((a, b) => b.predictedBorrows - a.predictedBorrows);
  }, [hotPredictions]);

  const chartData = useMemo(() => {
    return sortedPredictions.slice(0, 10).map((item, index) => ({
      rank: index + 1,
      title: item.book.title.length > 4 ? item.book.title.substring(0, 4) + '...' : item.book.title,
      predictedBorrows: item.predictedBorrows,
      confidence: item.confidence,
    }));
  }, [sortedPredictions]);

  const handleClose = () => {
    setActivePanel(null);
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-white/10 text-gray-400';
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { title: string; predictedBorrows: number; confidence: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800/95 backdrop-blur border border-white/10 rounded-lg p-3 text-sm">
          <p className="text-white font-medium mb-1">{data.title}</p>
          <p className="text-cyan-400">预测借阅: {data.predictedBorrows} 次</p>
          <p className="text-gray-400">置信度: {(data.confidence * 100).toFixed(0)}%</p>
        </div>
      );
    }
    return null;
  };

  const barColors = ['#f59e0b', '#9ca3af', '#d97706', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', '#1e3a5f', '#1e293b'];

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          热门预测
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
          { key: 'list', label: 'Top10 榜单' },
          { key: 'chart', label: '预测分析' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-4">
        {activeTab === 'list' ? (
          <div className="max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {sortedPredictions.slice(0, 10).map((item: HotBookPrediction, index: number) => {
                const StatusIcon = transferStatusMap[item.transferStatus].icon;
                return (
                  <div key={item.bookId} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', getRankStyle(index + 1))}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-white truncate">{item.book.title}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">{item.book.author}</div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <TrendingUp className="w-3 h-3 text-orange-400" />
                            <span>预测借阅: <span className="text-orange-400 font-medium">{item.predictedBorrows}</span> 次</span>
                          </div>
                          <span className="text-xs text-cyan-400">
                            {(item.confidence * 100).toFixed(0)}% 置信
                          </span>
                        </div>
                        <div className="bg-white/5 rounded p-2 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-400">{item.currentLocation}</span>
                            <span className="text-cyan-400">→</span>
                            <span className="text-green-400">{item.targetLocation}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', transferStatusMap[item.transferStatus].className)}>
                            <StatusIcon className="w-3 h-3" />
                            {transferStatusMap[item.transferStatus].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      type="number"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="rank"
                      type="category"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={24}
                      tickFormatter={(value) => value.toString()}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="predictedBorrows" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-400">
                  {sortedPredictions.filter(p => p.transferStatus === 'in_transit').length}
                </div>
                <div className="text-xs text-gray-400">调配中</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">
                  {sortedPredictions.filter(p => p.transferStatus === 'pending').length}
                </div>
                <div className="text-xs text-gray-400">待调配</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">
                  {sortedPredictions.filter(p => p.transferStatus === 'completed').length}
                </div>
                <div className="text-xs text-gray-400">已完成</div>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-r from-orange-500/20 to-cyan-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">预测说明</span>
              </div>
              <p className="text-xs text-gray-400">
                基于历史借阅数据、季节趋势和用户行为预测未来7天热门图书，置信度越高预测越准确。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

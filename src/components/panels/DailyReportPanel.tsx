import { useState, useMemo } from 'react';
import { X, Calendar, FileSpreadsheet, TrendingUp, Users, BookOpen, AlertCircle, BarChart3, Download, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import { useLibraryStore } from '@/store';
import { cn } from '@/lib/utils';
import type { DailyReport, DeviceFailure } from '../../../shared/types';

const areaNameMap: Record<string, string> = {
  'area-books-1': '书架主区',
  'area-reading-1': '阅览主区',
  'area-kiosk-1': '自助服务区',
  'area-conveyor-1': '分拣区',
  'area-monitor-1': '监控中心',
};

const deviceTypeMap: Record<string, string> = {
  ac: '空调',
  light: '灯光',
  kiosk: '自助机',
  conveyor: '传送带',
};

export default function DailyReportPanel() {
  const { getDailyReport, books, seats, setActivePanel } = useLibraryStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportSuccess, setExportSuccess] = useState(false);

  const report = useMemo<DailyReport>(() => {
    return getDailyReport(selectedDate);
  }, [getDailyReport, selectedDate]);

  const borrowChartData = useMemo(() => {
    return Object.entries(report.borrowCount).map(([areaId, count]) => ({
      area: areaNameMap[areaId] || areaId,
      count,
    }));
  }, [report]);

  const utilizationData = useMemo(() => {
    return [
      { name: '已使用', value: Math.round(report.seatUtilization * 100) },
      { name: '空闲', value: Math.round((1 - report.seatUtilization) * 100) },
    ];
  }, [report]);

  const handleExport = () => {
    const exportData = {
      '运营概览': [
        { 指标: '日期', 值: report.date },
        { 指标: '总借阅量', 值: report.totalBorrows },
        { 指标: '总归还量', 值: report.totalReturns },
        { 指标: '新增预约', 值: report.newReservations },
        { 指标: '座位利用率', 值: `${(report.seatUtilization * 100).toFixed(1)}%` },
        { 指标: '图书错架率', 值: `${(report.misshelveRate * 100).toFixed(2)}%` },
      ],
      '各区域借阅量': borrowChartData.map(d => ({
        区域: d.area,
        借阅量: d.count,
      })),
      '设备故障列表': report.deviceFailures.map((f: DeviceFailure) => ({
        设备ID: f.deviceId,
        设备类型: deviceTypeMap[f.type] || f.type,
        故障描述: f.description,
        发生时间: f.time,
      })),
    };

    const wb = XLSX.utils.book_new();

    Object.entries(exportData).forEach(([sheetName, data]) => {
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `运营日报_${report.date}.xlsx`);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleClose = () => {
    setActivePanel(null);
  };

  const barColors = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'];

  const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { area: string; count: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 backdrop-blur border border-white/10 rounded-lg p-3 text-sm">
          <p className="text-white font-medium mb-1">{payload[0].payload.area}</p>
          <p className="text-cyan-400">借阅量: {payload[0].payload.count} 次</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
          运营日报
        </h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={handleExport}
            className={cn(
              'px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm',
              exportSuccess
                ? 'bg-green-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'
            )}
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                已导出
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
              <BookOpen className="w-3 h-3" />
              总借阅
            </div>
            <div className="text-xl font-bold text-cyan-400">{report.totalBorrows}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              总归还
            </div>
            <div className="text-xl font-bold text-green-400">{report.totalReturns}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
              <Users className="w-3 h-3" />
              新增预约
            </div>
            <div className="text-xl font-bold text-orange-400">{report.newReservations}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
              <AlertCircle className="w-3 h-3" />
              设备故障
            </div>
            <div className="text-xl font-bold text-red-400">{report.deviceFailures.length}</div>
          </div>
        </div>

        <div className="space-y-4 max-h-72 overflow-y-auto">
          <div>
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              各区域借阅量统计
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={borrowChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="area"
                      stroke="#9ca3af"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 9 }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {borrowChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-2">座位利用率</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={utilizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                      label={renderCustomizedLabel}
                    >
                      <Cell fill="#06b6d4" />
                      <Cell fill="#374151" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-400 mt-1">
                {(report.seatUtilization * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-2">图书错架率</div>
              <div className="flex flex-col items-center justify-center h-24">
                <div className="text-2xl font-bold text-orange-400">
                  {(report.misshelveRate * 100).toFixed(2)}%
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${Math.min(report.misshelveRate * 100 * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-400" />
              设备故障列表
            </div>
            {report.deviceFailures.length > 0 ? (
              <div className="space-y-2">
                {report.deviceFailures.map((failure: DeviceFailure, index: number) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {deviceTypeMap[failure.type] || failure.type}
                      </span>
                      <span className="text-xs text-red-400">{failure.deviceId}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{failure.description}</p>
                    <p className="text-xs text-gray-500">{failure.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-4 text-center text-gray-500 text-sm">
                今日无设备故障
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

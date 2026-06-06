import { useState, useMemo } from 'react';
import { X, Thermometer, Droplets, Sun, Wind, Power, Settings, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useLibraryStore } from '@/store';
import Tabs from './Tabs';
import { cn } from '@/lib/utils';

interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
  illumination: number;
  pm25: number;
}

const deviceTypeMap = {
  ac: { label: '空调', icon: Thermometer },
  light: { label: '灯光', icon: Sun },
  kiosk: { label: '自助机', icon: Settings },
  conveyor: { label: '传送带', icon: Settings },
};

export default function EnvironmentPanel() {
  const { envData, devices, thresholds, setDeviceStatus, setThresholds, setActivePanel } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('monitor');
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'illumination' | 'pm25'>('temperature');
  const [editingThreshold, setEditingThreshold] = useState<'temperature' | 'humidity' | 'illumination' | null>(null);
  const [tempMin, setTempMin] = useState(thresholds.temperature.min);
  const [tempMax, setTempMax] = useState(thresholds.temperature.max);
  const [humidityMin, setHumidityMin] = useState(thresholds.humidity.min);
  const [humidityMax, setHumidityMax] = useState(thresholds.humidity.max);
  const [illuminationMin, setIlluminationMin] = useState(thresholds.illumination.min);
  const [illuminationMax, setIlluminationMax] = useState(thresholds.illumination.max);

  const chartData = useMemo<ChartData[]>(() => {
    return envData.slice(-30).map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      temperature: Math.round(d.temperature * 10) / 10,
      humidity: Math.round(d.humidity),
      illumination: Math.round(d.illumination),
      pm25: Math.round(d.pm25),
    }));
  }, [envData]);

  const latestData = useMemo(() => {
    if (envData.length === 0) return null;
    return envData[envData.length - 1];
  }, [envData]);

  const metricConfig = {
    temperature: { label: '温度', unit: '°C', icon: Thermometer, color: '#f97316', min: 10, max: 40 },
    humidity: { label: '湿度', unit: '%', icon: Droplets, color: '#3b82f6', min: 20, max: 80 },
    illumination: { label: '光照', unit: 'lux', icon: Sun, color: '#eab308', min: 0, max: 800 },
    pm25: { label: 'PM2.5', unit: 'μg/m³', icon: Wind, color: '#10b981', min: 0, max: 100 },
  };

  const handleSaveThreshold = (type: 'temperature' | 'humidity' | 'illumination') => {
    if (type === 'temperature') {
      setThresholds('temperature', tempMin, tempMax);
    } else if (type === 'humidity') {
      setThresholds('humidity', humidityMin, humidityMax);
    } else {
      setThresholds('illumination', illuminationMin, illuminationMax);
    }
    setEditingThreshold(null);
  };

  const handleToggleDevice = (deviceId: string, currentStatus: 'on' | 'off') => {
    const newStatus = currentStatus === 'on' ? 'off' : 'on';
    setDeviceStatus(deviceId, newStatus);
  };

  const handleClose = () => {
    setActivePanel(null);
  };

  const getStatusColor = (value: number, type: 'temperature' | 'humidity' | 'illumination' | 'pm25') => {
    if (type === 'pm25') {
      if (value < 35) return 'text-green-400';
      if (value < 75) return 'text-yellow-400';
      return 'text-red-400';
    }
    const threshold = thresholds[type as keyof typeof thresholds];
    if (value < threshold.min || value > threshold.max) return 'text-red-400';
    return 'text-green-400';
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 backdrop-blur border border-white/10 rounded-lg p-3 text-sm">
          <p className="text-gray-400 mb-1">{label}</p>
          <p style={{ color: payload[0].color }}>
            {metricConfig[selectedMetric].label}: {payload[0].value} {metricConfig[selectedMetric].unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          环境监测
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
          { key: 'monitor', label: '实时监测' },
          { key: 'device', label: '设备控制' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-4">
        {activeTab === 'monitor' ? (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
                const config = metricConfig[key];
                const Icon = config.icon;
                const value = latestData ? latestData[key] : 0;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className={cn(
                      'p-3 rounded-xl border transition-all text-left',
                      selectedMetric === key
                        ? 'bg-cyan-500/20 border-cyan-400'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                      <span className="text-xs text-gray-400">{config.label}</span>
                    </div>
                    <div className={cn('text-xl font-bold', getStatusColor(value, key))}>
                      {value.toFixed(key === 'temperature' ? 1 : 0)}
                      <span className="text-xs text-gray-500 ml-1">{config.unit}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-4">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={metricConfig[selectedMetric].color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={metricConfig[selectedMetric].color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="time"
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[metricConfig[selectedMetric].min, metricConfig[selectedMetric].max]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={metricConfig[selectedMetric].color}
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                阈值设置
              </div>
              {(['temperature', 'humidity', 'illumination'] as const).map((type) => {
                const config = metricConfig[type];
                const threshold = thresholds[type];
                const Icon = config.icon;
                const isEditing = editingThreshold === type;
                return (
                  <div key={type} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <span className="text-sm text-white">{config.label}</span>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => setEditingThreshold(type)}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          编辑
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-8">最小</span>
                          <input
                            type="number"
                            value={type === 'temperature' ? tempMin : type === 'humidity' ? humidityMin : illuminationMin}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (type === 'temperature') setTempMin(val);
                              else if (type === 'humidity') setHumidityMin(val);
                              else setIlluminationMin(val);
                            }}
                            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-400"
                          />
                          <span className="text-xs text-gray-400 w-8">{config.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-8">最大</span>
                          <input
                            type="number"
                            value={type === 'temperature' ? tempMax : type === 'humidity' ? humidityMax : illuminationMax}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (type === 'temperature') setTempMax(val);
                              else if (type === 'humidity') setHumidityMax(val);
                              else setIlluminationMax(val);
                            }}
                            className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-400"
                          />
                          <span className="text-xs text-gray-400 w-8">{config.unit}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveThreshold(type)}
                            className="flex-1 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-xs transition-colors"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingThreshold(null)}
                            className="flex-1 py-1 bg-white/10 hover:bg-white/20 text-gray-400 rounded text-xs transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">
                        {threshold.min} - {threshold.max} {config.unit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {devices.map((device) => {
                const config = deviceTypeMap[device.type];
                const Icon = config.icon;
                return (
                  <div key={device.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-white">{device.name}</span>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        device.status === 'on' ? 'bg-green-500/20 text-green-400' :
                        device.status === 'off' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      )}>
                        {device.status === 'on' ? '运行中' : device.status === 'off' ? '已关闭' : '故障'}
                      </span>
                    </div>
                    {device.value !== undefined && (
                      <div className="text-xs text-gray-400 mb-2">
                        当前值: {device.value} {device.type === 'ac' ? '°C' : device.type === 'light' ? '%' : ''}
                      </div>
                    )}
                    <button
                      onClick={() => handleToggleDevice(device.id, device.status === 'on' ? 'on' : 'off')}
                      disabled={device.status === 'error'}
                      className={cn(
                        'w-full py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1',
                        device.status === 'error'
                          ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                          : device.status === 'on'
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      )}
                    >
                      <Power className="w-3 h-3" />
                      {device.status === 'on' ? '关闭' : device.status === 'off' ? '开启' : '故障待修'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

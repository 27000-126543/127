import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Thermometer, Droplets, Sun, Activity } from 'lucide-react';
import { useLibraryStore } from '@/store';

const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fps, setFps] = useState(60);
  const [isConnected, setIsConnected] = useState(true);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const { envData } = useLibraryStore();

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    let animationId: number;

    const updateFps = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        const calculatedFps = Math.round((frameCount.current * 1000) / delta);
        setFps(calculatedFps);
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(updateFps);
    };

    animationId = requestAnimationFrame(updateFps);

    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setIsConnected(navigator.onLine);
    }, 5000);

    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(connectionInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const latestEnvData = envData.length > 0 ? envData[envData.length - 1] : null;

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getFpsColor = () => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <footer className="h-8 bg-dark-900/95 backdrop-blur-md border-t border-dark-700/50 flex items-center justify-between px-4 text-xs flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <Wifi size={14} className="text-green-400" />
              <span className="text-green-400">已连接</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-red-400" />
              <span className="text-red-400">已断开</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-dark-400">
          <Activity size={14} />
          <span className={getFpsColor()}>{fps} FPS</span>
        </div>
      </div>

      <div className="text-dark-300 font-mono">
        {formatTime(currentTime)}
      </div>

      <div className="flex items-center gap-4">
        {latestEnvData && (
          <>
            <div className="flex items-center gap-1.5 text-dark-400">
              <Thermometer size={14} className="text-orange-400" />
              <span>{latestEnvData.temperature.toFixed(1)}°C</span>
            </div>

            <div className="flex items-center gap-1.5 text-dark-400">
              <Droplets size={14} className="text-blue-400" />
              <span>{latestEnvData.humidity.toFixed(1)}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-dark-400">
              <Sun size={14} className="text-yellow-400" />
              <span>{latestEnvData.illumination.toFixed(0)} lux</span>
            </div>
          </>
        )}
      </div>
    </footer>
  );
};

export default StatusBar;

import { useState, useMemo } from 'react';
import { X, Armchair, Clock, User, Check, XCircle, MapPin } from 'lucide-react';
import { useLibraryStore } from '@/store';
import Tabs from './Tabs';
import { cn } from '@/lib/utils';
import type { Seat } from '../../../shared/types';

const seatStatusMap = {
  available: { label: '可预约', className: 'bg-green-500', borderClass: 'border-green-500' },
  reserved: { label: '已预约', className: 'bg-yellow-500', borderClass: 'border-yellow-500' },
  occupied: { label: '使用中', className: 'bg-blue-500', borderClass: 'border-blue-500' },
  maintenance: { label: '维护中', className: 'bg-gray-500', borderClass: 'border-gray-500' },
};

export default function SeatReservationPanel() {
  const { seats, currentUser, reserveSeat, checkInSeat, cancelSeatReservation, setActivePanel } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('select');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [reserveDuration, setReserveDuration] = useState(2);

  const areas = useMemo(() => {
    const areaSet = new Set(seats.map(s => s.areaName));
    return ['all', ...Array.from(areaSet)];
  }, [seats]);

  const filteredSeats = useMemo(() => {
    if (selectedArea === 'all') return seats;
    return seats.filter(s => s.areaName === selectedArea);
  }, [seats, selectedArea]);

  const myReservations = useMemo(() => {
    if (!currentUser) return [];
    return seats.filter(s => s.currentUserId === currentUser.id && (s.status === 'reserved' || s.status === 'occupied'));
  }, [seats, currentUser]);

  const seatGrid = useMemo(() => {
    const grid: Record<string, Record<string, Seat>> = {};
    filteredSeats.forEach(seat => {
      if (!grid[seat.areaName]) grid[seat.areaName] = {};
      const key = `${seat.row}-${seat.col}`;
      grid[seat.areaName][key] = seat;
    });
    return grid;
  }, [filteredSeats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available') {
      setSelectedSeat(seat);
    }
  };

  const handleReserve = () => {
    if (currentUser && selectedSeat) {
      reserveSeat(selectedSeat.id, currentUser.id, reserveDuration);
      setSelectedSeat(null);
    }
  };

  const handleCheckIn = (seatId: string) => {
    if (currentUser) {
      checkInSeat(seatId, currentUser.id);
    }
  };

  const handleCancel = (seatId: string) => {
    cancelSeatReservation(seatId);
  };

  const handleClose = () => {
    setActivePanel(null);
  };

  const getMaxRowCol = (areaSeats: Record<string, Seat>) => {
    let maxRow = 0;
    let maxCol = 0;
    Object.values(areaSeats).forEach(seat => {
      maxRow = Math.max(maxRow, seat.row);
      maxCol = Math.max(maxCol, seat.col);
    });
    return { maxRow, maxCol };
  };

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Armchair className="w-5 h-5 text-cyan-400" />
          座位预约
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
          { key: 'select', label: '选择座位' },
          { key: 'my', label: '我的预约' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-4">
        {activeTab === 'select' ? (
          <>
            <div className="mb-4">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                {areas.map(area => (
                  <option key={area} value={area} className="bg-gray-800">
                    {area === 'all' ? '全部区域' : area}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 mb-4 text-xs">
              {Object.entries(seatStatusMap).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={cn('w-3 h-3 rounded', value.className)} />
                  <span className="text-gray-400">{value.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(seatGrid).map(([areaName, areaSeats]) => {
                const { maxRow, maxCol } = getMaxRowCol(areaSeats);
                return (
                  <div key={areaName}>
                    <div className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {areaName}
                    </div>
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${maxCol + 1}, 1fr)` }}>
                      {Array.from({ length: maxRow + 1 }).map((_, row) =>
                        Array.from({ length: maxCol + 1 }).map((_, col) => {
                          const seat = areaSeats[`${row}-${col}`];
                          if (!seat) return <div key={`${row}-${col}`} className="w-8 h-8" />;
                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.status !== 'available'}
                              className={cn(
                                'w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs transition-all',
                                seatStatusMap[seat.status].className,
                                seatStatusMap[seat.status].borderClass,
                                selectedSeat?.id === seat.id && 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900',
                                seat.status === 'available' && 'hover:scale-110 cursor-pointer',
                                seat.status !== 'available' && 'opacity-70 cursor-not-allowed'
                              )}
                              title={`${areaName} 第${row + 1}排 第${col + 1}座`}
                            >
                              {seat.status === 'available' ? col + 1 : (
                                seat.status === 'occupied' ? <User className="w-3 h-3 text-white" /> :
                                seat.status === 'reserved' ? <Clock className="w-3 h-3 text-white" /> :
                                <XCircle className="w-3 h-3 text-white" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSeat && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-white mb-2">
                  已选择: {selectedSeat.areaName} 第{selectedSeat.row + 1}排 第{selectedSeat.col + 1}座
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400">预约时长:</span>
                  <select
                    value={reserveDuration}
                    onChange={(e) => setReserveDuration(Number(e.target.value))}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-400"
                  >
                    <option value={1} className="bg-gray-800">1小时</option>
                    <option value={2} className="bg-gray-800">2小时</option>
                    <option value={3} className="bg-gray-800">3小时</option>
                    <option value={4} className="bg-gray-800">4小时</option>
                  </select>
                </div>
                <button
                  onClick={handleReserve}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  确认预约
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {myReservations.length > 0 ? (
              <div className="space-y-3">
                {myReservations.map((seat) => (
                  <div key={seat.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', seatStatusMap[seat.status].className)} />
                        <span className="text-sm font-medium text-white">
                          {seat.areaName} {seat.row + 1}-{seat.col + 1}
                        </span>
                      </div>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', seatStatusMap[seat.status].className, 'text-white')}>
                        {seatStatusMap[seat.status].label}
                      </span>
                    </div>
                    {seat.reservedUntil && (
                      <div className="text-xs text-gray-400 mb-2">
                        有效期至: {new Date(seat.reservedUntil).toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {seat.status === 'reserved' && (
                        <button
                          onClick={() => handleCheckIn(seat.id)}
                          className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          签到
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(seat.id)}
                        className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        取消
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                <Armchair className="w-12 h-12 mx-auto mb-2 opacity-30" />
                暂无预约记录
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

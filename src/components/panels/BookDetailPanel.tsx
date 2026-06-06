import { useState } from 'react';
import { X, BookOpen, User, Hash, Building2, MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useLibraryStore } from '@/store';
import Tabs from './Tabs';
import { cn } from '@/lib/utils';
import type { BorrowHistory, Reservation } from '../../../shared/types';

const statusMap = {
  available: { label: '可借阅', className: 'bg-green-500/20 text-green-400' },
  borrowed: { label: '已借出', className: 'bg-orange-500/20 text-orange-400' },
  reserved: { label: '已预约', className: 'bg-blue-500/20 text-blue-400' },
  misshelved: { label: '错架', className: 'bg-red-500/20 text-red-400' },
};

const borrowStatusMap = {
  active: { label: '借阅中', className: 'bg-blue-500/20 text-blue-400' },
  returned: { label: '已归还', className: 'bg-green-500/20 text-green-400' },
  overdue: { label: '已逾期', className: 'bg-red-500/20 text-red-400' },
};

const reserveStatusMap = {
  pending: { label: '待取书', className: 'bg-yellow-500/20 text-yellow-400' },
  fulfilled: { label: '已完成', className: 'bg-green-500/20 text-green-400' },
  expired: { label: '已过期', className: 'bg-gray-500/20 text-gray-400' },
  cancelled: { label: '已取消', className: 'bg-red-500/20 text-red-400' },
};

export default function BookDetailPanel() {
  const { selectedBook, selectBook, borrowHistory, reservations, currentUser, borrowBook, reserveBook } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('history');

  if (!selectedBook) return null;

  const bookHistory = borrowHistory.filter((h) => h.bookId === selectedBook.id);
  const bookReservations = reservations.filter((r) => r.bookId === selectedBook.id);

  const handleBorrow = () => {
    if (currentUser && selectedBook.status === 'available') {
      borrowBook(selectedBook.id, currentUser.id);
    }
  };

  const handleReserve = () => {
    if (currentUser && selectedBook.status === 'borrowed') {
      reserveBook(selectedBook.id, currentUser.id);
    }
  };

  const handleClose = () => {
    selectBook(null);
  };

  return (
    <div className="w-[300px] bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="relative h-32" style={{ backgroundColor: selectedBook.coverColor }}>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusMap[selectedBook.status].className)}>
              {statusMap[selectedBook.status].label}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white truncate">{selectedBook.title}</h2>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">作者</span>
            <span className="text-white ml-auto">{selectedBook.author}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">ISBN</span>
            <span className="text-white ml-auto font-mono text-xs">{selectedBook.isbn}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">出版社</span>
            <span className="text-white ml-auto text-right">{selectedBook.publisher}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">架层位置</span>
            <span className="text-white ml-auto">
              {selectedBook.location.shelfId.replace('shelf-', '')}区 第{selectedBook.location.shelfLevel + 1}层 第{selectedBook.location.position + 1}位
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">分类</span>
            <span className="text-white ml-auto">{selectedBook.category}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400">出版日期</span>
            <span className="text-white ml-auto">{selectedBook.publishDate}</span>
          </div>
          {selectedBook.dueDate && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className="text-gray-400">应还日期</span>
              <span className="text-orange-400 ml-auto">{selectedBook.dueDate}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {selectedBook.status === 'available' && (
            <button
              onClick={handleBorrow}
              className="flex-1 py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              借阅图书
            </button>
          )}
          {selectedBook.status === 'borrowed' && (
            <button
              onClick={handleReserve}
              className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              预约图书
            </button>
          )}
          {selectedBook.status === 'misshelved' && (
            <div className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              错架待处理
            </div>
          )}
        </div>

        <Tabs
          tabs={[
            { key: 'history', label: '借阅历史' },
            { key: 'reservations', label: '预约记录' },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-3 max-h-48 overflow-y-auto">
          {activeTab === 'history' ? (
            bookHistory.length > 0 ? (
              <div className="space-y-2">
                {bookHistory.map((item: BorrowHistory) => (
                  <div key={item.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{item.userName}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs', borrowStatusMap[item.status].className)}>
                        {borrowStatusMap[item.status].label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      借阅: {item.borrowDate}
                      {item.returnDate && ` / 归还: ${item.returnDate}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                暂无借阅历史
              </div>
            )
          ) : (
            bookReservations.length > 0 ? (
              <div className="space-y-2">
                {bookReservations.map((item: Reservation) => (
                  <div key={item.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{item.userName}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs', reserveStatusMap[item.status].className)}>
                        {reserveStatusMap[item.status].label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      预约: {item.reserveDate} / 到期: {item.expireDate}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                暂无预约记录
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

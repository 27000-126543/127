import { create } from 'zustand';
import type {
  User,
  Book,
  BorrowHistory,
  Reservation,
  Seat,
  EnvironmentData,
  Device,
  InventoryRobot,
  MisshelvedBook,
  Shelf,
  HotBookPrediction,
  DailyReport,
  EmergencyEvent,
  LogEntry,
  Notification,
  EnvironmentThresholds,
  Position3D,
  BookStatus,
  SeatStatus,
} from '../../shared/types';
import { getMockData, initializeMockData, generateDailyReport } from '../services/mockData';

interface SortingBook {
  book: Book;
  path: Position3D[];
  progress: number;
  targetShelfId: string;
}

interface LibraryState {
  currentUser: User | null;
  users: User[];
  books: Book[];
  shelves: Shelf[];
  borrowHistory: BorrowHistory[];
  reservations: Reservation[];
  seats: Seat[];
  envData: EnvironmentData[];
  devices: Device[];
  robots: InventoryRobot[];
  misshelvedBooks: MisshelvedBook[];
  hotPredictions: HotBookPrediction[];
  logs: LogEntry[];
  notifications: Notification[];
  thresholds: EnvironmentThresholds;
  emergencyEvent: EmergencyEvent | null;
  sortingBooks: SortingBook[];
  selectedBook: Book | null;
  selectedSeat: Seat | null;
  activePanel: string | null;
  lightIntensity: number;
  isInitialized: boolean;

  init: () => void;
  login: (role: 'reader' | 'librarian' | 'director') => Promise<User>;
  logout: () => void;
  selectBook: (book: Book | null) => void;
  selectSeat: (seat: Seat | null) => void;
  setActivePanel: (panel: string | null) => void;
  borrowBook: (bookId: string, userId: string) => void;
  returnBook: (bookId: string) => void;
  reserveBook: (bookId: string, userId: string) => void;
  reserveSeat: (seatId: string, userId: string, duration: number) => void;
  checkInSeat: (seatId: string, userId: string) => void;
  cancelSeatReservation: (seatId: string) => void;
  startSorting: (book: Book, targetShelfId: string) => void;
  updateSortingProgress: () => void;
  updateRobotPosition: (robotId: string, position: Position3D, progress: number) => void;
  addMisshelvedBook: (misshelved: MisshelvedBook) => void;
  resolveMisshelved: (id: string) => void;
  updateEnvironmentData: (data: EnvironmentData) => void;
  setDeviceStatus: (deviceId: string, status: 'on' | 'off', value?: number) => void;
  setThresholds: (type: 'temperature' | 'humidity' | 'illumination', min: number, max: number) => void;
  startEmergency: (type: 'fire' | 'earthquake' | 'security') => void;
  stopEmergency: () => void;
  getDailyReport: (date: string) => DailyReport;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  setLightIntensity: (intensity: number) => void;
  checkSeatTimeouts: () => void;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  currentUser: null,
  users: [],
  books: [],
  shelves: [],
  borrowHistory: [],
  reservations: [],
  seats: [],
  envData: [],
  devices: [],
  robots: [],
  misshelvedBooks: [],
  hotPredictions: [],
  logs: [],
  notifications: [],
  thresholds: {
    temperature: { min: 20, max: 26 },
    humidity: { min: 40, max: 60 },
    illumination: { min: 200, max: 500 },
  },
  emergencyEvent: null,
  sortingBooks: [],
  selectedBook: null,
  selectedSeat: null,
  activePanel: null,
  lightIntensity: 1.0,
  isInitialized: false,

  init: () => {
    if (get().isInitialized) return;

    initializeMockData();
    const mockData = getMockData();

    set({
      users: mockData.users,
      books: mockData.books,
      shelves: mockData.shelves,
      borrowHistory: mockData.borrowHistory,
      reservations: mockData.reservations,
      seats: mockData.seats,
      envData: mockData.envData,
      devices: mockData.devices,
      robots: mockData.robots,
      misshelvedBooks: mockData.misshelvedBooks,
      hotPredictions: mockData.hotPredictions,
      logs: mockData.logs,
      thresholds: mockData.thresholds,
      isInitialized: true,
    });

    setInterval(() => {
      get().updateSortingProgress();
    }, 100);

    setInterval(() => {
      get().checkSeatTimeouts();
    }, 60000);
  },

  login: async (role) => {
    const users = get().users;
    const user = users.find(u => u.role === role);
    if (user) {
      set({ currentUser: user });
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: '登录系统',
        details: `${user.name}以${role === 'reader' ? '读者' : role === 'librarian' ? '馆员' : '馆长'}身份登录`,
        level: 'info',
      });
      return user;
    }
    throw new Error('用户不存在');
  },

  logout: () => {
    const user = get().currentUser;
    if (user) {
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: '退出系统',
        details: `${user.name}退出系统`,
        level: 'info',
      });
    }
    set({ currentUser: null, selectedBook: null, selectedSeat: null, activePanel: null });
  },

  selectBook: (book) => set({ selectedBook: book }),
  selectSeat: (seat) => set({ selectedSeat: seat }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  borrowBook: (bookId, userId) => {
    const users = get().users;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const books = get().books;
    const book = books.find(b => b.id === bookId);
    if (!book || book.status !== 'available') return;

    const newBook: Book = {
      ...book,
      status: 'borrowed',
      borrowerId: userId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    const newHistory: BorrowHistory = {
      id: generateId(),
      bookId,
      userId,
      userName: user.name,
      borrowDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    set({
      books: books.map(b => b.id === bookId ? newBook : b),
      borrowHistory: [...get().borrowHistory, newHistory],
    });

    get().addNotification({
      title: '借阅成功',
      message: `您已成功借阅《${book.title}》`,
      type: 'success',
    });

    get().addLog({
      userId,
      userName: user.name,
      action: '借阅图书',
      details: `借阅《${book.title}》`,
      level: 'info',
    });
  },

  returnBook: (bookId) => {
    const books = get().books;
    const book = books.find(b => b.id === bookId);
    if (!book || book.status !== 'borrowed') return;

    const targetShelf = get().shelves.find(s => s.id === book.location.shelfId);

    const newBook: Book = {
      ...book,
      status: 'available',
      borrowerId: undefined,
      dueDate: undefined,
    };

    const history = get().borrowHistory;
    const activeHistory = history.find(h => h.bookId === bookId && h.status === 'active');
    let updatedHistory = history;
    if (activeHistory) {
      updatedHistory = history.map(h =>
        h.id === activeHistory.id
          ? { ...h, returnDate: new Date().toISOString().split('T')[0], status: 'returned' as const }
          : h
      );
    }

    set({
      books: books.map(b => b.id === bookId ? newBook : b),
      borrowHistory: updatedHistory,
    });

    if (targetShelf) {
      get().startSorting(newBook, targetShelf.id);
    }

    get().addNotification({
      title: '归还成功',
      message: `《${book.title}》已归还，正在分拣中`,
      type: 'info',
    });

    const user = get().currentUser;
    if (user) {
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: '归还图书',
        details: `归还《${book.title}》`,
        level: 'info',
      });
    }
  },

  reserveBook: (bookId, userId) => {
    const users = get().users;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const books = get().books;
    const book = books.find(b => b.id === bookId);
    if (!book || book.status === 'available') return;

    const newReservation: Reservation = {
      id: generateId(),
      bookId,
      userId,
      userName: user.name,
      reserveDate: new Date().toISOString().split('T')[0],
      expireDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
    };

    const newBook: Book = {
      ...book,
      status: 'reserved',
    };

    set({
      books: books.map(b => b.id === bookId ? newBook : b),
      reservations: [...get().reservations, newReservation],
    });

    get().addNotification({
      title: '预约成功',
      message: `您已成功预约《${book.title}》`,
      type: 'success',
    });

    get().addLog({
      userId,
      userName: user.name,
      action: '预约图书',
      details: `预约《${book.title}》`,
      level: 'info',
    });
  },

  reserveSeat: (seatId, userId, duration) => {
    const seats = get().seats;
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status !== 'available') return;

    const users = get().users;
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newSeat: Seat = {
      ...seat,
      status: 'reserved',
      currentUserId: userId,
      currentUserName: user.name,
      reservedUntil: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
      checkInDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    set({
      seats: seats.map(s => s.id === seatId ? newSeat : s),
    });

    get().addNotification({
      title: '座位预约成功',
      message: `您已预约${seat.areaName}第${seat.row + 1}排第${seat.col + 1}座，请在15分钟内签到`,
      type: 'success',
    });

    get().addLog({
      userId,
      userName: user.name,
      action: '预约座位',
      details: `预约${seat.areaName}座位${seat.row + 1}-${seat.col + 1}`,
      level: 'info',
    });
  },

  checkInSeat: (seatId, userId) => {
    const seats = get().seats;
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status !== 'reserved' || seat.currentUserId !== userId) return;

    const newSeat: Seat = {
      ...seat,
      status: 'occupied',
      checkInDeadline: undefined,
    };

    set({
      seats: seats.map(s => s.id === seatId ? newSeat : s),
    });

    get().addNotification({
      title: '签到成功',
      message: `您已成功签到，请入座`,
      type: 'success',
    });
  },

  cancelSeatReservation: (seatId) => {
    const seats = get().seats;
    const seat = seats.find(s => s.id === seatId);
    if (!seat || (seat.status !== 'reserved' && seat.status !== 'occupied')) return;

    const newSeat: Seat = {
      ...seat,
      status: 'available',
      currentUserId: undefined,
      currentUserName: undefined,
      reservedUntil: undefined,
      checkInDeadline: undefined,
    };

    set({
      seats: seats.map(s => s.id === seatId ? newSeat : s),
    });

    const user = get().currentUser;
    if (user) {
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: '取消座位预约',
        details: `取消${seat.areaName}座位${seat.row + 1}-${seat.col + 1}`,
        level: 'info',
      });
    }
  },

  startSorting: (book, targetShelfId) => {
    const targetShelf = get().shelves.find(s => s.id === targetShelfId);
    if (!targetShelf) return;

    const startPos = { x: 0, y: 1, z: -9 };
    const midPos = { x: targetShelf.position.x, y: 1, z: targetShelf.position.z };
    const endPos = {
      x: targetShelf.position.x - 0.8,
      y: 0.5 + book.location.shelfLevel * 0.4,
      z: targetShelf.position.z + (book.location.position - 8) * 0.08,
    };

    const path: Position3D[] = [];
    for (let t = 0; t <= 1; t += 0.05) {
      path.push({
        x: startPos.x + (midPos.x - startPos.x) * Math.min(t * 2, 1),
        y: 1 + Math.sin(Math.min(t * 2, 1) * Math.PI) * 0.5,
        z: startPos.z + (midPos.z - startPos.z) * Math.min(t * 2, 1),
      });
    }
    for (let t = 0; t <= 1; t += 0.05) {
      path.push({
        x: midPos.x + (endPos.x - midPos.x) * t,
        y: midPos.y + (endPos.y - midPos.y) * t,
        z: midPos.z + (endPos.z - midPos.z) * t,
      });
    }

    const sortingBook: SortingBook = {
      book,
      path,
      progress: 0,
      targetShelfId,
    };

    set({
      sortingBooks: [...get().sortingBooks, sortingBook],
    });
  },

  updateSortingProgress: () => {
    const sortingBooks = get().sortingBooks;
    if (sortingBooks.length === 0) return;

    const updated = sortingBooks.map(sb => ({
      ...sb,
      progress: Math.min(sb.progress + 0.01, 1),
    }));

    const completed = updated.filter(sb => sb.progress >= 1);
    const ongoing = updated.filter(sb => sb.progress < 1);

    completed.forEach(sb => {
      const shelves = get().shelves;
      const shelf = shelves.find(s => s.id === sb.targetShelfId);
      if (shelf) {
        const newShelf = { ...shelf, currentCount: shelf.currentCount + 1 };
        set({
          shelves: shelves.map(s => s.id === sb.targetShelfId ? newShelf : s),
        });
      }
    });

    set({ sortingBooks: ongoing });
  },

  updateRobotPosition: (robotId, position, progress) => {
    const robots = get().robots;
    const robot = robots.find(r => r.id === robotId);
    if (!robot) return;

    const newRobot: InventoryRobot = {
      ...robot,
      position,
      progress,
    };

    set({
      robots: robots.map(r => r.id === robotId ? newRobot : r),
    });
  },

  addMisshelvedBook: (misshelved) => {
    set({
      misshelvedBooks: [...get().misshelvedBooks, misshelved],
    });

    get().addNotification({
      title: '发现错架图书',
      message: `《${misshelved.bookTitle}》放置位置错误，请处理`,
      type: 'warning',
    });
  },

  resolveMisshelved: (id) => {
    const misshelvedBooks = get().misshelvedBooks;
    const item = misshelvedBooks.find(m => m.id === id);
    if (!item) return;

    const newStatus = item.status === 'pending' ? 'processing' as const : 'resolved' as const;
    const updated = misshelvedBooks.map(m =>
      m.id === id ? { ...m, status: newStatus } : m
    );
    set({ misshelvedBooks: updated });

    if (newStatus === 'resolved') {
      get().addNotification({
        title: '错架图书已处理',
        message: `《${item.bookTitle}》已放回正确位置`,
        type: 'success',
      });
    }

    const user = get().currentUser;
    if (user) {
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: newStatus === 'processing' ? '开始处理错架图书' : '完成错架图书处理',
        details: `${newStatus === 'processing' ? '开始处理' : '完成'}错架工单${id}`,
        level: 'info',
      });
    }
  },

  updateEnvironmentData: (data) => {
    const thresholds = get().thresholds;
    const notifications = get().notifications;

    if (data.temperature < thresholds.temperature.min || data.temperature > thresholds.temperature.max) {
      if (!notifications.some(n => n.message.includes('温度') && !n.read)) {
        get().addNotification({
          title: '温度告警',
          message: `当前温度${data.temperature.toFixed(1)}°C，超出阈值范围`,
          type: 'warning',
        });
      }
      get().setLightIntensity(0.3);
    }

    if (data.humidity < thresholds.humidity.min || data.humidity > thresholds.humidity.max) {
      if (!notifications.some(n => n.message.includes('湿度') && !n.read)) {
        get().addNotification({
          title: '湿度告警',
          message: `当前湿度${data.humidity.toFixed(1)}%，超出阈值范围`,
          type: 'warning',
        });
      }
    }

    if (data.illumination < thresholds.illumination.min || data.illumination > thresholds.illumination.max) {
      if (!notifications.some(n => n.message.includes('光照') && !n.read)) {
        get().addNotification({
          title: '光照告警',
          message: `当前光照${data.illumination.toFixed(0)}lux，超出阈值范围`,
          type: 'warning',
        });
      }
      const lights = get().devices.filter(d => d.type === 'light');
      lights.forEach(light => {
        get().setDeviceStatus(light.id, 'on', data.illumination > thresholds.illumination.max ? 30 : 100);
      });
    }

    set({
      envData: [...get().envData.slice(-99), data],
    });
  },

  setDeviceStatus: (deviceId, status, value) => {
    const devices = get().devices;
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newDevice: Device = {
      ...device,
      status,
      value: value !== undefined ? value : device.value,
    };

    set({
      devices: devices.map(d => d.id === deviceId ? newDevice : d),
    });
  },

  setThresholds: (type, min, max) => {
    const thresholds = get().thresholds;
    set({
      thresholds: {
        ...thresholds,
        [type]: { min, max },
      },
    });

    const user = get().currentUser;
    if (user) {
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: '调整阈值',
        details: `调整${type === 'temperature' ? '温度' : type === 'humidity' ? '湿度' : '光照'}阈值为${min}-${max}`,
        level: 'info',
      });
    }
  },

  startEmergency: (type) => {
    const escapeRoutes = [
      {
        points: [
          { x: 0, y: 0.1, z: 0 },
          { x: 5, y: 0.1, z: 0 },
          { x: 10, y: 0.1, z: -5 },
          { x: 14, y: 0.1, z: -12 },
        ],
      },
      {
        points: [
          { x: 0, y: 0.1, z: 0 },
          { x: -5, y: 0.1, z: 0 },
          { x: -10, y: 0.1, z: -5 },
          { x: -14, y: 0.1, z: -12 },
        ],
      },
    ];

    const rescueRoutes = [
      {
        points: [
          { x: 14, y: 0.1, z: -12 },
          { x: 10, y: 0.1, z: -5 },
          { x: 0, y: 0.1, z: 0 },
          { x: -6, y: 0.1, z: 4 },
        ],
      },
    ];

    const event: EmergencyEvent = {
      id: generateId(),
      type,
      startTime: new Date().toISOString(),
      status: 'active',
      escapeRoutes,
      rescueRoutes,
    };

    set({ emergencyEvent: event });

    get().addNotification({
      title: '紧急疏散启动',
      message: type === 'fire' ? '发生火灾，请立即疏散！' : type === 'earthquake' ? '发生地震，请立即疏散！' : '安全事件，请立即疏散！',
      type: 'error',
    });

    const user = get().currentUser;
    if (user) {
      get().addLog({
        userId: user.id,
        userName: user.name,
        action: '启动应急疏散',
        details: `启动${type === 'fire' ? '火灾' : type === 'earthquake' ? '地震' : '安全'}应急疏散`,
        level: 'error',
      });
    }
  },

  stopEmergency: () => {
    const event = get().emergencyEvent;
    if (event) {
      set({
        emergencyEvent: { ...event, status: 'resolved' as const },
      });

      const user = get().currentUser;
      if (user) {
        get().addLog({
          userId: user.id,
          userName: user.name,
          action: '解除应急疏散',
          details: '应急疏散状态已解除',
          level: 'info',
        });
      }

      setTimeout(() => {
        set({ emergencyEvent: null });
      }, 2000);
    }
  },

  getDailyReport: (date) => {
    return generateDailyReport(date, get().books, get().seats);
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    set({
      notifications: [newNotification, ...get().notifications].slice(0, 50),
    });
  },

  markNotificationRead: (id) => {
    set({
      notifications: get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    });
  },

  setLightIntensity: (intensity) => {
    set({ lightIntensity: intensity });
  },

  checkSeatTimeouts: () => {
    const seats = get().seats;
    const now = Date.now();
    let hasTimeouts = false;

    const updatedSeats = seats.map(seat => {
      if (seat.status === 'reserved' && seat.checkInDeadline) {
        const deadline = new Date(seat.checkInDeadline).getTime();
        if (now > deadline) {
          hasTimeouts = true;
          if (seat.currentUserId) {
            get().addNotification({
              title: '座位预约超时',
              message: `您预约的${seat.areaName}座位${seat.row + 1}-${seat.col + 1}已超时释放`,
              type: 'warning',
            });
          }
          return {
            ...seat,
            status: 'available' as SeatStatus,
            currentUserId: undefined,
            currentUserName: undefined,
            reservedUntil: undefined,
            checkInDeadline: undefined,
          };
        }
      }
      if (seat.status === 'occupied' && seat.reservedUntil) {
        const until = new Date(seat.reservedUntil).getTime();
        if (now > until) {
          return {
            ...seat,
            status: 'available' as SeatStatus,
            currentUserId: undefined,
            currentUserName: undefined,
            reservedUntil: undefined,
            checkInDeadline: undefined,
          };
        }
      }
      return seat;
    });

    if (hasTimeouts) {
      set({ seats: updatedSeats });
    }
  },

  addLog: (log) => {
    const newLog: LogEntry = {
      ...log,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    set({
      logs: [newLog, ...get().logs].slice(0, 100),
    });
  },
}));

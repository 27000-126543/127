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
  Area,
  HotBookPrediction,
  DailyReport,
  LogEntry,
  EnvironmentThresholds,
  Position3D,
} from '../../shared/types';

const bookTitles = [
  '三体', '百年孤独', '红楼梦', '三国演义', '水浒传',
  '西游记', '活着', '围城', '平凡的世界', '白鹿原',
  '人类简史', '未来简史', '今日简史', '思考，快与慢', '原则',
  '穷查理宝典', '影响力', '刻意练习', '深度工作', '原子习惯',
  '代码整洁之道', '设计模式', '重构', '算法导论', '深入理解计算机系统',
  'JavaScript高级程序设计', '你不知道的JavaScript', 'TypeScript实战', 'React设计模式', 'Vue.js设计与实现',
  'Python编程从入门到实践', '机器学习实战', '深度学习', '统计学习方法', '数据结构与算法分析',
  '经济学原理', '国富论', '资本论', '就业、利息和货币通论', '卓有成效的管理者',
  '从0到1', '创新者的窘境', '硅谷钢铁侠', '史蒂夫·乔布斯传', '腾讯传',
  '失控', '科技想要什么', '必然', '黑客与画家', '浪潮之巅',
];

const authors = [
  '刘慈欣', '加西亚·马尔克斯', '曹雪芹', '罗贯中', '施耐庵',
  '吴承恩', '余华', '钱钟书', '路遥', '陈忠实',
  '尤瓦尔·赫拉利', '丹尼尔·卡尼曼', '瑞·达利欧', '查理·芒格', '罗伯特·西奥迪尼',
  '安德斯·艾利克森', '卡尔·纽波特', '詹姆斯·克利尔', '罗伯特·C·马丁', 'GoF',
  'Martin Fowler', 'Thomas H. Cormen', 'Randal E. Bryant', 'Nicholas C. Zakas', 'Kyle Simpson',
  '阮一峰', '张鑫旭', '丹·阿布罗莫夫', '尤雨溪', 'Eric Matthes',
  'Peter Harrington', 'Ian Goodfellow', '李航', 'Mark Allen Weiss', '曼昆',
  '亚当·斯密', '卡尔·马克思', '凯恩斯', '彼得·德鲁克', '彼得·蒂尔',
  '克莱顿·克里斯坦森', '沃尔特·艾萨克森', '吴晓波', '凯文·凯利', 'Paul Graham',
  '吴军',
];

const publishers = [
  '人民文学出版社', '商务印书馆', '中华书局', '上海译文出版社', '译林出版社',
  '中信出版社', '机械工业出版社', '电子工业出版社', '人民邮电出版社', '清华大学出版社',
  '北京大学出版社', '浙江大学出版社', '南京大学出版社', '武汉大学出版社', '三联书店',
];

const categories = [
  '文学小说', '历史人文', '哲学思想', '经济管理', '科技科普',
  '计算机科学', '人工智能', '前端开发', '后端开发', '数据科学',
];

const coverColors = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#34495e', '#7f8c8d', '#c0392b',
  '#d35400', '#f39c12', '#27ae60', '#16a085', '#2980b9',
  '#8e44ad', '#2c3e50', '#95a5a6',
];

const readerNames = [
  '张三', '李四', '王五', '赵六', '钱七',
  '孙八', '周九', '吴十', '郑十一', '王十二',
  '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七',
  '沈十八', '韩十九', '杨二十', '朱二十一', '秦二十二',
  '尤二十三', '许二十四', '何二十五', '吕二十六', '施二十七',
  '张二十八', '孔二十九', '曹三十', '严三十一', '华三十二',
  '金三十三', '魏三十四', '陶三十五', '姜三十六', '戚三十七',
  '谢三十八', '邹三十九', '喻四十', '柏四十一', '水四十二',
  '窦四十三', '章四十四', '云四十五', '苏四十六', '潘四十七',
  '葛四十八', '奚四十九', '范五十',
];

const librarianNames = ['李馆员', '王馆员', '张馆员', '刘馆员', '陈馆员'];

const shelfNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

const readingAreaNames = ['阅览一区', '阅览二区', '阅览三区', '阅览四区', '阅览五区'];

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateUsers(): User[] {
  const users: User[] = [];

  readerNames.forEach((name, i) => {
    users.push({
      id: `reader-${i + 1}`,
      name,
      role: 'reader',
      faceId: `face-reader-${i + 1}`,
      lastLogin: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    });
  });

  librarianNames.forEach((name, i) => {
    users.push({
      id: `librarian-${i + 1}`,
      name,
      role: 'librarian',
      faceId: `face-librarian-${i + 1}`,
      lastLogin: randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date()),
    });
  });

  users.push({
    id: 'director-1',
    name: '王馆长',
    role: 'director',
    faceId: 'face-director-1',
    lastLogin: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
  });

  return users;
}

export function generateAreas(): Area[] {
  return [
    { id: 'area-books-1', name: '书架主区', type: 'bookshelf' },
    { id: 'area-reading-1', name: '阅览主区', type: 'reading' },
    { id: 'area-kiosk-1', name: '自助服务区', type: 'kiosk' },
    { id: 'area-conveyor-1', name: '分拣区', type: 'conveyor' },
    { id: 'area-monitor-1', name: '监控中心', type: 'monitor' },
  ];
}

export function generateShelves(): Shelf[] {
  const shelves: Shelf[] = [];
  const positions = [
    { pos: { x: -8, y: 0, z: -5 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -8, y: 0, z: -1 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -8, y: 0, z: 3 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -8, y: 0, z: 7 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -4, y: 0, z: -5 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -4, y: 0, z: -1 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -4, y: 0, z: 3 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: -4, y: 0, z: 7 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 0, y: 0, z: -5 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 0, y: 0, z: -1 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 0, y: 0, z: 3 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 0, y: 0, z: 7 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 4, y: 0, z: -5 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 4, y: 0, z: -1 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 4, y: 0, z: 3 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 4, y: 0, z: 7 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 8, y: 0, z: -5 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 8, y: 0, z: -1 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 8, y: 0, z: 3 }, rot: { x: 0, y: 0, z: 0 } },
    { pos: { x: 8, y: 0, z: 7 }, rot: { x: 0, y: 0, z: 0 } },
  ];

  for (let i = 0; i < 20; i++) {
    const capacity = 100;
    const currentCount = randomInt(70, 95);
    shelves.push({
      id: `shelf-${shelfNames[i]}`,
      name: `${shelfNames[i]}区书架`,
      areaId: 'area-books-1',
      areaName: '书架主区',
      levels: 5,
      capacity,
      currentCount,
      position: positions[i].pos,
      rotation: positions[i].rot,
    });
  }

  return shelves;
}

export function generateBooks(shelves: Shelf[]): Book[] {
  const books: Book[] = [];
  let bookIndex = 0;

  for (const shelf of shelves) {
    const booksPerLevel = Math.ceil(shelf.currentCount / shelf.levels);
    for (let level = 0; level < shelf.levels; level++) {
      for (let pos = 0; pos < booksPerLevel && bookIndex < 500; pos++) {
        const title = bookTitles[bookIndex % bookTitles.length];
        const author = authors[bookIndex % authors.length];
        const category = categories[bookIndex % categories.length];
        const status = Math.random() > 0.3 ? 'available' : (Math.random() > 0.5 ? 'borrowed' : 'reserved');

        books.push({
          id: `book-${String(bookIndex + 1).padStart(4, '0')}`,
          isbn: `978-${randomInt(100, 999)}-${randomInt(1000, 9999)}-${randomInt(10, 99)}`,
          title,
          author,
          publisher: randomChoice(publishers),
          publishDate: randomDate(new Date('2000-01-01'), new Date()).split('T')[0],
          category,
          location: {
            shelfId: shelf.id,
            shelfLevel: level,
            position: pos,
          },
          status,
          coverColor: randomChoice(coverColors),
          dueDate: status === 'borrowed'
            ? randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).split('T')[0]
            : undefined,
        });
        bookIndex++;
      }
    }
  }

  return books;
}

export function generateBorrowHistory(books: Book[], users: User[]): BorrowHistory[] {
  const history: BorrowHistory[] = [];
  const readers = users.filter(u => u.role === 'reader');

  for (let i = 0; i < 200; i++) {
    const book = randomChoice(books);
    const user = randomChoice(readers);
    const borrowDate = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
    const isReturned = Math.random() > 0.3;

    history.push({
      id: `history-${i + 1}`,
      bookId: book.id,
      userId: user.id,
      userName: user.name,
      borrowDate: borrowDate.split('T')[0],
      returnDate: isReturned
        ? new Date(new Date(borrowDate).getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : undefined,
      status: isReturned ? 'returned' : (new Date(borrowDate).getTime() + 30 * 24 * 60 * 60 * 1000 < Date.now() ? 'overdue' : 'active'),
    });
  }

  return history;
}

export function generateReservations(books: Book[], users: User[]): Reservation[] {
  const reservations: Reservation[] = [];
  const readers = users.filter(u => u.role === 'reader');
  const borrowedBooks = books.filter(b => b.status === 'borrowed');

  for (let i = 0; i < 30; i++) {
    const book = randomChoice(borrowedBooks);
    const user = randomChoice(readers);
    const reserveDate = randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date());
    const status = Math.random() > 0.5 ? 'pending' : (Math.random() > 0.5 ? 'fulfilled' : 'expired');

    reservations.push({
      id: `reservation-${i + 1}`,
      bookId: book.id,
      userId: user.id,
      userName: user.name,
      reserveDate: reserveDate.split('T')[0],
      expireDate: new Date(new Date(reserveDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
    });
  }

  return reservations;
}

export function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  const areaPositions = [
    { areaId: 'area-reading-1', x: -12, z: 2 },
    { areaId: 'area-reading-1', x: -10, z: 2 },
    { areaId: 'area-reading-2', x: -12, z: 6 },
    { areaId: 'area-reading-2', x: -10, z: 6 },
    { areaId: 'area-reading-3', x: 10, z: 2 },
    { areaId: 'area-reading-3', x: 12, z: 2 },
    { areaId: 'area-reading-4', x: 10, z: 6 },
    { areaId: 'area-reading-4', x: 12, z: 6 },
    { areaId: 'area-reading-5', x: -12, z: 10 },
    { areaId: 'area-reading-5', x: -10, z: 10 },
  ];

  let seatId = 1;
  for (let areaIdx = 0; areaIdx < 5; areaIdx++) {
    const areaName = readingAreaNames[areaIdx];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const areaPos = areaPositions[areaIdx * 2 + (row % 2)];
        const status = Math.random() > 0.4 ? 'available' : (Math.random() > 0.5 ? 'occupied' : 'reserved');
        seats.push({
          id: `seat-${String(seatId).padStart(3, '0')}`,
          areaId: `area-reading-${areaIdx + 1}`,
          areaName,
          row,
          col,
          position: {
            x: areaPos.x + col * 1.5,
            y: 0.5,
            z: areaPos.z + Math.floor(row / 2) * 2,
          },
          status,
        });
        seatId++;
      }
    }
  }

  return seats;
}

export function generateEnvironmentData(): EnvironmentData[] {
  const data: EnvironmentData[] = [];
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    data.push({
      timestamp: new Date(now - i * 60 * 1000).toISOString(),
      temperature: 22 + Math.sin(i / 10) * 3 + (Math.random() - 0.5) * 2,
      humidity: 45 + Math.sin(i / 15) * 10 + (Math.random() - 0.5) * 5,
      illumination: 300 + Math.sin(i / 8) * 150 + (Math.random() - 0.5) * 50,
      pm25: 15 + Math.random() * 20,
      areaId: 'area-books-1',
    });
  }

  return data.reverse();
}

export function generateDevices(): Device[] {
  const devices: Device[] = [];

  for (let i = 0; i < 10; i++) {
    devices.push({
      id: `ac-${i + 1}`,
      type: 'ac',
      name: `空调-${i + 1}`,
      status: 'on',
      value: 24,
      areaId: i < 5 ? 'area-books-1' : 'area-reading-1',
      position: { x: -12 + i * 3, y: 5, z: -8 },
    });
  }

  for (let i = 0; i < 20; i++) {
    devices.push({
      id: `light-${i + 1}`,
      type: 'light',
      name: `顶灯-${String(i + 1).padStart(2, '0')}`,
      status: 'on',
      value: 80,
      areaId: 'area-books-1',
      position: { x: -10 + (i % 10) * 2.2, y: 4.5, z: -6 + Math.floor(i / 10) * 12 },
    });
  }

  const kioskPositions = [
    { x: 6, z: -6 },
    { x: 8, z: -6 },
    { x: 6, z: -4 },
    { x: 8, z: -4 },
  ];

  for (let i = 0; i < 4; i++) {
    devices.push({
      id: `kiosk-${i + 1}`,
      type: 'kiosk',
      name: `自助借还机-${i + 1}`,
      status: 'on',
      areaId: 'area-kiosk-1',
      position: { x: kioskPositions[i].x, y: 0, z: kioskPositions[i].z },
    });
  }

  devices.push({
    id: 'conveyor-1',
    type: 'conveyor',
    name: '图书分拣线',
    status: 'on',
    areaId: 'area-conveyor-1',
    position: { x: 0, y: 0, z: -10 },
  });

  return devices;
}

export function generateRobots(shelves: Shelf[]): InventoryRobot[] {
  const robotPath: Position3D[] = [];
  for (let i = 0; i < shelves.length; i++) {
    const shelf = shelves[i];
    robotPath.push({
      x: shelf.position.x + 1.5,
      y: 0.3,
      z: shelf.position.z,
    });
  }

  return [
    {
      id: 'robot-1',
      name: '盘点机器人-01',
      status: 'scanning',
      battery: 85,
      position: { x: -7, y: 0.3, z: 0 },
      currentPath: robotPath,
      progress: 35,
      misshelvedBooks: [],
    },
    {
      id: 'robot-2',
      name: '盘点机器人-02',
      status: 'idle',
      battery: 100,
      position: { x: 12, y: 0.3, z: -10 },
      currentPath: [],
      progress: 0,
      misshelvedBooks: [],
    },
  ];
}

export function generateMisshelvedBooks(books: Book[], shelves: Shelf[]): MisshelvedBook[] {
  const misshelved: MisshelvedBook[] = [];
  const availableBooks = books.filter(b => b.status === 'available');

  for (let i = 0; i < 5; i++) {
    const book = randomChoice(availableBooks);
    const currentShelf = randomChoice(shelves);
    const targetShelf = shelves.find(s => s.id === book.location.shelfId) || randomChoice(shelves);

    misshelved.push({
      id: `misshelved-${i + 1}`,
      bookId: book.id,
      bookTitle: book.title,
      currentShelfId: currentShelf.id,
      currentShelfName: currentShelf.name,
      targetShelfId: targetShelf.id,
      targetShelfName: targetShelf.name,
      detectedTime: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()).split('T')[0],
      status: 'pending',
    });
  }

  return misshelved;
}

export function generateHotPredictions(books: Book[], shelves: Shelf[]): HotBookPrediction[] {
  const predictions: HotBookPrediction[] = [];
  const availableBooks = books.filter(b => b.status === 'available');

  const popularShelf = shelves[0];
  const storageShelf = shelves[shelves.length - 1];

  for (let i = 0; i < 10; i++) {
    const book = randomChoice(availableBooks);
    const path: Position3D[] = [];
    const startX = storageShelf.position.x;
    const startZ = storageShelf.position.z;
    const endX = popularShelf.position.x;
    const endZ = popularShelf.position.z;

    for (let t = 0; t <= 1; t += 0.1) {
      path.push({
        x: startX + (endX - startX) * t,
        y: 1.5 + Math.sin(t * Math.PI) * 0.5,
        z: startZ + (endZ - startZ) * t,
      });
    }

    predictions.push({
      bookId: book.id,
      book,
      predictedBorrows: randomInt(10, 50),
      confidence: 0.7 + Math.random() * 0.25,
      currentLocation: storageShelf.name,
      targetLocation: popularShelf.name,
      transferStatus: i < 3 ? 'in_transit' : (i < 6 ? 'pending' : 'completed'),
      transferPath: path,
    });
  }

  return predictions;
}

export function generateDailyReport(date: string, _books: Book[], _seats: Seat[]): DailyReport {
  const areaIds = ['area-books-1', 'area-reading-1', 'area-kiosk-1'];
  const borrowCount: Record<string, number> = {};
  areaIds.forEach(id => {
    borrowCount[id] = randomInt(50, 150);
  });

  return {
    date,
    borrowCount,
    seatUtilization: 0.5 + Math.random() * 0.35,
    misshelveRate: 0.01 + Math.random() * 0.03,
    deviceFailures: [
      {
        deviceId: 'ac-3',
        type: 'ac',
        description: '制冷效果下降，需要维护',
        time: `${date} 14:30:00`,
      },
      {
        deviceId: 'light-12',
        type: 'light',
        description: '灯管闪烁，需要更换',
        time: `${date} 09:15:00`,
      },
    ],
    totalBorrows: randomInt(200, 400),
    totalReturns: randomInt(180, 380),
    newReservations: randomInt(20, 50),
  };
}

export function generateLogs(users: User[]): LogEntry[] {
  const logs: LogEntry[] = [];
  const actions = [
    { action: '登录系统', level: 'info' as const },
    { action: '借阅图书', level: 'info' as const },
    { action: '归还图书', level: 'info' as const },
    { action: '预约座位', level: 'info' as const },
    { action: '取消预约', level: 'info' as const },
    { action: '系统告警', level: 'warning' as const },
    { action: '设备故障', level: 'error' as const },
    { action: '参数调整', level: 'info' as const },
  ];

  for (let i = 0; i < 50; i++) {
    const user = randomChoice(users);
    const act = randomChoice(actions);
    logs.push({
      id: `log-${i + 1}`,
      timestamp: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      userId: user.id,
      userName: user.name,
      action: act.action,
      details: `${user.name}执行了${act.action}操作`,
      level: act.level,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getDefaultThresholds(): EnvironmentThresholds {
  return {
    temperature: { min: 20, max: 26 },
    humidity: { min: 40, max: 60 },
    illumination: { min: 200, max: 500 },
  };
}

interface MockDataset {
  users: User[];
  areas: Area[];
  shelves: Shelf[];
  books: Book[];
  borrowHistory: BorrowHistory[];
  reservations: Reservation[];
  seats: Seat[];
  envData: EnvironmentData[];
  devices: Device[];
  robots: InventoryRobot[];
  misshelvedBooks: MisshelvedBook[];
  hotPredictions: HotBookPrediction[];
  logs: LogEntry[];
  thresholds: EnvironmentThresholds;
}

let initialized = false;
let mockDataset: MockDataset;

export function initializeMockData() {
  if (initialized) return;

  const users = generateUsers();
  const areas = generateAreas();
  const shelves = generateShelves();
  const books = generateBooks(shelves);
  const borrowHistory = generateBorrowHistory(books, users);
  const reservations = generateReservations(books, users);
  const seats = generateSeats();
  const envData = generateEnvironmentData();
  const devices = generateDevices();
  const robots = generateRobots(shelves);
  const misshelvedBooks = generateMisshelvedBooks(books, shelves);
  const hotPredictions = generateHotPredictions(books, shelves);
  const logs = generateLogs(users);
  const thresholds = getDefaultThresholds();

  mockDataset = {
    users,
    areas,
    shelves,
    books,
    borrowHistory,
    reservations,
    seats,
    envData,
    devices,
    robots,
    misshelvedBooks,
    hotPredictions,
    logs,
    thresholds,
  };

  initialized = true;
}

export function getMockData(): MockDataset {
  if (!initialized) {
    initializeMockData();
  }
  return mockDataset;
}

export type UserRole = 'reader' | 'librarian' | 'director';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  faceId?: string;
  lastLogin?: string;
}

export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'misshelved';

export interface BookLocation {
  shelfId: string;
  shelfLevel: number;
  position: number;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  category: string;
  location: BookLocation;
  status: BookStatus;
  borrowerId?: string;
  dueDate?: string;
  coverColor: string;
}

export type BorrowHistoryStatus = 'active' | 'returned' | 'overdue';

export interface BorrowHistory {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  borrowDate: string;
  returnDate?: string;
  status: BorrowHistoryStatus;
}

export type ReservationStatus = 'pending' | 'fulfilled' | 'expired' | 'cancelled';

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  reserveDate: string;
  expireDate: string;
  status: ReservationStatus;
}

export type SeatStatus = 'available' | 'reserved' | 'occupied' | 'maintenance';

export interface Seat {
  id: string;
  areaId: string;
  areaName: string;
  row: number;
  col: number;
  position: { x: number; y: number; z: number };
  status: SeatStatus;
  currentUserId?: string;
  currentUserName?: string;
  reservedUntil?: string;
  checkInDeadline?: string;
}

export interface EnvironmentData {
  timestamp: string;
  temperature: number;
  humidity: number;
  illumination: number;
  pm25: number;
  areaId: string;
}

export type DeviceType = 'ac' | 'light' | 'kiosk' | 'conveyor';
export type DeviceStatus = 'on' | 'off' | 'error';

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  status: DeviceStatus;
  value?: number;
  areaId: string;
  position: { x: number; y: number; z: number };
}

export type RobotStatus = 'idle' | 'scanning' | 'returning' | 'charging';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface InventoryRobot {
  id: string;
  name: string;
  status: RobotStatus;
  battery: number;
  position: Position3D;
  currentPath: Position3D[];
  progress: number;
  misshelvedBooks: MisshelvedBook[];
}

export type MisshelvedStatus = 'pending' | 'processing' | 'resolved';

export interface MisshelvedBook {
  id: string;
  bookId: string;
  bookTitle: string;
  currentShelfId: string;
  currentShelfName: string;
  targetShelfId: string;
  targetShelfName: string;
  detectedTime: string;
  status: MisshelvedStatus;
}

export interface DeviceFailure {
  deviceId: string;
  type: string;
  description: string;
  time: string;
}

export interface DailyReport {
  date: string;
  borrowCount: Record<string, number>;
  seatUtilization: number;
  misshelveRate: number;
  deviceFailures: DeviceFailure[];
  totalBorrows: number;
  totalReturns: number;
  newReservations: number;
}

export type EmergencyType = 'fire' | 'earthquake' | 'security';
export type EmergencyStatus = 'active' | 'resolved';

export interface EmergencyRoute {
  points: Position3D[];
}

export interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  startTime: string;
  status: EmergencyStatus;
  escapeRoutes: EmergencyRoute[];
  rescueRoutes: EmergencyRoute[];
}

export type TransferStatus = 'pending' | 'in_transit' | 'completed';

export interface HotBookPrediction {
  bookId: string;
  book: Book;
  predictedBorrows: number;
  confidence: number;
  currentLocation: string;
  targetLocation: string;
  transferStatus: TransferStatus;
  transferPath: Position3D[];
}

export interface Shelf {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
  levels: number;
  capacity: number;
  currentCount: number;
  position: Position3D;
  rotation: Position3D;
}

export interface Area {
  id: string;
  name: string;
  type: 'bookshelf' | 'reading' | 'kiosk' | 'conveyor' | 'monitor';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  level: 'info' | 'warning' | 'error';
}

export interface Notification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

export interface EnvironmentThresholds {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  illumination: { min: number; max: number };
}

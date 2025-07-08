
export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  password?: string; // Made optional for security reasons, not always exposed to client
}

export interface Activity {
  id: number;
  userId: number;
  name: string;
  date: JalaliDate;
  startTime: string;
  endTime: string;
  progress?: number; // Optional progress percentage
}

export type Page = 'DASHBOARD' | 'REGISTER_ACTIVITY' | 'REGISTER_REPORT' | 'PERFORMANCE' | 'VIEW_ACTIVITIES' | 'SETTINGS' | 'USER_MANAGEMENT';

export interface SortConfig {
  key: keyof Activity | null;
  direction: 'ascending' | 'descending';
}

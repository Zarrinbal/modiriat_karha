
import type { Page } from './types';

export const NAV_ITEMS: { id: Page; title: string; roles?: ('admin' | 'user')[] }[] = [
  { id: 'DASHBOARD', title: 'داشبورد' },
  { id: 'REGISTER_ACTIVITY', title: 'ثبت فعالیت جدید' },
  { id: 'REGISTER_REPORT', title: 'ثبت گزارش روزانه' },
  { id: 'PERFORMANCE', title: 'گزارش عملکرد' },
  { id: 'VIEW_ACTIVITIES', title: 'نمایش همه فعالیت‌ها' },
  { id: 'SETTINGS', title: 'تنظیمات'},
  { id: 'USER_MANAGEMENT', title: 'مدیریت کاربران', roles: ['admin']},
];

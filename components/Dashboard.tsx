
import React, { useState, useEffect } from 'react';
import type { Activity } from '../types';
import { ClockIcon, ListIcon, CalendarIcon } from './icons';
import { calculateTotalHours, formatTime } from '../utils/timeUtils';
import { getTodayJalali, formatJalaliDate, getFormattedJalaliDateWithDay } from '../utils/dateUtils';
import { toPersianDigits } from '../utils/stringUtils';

interface DashboardProps {
  activities: Activity[];
  recentActivities: Activity[];
}

const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return <span className="text-xl sm:text-2xl font-semibold tabular-nums tracking-wider">{time.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>;
}

const Dashboard: React.FC<DashboardProps> = ({ activities, recentActivities }) => {
  const today = getTodayJalali();
  const todaysActivities = activities.filter(
    (act) => act.date.year === today.year && act.date.month === today.month && act.date.day === today.day
  );
  const todaysActivitiesCount = todaysActivities.length;
  const todaysHours = calculateTotalHours(todaysActivities);

  return (
    <div className="p-6 sm:p-8">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-gray-800">
             <CalendarIcon className="w-8 h-8 text-blue-600" />
             <span className="text-lg sm:text-xl font-bold">{getFormattedJalaliDateWithDay(today)}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
             <ClockIcon className="w-7 h-7 text-blue-600" />
             <LiveClock />
          </div>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1>
      
      {/* Today's Stats */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">آمار امروز</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 space-x-reverse">
            <div className="bg-indigo-100 p-4 rounded-full">
              <ListIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">فعالیت‌های امروز</p>
              <p className="text-2xl font-bold text-gray-800">{toPersianDigits(todaysActivitiesCount)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 space-x-reverse">
            <div className="bg-pink-100 p-4 rounded-full">
              <ClockIcon className="w-8 h-8 text-pink-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">ساعات کاری امروز</p>
              <p className="text-2xl font-bold text-gray-800">{toPersianDigits(todaysHours.toFixed(2))}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">آخرین فعالیت‌های ثبت شده</h2>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 truncate">{activity.name}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <ClockIcon className="w-4 h-4 ml-1.5" />
                      <span>{formatJalaliDate(activity.date)} | {formatTime(activity.startTime)} - {formatTime(activity.endTime)}</span>
                    </div>
                  </div>
                  <div className="text-sm self-start sm:self-center">
                    {activity.progress !== undefined ? (
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                        {toPersianDigits(activity.progress)}% انجام شده
                      </span>
                    ) : (
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                        گزارش نشده
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-6">فعالیت اخیری برای نمایش وجود ندارد.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">راهنمای شروع</h2>
        <p className="text-gray-600">
          برای شروع، می‌توانید از منوی سمت راست یک فعالیت جدید ثبت کنید. سپس در بخش ثبت گزارش، پیشرفت روزانه خود را وارد نمایید. در نهایت، از بخش‌های گزارش عملکرد و نمایش فعالیت‌ها برای مشاهده و تحلیل داده‌های خود استفاده کنید.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

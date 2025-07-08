
import React, { useState, useMemo } from 'react';
import type { Activity, User, JalaliDate } from '../types';
import CustomJalaliDatePicker from './CustomJalaliDatePicker';
import { formatTime } from '../utils/timeUtils';
import { getTodayJalali } from '../utils/dateUtils';
import { ClockIcon, EditIcon } from './icons';
import { toPersianDigits } from '../utils/stringUtils';

interface RegisterReportProps {
  user: User;
  activities: Activity[];
  onUpdateProgress: (activityId: number, progress: number) => Promise<void>;
}

const RegisterReport: React.FC<RegisterReportProps> = ({ user, activities, onUpdateProgress }) => {
  const [selectedDate, setSelectedDate] = useState<JalaliDate | null>(getTodayJalali());
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const filteredActivities = useMemo(() => {
    if (!selectedDate) return [];
    return activities.filter(
      (act) => act.date.year === selectedDate.year && act.date.month === selectedDate.month && act.date.day === selectedDate.day
    );
  }, [activities, selectedDate]);

  const totalHours = useMemo(() => {
    return filteredActivities.reduce((total, act) => {
      const start = new Date(`1970-01-01T${act.startTime}`);
      const end = new Date(`1970-01-01T${act.endTime}`);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
  }, [filteredActivities]);

  const handleEditClick = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setProgress(activity.progress ?? 0);
  };

  const handleSaveProgress = async (activityId: number) => {
    await onUpdateProgress(activityId, progress);
    setEditingActivityId(null);
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ثبت گزارش روزانه</h1>
      <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
        <div className="mb-6">
          <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 mb-2">
            یک روز را برای مشاهده و ثبت گزارش انتخاب کنید:
          </label>
          <CustomJalaliDatePicker value={selectedDate} onChange={setSelectedDate} id="report-date" />
        </div>
        
        {selectedDate && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">فعالیت‌های روز انتخاب شده</h2>
            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <p className="font-bold text-gray-800">{activity.name}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <ClockIcon className="w-4 h-4 ml-1" />
                          <span>{formatTime(activity.startTime)} - {formatTime(activity.endTime)}</span>
                        </div>
                      </div>
                      <div className="flex items-center mt-3 sm:mt-0">
                          {activity.progress !== undefined ? (
                             <span className="text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">{toPersianDigits(activity.progress)}%</span>
                          ) : (
                             <span className="text-sm font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">ثبت نشده</span>
                          )}
                         <button onClick={() => handleEditClick(activity)} className="mr-3 p-2 rounded-full hover:bg-gray-200 transition">
                            <EditIcon className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    {editingActivityId === activity.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                             <div className="w-full sm:w-auto flex-grow">
                                <label htmlFor={`progress-${activity.id}`} className="text-sm font-medium text-gray-700">درصد پیشرفت: {toPersianDigits(progress)}%</label>
                                <input
                                    type="range"
                                    id={`progress-${activity.id}`}
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => handleSaveProgress(activity.id)} className="w-1/2 sm:w-auto flex-grow px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">ذخیره</button>
                                <button onClick={() => setEditingActivityId(null)} className="w-1/2 sm:w-auto flex-grow px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition">انصراف</button>
                            </div>
                        </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">هیچ فعالیتی برای این روز ثبت نشده است.</p>
              )}
            </div>
            {filteredActivities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-left">
                    <p className="text-lg font-bold text-gray-800">
                        مجموع ساعات کاری این روز: <span className="text-blue-600">{toPersianDigits(totalHours.toFixed(2))}</span> ساعت
                    </p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterReport;

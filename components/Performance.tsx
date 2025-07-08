
import React, { useState, useMemo } from 'react';
import type { Activity, User, JalaliDate } from '../types';
import CustomJalaliDatePicker from './CustomJalaliDatePicker';
import { ChevronDownIcon } from './icons';
import { formatJalaliDate, dayToDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/excelUtils';
import { toPersianDigits } from '../utils/stringUtils';

interface PerformanceProps {
  user: User;
  activities: Activity[];
}

type DailySummary = {
    date: JalaliDate;
    dateString: string;
    averageProgress: number;
    activityCount: number;
}

type SortConfig = {
    key: keyof DailySummary | null;
    direction: 'ascending' | 'descending';
}

const Performance: React.FC<PerformanceProps> = ({ user, activities }) => {
  const [startDate, setStartDate] = useState<JalaliDate | null>(null);
  const [endDate, setEndDate] = useState<JalaliDate | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });

  const dailySummaries = useMemo(() => {
    const reportedActivities = activities.filter(a => a.progress !== undefined);

    let filtered = reportedActivities;
    if (startDate) {
      const start = dayToDate(startDate).getTime();
      filtered = filtered.filter(item => dayToDate(item.date).getTime() >= start);
    }
    if (endDate) {
      const end = dayToDate(endDate).getTime();
      filtered = filtered.filter(item => dayToDate(item.date).getTime() <= end);
    }

    const groupedByDay = filtered.reduce((acc, activity) => {
        const dateKey = formatJalaliDate(activity.date);
        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: activity.date,
                totalProgress: 0,
                count: 0
            };
        }
        acc[dateKey].totalProgress += activity.progress ?? 0;
        acc[dateKey].count++;
        return acc;
    }, {} as Record<string, { date: JalaliDate; totalProgress: number; count: number }>);
    
    const summaries: DailySummary[] = Object.entries(groupedByDay).map(([dateString, data]) => ({
        dateString,
        date: data.date,
        averageProgress: data.totalProgress / data.count,
        activityCount: data.count
    }));

    if (sortConfig.key !== null) {
      summaries.sort((a, b) => {
        let aValue, bValue;
        if(sortConfig.key === 'date') {
            aValue = dayToDate(a.date).getTime();
            bValue = dayToDate(b.date).getTime();
        } else {
            aValue = a[sortConfig.key as keyof DailySummary];
            bValue = b[sortConfig.key as keyof DailySummary];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return summaries;
  }, [activities, startDate, endDate, sortConfig]);
  
  const requestSort = (key: keyof DailySummary) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof DailySummary) => {
      if(sortConfig.key !== key) return <ChevronDownIcon className="w-4 h-4 text-gray-400 opacity-50" />;
      return <ChevronDownIcon className={`w-4 h-4 text-blue-600 transition-transform ${sortConfig.direction === 'ascending' ? 'rotate-180' : ''}`} />
  }

  const overallAverageProgress = useMemo(() => {
    if (dailySummaries.length === 0) return 0;
    const totalProgress = dailySummaries.reduce((sum, day) => sum + (day.averageProgress * day.activityCount), 0);
    const totalActivities = dailySummaries.reduce((sum, day) => sum + day.activityCount, 0);
    return totalProgress / totalActivities;
  }, [dailySummaries]);
  
  const handleExport = () => {
    const dataToExport = dailySummaries.map(day => ({
        "تاریخ": day.dateString,
        "میانگین پیشرفت": `${toPersianDigits(day.averageProgress.toFixed(1))}%`,
        "تعداد فعالیت‌ها": toPersianDigits(day.activityCount)
    }));
    exportToExcel(dataToExport, "گزارش_عملکرد_روزانه");
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">گزارش عملکرد</h1>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">از تاریخ</label>
            <CustomJalaliDatePicker value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تا تاریخ</label>
            <CustomJalaliDatePicker value={endDate} onChange={setEndDate} />
          </div>
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
             <button onClick={handleExport} disabled={dailySummaries.length === 0} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed">خروجی اکسل</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => requestSort('date')} className="flex items-center gap-1">تاریخ {getSortIcon('date')}</button>
                </th>
                 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => requestSort('activityCount')} className="flex items-center gap-1">تعداد فعالیت‌ها {getSortIcon('activityCount')}</button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => requestSort('averageProgress')} className="flex items-center gap-1">میانگین پیشرفت {getSortIcon('averageProgress')}</button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailySummaries.map((day) => (
                <tr key={day.dateString}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day.dateString}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{toPersianDigits(day.activityCount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${day.averageProgress}%` }}></div>
                        </div>
                        <span className="mr-2 font-medium text-gray-700">{toPersianDigits(day.averageProgress.toFixed(1))}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {dailySummaries.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500">
                        هیچ گزارشی در این بازه زمانی یافت نشد.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         {dailySummaries.length > 0 && (
             <div className="mt-6 pt-4 border-t border-gray-200 text-left">
                <p className="text-lg font-bold text-gray-800">
                    میانگین کل پیشرفت در بازه انتخابی: <span className="text-blue-600">{toPersianDigits(overallAverageProgress.toFixed(1))}%</span>
                </p>
             </div>
         )}
      </div>
    </div>
  );
};

export default Performance;

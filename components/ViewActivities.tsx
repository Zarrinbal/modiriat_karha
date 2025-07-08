
import React, { useState, useMemo, useEffect } from 'react';
import type { Activity, User, JalaliDate } from '../types';
import CustomJalaliDatePicker from './CustomJalaliDatePicker';
import CustomTimePicker from './CustomTimePicker';
import { formatJalaliDate, dayToDate, getJalaliDayOfWeek } from '../utils/dateUtils';
import { calculateTotalHours, calculateSingleActivityHours, formatTime } from '../utils/timeUtils';
import { exportToExcel } from '../utils/excelUtils';
import { EditIcon, TrashIcon } from './icons';
import { toPersianDigits } from '../utils/stringUtils';

interface ViewActivitiesProps {
  user: User;
  activities: Activity[];
  onDeleteActivity: (id: number) => Promise<void>;
  onUpdateActivity: (id: number, updatedData: { name: string, date: JalaliDate, startTime: string, endTime: string }) => Promise<void>;
}

const ViewActivities: React.FC<ViewActivitiesProps> = ({ user, activities, onDeleteActivity, onUpdateActivity }) => {
  const [startDate, setStartDate] = useState<JalaliDate | null>(null);
  const [endDate, setEndDate] = useState<JalaliDate | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formState, setFormState] = useState<{name: string, date: JalaliDate | null, startTime: string, endTime: string}>({ name: '', date: null, startTime: '', endTime: ''});
  const [formError, setFormError] = useState<string | null>(null);


  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    if (startDate) {
      const start = dayToDate(startDate).getTime();
      filtered = filtered.filter(item => dayToDate(item.date).getTime() >= start);
    }
    if (endDate) {
      const end = dayToDate(endDate).getTime();
      filtered = filtered.filter(item => dayToDate(item.date).getTime() <= end);
    }
    return filtered.sort((a,b) => dayToDate(b.date).getTime() - dayToDate(a.date).getTime() || b.id - a.id);
  }, [activities, startDate, endDate]);
  
  const totalHours = calculateTotalHours(filteredActivities);

  const handleDelete = (activityId: number, activityName: string) => {
    if (window.confirm(`آیا از حذف فعالیت «${activityName}» اطمینان دارید؟`)) {
      onDeleteActivity(activityId);
    }
  };
  
  const openEditModal = (activity: Activity) => {
      setEditingActivity(activity);
      setFormState({
          name: activity.name,
          date: activity.date,
          startTime: activity.startTime,
          endTime: activity.endTime
      });
      setFormError(null);
      setIsEditModalOpen(true);
  }

  const closeModal = () => {
      setIsExiting(true);
      setTimeout(() => {
          setIsEditModalOpen(false);
          setIsExiting(false);
          setEditingActivity(null);
      }, 300);
  }

  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingActivity || !formState.date || !formState.name || !formState.startTime || !formState.endTime) {
          setFormError('لطفا تمام فیلدها را پر کنید.');
          return;
      }
      if (formState.endTime <= formState.startTime) {
          setFormError('ساعت پایان باید بعد از ساعت شروع باشد.');
          return;
      }
      setFormError(null);
      await onUpdateActivity(editingActivity.id, {
          name: formState.name,
          date: formState.date,
          startTime: formState.startTime,
          endTime: formState.endTime
      });
      closeModal();
  }
  
  const handleExport = () => {
      const dataToExport = filteredActivities.map(act => ({
          "نام فعالیت": act.name,
          "تاریخ": formatJalaliDate(act.date),
          "روز هفته": getJalaliDayOfWeek(act.date),
          "ساعت شروع": formatTime(act.startTime),
          "ساعت پایان": formatTime(act.endTime),
          "مدت زمان (ساعت)": toPersianDigits(calculateSingleActivityHours(act).toFixed(2)),
          "درصد پیشرفت": act.progress !== undefined ? `${toPersianDigits(act.progress)}%` : 'ثبت نشده'
      }));
      exportToExcel(dataToExport, "لیست_فعالیت‌ها");
  }

  return (
    <>
      <div className="p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">نمایش همه فعالیت‌ها</h1>
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
                <button onClick={handleExport} disabled={filteredActivities.length === 0} className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed">خروجی اکسل</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام فعالیت</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">روز هفته</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مدت زمان (ساعت)</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatJalaliDate(activity.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getJalaliDayOfWeek(activity.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{toPersianDigits(calculateSingleActivityHours(activity).toFixed(2))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button onClick={() => openEditModal(activity)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors duration-200 ml-2">
                          <EditIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDelete(activity.id, activity.name)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors duration-200">
                          <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && (
                  <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-500">
                          هیچ فعالیتی در این بازه زمانی یافت نشد.
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredActivities.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-left">
                  <p className="text-lg font-bold text-gray-800">
                      مجموع ساعات در بازه انتخابی: <span className="text-blue-600">{toPersianDigits(totalHours.toFixed(2))}</span> ساعت
                  </p>
              </div>
          )}

        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4 ${isExiting ? 'modal-leave' : 'modal-enter'}`}>
              <div className="modal-content bg-white rounded-xl shadow-2xl w-full max-w-lg">
                  <form onSubmit={handleUpdate} className="p-6 sm:p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">ویرایش فعالیت</h2>
                      <div className="space-y-5">
                          <div>
                              <label htmlFor="edit-activity-name" className="block text-sm font-medium text-gray-700 mb-1">نام فعالیت</label>
                              <input
                                  type="text"
                                  id="edit-activity-name"
                                  value={formState.name}
                                  onChange={(e) => setFormState(s => ({...s, name: e.target.value}))}
                                  className="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                          </div>
                          <div>
                              <label htmlFor="edit-activity-date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
                              <CustomJalaliDatePicker value={formState.date} onChange={d => setFormState(s => ({...s, date: d}))} id="edit-activity-date" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label htmlFor="edit-start-time" className="block text-sm font-medium text-gray-700 mb-1">ساعت شروع</label>
                                  <CustomTimePicker id="edit-start-time" value={formState.startTime} onChange={time => setFormState(s => ({...s, startTime: time}))} />
                              </div>
                              <div>
                                  <label htmlFor="edit-end-time" className="block text-sm font-medium text-gray-700 mb-1">ساعت پایان</label>
                                  <CustomTimePicker id="edit-end-time" value={formState.endTime} onChange={time => setFormState(s => ({...s, endTime: time}))} />
                              </div>
                          </div>
                      </div>
                      {formError && (
                          <div className="mt-4 p-3 rounded-lg text-sm bg-red-100 text-red-800">
                              {formError}
                          </div>
                      )}
                      <div className="mt-8 flex justify-end gap-3">
                          <button type="button" onClick={closeModal} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">انصراف</button>
                          <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">ذخیره تغییرات</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </>
  );
};

export default ViewActivities;

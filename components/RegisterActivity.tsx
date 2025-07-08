
import React, { useState } from 'react';
import type { Activity, User, JalaliDate } from '../types';
import CustomJalaliDatePicker from './CustomJalaliDatePicker';
import CustomTimePicker from './CustomTimePicker';

interface RegisterActivityProps {
  user: User;
  onAddActivity: (activity: Omit<Activity, 'id' | 'userId'>) => Promise<void>;
}

const RegisterActivity: React.FC<RegisterActivityProps> = ({ user, onAddActivity }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState<JalaliDate | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !startTime || !endTime) {
      setMessage({ type: 'error', text: 'لطفا تمام فیلدها را پر کنید.' });
      return;
    }
    if (endTime <= startTime) {
      setMessage({ type: 'error', text: 'ساعت پایان باید بعد از ساعت شروع باشد.' });
      return;
    }
    
    setMessage(null);
    try {
      await onAddActivity({
        name,
        date,
        startTime,
        endTime,
      });
      setMessage({ type: 'success', text: 'فعالیت با موفقیت ثبت شد!' });
      // Reset form
      setName('');
      setDate(null);
      setStartTime('09:00');
      setEndTime('10:00');
    } catch (error) {
       setMessage({ type: 'error', text: 'خطایی در ثبت فعالیت رخ داد.' });
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ثبت فعالیت جدید</h1>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-1">
              نام فعالیت
            </label>
            <input
              type="text"
              id="activity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثلا: مطالعه فصل ۵ کتاب"
            />
          </div>
          <div>
            <label htmlFor="activity-date" className="block text-sm font-medium text-gray-700 mb-1">
              تاریخ
            </label>
            <CustomJalaliDatePicker value={date} onChange={setDate} id="activity-date" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                ساعت شروع
              </label>
              <CustomTimePicker id="start-time" value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                ساعت پایان
              </label>
              <CustomTimePicker id="end-time" value={endTime} onChange={setEndTime} />
            </div>
          </div>
          
          {message && (
            <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              ذخیره فعالیت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterActivity;

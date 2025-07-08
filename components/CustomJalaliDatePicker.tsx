
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { JalaliDate } from '../types';
import { 
    CalendarIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon 
} from './icons';
import { 
    formatJalaliDate, 
    getJalaliMonthInfo, 
    getTodayJalali,
    JALALI_MONTHS, 
    JALALI_WEEK_DAYS 
} from '../utils/dateUtils';
import { toPersianDigits } from '../utils/stringUtils';

interface CustomJalaliDatePickerProps {
  value: JalaliDate | null;
  onChange: (date: JalaliDate) => void;
  id?: string;
}

const CustomJalaliDatePicker: React.FC<CustomJalaliDatePickerProps> = ({ value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const today = useMemo(() => getTodayJalali(), []);
  const [viewDate, setViewDate] = useState<JalaliDate>(value || today);

  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Update view date if value changes from outside
    if(value) {
        setViewDate({year: value.year, month: value.month, day: 1});
    } else {
        setViewDate(today);
    }
  }, [value, today]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);
  
  const handleDayClick = (day: number) => {
    onChange({ year: viewDate.year, month: viewDate.month, day });
    setIsOpen(false);
  };

  const changeMonth = (amount: number) => {
    let targetMonth = viewDate.month + amount;
    let targetYear = viewDate.year;

    if (targetMonth > 12) {
        targetMonth = 1;
        targetYear++;
    } else if (targetMonth < 1) {
        targetMonth = 12;
        targetYear--;
    }
    
    setViewDate({ year: targetYear, month: targetMonth, day: 1 });
  };
  
  const changeYear = (amount: number) => {
      setViewDate(prev => ({ ...prev, year: prev.year + amount }));
  };
  
  const { daysInMonth, startDayOfWeek } = getJalaliMonthInfo(viewDate.year, viewDate.month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const renderCalendar = () => {
    if(!isOpen) return null;
    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-lg shadow-2xl p-4 z-10 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeYear(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronDoubleRightIcon className="w-5 h-5" /></button>
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
                <div className="font-semibold text-gray-800">{JALALI_MONTHS[viewDate.month - 1]} {toPersianDigits(viewDate.year)}</div>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
                <button onClick={() => changeYear(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronDoubleLeftIcon className="w-5 h-5" /></button>
            </div>
            {/* Week Days */}
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                {JALALI_WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
            </div>
            {/* Days Grid */}
            <div className="grid grid-cols-7 text-center text-sm">
                {emptyDays.map(i => <div key={`empty-${i}`}></div>)}
                {days.map(day => {
                    const isSelected = value?.day === day && value?.month === viewDate.month && value?.year === viewDate.year;
                    const isToday = today.day === day && today.month === viewDate.month && today.year === viewDate.year;
                    
                    return (
                        <button 
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
                                ${!isSelected && isToday ? 'bg-blue-100 text-blue-700' : ''}
                                ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                            `}
                        >{toPersianDigits(day)}</button>
                    )
                })}
            </div>
             <div className="mt-4 pt-2 border-t border-gray-200">
                <button onClick={() => { onChange(today); setIsOpen(false); }} className="w-full text-center text-sm text-blue-600 font-medium hover:bg-blue-50 p-2 rounded-md transition-colors">امروز</button>
            </div>
        </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative" onClick={() => setIsOpen(prev => !prev)}>
        <input
            id={id}
            readOnly
            value={formatJalaliDate(value)}
            placeholder="تاریخ را انتخاب کنید"
            className="w-full px-4 py-3 cursor-pointer text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
        />
        <CalendarIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {renderCalendar()}
    </div>
  );
};

export default CustomJalaliDatePicker;

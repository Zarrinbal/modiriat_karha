
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ClockIcon } from './icons';
import { toPersianDigits } from '../utils/stringUtils';
import { formatTime } from '../utils/timeUtils';

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  id?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('09');
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const [currentHour, currentMinute] = useMemo(() => {
    return value ? value.split(':') : ['09', '00'];
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      const scrollToCenter = (element: Element | null, container: HTMLElement | null) => {
        if (element && container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const offset = elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
            container.scrollTop += offset;
        }
      };

      const selectedHourElement = hourListRef.current?.querySelector(`[data-hour="${currentHour}"]`);
      scrollToCenter(selectedHourElement || null, hourListRef.current);
      
      const selectedMinuteElement = minuteListRef.current?.querySelector(`[data-minute="${currentMinute}"]`);
      scrollToCenter(selectedMinuteElement || null, minuteListRef.current);
    }
  }, [isOpen, currentHour, currentMinute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);
  
  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
  };

  const handleMinuteSelect = (minute: string) => {
    onChange(`${selectedHour}:${minute}`);
    setIsOpen(false);
  };
  
  useEffect(() => {
      setSelectedHour(currentHour);
  }, [currentHour, isOpen]);

  const renderPicker = () => {
    if (!isOpen) return null;
    return (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-2xl z-10 border border-gray-200 overflow-hidden">
        <div className="flex items-center text-center py-2 border-b border-gray-200 text-sm font-semibold text-gray-600">
            <div className="w-1/2 border-l border-gray-200">ساعت</div>
            <div className="w-1/2">دقیقه</div>
        </div>
        <div className="flex h-48">
          <div ref={hourListRef} className="flex-1 overflow-y-auto border-l border-gray-200 no-scrollbar">
            {hours.map(hour => (
              <button
                key={hour}
                type="button"
                data-hour={hour}
                onClick={() => handleHourSelect(hour)}
                className={`w-full text-center py-1.5 transition-colors ${
                  selectedHour === hour
                    ? 'bg-blue-600 text-white font-bold'
                    : 'hover:bg-gray-100'
                }`}
              >
                {toPersianDigits(hour)}
              </button>
            ))}
          </div>
          <div ref={minuteListRef} className="flex-1 overflow-y-auto no-scrollbar">
            {minutes.map(minute => (
              <button
                key={minute}
                type="button"
                data-minute={minute}
                onClick={() => handleMinuteSelect(minute)}
                className={`w-full text-center py-1.5 transition-colors ${
                  currentMinute === minute && selectedHour === currentHour
                    ? 'bg-blue-100 text-blue-700 font-bold'
                    : 'hover:bg-gray-100'
                }`}
              >
                {toPersianDigits(minute)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative" onClick={() => setIsOpen(prev => !prev)}>
        <input
          id={id}
          readOnly
          value={formatTime(value)}
          placeholder="انتخاب ساعت"
          className="w-full px-4 py-3 cursor-pointer text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
        />
        <ClockIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {renderPicker()}
    </div>
  );
};

export default CustomTimePicker;

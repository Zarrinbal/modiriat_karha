
import type { Activity } from '../types';
import { toPersianDigits } from './stringUtils';

export const calculateTotalHours = (activities: Activity[]): number => {
    return activities.reduce((total, act) => {
      return total + calculateSingleActivityHours(act);
    }, 0);
};

export const calculateSingleActivityHours = (activity: Activity): number => {
    if (!activity.startTime || !activity.endTime) return 0;
    const start = new Date(`1970-01-01T${activity.startTime}:00`);
    const end = new Date(`1970-01-01T${activity.endTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return 0;
    }
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
};

export const formatTime = (time: string): string => {
    if(!time) return '';
    const [hour, minute] = time.split(':');
    return `${toPersianDigits(hour)}:${toPersianDigits(minute)}`;
}

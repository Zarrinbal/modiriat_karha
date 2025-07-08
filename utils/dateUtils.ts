
import type { JalaliDate } from '../types';
import { toPersianDigits } from './stringUtils';

export const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
export const JALALI_WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
export const JALALI_FULL_WEEK_DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export const formatJalaliDate = (date: JalaliDate | null): string => {
  if (!date) return '';
  const year = toPersianDigits(date.year);
  const month = toPersianDigits(String(date.month).padStart(2, '0'));
  const day = toPersianDigits(String(date.day).padStart(2, '0'));
  return `${year}/${month}/${day}`;
};

export const getFormattedJalaliDateWithDay = (date: JalaliDate): string => {
    const dayName = getJalaliDayOfWeek(date);
    const day = toPersianDigits(date.day);
    const year = toPersianDigits(date.year);
    return `${dayName}، ${day} ${JALALI_MONTHS[date.month - 1]} ${year}`;
}

export const dayToDate = (day: JalaliDate): Date => {
  const [gy, gm, gd] = jalaliToGregorian(day.year, day.month, day.day);
  // Using UTC to avoid timezone issues when comparing dates
  return new Date(Date.UTC(gy, gm - 1, gd));
};

// --- Jalali Calendar Logic ---

export const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return [jy, jm, jd];
};

export const jalaliToGregorian = (jy: number, jm: number, jd: number): [number, number, number] => {
    jy += 1595;
    let days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
        gy += 100 * Math.floor(--days / 36524);
        days %= 36524;
        if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    let gd = days + 1;
    const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0;
    while (gm < 13 && gd > sal_a[gm]) {
        gd -= sal_a[gm];
        gm++;
    }
    return [gy, gm, gd];
}

export const getJalaliDayOfWeek = (date: JalaliDate): string => {
    const [gy, gm, gd] = jalaliToGregorian(date.year, date.month, date.day);
    const gDate = new Date(gy, gm - 1, gd);
    // JS: Sun=0, Sat=6. Persian: Sat=0, Fri=6
    const dayIndex = (gDate.getDay() + 1) % 7;
    return JALALI_FULL_WEEK_DAYS[dayIndex];
}

export const isJalaliLeap = (year: number): boolean => {
    return (((((year - 474) % 2820) + 474 + 38) * 682) % 2816) < 682;
};

export const getDaysInJalaliMonth = (year: number, month: number): number => {
    if (month < 7) return 31;
    if (month < 12) return 30;
    if (month === 12) return isJalaliLeap(year) ? 30 : 29;
    return 0;
};

export const getJalaliMonthInfo = (year: number, month: number) => {
    const daysInMonth = getDaysInJalaliMonth(year, month);
    const [gy, gm, gd] = jalaliToGregorian(year, month, 1);
    const firstDay = new Date(gy, gm - 1, gd);
    // JS: Sun=0, Sat=6. Persian: Sat=0, Fri=6
    const startDayOfWeek = (firstDay.getDay() + 1) % 7; 
    return { daysInMonth, startDayOfWeek };
}

export const getTodayJalali = (): JalaliDate => {
    const today = new Date();
    const [year, month, day] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return { year, month, day };
}

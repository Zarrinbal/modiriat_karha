
import { useState, useEffect, useCallback } from 'react';
import type { Activity, JalaliDate, User } from '../types';
import { gregorianToJalali, jalaliToGregorian } from '../utils/dateUtils';

// آدرس پایه API شما. این آدرس نسبی باعث می‌شود کد روی هر دامنه‌ای کار کند.
const API_BASE_URL = '/api';

// --- Helper function for API calls ---
async function apiFetch(url: string, options: RequestInit = {}) {
    // برای ارسال کوکی سشن، credentials باید 'include' باشد.
    options.credentials = 'include'; 
    if (options.body && !(options.body instanceof FormData)) {
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
    }

    const response = await fetch(url, options);
    
    // Check for empty response on success, e.g., for logout
    if (response.ok && response.headers.get('Content-Length') === '0') {
        return null;
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'یک خطای ناشناخته در سرور رخ داد.');
    }
    return data;
}

// --- Data Transformation Helpers ---
const activityToClient = (serverActivity: any): Activity => {
    const [gy, gm, gd] = serverActivity.activity_date.split('-').map(Number);
    const [year, month, day] = gregorianToJalali(gy, gm, gd);
    return {
        id: parseInt(serverActivity.id, 10),
        userId: parseInt(serverActivity.user_id, 10),
        name: serverActivity.name,
        date: { year, month, day },
        startTime: serverActivity.start_time.slice(0, 5),
        endTime: serverActivity.end_time.slice(0, 5),
        progress: serverActivity.progress !== null ? parseInt(serverActivity.progress, 10) : undefined,
    };
};

const activityToServer = (clientActivity: Partial<Activity> & { date: JalaliDate }) => {
    const [gy, gm, gd] = jalaliToGregorian(clientActivity.date.year, clientActivity.date.month, clientActivity.date.day);
    const dbDate = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
    return {
        ...clientActivity,
        activity_date: dbDate, // فیلد تاریخ را به نامی که بک‌اند انتظار دارد تغییر می‌دهیم
    };
}


// --- Main Store Hook ---
export const useStore = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Start as true to handle initial session check
    const [loginError, setLoginError] = useState<string | null>(null);
    
    // Check for active session on initial load
    useEffect(() => {
        const checkUserSession = async () => {
            setIsLoading(true);
            try {
                const user = await apiFetch(`${API_BASE_URL}/check_session.php`);
                if (user) {
                    setCurrentUser(user);
                    await fetchInitialData(user.id, user.role);
                }
            } catch (error) {
                // No active session, do nothing
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const fetchInitialData = async (userId: number, role: 'admin' | 'user') => {
        setIsLoading(true);
        try {
            const userActivitiesData = await apiFetch(`${API_BASE_URL}/get_activities.php`);
            setActivities(userActivitiesData.map(activityToClient));

            if (role === 'admin') {
                const allUsersData = await apiFetch(`${API_BASE_URL}/get_users.php`);
                setUsers(allUsersData);
            }
        } catch (err: any) {
            console.error("Failed to fetch initial data:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<User | null> => {
        setLoginError(null);
        setIsLoading(true);
        try {
            const user = await apiFetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            setCurrentUser(user);
            await fetchInitialData(user.id, user.role);
            return user;
        } catch (err: any) {
            setLoginError(err.message || "خطای ناشناخته");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await apiFetch(`${API_BASE_URL}/logout.php`, { method: 'POST' });
        setCurrentUser(null);
        setActivities([]);
        setUsers([]);
    };

    const addUser = async (userData: Omit<User, 'id'>) => {
        const newUser = await apiFetch(`${API_BASE_URL}/add_user.php`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        setUsers(prev => [...prev, newUser]);
    };

    const changePassword = async (oldPass: string, newPass: string) => {
        await apiFetch(`${API_BASE_URL}/change_password.php`, {
            method: 'POST',
            body: JSON.stringify({ current_password: oldPass, new_password: newPass }),
        });
    };

    const addActivity = async (activityData: Omit<Activity, 'id' | 'userId'>) => {
        const serverData = activityToServer(activityData as any);
        const newActivityData = await apiFetch(`${API_BASE_URL}/add_activity.php`, {
            method: 'POST',
            body: JSON.stringify(serverData),
        });
        const newActivity = activityToClient(newActivityData);
        setActivities(prev => [newActivity, ...prev]);
    };

    const updateActivityProgress = async (activityId: number, progress: number) => {
        const updatedActivityData = await apiFetch(`${API_BASE_URL}/update_progress.php`, {
            method: 'POST',
            body: JSON.stringify({ id: activityId, progress }),
        });
        const updatedActivity = activityToClient(updatedActivityData);
        setActivities(prev => prev.map(act => act.id === activityId ? updatedActivity : act));
    };

    const updateActivity = async (activityId: number, updatedData: { name: string; date: JalaliDate; startTime: string; endTime: string; }) => {
        const serverData = activityToServer(updatedData as any);
        const updatedActivityData = await apiFetch(`${API_BASE_URL}/update_activity.php`, {
            method: 'POST',
            body: JSON.stringify({ id: activityId, ...serverData }),
        });
        const updatedActivity = activityToClient(updatedActivityData);
        setActivities(prev => prev.map(act => act.id === activityId ? updatedActivity : act));
    };
    
    const deleteActivity = async (activityId: number) => {
        await apiFetch(`${API_BASE_URL}/delete_activity.php`, {
            method: 'POST',
            body: JSON.stringify({ id: activityId }),
        });
        setActivities(prev => prev.filter(act => act.id !== activityId));
    };

    const recentActivities = [...activities]
      .sort((a, b) => {
          const dateComparison = new Date(activityToServer(b).activity_date).getTime() - new Date(activityToServer(a).activity_date).getTime();
          if (dateComparison !== 0) return dateComparison;
          return b.id - a.id;
      })
      .slice(0, 5);
      
    return {
        state: { currentUser, users, activities, isLoading, loginError, recentActivities },
        actions: { login, logout, addActivity, updateActivityProgress, updateActivity, deleteActivity, addUser, changePassword }
    };
};

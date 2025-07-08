
import React, { useState } from 'react';
import type { User } from '../types';
import { toPersianDigits } from '../utils/stringUtils';

interface UserManagementProps {
    users: User[];
    onAddUser: (userData: Omit<User, 'id'>) => Promise<void>;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!username || !password) {
            setMessage({ type: 'error', text: 'نام کاربری و رمز عبور الزامی است.' });
            return;
        }
        if (password.length < 4) {
             setMessage({ type: 'error', text: 'رمز عبور باید حداقل ۴ کاراکتر باشد.' });
            return;
        }
        
        try {
            await onAddUser({ username, password, role });
            setMessage({ type: 'success', text: `کاربر «${username}» با موفقیت ایجاد شد.`});
            setUsername('');
            setPassword('');
            setRole('user');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'خطایی در ایجاد کاربر رخ داد.'});
        }
    }

    const roleToPersian = (role: 'user' | 'admin') => {
        return role === 'admin' ? 'ادمین' : 'کاربر';
    }

    return (
        <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">مدیریت کاربران</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">ایجاد کاربر جدید</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
                                <input
                                    id="new-username"
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="new-password"  className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="new-role" className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
                                <select 
                                    id="new-role"
                                    value={role}
                                    onChange={e => setRole(e.target.value as 'user' | 'admin')}
                                    className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="user">کاربر</option>
                                    <option value="admin">ادمین</option>
                                </select>
                            </div>
                             {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                                </div>
                            )}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                                >
                                    ایجاد کاربر
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">لیست کاربران سیستم</h2>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام کاربری</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نقش</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{toPersianDigits(user.id)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {roleToPersian(user.role)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

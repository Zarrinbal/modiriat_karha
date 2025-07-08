
import React, { useState } from 'react';

interface SettingsProps {
    onChangePassword: (oldPass: string, newPass: string) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ onChangePassword }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'لطفا تمام فیلدها را پر کنید.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'رمز عبور جدید با تکرار آن مطابقت ندارد.' });
            return;
        }
        if (newPassword.length < 4) {
             setMessage({ type: 'error', text: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' });
            return;
        }

        try {
            await onChangePassword(currentPassword, newPassword);
            setMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'خطایی در تغییر رمز عبور رخ داد.' });
        }
    }

    return (
        <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">تنظیمات حساب کاربری</h1>
            <div className="bg-white p-8 rounded-xl shadow-md max-w-lg mx-auto">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">تغییر رمز عبور</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="current-password"  className="block text-sm font-medium text-gray-700 text-right mb-1">رمز عبور فعلی</label>
                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="new-password"  className="block text-sm font-medium text-gray-700 text-right mb-1">رمز عبور جدید</label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700 text-right mb-1">تکرار رمز عبور جدید</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {message && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                        ذخیره تغییرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Settings;

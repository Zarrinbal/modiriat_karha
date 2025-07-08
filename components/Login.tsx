
import React, { useState } from 'react';
import type { User } from '../types';
import { AlertTriangleIcon } from './icons';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<User | null>;
  loginError: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, loginError }) => {
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('1234');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">ورود به سیستم</h1>
          <p className="mt-2 text-gray-500">به پنل مدیریت فعالیت خود خوش آمدید</p>
          <div className="mt-4 text-sm text-gray-400 space-y-1">
             <p>کاربر عادی: نام کاربری: user | رمز: 1234</p>
             <p>کاربر ادمین: نام کاربری: admin | رمز: admin</p>
          </div>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-right mb-1">
              نام کاربری
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 text-right mb-1">
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-gray-800 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          {loginError && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <AlertTriangleIcon className="w-5 h-5 ml-2" />
              <span className="font-medium">{loginError}</span>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              ورود
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

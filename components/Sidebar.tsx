
import React from 'react';
import type { Page, User } from '../types';
import { NAV_ITEMS } from '../constants';
import { DashboardIcon, PlusCircleIcon, EditIcon, BarChartIcon, ListIcon, LogOutIcon, ChevronLeftIcon, ChevronRightIcon, SettingsIcon, UsersIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  user: User;
}

const ICONS: { [key: string]: React.ElementType } = {
  DASHBOARD: DashboardIcon,
  REGISTER_ACTIVITY: PlusCircleIcon,
  REGISTER_REPORT: EditIcon,
  PERFORMANCE: BarChartIcon,
  VIEW_ACTIVITIES: ListIcon,
  SETTINGS: SettingsIcon,
  USER_MANAGEMENT: UsersIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout, isCollapsed, setIsCollapsed, user }) => {
  return (
    <aside className={`bg-white shadow-lg flex flex-col h-screen fixed top-0 right-0 transition-all duration-300 ease-in-out z-20 ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'}`}>
      <div className={`text-center py-6 border-b border-gray-200 transition-all duration-300 overflow-hidden`}>
        <h2 className={`text-xl font-bold text-gray-800 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>مدیریت فعالیت</h2>
      </div>
      
      <nav className="mt-6 flex-grow">
        <ul>
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user.role)).map((item) => {
            const Icon = ICONS[item.id];
            return (
              <li key={item.id} className="mb-2 relative group px-4">
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isCollapsed ? '' : 'ml-3'}`} />
                  <span className={`font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.title}</span>
                </button>
                {isCollapsed && (
                    <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                        {item.title}
                    </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-gray-200 pt-4 pb-2 px-4">
        <div className="mb-2 relative group">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isCollapsed ? <ChevronLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
              <span className={`font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 ml-3'}`}>{isCollapsed ? 'باز کردن' : 'بستن منو'}</span>
            </button>
            {isCollapsed && (
                 <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    {isCollapsed ? 'باز کردن منو' : 'بستن منو'}
                </span>
            )}
        </div>
      
        <div className="relative group">
            <button
              onClick={onLogout}
              className={`w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOutIcon className={`w-5 h-5 transition-all duration-300 ${isCollapsed ? '' : 'ml-3'}`} />
              <span className={`font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>خروج</span>
            </button>
            {isCollapsed && (
                 <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    خروج
                </span>
            )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

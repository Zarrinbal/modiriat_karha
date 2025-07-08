
import React, { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RegisterActivity from './components/RegisterActivity';
import RegisterReport from './components/RegisterReport';
import Performance from './components/Performance';
import ViewActivities from './components/ViewActivities';
import Settings from './components/Settings';
import { UserManagement } from './components/UserManagement';
import type { Page } from './types';
import { useStore } from './hooks/useActivities';

const App: React.FC = () => {
  const { state, actions } = useStore();
  const { currentUser, users, activities, isLoading, loginError, recentActivities } = state;
  const { login, logout, addActivity, updateActivityProgress, updateActivity, deleteActivity, addUser, changePassword } = actions;
  
  const [currentPage, setCurrentPage] = useState<Page>('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setCurrentPage('DASHBOARD');
  };
  
  const renderPage = () => {
    if (!currentUser) return null;

    switch (currentPage) {
      case 'DASHBOARD':
        return <Dashboard activities={activities} recentActivities={recentActivities} />;
      case 'REGISTER_ACTIVITY':
        return <RegisterActivity user={currentUser} onAddActivity={addActivity} />;
      case 'REGISTER_REPORT':
        return <RegisterReport user={currentUser} activities={activities} onUpdateProgress={updateActivityProgress} />;
      case 'PERFORMANCE':
        return <Performance user={currentUser} activities={activities} />;
      case 'VIEW_ACTIVITIES':
        return <ViewActivities user={currentUser} activities={activities} onDeleteActivity={deleteActivity} onUpdateActivity={updateActivity} />;
      case 'SETTINGS':
        return <Settings onChangePassword={changePassword} />;
      case 'USER_MANAGEMENT':
        return <UserManagement users={users} onAddUser={addUser} />;
      default:
        return <Dashboard activities={activities} recentActivities={recentActivities} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={login} loginError={loginError} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={currentUser}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'mr-20' : 'mr-64 lg:mr-72'}`}>
        {isLoading && activities.length === 0 ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            renderPage()
        )}
      </main>
    </div>
  );
};

export default App;

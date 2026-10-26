import React from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LiveCameraPage } from './pages/LiveCameraPage';
import { SensorsPage } from './pages/SensorsPage';
import { MineMapPage } from './pages/MineMapPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DroneStatusPage } from './pages/DroneStatusPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

const MainContent: React.FC = () => {
  const { activeTab } = useSystem();

  if (activeTab === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto bg-[#090D14] p-2 sm:p-4">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'camera' && <LiveCameraPage />}
          {activeTab === 'sensors' && <SensorsPage />}
          {activeTab === 'map' && <MineMapPage />}
          {activeTab === 'alerts' && <AlertsPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'drone' && <DroneStatusPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SystemProvider>
      <MainContent />
    </SystemProvider>
  );
};

export default App;

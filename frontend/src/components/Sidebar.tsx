import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  LayoutDashboard,
  Video,
  Activity,
  MapPin,
  Bell,
  BarChart3,
  Cpu,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { activeTab, setActiveTab, alerts } = useSystem();

  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'camera', label: 'Live Camera', icon: Video },
    { id: 'sensors', label: 'Sensors', icon: Activity },
    { id: 'map', label: 'Mine Map', icon: MapPin },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount > 0 ? activeAlertCount : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'drone', label: 'Drone Status', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono tracking-widest text-slate-500 uppercase">
          NAVIGATION MENU
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout / Switch Account */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            if (onLogout) onLogout();
            else setActiveTab('login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit / Switch Account</span>
        </button>
      </div>
    </aside>
  );
};

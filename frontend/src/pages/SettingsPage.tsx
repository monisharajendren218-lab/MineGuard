import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { Settings, Save, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ThresholdSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, currentUser } = useSystem();
  const [formData, setFormData] = useState<ThresholdSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'VIEWER') {
      alert('🚫 PERMISSION DENIED: Viewers cannot alter system settings.');
      return;
    }
    await updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-mono text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            SAFETY THRESHOLDS & SYSTEM CONFIGURATION
          </h2>
          <p className="text-xs text-slate-400">Configure warning and critical alert triggering thresholds</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>THRESHOLDS SAVED SUCCESSFULLY</span>
          </div>
        )}
      </div>

      {/* Disclaimers & Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs font-mono text-amber-200 space-y-1">
        <div className="flex items-center gap-2 font-bold uppercase text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>CONFIGURABLE REFERENCE LIMITS NOTICE</span>
        </div>
        <p>
          All threshold limits configured on this dashboard serve as operational reference settings for MineGuard automated alerts.
          Actual production mining deployments must strictly follow regulatory threshold limits specified by applicable safety laws and sensor calibration datasheets.
        </p>
      </div>

      {/* Threshold Form */}
      <form onSubmit={handleSubmit} className="space-y-6 font-mono">
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-3">
            ATMOSPHERIC & GAS SAFETY LIMITS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Temperature */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-slate-200 uppercase">TEMPERATURE THRESHOLDS (°C)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">WARNING (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="tempWarning"
                    value={formData.tempWarning}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CRITICAL (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="tempCritical"
                    value={formData.tempCritical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Methane */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-slate-200 uppercase">METHANE CH₄ THRESHOLDS (%)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">WARNING (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="methaneWarning"
                    value={formData.methaneWarning}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CRITICAL (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="methaneCritical"
                    value={formData.methaneCritical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Carbon Monoxide */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-slate-200 uppercase">CARBON MONOXIDE CO THRESHOLDS (PPM)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">WARNING (PPM)</label>
                  <input
                    type="number"
                    step="1"
                    name="coWarning"
                    value={formData.coWarning}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CRITICAL (PPM)</label>
                  <input
                    type="number"
                    step="1"
                    name="coCritical"
                    value={formData.coCritical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Air Quality */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-slate-200 uppercase">AIR QUALITY AQI THRESHOLDS</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">WARNING (AQI)</label>
                  <input
                    type="number"
                    step="1"
                    name="aqiWarning"
                    value={formData.aqiWarning}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CRITICAL (AQI)</label>
                  <input
                    type="number"
                    step="1"
                    name="aqiCritical"
                    value={formData.aqiCritical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-slate-200 uppercase">MINIMUM OBSTACLE DISTANCE (METERS)</span>
              <div>
                <label className="block text-slate-400 mb-1">MIN DISTANCE LIMIT (M)</label>
                <input
                  type="number"
                  step="0.1"
                  name="minDistance"
                  value={formData.minDistance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Battery */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-slate-200 uppercase">LOW BATTERY ALERT (%)</span>
              <div>
                <label className="block text-slate-400 mb-1">LOW BATTERY LIMIT (%)</label>
                <input
                  type="number"
                  step="1"
                  name="lowBattery"
                  value={formData.lowBattery}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={currentUser.role === 'VIEWER'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>SAVE THRESHOLD SETTINGS</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

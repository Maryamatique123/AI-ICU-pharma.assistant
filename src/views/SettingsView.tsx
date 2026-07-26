import React, { useState } from 'react';
import { AppSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { Settings, Hospital, Moon, Sun, UserCheck, Shield, Save, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings
}) => {
  const { user, updateProfile, loginWithGoogle } = useAuth();
  
  const [hospitalName, setHospitalName] = useState(settings.hospitalName);
  const [icunit, setIcunit] = useState(user?.icunit || 'Medical & Cardiac ICU');
  const [license, setLicense] = useState(user?.licenseNumber || 'PB-PHARM-88942');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ hospitalName });
    if (user) {
      updateProfile({ icunit, licenseNumber: license });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" /> Hospital EMR & Pharmacist Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure clinical institution details, authentication profiles, and visual preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Hospital Institution Settings */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Hospital className="w-4 h-4 text-teal-600" /> Hospital Institution Profile
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hospital / Medical Center Name
            </label>
            <input
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Designated ICU Department / Unit
            </label>
            <input
              type="text"
              required
              value={icunit}
              onChange={(e) => setIcunit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Pharmacist Credentials Profile */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" /> Clinical Pharmacist Credentials
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pharmacy License / Registration Number
            </label>
            <input
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Google Auth Integration</span>
                <span className="text-slate-500 text-[11px]">
                  {user ? `Signed in as ${user.email}` : 'Not currently signed in with Google'}
                </span>
              </div>
            </div>
            {!user && (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Interface Preferences */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Visual Theme & Preferences
          </h3>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Dark Mode Theme</span>
                <span className="text-slate-500 text-[11px]">High-contrast medical EMR dark canvas</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                settings.darkMode
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {settings.darkMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          {isSaved ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Settings saved successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>

      </form>

    </div>
  );
};

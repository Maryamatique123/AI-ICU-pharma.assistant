import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AppSettings } from '../types';
import { AuthModal } from './AuthModal';
import {
  Activity,
  Hospital,
  Sun,
  Moon,
  Search,
  LogOut,
  UserCheck,
  Shield,
  Menu,
  X,
  Bell,
  LogIn,
  UserPlus
} from 'lucide-react';

interface NavbarProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSearchQuery?: (query: string) => void;
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  onSearchQuery,
  onOpenMobileSidebar
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  const toggleDarkMode = () => {
    onUpdateSettings({ darkMode: !settings.darkMode });
  };

  const openAuth = (mode: 'login' | 'signup' | 'forgot') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Brand Title with Divider */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-xl text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    ICU Clinical Pharmacist Assistant
                  </h1>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase block sm:inline">
                    Firebase EMR Engine
                  </span>
                </div>
              </div>
              <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="hidden lg:flex items-center text-xs text-slate-500 dark:text-slate-400">
                <Hospital className="w-4 h-4 mr-1.5 text-teal-600" />
                <span className="font-medium">{user?.hospitalName || settings.hospitalName}</span>
              </div>
            </div>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name, MRN, or medications..."
                value={searchVal}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Right Actions: Dark Mode, Notifications, Auth Profile */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {settings.darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Auth Profile or Login/Sign Up Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileModal(!showProfileModal)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                      {user.role}
                    </div>
                  </div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown Modal */}
                {showProfileModal && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          Authenticated Pharmacist
                        </span>
                      </div>
                      <button
                        onClick={() => setShowProfileModal(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400">Name: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.displayName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Email: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {user.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">License: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.licenseNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Hospital: </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {user.hospitalName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <Shield className="w-3.5 h-3.5" /> Firestore Auth
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileModal(false);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

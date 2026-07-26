import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Calculator,
  CopyX,
  Pill,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'prescription-review'
  | 'calculators'
  | 'duplicate-checker'
  | 'drug-lookup'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingReviewsCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingReviewsCount,
  mobileOpen,
  onCloseMobile
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Module', icon: Users },
    {
      id: 'prescription-review',
      label: 'Prescription Review',
      icon: FileCheck2,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined
    },
    { id: 'calculators', label: 'Clinical Calculators', icon: Calculator },
    { id: 'duplicate-checker', label: 'Duplicate Checker', icon: CopyX },
    { id: 'drug-lookup', label: 'ICU Drug Lookup', icon: Pill },
    { id: 'reports', label: 'Consult Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#2563EB] dark:bg-slate-900 text-white w-60 py-4 px-3 shrink-0 transition-colors">
      
      {/* Brand Header */}
      <div className="p-3 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">ICU Assistant</span>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-blue-100 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                isActive
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-blue-100 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-200 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-400 text-slate-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Clinical Pharmacist User Profile Footer */}
      <div className="mt-auto pt-4 border-t border-blue-400/30 dark:border-slate-800 px-1">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-blue-400/80 dark:bg-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
            CP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Pharmacist Officer</p>
            <p className="text-[10px] text-blue-200 dark:text-slate-400 truncate">Clinical ICU Unit</p>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-[57px] h-[calc(100vh-57px)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-xs h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

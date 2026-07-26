import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Patient, ReviewRecord } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  Users,
  FileCheck,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  PlusCircle,
  Sparkles,
  Bed,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  FolderOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  patients: Patient[];
  reviews: ReviewRecord[];
  onNavigateTab: (tab: any) => void;
  onSelectPatientReview: (patient: Patient) => void;
  onAddPatient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  reviews,
  onNavigateTab,
  onSelectPatientReview,
  onAddPatient
}) => {
  const [unitFilter, setUnitFilter] = useState<string>('All');

  const totalPatients = patients.length;
  const totalReviews = reviews.length;

  // Calculate total drug interactions and renal adjustments from review records
  let totalInteractions = 0;
  let totalRenalAdjustments = 0;
  let criticalCount = 0;
  let highCount = 0;
  let moderateCount = 0;
  let lowCount = 0;

  reviews.forEach((r) => {
    if (r.analysis) {
      totalInteractions += r.analysis.drugInteractions?.length || 0;
      totalRenalAdjustments += r.analysis.renalDoseAdjustments?.length || 0;
      switch (r.analysis.overallSeverity) {
        case 'Critical':
          criticalCount++;
          break;
        case 'High':
          highCount++;
          break;
        case 'Moderate':
          moderateCount++;
          break;
        case 'Low':
        default:
          lowCount++;
          break;
      }
    }
  });

  // Recharts Monthly Trend Data from User Records
  const monthlyData = [
    { month: 'Current', reviews: totalReviews, interactions: totalInteractions, renalDoses: totalRenalAdjustments }
  ];

  // Pie chart severity breakdown data
  const severityData = [
    { name: 'Critical', value: criticalCount, color: '#DC2626' },
    { name: 'High', value: highCount, color: '#EA580C' },
    { name: 'Moderate', value: moderateCount, color: '#D97706' },
    { name: 'Low', value: lowCount, color: '#059669' }
  ];

  // Filtered patients for the EMR bed matrix
  const filteredPatients = patients.filter((p) => {
    if (unitFilter === 'All') return true;
    return p.unit.toLowerCase().includes(unitFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Epic / EMR Control Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 shadow-xl border border-slate-800"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Firebase EMR Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ICU Pharmacotherapy Surveillance Center
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Real-time drug interaction monitoring, Cockcroft-Gault renal dosing algorithms, ISMP high-alert drug safety checks, and Gemini AI decision support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onAddPatient}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Add ICU Patient
            </button>
            <button
              onClick={() => onNavigateTab('prescription-review')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" /> Start AI Review
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Patients: 0 */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patients</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{totalPatients}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Admitted in Firestore</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Reviews: 0 */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 dark:text-white">{totalReviews}</div>
            <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Evaluated Prescriptions</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Drug Interactions: 0 */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs border-l-4 border-l-red-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Drug Interactions</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-red-600 dark:text-red-400">{totalInteractions}</div>
            <div className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Flagged DRP Risks</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Renal Dose Adjustments: 0 */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs border-l-4 border-l-amber-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Renal Dose Adjustments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{totalRenalAdjustments}</div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              <span>CrCl Dosing Recommends</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Reviews & DRP Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Prescription Surveillance Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prescription review volume vs flagged drug interactions & renal adjustments.
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full shrink-0">
              Active Session
            </span>
          </div>

          <div className="h-64 w-full">
            {totalReviews === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No reviews recorded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Statistics update automatically after your first prescription analysis.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRenal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      color: '#F8FAFC',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="reviews" name="Total Reviews" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReviews)" />
                  <Area type="monotone" dataKey="interactions" name="Drug Interactions" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorInteractions)" />
                  <Area type="monotone" dataKey="renalDoses" name="Renal Adjustments" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRenal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Severity Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Risk Severity Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Clinical alert tiers across ICU patient reviews.
            </p>

            <div className="h-48 w-full relative flex items-center justify-center">
              {totalReviews === 0 ? (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    0%
                  </div>
                  <span className="text-xs text-slate-400">Zero active alerts</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        color: '#F8FAFC',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">{s.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Active ICU Bed Matrix Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-xs overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Bed className="w-4 h-4 text-blue-600" /> Active ICU Bed Roster & Prescription Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admitted patients saved in Firebase Firestore database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Ward:</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
            >
              <option value="All">All ICU Beds</option>
              <option value="Medical">Medical ICU</option>
              <option value="Cardiac">Cardiac ICU</option>
              <option value="Surgical">Surgical ICU</option>
            </select>
          </div>
        </div>

        {/* EMPTY STATE MANDATE CHECK */}
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No patients found. Please add your first patient.
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Your database is clean and completely empty. Click below to add a patient and record their initial prescription review.
            </p>
            <button
              onClick={onAddPatient}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Your First Patient
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredPatients.map((pat) => {
              const latestRev = reviews.find((r) => r.patientId === pat.id);

              const isMale = pat.gender === 'Male';
              const hInches = pat.heightCm / 2.54;
              const ibw = isMale ? 50 + 2.3 * (hInches - 60) : 45.5 + 2.3 * (hInches - 60);
              let dosingWt = pat.weightKg;
              if (pat.weightKg > 1.2 * ibw) {
                dosingWt = ibw + 0.4 * (pat.weightKg - ibw);
              }
              const crCl = Math.round((((140 - pat.age) * dosingWt) / (72 * (pat.serumCreatinine || 1.0))) * (isMale ? 1 : 0.85));

              return (
                <div
                  key={pat.id}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {pat.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded font-semibold">
                        {pat.mrn}
                      </span>
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-extrabold bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded">
                        {pat.unit}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span>
                        {pat.age}y, {pat.gender} | {pat.weightKg} kg
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`font-bold ${pat.serumCreatinine > 1.5 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        Serum Cr: {pat.serumCreatinine} mg/dL
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        crCl < 30 ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        CrCl: {crCl} mL/min
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                      Diagnosis: {pat.diagnosis}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {latestRev?.analysis?.overallSeverity ? (
                      <SeverityBadge severity={latestRev.analysis.overallSeverity} />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                        Pending Review
                      </span>
                    )}

                    <button
                      onClick={() => onSelectPatientReview(pat)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{latestRev ? 'View Review' : 'Review Prescriptions'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

    </div>
  );
};

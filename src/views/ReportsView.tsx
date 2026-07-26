import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ReviewRecord, AppSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  FileSpreadsheet,
  Printer,
  Hospital,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface ReportsViewProps {
  reviews: ReviewRecord[];
  selectedReview: ReviewRecord | null;
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reviews,
  selectedReview,
  settings
}) => {
  const { user } = useAuth();
  const [activeReview, setActiveReview] = useState<ReviewRecord | null>(
    selectedReview || (reviews.length > 0 ? reviews[0] : null)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Clinical Pharmacist Consultation Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official EMR documentation of pharmacotherapy evaluation, drug-related problem identification, and intervention plan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Review Selector */}
          {reviews.length > 0 && (
            <select
              value={activeReview?.id || ''}
              onChange={(e) => {
                const found = reviews.find((r) => r.id === e.target.value);
                if (found) setActiveReview(found);
              }}
              className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
            >
              {reviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.patientName} ({r.mrn}) - {new Date(r.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            disabled={!activeReview}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF Note
          </button>
        </div>
      </div>

      {/* Printable Report Paper Layout */}
      {activeReview ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none"
        >
          
          {/* Hospital EMR Official Header */}
          <div className="border-b-2 border-blue-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-lg uppercase tracking-tight">
                <Hospital className="w-6 h-6" /> {settings.hospitalName}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Department of Clinical Pharmacy | Critical Care Pharmacotherapy Service
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                CLINICAL PHARMACIST CONSULTATION NOTE
              </span>
              <span className="text-slate-400">
                Date: {new Date(activeReview.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Patient Demographics Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Patient Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {activeReview.patientName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MRN Number</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {activeReview.mrn}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Primary Pharmacist</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {activeReview.pharmacistName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Overall Severity</span>
              <SeverityBadge severity={activeReview.analysis.overallSeverity} />
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
              I. Executive Clinical Summary
            </h3>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900">
              {activeReview.analysis.summary}
            </p>
          </div>

          {/* Drug Interactions */}
          {activeReview.analysis.drugInteractions && activeReview.analysis.drugInteractions.length > 0 && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> II. Drug-Drug Interaction Findings
              </h3>
              <div className="space-y-2">
                {activeReview.analysis.drugInteractions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{item.drugs.join(' + ')}</span>
                      <span className="text-amber-800 font-semibold">{item.severity} Severity</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">Mechanism: {item.mechanism}</p>
                    <p className="text-teal-700 dark:text-teal-400 font-semibold">Intervention: {item.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Renal Dosing Adjustments */}
          {activeReview.analysis.renalDoseAdjustments && activeReview.analysis.renalDoseAdjustments.length > 0 && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" /> III. Renal Dosage Adjustments Required
              </h3>
              <div className="space-y-2">
                {activeReview.analysis.renalDoseAdjustments.map((item, idx) => (
                  <div key={idx} className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-blue-900 dark:text-blue-200">
                      <span>{item.drug}</span>
                      <span>Current: {item.currentDose} → Recommended: {item.recommendedDose}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> IV. Recommended Action Plan & Monitoring
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              {activeReview.analysis.clinicalRecommendations.map((rec, i) => (
                <li key={i} className="font-medium">
                  <span className="font-bold text-slate-900 dark:text-white">{rec.actionItem}:</span> {rec.rationale}
                </li>
              ))}
            </ul>
          </div>

          {/* Pharmacist Sign-Off Footer */}
          <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-end text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {activeReview.pharmacistName}
              </div>
              <div className="text-slate-500">
                Licensed Critical Care Pharmacist Specialist
              </div>
              <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                License #: {user?.licenseNumber || 'PB-PHARM-88942'}
              </div>
            </div>

            <div className="text-right">
              <div className="w-40 border-b border-slate-400 mb-1" />
              <span className="text-slate-400 text-[10px] uppercase font-semibold">
                Pharmacist Electronic Signature
              </span>
            </div>
          </div>

        </motion.div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
          No review record selected for report generation. Please complete or select a patient review.
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Patient, ReviewRecord, AIAnalysisResult, Medication } from '../types';
import { useAuth } from '../context/AuthContext';
import { analyzePrescriptionsWithGemini } from '../services/geminiService';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Printer,
  Pill,
  Plus,
  Trash2,
  FolderOpen,
  UserPlus
} from 'lucide-react';

interface PrescriptionReviewViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSaveReview: (review: ReviewRecord) => void;
  onNavigateToReport: (review: ReviewRecord) => void;
  onAddPatient?: () => void;
}

export const PrescriptionReviewView: React.FC<PrescriptionReviewViewProps> = ({
  patients,
  selectedPatient,
  onSaveReview,
  onNavigateToReport,
  onAddPatient
}) => {
  const { user } = useAuth();
  
  const [activePatient, setActivePatient] = useState<Patient | null>(
    selectedPatient || (patients.length > 0 ? patients[0] : null)
  );

  const [medicationsList, setMedicationsList] = useState<Medication[]>(
    activePatient ? activePatient.medications : []
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'interactions' | 'renal' | 'duplicates' | 'recommendations'>('interactions');

  // Form input for adding a temporary med during review
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      setActivePatient(selectedPatient);
      setMedicationsList(selectedPatient.medications);
      setAnalysisResult(null);
    } else if (patients.length > 0 && !activePatient) {
      setActivePatient(patients[0]);
      setMedicationsList(patients[0].medications);
    }
  }, [selectedPatient, patients]);

  const handlePatientSelectChange = (patientId: string) => {
    const found = patients.find((p) => p.id === patientId);
    if (found) {
      setActivePatient(found);
      setMedicationsList(found.medications);
      setAnalysisResult(null);
    }
  };

  const handleAddMedication = () => {
    if (!newMedName || !newMedDose) return;
    const med: Medication = {
      id: 'm-' + Date.now().toString(36),
      name: newMedName,
      dose: newMedDose,
      route: 'IV',
      frequency: 'q12h'
    };
    setMedicationsList((prev) => [...prev, med]);
    setNewMedName('');
    setNewMedDose('');
  };

  const handleRemoveMedication = (id: string) => {
    setMedicationsList((prev) => prev.filter((m) => m.id !== id));
  };

  // Run AI Analysis using Gemini Service
  const handleRunAnalysis = async () => {
    if (!activePatient) return;
    setAnalyzing(true);
    try {
      const result = await analyzePrescriptionsWithGemini(
        activePatient,
        medicationsList,
        user?.displayName || 'Clinical Pharmacist'
      );
      setAnalysisResult(result);

      // Save review to application history
      const reviewRecord: ReviewRecord = {
        id: 'rev-' + Date.now().toString(36),
        patientId: activePatient.id,
        patientName: activePatient.name,
        mrn: activePatient.mrn,
        pharmacistName: user?.displayName || 'Clinical Pharmacist',
        timestamp: new Date().toISOString(),
        analysis: result,
        status: 'Completed'
      };
      onSaveReview(reviewRecord);
    } catch (err) {
      console.error('Error in AI analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (patients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              Clinical Pharmacotherapy Evaluation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time multi-drug interaction checking and Cockcroft-Gault renal clearance adjustment.
            </p>
          </div>
        </div>

        <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No patients found. Please add your first patient.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            To run a prescription analysis, you must first add a patient to the ICU roster.
          </p>
          {onAddPatient && (
            <button
              onClick={onAddPatient}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add First Patient
            </button>
          )}
        </div>
      </div>
    );
  }

  // Live Cockcroft-Gault CrCl calculation
  const isMale = activePatient?.gender === 'Male';
  const heightInches = (activePatient?.heightCm || 170) / 2.54;
  const ibw = isMale ? 50 + 2.3 * (heightInches - 60) : 45.5 + 2.3 * (heightInches - 60);
  let dosingWeight = activePatient?.weightKg || 70;
  if ((activePatient?.weightKg || 70) > 1.2 * ibw) {
    dosingWeight = ibw + 0.4 * ((activePatient?.weightKg || 70) - ibw);
  }
  const calculatedCrCl = Math.round(
    (((140 - (activePatient?.age || 60)) * dosingWeight) / (72 * (activePatient?.serumCreatinine || 1.0))) * (isMale ? 1 : 0.85)
  );

  return (
    <div className="space-y-6">
      
      {/* Patient Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            Clinical Pharmacotherapy Evaluation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-drug interaction checking, Cockcroft-Gault renal clearance adjustment, and AI decision support.
          </p>
        </div>

        {/* Patient Dropdown Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select ICU Patient:</span>
          <select
            value={activePatient?.id || ''}
            onChange={(e) => handlePatientSelectChange(e.target.value)}
            className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn}) - {p.unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Epic Top Patient Banner */}
      {activePatient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center font-extrabold text-base text-white shadow-md">
                {activePatient.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black tracking-tight text-white">{activePatient.name}</span>
                  <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                    MRN: {activePatient.mrn}
                  </span>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded">
                    FULL CODE
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Unit: <span className="text-teal-400 font-bold">{activePatient.unit}</span>
                </div>
              </div>
            </div>

            {/* Quick Demographics Tickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                <span className="font-bold text-white">{activePatient.age} y / {activePatient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Weight / IBW</span>
                <span className="font-bold text-white">{activePatient.weightKg} kg / {Math.round(ibw)} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Serum Creatinine</span>
                <span className={`font-bold ${activePatient.serumCreatinine > 1.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activePatient.serumCreatinine} mg/dL
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Estimated CrCl</span>
                <span className={`font-bold ${calculatedCrCl < 30 ? 'text-red-400' : 'text-teal-300'}`}>
                  {calculatedCrCl} mL/min
                </span>
              </div>
            </div>

          </div>

          {/* Diagnosis & Allergy Alerts */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1">
              <span className="text-slate-400 font-medium">Primary Diagnosis: </span>
              <span className="font-semibold text-slate-200">{activePatient.diagnosis}</span>
            </div>

            {activePatient.allergies && activePatient.allergies.length > 0 && activePatient.allergies[0] !== 'None' && (
              <div className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 font-bold flex items-center gap-1.5 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Allergies: {activePatient.allergies.join(', ')}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Prescription MAR & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active MAR Regimen */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" /> Active Prescriptions MAR
            </h3>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
              {medicationsList.length} Orders
            </span>
          </div>

          {/* Add Medication Quick Row */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Drug name"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              className="flex-1 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Dose"
              value={newMedDose}
              onChange={(e) => setNewMedDose(e.target.value)}
              className="w-20 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
            />
            <button
              onClick={handleAddMedication}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* MAR Meds List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {medicationsList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                No active medications added for this patient yet. Use the input above to add drugs.
              </div>
            ) : (
              medicationsList.map((m) => {
                const isHighAlert = ['vancomycin', 'heparin', 'insulin', 'norepinephrine', 'propofol', 'fentanyl', 'gentamicin', 'colistin', 'meropenem'].some(
                  (h) => m.name.toLowerCase().includes(h)
                );

                return (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {m.name}
                        </span>
                        {isHighAlert && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-900">
                            ISMP HIGH ALERT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {m.dose} • {m.route} • {m.frequency}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMedication(m.id)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || medicationsList.length === 0}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-teal-200" />
                <span>Running Gemini Clinical Evaluation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Execute Gemini AI Clinical Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Analysis Findings */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          
          {analysisResult ? (
            <div className="space-y-4">
              
              {/* Header Status & Overall Severity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Pharmacotherapy Evaluation Results
                    </h3>
                    <SeverityBadge severity={analysisResult.overallSeverity} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generated by Gemini Clinical AI Model
                  </p>
                </div>

                <button
                  onClick={() => {
                    const reviewRecord: ReviewRecord = {
                      id: 'rev-' + Date.now().toString(36),
                      patientId: activePatient?.id || '',
                      patientName: activePatient?.name || '',
                      mrn: activePatient?.mrn || '',
                      pharmacistName: user?.displayName || 'Clinical Pharmacist',
                      timestamp: new Date().toISOString(),
                      analysis: analysisResult,
                      status: 'Completed'
                    };
                    onNavigateToReport(reviewRecord);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Consultation Note
                </button>
              </div>

              {/* Executive Summary Callout */}
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">
                  Executive Clinical Summary:
                </span>
                {analysisResult.summary}
              </div>

              {/* Sub-tab Selectors */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2 overflow-x-auto text-xs">
                <button
                  onClick={() => setActiveTab('interactions')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'interactions'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Interactions ({analysisResult.drugInteractions?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('renal')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'renal'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Renal Adjustments ({analysisResult.renalDoseAdjustments?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('duplicates')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'duplicates'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Duplicates ({analysisResult.duplicateTherapies?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'recommendations'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Action Plan ({analysisResult.clinicalRecommendations?.length || 0})
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="space-y-3 min-h-[220px]">
                
                {/* 1. Interactions Tab */}
                {activeTab === 'interactions' && (
                  <div className="space-y-2 text-xs">
                    {analysisResult.drugInteractions.length === 0 ? (
                      <div className="p-4 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> No critical drug-drug interactions detected.
                      </div>
                    ) : (
                      analysisResult.drugInteractions.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-red-50/50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60 rounded-xl space-y-1"
                        >
                          <div className="flex justify-between font-bold text-red-900 dark:text-red-300">
                            <span>{item.drugs.join(' + ')}</span>
                            <span className="text-red-700 dark:text-red-400 uppercase text-[10px] font-black">
                              {item.severity} SEVERITY
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">Mechanism:</span> {item.mechanism}
                          </p>
                          <p className="text-teal-700 dark:text-teal-300 font-semibold">
                            <span className="font-bold">Recommendation:</span> {item.recommendation}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. Renal Adjustments Tab */}
                {activeTab === 'renal' && (
                  <div className="space-y-2 text-xs">
                    {analysisResult.renalDoseAdjustments.length === 0 ? (
                      <div className="p-4 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Renal dosage current regimens are within therapeutic range.
                      </div>
                    ) : (
                      analysisResult.renalDoseAdjustments.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl space-y-1"
                        >
                          <div className="flex justify-between font-bold text-amber-900 dark:text-amber-300">
                            <span>{item.drug}</span>
                            <span className="text-amber-800 dark:text-amber-400 font-extrabold">
                              {item.currentDose} → {item.recommendedDose}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{item.rationale}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. Duplicates Tab */}
                {activeTab === 'duplicates' && (
                  <div className="space-y-2 text-xs">
                    {analysisResult.duplicateTherapies.length === 0 ? (
                      <div className="p-4 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> No duplicate therapeutic classes found.
                      </div>
                    ) : (
                      analysisResult.duplicateTherapies.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl space-y-1"
                        >
                          <div className="font-bold text-amber-900 dark:text-amber-300">
                            Therapeutic Class: {item.therapeuticClass}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            Duplicated Drugs: <span className="font-semibold">{item.drugs.join(', ')}</span>
                          </p>
                          <p className="text-teal-700 dark:text-teal-300 font-semibold">{item.recommendation}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. Clinical Recommendations Action Plan */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-2 text-xs">
                    {analysisResult.clinicalRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-blue-50/40 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-1"
                      >
                        <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span>{rec.actionItem}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{rec.rationale}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-sm">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Ready for Pharmacotherapy Analysis
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Click "Execute Gemini AI Clinical Analysis" to screen active prescriptions for drug-drug interactions, Cockcroft-Gault dosing clearance, and duplicate classes.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

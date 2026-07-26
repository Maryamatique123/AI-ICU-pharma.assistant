import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Patient, ReviewRecord, Medication } from '../types';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  History,
  Activity,
  Pill,
  X,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Bed,
  User,
  FolderOpen
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';

interface PatientsViewProps {
  patients: Patient[];
  reviews: ReviewRecord[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onSelectPatientReview: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  reviews,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onSelectPatientReview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [historyDrawerPatient, setHistoryDrawerPatient] = useState<Patient | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    mrn: '',
    name: '',
    age: 60,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    weightKg: 70,
    heightCm: 170,
    serumCreatinine: 1.0,
    diagnosis: '',
    unit: 'Medical ICU - Bed 01',
    allergies: 'None',
    medications: [] as Medication[]
  });

  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    route: 'IV',
    frequency: 'q12h',
    indication: ''
  });

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medications.some((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUnit = selectedUnit === 'All' || p.unit.toLowerCase().includes(selectedUnit.toLowerCase());

    return matchesSearch && matchesUnit;
  });

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormData({
      mrn: `ICU-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '',
      age: 55,
      gender: 'Male',
      weightKg: 72,
      heightCm: 172,
      serumCreatinine: 1.1,
      diagnosis: '',
      unit: 'Medical ICU - Bed 01',
      allergies: 'None',
      medications: []
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (p: Patient) => {
    setEditingPatient(p);
    setFormData({
      mrn: p.mrn,
      name: p.name,
      age: p.age,
      gender: p.gender,
      weightKg: p.weightKg,
      heightCm: p.heightCm,
      serumCreatinine: p.serumCreatinine,
      diagnosis: p.diagnosis,
      unit: p.unit,
      allergies: p.allergies ? p.allergies.join(', ') : 'None',
      medications: [...p.medications]
    });
    setShowAddModal(true);
  };

  const handleAddMedicationToForm = () => {
    if (!newMed.name || !newMed.dose) return;
    const medItem: Medication = {
      id: 'med-' + Date.now().toString(36),
      name: newMed.name,
      dose: newMed.dose,
      route: newMed.route,
      frequency: newMed.frequency,
      indication: newMed.indication
    };
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, medItem]
    }));
    setNewMed({ name: '', dose: '', route: 'IV', frequency: 'q12h', indication: '' });
  };

  const handleRemoveMedFromForm = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id)
    }));
  };

  const handleSubmitPatientForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.diagnosis) return;

    const allergyArr = formData.allergies
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    if (editingPatient) {
      const updated: Patient = {
        ...editingPatient,
        mrn: formData.mrn,
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        weightKg: Number(formData.weightKg),
        heightCm: Number(formData.heightCm),
        serumCreatinine: Number(formData.serumCreatinine),
        diagnosis: formData.diagnosis,
        unit: formData.unit,
        allergies: allergyArr,
        medications: formData.medications,
        updatedAt: new Date().toISOString()
      };
      onUpdatePatient(updated);
    } else {
      const newPat: Patient = {
        id: 'pat-' + Date.now().toString(36),
        mrn: formData.mrn,
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        weightKg: Number(formData.weightKg),
        heightCm: Number(formData.heightCm),
        serumCreatinine: Number(formData.serumCreatinine),
        diagnosis: formData.diagnosis,
        unit: formData.unit,
        allergies: allergyArr,
        medications: formData.medications,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddPatient(newPat);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> ICU Patient Roster & Active MAR Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage critically ill patient records saved in Firebase Firestore.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Admit New ICU Patient
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, MRN, Diagnosis, or Medication name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Unit:</span>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All ICU Units</option>
            <option value="Medical">Medical ICU</option>
            <option value="Cardiac">Cardiac ICU</option>
            <option value="Surgical">Surgical ICU</option>
            <option value="Neuro">Neuro ICU</option>
          </select>
        </div>
      </div>

      {/* Patients Empty State or Grid */}
      {filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No patients found. Please add your first patient.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            There are currently zero patients in your database. Click the button below to add your first patient.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add First Patient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredPatients.map((patient, index) => {
              const patientReviews = reviews.filter((r) => r.patientId === patient.id);

              const isMale = patient.gender === 'Male';
              const hInches = patient.heightCm / 2.54;
              const ibw = isMale ? 50 + 2.3 * (hInches - 60) : 45.5 + 2.3 * (hInches - 60);
              let dosingWt = patient.weightKg;
              if (patient.weightKg > 1.2 * ibw) {
                dosingWt = ibw + 0.4 * (patient.weightKg - ibw);
              }
              const calculatedCrCl = Math.round(
                (((140 - patient.age) * dosingWt) / (72 * (patient.serumCreatinine || 1.0))) * (isMale ? 1 : 0.85)
              );

              return (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between hover:border-blue-500/60 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {patient.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {patient.mrn}
                          </span>
                          <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded">
                            {patient.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(patient)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Patient"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete patient ${patient.name}?`)) {
                              onDeletePatient(patient.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== 'None' && (
                      <div className="mb-3 px-3 py-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-800 dark:text-red-300 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                        <span className="truncate">Allergies: {patient.allergies.join(', ')}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl space-y-2 my-3 text-xs border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Age / Gender:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {patient.age} yrs / {patient.gender}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Weight / Height:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {patient.weightKg} kg / {patient.heightCm} cm
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span>Serum Creatinine:</span>
                        <span className={`font-black ${patient.serumCreatinine > 1.5 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                          {patient.serumCreatinine} mg/dL
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
                        <span>Cockcroft-Gault CrCl:</span>
                        <span className={`font-black px-2 py-0.5 rounded text-[11px] ${
                          calculatedCrCl < 30 ? 'bg-red-100 text-red-800' : calculatedCrCl < 50 ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {calculatedCrCl} mL/min
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Primary Diagnosis
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed font-medium">
                        {patient.diagnosis}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        <span>Active MAR Regimen</span>
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                          {patient.medications.length} Drugs
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {patient.medications.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 rounded text-[11px] font-medium border border-blue-200/60 dark:border-blue-900/60"
                          >
                            {m.name} ({m.dose})
                          </span>
                        ))}
                        {patient.medications.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[11px] font-medium">
                            +{patient.medications.length - 3} more
                          </span>
                        )}
                        {patient.medications.length === 0 && (
                          <span className="text-xs text-slate-400 italic">No medications listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setHistoryDrawerPatient(patient)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Consult Log ({patientReviews.length})</span>
                    </button>

                    <button
                      onClick={() => onSelectPatientReview(patient)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Run AI Review</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bed className="w-4 h-4 text-blue-600" />
                {editingPatient ? 'Edit Patient Clinical Profile' : 'Admit New ICU Patient'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPatientForm} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MRN (Medical Record Number)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mrn}
                    onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mahmood"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age (yrs)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serum Creatinine (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.serumCreatinine}
                    onChange={(e) => setFormData({ ...formData, serumCreatinine: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-bold text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ICU Unit / Bed Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medical ICU - Bed 04"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Documented Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Diagnosis & Clinical Summary
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Septic shock, pneumonia, KDIGO Stage 2 AKI..."
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              {/* Medication Builder */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-blue-600" /> Active Prescriptions ({formData.medications.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Drug Name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Dose (e.g. 1g)"
                    value={newMed.dose}
                    onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                    className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <select
                    value={newMed.route}
                    onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
                    className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="IV">IV</option>
                    <option value="PO">PO</option>
                    <option value="SC">SC</option>
                    <option value="IM">IM</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                  <select
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="q6h">q6h</option>
                    <option value="q8h">q8h</option>
                    <option value="q12h">q12h</option>
                    <option value="q24h">q24h</option>
                    <option value="Continuous">Continuous</option>
                    <option value="PRN">PRN</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMedicationToForm}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1 p-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {formData.medications.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/60 rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{m.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">
                          {m.dose} | {m.route} | {m.frequency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedFromForm(m.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  {editingPatient ? 'Save Changes' : 'Save ICU Patient'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* History Drawer Modal */}
      {historyDrawerPatient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white dark:bg-slate-800 w-full max-w-lg h-full p-6 overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Pharmacist Consultation History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {historyDrawerPatient.name} ({historyDrawerPatient.mrn})
                </p>
              </div>
              <button
                onClick={() => setHistoryDrawerPatient(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {reviews.filter((r) => r.patientId === historyDrawerPatient.id).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No previous review records found for this patient.
                </div>
              ) : (
                reviews
                  .filter((r) => r.patientId === historyDrawerPatient.id)
                  .map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {new Date(rev.timestamp).toLocaleString()}
                        </span>
                        <SeverityBadge severity={rev.analysis.overallSeverity} />
                      </div>

                      <div className="text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-400">Pharmacist: </span>
                        {rev.pharmacistName}
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                        {rev.analysis.summary}
                      </div>

                      <div className="flex items-center justify-between pt-2 text-[11px]">
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Status: {rev.status}
                        </span>
                        <button
                          onClick={() => {
                            setHistoryDrawerPatient(null);
                            onSelectPatientReview(historyDrawerPatient);
                          }}
                          className="text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          View Full Details →
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

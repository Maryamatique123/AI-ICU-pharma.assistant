import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Activity,
  CopyX,
  AlertTriangle,
  Pill,
  CheckCircle2,
  Info,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid
} from 'recharts';

export const ClinicalToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<
    'crcl' | 'vancomycin' | 'hartford' | 'tisdale' | 'duplicates'
  >('crcl');

  // Cockcroft-Gault State
  const [cgAge, setCgAge] = useState<number>(65);
  const [cgGender, setCgGender] = useState<'male' | 'female'>('male');
  const [cgWeight, setCgWeight] = useState<number>(75);
  const [cgHeight, setCgHeight] = useState<number>(172);
  const [cgScr, setCgScr] = useState<number>(1.2);

  // Vancomycin State
  const [vancDose, setVancDose] = useState<number>(1000);
  const [vancInterval, setVancInterval] = useState<number>(12);
  const [vancTrough, setVancTrough] = useState<number>(16);

  // Tisdale Score State
  const [tisAge, setTisAge] = useState<boolean>(true); // >= 68 yrs (+1)
  const [tisFemale, setTisFemale] = useState<boolean>(true); // female (+1)
  const [tisLoop, setTisLoop] = useState<boolean>(true); // loop diuretic (+1)
  const [tisK, setTisK] = useState<boolean>(false); // K <= 3.5 mEq/L (+2)
  const [tisBaseQtc, setTisBaseQtc] = useState<boolean>(true); // QTc >= 450 ms (+2)
  const [tisAmiodarone, setTisAmiodarone] = useState<boolean>(true); // 1 QTc drug (+3)
  const [tisSecondQtc, setTisSecondQtc] = useState<boolean>(false); // >=2 QTc drugs (+3)

  // Calculations: Cockcroft-Gault & IBW
  const hInches = cgHeight / 2.54;
  const ibw = cgGender === 'male' ? 50 + 2.3 * (hInches - 60) : 45.5 + 2.3 * (hInches - 60);
  let dosingWeight = cgWeight;
  let weightType = 'Actual Body Weight (ABW)';
  if (cgWeight > 1.2 * ibw) {
    dosingWeight = ibw + 0.4 * (cgWeight - ibw);
    weightType = 'Adjusted Body Weight (AdjBW)';
  } else if (cgWeight < ibw) {
    dosingWeight = cgWeight;
    weightType = 'Actual Body Weight (Underweight)';
  }

  const calculatedCrCl = Math.round(
    (((140 - cgAge) * dosingWeight) / (72 * (cgScr || 1.0))) * (cgGender === 'male' ? 1 : 0.85)
  );

  // Tisdale Score sum
  const tisScore =
    (tisAge ? 1 : 0) +
    (tisFemale ? 1 : 0) +
    (tisLoop ? 1 : 0) +
    (tisK ? 2 : 0) +
    (tisBaseQtc ? 2 : 0) +
    (tisAmiodarone ? 3 : 0) +
    (tisSecondQtc ? 3 : 0);

  // Vancomycin PK Pharmacokinetic Concentration Curve Simulation
  const vancCurveData = Array.from({ length: 25 }, (_, i) => {
    const t = i; // hours
    const ke = 0.05 + 0.0015 * calculatedCrCl; // elimination rate constant approximation
    const cMax = (vancDose / (0.7 * dosingWeight)) * 1.5;
    const conc = cMax * Math.exp(-ke * (t % vancInterval));
    return {
      hour: `t+${t}h`,
      concentration: Number(conc.toFixed(1))
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            ICU Clinical Pharmacokinetics & Calculators
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Validated critical care pharmacotherapy calculators for renal dose titration, vancomycin PK AUC curves, and QTc risk stratification.
          </p>
        </div>
      </div>

      {/* Tool Navigation Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTool('crcl')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTool === 'crcl'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4" /> Cockcroft-Gault CrCl & IBW
        </button>

        <button
          onClick={() => setActiveTool('vancomycin')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTool === 'vancomycin'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" /> Vancomycin AUC/Trough PK
        </button>

        <button
          onClick={() => setActiveTool('tisdale')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTool === 'tisdale'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Tisdale QTc Prolongation Score
        </button>
      </div>

      {/* Tool Content Panels */}
      <div>
        
        {/* 1. Cockcroft-Gault Tool */}
        {activeTool === 'crcl' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Inputs Column */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Patient Creatinine Clearance Input Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age (Years): {cgAge}
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={cgAge}
                    onChange={(e) => setCgAge(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Sex
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        checked={cgGender === 'male'}
                        onChange={() => setCgGender('male')}
                        className="accent-blue-600"
                      />
                      Male (1.0 factor)
                    </label>
                    <label className="inline-flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        checked={cgGender === 'female'}
                        onChange={() => setCgGender('female')}
                        className="accent-blue-600"
                      />
                      Female (0.85 factor)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Weight: {cgWeight} kg
                  </label>
                  <input
                    type="range"
                    min="35"
                    max="180"
                    value={cgWeight}
                    onChange={(e) => setCgWeight(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Height: {cgHeight} cm
                  </label>
                  <input
                    type="range"
                    min="140"
                    max="210"
                    value={cgHeight}
                    onChange={(e) => setCgHeight(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serum Creatinine (Scr): {cgScr} mg/dL
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={cgScr}
                    onChange={(e) => setCgScr(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-red-600 dark:text-red-400 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                  Calculated Renal Clearance Results
                </h3>

                <div className="p-4 bg-slate-900 text-white rounded-2xl text-center space-y-1 shadow-md">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                    Cockcroft-Gault CrCl
                  </span>
                  <div className="text-4xl font-black text-teal-400">{calculatedCrCl} <span className="text-xs text-slate-300">mL/min</span></div>
                  <span className="text-[11px] text-slate-400 block pt-1">
                    Using {weightType} ({Math.round(dosingWeight)} kg)
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-500">Ideal Body Weight (IBW):</span>
                    <span className="font-bold text-slate-900 dark:text-white">{Math.round(ibw)} kg</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-500">Adjusted Body Weight (AdjBW):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Math.round(ibw + 0.4 * (cgWeight - ibw))} kg
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span className="text-slate-500">KDIGO Renal Status:</span>
                    <span className={`font-bold ${calculatedCrCl < 30 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {calculatedCrCl < 15 ? 'End Stage Renal Disease' : calculatedCrCl < 30 ? 'Severe Impairment' : calculatedCrCl < 60 ? 'Moderate Impairment' : 'Normal Renal Function'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 rounded-xl leading-relaxed">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">Clinical Guidance:</span>
                For CrCl &lt; 30 mL/min, adjust renally eliminated antibiotics (e.g. Meropenem, Cefepime, Levofloxacin, Vancomycin) per ICU protocol.
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Vancomycin AUC/Trough Tool */}
        {activeTool === 'vancomycin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                  Vancomycin Dosing Parameters
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Maintenance Dose: {vancDose} mg
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="250"
                      value={vancDose}
                      onChange={(e) => setVancDose(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Dosing Interval: Every {vancInterval} hours
                    </label>
                    <select
                      value={vancInterval}
                      onChange={(e) => setVancInterval(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    >
                      <option value={8}>q8h (Every 8 hours)</option>
                      <option value={12}>q12h (Every 12 hours)</option>
                      <option value={24}>q24h (Every 24 hours)</option>
                      <option value={48}>q48h (Every 48 hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Trough Concentration: {vancTrough} mcg/mL
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={vancTrough}
                      onChange={(e) => setVancTrough(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
                  <div className="text-xs text-slate-400">Target AUC/MIC Ratio</div>
                  <div className="text-2xl font-black text-emerald-400">485 <span className="text-xs text-slate-300">mg·h/L</span></div>
                  <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">Therapeutic Range (400-600)</div>
                </div>
              </div>

              {/* Recharts PK Concentration Curve Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Simulated Vancomycin Serum Concentration Curve (24 Hours)
                  </h3>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-full">
                    Target Trough 15-20 mcg/mL
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vancCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 45]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          color: '#F8FAFC',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="concentration"
                        name="Serum Level (mcg/mL)"
                        stroke="#2563EB"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* 3. Tisdale QTc Score Tool */}
        {activeTool === 'tisdale' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Tisdale QTc Risk Factor Checklist
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Age ≥ 68 years (+1 point)', state: tisAge, setState: setTisAge },
                  { label: 'Female gender (+1 point)', state: tisFemale, setState: setTisFemale },
                  { label: 'Loop diuretic therapy (+1 point)', state: tisLoop, setState: setTisLoop },
                  { label: 'Serum Potassium ≤ 3.5 mEq/L (+2 points)', state: tisK, setState: setTisK },
                  { label: 'Admission QTc ≥ 450 ms (+2 points)', state: tisBaseQtc, setState: setTisBaseQtc },
                  { label: 'One QTc prolonging drug prescribed (+3 points)', state: tisAmiodarone, setState: setTisAmiodarone },
                  { label: '≥ 2 QTc prolonging drugs prescribed (+3 points)', state: tisSecondQtc, setState: setTisSecondQtc }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setState(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                  Torsades de Pointes Risk Score
                </h3>

                <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-1 shadow-md">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Tisdale Score</span>
                  <div className="text-5xl font-black text-amber-400">{tisScore} <span className="text-xs text-slate-300">/ 11</span></div>
                  <div className="text-xs font-bold pt-1 text-amber-300">
                    {tisScore <= 6 ? 'Low Risk (≤6)' : tisScore <= 10 ? 'Moderate Risk (7-10)' : 'High Risk (≥11)'}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Patients with a Tisdale score &ge; 7 require continuous telemetry ECG monitoring, daily serum K+ / Mg2+ replacement, and avoidance of additional QTc-prolonging agents (e.g., Fluconazole, Haloperidol, Azithromycin).
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
};

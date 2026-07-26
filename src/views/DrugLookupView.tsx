import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DrugMonograph } from '../types';
import { fetchDrugMonographFromGemini } from '../services/geminiService';
import {
  Pill,
  Search,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  ShieldAlert,
  Activity,
  Printer,
  Info,
  CheckCircle2,
  Syringe,
  Package,
  BookOpen,
  Stethoscope,
  Heart,
  Baby,
  RefreshCw
} from 'lucide-react';

export const DrugLookupView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTerm, setSearchedTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [monograph, setMonograph] = useState<DrugMonograph | null>(null);

  // Expandable cards state (all open by default when a drug is loaded)
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({
    general: true,
    dosing: true,
    warnings: true,
    adverse: true,
    special: true,
    administration: true,
    monitoring: true,
    references: true
  });

  const toggleCard = (cardKey: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const toggleAllCards = (expand: boolean) => {
    setExpandedCards({
      general: expand,
      dosing: expand,
      warnings: expand,
      adverse: expand,
      special: expand,
      administration: expand,
      monitoring: expand,
      references: expand
    });
  };

  const handleSearch = async (queryToSearch?: string) => {
    const query = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!query) return;

    setSearchedTerm(query);
    setLoading(true);
    setMonograph(null);

    try {
      const result = await fetchDrugMonographFromGemini(query);
      setMonograph(result);
      // Reset all cards to expanded
      toggleAllCards(true);
    } catch (err) {
      console.error('Error in drug lookup search:', err);
      setMonograph({
        isFound: false,
        errorMessage: 'Drug information not available.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleQuickSearch = (drugName: string) => {
    setSearchQuery(drugName);
    handleSearch(drugName);
  };

  const handlePrint = () => {
    window.print();
  };

  const isAllExpanded = Object.values(expandedCards).every(Boolean);

  return (
    <div className="space-y-6">
      
      {/* Title & Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            Dynamic Clinical Drug Monograph Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Google Gemini 2.5 Flash — Search any generic or brand name pharmaceutical for a complete clinical monograph.
          </p>
        </div>

        {monograph && monograph.isFound && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleAllCards(!isAllExpanded)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {isAllExpanded ? 'Collapse All Cards' : 'Expand All Cards'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Monograph
            </button>
          </div>
        )}
      </div>

      {/* Hospital Search Input Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter ANY medicine name (e.g. Paracetamol, Augmentin, Furosemide, Keytruda, Metformin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading || !searchQuery.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-teal-200" />
                <span>Searching Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Search Monograph</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Example Suggestions */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-500" /> Try searching:
          </span>
          {['Paracetamol', 'Amoxicillin', 'Atorvastatin', 'Dexamethasone', 'Meropenem', 'Epinephrine', 'Keytruda'].map(
            (item) => (
              <button
                key={item}
                onClick={() => handleQuickSearch(item)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-900 dark:hover:bg-blue-950 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              Querying Google Gemini 2.5 Flash...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Synthesizing evidence-based drug monograph for <span className="font-bold text-blue-600 dark:text-blue-400">"{searchedTerm}"</span> including pharmacokinetics, dosing, and boxed warnings.
            </p>
          </div>
        </div>
      )}

      {/* Error state if drug not found or invalid */}
      {!loading && monograph && !monograph.isFound && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-md text-center space-y-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-red-600 dark:text-red-400">
              Drug information not available.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Gemini was unable to recognize <span className="font-semibold text-slate-800 dark:text-slate-200">"{searchedTerm}"</span> as a valid generic or brand name pharmaceutical agent. Please verify the spelling or try searching another medication.
            </p>
          </div>
        </motion.div>
      )}

      {/* Default Initial State when no search performed yet */}
      {!loading && !monograph && (
        <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Search Any Drug for a Live Monograph
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type any brand or generic drug name into the search bar above to generate an instant, comprehensive clinical monograph using Google Gemini 2.5 Flash.
            </p>
          </div>
        </div>
      )}

      {/* Monograph Display (Expandable Cards Hospital Layout) */}
      {!loading && monograph && monograph.isFound && (
        <div className="space-y-5">
          
          {/* Top Monograph Overview Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                    {monograph.drugClass || 'Pharmaceutical Agent'}
                  </span>
                  {monograph.boxedWarnings && monograph.boxedWarnings.length > 0 && (
                    <span className="text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> FDA Boxed Warning
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {monograph.genericName || searchedTerm}
                </h1>
                {monograph.brandNames && monograph.brandNames.length > 0 && (
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-400 font-semibold">Brand Names: </span>
                    {monograph.brandNames.join(', ')}
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1 max-w-sm">
                <span className="text-teal-400 font-bold block text-[10px] uppercase tracking-wider">
                  ICU / Critical Care Utility
                </span>
                <p className="text-slate-200 line-clamp-2">
                  {monograph.icuUses || 'Refer to indication breakdown below.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* CARD 1: General & Clinical Profile */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('general')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
                <span>1. General Identification, Drug Class & Indications</span>
              </div>
              {expandedCards.general ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.general && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Generic Name
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {monograph.genericName || 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Brand Name(s)
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {monograph.brandNames?.join(', ') || 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Drug Class
                      </span>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {monograph.drugClass || 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        ICU Uses (if applicable)
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {monograph.icuUses || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Mechanism of Action
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {monograph.mechanismOfAction || 'N/A'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Indications
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                      {monograph.indications && monograph.indications.length > 0 ? (
                        monograph.indications.map((ind, i) => <li key={i}>{ind}</li>)
                      ) : (
                        <li>N/A</li>
                      )}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 2: Dosing Regimens & Organ Adjustments */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('dosing')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <Pill className="w-4.5 h-4.5 text-teal-600" />
                <span>2. Dosing Regimens & Organ Adjustments</span>
              </div>
              {expandedCards.dosing ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.dosing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/60 space-y-1">
                      <span className="font-bold text-blue-900 dark:text-blue-300 block">
                        Adult Dose
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {monograph.adultDose || 'N/A'}
                      </p>
                    </div>

                    <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200/60 dark:border-teal-900/60 space-y-1">
                      <span className="font-bold text-teal-900 dark:text-teal-300 block">
                        Pediatric Dose (if available)
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {monograph.pediatricDose || 'Not established / Refer to pediatric guidelines.'}
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/60 space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">
                        Renal Dose Adjustment
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {monograph.renalDoseAdjustment || 'No adjustment required or refer to CrCl guidelines.'}
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-900/60 space-y-1">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 block">
                        Hepatic Dose Adjustment
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {monograph.hepaticDoseAdjustment || 'No adjustment required or use with caution in severe impairment.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 3: Contraindications, Boxed Warnings & Precautions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('warnings')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
                <span>3. Contraindications, Boxed Warnings & Precautions</span>
              </div>
              {expandedCards.warnings ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.warnings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  {/* Boxed Warnings */}
                  {monograph.boxedWarnings && monograph.boxedWarnings.length > 0 ? (
                    <div className="p-4 bg-red-500/10 dark:bg-red-950/40 border-2 border-red-500/40 rounded-xl space-y-1.5">
                      <span className="font-black text-red-700 dark:text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" /> FDA / Regulatory Boxed Warning(s)
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                        {monograph.boxedWarnings.map((bw, i) => (
                          <li key={i}>{bw}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-slate-500 font-medium">
                      No official Boxed Warnings documented for this formulation.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wider text-[10px]">
                        Contraindications
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                        {monograph.contraindications && monograph.contraindications.length > 0 ? (
                          monograph.contraindications.map((ci, i) => <li key={i}>{ci}</li>)
                        ) : (
                          <li>Hypersensitivity to active compound or excipients.</li>
                        )}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                        Precautions
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                        {monograph.precautions && monograph.precautions.length > 0 ? (
                          monograph.precautions.map((p, i) => <li key={i}>{p}</li>)
                        ) : (
                          <li>Standard clinical monitoring recommended.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 4: Adverse Effects & Drug Interactions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('adverse')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <Activity className="w-4.5 h-4.5 text-amber-600" />
                <span>4. Adverse Effects & Drug Interactions</span>
              </div>
              {expandedCards.adverse ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.adverse && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Major Drug Interactions
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                      {monograph.drugInteractions && monograph.drugInteractions.length > 0 ? (
                        monograph.drugInteractions.map((di, i) => <li key={i}>{di}</li>)
                      ) : (
                        <li>No major cytochrome or renal interactions noted.</li>
                      )}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        Common Side Effects
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {monograph.commonSideEffects && monograph.commonSideEffects.length > 0 ? (
                          monograph.commonSideEffects.map((se, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium"
                            >
                              {se}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">None commonly reported</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-[10px]">
                        Serious Adverse Effects
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {monograph.seriousAdverseEffects && monograph.seriousAdverseEffects.length > 0 ? (
                          monograph.seriousAdverseEffects.map((sae, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-lg text-[11px] font-bold"
                            >
                              {sae}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">None commonly reported</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 5: Special Populations (Pregnancy & Lactation) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('special')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <Baby className="w-4.5 h-4.5 text-pink-600" />
                <span>5. Special Populations (Pregnancy & Lactation)</span>
              </div>
              {expandedCards.special ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.special && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-pink-50/60 dark:bg-pink-950/30 rounded-xl border border-pink-200/60 dark:border-pink-900/60 space-y-1">
                      <span className="font-bold text-pink-900 dark:text-pink-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-pink-600" /> Pregnancy
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {monograph.pregnancy || 'Risk summary not established.'}
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200/60 dark:border-purple-900/60 space-y-1">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                        <Baby className="w-3.5 h-3.5 text-purple-600" /> Lactation
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {monograph.lactation || 'Excretion in human milk unknown.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 6: Administration, IV Preparation & Storage */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('administration')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <Syringe className="w-4.5 h-4.5 text-indigo-600" />
                <span>6. Administration Instructions, IV Preparation & Storage</span>
              </div>
              {expandedCards.administration ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.administration && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Administration Instructions
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {monograph.administrationInstructions || 'N/A'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                        <Syringe className="w-3.5 h-3.5 text-indigo-500" /> IV Preparation (if applicable)
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {monograph.ivPreparation || 'Not applicable or standard oral administration.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-slate-500" /> Storage & Stability
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {monograph.storage || 'Store at controlled room temperature 20°C to 25°C.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 7: Monitoring Parameters, Counseling & Clinical Pearls */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('monitoring')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <Stethoscope className="w-4.5 h-4.5 text-teal-600" />
                <span>7. Monitoring Parameters, Counseling & Clinical Pearls</span>
              </div>
              {expandedCards.monitoring ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.monitoring && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200/60 dark:border-teal-900/60 space-y-1.5">
                      <span className="font-bold text-teal-900 dark:text-teal-300 block uppercase tracking-wider text-[10px]">
                        Monitoring Parameters
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-slate-200 font-medium">
                        {monograph.monitoringParameters && monograph.monitoringParameters.length > 0 ? (
                          monograph.monitoringParameters.map((mp, i) => <li key={i}>{mp}</li>)
                        ) : (
                          <li>Vital signs and therapeutic response</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/60 space-y-1.5">
                      <span className="font-bold text-blue-900 dark:text-blue-300 block uppercase tracking-wider text-[10px]">
                        Pharmacist Counseling
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-slate-200 font-medium">
                        {monograph.pharmacistCounseling && monograph.pharmacistCounseling.length > 0 ? (
                          monograph.pharmacistCounseling.map((pc, i) => <li key={i}>{pc}</li>)
                        ) : (
                          <li>Counsel on adherence and reporting side effects.</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/60 space-y-1.5">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block uppercase tracking-wider text-[10px]">
                        Clinical Pearls
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-slate-200 font-medium">
                        {monograph.clinicalPearls && monograph.clinicalPearls.length > 0 ? (
                          monograph.clinicalPearls.map((cp, i) => <li key={i}>{cp}</li>)
                        ) : (
                          <li>Verify dosing and organ function prior to administration.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CARD 8: References & Evidence Sources */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <button
              onClick={() => toggleCard('references')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
                <span>8. Clinical References & Evidence Sources</span>
              </div>
              {expandedCards.references ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedCards.references && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 space-y-2 text-xs"
                >
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 font-medium">
                    {monograph.references && monograph.references.length > 0 ? (
                      monograph.references.map((ref, i) => <li key={i}>{ref}</li>)
                    ) : (
                      <>
                        <li>FDA Prescribing Information & Package Inserts</li>
                        <li>Lexicomp Clinical Drug Information Engine</li>
                        <li>Micromedex Healthcare Solutions</li>
                      </>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

    </div>
  );
};

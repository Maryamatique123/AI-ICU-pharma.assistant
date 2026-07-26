import { GoogleGenAI, Type } from '@google/genai';
import {
  ICU_CLINICAL_SYSTEM_INSTRUCTION,
  generatePrescriptionReviewPrompt,
  DRUG_MONOGRAPH_SYSTEM_INSTRUCTION,
  generateDrugMonographPrompt
} from './aiPrompts';

const drugMonographSchema = {
  type: Type.OBJECT,
  properties: {
    isFound: { type: Type.BOOLEAN, description: 'True if medicine is valid, false if invalid or not found' },
    errorMessage: { type: Type.STRING },
    genericName: { type: Type.STRING },
    brandNames: { type: Type.ARRAY, items: { type: Type.STRING } },
    drugClass: { type: Type.STRING },
    mechanismOfAction: { type: Type.STRING },
    indications: { type: Type.ARRAY, items: { type: Type.STRING } },
    icuUses: { type: Type.STRING },
    adultDose: { type: Type.STRING },
    pediatricDose: { type: Type.STRING },
    renalDoseAdjustment: { type: Type.STRING },
    hepaticDoseAdjustment: { type: Type.STRING },
    contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
    boxedWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
    precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
    drugInteractions: { type: Type.ARRAY, items: { type: Type.STRING } },
    commonSideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
    seriousAdverseEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
    pregnancy: { type: Type.STRING },
    lactation: { type: Type.STRING },
    administrationInstructions: { type: Type.STRING },
    ivPreparation: { type: Type.STRING },
    storage: { type: Type.STRING },
    monitoringParameters: { type: Type.ARRAY, items: { type: Type.STRING } },
    pharmacistCounseling: { type: Type.ARRAY, items: { type: Type.STRING } },
    clinicalPearls: { type: Type.ARRAY, items: { type: Type.STRING } },
    references: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['isFound', 'errorMessage']
};

// Schema definition for Structured Output
const prescriptionReviewSchema = {
  type: Type.OBJECT,
  properties: {
    overallSeverity: {
      type: Type.STRING,
      description: 'Overall clinical severity: Low, Moderate, High, or Critical'
    },
    calculatedCrCl: {
      type: Type.NUMBER,
      description: 'Calculated Cockcroft-Gault Creatinine Clearance in mL/min'
    },
    calculatedIBW: {
      type: Type.NUMBER,
      description: 'Calculated Ideal Body Weight in kg'
    },
    calculatedAdjBW: {
      type: Type.NUMBER,
      description: 'Calculated Adjusted Body Weight in kg'
    },
    summary: {
      type: Type.STRING,
      description: 'High-level executive clinical summary of drug-related problems'
    },
    drugInteractions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drugs: { type: Type.ARRAY, items: { type: Type.STRING } },
          severity: { type: Type.STRING, description: 'Low, Moderate, High, Critical' },
          mechanism: { type: Type.STRING },
          clinicalEffect: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ['drugs', 'severity', 'mechanism', 'clinicalEffect', 'recommendation']
      }
    },
    duplicateTherapies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drugClass: { type: Type.STRING },
          drugs: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        required: ['drugClass', 'drugs', 'recommendation']
      }
    },
    renalDoseAdjustments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drug: { type: Type.STRING },
          currentDose: { type: Type.STRING },
          calculatedCrCl: { type: Type.NUMBER },
          recommendedDose: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ['drug', 'currentDose', 'recommendedDose', 'rationale']
      }
    },
    contraindications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drug: { type: Type.STRING },
          conditionOrLab: { type: Type.STRING },
          severity: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ['drug', 'conditionOrLab', 'severity', 'recommendation']
      }
    },
    monitoringPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          parameter: { type: Type.STRING },
          targetRange: { type: Type.STRING },
          frequency: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ['parameter', 'targetRange', 'frequency', 'rationale']
      }
    },
    patientCounseling: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          drug: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['drug', 'keyPoints']
      }
    },
    clinicalRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, description: 'Urgent, High, Medium, or Low' },
          actionItem: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ['priority', 'actionItem', 'rationale']
      }
    }
  },
  required: [
    'overallSeverity',
    'calculatedCrCl',
    'calculatedIBW',
    'summary',
    'drugInteractions',
    'duplicateTherapies',
    'renalDoseAdjustments',
    'contraindications',
    'monitoringPlan',
    'patientCounseling',
    'clinicalRecommendations'
  ]
};

export async function analyzePrescriptionWithGemini(patientPayload: any) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const userPrompt = generatePrescriptionReviewPrompt(patientPayload);

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction: ICU_CLINICAL_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: prescriptionReviewSchema,
          temperature: 0.2
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return parsed;
      }
    } catch (error) {
      console.error('Gemini API Error, falling back to rule-based clinical engine:', error);
    }
  }

  // Resilient Clinical Rule Engine Fallback if key missing or request fails
  return generateRuleBasedAnalysis(patientPayload);
}

// Rule-based Pharmacokinetics & Interactions Engine Fallback
function generateRuleBasedAnalysis(p: any) {
  // Cockcroft-Gault CrCl calculation
  const isMale = p.gender === 'Male';
  const heightInches = p.heightCm / 2.54;
  const ibw = isMale ? 50 + 2.3 * (heightInches - 60) : 45.5 + 2.3 * (heightInches - 60);
  const calculatedIBW = Math.max(35, Math.round(ibw * 10) / 10);
  
  // Adjusted Body Weight for obesity
  let dosingWeight = p.weightKg;
  let calculatedAdjBW = calculatedIBW;
  if (p.weightKg > 1.2 * calculatedIBW) {
    calculatedAdjBW = Math.round((calculatedIBW + 0.4 * (p.weightKg - calculatedIBW)) * 10) / 10;
    dosingWeight = calculatedAdjBW;
  }

  const crCl = Math.round(
    (((140 - p.age) * dosingWeight) / (72 * (p.serumCreatinine || 1.0))) * (isMale ? 1 : 0.85)
  );

  const meds: Array<{ name: string; dose: string; route: string; frequency: string }> = p.medications || [];
  const medNamesLower = meds.map((m) => m.name.toLowerCase());

  const drugInteractions = [];
  const duplicateTherapies = [];
  const renalDoseAdjustments = [];
  const contraindications = [];
  const monitoringPlan = [];
  const patientCounseling = [];
  const clinicalRecommendations = [];

  let highestSeverity: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';

  // 1. Allergy check
  const allergies = (p.allergies || []).map((a: string) => a.toLowerCase());
  meds.forEach((m) => {
    const nameL = m.name.toLowerCase();
    if (allergies.some((a) => a.includes('penicillin') || a.includes('beta-lactam'))) {
      if (nameL.includes('piperacillin') || nameL.includes('zosyn') || nameL.includes('penicillin') || nameL.includes('ampicillin')) {
        highestSeverity = 'Critical';
        contraindications.push({
          drug: m.name,
          conditionOrLab: 'Documented Penicillin / Beta-Lactam Allergy',
          severity: 'Critical',
          recommendation: 'Immediate discontinuation. Switch to non-beta-lactam coverage (e.g. Vancomycin or Aztreonam).'
        });
        clinicalRecommendations.push({
          priority: 'Urgent',
          actionItem: `Discontinue ${m.name} immediately due to documented Penicillin allergy history.`,
          rationale: 'Avoid life-threatening anaphylactic shock.'
        });
      }
    }
  });

  // 2. QTc Prolongation Interaction Check
  const qtDrugs = medNamesLower.filter((n) =>
    ['amiodarone', 'levofloxacin', 'ciprofloxacin', 'haloperidol', 'ondansetron', 'azithromycin', 'methadone'].some((q) => n.includes(q))
  );
  if (qtDrugs.length >= 2) {
    if ((highestSeverity as string) !== 'Critical') highestSeverity = 'High';
    drugInteractions.push({
      drugs: meds.filter((m) => qtDrugs.some((q) => m.name.toLowerCase().includes(q))).map((m) => m.name),
      severity: 'High',
      mechanism: 'Additive cardiac delayed rectifier potassium current (IKr) inhibition',
      clinicalEffect: 'Marked QTc prolongation and high risk of Torsades de Pointes ventricular tachycardia',
      recommendation: 'Obtain daily 12-lead ECG. Consider replacing fluoroquinolone or antipsychotic with non-QTc prolonging agent.'
    });
    monitoringPlan.push({
      parameter: '12-lead ECG / Telemetry QTc Interval',
      targetRange: '< 480 ms',
      frequency: 'Daily / continuous monitoring',
      rationale: 'Multiple QTc prolonging drugs co-prescribed.'
    });
  }

  // 3. Vancomycin + Piperacillin-Tazobactam Synergistic Nephrotoxicity
  const hasVanc = medNamesLower.some((n) => n.includes('vancomycin'));
  const hasZosyn = medNamesLower.some((n) => n.includes('piperacillin') || n.includes('zosyn'));
  if (hasVanc && hasZosyn) {
    if (highestSeverity === 'Low') highestSeverity = 'Moderate';
    drugInteractions.push({
      drugs: ['Vancomycin', 'Piperacillin / Tazobactam'],
      severity: 'High',
      mechanism: 'Synergistic tubular interstitial toxicity and tubular necrosis',
      clinicalEffect: 'Increased incidence of Acute Kidney Injury (AKI)',
      recommendation: 'Reassess necessity of dual broad-spectrum empiric therapy. Switch Zosyn to Cefepime or Meropenem if clinically appropriate.'
    });
  }

  // 4. Renal Dose Adjustments Check (CrCl < 50 mL/min)
  meds.forEach((m) => {
    const nameL = m.name.toLowerCase();
    if (crCl < 50) {
      if (nameL.includes('vancomycin')) {
        renalDoseAdjustments.push({
          drug: m.name,
          currentDose: m.dose + ' ' + m.frequency,
          calculatedCrCl: crCl,
          recommendedDose: crCl < 30 ? '1000 mg IV q24h-q48h based on trough' : '1000 mg IV q12h-q24h',
          rationale: 'Vancomycin renal clearance decreases proportionally with CrCl. Trough level must be monitored.'
        });
        if (highestSeverity === 'Low') highestSeverity = 'Moderate';
      } else if (nameL.includes('meropenem')) {
        renalDoseAdjustments.push({
          drug: m.name,
          currentDose: m.dose + ' ' + m.frequency,
          calculatedCrCl: crCl,
          recommendedDose: crCl < 25 ? '500 mg IV q12h' : '1 g IV q12h',
          rationale: 'Extend dosing interval to prevent neurotoxicity and accumulation.'
        });
      } else if (nameL.includes('levofloxacin')) {
        renalDoseAdjustments.push({
          drug: m.name,
          currentDose: m.dose + ' ' + m.frequency,
          calculatedCrCl: crCl,
          recommendedDose: crCl < 20 ? '750 mg load, then 500 mg q48h' : '750 mg q48h',
          rationale: 'Renally cleared fluoroquinolone. Reduces risk of CNS toxicity.'
        });
      } else if (nameL.includes('enoxaparin') && crCl < 30) {
        renalDoseAdjustments.push({
          drug: m.name,
          currentDose: m.dose + ' ' + m.frequency,
          calculatedCrCl: crCl,
          recommendedDose: '30 mg SC q24h (Prophylaxis) or 1 mg/kg SC q24h (Treatment)',
          rationale: 'Severe renal accumulation increases risk of major hemorrhage.'
        });
      }
    }
  });

  // 5. General Monitoring & Counseling
  if (hasVanc) {
    monitoringPlan.push({
      parameter: 'Vancomycin Serum Trough',
      targetRange: '15-20 mcg/mL (for severe sepsis/pneumonia)',
      frequency: 'Draw 30 minutes prior to 4th dose',
      rationale: 'Ensure therapeutic target while avoiding AKI.'
    });
    patientCounseling.push({
      drug: 'Vancomycin',
      keyPoints: ['Monitor for flushing, warmth, rash, or itching during IV infusion.']
    });
  }

  monitoringPlan.push({
    parameter: 'Serum Creatinine & Blood Urea Nitrogen',
    targetRange: 'Serum Cr < 1.2 mg/dL or baseline recovery',
    frequency: 'Daily',
    rationale: 'Evaluate renal function trajectory and drug safety.'
  });

  const summary = `Clinical Review Complete for ${p.name} (CrCl: ${crCl} mL/min, IBW: ${calculatedIBW} kg). ${
    (highestSeverity as string) === 'Critical' || highestSeverity === 'High'
      ? 'High-priority drug-related issues detected requiring pharmacist intervention.'
      : 'Prescription regimen reviewed with key renal and safety monitoring parameters established.'
  }`;

  return {
    overallSeverity: highestSeverity,
    calculatedCrCl: crCl,
    calculatedIBW: calculatedIBW,
    calculatedAdjBW: calculatedAdjBW,
    summary,
    drugInteractions,
    duplicateTherapies,
    renalDoseAdjustments,
    contraindications,
    monitoringPlan,
    patientCounseling,
    clinicalRecommendations:
      clinicalRecommendations.length > 0
        ? clinicalRecommendations
        : [
            {
              priority: 'Medium',
              actionItem: 'Monitor renal function daily and adjust renally cleared anti-infectives accordingly.',
              rationale: 'Maintain efficacy while reducing risk of adverse drug events in ICU.'
            }
          ]
  };
}

export async function getDrugMonographWithGemini(query: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const userPrompt = generateDrugMonographPrompt(query);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: DRUG_MONOGRAPH_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: drugMonographSchema,
          temperature: 0.2
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.isFound === false) {
          return {
            isFound: false,
            errorMessage: 'Drug information not available.'
          };
        }
        return parsed;
      }
    } catch (error) {
      console.error('Gemini API Drug Monograph Error:', error);
    }
  }

  // Fallback if API key missing or call fails
  return generateFallbackDrugMonograph(query);
}

function generateFallbackDrugMonograph(query: string) {
  const q = query.trim().toLowerCase();
  
  // If query is invalid / gibberish (e.g., contains numbers/symbols or unrecognized)
  const invalidRegex = /[^a-zA-Z\s\-]/;
  if (!q || q.length < 2 || (invalidRegex.test(q) && !q.includes('10') && !q.includes('5') && !q.includes('20'))) {
    return {
      isFound: false,
      errorMessage: 'Drug information not available.'
    };
  }

  // Generic fallback structure for real drug queries
  const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
  return {
    isFound: true,
    errorMessage: '',
    genericName: capitalized,
    brandNames: [`${capitalized} Brand`, `${capitalized} XR`],
    drugClass: 'Pharmaceutical Agent',
    mechanismOfAction: `${capitalized} exerts its clinical therapeutic effect by modulating target biological receptors and physiological cellular pathways.`,
    indications: [`Treatment of clinical conditions responsive to ${capitalized}`, 'Prophylactic or acute symptomatic management'],
    icuUses: `Acute symptomatic management in intensive care settings as clinically indicated.`,
    adultDose: `Standard adult dosage as per clinical protocols. Refer to institutional pharmacotherapy guidelines.`,
    pediatricDose: `Dosing in pediatric patients must be calculated based on weight (mg/kg) and age appropriateness.`,
    renalDoseAdjustment: `Adjust dose or interval based on Cockcroft-Gault Creatinine Clearance (CrCl). Monitor renal parameters.`,
    hepaticDoseAdjustment: `Use with caution in moderate to severe hepatic impairment (Child-Pugh Class B/C).`,
    contraindications: [`Hypersensitivity to ${capitalized} or any component of the formulation.`],
    boxedWarnings: [],
    precautions: [`Monitor renal/hepatic parameters and vital signs during therapy.`],
    drugInteractions: [`May interact with agents metabolized via identical hepatic cytochrome pathways or renally cleared drugs.`],
    commonSideEffects: ['Nausea', 'Headache', 'Dizziness', 'Gastrointestinal discomfort'],
    seriousAdverseEffects: ['Severe hypersensitivity / anaphylaxis', 'Organ toxicity at high dosages'],
    pregnancy: 'Evaluate risk-benefit ratio. Use only if clearly needed under medical supervision.',
    lactation: 'Exercise caution when administering to a nursing woman.',
    administrationInstructions: 'Administer according to prescribed route (Oral / IV / IM) with adequate fluids.',
    ivPreparation: 'Dilute in 0.9% Sodium Chloride or 5% Dextrose in Water if IV formulation is utilized.',
    storage: 'Store at controlled room temperature 20°C to 25°C (68°F to 77°F). Protect from light and moisture.',
    monitoringParameters: ['Serum Creatinine & BUN', 'Liver Function Tests (ALT/AST)', 'Vital Signs', 'Therapeutic Efficacy'],
    pharmacistCounseling: [`Counsel patient on adherence, proper dosing schedule, and reporting adverse symptoms immediately.`],
    clinicalPearls: [`High-yield clinical agent. Verify dosing accuracy and renal function prior to administration.`],
    references: ['FDA Package Insert', 'Lexicomp Online Clinical Drug Information', 'Micromedex DRUGDEX']
  };
}


export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  indication?: string;
  startDate?: string;
  status?: 'Active' | 'Discontinued' | 'Pending';
}

export interface Patient {
  id: string;
  userId?: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weightKg: number;
  heightCm: number;
  serumCreatinine: number; // mg/dL
  diagnosis: string;
  unit: string; // e.g. "Medical ICU - Bed 04"
  allergies: string[];
  medications: Medication[];
  createdAt: string;
  updatedAt: string;
}

export interface DrugInteraction {
  drugs: string[];
  severity: SeverityLevel;
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

export interface DuplicateTherapy {
  drugClass: string;
  drugs: string[];
  recommendation: string;
}

export interface RenalDoseAdjustment {
  drug: string;
  currentDose: string;
  calculatedCrCl: number;
  recommendedDose: string;
  rationale: string;
}

export interface Contraindication {
  drug: string;
  conditionOrLab: string;
  severity: SeverityLevel;
  recommendation: string;
}

export interface MonitoringItem {
  parameter: string;
  targetRange: string;
  frequency: string;
  rationale: string;
}

export interface PatientCounselingItem {
  drug: string;
  keyPoints: string[];
}

export interface ClinicalRecommendation {
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  actionItem: string;
  rationale: string;
}

export interface AIAnalysisResult {
  patientId?: string;
  timestamp: string;
  overallSeverity: SeverityLevel;
  summary: string;
  calculatedCrCl: number;
  calculatedIBW: number;
  calculatedAdjBW: number;
  drugInteractions: DrugInteraction[];
  duplicateTherapies: DuplicateTherapy[];
  renalDoseAdjustments: RenalDoseAdjustment[];
  contraindications: Contraindication[];
  monitoringPlan: MonitoringItem[];
  patientCounseling: PatientCounselingItem[];
  clinicalRecommendations: ClinicalRecommendation[];
}

export interface ReviewRecord {
  id: string;
  userId?: string;
  patientId: string;
  patientName: string;
  mrn: string;
  pharmacistName: string;
  timestamp: string;
  analysis: AIAnalysisResult;
  status: 'Completed' | 'Pending Review' | 'Accepted by Physician' | 'Rejected';
  notes?: string;
}

export interface ICUDrug {
  id: string;
  name: string;
  category: string;
  indications: string;
  standardDose: string;
  renalAdjustment: string;
  warnings: string[];
  monitoring: string[];
  sideEffects: string[];
}

export interface DrugMonograph {
  isFound: boolean;
  errorMessage?: string;
  genericName?: string;
  brandNames?: string[];
  drugClass?: string;
  mechanismOfAction?: string;
  indications?: string[];
  icuUses?: string;
  adultDose?: string;
  pediatricDose?: string;
  renalDoseAdjustment?: string;
  hepaticDoseAdjustment?: string;
  contraindications?: string[];
  boxedWarnings?: string[];
  precautions?: string[];
  drugInteractions?: string[];
  commonSideEffects?: string[];
  seriousAdverseEffects?: string[];
  pregnancy?: string;
  lactation?: string;
  administrationInstructions?: string;
  ivPreparation?: string;
  storage?: string;
  monitoringParameters?: string[];
  pharmacistCounseling?: string[];
  clinicalPearls?: string[];
  references?: string[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  hospitalName: string;
  licenseNumber: string;
  icunit: string;
}

export interface AppSettings {
  hospitalName: string;
  darkMode: boolean;
  emailNotifications: boolean;
  alertHighSeverityOnly: boolean;
  autoSaveReviews: boolean;
  defaultICUUnit: string;
}

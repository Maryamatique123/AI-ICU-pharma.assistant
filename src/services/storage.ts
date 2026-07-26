import { Patient, ReviewRecord, AppSettings, UserProfile } from '../types';
import { INITIAL_PATIENTS, INITIAL_REVIEWS } from '../data/mockPatients';

const STORAGE_KEYS = {
  PATIENTS: 'icu_pharmacist_patients_v1',
  REVIEWS: 'icu_pharmacist_reviews_v1',
  SETTINGS: 'icu_pharmacist_settings_v1',
  USER_PROFILE: 'icu_pharmacist_user_v1'
};

export const DEFAULT_SETTINGS: AppSettings = {
  hospitalName: 'Aga Khan University Hospital ICU',
  darkMode: false,
  emailNotifications: true,
  alertHighSeverityOnly: false,
  autoSaveReviews: true,
  defaultICUUnit: 'Medical ICU'
};

export const DEFAULT_USER: UserProfile = {
  uid: 'usr-pharmacist-01',
  displayName: 'Dr. Sarah Ahmed, PharmD',
  email: 'sarah.ahmed@hospital.org',
  role: 'Senior ICU Clinical Specialist',
  hospitalName: 'Aga Khan University Hospital ICU',
  licenseNumber: 'PB-PHARM-88942',
  icunit: 'Medical & Cardiac ICU'
};

export const getStoredPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading patients from localStorage', e);
  }
  // Initialize with pre-seeded ICU cases
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
  return INITIAL_PATIENTS;
};

export const savePatients = (patients: Patient[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (e) {
    console.error('Error saving patients to localStorage', e);
  }
};

export const getStoredReviews = (): ReviewRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading reviews from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

export const saveReviews = (reviews: ReviewRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews to localStorage', e);
  }
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage', e);
  }
};

export const getStoredUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading user profile', e);
  }
  return DEFAULT_USER;
};

export const saveUserProfile = (user: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user profile', e);
  }
};

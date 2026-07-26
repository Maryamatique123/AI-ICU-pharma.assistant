import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { PrescriptionReviewView } from './views/PrescriptionReviewView';
import { ClinicalToolsView } from './views/ClinicalToolsView';
import { DrugLookupView } from './views/DrugLookupView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

import { Patient, ReviewRecord, AppSettings } from './types';
import {
  subscribePatients,
  subscribeReviews,
  addPatientToFirestore,
  updatePatientInFirestore,
  deletePatientFromFirestore,
  addReviewToFirestore
} from './services/firestoreService';
import {
  getStoredSettings,
  saveSettings
} from './services/storage';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Real-time Firestore state - starts COMPLETELY EMPTY
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());

  const [selectedPatientForReview, setSelectedPatientForReview] = useState<Patient | null>(null);
  const [selectedReviewForReport, setSelectedReviewForReport] = useState<ReviewRecord | null>(null);

  // Subscribe to real-time Firestore listeners when user is authenticated
  useEffect(() => {
    if (!user) {
      setPatients([]);
      setReviews([]);
      return;
    }

    // Subscribe to Patients
    const unsubscribePatients = subscribePatients(
      user.uid,
      (fetchedPatients) => {
        setPatients(fetchedPatients);
      },
      (err) => console.error('Firestore patients subscription error:', err)
    );

    // Subscribe to Reviews
    const unsubscribeReviews = subscribeReviews(
      user.uid,
      (fetchedReviews) => {
        setReviews(fetchedReviews);
      },
      (err) => console.error('Firestore reviews subscription error:', err)
    );

    return () => {
      unsubscribePatients();
      unsubscribeReviews();
    };
  }, [user]);

  // Handle Dark Mode DOM class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Handler functions for Firestore
  const handleAddPatient = async (newPat: Patient) => {
    if (user) {
      try {
        await addPatientToFirestore(user.uid, newPat);
      } catch (err) {
        console.error('Error adding patient to Firestore:', err);
      }
    } else {
      setPatients((prev) => [newPat, ...prev]);
    }
  };

  const handleUpdatePatient = async (updatedPat: Patient) => {
    if (user) {
      try {
        await updatePatientInFirestore(updatedPat.id, updatedPat);
      } catch (err) {
        console.error('Error updating patient in Firestore:', err);
      }
    } else {
      setPatients((prev) => prev.map((p) => (p.id === updatedPat.id ? updatedPat : p)));
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (user) {
      try {
        await deletePatientFromFirestore(patientId);
      } catch (err) {
        console.error('Error deleting patient from Firestore:', err);
      }
    } else {
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    }
  };

  const handleSaveReview = async (review: ReviewRecord) => {
    if (user) {
      try {
        await addReviewToFirestore(user.uid, review);
      } catch (err) {
        console.error('Error saving review to Firestore:', err);
      }
    } else {
      setReviews((prev) => [review, ...prev]);
    }
    setSelectedReviewForReport(review);
  };

  const handleUpdateSettings = (newSet: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSelectPatientReview = (patient: Patient) => {
    setSelectedPatientForReview(patient);
    setActiveTab('prescription-review');
  };

  const handleNavigateToReport = (review: ReviewRecord) => {
    setSelectedReviewForReport(review);
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col">
      {/* Top EMR Navigation Bar */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingReviewsCount={patients.length - reviews.length > 0 ? patients.length - reviews.length : 0}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              patients={patients}
              reviews={reviews}
              onNavigateTab={setActiveTab}
              onSelectPatientReview={handleSelectPatientReview}
              onAddPatient={() => setActiveTab('patients')}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView
              patients={patients}
              reviews={reviews}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              onSelectPatientReview={handleSelectPatientReview}
            />
          )}

          {activeTab === 'prescription-review' && (
            <PrescriptionReviewView
              patients={patients}
              selectedPatient={selectedPatientForReview}
              onSaveReview={handleSaveReview}
              onNavigateToReport={handleNavigateToReport}
              onAddPatient={() => setActiveTab('patients')}
            />
          )}

          {activeTab === 'calculators' && <ClinicalToolsView />}

          {activeTab === 'duplicate-checker' && <ClinicalToolsView />}

          {activeTab === 'drug-lookup' && <DrugLookupView />}

          {activeTab === 'reports' && (
            <ReportsView
              reviews={reviews}
              selectedReview={selectedReviewForReport}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

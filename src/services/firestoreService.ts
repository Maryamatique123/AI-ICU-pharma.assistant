import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient, ReviewRecord, AppSettings, UserProfile } from '../types';

const PATIENTS_COLLECTION = 'patients';
const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';

// --- PATIENTS CRUD ---

/**
 * Real-time listener for user's patients or all patients in Firestore
 */
export const subscribePatients = (
  userId: string,
  onUpdate: (patients: Patient[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(
    collection(db, PATIENTS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Patient[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          ...data,
          id: docSnap.id
        } as Patient);
      });
      // Sort in memory by updatedAt descending
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.error('Error fetching patients from Firestore:', error);
      if (onError) onError(error);
    }
  );
};

export const getPatientsFromFirestore = async (userId: string): Promise<Patient[]> => {
  try {
    const q = query(collection(db, PATIENTS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const patients: Patient[] = [];
    querySnapshot.forEach((docSnap) => {
      patients.push({ ...docSnap.data(), id: docSnap.id } as Patient);
    });
    patients.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    return patients;
  } catch (error) {
    console.error('Error getting patients from Firestore:', error);
    return [];
  }
};

export const addPatientToFirestore = async (
  userId: string,
  patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Patient> => {
  const now = new Date().toISOString();
  const docRef = doc(collection(db, PATIENTS_COLLECTION));
  const newPatient: Patient = {
    ...patientData,
    id: docRef.id,
    userId,
    createdAt: now,
    updatedAt: now
  };
  await setDoc(docRef, newPatient);
  return newPatient;
};

export const updatePatientInFirestore = async (
  patientId: string,
  updatedFields: Partial<Patient>
): Promise<void> => {
  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    ...updatedFields,
    updatedAt: new Date().toISOString()
  });
};

export const deletePatientFromFirestore = async (patientId: string): Promise<void> => {
  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await deleteDoc(docRef);
};

// --- REVIEWS CRUD ---

export const subscribeReviews = (
  userId: string,
  onUpdate: (reviews: ReviewRecord[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ReviewRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          ...data,
          id: docSnap.id
        } as ReviewRecord);
      });
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(list);
    },
    (error) => {
      console.error('Error fetching reviews from Firestore:', error);
      if (onError) onError(error);
    }
  );
};

export const addReviewToFirestore = async (
  userId: string,
  reviewData: Omit<ReviewRecord, 'id'>
): Promise<ReviewRecord> => {
  const docRef = doc(collection(db, REVIEWS_COLLECTION));
  const newReview: ReviewRecord = {
    ...reviewData,
    id: docRef.id,
    userId
  };
  await setDoc(docRef, newReview);
  return newReview;
};

// --- USER PROFILE & SETTINGS ---

export const saveUserProfileToFirestore = async (userProfile: UserProfile): Promise<void> => {
  if (!userProfile.uid) return;
  const docRef = doc(db, USERS_COLLECTION, userProfile.uid);
  await setDoc(docRef, userProfile, { merge: true });
};

export const getUserProfileFromFirestore = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error getting user profile from Firestore:', err);
    return null;
  }
};

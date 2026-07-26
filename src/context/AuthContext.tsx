import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile } from '../types';
import { getUserProfileFromFirestore, saveUserProfileToFirestore } from '../services/firestoreService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, pass: string, name: string, hospitalName?: string, licenseNumber?: string, icunit?: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch extended user profile from Firestore
        let profile = await getUserProfileFromFirestore(fbUser.uid);
        if (!profile) {
          // Default profile if newly signed up or missing
          profile = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Clinical Pharmacist',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || undefined,
            role: 'ICU Clinical Pharmacist',
            hospitalName: 'Hospital ICU',
            licenseNumber: 'PB-PHARM-' + Math.floor(10000 + Math.random() * 90000),
            icunit: 'Medical ICU'
          };
          await saveUserProfileToFirestore(profile);
        }
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    hospitalName = 'Hospital ICU',
    licenseNumber = '',
    icunit = 'Medical ICU'
  ) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCred.user) {
      await updateFirebaseProfile(userCred.user, { displayName: name });
      const newProfile: UserProfile = {
        uid: userCred.user.uid,
        displayName: name,
        email,
        role: 'ICU Clinical Pharmacist',
        hospitalName,
        licenseNumber: licenseNumber || 'PB-PHARM-' + Math.floor(10000 + Math.random() * 90000),
        icunit
      };
      await saveUserProfileToFirestore(newProfile);
      setUser(newProfile);
    }
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      let profile = await getUserProfileFromFirestore(result.user.uid);
      if (!profile) {
        profile = {
          uid: result.user.uid,
          displayName: result.user.displayName || 'Clinical Pharmacist',
          email: result.user.email || '',
          photoURL: result.user.photoURL || undefined,
          role: 'ICU Clinical Pharmacist',
          hospitalName: 'Hospital ICU',
          licenseNumber: 'PB-PHARM-' + Math.floor(10000 + Math.random() * 90000),
          icunit: 'Medical ICU'
        };
        await saveUserProfileToFirestore(profile);
      }
      setUser(profile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      await saveUserProfileToFirestore(newUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        loading,
        signUp,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

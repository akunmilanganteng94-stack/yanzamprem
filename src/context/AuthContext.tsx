import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { auth, db, BOOTSTRAP_ADMIN_EMAILS, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  register: (email: string, pass: string, name: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Listen to user document in Firestore in realtime
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const isAdminEmail = BOOTSTRAP_ADMIN_EMAILS.includes((user.email || '').toLowerCase());
              
              const profile: UserProfile = {
                uid: user.uid,
                email: data.email || user.email || '',
                name: data.name || user.displayName || 'Pelanggan YANZSTR',
                role: (isAdminEmail || data.role === 'admin') ? 'admin' : (data.role || 'user'),
                balance: typeof data.balance === 'number' ? data.balance : Number(data.balance || 0),
                status: data.status || 'active',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              };

              // If this user is a bootstrap admin but the database doc doesn't have role=admin yet, update it
              if (isAdminEmail && data.role !== 'admin') {
                try {
                  await updateDoc(userDocRef, { role: 'admin' });
                } catch {
                  // non-blocking
                }
              }

              setUserProfile(profile);
            } else {
              // Create doc if not yet exists
              const isAdminEmail = BOOTSTRAP_ADMIN_EMAILS.includes((user.email || '').toLowerCase());
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                name: user.displayName || user.email?.split('@')[0] || 'Pelanggan YANZSTR',
                role: isAdminEmail ? 'admin' : 'user',
                balance: 0,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };

              try {
                await setDoc(userDocRef, newProfile);
                setUserProfile(newProfile);
              } catch (err) {
                console.error('Failed to create initial user profile', err);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.warn('User profile snapshot access warning:', error.message);
            const isAdminEmail = BOOTSTRAP_ADMIN_EMAILS.includes((user.email || '').toLowerCase());
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'Pelanggan YANZSTR',
              role: isAdminEmail ? 'admin' : 'user',
              balance: 0,
              status: 'active',
              createdAt: null
            });
            setLoading(false);
          }
        );

        return () => {
          unsubscribeProfile();
        };
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const register = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: name.trim() });
    
    const isAdminEmail = BOOTSTRAP_ADMIN_EMAILS.includes(email.trim().toLowerCase());
    const role: UserRole = isAdminEmail ? 'admin' : 'user';
    
    const userDocRef = doc(db, 'users', cred.user.uid);
    const profileData = {
      uid: cred.user.uid,
      email: cred.user.email || email.trim(),
      name: name.trim(),
      role,
      balance: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(userDocRef, profileData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
    }
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateName = async (newName: string) => {
    if (!currentUser) throw new Error('Tidak ada user aktif');
    await updateProfile(currentUser, { displayName: newName.trim() });
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        name: newName.trim(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const changePassword = async (newPass: string) => {
    if (!currentUser) throw new Error('Tidak ada user aktif');
    await updatePassword(currentUser, newPass);
  };

  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    (currentUser?.email && BOOTSTRAP_ADMIN_EMAILS.includes(currentUser.email.toLowerCase()))
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        register,
        login,
        logout,
        updateName,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  login: (loginValue: string, passwordValue: string) => Promise<void>;
  registerUser: (emailValue: string, usernameValue: string, passwordValue: string) => Promise<void>;
  resetPassword: (emailValue: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Perform administrative check
  const checkAdminPrivileges = async (firebaseUid: string, email: string | null) => {
    try {
      // Bootstrapped Dev Admin
      if (email === 'yoorasher@gmail.com' || email === 'attideyt71@gmail.com') {
        setIsAdmin(true);
        return;
      }

      // 1. Check by Firebase UID
      const adminDocRef = doc(db, 'admins', firebaseUid);
      const adminDoc = await getDoc(adminDocRef);
      if (adminDoc.exists()) {
        setIsAdmin(true);
        return;
      }

      // 2. Check by lowercased Email
      if (email) {
        const emailDocRef = doc(db, 'admins', email.toLowerCase().trim());
        const emailDoc = await getDoc(emailDocRef);
        if (emailDoc.exists()) {
          setIsAdmin(true);
          return;
        }
      }

      setIsAdmin(false);
    } catch (err) {
      console.error("Error verifying admin permissions inside hook:", err);
      setIsAdmin(false);
    }
  };

  // Listen to auth state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          // Fetch user details from 'users' Firestore collection
          const userDocRef = doc(db, 'users', currentUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          }
          
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            console.warn("User profile document not found in Firestore.");
            setProfile(null);
          }
          
          // Verify admin privileges
          await checkAdminPrivileges(currentUser.uid, currentUser.email);
        } catch (error) {
          console.error("Error resolving user context:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login handler Supporting BOTH Email and Minecraft Username lookup via secure /usernames mapping
  const login = async (loginValue: string, passwordValue: string) => {
    setLoading(true);
    try {
      let emailToAuthenticate = loginValue.trim();

      // Check if the input value looks like an email. If not, do static get from usernames collection
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToAuthenticate);
      if (!isEmail) {
        const usernameKey = loginValue.trim().toLowerCase();
        let usernameDoc;
        try {
          usernameDoc = await getDoc(doc(db, 'usernames', usernameKey));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `usernames/${usernameKey}`);
        }

        if (usernameDoc.exists()) {
          emailToAuthenticate = usernameDoc.data().email;
        } else {
          // Fallback to legacy query of users (may fail if permissions are restricted)
          try {
            const usersCollection = collection(db, 'users');
            const usernameQuery = query(
              usersCollection, 
              where('minecraftUsername', '==', loginValue.trim())
            );
            const querySnapshot = await getDocs(usernameQuery);
            
            if (querySnapshot.empty) {
              throw new Error(`Minecraft Username "${loginValue}" does not exist in our system. Please check spelling or register.`);
            }
            emailToAuthenticate = querySnapshot.docs[0].data().email;
          } catch (err) {
            handleFirestoreError(err, OperationType.LIST, 'users');
          }
        }
      }

      try {
        await signInWithEmailAndPassword(auth, emailToAuthenticate, passwordValue);
      } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
          throw new Error("Email/Password Authentication is not enabled in your Firebase Console. Please go to Authentication -> Sign-in method and enable 'Email/Password' in the Firebase Console.");
        }
        throw err;
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Register user handler using secure non-list get for unique username evaluation
  const registerUser = async (emailValue: string, usernameValue: string, passwordValue: string) => {
    setLoading(true);
    const usernameKey = usernameValue.trim().toLowerCase();
    try {
      let usernameDoc;
      try {
        usernameDoc = await getDoc(doc(db, 'usernames', usernameKey));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `usernames/${usernameKey}`);
      }

      if (usernameDoc.exists()) {
        throw new Error(`Minecraft Username "${usernameValue}" is already claimed!`);
      }

      // Create Firebase Auth user
      let credential;
      try {
        credential = await createUserWithEmailAndPassword(auth, emailValue.trim(), passwordValue);
      } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
          throw new Error("Email/Password Authentication is not enabled in your Firebase Console. Please go to Authentication -> Sign-in method and enable 'Email/Password' in the Firebase Console.");
        }
        throw err;
      }
      const newUser = credential.user;

      // Save user profile settings under user UID in direct Firestore 'users' collection
      const userProfileData: UserProfile = {
        uid: newUser.uid,
        email: emailValue.trim(),
        minecraftUsername: usernameValue.trim(),
        createdAt: serverTimestamp()
      };

      try {
        await setDoc(doc(db, 'users', newUser.uid), userProfileData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${newUser.uid}`);
      }

      // Save mapping in /usernames/{username} collection
      try {
        await setDoc(doc(db, 'usernames', usernameKey), {
          uid: newUser.uid,
          email: emailValue.trim(),
          minecraftUsername: usernameValue.trim(),
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `usernames/${usernameKey}`);
      }

      setProfile(userProfileData);
      await checkAdminPrivileges(newUser.uid, newUser.email);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Send Firebase's built-in password reset email for email/password accounts.
  const resetPassword = async (emailValue: string) => {
    const sanitizedEmail = emailValue.trim();

    try {
      await sendPasswordResetEmail(auth, sanitizedEmail, {
        // Return players to the login screen after completing the reset flow.
        url: `${window.location.origin}/login`,
      });
    } catch (err: any) {
      switch (err?.code) {
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        case 'auth/user-not-found':
          throw new Error('No account was found with that email address.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many reset attempts. Please wait a moment and try again.');
        case 'auth/operation-not-allowed':
          throw new Error("Email/Password Authentication is not enabled in your Firebase Console. Please go to Authentication -> Sign-in method and enable 'Email/Password' in the Firebase Console.");
        default:
          throw new Error(err?.message || 'Firebase could not send the password reset email. Please try again.');
      }
    }
  };

  // Sign out user handler
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    login,
    registerUser,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be called inside an AuthProvider');
  }
  return context;
}

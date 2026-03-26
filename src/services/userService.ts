import { db, auth } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc as deleteFirestoreDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

export type UserRole = 'manager' | 'admin' | 'catering' | 'fieldmanager' | 'team' | 'fanzone';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamName?: string;
  assignedVenue?: string;
  assignedField?: string;
  avatar?: string;
  phone?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const USERS_COLLECTION = 'users';

// Register new coach/team account
export const registerCoach = async (
  email: string,
  password: string,
  name: string,
  teamName: string,
  phone?: string
): Promise<User> => {
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Update profile
  await updateProfile(firebaseUser, {
    displayName: name
  });
  
  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    name,
    email: email.toLowerCase(),
    role: 'team',
    teamName,
    phone,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
  
  return {
    id: firebaseUser.uid,
    ...userData
  };
};

// Login user
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
  
  if (userDoc.exists()) {
    return {
      id: firebaseUser.uid,
      ...userDoc.data()
    } as User;
  }
  
  return null;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Get current user data
export const getCurrentUser = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  
  if (userDoc.exists()) {
    return {
      id: uid,
      ...userDoc.data()
    } as User;
  }
  
  return null;
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
};

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', role)
  );
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as User));
};

// Get field managers
export const getFieldManagers = async (): Promise<User[]> => {
  return getUsersByRole('fieldmanager');
};

// Update user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(docRef, {
    ...userData,
    updatedAt: Timestamp.now()
  });
};

// Delete user from Firestore
export const deleteUserFromFirestore = async (userId: string): Promise<void> => {
  // Delete from Firestore
  const docRef = doc(db, USERS_COLLECTION, userId);
  await deleteFirestoreDoc(docRef);
  
  // Note: To delete from Firebase Auth, you need to do it from the Firebase Console
  // or use Admin SDK (requires server-side implementation)
};

// Create field manager (admin only)
export const createFieldManager = async (
  email: string,
  password: string,
  name: string,
  assignedField: string
): Promise<User> => {
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Update profile
  await updateProfile(firebaseUser, {
    displayName: name
  });
  
  // Create user document
  const userData: Omit<User, 'id'> = {
    name,
    email: email.toLowerCase(),
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
  
  return {
    id: firebaseUser.uid,
    ...userData
  };
};

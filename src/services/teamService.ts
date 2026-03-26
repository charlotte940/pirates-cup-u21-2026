import { db, storage } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Player } from '../types';

export interface Team {
  id?: string;
  name: string;
  coach: string;
  contactEmail: string;
  contactPhone: string;
  group: string;
  division: 'mens' | 'ladies';
  location: string;
  logo?: string;
  players: Player[];
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  isRegistered: boolean;
  registrationTime: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const TEAMS_COLLECTION = 'teams';

// Get all teams
export const getAllTeams = async (): Promise<Team[]> => {
  const teamsQuery = query(
    collection(db, TEAMS_COLLECTION),
    orderBy('name')
  );
  const snapshot = await getDocs(teamsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Team));
};

// Get teams by division
export const getTeamsByDivision = async (division: 'mens' | 'ladies'): Promise<Team[]> => {
  const teamsQuery = query(
    collection(db, TEAMS_COLLECTION),
    where('division', '==', division),
    orderBy('name')
  );
  const snapshot = await getDocs(teamsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Team));
};

// Get team by ID
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Team;
  }
  return null;
};

// Upload team logo
export const uploadTeamLogo = async (teamId: string, logoDataUrl: string): Promise<string> => {
  const logoRef = ref(storage, `teams/${teamId}/logo.png`);
  await uploadString(logoRef, logoDataUrl, 'data_url');
  return await getDownloadURL(logoRef);
};

// Upload player photo
export const uploadPlayerPhoto = async (teamId: string, playerId: string, photoDataUrl: string): Promise<string> => {
  const photoRef = ref(storage, `teams/${teamId}/players/${playerId}.png`);
  await uploadString(photoRef, photoDataUrl, 'data_url');
  return await getDownloadURL(photoRef);
};

// Create new team
export const createTeam = async (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, TEAMS_COLLECTION), {
    ...teamData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

// Update team
export const updateTeam = async (teamId: string, teamData: Partial<Team>): Promise<void> => {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(docRef, {
    ...teamData,
    updatedAt: Timestamp.now()
  });
};

// Delete team
export const deleteTeam = async (teamId: string): Promise<void> => {
  // Delete logo if exists
  try {
    const logoRef = ref(storage, `teams/${teamId}/logo.png`);
    await deleteObject(logoRef);
  } catch {
    // Logo may not exist
  }
  
  // Delete team document
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  await deleteDoc(docRef);
};

// Update team standings
export const updateTeamStandings = async (
  teamId: string,
  stats: {
    played?: number;
    won?: number;
    drawn?: number;
    lost?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    points?: number;
  }
): Promise<void> => {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(docRef, {
    ...stats,
    updatedAt: Timestamp.now()
  });
};

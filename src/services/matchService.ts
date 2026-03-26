import { db } from '../config/firebase';
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
  Timestamp,
  onSnapshot
} from 'firebase/firestore';

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellowcard' | 'redcard' | 'substitution' | 'injury';
  team: 'home' | 'away';
  playerName: string;
  playerNumber: number;
  minute: number;
  timestamp: string;
  playerOutName?: string;
  playerOutNumber?: number;
  injuryType?: string;
  canContinue?: boolean;
}

export interface Substitution {
  id: string;
  team: 'home' | 'away';
  playerIn: { name: string; number: number };
  playerOut: { name: string; number: number };
  minute: number;
  timestamp: string;
}

export interface Injury {
  id: string;
  team: 'home' | 'away';
  playerName: string;
  playerNumber: number;
  injuryType: string;
  minute: number;
  canContinue: boolean;
  timestamp: string;
}

export interface Match {
  id?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  time: string;
  venue: string;
  field: string;
  group: string;
  gender: 'mens' | 'ladies';
  round?: string;
  status: 'scheduled' | 'live' | 'completed';
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  substitutions: Substitution[];
  injuries: Injury[];
  homeLineup?: { name: string; number: number; confirmed: boolean }[];
  awayLineup?: { name: string; number: number; confirmed: boolean }[];
  homeCoachConfirmed?: boolean;
  awayCoachConfirmed?: boolean;
  fieldManagerConfirmed?: boolean;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const MATCHES_COLLECTION = 'matches';

// Get all matches
export const getAllMatches = async (): Promise<Match[]> => {
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    orderBy('date'),
    orderBy('time')
  );
  const snapshot = await getDocs(matchesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
};

// Get matches by date
export const getMatchesByDate = async (date: string): Promise<Match[]> => {
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('date', '==', date),
    orderBy('time')
  );
  const snapshot = await getDocs(matchesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
};

// Get matches by field
export const getMatchesByField = async (field: string): Promise<Match[]> => {
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('field', '==', field),
    orderBy('date'),
    orderBy('time')
  );
  const snapshot = await getDocs(matchesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
};

// Get matches by team
export const getMatchesByTeam = async (teamId: string): Promise<Match[]> => {
  const homeQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('homeTeamId', '==', teamId)
  );
  const awayQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('awayTeamId', '==', teamId)
  );
  
  const [homeSnapshot, awaySnapshot] = await Promise.all([
    getDocs(homeQuery),
    getDocs(awayQuery)
  ]);
  
  const matches = [
    ...homeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)),
    ...awaySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match))
  ];
  
  // Sort by date and time
  return matches.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
};

// Get live matches
export const getLiveMatches = async (): Promise<Match[]> => {
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('status', '==', 'live')
  );
  const snapshot = await getDocs(matchesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Match));
};

// Subscribe to live matches (real-time updates)
export const subscribeToLiveMatches = (callback: (matches: Match[]) => void) => {
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('status', '==', 'live')
  );
  
  return onSnapshot(matchesQuery, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));
    callback(matches);
  });
};

// Get match by ID
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Match;
  }
  return null;
};

// Create match
export const createMatch = async (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, MATCHES_COLLECTION), {
    ...matchData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

// Update match
export const updateMatch = async (matchId: string, matchData: Partial<Match>): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await updateDoc(docRef, {
    ...matchData,
    updatedAt: Timestamp.now()
  });
};

// Start match
export const startMatch = async (matchId: string): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await updateDoc(docRef, {
    status: 'live',
    startedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

// End match
export const endMatch = async (matchId: string, finalScore: { home: number; away: number }): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await updateDoc(docRef, {
    status: 'completed',
    homeScore: finalScore.home,
    awayScore: finalScore.away,
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

// Add match event (goal, card, etc.)
export const addMatchEvent = async (matchId: string, event: MatchEvent): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  const match = await getDoc(docRef);
  
  if (match.exists()) {
    const currentEvents = (match.data().events || []) as MatchEvent[];
    await updateDoc(docRef, {
      events: [...currentEvents, event],
      updatedAt: Timestamp.now()
    });
  }
};

// Add substitution
export const addSubstitution = async (matchId: string, substitution: Substitution): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  const match = await getDoc(docRef);
  
  if (match.exists()) {
    const currentSubs = (match.data().substitutions || []) as Substitution[];
    await updateDoc(docRef, {
      substitutions: [...currentSubs, substitution],
      updatedAt: Timestamp.now()
    });
  }
};

// Add injury
export const addInjury = async (matchId: string, injury: Injury): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  const match = await getDoc(docRef);
  
  if (match.exists()) {
    const currentInjuries = (match.data().injuries || []) as Injury[];
    await updateDoc(docRef, {
      injuries: [...currentInjuries, injury],
      updatedAt: Timestamp.now()
    });
  }
};

// Delete match
export const deleteMatch = async (matchId: string): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await deleteDoc(docRef);
};

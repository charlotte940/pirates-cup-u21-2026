export type UserRole = 'manager' | 'admin' | 'catering' | 'team' | 'referee' | 'media' | 'fanzone' | 'fieldmanager' | 'photographer';

export interface SponsorshipBanner {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'top' | 'bottom' | 'sidebar';
  target: 'all' | 'manager' | 'coach' | 'admin' | 'spectator';
  active: boolean;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'ballboy' | 'referee' | 'fieldmanager' | 'admin' | 'catering' | 'casual' | 'other';
  nfcTag?: string;
  foodAllocated: boolean;
  foodCollected: boolean;
  foodCollectedAt?: string;
  foodCollectedBy?: string;
  drinkAllocated: boolean;
  drinkCollected: boolean;
  drinkCollectedAt?: string;
  drinkCollectedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  teamId?: string;
  teamName?: string;
  nfcTag?: string;
  assignedVenue?: string;
  assignedFields?: string[];
  assignedField?: string; // For field managers - single field assignment
  followedTeams?: string[]; // For spectators
  notificationPreferences?: {
    matchReminders: boolean;
    scheduleChanges: boolean;
    results: boolean;
    updates: boolean;
  };
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  coach: string;
  contactEmail: string;
  contactPhone: string;
  players: Player[];
  group: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  nfcTag?: string;
  history?: string;
  founded?: number;
  location?: string;
  stadium?: string;
  colors?: string;
  achievements?: string[];
  isRegistered?: boolean;
  registrationTime?: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  dateOfBirth: string;
  nfcTag?: string;
  photo?: string;
  stats?: PlayerStats;
  isInjured?: boolean;
  injuryNotes?: string;
  isCheckedIn?: boolean;
  checkInTime?: string;
}

export interface PlayerStats {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  date: string;
  time: string;
  venue: string;
  field?: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed';
  homeScore: number;
  awayScore: number;
  refereeId?: string;
  refereeName?: string;
  group?: string;
  round?: string;
  events: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal' | 'yellowcard' | 'redcard' | 'substitution' | 'halftime' | 'fulltime' | 'injury';
  teamId: string;
  playerId?: string;
  playerName?: string;
  minute: number;
  description?: string;
  playerInId?: string; // For substitutions - player coming in
  playerInName?: string;
  playerOutId?: string; // For substitutions - player going out
  playerOutName?: string;
  injuryType?: string; // For injuries
  canContinue?: boolean; // For injuries
}

export interface StartingLineup {
  teamId: string;
  teamName: string;
  players: {
    playerId: string;
    playerName: string;
    number: number;
    position: string;
    isStarting: boolean;
    confirmedByCoach: boolean;
    confirmedByFieldManager: boolean;
  }[];
  confirmedAt?: string;
}

export interface MatchReport {
  matchId: string;
  homeTeam: StartingLineup;
  awayTeam: StartingLineup;
  events: MatchEvent[];
  substitutes: {
    teamId: string;
    teamName: string;
    players: {
      playerId: string;
      playerName: string;
      number: number;
      minuteIn?: number;
      minuteOut?: number;
    }[];
  }[];
  injuries: {
    playerId: string;
    playerName: string;
    teamId: string;
    teamName: string;
    minute: number;
    type: string;
    description: string;
    canContinue: boolean;
  }[];
  preMatchChecklist: {
    fieldCondition: boolean;
    goalsChecked: boolean;
    netsSecure: boolean;
    cornerFlags: boolean;
    linesMarked: boolean;
    ballPressure: boolean;
    firstAidKit: boolean;
    waterAvailable: boolean;
    completedAt: string;
    completedBy: string;
  };
  refereeSignature?: string;
  homeCoachSignature?: string;
  awayCoachSignature?: string;
  fieldManagerSignature?: string;
  generatedAt: string;
}

export interface Referee {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedMatches: string[];
  nfcTag?: string;
  isCheckedIn?: boolean;
}

export interface MediaUser {
  id: string;
  name: string;
  organization: string;
  email: string;
  accessLevel: 'press' | 'photographer' | 'broadcaster';
  nfcTag?: string;
}

export interface Standings {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'merchandise' | 'food' | 'drink' | 'coupon';
  image?: string;
  stock: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'food' | 'drink' | 'discount';
  value: number;
  description: string;
  expiresAt: string;
  used: boolean;
  teamId?: string;
  refereeId?: string;
  barcode?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  category: 'match' | 'team' | 'fan' | 'behind-scenes';
  uploadedAt: string;
  uploadedBy: string;
}

export interface CardRecord {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  matchId: string;
  type: 'yellow' | 'red';
  minute: number;
  reason?: string;
  issuedBy: string;
  issuedAt: string;
}

export interface SecurityCheck {
  id: string;
  location: string;
  nfcTag: string;
  userId: string;
  userName: string;
  userRole: string;
  checkInTime: string;
  checkOutTime?: string;
}

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  date: string;
  downloadUrl: string;
}

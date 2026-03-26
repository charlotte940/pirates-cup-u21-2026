import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerCoach: (teamName: string, coachName: string, email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store registered coaches in localStorage for persistence
const getStoredCoaches = (): Record<string, User> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem('piratescup_coaches');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
};

const DEMO_USERS: Record<string, User> = {
  'manager@piratescup.org': {
    id: '1',
    name: 'Tournament Manager',
    email: 'manager@piratescup.org',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
  },
  'admin@piratescup.org': {
    id: '2',
    name: 'Admin',
    email: 'admin@piratescup.org',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  'catering@piratescup.org': {
    id: '3',
    name: 'Catering Staff',
    email: 'catering@piratescup.org',
    role: 'catering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=catering',
  },
  // UJ Sports Grounds - 6 Field Managers (one per field)
  'fieldmanager-a@piratescup.org': {
    id: '4a',
    name: 'Field Manager - Field A',
    email: 'fieldmanager-a@piratescup.org',
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField: 'A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fma',
  },
  'fieldmanager-b@piratescup.org': {
    id: '4b',
    name: 'Field Manager - Field B',
    email: 'fieldmanager-b@piratescup.org',
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField: 'B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fmb',
  },
  'fieldmanager-c@piratescup.org': {
    id: '4c',
    name: 'Field Manager - Field C',
    email: 'fieldmanager-c@piratescup.org',
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField: 'C',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fmc',
  },
  'fieldmanager-d@piratescup.org': {
    id: '4d',
    name: 'Field Manager - Field D',
    email: 'fieldmanager-d@piratescup.org',
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField: 'D',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fmd',
  },
  'fieldmanager-e@piratescup.org': {
    id: '4e',
    name: 'Field Manager - Field E',
    email: 'fieldmanager-e@piratescup.org',
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField: 'E',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fme',
  },
  'fieldmanager-f@piratescup.org': {
    id: '4f',
    name: 'Field Manager - Field F',
    email: 'fieldmanager-f@piratescup.org',
    role: 'fieldmanager',
    assignedVenue: 'uj-sports-grounds',
    assignedField: 'F',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fmf',
  },
  // Demo team accounts for testing
  'coach@piratescup.org': {
    id: 'coach-1',
    name: 'Demo Coach',
    email: 'coach@piratescup.org',
    role: 'team',
    teamName: 'ORLANDO PIRATES',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach',
  },
  'fanzone@piratescup.org': {
    id: '7',
    name: 'Fan Zone User',
    email: 'fanzone@piratescup.org',
    role: 'fanzone',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fanzone',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredCoaches, setRegisteredCoaches] = useState<Record<string, User>>(getStoredCoaches);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const emailLower = email.toLowerCase();
    // Check demo users first
    const demoUser = DEMO_USERS[emailLower];
    if (demoUser && password === 'password') {
      setUser(demoUser);
      localStorage.setItem('piratescup_user', JSON.stringify(demoUser));
      return true;
    }
    // Check registered coaches
    const coachUser = registeredCoaches[emailLower];
    if (coachUser && password === 'password') {
      setUser(coachUser);
      localStorage.setItem('piratescup_user', JSON.stringify(coachUser));
      return true;
    }
    return false;
  }, [registeredCoaches]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('piratescup_user');
  }, []);

  const registerCoach = useCallback(async (teamName: string, coachName: string, email: string, _password: string): Promise<boolean> => {
    const emailLower = email.toLowerCase();
    // Check if email already exists
    if (DEMO_USERS[emailLower] || registeredCoaches[emailLower]) {
      return false;
    }
    
    const newCoach: User = {
      id: `coach-${Date.now()}`,
      name: coachName,
      email: emailLower,
      role: 'team',
      teamName: teamName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailLower}`,
    };
    
    const updatedCoaches = { ...registeredCoaches, [emailLower]: newCoach };
    setRegisteredCoaches(updatedCoaches);
    localStorage.setItem('piratescup_coaches', JSON.stringify(updatedCoaches));
    return true;
  }, [registeredCoaches]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  React.useEffect(() => {
    const saved = localStorage.getItem('piratescup_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('piratescup_user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      registerCoach,
      isAuthenticated: !!user,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

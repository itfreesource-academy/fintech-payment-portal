import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export type PersonaRole =
  | 'compliance_officer'
  | 'risk_analyst'
  | 'underwriter'
  | 'fraud_investigator'
  | 'retail_customer'
  | 'hni_customer'
  | 'pep_sanctioned_user'
  | 'auditor';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: PersonaRole;
  department: string;
  status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
  mfaEnabled: boolean;
  panNumberMasked?: string;
  aadhaarNumberMasked?: string;
  createdAt: string;
}

export interface PersonaProfile {
  role: PersonaRole;
  username: string;
  email: string;
  fullName: string;
  title: string;
  department: string;
  jurisdictionFocus: string;
  avatarUrl: string;
  clearanceLevel: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'EXECUTIVE';
  description: string;
  defaultPermissions: string[];
}

export interface PersonaItem {
  user: User;
  profile: PersonaProfile;
}

interface AuthContextType {
  currentUser: User | null;
  currentProfile: PersonaProfile | null;
  token: string | null;
  allPersonas: PersonaItem[];
  switchPersona: (role: PersonaRole) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<PersonaProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fintech_token'));
  const [allPersonas, setAllPersonas] = useState<PersonaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load available personas
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const res = await axios.get('/api/v1/auth/personas');
        if (res.data.success) {
          setAllPersonas(res.data.personas);
          // Default to Compliance Officer (Maya Lin) or Retail Customer (Vikram Sharma)
          const savedRole = (localStorage.getItem('fintech_current_role') as PersonaRole) || 'compliance_officer';
          const match = res.data.personas.find((p: PersonaItem) => p.user.role === savedRole) || res.data.personas[0];
          if (match) {
            setCurrentUser(match.user);
            setCurrentProfile(match.profile);
          }
        }
      } catch (err) {
        console.error('Failed to load personas:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPersonas();
  }, []);

  const switchPersona = async (role: PersonaRole) => {
    try {
      const match = allPersonas.find(p => p.user.role === role);
      if (!match) return;

      const loginRes = await axios.post('/api/v1/auth/login', {
        identifier: match.user.username,
        password: 'Password123!'
      });

      if (loginRes.data.success) {
        setCurrentUser(loginRes.data.user);
        setCurrentProfile(loginRes.data.profile);
        setToken(loginRes.data.token);
        localStorage.setItem('fintech_token', loginRes.data.token);
        localStorage.setItem('fintech_current_role', role);
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    setToken(null);
    localStorage.removeItem('fintech_token');
    localStorage.removeItem('fintech_current_role');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        token,
        allPersonas,
        switchPersona,
        logout,
        loading
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

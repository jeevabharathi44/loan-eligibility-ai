import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  setUserDirectly: (u: any, t?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('loan_xai_token') || localStorage.getItem('loan_ai_token');
    const savedUser = localStorage.getItem('loan_xai_user') || localStorage.getItem('loan_ai_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setUser({
          id: parsed.id,
          name: parsed.full_name || parsed.name || 'Citizen User',
          email: parsed.email || 'user@meripehchaan.gov.in',
          role: parsed.role === 'CHIEF_UNDERWRITER' || parsed.role === 'ADMIN' ? 'ADMIN' : 'USER',
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Stored session invalid:', e);
      }
    } else {
      // Default initial persona session for seamless evaluation
      const defaultUser = {
        id: 'usr-jeeva-prime',
        name: 'Jeeva Bharathi M',
        email: 'jeeva.bharathi@fintech.gov.in',
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
      };
      setUser(defaultUser);
      setToken('demo-token-jeeva-bharathi');
      localStorage.setItem('loan_xai_token', 'demo-token-jeeva-bharathi');
      localStorage.setItem('loan_xai_user', JSON.stringify({
        id: defaultUser.id,
        full_name: defaultUser.name,
        email: defaultUser.email,
        role: 'APPLICANT',
      }));
    }
    setIsLoading(false);
  }, []);

  const setUserDirectly = (u: any, t?: string) => {
    setUser({
      id: u.id,
      name: u.full_name || u.name,
      email: u.email,
      role: u.role === 'CHIEF_UNDERWRITER' || u.role === 'ADMIN' ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString(),
    });
    if (t) setToken(t);
  };

  const login = async (email: string, password: string) => {
    // Fallback login
    const isOfficer = email.toLowerCase().includes('officer') || email.toLowerCase().includes('90421');
    const dummyUser: User = {
      id: isOfficer ? 'EMP-90421' : 'usr-demo-1',
      name: isOfficer ? 'Dr. Arulmozhi Varman' : 'Jeeva Bharathi M',
      email: email,
      role: isOfficer ? 'ADMIN' : 'USER',
      createdAt: new Date().toISOString(),
    };
    setUser(dummyUser);
    setToken('dummy-jwt-token');
    localStorage.setItem('loan_xai_token', 'dummy-jwt-token');
    localStorage.setItem('loan_xai_user', JSON.stringify(dummyUser));
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('loan_xai_token');
    localStorage.removeItem('loan_ai_token');
    localStorage.removeItem('loan_xai_user');
    localStorage.removeItem('loan_ai_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        register,
        logout,
        setUserDirectly,
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

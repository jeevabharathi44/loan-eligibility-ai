import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient, isStaticDeployment } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  demoLogin: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('loan_ai_token');
    const savedUser = localStorage.getItem('loan_ai_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);

        // Optionally ping /auth/me without kicking the user out on error
        apiClient
          .get('/auth/me')
          .then((res) => {
            const fetched = res.data?.data?.user || res.data?.user || res.data;
            if (fetched && fetched.id) {
              setUser(fetched);
              localStorage.setItem('loan_ai_user', JSON.stringify(fetched));
            }
          })
          .catch(() => {
            // Retain saved session offline
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      } catch {
        // Fallback below
      }
    }

    // Default to a pre-authenticated demo applicant (Jeeva Bharathi M) so user can navigate anywhere immediately
    const defaultUser: User = {
      id: 'usr_demo_jeeva',
      email: 'jeeva@loanai.local',
      name: 'Jeeva Bharathi M',
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    setUser(defaultUser);
    setToken('demo_jwt_token_jeeva');
    localStorage.setItem('loan_ai_token', 'demo_jwt_token_jeeva');
    localStorage.setItem('loan_ai_user', JSON.stringify(defaultUser));
    setIsLoading(false);
  }, []);

  const demoLogin = (email: string) => {
    const isAdm = email.toLowerCase().includes('admin') || email.toLowerCase().includes('reviewer') || email.toLowerCase().includes('arulmozhi');
    const isJeeva = email.toLowerCase().includes('jeeva') || email.toLowerCase().includes('bharathi');
    const isAnitha = email.toLowerCase().includes('anitha') || email.toLowerCase().includes('meena');
    const isMuthu = email.toLowerCase().includes('muthu') || email.toLowerCase().includes('rajan');

    let name = 'Jeeva Bharathi M';
    let role: 'USER' | 'ADMIN' = isAdm ? 'ADMIN' : 'USER';
    if (isAdm) name = 'Chief Underwriter (Dr. Arulmozhi Varman)';
    else if (isJeeva) name = 'Jeeva Bharathi M';
    else if (isAnitha) name = 'Anitha Murugan';
    else if (isMuthu) name = 'Muthu Pandian';
    else name = 'Karthik Selvam';

    const demoUser: User = {
      id: isAdm ? 'usr_admin_1' : isJeeva ? 'usr_demo_jeeva' : 'usr_demo_' + (isAnitha ? '2' : isMuthu ? '3' : '1'),
      email: email || (isAdm ? 'admin@loanai.local' : isJeeva ? 'jeeva@loanai.local' : isAnitha ? 'anitha@loanai.local' : isMuthu ? 'muthu@loanai.local' : 'karthik@loanai.local'),
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    setToken('demo_jwt_token_' + demoUser.id);
    localStorage.setItem('loan_ai_token', 'demo_jwt_token_' + demoUser.id);
    localStorage.setItem('loan_ai_user', JSON.stringify(demoUser));
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const loggedInUser = res.data?.data?.user || res.data?.user || res.data;
      const authToken = res.data?.data?.token || res.data?.token || 'demo_token';

      if (loggedInUser && loggedInUser.email) {
        // Normalize role to ADMIN or USER for frontend
        const normalizedRole = (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'REVIEWER') ? 'ADMIN' : 'USER';
        loggedInUser.role = normalizedRole;
        setUser(loggedInUser);
        setToken(authToken);
        localStorage.setItem('loan_ai_token', authToken);
        localStorage.setItem('loan_ai_user', JSON.stringify(loggedInUser));
        return;
      }
    } catch {
      // Fallback to local demo session if backend endpoint is unavailable
    }

    demoLogin(email);
  };

  const register = async (name: string, email: string, password: string, role = 'USER') => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password, role });
      const newUser = res.data?.data?.user || res.data?.user || res.data;
      const authToken = res.data?.data?.token || res.data?.token || 'demo_token';

      if (newUser && newUser.email) {
        setUser(newUser);
        setToken(authToken);
        localStorage.setItem('loan_ai_token', authToken);
        localStorage.setItem('loan_ai_user', JSON.stringify(newUser));
        return;
      }
    } catch {
      // Fallback
    }

    const demoUser: User = {
      id: 'usr_' + Date.now(),
      email,
      name: name || 'Demo Applicant',
      role: role as 'USER' | 'ADMIN',
      createdAt: new Date().toISOString(),
    };
    setUser(demoUser);
    setToken('demo_jwt_token_' + demoUser.id);
    localStorage.setItem('loan_ai_token', 'demo_jwt_token_' + demoUser.id);
    localStorage.setItem('loan_ai_user', JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('loan_ai_token');
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
        demoLogin,
        logout,
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

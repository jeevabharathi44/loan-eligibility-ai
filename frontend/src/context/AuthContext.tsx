import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
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
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with me endpoint
        apiClient.get('/auth/me')
          .then((res) => {
            if (res.data?.data?.user) {
              setUser(res.data.data.user);
              localStorage.setItem('loan_ai_user', JSON.stringify(res.data.data.user));
            }
          })
          .catch(() => {
            // Token likely invalid
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      } catch (e) {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('loan_ai_token', authToken);
    localStorage.setItem('loan_ai_user', JSON.stringify(loggedInUser));
  };

  const register = async (name: string, email: string, password: string, role = 'USER') => {
    const res = await apiClient.post('/auth/register', { name, email, password, role });
    const { user: newUser, token: authToken } = res.data.data;
    setUser(newUser);
    setToken(authToken);
    localStorage.setItem('loan_ai_token', authToken);
    localStorage.setItem('loan_ai_user', JSON.stringify(newUser));
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

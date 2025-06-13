import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import { User, AuthResponse } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, username: string, referralCode?: string) => Promise<AuthResponse>;
  logout: () => void;
  updateUserInfo: (updatedUser: User) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            // Vérifier si les données utilisateur sont complètes
            if (!storedUser.username || !storedUser.role) {
              // Si les données sont incomplètes, récupérer les données fraîches
              const freshUser = await authService.getCurrentUser();
              setUser(freshUser);
            } else {
              setUser(storedUser);
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', err);
        setError('Erreur lors de la récupération des informations utilisateur');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, referralCode?: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(email, password, username, referralCode);
      setUser(response.user);
      return response;
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUserInfo = (updatedUser: User) => {
    setUser(updatedUser);
    // Mettre à jour l'utilisateur dans le stockage local
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUserInfo,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface UserProfile {
  bio?: string;
  country?: string;
  createdAt: Date;
}

export interface UserStatistics {
  totalWins: number;
  totalLosses: number;
  ranking: number;
  tournamentsPlayed: number;
  tournamentsWon: number;
}

export interface UserSponsorship {
  referralCode: string;
  referredBy?: string;
  codeParrain?: string;
  referrals?: Array<{
    _id: string;
    username: string;
    avatar?: string;
    statistics: {
      tournamentsPlayed: number;
    };
  }>;
  level: string;
  levelId?: {
    name: string;
    minReferrals: number;
    rewardTickets: number;
    earningsPercentage: number;
    rechargePercentage: number;
    order: number;
  };
  commissionEarned: number;
  activeReferralsCount?: number;
}

export interface User {
  _id: string;
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  phoneNumber?: string;
  timezone?: string;
  preferredCurrency?: string;
  profile: UserProfile;
  statistics: UserStatistics;
  sponsorship: UserSponsorship;
  solde: number;
  pointsDeFidelite: number;
  ticketsDeTournois: number;
  twoFactorEnabled: boolean;
  rewards?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
  redirectTo?: string;
}

export const authService = {
  async register(email: string, password: string, username: string, referralCode?: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.auth.register, {
        email,
        password,
        username,
        referralCode
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.auth.login, {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw handleApiError(error);
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        API_ENDPOINTS.auth.forgotPassword,
        { email }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>(API_ENDPOINTS.auth.me);
      return response.data.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};

import api from './api';
import { LucideIcon, Users, User, Trophy, Star, Crown, Award } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api.config';

export interface SponsorshipLevel {
  _id: string;
  name: string;
  minReferrals: number;
  rewardTickets: number;
  earningsPercentage: number;
  rechargePercentage: number;
  order: number;
}

export interface SponsorshipStats {
  activeReferrals: number;
  totalReferrals: number;
  currentLevel: number;
  requiredReferrals: number;
}

// Map des icônes pour chaque niveau
const levelIcons: Record<string, LucideIcon> = {
  'Esclave ASC': Users,
  'Paysan ASC': User,
  'Roturier ASC': Trophy,
  'Noble ASC': Star,
  'Chef de caste': Crown,
  'Gouverneur ASC': Award,
  'Roi ASC': Crown,
  'Empereur ASC': Crown,
  'Emblème ASC': Award
};

// Map des couleurs pour chaque niveau
const levelColors: Record<string, string> = {
  'Esclave ASC': "bg-gray-100 dark:bg-gray-800",
  'Paysan ASC': "bg-blue-50 dark:bg-blue-900/20",
  'Roturier ASC': "bg-purple-50 dark:bg-purple-900/20",
  'Noble ASC': "bg-yellow-50 dark:bg-yellow-900/20",
  'Chef de caste': "bg-orange-50 dark:bg-orange-900/20",
  'Gouverneur ASC': "bg-red-50 dark:bg-red-900/20",
  'Roi ASC': "bg-pink-50 dark:bg-pink-900/20",
  'Empereur ASC': "bg-indigo-50 dark:bg-indigo-900/20",
  'Emblème ASC': "bg-violet-50 dark:bg-violet-900/20"
};

export const sponsorshipService = {
  async getSponsorshipLevels() {
    const response = await api.get(API_ENDPOINTS.sponsorship.levels);
    const levels = response.data.levels;
    
    // Ajouter les icônes et couleurs à chaque niveau
    return levels.map((level: SponsorshipLevel) => ({
      ...level,
      icon: levelIcons[level.name] || Users,
      color: levelColors[level.name] || "bg-gray-100 dark:bg-gray-800"
    }));
  },

  async getSponsorshipStats(): Promise<SponsorshipStats> {
    const response = await api.get('/sponsorship/stats');
    return response.data;
  },

  async updateSponsorshipLevel() {
    const response = await api.post(API_ENDPOINTS.sponsorship.updateLevel);
    return response.data;
  },

  getLevels: async () => {
    const response = await api.get('/sponsorship/levels');
    return response.data;
  },

  getStats: async (userId: string): Promise<SponsorshipStats> => {
    const response = await api.get(`/sponsorship/stats/${userId}`);
    return response.data;
  },

  updateStats: async (userId: string, stats: Partial<SponsorshipStats>) => {
    const response = await api.patch(`/sponsorship/stats/${userId}`, stats);
    return response.data;
  },

  checkReferralsActivity: async (userId: string) => {
    const response = await api.get(`/sponsorship/check-activity/${userId}`);
    return response.data;
  }
}; 
import api from './api';

// Define interfaces for the expected API responses

export interface UserOverallStats {
  totalWins: number;
  totalLosses: number;
  totalMatchesPlayed: number;
  ranking: number | null; // Ranking might not always be available
  tournamentsWon: number;
  currentMonthStats: {
    wins: number;
    losses: number;
    lossesThisMonth: number;
    matchesPlayed: number;
    rankingChange: number | null;
    tournamentsWonThisMonth: number;
  };
}

export interface MatchHistoryItem {
  _id: string; // Assuming MongoDB ObjectId
  opponentName: string;
  tournamentName?: string;
  result: 'win' | 'loss' | 'draw'; // More specific than just "Victoire"
  score?: string; // e.g., "3-1"
  date: string; // ISO date string
}

export interface MonthlyPerformanceItem {
  month: string; // e.g., "Jan", "Fév"
  year: number;
  matchesPlayed: number;
  wins: number;
}

// Service functions

const getUserOverallStats = async (): Promise<UserOverallStats> => {
  const response = await api.get<UserOverallStats>('/users/me/statistics');
  return response.data;
};

const getMatchHistory = async (limit: number = 10): Promise<MatchHistoryItem[]> => {
  const response = await api.get<MatchHistoryItem[]>(`/users/me/match-history?limit=${limit}`);
  return response.data;
};

const getMonthlyPerformance = async (): Promise<MonthlyPerformanceItem[]> => {
  const response = await api.get<MonthlyPerformanceItem[]>('/users/me/monthly-performance');
  return response.data;
};

export const statisticsService = {
  getUserOverallStats,
  getMatchHistory,
  getMonthlyPerformance,
}; 
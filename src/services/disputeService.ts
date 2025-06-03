import api from './api';

export interface DisputeData {
  matchId: string;
  opponentId: string;
  reason: string;
  proofUrl?: string;
  description: string;
  category: string;
  playerScore?: number;
  opponentScore?: number;
}

const createDispute = async (data: DisputeData) => {
  const response = await api.post('/disputes', data);
  return response.data;
};

// Add other dispute related functions here, e.g., getDisputes, getDisputeById, updateDisputeStatus

const getRecentMatchesForDispute = async () => {
  // This endpoint needs to return matches played by the logged-in user in the last 10 minutes
  const response = await api.get('/matches/recent-for-dispute');
  return response.data;
}

const getUserDisputes = async () => {
  const response = await api.get('/disputes/user');
  return response.data;
};

export const disputeService = {
  createDispute,
  getRecentMatchesForDispute,
  getUserDisputes
}; 
import api from './api';
import { useAuth } from '@/contexts/AuthContext';

export interface Dispute {
  _id: string;
  match: {
    _id: string;
    tournament?: {
      title: string;
    };
  };
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  opponent: {
    _id: string;
    username: string;
    avatar?: string;
  };
  reason: string;
  category: string;
  description: string;
  proofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  adminComment?: string;
  reward?: {
    _id: string;
    amount: number;
    status: 'collected' | 'not_collected';
  };
}

export interface ValidationReward {
  _id: string;
  amount: number;
  disputeId: string;
  validatorId: string;
  status: 'collected' | 'not_collected';
  createdAt: string;
}

export const validatorService = {
  async getPendingDisputes(): Promise<Dispute[]> {
    const response = await api.get('/disputes/validator');
    return response.data;
  },

  async resolveDispute(disputeId: string, resolution: { status: 'approve' | 'reject', comment: string }) {
    const response = await api.put(`/disputes/validator/${disputeId}`, resolution);
    return response.data;
  },

  async getValidatorRewards(): Promise<ValidationReward[]> {
    const response = await api.get('/rewards/user?type=validation');
    return response.data.rewards;
  },

  async claimReward(rewardId: string) {
    const response = await api.post(`/rewards/${rewardId}/collect`);
    return response.data;
  },

  async getValidatorStats() {
    const response = await api.get('/validator/stats');
    return response.data;
  }
}; 
 
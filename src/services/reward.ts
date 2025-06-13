import api from './api';

export interface Reward {
  _id: string;
  userId: string;
  tournamentId?: {
    _id: string;
    title: string;
  };
  type: 'win' | 'participation' | 'sponsorship' | 'sponsorship_tickets' | 'legendary' | 'validation' | 'remboursement';
  amount: number;
  description: string;
  status: 'collected' | 'not_collected';
  date: string;
}

export const rewardService = {
  async getUserRewards(): Promise<Reward[]> {
    const response = await api.get('/rewards/user');
    return response.data.rewards;
  },

  async claimReward(rewardId: string) {
    const response = await api.post(`/rewards/${rewardId}/collect`);
    return response.data;
  }
}; 
import api from '../services/api';
import { API_ENDPOINTS } from '../config/api.config';
import { handleApiError } from '../services/api';

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'purchase_zgeg' | 'reward_points' | 'exchange_points_ticket' | 'tournament_prize';
  description: string;
  currency: 'zgeg' | 'points' | 'ticket';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  relatedTournament?: {
    _id: string;
    title: string;
  };
  metadata?: Record<string, any>;
}

export interface TransactionSummary {
  zgeg: {
    deposit: number;
    purchase: number;
    prize: number;
    net: number;
  };
  points: {
    earned: number;
    spent: number;
    net: number;
  };
  tickets: number;
}

export interface MonthlyGains {
  monthlyGains: number;
  currency: string;
  month: number;
  year: number;
}

export interface TransactionPagination {
  total: number;
  page: number;
  pages: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

export const walletService = {
  /**
   * Récupérer l'historique des transactions
   */
  getTransactions: async (page = 1, limit = 20, type?: string, currency?: string): Promise<TransactionsResponse> => {
    try {
      let url = `${API_ENDPOINTS.users.transactions.list}?page=${page}&limit=${limit}`;
      if (type) url += `&type=${type}`;
      if (currency) url += `&currency=${currency}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw handleApiError(error);
    }
  },
  
  /**
   * Récupérer une transaction spécifique
   */
  getTransaction: async (transactionId: string): Promise<Transaction> => {
    try {
      const response = await api.get(API_ENDPOINTS.users.transactions.detail(transactionId));
      return response.data.transaction;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la transaction ${transactionId}:`, error);
      throw handleApiError(error);
    }
  },
  
  /**
   * Créer une nouvelle transaction
   */
  createTransaction: async (transactionData: Partial<Transaction>): Promise<Transaction> => {
    try {
      const response = await api.post(API_ENDPOINTS.users.transactions.list, transactionData);
      return response.data.transaction;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw handleApiError(error);
    }
  },
  
  /**
   * Récupérer le résumé des transactions
   */
  getTransactionsSummary: async (): Promise<TransactionSummary> => {
    try {
      const response = await api.get(API_ENDPOINTS.users.transactions.summary);
      return response.data.summary;
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé des transactions:', error);
      throw handleApiError(error);
    }
  },
  
  /**
   * Récupérer les gains mensuels
   */
  getMonthlyGains: async (): Promise<MonthlyGains> => {
    try {
      const response = await api.get(API_ENDPOINTS.users.transactions.monthlyGains);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des gains mensuels:', error);
      throw handleApiError(error);
    }
  }
}; 
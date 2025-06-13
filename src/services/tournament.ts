import api from '../services/api';
import { API_ENDPOINTS } from '../config/api.config';
import { handleApiError } from '../services/api';

export interface Tournament {
  _id: string;
  title: string;
  description: string;
  prize: number;
  status: 'upcoming' | 'open' | 'in-progress' | 'complete';
  date: string;
  registrationStart?: string;
  registrationDeadline?: string;
  maxPlayers: number;
  players: string[];
  matches: string[];
  rules?: string;
  type: string;
  createdBy: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  entryFee: number;
  firstPlaceReward: number;
  secondPlaceReward: number;
  thirdPlaceReward?: number;
}

export interface TournamentResponse {
  tournament: Tournament;
}

export interface TournamentsResponse {
  tournaments: Tournament[];
}

export const tournamentService = {
  /**
   * Récupérer tous les tournois
   */
  getAllTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.tournaments.list);
      return response.data.tournaments;
    } catch (error) {
      console.error('Erreur lors de la récupération des tournois:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer un tournoi par son identifiant
   */
  getTournamentById: async (id: string): Promise<Tournament> => {
    try {
      const response = await api.get(`${API_ENDPOINTS.tournaments.list}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tournoi ${id}:`, error);
      throw handleApiError(error);
    }
  },

  /**
   * S'inscrire à un tournoi
   */
  registerForTournament: async (tournamentId: string): Promise<Tournament> => {
    try {
      const response = await api.post(`${API_ENDPOINTS.tournaments.register}/${tournamentId}`);
      return response.data.tournament;
    } catch (error) {
      console.error(`Erreur lors de l'inscription au tournoi ${tournamentId}:`, error);
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer les tournois auxquels l'utilisateur est inscrit
   */
  getUserTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.tournaments.userTournaments);
      return response.data.tournaments;
    } catch (error) {
      console.error('Erreur lors de la récupération des tournois de l\'utilisateur:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Filtrer les tournois par statut
   */
  getTournamentsByStatus: async (status: string): Promise<Tournament[]> => {
    try {
      const response = await api.get(`${API_ENDPOINTS.tournaments.list}?status=${status}`);
      return response.data.tournaments;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tournois avec statut ${status}:`, error);
      throw handleApiError(error);
    }
  }
}; 
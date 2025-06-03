import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '@/config/api.config';
import { User } from './auth';

/**
 * Interface pour le profil utilisateur
 */
export interface UserProfile {
  bio?: string;
  country?: string;
  avatar?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  timezone?: string;
  preferredCurrency?: string;
  // Autres champs du profil
}

/**
 * Interface pour la mise à jour du mot de passe
 */
export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

/**
 * Service pour gérer les opérations sur les utilisateurs
 */
export const userService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns Le profil utilisateur
   */
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      const response = await api.get(API_ENDPOINTS.users.profile);
      return response.data.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Met à jour le profil de l'utilisateur
   * @param profileData - Les données du profil à mettre à jour
   * @returns Le profil mis à jour
   */
  updateProfile: async (profileData: Partial<User>): Promise<UserProfile> => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Met à jour l'avatar de l'utilisateur
   * @param avatarUrl - L'URL de l'avatar à enregistrer
   * @returns Le profil mis à jour avec le nouvel avatar
   */
  updateAvatar: async (avatarUrl: string): Promise<UserProfile> => {
    try {
      console.log('Tentative de mise à jour de l\'avatar avec URL:', avatarUrl);
      console.log('Endpoint utilisé:', API_ENDPOINTS.users.avatar);
      
      // S'assurer que l'URL est valide et non vide
      if (!avatarUrl) {
        console.error('URL d\'avatar invalide ou vide');
        throw new Error('URL d\'avatar invalide');
      }
      
      // Vérifier si l'URL a un format valide (commence par http:// ou https://)
      if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
        console.error('Format d\'URL d\'avatar invalide:', avatarUrl);
        throw new Error('L\'URL de l\'avatar doit commencer par http:// ou https://');
      }
      
      console.log('Envoi de la requête de mise à jour d\'avatar...');
      const response = await api.put(API_ENDPOINTS.users.avatar, { avatar: avatarUrl });
      console.log('Réponse de mise à jour d\'avatar:', response.status, response.data ? 'Données reçues' : 'Aucune donnée');
      
      if (!response.data) {
        throw new Error('Aucune donnée reçue du serveur');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Met à jour le mot de passe de l'utilisateur
   * @param passwordData - Les mots de passe actuel et nouveau
   * @returns Un message de confirmation
   */
  updatePassword: async (passwordData: PasswordUpdate): Promise<{ message: string }> => {
    try {
      console.log('Tentative de mise à jour du mot de passe...');
      const response = await api.put('/users/password', passwordData);
      console.log('Mot de passe mis à jour avec succès');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Met à jour uniquement la devise préférée de l'utilisateur
   * @param currency - Le code de la devise préférée
   * @returns Le profil utilisateur mis à jour
   */
  updatePreferredCurrency: async (currency: string): Promise<UserProfile> => {
    try {
      console.log('Tentative de mise à jour de la devise préférée:', currency);
      // Utiliser le bon endpoint API
      const response = await api.put('/users/currency', { preferredCurrency: currency });
      console.log('Devise préférée mise à jour avec succès. Réponse:', response.data);
      // Mettre à jour également la session utilisateur dans localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          currentUser.preferredCurrency = currency;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } catch (localStorageError) {
        console.warn('Impossible de mettre à jour le localStorage:', localStorageError);
      }
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la devise préférée:', error);
      console.error('Détails de la requête:', {
        endpoint: '/users/currency',
        payload: { preferredCurrency: currency }
      });
      throw handleApiError(error);
    }
  },

  async updateRole(role: string) {
    const response = await api.put('/users/role', { role });
    return response.data;
  }
}; 
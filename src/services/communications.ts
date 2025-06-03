import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '../config/api.config';

// Types pour les communications
export interface Communication {
  id: string;
  title: string;
  content: string;
  scheduled: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  updatedAt?: string;
}

export interface CommunicationInput {
  title: string;
  content: string;
  scheduled: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface CommunicationsResponse {
  communications: Communication[];
  total: number;
}

export interface CommunicationResponse {
  communication: Communication;
}

/**
 * Récupère la liste des communications
 */
export const fetchCommunications = async (
  status?: 'draft' | 'scheduled' | 'sent'
): Promise<CommunicationsResponse> => {
  try {
    const params = status ? { status } : {};
    const response = await api.get<CommunicationsResponse>(
      API_ENDPOINTS.admin.communications.list,
      { params }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les détails d'une communication
 */
export const fetchCommunicationById = async (id: string): Promise<CommunicationResponse> => {
  try {
    const response = await api.get<CommunicationResponse>(
      API_ENDPOINTS.admin.communications.detail(id)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée une nouvelle communication
 */
export const createCommunication = async (
  communicationData: CommunicationInput
): Promise<CommunicationResponse> => {
  try {
    const response = await api.post<CommunicationResponse>(
      API_ENDPOINTS.admin.communications.create,
      communicationData
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour une communication existante
 */
export const updateCommunication = async (
  id: string,
  communicationData: Partial<CommunicationInput>
): Promise<CommunicationResponse> => {
  try {
    const response = await api.put<CommunicationResponse>(
      API_ENDPOINTS.admin.communications.update(id),
      communicationData
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une communication
 */
export const deleteCommunication = async (id: string): Promise<void> => {
  try {
    await api.delete(API_ENDPOINTS.admin.communications.delete(id));
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Envoie immédiatement une communication (même si elle était programmée)
 */
export const sendCommunicationNow = async (id: string): Promise<CommunicationResponse> => {
  try {
    const response = await api.post<CommunicationResponse>(
      API_ENDPOINTS.admin.communications.send(id)
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}; 
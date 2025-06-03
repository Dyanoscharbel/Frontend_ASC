import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dyezeobrj/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'dls_avatars'; // Preset non-signé à configurer dans votre compte Cloudinary

/**
 * Service pour télécharger des fichiers vers Cloudinary
 */
export const uploadService = {
  /**
   * Télécharge une image vers Cloudinary
   * @param file - Le fichier image à télécharger
   * @returns Promise avec l'URL de l'image téléchargée
   */
  uploadImage: async (file: File): Promise<string> => {
    try {
      console.log('Début du téléchargement du fichier:', file.name, 'taille:', (file.size / 1024).toFixed(2), 'KB');
      
      // Vérifier que le fichier est bien une image
      if (!file.type.startsWith('image/')) {
        console.error('Le fichier n\'est pas une image valide:', file.type);
        throw new Error('Le fichier sélectionné n\'est pas une image valide');
      }
      
      // Vérifier que le fichier n'est pas trop volumineux (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        console.error('L\'image est trop volumineuse:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
        throw new Error('L\'image ne doit pas dépasser 10MB');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      console.log('Envoi vers Cloudinary en cours...');
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Progression: ${percentCompleted}%`);
        }
      });
      
      console.log('Réponse de Cloudinary reçue:', 
        response.status, 
        response.data ? 'Données reçues' : 'Aucune donnée'
      );
      
      if (!response.data || !response.data.secure_url) {
        console.error('Réponse Cloudinary sans URL:', response.data);
        throw new Error('Aucune URL d\'image reçue de Cloudinary');
      }
      
      // Retourne l'URL sécurisée de l'image
      console.log('Image téléchargée avec succès:', response.data.secure_url);
      return response.data.secure_url;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erreur Axios lors du téléchargement:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          throw new Error('Authentification Cloudinary échouée. Vérifiez votre upload_preset.');
        } else if (error.response?.status === 413) {
          throw new Error('L\'image est trop volumineuse pour être téléchargée');
        } else {
          throw new Error(`Erreur serveur Cloudinary: ${error.message}`);
        }
      }
      
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw new Error('Échec du téléchargement de l\'image: vérifiez votre connexion internet');
    }
  }
}; 
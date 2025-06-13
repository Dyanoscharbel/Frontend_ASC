/**
 * Ce fichier est un modèle pour le backend.
 * Il montre comment implémenter l'endpoint /api/users/currency 
 * pour mettre à jour la devise préférée d'un utilisateur.
 */

// Contrôleur Express pour mettre à jour la devise préférée
const updateUserCurrency = async (req, res) => {
  try {
    // Extraire l'ID utilisateur du token ou de la session
    const userId = req.user._id; // Assurez-vous que votre middleware d'authentification met req.user à disposition
    
    // Récupérer la devise préférée du corps de la requête
    const { preferredCurrency } = req.body;
    
    // Valider que le code de devise est présent
    if (!preferredCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Le code de devise est requis'
      });
    }
    
    console.log(`Mise à jour de la devise pour l'utilisateur ${userId}: ${preferredCurrency}`);
    
    // Mettre à jour la devise préférée dans la base de données
    // Utilisez votre modèle MongoDB/Mongoose, Sequelize ou autre ORM
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferredCurrency: preferredCurrency },
      { new: true } // pour retourner l'utilisateur mis à jour
    );
    
    // Vérifier si l'utilisateur a été trouvé et mis à jour
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Retourner l'utilisateur mis à jour
    return res.status(200).json({
      success: true,
      message: 'Devise préférée mise à jour avec succès',
      preferredCurrency: updatedUser.preferredCurrency,
      user: updatedUser // Si vous souhaitez retourner l'utilisateur complet
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la devise:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la devise préférée',
      error: error.message
    });
  }
};

// Configuration de la route dans le fichier des routes
// Exemple avec Express Router:
/*
const router = express.Router();
router.put('/currency', authMiddleware, updateUserCurrency);
export default router;
*/

// Ou dans une application Express:
/*
app.put('/api/users/currency', authMiddleware, updateUserCurrency);
*/

// Remplacer par:
// ----------------------------------------------------
// INSTRUCTIONS POUR LE BACKEND
// ----------------------------------------------------
// Pour que l'application frontend fonctionne correctement, vous devez
// implémenter l'endpoint suivant exactement comme indiqué ci-dessous:
//
// ENDPOINT: PUT /api/users/currency
//
// 1. Dans votre serveur Express, ajoutez cette route:
//
// app.put('/api/users/currency', authMiddleware, updateUserCurrency);
//
// 2. Assurez-vous que le modèle de votre utilisateur contient un champ 'preferredCurrency'
//
// 3. La fonction updateUserCurrency doit accepter et traiter une requête avec:
//    - Body: { preferredCurrency: "CODE_DEVISE" }
//    - Retour: { success: true, preferredCurrency: "CODE_DEVISE", user: {...userData} }
//
// 4. En cas d'erreur, renvoyer:
//    - Status: 4xx ou 5xx selon l'erreur
//    - Body: { success: false, message: "Description de l'erreur" }
//
// ---------------------------------------------------- 
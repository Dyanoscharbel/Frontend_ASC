import React from 'react';
import { motion } from 'framer-motion';

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">FAQ – Afrik Soccer Cup (ASC)</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
          {/* Question 1 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Qu'est-ce que l'Afrik Soccer Cup (ASC) ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              L'Afrik Soccer Cup (ASC) est un tournoi de compétitions mobiles, principalement basé sur le jeu Dream League Soccer (DLS). Il réunit une communauté de passionnés de jeux mobiles répartis à travers toute l'Afrique. Le tournoi se distingue par son aspect purement compétitif, fondé sur la maîtrise technique et stratégique des joueurs.
            </p>
          </div>

          {/* Question 2 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Qui organise le tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
            Le tournoi est organisé par une association de fans de DLS répartie dans toute l’Afrique sans entité centralisée ni siège fixe permettant une organisation flexible et transnationale. Il n’est affilé à aucune entreprise, éditeur ou plateforme tierce y compris First Touch Games Ltd.            </p>
          </div>

          {/* Question 3 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Comment puis-je m'inscrire au tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Pour participer, il vous suffit de vous inscrire via notre site officiel en remplissant un formulaire d'inscription. Vous devrez accepter nos Conditions Générales d'Utilisation (CGU) et payer les frais de participation pour couvrir les coûts liés à l'organisation, la gestion technique et les récompenses des gagnants.
            </p>
          </div>

          {/* Question 4 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Quels sont les frais de participation ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Les frais de participation sont utilisés pour financer :
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>La gestion technique de la plateforme.</li>
              <li>Les récompenses et trophées pour les joueurs.</li>
              <li>La logistique événementielle.</li>
              <li>Le support et l'arbitrage des compétitions.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Les frais ne sont pas considérés comme des mises ou des paris et ne dépendent d'aucun élément de hasard.
            </p>
          </div>

          {/* Question 5 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Est-ce que le tournoi est un jeu de hasard ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Non, le tournoi repose uniquement sur les compétences des joueurs. Aucune partie du résultat du tournoi n'est déterminée par un tirage ou un élément de hasard. Les performances des joueurs sont mesurées en fonction de leurs compétences techniques et stratégiques.
            </p>
          </div>

          {/* Questions 6-16 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Où se déroulera le tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le tournoi se déroule en ligne, ce qui permet à tous les joueurs, peu importe leur emplacement géographique, de participer à partir de leurs appareils mobiles.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Qui peut participer au tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le tournoi est ouvert à tous les passionnés de Dream League Soccer (DLS), à condition de respecter les critères d'inscription et d'adhérer aux règles de conduite et de compétition définies par l'organisation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Quelles sont les récompenses du tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Les récompenses du tournoi sont destinées à récompenser les meilleurs joueurs en fonction de leur performance. Les récompenses comprennent des trophées, des prix en espèces ou d'autres formes de reconnaissance définies par l'organisation à chaque édition du tournoi.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Comment sont résolus les litiges entre joueurs ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Les litiges entre joueurs sont résolus par des validateurs choisis parmi la communauté des participants. Ces validateurs agissent de manière impartiale et leur décision est finale et sans appel. Leur rôle est de garantir une compétition juste et équitable.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Que faire en cas de problème technique durant une compétition ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              En cas de problème technique, vous pouvez contacter notre support technique via la plateforme. Nous nous engageons à résoudre les incidents dans les plus brefs délais, en tenant compte des circonstances.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Est-ce que les organisateurs peuvent se faire des bénéfices ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Oui, les organisateurs peuvent générer des bénéfices à travers le tournoi, mais ces bénéfices sont réinvestis dans le bon déroulement du tournoi, notamment pour la gestion technique, la logistique et les récompenses. Les bénéfices ne sont pas l'objectif principal du tournoi et sont partagés uniquement entre les organisateurs, conformément à nos accords internes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Quels sont les risques associés à la participation au tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Bien que nous mettions en place toutes les mesures nécessaires pour assurer une expérience de compétition saine, il existe des risques liés à la participation à toute compétition en ligne, tels que les conflits entre joueurs, des problèmes de connexion, ou des bugs techniques. Nous vous encourageons à lire attentivement nos Conditions Générales d'Utilisation pour bien comprendre vos droits et responsabilités.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Puis-je obtenir un remboursement des frais de participation ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Les frais de participation ne sont pas remboursables, sauf dans le cas où une erreur technique imputable à l'organisation aurait empêché votre inscription ou votre participation effective au tournoi.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14. Quelles sont les règles concernant les données personnelles ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Nous prenons la protection de vos données personnelles très au sérieux. Les informations collectées lors de votre inscription sont utilisées uniquement pour la gestion du tournoi et ne seront en aucun cas partagées avec des tiers, sauf conformément à notre Politique de Confidentialité. Vous pouvez consulter cette dernière pour plus de détails sur la manière dont nous traitons vos données personnelles.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">15. Où puis-je consulter les documents légaux relatifs au tournoi ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Vous pouvez consulter nos documents légaux essentiels, notamment les Conditions Générales d'Utilisation, les Conditions Générales de Paiement, la Politique de Confidentialité, la Politique de Cookies, et les Mentions Légales, directement sur notre site web dans la section dédiée.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">16. Comment contacter l'équipe de l'Afrik Soccer Cup ?</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Pour toute question ou demande d'assistance, vous pouvez nous contacter via notre formulaire de contact en ligne ou par email à l'adresse suivante : <a href="mailto:AfriKsoccercup@gmail.com" className="text-asc-purple hover:underline">AfriKsoccercup@gmail.com</a>. Notre équipe vous répondra dans les plus brefs délais.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FAQ; 
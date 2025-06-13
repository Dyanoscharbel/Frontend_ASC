import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">CONDITIONS GÉNÉRALES DE PAIEMENT (CGP)</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AFRIK SOCCER CUP (ASC)</h2>
            <p className="text-gray-600 dark:text-gray-300">Date de dernière mise à jour : 01 juin 2025</p>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 1 – OBJET DES CGP</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les présentes Conditions Générales de Paiement ont pour objet de définir les modalités financières encadrant les paiements effectués par les utilisateurs dans le cadre des services proposés par le site www.afriksoccercup.com (ci-après « le Site »), opéré par la communauté AFRIK SOCCER CUP (ci-après « ASC »).
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 2 – NATURE DES VERSEMENTS</h3>
            <p className="text-gray-600 dark:text-gray-300">Les montants versés par les utilisateurs ne constituent :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>Ni des paris,</li>
              <li>Ni des mises,</li>
              <li>Ni des investissements financiers,</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              mais des frais de participation destinés exclusivement à couvrir les coûts d'organisation, de maintenance, de logistique, de dotation et de coordination des tournois proposés.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Les paiements ne sont pas conditionnés à un aléa ni à une redistribution aléatoire.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 3 – MODALITÉS DE PAIEMENT</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.1 Moyens de paiement acceptés</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Le Site accepte uniquement les moyens de paiement électroniques sécurisés (cartes bancaires, mobile money, crypto-monnaies autorisées ou portefeuilles virtuels), via des prestataires tiers conformes aux standards de sécurité (ex : SSL, 3D Secure, PCI-DSS).
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.2 Validation du paiement</h4>
                <p className="text-gray-600 dark:text-gray-300">Un paiement est considéré comme valide :</p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Dès réception de la confirmation par le prestataire ;</li>
                  <li>Une fois affecté à un tournoi identifié ou à une prestation définie.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 4 – UTILISATION DES SOMMES VERSÉES</h3>
            <p className="text-gray-600 dark:text-gray-300">Les frais perçus peuvent être utilisés pour :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>La maintenance technique de la plateforme ;</li>
              <li>La logistique opérationnelle (équipements, communication, serveurs, licences, etc.) ;</li>
              <li>La rémunération ou indemnisation des validateurs, modérateurs et organisateurs ;</li>
              <li>La constitution des récompenses ;</li>
              <li>Le fonctionnement général de l'association de fans ASC.</li>
            </ul>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white">4.1 Possibilité de bénéfices organisateurs</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Une part des excédents financiers générés peut être répartie entre les membres organisateurs selon des accords internes.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Cette répartition n'est en aucun cas imputable aux participants et ne remet pas en cause la nature communautaire et transparente du projet.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 5 – ABSENCE DE DROIT AU REMBOURSEMENT</h3>
            <p className="text-gray-600 dark:text-gray-300">Tout paiement validé est ferme et définitif, sauf :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>En cas d'erreur technique ou de double prélèvement dûment prouvé ;</li>
              <li>En cas d'annulation exceptionnelle du tournoi à l'initiative d'ASC sans date de report.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Dans ces cas spécifiques, un remboursement partiel ou total peut être accordé, sur demande formelle écrite, après vérification.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 6 – TRANSPARENCE ET TRAÇABILITÉ</h3>
            <p className="text-gray-600 dark:text-gray-300">ASC s'engage à :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>Tenir une comptabilité interne claire et régulièrement auditée ;</li>
              <li>Répartir les montants selon une grille définie à l'avance ;</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 7 – LIMITATION DE RESPONSABILITÉ</h3>
            <p className="text-gray-600 dark:text-gray-300">ASC ne saurait être tenue responsable :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>Des erreurs de saisie lors du paiement par l'utilisateur ;</li>
              <li>Des incidents techniques imputables aux prestataires de paiement ;</li>
              <li>De tout préjudice indirect lié au mode de versement choisi.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 8 – RÉSERVE DE SUSPENSION</h3>
            <p className="text-gray-600 dark:text-gray-300">ASC se réserve le droit de bloquer ou suspendre tout paiement :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>Suspecté de fraude, blanchiment, ou infraction à la réglementation applicable ;</li>
              <li>Non conforme aux CGU ou à la présente politique ;</li>
              <li>Effectué dans une devise non acceptée ou via un moyen non autorisé.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 9 – DROIT APPLICABLE ET JURIDICTION</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les présentes CGP sont régies par les principes généraux du droit numérique et des services communautaires en ligne.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              En cas de litige lié à un paiement, seul l'arbitrage privé défini dans le règlement officiel de l'ASC est compétent, à l'exclusion de toute juridiction étatique.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 10 – ACCEPTATION DES CGP</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Toute validation de paiement implique l'acceptation pleine et entière des présentes CGP.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              L'utilisateur reconnaît en avoir pris connaissance avant tout versement.
            </p>
          </section>
        </div>
      </motion.div>
      </div>
  );
};

export default Terms;

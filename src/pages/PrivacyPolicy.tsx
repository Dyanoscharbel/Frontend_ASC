import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">POLITIQUE DE CONFIDENTIALITÉ</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AFRIK SOCCER CUP (ASC)</h2>
            <p className="text-gray-600 dark:text-gray-300">Dernière mise à jour : 01 juin 2025</p>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. PRÉAMBULE</h3>
            <p className="text-gray-600 dark:text-gray-300">
              La présente Politique de Confidentialité a pour objectif d'informer de manière claire, transparente et complète les utilisateurs du site www.worldsoccercup.com (ci-après « le Site ») sur la manière dont leurs données personnelles sont collectées, utilisées, conservées et protégées par l'organisation AFRIK SOCCER CUP (ASC), une association informelle de fans de jeux mobiles répartis sur tout le continent africain.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              ASC s'engage à respecter les droits fondamentaux des utilisateurs, notamment en matière de vie privée, conformément :
            </p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300">
              <li>au Règlement Général sur la Protection des Données (RGPD) pour les utilisateurs situés dans l'UE ;</li>
              <li>aux principes de la Convention de Malabo (UA) sur la cybersécurité et la protection des données personnelles en Afrique ;</li>
              <li>et aux législations locales en vigueur.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. DONNÉES PERSONNELLES COLLECTÉES</h3>
            <p className="text-gray-600 dark:text-gray-300">Nous pouvons collecter les types de données suivants :</p>
            
            <div className="mt-3">
              <h4 className="font-medium text-gray-900 dark:text-white">2.1 Données d'identification</h4>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
                <li>Nom / pseudonyme</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Identifiants de jeu</li>
              </ul>
            </div>

            <div className="mt-3">
              <h4 className="font-medium text-gray-900 dark:text-white">2.2 Données de connexion</h4>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
                <li>Adresse IP</li>
                <li>Appareil utilisé, système d'exploitation, type de navigateur</li>
                <li>Journaux de navigation sur le Site (logs)</li>
              </ul>
            </div>

            <div className="mt-3">
              <h4 className="font-medium text-gray-900 dark:text-white">2.3 Données financières (via prestataires)</h4>
              <p className="text-gray-600 dark:text-gray-300">Informations de paiement partagées avec les prestataires tiers (non stockées par ASC)</p>
            </div>

            <div className="mt-3">
              <h4 className="font-medium text-gray-900 dark:text-white">2.4 Données de performance</h4>
              <p className="text-gray-600 dark:text-gray-300">Statistiques de tournoi, victoires, classements</p>
            </div>

            <div className="mt-3">
              <h4 className="font-medium text-gray-900 dark:text-white">2.5 Communications</h4>
              <p className="text-gray-600 dark:text-gray-300">Emails échangés, messages sur les formulaires de contact, captures de litiges entre joueurs</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. FINALITÉS DE LA COLLECTE</h3>
            <p className="text-gray-600 dark:text-gray-300">Les données collectées sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
              <li>La gestion des inscriptions et comptes joueurs</li>
              <li>La gestion des paiements et frais de participation</li>
              <li>Le suivi des performances dans les tournois</li>
              <li>L'assistance technique et le support</li>
              <li>La modération des comportements</li>
              <li>La sécurité informatique</li>
              <li>La gestion des litiges entre joueurs via les validateurs</li>
              <li>L'amélioration des services</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Aucune donnée ne sera utilisée à des fins de prospection commerciale sans consentement explicite.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. BASE LÉGALE DU TRAITEMENT</h3>
            <p className="text-gray-600 dark:text-gray-300">Les traitements réalisés par ASC reposent sur :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
              <li>L'exécution du contrat (CGU acceptées lors de l'inscription)</li>
              <li>Le consentement explicite de l'utilisateur</li>
              <li>L'intérêt légitime de la communauté à assurer le bon fonctionnement des compétitions</li>
              <li>Le respect des obligations légales ou réglementaires</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. DURÉE DE CONSERVATION</h3>
            <p className="text-gray-600 dark:text-gray-300">Les données sont conservées pendant :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
              <li>1 an à compter de la dernière activité sur le compte utilisateur ;</li>
              <li>ou jusqu'à suppression explicite du compte, sauf en cas de litige ou d'enquête en cours.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Les journaux de connexion sont conservés pour des raisons de sécurité pendant 06 mois maximum.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. DESTINATAIRES DES DONNÉES</h3>
            <p className="text-gray-600 dark:text-gray-300">Les données sont accessibles uniquement :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
              <li>Aux organisateurs autorisés d'ASC ;</li>
              <li>Aux validateurs pour résolution de litiges (accès restreint aux données strictement nécessaires) ;</li>
              <li>Aux prestataires techniques</li>
            </ul>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy; 
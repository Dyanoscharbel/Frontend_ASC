import React from 'react';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">CONDITIONS GÉNÉRALES D'UTILISATION (CGU)</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AFRIK SOCCER CUP (ASC)</h2>
            <p className="text-gray-600 dark:text-gray-300">Dernière mise à jour : 01 juin 2025</p>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 1 – OBJET</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d'accès et d'utilisation du site internet officiel de l'AFRIK SOCCER CUP (ci-après « le Site »), accessible à l'adresse www.afriksoccercup.com.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              L'accès et l'utilisation du Site impliquent l'acceptation pleine et entière des présentes CGU par tout utilisateur.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 2 – ACCÈS AU SITE</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Le Site est librement accessible à tout utilisateur disposant d'une connexion internet. Toutefois, certaines fonctionnalités (inscriptions, accès aux tournois, profil joueur, messagerie, etc.) nécessitent la création d'un compte.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              L'accès au Site peut être temporairement suspendu ou limité pour des raisons techniques, de maintenance, de sécurité ou de mise à jour, sans que cela n'ouvre droit à une quelconque indemnisation.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 3 – INSCRIPTION ET COMPTE UTILISATEUR</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.1 Conditions d'inscription</h4>
                <p className="text-gray-600 dark:text-gray-300">Pour participer aux activités proposées par ASC, l'utilisateur doit :</p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Être âgé d'au moins 16 ans (ou 18 ans selon la législation locale) ;</li>
                  <li>Fournir des informations exactes et complètes lors de l'inscription ;</li>
                  <li>Accepter sans réserve les présentes CGU et la Politique de Confidentialité.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.2 Responsabilité de l'utilisateur</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion et des activités réalisées via son compte.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  ASC ne saurait être tenue responsable en cas d'utilisation frauduleuse du compte utilisateur par un tiers.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.3 Suspension ou suppression</h4>
                <p className="text-gray-600 dark:text-gray-300">ASC se réserve le droit de suspendre ou supprimer un compte utilisateur :</p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>En cas de non-respect des CGU ;</li>
                  <li>En cas de fraude, triche ou comportement contraire à l'éthique de la communauté.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 4 – UTILISATION DU SITE</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">4.1 Engagements de l'utilisateur</h4>
                <p className="text-gray-600 dark:text-gray-300">L'utilisateur s'engage à :</p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Utiliser le Site conformément à sa finalité et à la législation applicable;</li>
                  <li>Ne pas perturber le fonctionnement du Site ;</li>
                  <li>Respecter les autres membres et le personnel d'ASC.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">4.2 Interdictions</h4>
                <p className="text-gray-600 dark:text-gray-300">Il est strictement interdit de :</p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Publier des propos diffamatoires, haineux ou illégaux ;</li>
                  <li>Utiliser le Site à des fins commerciales non autorisées ;</li>
                  <li>Tenter d'accéder aux systèmes ou données d'autrui sans autorisation.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 5 – PROPRIÉTÉ INTELLECTUELLE</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tous les éléments présents sur le Site (textes, images, logos, bases de données, code, etc.) sont la propriété exclusive d'ASC ou de leurs titulaires respectifs, et sont protégés par les lois en vigueur.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Toute reproduction, diffusion ou utilisation non autorisée est interdite sans autorisation préalable écrite.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 6 – FONCTIONNEMENT DES TOURNOIS</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">6.1 Nature des compétitions</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Les tournois organisés via le Site sont des compétitions d'adresse pure, sans aucun élément de hasard, ni affiliation avec les éditeurs de jeux vidéo mentionnés.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">6.2 Validation des résultats</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Les litiges entre joueurs sont réglés en interne par des validateurs indépendants désignés parmi les membres de la plateforme ASC. Leur décision est considérée comme définitive.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 7 – RESPONSABILITÉ</h3>
            <p className="text-gray-600 dark:text-gray-300">ASC décline toute responsabilité :</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li>En cas de bug, erreur technique ou indisponibilité temporaire du Site ;</li>
              <li>En cas d'utilisation non conforme du Site par les utilisateurs ;</li>
              <li>Concernant les contenus externes publiés par les membres.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 8 – DONNÉES PERSONNELLES</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les données collectées sont traitées conformément à la Politique de Confidentialité disponible sur le Site. L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données personnelles.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 9 – MODIFICATIONS DES CGU</h3>
            <p className="text-gray-600 dark:text-gray-300">
              ASC se réserve le droit de modifier les présentes CGU à tout moment, notamment pour se conformer à la réglementation ou adapter ses services. Les utilisateurs seront informés de toute modification via le Site.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">ARTICLE 10 – DROIT APPLICABLE ET JURIDICTION</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les présentes CGU sont régies par les principes de droit généralement reconnus et applicables dans le domaine du numérique et de la compétition d'adresse.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Tout différend relatif à leur interprétation ou exécution sera soumis exclusivement à un arbitrage privé, tel que défini dans le règlement officiel de l'ASC.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfUse; 
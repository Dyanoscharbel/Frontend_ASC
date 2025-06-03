import React from 'react';
import { motion } from 'framer-motion';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">POLITIQUE DE COOKIES</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AFRIK SOCCER CUP (ASC)</h2>
            <p className="text-gray-600 dark:text-gray-300">Dernière mise à jour : 25 mai 2025</p>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. PRÉAMBULE</h3>
            <p className="text-gray-600 dark:text-gray-300">
              La présente Politique de Cookies a pour but d'informer les utilisateurs du site www.worldsoccercup.com (ci-après « le Site ») sur l'utilisation des cookies et technologies similaires lors de leur navigation sur le Site. ASC respecte la vie privée de ses utilisateurs et s'engage à leur fournir une information claire et complète sur la manière dont les cookies sont utilisés et comment les gérer.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Cette Politique est mise à jour régulièrement et constitue une partie intégrante de notre Politique de Confidentialité. En utilisant notre Site, vous consentez à l'utilisation des cookies conformément à cette Politique.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. DÉFINITION DES COOKIES</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette, etc.) lorsque vous consultez un site web. Il permet de collecter des informations relatives à votre navigation afin de vous offrir une expérience personnalisée et améliorer la performance du Site.
            </p>
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">Les cookies peuvent être :</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2 space-y-2">
                <li>Cookies strictement nécessaires : indispensables pour le bon fonctionnement du Site et la fourniture du service demandé.</li>
                <li>Cookies fonctionnels : permettent d'améliorer l'expérience utilisateur en mémorisant vos préférences (langue, paramètres de recherche, etc.).</li>
                <li>Cookies de performance : recueillent des informations sur la manière dont vous interagissez avec notre Site, pour en améliorer la performance.</li>
                <li>Cookies de ciblage ou publicitaires : utilisés pour proposer des publicités pertinentes en fonction de vos centres d'intérêt.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. COOKIES UTILISÉS SUR LE SITE</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.1 Cookies nécessaires au fonctionnement du Site</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ces cookies sont indispensables pour naviguer sur notre Site et utiliser ses fonctionnalités. Ils permettent de :
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Gérer les sessions utilisateurs ;</li>
                  <li>Assurer la sécurité du Site ;</li>
                  <li>Mémoriser les informations liées à votre inscription et à vos préférences de navigation.</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Exemples : cookies de session, cookies de sécurité.</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.2 Cookies fonctionnels</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ils permettent de personnaliser votre expérience sur le Site en fonction de vos préférences. Par exemple, ces cookies nous permettent de :
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Mémoriser les paramètres linguistiques ;</li>
                  <li>Se souvenir de votre nom d'utilisateur et de vos préférences de navigation.</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Exemples : cookies de personnalisation.</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.3 Cookies de performance</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ces cookies collectent des informations anonymes sur la manière dont vous utilisez le Site. Ces données sont utilisées pour :
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Analyser la performance du Site ;</li>
                  <li>Améliorer la navigation et l'ergonomie ;</li>
                  <li>Identifier les pages qui rencontrent des problèmes techniques.</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Exemples : Google Analytics, cookies de suivi de performance.</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">3.4 Cookies publicitaires ou de ciblage</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Ces cookies permettent de vous proposer des publicités en lien avec vos centres d'intérêts. Ces cookies peuvent être utilisés pour :
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Diffuser des publicités ciblées en fonction de votre comportement en ligne ;</li>
                  <li>Limiter le nombre d'affichages de la même publicité ;</li>
                  <li>Mesurer l'efficacité des campagnes publicitaires.</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Exemples : cookies publicitaires Google AdSense.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. CONSENTEMENT À L'UTILISATION DES COOKIES</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Avant d'installer des cookies autres que ceux nécessaires au bon fonctionnement du Site, nous vous demandons votre consentement explicite via un bandeau d'information qui apparaît lors de votre première visite sur le Site. Vous avez la possibilité de gérer vos préférences en matière de cookies à tout moment.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">4.1 Comment donner son consentement</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Lors de votre première visite sur notre Site, un bandeau d'information s'affiche vous demandant de consentir à l'utilisation de cookies. Si vous poursuivez votre navigation, vous consentez implicitement à l'utilisation des cookies conformément à cette Politique.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">4.2 Gestion des préférences</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Vous pouvez à tout moment modifier vos préférences concernant les cookies. Vous avez plusieurs options :
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
                  <li>Accepter tous les cookies : en continuant votre navigation, vous acceptez tous les cookies.</li>
                  <li>Refuser certains cookies : en cliquant sur le lien "Gérer mes cookies" ou en configurant les paramètres dans votre navigateur.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. GESTION DES COOKIES</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Vous avez la possibilité de configurer votre navigateur afin d'accepter ou de refuser l'utilisation de certains cookies. Vous pouvez également supprimer les cookies déjà enregistrés sur votre appareil à tout moment.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Voici les liens vers des pages d'aide pour les principaux navigateurs :
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mt-2">
              <li><a href="#" className="text-asc-purple hover:underline">Google Chrome : Paramètres des cookies Chrome</a></li>
              <li><a href="#" className="text-asc-purple hover:underline">Mozilla Firefox : Paramètres des cookies Firefox</a></li>
              <li><a href="#" className="text-asc-purple hover:underline">Microsoft Edge : Paramètres des cookies Edge</a></li>
              <li><a href="#" className="text-asc-purple hover:underline">Safari : Paramètres des cookies Safari</a></li>
            </ul>

            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white">5.1 Désactivation des cookies</h4>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Si vous choisissez de désactiver certains cookies, cela pourrait limiter certaines fonctionnalités du Site, notamment les services de personnalisation, d'analyse de la performance ou d'affichage de publicités pertinentes.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. TRANSFERT DE DONNÉES</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Les cookies peuvent permettre de transférer des données à des sociétés partenaires, notamment des fournisseurs de services analytiques ou publicitaires. Ces transferts sont effectués conformément à notre Politique de Confidentialité et dans le respect des législations en vigueur.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. MODIFICATIONS DE LA POLITIQUE DE COOKIES</h3>
            <p className="text-gray-600 dark:text-gray-300">
              ASC se réserve le droit de modifier cette Politique de Cookies afin de refléter tout changement dans les technologies ou les pratiques en matière de cookies. En cas de modification substantielle, un avertissement sera affiché sur le Site et vous serez invité à consentir à la nouvelle version de la Politique.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. CONTACT</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Si vous avez des questions concernant l'utilisation des cookies ou souhaitez exercer vos droits relatifs à vos données personnelles, vous pouvez nous contacter à l'adresse suivante :
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Email : <a href="mailto:AfriKsoccercup@gmail.com" className="text-asc-purple hover:underline">AfriKsoccercup@gmail.com</a>
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Conclusion</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Cette Politique de Cookies est conçue pour respecter vos droits en matière de confidentialité et garantir la transparence de l'utilisation des cookies sur notre Site. Votre consentement éclairé est essentiel pour nous permettre de vous offrir une expérience personnalisée tout en respectant vos choix.
            </p>
          </section>
        </div>
      </motion.div>
      </div>
  );
};

export default Cookies;

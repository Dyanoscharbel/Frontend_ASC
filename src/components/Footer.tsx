import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900">Qui sommes-nous</Link>
              </li>
              <li>
                <Link to="/sponsorship-info" className="text-gray-600 hover:text-gray-900">Parrainage</Link>
              </li>
              <li>
                <Link to="/tournaments-info" className="text-gray-600 hover:text-gray-900">Tournois</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms-of-use" className="text-gray-600 hover:text-gray-900">Conditions d'utilisation (CGU)</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900">Conditions de paiement (CGP)</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Politique de confidentialité</Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-gray-900">Politique des cookies</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
             
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com/afriksoccercup" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61577160306074" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
            </a>
              <a href="https://instagram.com/afriksoccercup" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://whatsapp.com/channel/0029VbBDHStJENyBAC6c4G2G" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">WhatsApp</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.363.711.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2.003c-5.522 0-9.997 4.475-9.997 9.997 0 1.762.464 3.479 1.345 4.995L2 22l5.115-1.342a9.953 9.953 0 004.889 1.25h.004c5.522 0 9.997-4.475 9.997-9.997 0-2.67-1.04-5.182-2.928-7.07A9.953 9.953 0 0012.004 2.003zm0 17.994a7.96 7.96 0 01-4.073-1.13l-.292-.173-3.037.797.81-2.96-.19-.304A7.963 7.963 0 014.04 12c0-4.393 3.572-7.965 7.965-7.965 2.127 0 4.127.83 5.634 2.338a7.948 7.948 0 012.331 5.627c0 4.393-3.572 7.965-7.965 7.965z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com/@afriksoccercup?si=7vAo7D4Py740GDCq" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">YouTube</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a2.994 2.994 0 00-2.112-2.112C19.692 3.5 12 3.5 12 3.5s-7.692 0-9.386.574A2.994 2.994 0 00.502 6.186C0 7.88 0 12 0 12s0 4.12.502 5.814a2.994 2.994 0 002.112 2.112C4.308 20.5 12 20.5 12 20.5s7.692 0 9.386-.574a2.994 2.994 0 002.112-2.112C24 16.12 24 12 24 12s0-4.12-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* Telegram */}
              <a href="https://t.me/Afriksoccercupls" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">Telegram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 7.29l-1.43 6.76c-.11.48-.39.6-.79.37l-2.18-1.61-1.05 1.01c-.12.12-.23.23-.47.23l.17-2.39 4.35-3.93c.19-.17-.04-.27-.29-.1l-5.38 3.39-2.32-.73c-.5-.16-.51-.5.1-.73l9.06-3.3c.42-.15.8.1.66.7z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@afrik.soccer.cup?_t=ZN-8x8fH6bruR4&_r=1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">TikTok</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.75 2v14.25a2.25 2.25 0 11-2.25-2.25c.414 0 .75.336.75.75s-.336.75-.75.75a.75.75 0 100 1.5 3.75 3.75 0 003.75-3.75V7.81a6.001 6.001 0 004.5 2.19V7.5a4.5 4.5 0 01-4.5-4.5h-2.25z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} AFRIK SOCCER CUP. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

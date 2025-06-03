
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trophy } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 gradient-text">À propos d'ASC</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
              <p className="text-gray-700 dark:text-gray-300">
                ASC (Afrique Sociale Cup) est la première plateforme de tournois Dream League Soccer créée par des Africains, pour les Africains. Notre mission est de développer l'esport en Afrique en offrant une plateforme professionnelle et équitable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Notre Vision</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Nous aspirons à devenir la référence des tournois DLS en Afrique, en créant un écosystème compétitif qui permet aux joueurs de tous niveaux de progresser et de se faire remarquer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Nos Valeurs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Équité</h3>
                  <p className="text-gray-600 dark:text-gray-400">Des règles claires et une application stricte pour garantir des compétitions justes.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Transparence</h3>
                  <p className="text-gray-600 dark:text-gray-400">Communication ouverte sur nos processus et décisions.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Innovation</h3>
                  <p className="text-gray-600 dark:text-gray-400">Amélioration continue de notre plateforme et de l'expérience utilisateur.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Communauté</h3>
                  <p className="text-gray-600 dark:text-gray-400">Un environnement accueillant et solidaire pour tous les joueurs.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


import { Trophy, Star, Users, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="hero-pattern py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
              Nouveau 🎮
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Afrique Sociale Cup
              <span className="gradient-text block">Dream League Arena</span>
            </h1>
            <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Rejoignez la première plateforme de tournois Dream League Soccer créée par des Africains, pour les Africains.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="bg-asc-purple hover:bg-asc-dark-purple text-white">Je m'inscris</Button>
              </Link>
              <Link to="/tournaments-info">
                <Button variant="outline" className="border-asc-purple text-asc-purple hover:bg-asc-purple/10">
                  Explorer les tournois
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-asc-purple/20 rounded-full animate-pulse-light"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-asc-orange/20 rounded-full animate-pulse-light"></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-lg p-6 relative z-10 animate-fade-in">
                <div className="mb-6 flex justify-center">
                  <Trophy className="h-16 w-16 text-asc-purple" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">ASC Premier League</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-asc-purple" />
                    <span>Prochain tournoi: 15 Mai 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-asc-orange" />
                    <span>Prix total: 350 000 FCFA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-asc-blue" />
                    <span>32 participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-asc-yellow" />
                    <span>Ouvert à tous les niveaux</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white dark:bg-gray-800 border shadow animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Trophy className="h-10 w-10 text-asc-purple mb-2" />
            <h3 className="text-lg font-semibold">Prix Attractifs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Jusqu'à 5M FCFA à gagner</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white dark:bg-gray-800 border shadow animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Users className="h-10 w-10 text-asc-blue mb-2" />
            <h3 className="text-lg font-semibold">Communauté</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connectez-vous avec des joueurs africains</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white dark:bg-gray-800 border shadow animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Star className="h-10 w-10 text-asc-yellow mb-2" />
            <h3 className="text-lg font-semibold">Parrainage</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Système de récompenses attractif</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white dark:bg-gray-800 border shadow animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Award className="h-10 w-10 text-asc-green mb-2" />
            <h3 className="text-lg font-semibold">Évolution</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Progressez de Paysan à Empereur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

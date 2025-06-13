import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import SponsorshipLevels from "@/components/SponsorshipLevels";
import TournamentCard from "@/components/TournamentCard";
import { Trophy, Calendar, Users, Award, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { tournamentService } from "@/services/tournament";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, convertCurrencySync } from "@/config/currency";

const Index = () => {
  const { user } = useAuth();
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const allTournaments = await tournamentService.getAllTournaments();
        
        // Trier les tournois par date de création (du plus récent au plus ancien)
        const sortedTournaments = allTournaments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Prendre les 4 premiers tournois
        const latestTournaments = sortedTournaments.slice(0, 4);
        
        // Formater les tournois pour l'affichage
        const formattedTournaments = latestTournaments.map(tournament => ({
          id: tournament._id,
          title: tournament.title,
          description: tournament.description,
          prize: formatPrize(tournament.prize),
          players: tournament.players.length,
          maxPlayers: tournament.maxPlayers,
          date: new Date(tournament.date).toLocaleDateString(),
          status: tournament.status,
          image: tournament.image
        }));

        setFeaturedTournaments(formattedTournaments);
      } catch (error) {
        console.error('Erreur lors du chargement des tournois:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [user?.preferredCurrency]);

  const formatPrize = (prize: number): string => {
    if (!user?.preferredCurrency || user.preferredCurrency === 'XOF') {
      return `${prize.toLocaleString()} FCFA`;
    }
    
    try {
      const convertedPrize = convertCurrencySync(prize, 'XOF', user.preferredCurrency);
      return formatCurrency(convertedPrize, user.preferredCurrency);
    } catch (error) {
      return `${prize.toLocaleString()} FCFA`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Featured Tournaments Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Tournois à la une</h2>
                <p className="text-gray-500 dark:text-gray-400">Les derniers tournois sur ASC</p>
              </div>
              <Link to="/tournaments-info" className="mt-4 md:mt-0">
                <Button variant="outline" className="border-asc-purple text-asc-purple hover:bg-asc-purple/10">
                  Explorer les tournois
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-asc-purple" />
              </div>
            ) : featuredTournaments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun tournoi disponible pour le moment.
                </p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} {...tournament} />
              ))}
            </div>
            )}
            
            <div className="mt-8 text-center">
              <Link to="/tournaments-info">
                <Button variant="outline" className="border-asc-purple text-asc-purple hover:bg-asc-purple/10">
                  Voir tous les tournois
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* How it Works Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Rejoignez l'AfriK Soccer Cup  en quelques étapes simples et commencez à participer aux tournois DLS.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-asc-purple/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-asc-purple" />
                </div>
                <h3 className="font-bold text-xl mb-2">1. Inscrivez-vous</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Créez votre compte en quelques clics et personnalisez votre profil
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-asc-orange/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-asc-orange" />
                </div>
                <h3 className="font-bold text-xl mb-2">2. Rejoignez un tournoi</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Inscrivez-vous aux tournois qui vous intéressent et payez les frais
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-asc-blue/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-asc-blue" />
                </div>
                <h3 className="font-bold text-xl mb-2">3. Jouez vos matchs</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Utilisez le code de match unique et affrontez vos adversaires
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-asc-green/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-asc-green" />
                </div>
                <h3 className="font-bold text-xl mb-2">4. Gagnez des prix</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Remportez des tournois pour gagner des récompenses en argent réel
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/register">
                <Button className="bg-asc-purple hover:bg-asc-dark-purple">
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Sponsorship System Preview */}
        <SponsorshipLevels />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

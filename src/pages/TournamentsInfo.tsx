import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TournamentCard from "@/components/TournamentCard";
import { Trophy, Users, Calendar, Award, Shield, AlertTriangle, Clock, BadgeDollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { tournamentService, Tournament } from "@/services/tournament";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, convertCurrencySync } from "@/config/currency";

const TournamentsInfo = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        const allTournaments = await tournamentService.getAllTournaments();
        setTournaments(allTournaments);
      } catch (error) {
        console.error('Erreur lors du chargement des tournois:', error);
        setError('Impossible de charger les tournois disponibles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Organiser les tournois par statut
  const groupedTournaments = {
    open: tournaments.filter(t => t.status === 'open'),
    upcoming: tournaments.filter(t => t.status === 'upcoming'),
    inProgress: tournaments.filter(t => t.status === 'in-progress'),
    complete: tournaments.filter(t => t.status === 'complete')
  };

  // Fonction pour obtenir le titre de la section selon le statut
  const getSectionTitle = (status: string) => {
    switch (status) {
      case 'open':
        return 'Inscriptions Ouvertes';
      case 'upcoming':
        return 'Tournois à Venir';
      case 'in-progress':
        return 'Tournois en Cours';
      case 'complete':
        return 'Tournois Terminés';
      default:
        return '';
    }
  };

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
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Tournois ASC</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez l'univers compétitif de Dream League Soccer avec nos tournois officiels ASC.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Trophy className="h-12 w-12 text-asc-purple mb-4" />
              <h3 className="text-xl font-semibold mb-2">Prix Attractifs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Des récompenses allant jusqu'à 350 000 FCFA pour les vainqueurs.
                <br />
                1er : 200 000 FCFA
                <br />
                2ème : 100 000 FCFA
                <br />
                3ème : 50 000 FCFA
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Clock className="h-12 w-12 text-asc-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Planning Précis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rappels automatiques avant chaque match :
                <br />
                - 24h avant
                <br />
                - 1h avant
                <br />
                - 5 minutes avant
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <Shield className="h-12 w-12 text-asc-orange mb-4" />
              <h3 className="text-xl font-semibold mb-2">Système de Litiges</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Résolution rapide et équitable des litiges avec validation par 5 arbitres indépendants sous 10 minutes.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Types de Tournois</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Award className="h-6 w-6 text-asc-purple mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">ASC Premier League</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notre tournoi phare avec les meilleurs joueurs africains et les plus grosses récompenses.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Award className="h-6 w-6 text-asc-blue mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Championnats Régionaux</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Des compétitions locales pour représenter votre région.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Award className="h-6 w-6 text-asc-orange mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Tournois Débutants</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Des événements parfaits pour commencer votre carrière compétitive.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                Règles Importantes
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Code unique de 10 lettres pour chaque match</li>
                <li>• Relance obligatoire en cas de match nul</li>
                <li>• Respect strict des horaires de match</li>
                <li>• Preuves obligatoires pour les litiges</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BadgeDollarSign className="h-6 w-6 text-green-500" />
                Prix Légendaire
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Une récompense exceptionnelle de 5 millions FCFA pour des exploits extraordinaires selon des critères spécifiques annoncés avant le tournoi.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Tous les Tournois</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-asc-purple" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Réessayer</Button>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Aucun tournoi disponible pour le moment.
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Revenez plus tard pour voir les nouveaux tournois.
                  </p>
                </div>
              ) : (
                Object.entries(groupedTournaments).map(([status, tournamentList]) => (
                  tournamentList.length > 0 && (
                    <div key={status} className="mb-12">
                      <h3 className="text-xl font-semibold mb-6 text-center">
                        {getSectionTitle(status)}
                      </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournamentList.map((tournament) => (
                <TournamentCard
                            key={tournament._id}
                            id={tournament._id}
                            title={tournament.title}
                            description={tournament.description}
                            prize={formatPrize(tournament.prize)}
                            players={tournament.players.length}
                            maxPlayers={tournament.maxPlayers}
                            date={new Date(tournament.date).toLocaleDateString()}
                            status={tournament.status}
                            image={tournament.image}
                          />
                        ))}
                      </div>
              </div>
                  )
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TournamentsInfo;

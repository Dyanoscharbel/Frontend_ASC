import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TournamentCard, { TournamentStatus } from "@/components/TournamentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, Loader2, Trophy, Calendar, Users, CheckCircle, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tournamentService, Tournament as TournamentType } from "../services/tournament";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, convertCurrencySync } from "@/config/currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interface de tournoi local
interface Tournament {
  id: string;
  title: string;
  description: string;
  prize: string;
  players: number;
  maxPlayers: number;
  date: string;
  status: TournamentStatus;
  image?: string;
  isRegistered?: boolean;
}

const Tournaments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [prizeFilter, setPrizeFilter] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTournaments, setUserTournaments] = useState<TournamentType[]>([]);

  // Charger les tournois depuis l'API
  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        // Récupérer tous les tournois
        const apiTournaments = await tournamentService.getAllTournaments();
        
        // Récupérer les tournois auxquels l'utilisateur est inscrit
        let userTournamentsData: TournamentType[] = [];
        try {
          userTournamentsData = await tournamentService.getUserTournaments();
          setUserTournaments(userTournamentsData);
        } catch (error) {
          console.error("Erreur lors de la récupération des tournois utilisateur:", error);
        }
        
        // Convertir les tournois de l'API au format local
        const formattedTournaments: Tournament[] = apiTournaments.map(tournament => ({
          id: tournament._id,
          title: tournament.title,
          description: tournament.description,
          prize: formatPrize(tournament.prize, user?.preferredCurrency),
          players: tournament.players.length,
          maxPlayers: tournament.maxPlayers,
          date: new Date(tournament.date).toLocaleDateString(),
          status: mapApiStatusToLocal(tournament.status),
          image: tournament.image,
          isRegistered: userTournamentsData.some(t => t._id === tournament._id)
        }));
        
        setTournaments(formattedTournaments);
      } catch (error) {
        console.error("Erreur lors du chargement des tournois:", error);
        toast.error("Impossible de charger les tournois");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, [user?.preferredCurrency]);
  
  // Fonction pour convertir le statut API vers le statut local
  const mapApiStatusToLocal = (apiStatus: string): TournamentStatus => {
    const statusMap: Record<string, TournamentStatus> = {
      'upcoming': 'upcoming',
      'open': 'open',
      'in-progress': 'in-progress',
      'complete': 'complete'
    };
    return statusMap[apiStatus] || 'upcoming';
  };
  
  // Fonction pour formater le prix avec la devise préférée de l'utilisateur
  const formatPrize = (prize: number, preferredCurrency?: string): string => {
    if (!preferredCurrency || preferredCurrency === 'XOF') {
      return `${prize} FCFA`;
    }
    
    try {
      const convertedPrize = convertCurrencySync(prize, 'XOF', preferredCurrency);
      return formatCurrency(convertedPrize, preferredCurrency);
    } catch (error) {
      console.error("Erreur lors de la conversion du prix:", error);
      return `${prize} FCFA`;
    }
  };

  const filterTournaments = (status: TournamentStatus | "all") => {
    return tournaments.filter(tournament => {
      const matchesStatus = status === "all" || tournament.status === status;
      const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tournament.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrize = !prizeFilter ||
      parseInt(tournament.prize.replace(/\D/g, "")) >= parseInt(prizeFilter);
      return matchesStatus && matchesSearch && matchesPrize;
    });
  };

  const sortTournaments = (tournaments: Tournament[]) => {
    return [...tournaments].sort((a, b) => {
      if (sortBy === "prize") {
        const prizeA = parseInt(a.prize.replace(/\D/g, ""));
        const prizeB = parseInt(b.prize.replace(/\D/g, ""));
        return prizeB - prizeA;
      } else if (sortBy === "players") {
        return b.players - a.players;
      } else if (sortBy === "date") {
        const statusPriority: Record<TournamentStatus, number> = {
          "in-progress": 0,
          "open": 1,
          "upcoming": 2,
          "complete": 3
        };
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return 0;
    });
  };

  const allFiltered = sortTournaments(filterTournaments("all"));
  const openFiltered = sortTournaments(filterTournaments("open"));
  const inProgressFiltered = sortTournaments(filterTournaments("in-progress"));
  const upcomingFiltered = sortTournaments(filterTournaments("upcoming"));
  const completeFiltered = sortTournaments(filterTournaments("complete"));
  
  const myTournaments = sortTournaments(tournaments.filter(tournament => 
    userTournaments.some(t => t._id === tournament.id)
  ));

  const renderTournamentCards = (tournamentsList: Tournament[]) => {
    if (tournamentsList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Aucun tournoi trouvé avec ces critères.
          </p>
          <Button onClick={() => {setSearchQuery(""); setPrizeFilter("")}}>Réinitialiser la recherche</Button>
        </div>
      );
    }
    
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournamentsList.map(tournament => (
          <Card key={tournament.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg border-0">
            <div 
              className={`relative h-48 flex items-center justify-center p-4 ${
                tournament.status === 'upcoming' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 
                tournament.status === 'open' ? 'bg-gradient-to-r from-green-500 to-teal-400' : 
                tournament.status === 'in-progress' ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 
                'bg-gradient-to-r from-gray-500 to-slate-400'
              }`}
            >
              {/* Badge de statut en haut à droite */}
              <div className="absolute top-3 right-3">
                <Badge className={`border-0 font-medium px-3 py-1 ${
                  tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                  tournament.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                  tournament.status === 'in-progress' ? 'bg-pink-100 text-pink-800 hover:bg-pink-200' : 
                  'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}>
                  {tournament.status === 'upcoming' ? 'À venir' : 
                   tournament.status === 'open' ? 'Inscriptions' : 
                   tournament.status === 'in-progress' ? 'En cours' : 
                   'Terminé'}
                </Badge>
              </div>
              
              {/* Badge Inscrit en haut à gauche */}
              {tournament.isRegistered && (
                <div className="absolute top-3 left-3">
                  <Badge className="border-0 font-medium px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Inscrit
                  </Badge>
                </div>
              )}
              
              {/* Icône de trophée centrée */}
              <Trophy className="h-20 w-20 text-white/90" />
            </div>
            
            <CardContent className="p-5">
              <h3 className="font-bold text-xl mb-2 line-clamp-1">{tournament.title}</h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {tournament.description || "Aucune description disponible"}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.date}</span>
                </div>
                
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                  <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Link to={`/tournament/details/${tournament.id}`}>
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Détails</span>
                          </Link>
                  </Button>
                      </TooltipTrigger>
                      <TooltipContent>Voir les détails</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-asc-purple mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Chargement des tournois...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="py-8 px-4">
        <div className="container">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tournois ASC</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Découvrez et participez aux tournois Dream League Soccer
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher un tournoi"
                  className="pl-9 pr-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>

              <div className="w-[150px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="prize">Prix</SelectItem>
                    <SelectItem value="players">Joueurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input type="number" placeholder="Prix minimum" value={prizeFilter} onChange={(e) => setPrizeFilter(e.target.value)} className="w-24"/> {/* Added prize filter input */}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex h-9 space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-nowrap overflow-x-auto max-w-full w-full scrollbar-hide">
              <TabsTrigger value="all" className="rounded-md text-sm h-7 px-3">
                Tous ({allFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="my-tournaments" className="rounded-md text-sm h-7 px-3">
                Mes tournois
              </TabsTrigger>
              <TabsTrigger value="open" className="rounded-md text-sm h-7 px-3">
                Ouverts ({openFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="rounded-md text-sm h-7 px-3">
                En cours ({inProgressFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-md text-sm h-7 px-3">
                À venir ({upcomingFiltered.length})
              </TabsTrigger>
              <TabsTrigger value="complete" className="rounded-md text-sm h-7 px-3">
                Terminés ({completeFiltered.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {renderTournamentCards(allFiltered)}
            </TabsContent>

            <TabsContent value="open" className="mt-6">
              {openFiltered.length > 0 ? renderTournamentCards(openFiltered) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Aucun tournoi ouvert trouvé.
                  </p>
                  <Link to="/all">
                    <Button variant="outline">Voir tous les tournois</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="mt-6">
              {inProgressFiltered.length > 0 ? renderTournamentCards(inProgressFiltered) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Aucun tournoi en cours pour le moment.
                  </p>
                  <Link to="/upcoming">
                    <Button variant="outline">Voir les tournois à venir</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingFiltered.length > 0 ? renderTournamentCards(upcomingFiltered) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Aucun tournoi à venir pour le moment.
                  </p>
                  <Link to="/open">
                    <Button variant="outline">Voir les tournois ouverts</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-tournaments" className="mt-6">
              {myTournaments.length > 0 ? renderTournamentCards(myTournaments) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Vous n'êtes inscrit à aucun tournoi pour le moment.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="complete" className="mt-6">
              {completeFiltered.length > 0 ? renderTournamentCards(completeFiltered) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Aucun tournoi terminé trouvé.
                  </p>
                  <Button variant="outline" onClick={() => {setActiveTab("all"); setPrizeFilter("")}}>
                    Voir tous les tournois
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Tournaments;
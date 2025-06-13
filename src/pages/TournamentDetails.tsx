import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Trophy, AlertCircle, Calendar, ZoomIn, ZoomOut, Loader2, 
  Users, DollarSign, Info, RefreshCw, Shield, Award, CheckCircle, ArrowLeft
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import api from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, convertCurrencySync } from "@/config/currency";
import TournamentBracket from "@/components/TournamentBracket";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Match {
  id: string;
  round: number;
  position: number;
  player1?: string;
  player1Id?: string;
  player2?: string;
  player2Id?: string;
  winner?: string;
  winnerId?: string;
  status: "completed" | "scheduled" | "pending";
  date?: string;
}

interface Tournament {
  _id: string;
  title: string;
  description: string;
  prize: number;
  entryFee: number;
  date: string;
  status: string;
  firstPlaceReward: number;
  secondPlaceReward: number;
  thirdPlaceReward: number;
  players: any[];
  maxPlayers: number;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  registrationStart?: string;
  registrationDeadline?: string;
  matches?: any[];
  rules?: string;
  hasGeneratedBracket?: boolean;
}

export default function TournamentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [zoom, setZoom] = useState(1);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [bracketExists, setBracketExists] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tournaments/${id}`);
      setTournament(response.data);
      setBracketExists(response.data.hasGeneratedBracket || false);

      // Vérifier si l'utilisateur est déjà inscrit
      if (response.data.players && user) {
        setIsRegistered(response.data.players.some((player: any) => player._id === user._id));
      }
      
      // Si le tournoi a des matches, les organiser pour l'affichage
      if (response.data.matches && response.data.matches.length > 0) {
        setMatches(response.data.matches);
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du tournoi:", err);
      setError(err?.response?.data?.message || "Impossible de charger les détails du tournoi");
      toast.error("Impossible de charger les détails du tournoi");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    if (!user?.preferredCurrency || user.preferredCurrency === 'XOF') {
      return `${amount.toLocaleString('fr-FR')} FCFA`;
    }
    
    try {
      const convertedAmount = convertCurrencySync(amount, 'XOF', user.preferredCurrency);
      return formatCurrency(convertedAmount, user.preferredCurrency);
    } catch (error) {
      return `${amount.toLocaleString('fr-FR')} FCFA`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'complete':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'upcoming': 'À venir',
      'open': 'Inscriptions ouvertes',
      'in-progress': 'En cours',
      'complete': 'Terminé'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const handleRegistration = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour vous inscrire");
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmRegistration = async () => {
    try {
      setIsRegistering(true);
      await api.post(`/tournaments/${id}/register`);
      toast.success("Inscription réussie !");
      setIsRegistered(true);
      fetchTournament(); // Rafraîchir les données du tournoi
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err);
      toast.error(err?.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setIsRegistering(false);
      setShowConfirmDialog(false);
    }
  };

  const calculateTickets = (amount: number) => {
    return amount / 1000;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-asc-purple mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Chargement du tournoi...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erreur</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || "Impossible de charger les détails du tournoi"}
              </p>
              <Link to="/tournaments">
                <Button>Retour aux tournois</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto py-8 px-4">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/tournaments" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux tournois
          </Link>
          {tournament.status === 'open' && !isRegistered && (
            <Button 
              size="lg"
              onClick={handleRegistration}
              disabled={isRegistering || tournament.players.length >= tournament.maxPlayers}
              className="bg-asc-purple hover:bg-asc-purple/90 text-white"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : tournament.players.length >= tournament.maxPlayers ? (
                "Tournoi complet"
              ) : (
                "S'inscrire"
              )}
            </Button>
          )}
          {isRegistered && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-3 py-1.5">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Inscrit
            </Badge>
          )}
        </div>

        {/* Informations principales */}
        <div className="space-y-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {tournament.title}
                </h1>
                <Badge className={`${getStatusColor(tournament.status)} px-3 py-1`}>
                  {translateStatus(tournament.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date du tournoi</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(tournament.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-2">
                    <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prix à gagner</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(tournament.prize, user?.preferredCurrency || 'XOF')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Frais d'inscription</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatAmount(tournament.entryFee)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prix et récompenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Prix et récompenses
            </h2>
            <div className="grid gap-6">
              {/* Prix total */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prix total du tournoi</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAmount(tournament.prize)}</p>
                  </div>
                    </div>
                    </div>

              {/* Places */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1ère place */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10 p-4 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1ère place</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatAmount(tournament.firstPlaceReward)}
                    </p>
                  </div>
                </div>

                {/* 2ème place */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 p-4 rounded-lg">
                  <Award className="h-6 w-6 text-gray-400" />
                      <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2ème place</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatAmount(tournament.secondPlaceReward)}
                    </p>
                        </div>
                      </div>

                {/* 3ème place */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 p-4 rounded-lg">
                  <Award className="h-6 w-6 text-amber-600" />
                            <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">3ème place</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatAmount(tournament.thirdPlaceReward)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
                            </div>

        {/* Onglets */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            {(tournament?.status === 'in-progress' || tournament?.status === 'complete') && (
              <TabsTrigger value="bracket">Arbre du tournoi</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Détails du tournoi</CardTitle>
                <CardDescription>{tournament.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Contenu existant des détails */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Participants ({tournament.players.length} / {tournament.maxPlayers})</CardTitle>
              </CardHeader>
              <CardContent>
                {tournament.players.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucun participant inscrit pour le moment
                    </p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournament.players.map((player: any) => (
                      <div 
                        key={player._id}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                      >
                        <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-700">
                          {player.avatar ? (
                            <AvatarImage src={player.avatar} alt={player.username} />
                          ) : (
                            <AvatarFallback className="bg-asc-purple/10 text-asc-purple font-semibold">
                              {player.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900 dark:text-white">{player.username}</p>
                          {tournament.status === 'complete' && player.rank && player.rank <= 3 && (
                            <Badge variant="outline" className={`mt-1 ${
                              player.rank === 1 
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600'
                                : player.rank === 2
                                ? 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600'
                                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                {player.rank === 1 ? (
                                  <>
                                    <Trophy className="h-3.5 w-3.5" />
                                    <span>Champion</span>
                                  </>
                                ) : player.rank === 2 ? (
                                  <>
                                    <Award className="h-3.5 w-3.5" />
                                    <span>Finaliste</span>
                                  </>
                                ) : (
                                  <>
                                    <Award className="h-3.5 w-3.5" />
                                    <span>3ème place</span>
                                  </>
                                )}
                              </div>
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                                      </div>
                )}
                                </CardContent>
                              </Card>
                          </TabsContent>

          {tournament.rules && (
            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Règlement du tournoi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line">
                      {tournament.rules}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                          </TabsContent>
          )}

          {tournament.description && (
            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description du tournoi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {tournament.description}
                  </p>
            </CardContent>
          </Card>
            </TabsContent>
          )}

          <TabsContent value="bracket">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Arbre du tournoi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tournament._id && (
                  <TournamentBracket 
                    tournamentId={tournament._id} 
                    onBracketExistsChange={(exists) => setBracketExists(exists)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'inscription</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir vous inscrire à ce tournoi ?</p>
          <p className="text-sm text-gray-500">Nombre de tickets utilisés : {calculateTickets(tournament.entryFee)}</p>
          <DialogFooter>
            <Button onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
            <Button onClick={confirmRegistration} disabled={isRegistering}>
              {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
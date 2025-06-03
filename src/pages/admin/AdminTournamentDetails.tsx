import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  Trophy, AlertCircle, Calendar, ZoomIn, ZoomOut, Loader2, 
  Users, DollarSign, Info, RefreshCw, Shield, Award, Edit, CheckCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import TournamentBracket, { Match, Player } from "@/components/TournamentBracket";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Interface Tournament (restored/ensured)
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
  players: Player[]; // Uses imported Player type
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
  matches?: Match[]; // Uses imported Match type
  hasGeneratedBracket?: boolean; // Add this field based on TournamentBracket logic
}

export default function AdminTournamentDetails() {
  const { id } = useParams();
  const [zoom, setZoom] = useState(1);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMatchDialogOpen, setEditMatchDialogOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("");
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("");
  const [matchDate, setMatchDate] = useState<string>("");
  const [saveMatchLoading, setSaveMatchLoading] = useState(false);
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false);
  const [bracketExists, setBracketExists] = useState(false);
  const [scorePlayer1, setScorePlayer1] = useState<string>("");
  const [scorePlayer2, setScorePlayer2] = useState<string>("");
  const [time, setTime] = useState("");

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/tournaments/${id}`);
      
      // Mise à jour des dates limites d'inscription
      let tournamentData = response.data;
      
      // Si le tournoi a une date mais pas de date limite d'inscription, définir à la veille du tournoi
      if (tournamentData.date && !tournamentData.registrationDeadline) {
        // Créer une copie pour ne pas modifier directement l'objet response
        tournamentData = { ...tournamentData };
        
        // Calculer la veille du tournoi
        const tournamentDate = new Date(tournamentData.date);
        const registrationDeadline = new Date(tournamentDate);
        registrationDeadline.setDate(tournamentDate.getDate() - 1);
        
        // Formater en YYYY-MM-DD
        const year = registrationDeadline.getFullYear();
        const month = String(registrationDeadline.getMonth() + 1).padStart(2, '0');
        const day = String(registrationDeadline.getDate()).padStart(2, '0');
        
        tournamentData.registrationDeadline = `${year}-${month}-${day}`;
      }
      
      setTournament(tournamentData);
      
      // Si le tournoi a des matches, les organiser pour l'affichage
      if (tournamentData.matches && tournamentData.matches.length > 0) {
        setCurrentMatches(tournamentData.matches);
      } else {
        // Génération automatique des matches basée sur le nombre de joueurs
        const generatedMatches = generateTournamentBracket(tournamentData.players || []);
        setCurrentMatches(generatedMatches);
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du tournoi:", err);
      setError(err?.response?.data?.message || "Impossible de charger les détails du tournoi");
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du tournoi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer l'arbre du tournoi en fonction du nombre de joueurs inscrits
  const generateTournamentBracket = (currentPlayers: Player[]): Match[] => {
    const playerCount = currentPlayers.length;
    
    if (playerCount === 0) {
      return generateEmptyBracket();
    }
    
    const rounds = Math.ceil(Math.log2(playerCount));
    const firstRoundMatches = Math.pow(2, rounds - 1);
    const generatedMatches: Match[] = [];
    
    for (let i = 0; i < firstRoundMatches; i++) {
      const player1Index = i * 2;
      const player2Index = i * 2 + 1;
      
      const matchPlayers: Player[] = [];
      if (player1Index < playerCount) {
        matchPlayers.push(currentPlayers[player1Index]);
      }
      if (player2Index < playerCount) {
        matchPlayers.push(currentPlayers[player2Index]);
      }
      
      generatedMatches.push({
        _id: `round1-match${i + 1}`, // Use _id
        round: 1,
        matchNumber: i + 1, 
        players: matchPlayers,
        status: "pending",
      } as Match); 
    }
    
    let matchCounter = firstRoundMatches;
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      for (let i = 0; i < matchesInRound; i++) {
        generatedMatches.push({
          _id: `round${round}-match${i + 1}`, // Use _id
          round: round,
          matchNumber: i + 1,
          players: [], 
          status: "pending",
        } as Match);
        matchCounter++;
      }
    }
    return generatedMatches;
  };

  // Générer un arbre vide par défaut
  const generateEmptyBracket = (): Match[] => {
    const matchesArray: Match[] = []; // Renamed to avoid conflict
    for (let i = 0; i < 4; i++) {
      matchesArray.push({
        _id: `empty-1-${i + 1}`, // Use _id
        round: 1,
        matchNumber: i + 1,
        players: [
          { _id: `player${i * 2 + 1}`, username: `Joueur ${i * 2 + 1}` } as Player,
          { _id: `player${i * 2 + 2}`, username: `Joueur ${i * 2 + 2}` } as Player,
        ],
        status: "pending",
      } as Match);
    }
    for (let i = 0; i < 2; i++) {
      matchesArray.push({
        _id: `empty-2-${i + 1}`, // Use _id
        round: 2,
        matchNumber: i + 1,
        players: [],
        status: "pending",
      } as Match);
    }
    matchesArray.push({
      _id: `empty-3-1`, // Use _id
      round: 3,
      matchNumber: 1,
      players: [],
      status: "pending",
    } as Match);
    return matchesArray;
  };

  // Formater les dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Formater les montants
  const formatAmount = (amount: number) => {
    if (!amount && amount !== 0) return '--';
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  // Obtenir la classe de couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'upcoming':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'open':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'complete':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Traduire le statut en français
  const translateStatus = (status: string) => {
    switch(status) {
      case 'upcoming': return 'À venir';
      case 'open': return 'Inscriptions ouvertes';
      case 'in-progress': return 'En cours';
      case 'complete': return 'Terminé';
      default: return status;
    }
  };

  // Fonction pour ouvrir la boîte de dialogue d'édition d'un match
  const openEditMatchDialog = (match: Match) => {
    setCurrentMatch(match);
    setSelectedPlayer1(match.players?.[0]?._id || "");
    setSelectedPlayer2(match.players?.[1]?._id || "");
    setMatchDate(match.date ? new Date(match.date).toISOString().split('T')[0] : "");
    setTime(match.time || "");
    setScorePlayer1(match.player1Score?.toString() || "");
    setScorePlayer2(match.player2Score?.toString() || "");
    setEditMatchDialogOpen(true);
  };

  // Fonction pour enregistrer les modifications d'un match
  const saveMatchChanges = async () => {
    if (!currentMatch || !currentMatch._id) {
      toast({ title: "Erreur", description: "Aucun match sélectionné pour la sauvegarde.", variant: "destructive" });
      return;
    }
    setSaveMatchLoading(true);
    try {
      const payload = {
        date: matchDate,
        time: time,
        player1Score: scorePlayer1 !== "" ? parseInt(scorePlayer1, 10) : undefined,
        player2Score: scorePlayer2 !== "" ? parseInt(scorePlayer2, 10) : undefined,
        status: currentMatch.status,
      };
      
      // Basic validation for scores
      if (payload.player1Score !== undefined && isNaN(payload.player1Score)) {
        toast({ title: "Erreur de saisie", description: "Score du joueur 1 invalide.", variant: "destructive" });
        setSaveMatchLoading(false);
        return;
      }
      if (payload.player2Score !== undefined && isNaN(payload.player2Score)) {
        toast({ title: "Erreur de saisie", description: "Score du joueur 2 invalide.", variant: "destructive" });
        setSaveMatchLoading(false);
        return;
      }

      const response = await api.put(`/tournaments/matches/${currentMatch._id}/result`, payload);
      
      toast({
        title: "Match mis à jour",
        description: "Les détails du match ont été sauvegardés.",
      });
      setEditMatchDialogOpen(false);
      fetchTournament();
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde du match:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.response?.data?.message || "Impossible de sauvegarder les modifications du match.",
        variant: "destructive",
      });
    } finally {
      setSaveMatchLoading(false);
    }
  };

  // Fonction pour marquer un joueur comme gagnant
  const setMatchWinner = (match: Match, playerId: string, playerName: string) => { // playerName is not used if winnerPlayer is found
    const winnerPlayer = match.players.find(p => p._id === playerId);
    if (!winnerPlayer) {
      toast({ title: "Erreur", description: "Joueur gagnant non trouvé dans le match.", variant: "destructive"});
      return;
    }

    if (match.players.length < 2 && match.status !== 'bye') { // Allow bye status to proceed
      toast({
        title: "Action impossible",
        description: "Les deux joueurs doivent être assignés au match (sauf si BYE).", 
        variant: "destructive"
      });
      return;
    }
    
    const updatedMatch: Match = {
      ...match,
      winner: winnerPlayer, 
      status: "completed"
    };
    
    let updatedMatches = currentMatches.map(m => // Use currentMatches state, renamed from `matches` to avoid conflict with imported `Match`
      m._id === match._id ? updatedMatch : m 
    );
    
    if (match.nextMatchId) {
      const nextMatchIndex = updatedMatches.findIndex(m => m._id === match.nextMatchId);
      if (nextMatchIndex !== -1) {
        const nextMatch = { ...updatedMatches[nextMatchIndex] };
        if (nextMatch.players.length < 2) { 
          const existingPlayerIndex = nextMatch.players.findIndex(p => !p || p._id === undefined ); 
          if (existingPlayerIndex !== -1) {
            nextMatch.players[existingPlayerIndex] = winnerPlayer;
        } else {
            nextMatch.players.push(winnerPlayer);
        }
        } 
        updatedMatches[nextMatchIndex] = nextMatch;
      }
    }
    
    setCurrentMatches(updatedMatches); // Use setCurrentMatches state setter
    
    toast({
      title: "Gagnant désigné",
      description: `${winnerPlayer.username} a été désigné comme gagnant du match ${match.matchNumber || match._id}`,
    });
  };

  // Ajouter cette fonction pour vérifier si l'arbre existe
  const checkBracketExists = async (tournamentId) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/bracket`);
      const data = await response.json();
      setBracketExists(data && data.length > 0);
    } catch (error) {
      console.error("Erreur lors de la vérification de l'arbre:", error);
      setBracketExists(false);
    }
  };

  // Ajouter cette fonction pour générer l'arbre
  const generateBracket = async () => {
    if (!tournament?._id) return;
    
    setIsGeneratingBracket(true);
    try {
      const response = await api.post(`/tournaments/${tournament._id}/bracket/generate`);

      if (response.data) {
        toast({
          title: "Succès",
          description: response.data.message || "L'arbre du tournoi a été généré avec succès",
        });
        setBracketExists(true);
        // Recharger les données du tournoi pour avoir les dernières informations
        await fetchTournament();
      }
    } catch (error: any) {
      console.error("Erreur lors de la génération de l'arbre:", error);
      toast({
        title: "Erreur",
        description: error?.response?.data?.message || "Impossible de générer l'arbre du tournoi",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBracket(false);
    }
  };

  // Ajouter cet useEffect pour vérifier l'existence de l'arbre au chargement
  useEffect(() => {
    if (tournament?._id) {
      checkBracketExists(tournament._id);
    }
  }, [tournament?._id]);

  if (loading) {
  return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-600">Chargement des détails du tournoi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-700">
              <AlertCircle className="h-6 w-6 mr-3" />
              <div>
                <p className="font-semibold">Erreur de chargement</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4" onClick={fetchTournament}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center text-yellow-700">
              <AlertCircle className="h-6 w-6 mr-3" />
              <div>
                <p className="font-semibold">Aucune information disponible</p>
                <p className="text-sm mt-1">Le tournoi demandé est introuvable ou a été supprimé</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/admin/tournaments">
                Retour à la liste des tournois
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bannière */}
      <div className="relative rounded-xl overflow-hidden shadow-md">
        <div className={`h-48 w-full bg-gradient-to-r ${
          tournament.status === 'upcoming' ? 'from-blue-500 to-indigo-600' : 
          tournament.status === 'open' ? 'from-green-500 to-teal-600' : 
          tournament.status === 'in-progress' ? 'from-orange-500 to-amber-600' : 
          'from-gray-500 to-gray-600'
        }`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-8 -left-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
          <div className="relative h-full flex flex-col justify-center items-center text-white p-6">
            <Trophy className="h-16 w-16 mb-4 drop-shadow-lg" />
            <h1 className="text-3xl font-bold text-center mb-2 drop-shadow-md">{tournament.title}</h1>
            
            <Badge className={`${getStatusColor(tournament.status)} border px-3 py-1 text-sm font-medium mt-2`}>
              {translateStatus(tournament.status)}
            </Badge>
                </div>
                </div>
        
        <div className="bg-white dark:bg-gray-800 py-4 px-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 sm:gap-8 text-sm">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{formatDate(tournament.date)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-gray-500">Prix</p>
                <p className="font-medium">{formatAmount(tournament.prize)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <div>
                <p className="text-gray-500">Participants</p>
                <p className="font-medium">{tournament.players?.length || 0}/{tournament.maxPlayers || "∞"}</p>
              </div>
              </div>
            </div>

         
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="bracket">Arbre du tournoi</TabsTrigger>
          <TabsTrigger value="players">Joueurs</TabsTrigger>
          <TabsTrigger value="disputes">Litiges</TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-500" />
                  Informations détaillées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-500">Description</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{tournament.description || "Aucune description disponible"}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-500 mb-3">Récapitulatif financier</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-gray-500 text-sm mb-1">Prix total</p>
                        <p className="text-2xl font-bold text-green-600">{formatAmount(tournament.prize)}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-500 text-sm mb-1">Frais d'inscription</p>
                        <p className="text-xl font-semibold text-blue-600">{formatAmount(tournament.entryFee)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-500 mb-2">Répartition des prix</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-amber-500 mr-2" />
                          <span>1ère Place</span>
                        </div>
                        <span className="font-bold text-amber-600">{formatAmount(tournament.firstPlaceReward)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-gray-400 mr-2" />
                          <span>2ème Place</span>
                        </div>
                        <span className="font-bold text-gray-600">{formatAmount(tournament.secondPlaceReward)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-amber-700 mr-2" />
                          <span>3ème Place</span>
                        </div>
                        <span className="font-bold text-amber-700">{formatAmount(tournament.thirdPlaceReward || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {tournament.registrationStart && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-gray-500 mb-2">Période d'inscription</h3>
                      <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span>
                          Du {formatDate(tournament.registrationStart)} 
                          {tournament.registrationDeadline ? ` au ${formatDate(tournament.registrationDeadline)}` : " (sans date limite)"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    Participants ({tournament.players?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {!tournament.players?.length ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">Aucun participant inscrit pour le moment</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-72">
                      <div className="divide-y">
                        {tournament.players.slice(0, 10).map((player, index) => (
                          <div key={player._id || index} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                {player.username?.charAt(0) || "U"}
                              </div>
            <div>
                                <p className="font-medium">{player.username || `Joueur #${index + 1}`}</p>
                                <p className="text-xs text-gray-500">{player.email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {index < 3 ? `Top ${index + 1}` : `#${index + 1}`}
                            </Badge>
                          </div>
                        ))}
                        {tournament.players.length > 10 && (
                          <div className="p-3 text-center">
                            <Button variant="link" size="sm" onClick={() => setActiveTab("players")}>
                              Voir tous les joueurs
                            </Button>
                          </div>
                        )}
            </div>
                    </ScrollArea>
                  )}
          </CardContent>
        </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Date de création</span>
                      <span className="font-medium">{formatDate(tournament.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Dernière mise à jour</span>
                      <span className="font-medium">{formatDate(tournament.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Créé par</span>
                      <span className="font-medium">{tournament.createdBy?.username || "Admin"}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taux de remplissage</span>
                      <span className="font-medium">
                        {tournament.maxPlayers ? 
                          Math.round((tournament.players?.length || 0) / tournament.maxPlayers * 100) + "%" 
                          : "Illimité"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Arbre du tournoi */}
        <TabsContent value="bracket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Arbre du tournoi
                </div>
                {tournament?.status === 'in-progress' && !bracketExists && (
                  <Button
                    onClick={generateBracket}
                    disabled={isGeneratingBracket}
                  >
                    {isGeneratingBracket ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Générer l'arbre
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournament?._id && (
                <TournamentBracket 
                  tournamentId={tournament._id} 
                  onBracketExistsChange={(exists) => setBracketExists(exists)}
                  onEditMatch={openEditMatchDialog}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-1">Information sur l'arbre du tournoi</h3>
                <p className="text-sm text-amber-700">
                  L'arbre du tournoi est généré automatiquement en fonction du nombre de joueurs inscrits. 
                  Les résultats des matchs peuvent être mis à jour lorsque le tournoi est en cours.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Joueurs */}
        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle>Liste des participants</CardTitle>
              <CardDescription>
                {tournament.players?.length || 0} joueurs inscrits sur {tournament.maxPlayers || "∞"} places disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!tournament.players?.length ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Aucun participant inscrit pour le moment</p>
                  <p className="text-sm text-gray-400">
                    Les joueurs apparaîtront ici une fois qu'ils se seront inscrits au tournoi
                  </p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 gap-4 bg-gray-50 p-3 font-medium text-gray-500 text-sm">
                    <div className="col-span-1">#</div>
                    <div className="col-span-7">Joueur</div>
                    <div className="col-span-2">Inscription</div>
                    <div className="col-span-2">Statut</div>
                  </div>
                  <div className="divide-y">
                    {tournament.players.map((player, index) => (
                      <div key={player._id || index} className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 items-center">
                        <div className="col-span-1 font-medium">{index + 1}</div>
                        <div className="col-span-7 flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            {player.username?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium">{player.username || `Joueur #${index + 1}`}</p>
                            <p className="text-xs text-gray-500">{player.email}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-gray-500 text-sm">
                          {player.joinedAt ? formatDate(player.joinedAt) : "--"}
                        </div>
                        <div className="col-span-2">
                          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                            Confirmé
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Litiges */}
        <TabsContent value="disputes">
      <Card>
        <CardHeader>
              <CardTitle>Gestion des litiges</CardTitle>
              <CardDescription>
                Litiges et problèmes à résoudre pour ce tournoi
              </CardDescription>
        </CardHeader>
        <CardContent>
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-50 rounded-lg">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">Aucun litige en cours pour ce tournoi</p>
                <p className="text-sm text-gray-400">
                  Les litiges signalés par les joueurs apparaîtront ici
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogue d'édition de match */}
      <Dialog open={editMatchDialogOpen} onOpenChange={setEditMatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Match</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du match. Le gagnant est déterminé par les scores.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="matchDate">Date du match</Label>
              <Input id="matchDate" type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="matchTime">Heure du match (UTC)</Label>
              <Input id="matchTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">L'heure doit être saisie en UTC (GMT+0)</p>
            </div>
            <div>
              <Label htmlFor="scorePlayer1">Score Joueur 1 ({currentMatch?.players?.[0]?.username || 'Joueur 1'})</Label>
              <Input id="scorePlayer1" type="number" placeholder="Score" value={scorePlayer1} onChange={(e) => setScorePlayer1(e.target.value)} />
              </div>
            <div>
              <Label htmlFor="scorePlayer2">Score Joueur 2 ({currentMatch?.players?.[1]?.username || 'Joueur 2'})</Label>
              <Input id="scorePlayer2" type="number" placeholder="Score" value={scorePlayer2} onChange={(e) => setScorePlayer2(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMatchDialogOpen(false)} disabled={saveMatchLoading}>
              Annuler
            </Button>
            <Button onClick={saveMatchChanges} disabled={saveMatchLoading}>
              {saveMatchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


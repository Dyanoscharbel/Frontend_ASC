import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, History, Award, Clock, Check, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "@/services/api"
import { toast } from "sonner"
import { formatCurrency, convertCurrencySync } from "@/config/currency"
import { useAuth } from "@/contexts/AuthContext"

interface Tournament {
  id: string;
  title: string;
  description: string;
  prize: string;
  status: "open" | "in-progress" | "upcoming" | "complete";
}

interface Reward {
  _id: string;
  userId: string;
  tournamentId: {
    _id: string;
    title: string;
  };
  type: 'win' | 'participation' | 'sponsorship' | 'legendary' | 'validation' | 'remboursement';
  amount: number;
  description: string;
  status: 'collected' | 'not_collected';
  date: string;
}

// Exemple de tournois en cours
const activeTournaments: Tournament[] = [
  {
    id: "t2",
    title: "Coupe des Nations",
    description: "Représentez votre pays dans cette compétition internationale de Dream League Soccer.",
    prize: "200 000 FCFA",
    status: "in-progress"
  },
  {
    id: "t9",
    title: "Tournoi des Champions",
    description: "Affrontez les meilleurs joueurs du continent pour remporter le titre de champion.",
    prize: "350 000 FCFA",
    status: "in-progress"
  }
];



export default function Rewards() {
  const [activeTab, setActiveTab] = useState("current")
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([])
  const [userRewards, setUserRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const { user, updateUserInfo } = useAuth();

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

  const getStatusBadge = (status: Reward["status"]) => {
    switch (status) {
      case "not_collected":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">À réclamer</span>
      case "collected":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Réclamé</span>
    }
  }

  const handleCollectReward = async (rewardId: string) => {
    if (!user || !updateUserInfo) {
      toast.error("Impossible de mettre à jour les informations utilisateur.");
      return;
    }

    try {
      const response = await api.post(`/rewards/${rewardId}/collect`);
      const { updatedReward, updatedUser: apiUpdatedUser } = response.data;
      
      setUserRewards(prevRewards => 
        prevRewards.map(r => r._id === rewardId ? { ...r, status: updatedReward.status, date: updatedReward.date } : r)
      );

      const newUserState = {
        ...user,
        solde: apiUpdatedUser.solde,
        pointsDeFidelite: apiUpdatedUser.pointsDeFidelite,
        ticketsDeTournois: apiUpdatedUser.ticketsDeTournois
      };
      updateUserInfo(newUserState);

      toast.success('Récompense réclamée avec succès !');
    } catch (error: any) {
      console.error("Erreur lors de la réclamation de la récompense:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la réclamation de la récompense";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchUserTournaments = async () => {
      try {
        const response = await api.get('/tournaments/user/tournaments');
        setUserTournaments(response.data.tournaments);
      } catch (error) {
        console.error("Erreur lors de la récupération des tournois:", error);
        toast.error("Impossible de charger vos tournois");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRewards = async () => {
      try {
        const response = await api.get('/rewards/user');
        setUserRewards(response.data.rewards);
      } catch (error) {
        console.error("Erreur lors de la récupération des récompenses:", error);
        toast.error("Impossible de charger vos récompenses");
      }
    };

    fetchUserTournaments();
    fetchUserRewards();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Récompenses & Prix</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Les prix sont versés dans un délai de 48h après réclamation. Assurez-vous que vos informations de paiement sont à jour dans votre profil.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="current" className="mb-6">
          <TabsList className="flex-nowrap overflow-x-auto max-w-full w-full scrollbar-hide">
            <TabsTrigger value="current">Prix Actuels</TabsTrigger>
            <TabsTrigger value="history">Historique & Réclamations</TabsTrigger>
            <TabsTrigger value="legendary">Prix Légendaire</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Chargement des tournois...</p>
              </div>
            ) : userTournaments.length > 0 ? (
              <div className="space-y-8">
                {userTournaments.map((tournament) => (
                  <div key={tournament.id} className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-asc-purple" />
                      {tournament.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{tournament.description}</p>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            1er Prix
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{formatAmount(parseInt(tournament.prize) * 0.5)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Prix pour le vainqueur du tournoi</p>
                          <div className="mt-4">
                            <p className="text-sm mb-2">Conditions de réclamation:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Victoire confirmée
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Pas de litiges en cours
                              </li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-gray-400" />
                            2ème Prix
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{formatAmount(parseInt(tournament.prize) * 0.3)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Prix pour le finaliste</p>
                          <div className="mt-4">
                            <p className="text-sm mb-2">Conditions de réclamation:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Position validée
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Pas de litiges en cours
                              </li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-amber-700" />
                            3ème Prix
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{formatAmount(parseInt(tournament.prize) * 0.2)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Prix pour la troisième place</p>
                          <div className="mt-4">
                            <p className="text-sm mb-2">Conditions de réclamation:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Position validée
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Pas de litiges en cours
                              </li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border-b border-gray-200 dark:border-gray-700 my-8"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aucun tournoi en cours pour le moment.
                </p>
                <Button variant="outline">Voir les tournois à venir</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Chargement de l'historique des récompenses...</p>
              </div>
            ) : userRewards.length > 0 ? (
              <div className="space-y-6">
                  {userRewards.map((reward) => (
                  <Card key={reward._id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                      <div>
                          <CardTitle className="text-lg mb-1">
                            {reward.type === 'win' && reward.tournamentId ? `Victoire : ${reward.tournamentId.title}` : reward.description || 'Récompense Spéciale'}
                          </CardTitle>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Date : {new Date(reward.date).toLocaleDateString()}
                        </p>
                        </div>
                        {getStatusBadge(reward.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div>
                          {reward.type === 'remboursement' ? (
                            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                              {reward.amount} tickets
                            </p>
                          ) : reward.type === 'validation' ? (
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                              Montant : {formatAmount(reward.amount)}
                            </p>
                          ) : reward.type === 'win' ? (
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                              Prix : {formatAmount(reward.amount)}
                            </p>
                          ) : (
                            <p className="text-lg font-medium">
                              Points : {reward.amount}
                            </p>
                          )}
                        </div>
                        {reward.status === 'not_collected' && (
                          <Button 
                            onClick={() => handleCollectReward(reward._id)} 
                            className={`mt-3 sm:mt-0 text-white ${
                              reward.type === 'validation' 
                                ? 'bg-green-500 hover:bg-green-600'
                                : reward.type === 'win'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : reward.type === 'remboursement'
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            size="sm" 
                          >
                            {reward.type === 'validation' 
                              ? 'Réclamer la Récompense' 
                              : reward.type === 'win'
                              ? 'Réclamer le Prix'
                              : reward.type === 'remboursement'
                              ? 'Réclamer les Tickets'
                              : 'Réclamer les Points'
                            }
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                    </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Vous n'avez aucune récompense dans votre historique pour le moment.
                      </p>
                    </div>
                  )}
          </TabsContent>

          <TabsContent value="legendary">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-purple-600" />
                  Prix Légendaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">5 000 000 FCFA</p>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Récompense exceptionnelle réservée aux exploits extraordinaires.
                    Les critères spécifiques sont annoncés avant chaque tournoi.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Conditions d'éligibilité:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Victoire dans un tournoi majeur
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Performance exceptionnelle
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Validation par le comité
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Gift, Users, User, Star, ArrowRight, Crown, Copy, Check, Info, UserPlus, ChevronRight, Award, Ticket, Loader2, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { rewardService, Reward } from "@/services/reward"
import { sponsorshipService, SponsorshipLevel } from "@/services/sponsorship"

interface SponsorshipLevelWithUI extends SponsorshipLevel {
  icon: LucideIcon;
  color: string;
}

interface SponsorshipData {
  currentRank: {
    name: string;
    level: number;
    icon: LucideIcon;
    color: string;
    benefits: {
      rewardTickets: number;
      earningsPercentage: number;
      rechargePercentage: number;
    };
  };
  nextRank: {
    name: string;
    level: number;
    icon: LucideIcon;
    color: string;
    minReferrals: number;
  };
  activeReferrals: number;
  requiredReferralsForNextRank: number;
  totalEarnings: number;
  recentReferrals: Array<{
    _id: string;
    username: string;
    avatar?: string;
    statistics: {
      tournamentsPlayed: number;
    };
  }>;
}

const Sponsorship = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user, updateUserInfo } = useAuth();
  const [sponsorshipLevels, setSponsorshipLevels] = useState<SponsorshipLevelWithUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sponsorshipData, setSponsorshipData] = useState<SponsorshipData>({
    currentRank: {
      name: user?.sponsorship?.level || "Aucun",
      level: 0,
      icon: Users,
      color: "text-gray-600 dark:text-gray-400",
      benefits: {
        rewardTickets: 0,
        earningsPercentage: 0,
        rechargePercentage: 0
      }
    },
    nextRank: {
      name: "Esclave ASC",
      level: 1,
      icon: Trophy,
      color: "text-blue-500",
      minReferrals: 1
    },
    activeReferrals: user?.sponsorship?.referrals?.length || 0,
    requiredReferralsForNextRank: 1,
    totalEarnings: user?.sponsorship?.commissionEarned || 0,
    recentReferrals: user?.sponsorship?.referrals?.map(referral => ({
      ...referral,
      isActive: true
    })) || []
  });
  const [ticketRewards, setTicketRewards] = useState<Reward[]>([]);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  // Charger les niveaux de parrainage depuis la base de données
  useEffect(() => {
    const loadSponsorshipLevels = async () => {
      try {
        const levels = await sponsorshipService.getSponsorshipLevels();
        setSponsorshipLevels(levels);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des niveaux de parrainage:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les niveaux de parrainage",
          variant: "destructive"
        });
      }
    };

    loadSponsorshipLevels();
  }, [toast]);

  // Mettre à jour les données de parrainage quand l'utilisateur ou les niveaux changent
  useEffect(() => {
    if (user && sponsorshipLevels.length > 0) {
      const loadSponsorshipStats = async () => {
        try {
          const stats = await sponsorshipService.getSponsorshipStats();
          const currentLevel = stats.currentLevel || "Aucun";
          const currentLevelInfo = sponsorshipLevels.find(level => level.name === currentLevel);
          
          // Vérifier si le niveau doit être mis à jour
          const checkAndUpdateLevel = async () => {
            try {
              const response = await sponsorshipService.updateSponsorshipLevel();
              if (response.newLevel && response.newLevel !== currentLevel) {
                // Mettre à jour les informations de l'utilisateur
                if (updateUserInfo && user) {
                  updateUserInfo({
                    ...user,
                    sponsorship: {
                      ...user.sponsorship,
                      level: response.newLevel
                    }
                  });
                }
                
                // Afficher une notification appropriée selon le type de changement
                toast({
                  title: response.isRegression ? "Niveau rétrogradé" : "Félicitations !",
                  description: response.isRegression
                    ? `Vous êtes maintenant au niveau ${response.newLevel} en raison d'une baisse du nombre de filleuls actifs.`
                    : `Vous avez atteint le niveau ${response.newLevel} !`,
                  variant: response.isRegression ? "destructive" : "default"
                });
              }
            } catch (error) {
              console.error('Erreur lors de la mise à jour du niveau:', error);
            }
          };

          await checkAndUpdateLevel();
          
          if (!currentLevelInfo) {
            // Si pas de niveau trouvé, utiliser les valeurs par défaut
            setSponsorshipData(prev => ({
              ...prev,
              currentRank: {
                name: "Aucun",
                level: 0,
                icon: Users,
                color: "text-gray-600 dark:text-gray-400",
                benefits: {
                  rewardTickets: 0,
                  earningsPercentage: 0,
                  rechargePercentage: 0
                }
              },
              nextRank: {
                name: "Esclave ASC",
                level: 1,
                icon: Trophy,
                color: "text-blue-500",
                minReferrals: 1
              },
              activeReferrals: stats.activeReferrals,
              requiredReferralsForNextRank: 1,
              totalEarnings: stats.commissionEarned,
              recentReferrals: stats.referrals.map(referral => ({
                ...referral,
                isActive: true
              }))
            }));
            return;
          }

          // Trouver le prochain niveau
          const nextLevelInfo = sponsorshipLevels.find(level => level.order === (currentLevelInfo.order + 1));

          setSponsorshipData(prev => ({
            ...prev,
            currentRank: {
              name: currentLevelInfo.name,
              level: currentLevelInfo.order,
              icon: currentLevelInfo.icon || Users,
              color: "text-gray-600 dark:text-gray-400",
              benefits: {
                rewardTickets: currentLevelInfo.rewardTickets,
                earningsPercentage: currentLevelInfo.earningsPercentage,
                rechargePercentage: currentLevelInfo.rechargePercentage
              }
            },
            nextRank: nextLevelInfo ? {
              name: nextLevelInfo.name,
              level: nextLevelInfo.order,
              icon: nextLevelInfo.icon || Trophy,
              color: "text-blue-500",
              minReferrals: nextLevelInfo.minReferrals
            } : {
              name: "Niveau maximum atteint",
              level: currentLevelInfo.order,
              icon: Crown,
              color: "text-yellow-500",
              minReferrals: currentLevelInfo.minReferrals
            },
            activeReferrals: stats.activeReferrals,
            requiredReferralsForNextRank: nextLevelInfo ? nextLevelInfo.minReferrals : currentLevelInfo.minReferrals,
            totalEarnings: stats.commissionEarned,
            recentReferrals: stats.referrals.map(referral => ({
              ...referral,
              isActive: true
            }))
          }));
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les statistiques de parrainage",
            variant: "destructive"
          });
        }
      };

      loadSponsorshipStats();
    }
  }, [user, sponsorshipLevels, toast, updateUserInfo]);

  useEffect(() => {
    const fetchTicketRewards = async () => {
      try {
        const rewards = await rewardService.getUserRewards();
        setTicketRewards(rewards.filter(r => r.type === 'sponsorship_tickets' && r.status === 'not_collected'));
      } catch (error) {
        console.error('Erreur lors de la récupération des récompenses de tickets:', error);
      }
    };

    fetchTicketRewards();
  }, []);

  const handleClaimTickets = async (rewardId: string) => {
    if (!user || !updateUserInfo) return;

    try {
      setIsClaimingReward(true);
      const response = await rewardService.claimReward(rewardId);
      
      // Mettre à jour les récompenses
      setTicketRewards(prev => prev.filter(r => r._id !== rewardId));
      
      // Mettre à jour le nombre de tickets de l'utilisateur
      updateUserInfo({
        ...user,
        ticketsDeTournois: response.newTickets
      });

      toast({
        title: "Tickets réclamés !",
        description: "Les tickets ont été ajoutés à votre compte.",
      });
    } catch (error) {
      console.error('Erreur lors de la réclamation des tickets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réclamer les tickets. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  const referralCode = user?.sponsorship?.referralCode || "";

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Code copié !",
      description: "Le code de parrainage a été copié dans votre presse-papiers.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Calcul du pourcentage de progression vers le rang suivant
  const progressToNextRank = Math.min(
    100,
    Math.round((sponsorshipData.activeReferrals / (sponsorshipData.requiredReferralsForNextRank - (sponsorshipData.currentRank.level === 0 ? 0 : sponsorshipLevels.find(level => level.order === sponsorshipData.currentRank.level)?.minReferrals || 0))) * 100) || 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-12 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-asc-purple" />
          </div>
        ) : (
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 flex-nowrap overflow-x-auto max-w-full scrollbar-hide">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="referrals">Mes Filleuls</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            {/* Récapitulatif du parrainage */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <Card className="border-2 border-asc-purple/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-asc-purple" />
                    Mon statut de parrainage
                  </CardTitle>
                  <CardDescription>Votre progression et vos avantages actuels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rang actuel et progression */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <sponsorshipData.currentRank.icon className={`h-5 w-5 ${sponsorshipData.currentRank.color}`} />
                        </div>
                        <div>
                          <p className="font-medium">{sponsorshipData.currentRank.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Niveau {sponsorshipData.currentRank.level}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-asc-purple/10">
                        {sponsorshipData.activeReferrals} filleuls actifs
                      </Badge>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Progression vers {sponsorshipData.nextRank.name}</span>
                        <span className="text-sm text-gray-500">{sponsorshipData.activeReferrals}/{sponsorshipData.requiredReferralsForNextRank} filleuls</span>
                      </div>
                      <Progress value={progressToNextRank} className="h-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Il vous manque {sponsorshipData.requiredReferralsForNextRank - sponsorshipData.activeReferrals} filleuls pour atteindre le rang suivant
                      </p>
                    </div>

                      {/* Avantages actuels */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium mb-2">Vos avantages actuels :</h4>
                        <ul className="space-y-2">
                          {sponsorshipData.currentRank.benefits.rewardTickets > 0 && (
                            <li className="flex items-center gap-2 text-sm">
                              <Gift className="h-4 w-4 text-asc-purple" />
                              <span>{sponsorshipData.currentRank.benefits.rewardTickets} tickets de tournoi offerts</span>
                            </li>
                          )}
                          {sponsorshipData.currentRank.benefits.earningsPercentage > 0 && (
                            <li className="flex items-center gap-2 text-sm">
                              <Trophy className="h-4 w-4 text-asc-purple" />
                              <span>{sponsorshipData.currentRank.benefits.earningsPercentage}% des gains des filleuls</span>
                            </li>
                          )}
                          {sponsorshipData.currentRank.benefits.rechargePercentage > 0 && (
                            <li className="flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-asc-purple" />
                              <span>{sponsorshipData.currentRank.benefits.rechargePercentage}% sur les recharges des filleuls</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Récompenses de tickets disponibles */}
                      {ticketRewards.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-asc-purple" />
                            Tickets à réclamer
                          </h4>
                          {ticketRewards.map((reward) => (
                            <div key={reward._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{reward.amount} tickets de tournoi</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{reward.description}</p>
                                </div>
                                <Button
                                  onClick={() => handleClaimTickets(reward._id)}
                                  disabled={isClaimingReward}
                                  className="bg-asc-purple hover:bg-asc-dark-purple text-white"
                                >
                                  {isClaimingReward ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Réclamation...
                                    </>
                                  ) : (
                                    <>
                                      <Ticket className="mr-2 h-4 w-4" />
                                      Réclamer
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Derniers filleuls */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-asc-purple" />
                      Vos derniers filleuls
                    </h3>
                    <div className="space-y-3">
                      {sponsorshipData.recentReferrals.length > 0 ? (
                        sponsorshipData.recentReferrals.map(referral => (
                          <div key={referral._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={referral.avatar} />
                                <AvatarFallback>{referral.username.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{referral.username}</p>
                                <p className="text-sm text-gray-500">
                                  {referral.statistics.tournamentsPlayed} tournois joués
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${
                                referral.statistics.tournamentsPlayed > 0
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {referral.statistics.tournamentsPlayed > 0 ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore de filleuls</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                        <Button variant="outline" className="w-full" onClick={copyReferralCode}>
                        Inviter plus de filleuls
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Gains totaux */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gains totaux du parrainage</p>
                        <p className="text-2xl font-bold">{sponsorshipData.totalEarnings.toLocaleString()} FCFA</p>
                      </div>
                      <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                        <Gift className="h-6 w-6 text-green-600 dark:text-green-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

              {/* Niveaux de parrainage */}
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Niveaux de Parrainage</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Évoluez dans notre système de parrainage et débloquez des avantages exclusifs
                </p>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sponsorshipLevels.map((level, index) => (
                  <motion.div
                      key={level._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${level.color} border-2 hover:border-asc-purple transition-all duration-300`}>
                      <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                            <level.icon className="h-8 w-8 text-asc-purple" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Niveau {level.order}
                          </span>
                        </div>
                          <CardTitle className="text-xl mb-1">{level.name}</CardTitle>
                          <CardDescription>{level.minReferrals} filleuls actifs requis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                            {level.rewardTickets > 0 && (
                              <li className="flex items-center gap-2 text-sm">
                                <Gift className="h-4 w-4 text-asc-purple" />
                                <span>{level.rewardTickets} tickets de tournoi offerts</span>
                              </li>
                            )}
                            {level.earningsPercentage > 0 && (
                              <li className="flex items-center gap-2 text-sm">
                                <Trophy className="h-4 w-4 text-asc-purple" />
                                <span>{level.earningsPercentage}% des gains des filleuls</span>
                              </li>
                            )}
                            {level.rechargePercentage > 0 && (
                              <li className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-asc-purple" />
                                <span>{level.rechargePercentage}% sur les recharges des filleuls</span>
                            </li>
                            )}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                  <CardTitle>Mes Filleuls</CardTitle>
                <CardDescription>Liste de vos filleuls et leur activité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    {sponsorshipData.recentReferrals.length > 0 ? (
                      <div className="space-y-3">
                        {sponsorshipData.recentReferrals.map(referral => (
                          <div key={referral._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={referral.avatar} />
                                <AvatarFallback>{referral.username.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{referral.username}</p>
                                <p className="text-sm text-gray-500">
                                  {referral.statistics.tournamentsPlayed} tournois joués
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${
                                referral.statistics.tournamentsPlayed > 0
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {referral.statistics.tournamentsPlayed > 0 ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400">Aucun filleul pour le moment</p>
                  </div>
                    )}
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Commencer à Parrainer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <code className="text-sm">Code de parrainage : {referralCode}</code>
                        </div>
                          <Button onClick={copyReferralCode} variant="outline" size="icon">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-16"
        >
          <Button 
            size="lg" 
            className="bg-asc-purple hover:bg-asc-dark-purple text-white"
            onClick={copyReferralCode}
          >
            {copied ? "Code Copié !" : "Commencer à Parrainer"}
            {copied ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default Sponsorship

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, User as UserIcon, Star, Shield, Users, TrendingUp, Award, Medal, Coins, Loader2, Bell, Gift, Ticket } from "lucide-react";
import { Badge as BadgeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TournamentCard from "@/components/TournamentCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import api from "@/services/api";
import { convertCurrencySync, formatCurrency } from "@/config/currency";
import { tournamentService, Tournament } from "../services/tournament";
import { walletService, MonthlyGains } from "../services/wallet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Reward } from "@/services/reward";

// Sample data (from original code)



const performanceData = [
  { month: "Jan", wins: 4, losses: 2, rating: 1250 },
  { month: "Fév", wins: 3, losses: 3, rating: 1225 },
  { month: "Mar", wins: 5, losses: 1, rating: 1300 },
  { month: "Avr", wins: 6, losses: 2, rating: 1350 },
  { month: "Mai", wins: 4, losses: 1, rating: 1375 },
  { month: "Juin", wins: 7, losses: 2, rating: 1400 },
];

const recentMatches = [
  { opponent: "PlayerX", result: "Victoire", score: "3-1", date: "Il y a 2h" },
  { opponent: "PlayerY", result: "Défaite", score: "1-2", date: "Il y a 5h" },
  { opponent: "PlayerZ", result: "Victoire", score: "2-0", date: "Hier" },
];

// Extend the User interface to include the new properties
declare module '@/contexts/AuthContext' {
  interface User {
    level?: number;
    statistics?: {
      tournamentsPlayed?: number;
      tournamentsWon?: number;
      totalWins?: number;
      totalLosses?: number;
      earningsRank?: number;
    };
    sponsorship?: {
      level?: string;
      referralCode?: string;
      referrals?: any[];
      referralRank?: number;
    };
    avatar?: string;
    solde?: number;
    preferredCurrency?: string;
    pointsDeFidelite?: number;
    ticketsDeTournois?: number;
  }
}

// Interface pour les matchs à venir
interface UpcomingMatch {
  id: string;
  tournamentId: string;
  tournamentName: string;
  opponent: string;
  date: string;
  time: string;
  matchCode: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [showReferralRank, setShowReferralRank] = useState(false);
  const [showZgeg, setShowZgeg] = useState(false);
  const [communications, setCommunications] = useState<any[]>([]);
  const [isLoadingCommunications, setIsLoadingCommunications] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [userUpcomingTournaments, setUserUpcomingTournaments] = useState<Tournament[]>([]);
  const [userActiveTournaments, setUserActiveTournaments] = useState<Tournament[]>([]);
  const [userPastTournaments, setUserPastTournaments] = useState<Tournament[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [monthlyGains, setMonthlyGains] = useState<MonthlyGains | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasNewCommunications, setHasNewCommunications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const [userRanks, setUserRanks] = useState<{ earningsRank: number | null; referralsRank: number | null; totalPlayers: number }>({
    earningsRank: null,
    referralsRank: null,
    totalPlayers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRanks = async () => {
      try {
        const response = await api.get('/leaderboard/user-ranks');
        setUserRanks(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des rangs:', error);
      }
    };

    fetchUserRanks();
  }, []);

  useEffect(() => {
    const rankInterval = setInterval(() => setShowReferralRank(prev => !prev), 4000);
    const zgegInterval = setInterval(() => setShowZgeg(prev => !prev), 3500);
    return () => {
      clearInterval(rankInterval);
      clearInterval(zgegInterval);
    };
  }, []);

  useEffect(() => {
    setIsLoadingCommunications(true);
    api.get('/communications?status=sent&limit=2')
      .then(res => {
        const fetchedCommunications = res.data.communications || [];
        setCommunications(fetchedCommunications);

        const lastViewTime = localStorage.getItem('lastNotificationsViewTime');
        const lastViewTimestamp = lastViewTime ? parseInt(lastViewTime, 10) : 0;

        if (fetchedCommunications.length > 0) {
          const newCommsFound = fetchedCommunications.filter(
            comm => new Date(comm.createdAt).getTime() > lastViewTimestamp
          );
          setUnreadNotificationsCount(newCommsFound.length);
          setHasNewCommunications(newCommsFound.length > 0);
        }
      })
      .catch(err => {
        setCommunications([]);
        console.error('Erreur lors de la récupération des communications:', err);
      })
      .finally(() => setIsLoadingCommunications(false));
  }, []);

  useEffect(() => {
    if (user && typeof user.solde === 'number') {
      const userCurrency = user.preferredCurrency || 'XOF';
      try {
        const converted = convertCurrencySync(user.solde, 'XOF', userCurrency);
        setConvertedAmount(converted);
      } catch (error) {
        console.error('Erreur de conversion du solde:', error);
        setConvertedAmount(user.solde);
      }
    }
  }, [user]);

  const formattedSolde = user && typeof user.solde === 'number'
    ? formatCurrency(convertedAmount, user.preferredCurrency || 'XOF')
    : formatCurrency(0, 'XOF');

  const copyReferralCode = () => {
    if (!user?.sponsorship?.referralCode) {
      toast.error("Code de parrainage non disponible");
      return;
    }
    navigator.clipboard.writeText(user.sponsorship.referralCode)
      .then(() => toast.success("Code de parrainage copié"))
      .catch(err => {
        console.error("Erreur de copie:", err);
        toast.error("Impossible de copier le code");
      });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;
      setIsLoadingTournaments(true);
      try {
        const userTournamentsData = await tournamentService.getUserTournaments();
        setUserUpcomingTournaments(userTournamentsData.filter(t => t.status === 'upcoming' || t.status === 'open'));
        setUserActiveTournaments(userTournamentsData.filter(t => t.status === 'in-progress'));
        setUserPastTournaments(userTournamentsData.filter(t => t.status === 'complete'));
        const gains = await walletService.getMonthlyGains();
        setMonthlyGains(gains);
      } catch (error) {
        console.error("Erreur chargement données dashboard:", error);
      } finally {
        setIsLoadingTournaments(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const formatMonthlyGains = () => {
    if (!monthlyGains || typeof monthlyGains.monthlyGains !== 'number') {
      return `+${formatCurrency(0, user?.preferredCurrency || 'XOF')} ce mois`;
    }
    
    const userCurrency = user?.preferredCurrency || 'XOF';
    let amount = monthlyGains.monthlyGains;
    
    if (userCurrency !== 'XOF') {
      try {
        amount = convertCurrencySync(monthlyGains.monthlyGains, 'XOF', userCurrency);
      } catch (error) {
        console.error('Erreur de conversion des gains mensuels:', error);
        amount = 0;
      }
    }
    
    return `+${formatCurrency(amount, userCurrency)} ce mois`;
  };

  // Calculs pour les cartes de statistiques
  const tournamentsPlayed = user?.statistics?.tournamentsPlayed || 0;
  const totalWins = user?.statistics?.totalWins || 0;
  const totalLosses = user?.statistics?.totalLosses || 0;
  const winPercentage = (totalWins + totalLosses) > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;

  const tournamentsSummary = `
    ${userPastTournaments.length} terminés • 
    ${userActiveTournaments.length} en cours • 
    ${userUpcomingTournaments.length} à venir
  `;

  // Pour une meilleure gestion des types, il est recommandé de définir ces types plus globalement
  // et de s'assurer que l'objet `user` de `useAuth` correspond à ces types.
  const userStats = user?.statistics as { tournamentsPlayed?: number; tournamentsWon?: number; totalWins?: number; totalLosses?: number; earningsRank?: number; } | undefined;
  const userSponsorship = user?.sponsorship as { level?: string; referralCode?: string; referrals?: any[]; referralRank?: number; } | undefined;

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await api.get('/rewards/user');
        // Prendre les 2 dernières récompenses
        const latestRewards = response.data.rewards.slice(0, 2);
        setRewards(latestRewards);
      } catch (error) {
        console.error('Erreur lors de la récupération des récompenses:', error);
      } finally {
        setIsLoadingRewards(false);
      }
    };

    fetchRewards();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {authLoading || !user ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-asc-purple" />
        </div>
      ) : (
        <main className="flex-grow py-8 px-4">
          <div className="container max-w-7xl mx-auto">
            <div className="absolute top-4 right-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Bell className="h-6 w-6 text-asc-purple" />
                {unreadNotificationsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadNotificationsCount}
                  </motion.div>
                )}
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-center mb-6">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-20 h-20 bg-gradient-to-br from-asc-purple to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={`Avatar de ${user.username}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                const fallbackIcon = document.createElement('div');
                                fallbackIcon.className = "w-full h-full flex items-center justify-center";
                                fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                parent.appendChild(fallbackIcon);
                            }
                          }}
                        />
                      ) : (
                      <UserIcon className="h-10 w-10" />
                      )}
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 ring-2 ring-white dark:ring-gray-800">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <Link to="/profile">
                      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-asc-purple to-purple-600 hover:opacity-80 transition-opacity">
                        {user.username || "JoueurASC"}
                      </h1>
                    </Link>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Award className="h-4 w-4" />
                      <span>{userSponsorship?.level || "Aucun"}</span>
                      {userSponsorship?.level && userSponsorship.level !== "Aucun" && (
                        <>
                        
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
                <Link to="/wallet" className="block w-[200px]">
                  <motion.div whileHover={{ scale: 1.02 }} className="w-[200px]">
                    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0">
                    <CardContent className="p-4 h-[72px]">
                      <AnimatePresence mode="wait">
                        {showZgeg ? (
                          <motion.div 
                            key="zgeg"
                            className="flex items-center gap-3 absolute inset-0 p-4 bg-gradient-to-br from-purple-500 to-purple-600"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Coins className="h-6 w-6 text-white" />
                            <div className="text-white">
                              <p className="text-sm opacity-90">Solde</p>
                              <p className="text-xl font-bold">{formattedSolde}</p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="points"
                            className="flex items-center gap-3 absolute inset-0 p-4 bg-gradient-to-br from-yellow-400 to-yellow-500"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Star className="h-6 w-6 text-white" />
                            <div className="text-white">
                              <p className="text-sm opacity-90">Points de fidélité</p>
                              <p className="text-xl font-bold">{user.pointsDeFidelite || 0}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                  </motion.div>
                </Link>

                <Link to="/leaderboard" className="block w-[200px]">
                  <motion.div whileHover={{ scale: 1.02 }} className="w-[200px]">
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden w-full border-0">
                    <CardContent className="p-4 flex items-center gap-3 h-[72px]">
                      <AnimatePresence mode="wait">
                        {!showReferralRank ? (
                          <motion.div 
                            key="earnings"
                            className="flex items-center gap-3 absolute inset-0 p-4"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Medal className="h-6 w-6 text-white" />
                            <div className="text-white">
                              <p className="text-sm opacity-90">Classement gains</p>
                              <p className="text-xl font-bold">
                                {userRanks.earningsRank ? (
                                  `#${userRanks.earningsRank}/${userRanks.totalPlayers}`
                                ) : (
                                  "Non classé"
                                )}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="referrals"
                            className="flex items-center gap-3 absolute inset-0 p-4"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Users className="h-6 w-6 text-white" />
                            <div className="text-white">
                              <p className="text-sm opacity-90">Classement filleuls</p>
                              <p className="text-xl font-bold">
                                {userRanks.referralsRank ? (
                                  `#${userRanks.referralsRank}/${userRanks.totalPlayers}`
                                ) : (
                                  "Non classé"
                                )}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                  </motion.div>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5" /> 
                    <p className="font-medium">Tournois</p>
                  </div>
                  <div className="relative">
                    <h2 className="text-5xl font-bold mt-2">{tournamentsPlayed}</h2>
                    <p className="text-sm mt-2 opacity-90">
                      {tournamentsSummary}
                    </p>
                    <div className="absolute right-0 top-0 opacity-20">
                      <Trophy className="h-16 w-16" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" /> 
                    <p className="font-medium">Performance</p>
                  </div>
                  <div className="relative">
                    <h2 className="text-5xl font-bold mt-2">
                      {winPercentage}%
                    </h2>
                    <p className="text-sm mt-2 opacity-90">
                      {totalWins} victoires • {totalLosses} défaites
                    </p>
                    <div className="absolute right-0 top-0 opacity-20">
                      <TrendingUp className="h-16 w-16" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-5 w-5" /> 
                    <p className="font-medium">Gains</p>
                  </div>
                  <div className="relative">
                    <h2 className="text-5xl font-bold mt-2">
                      {formattedSolde}
                    </h2>
                    <p className="text-sm mt-2 opacity-90">{formatMonthlyGains()}</p>
                    <div className="absolute right-0 top-0 opacity-20">
                      <Coins className="h-16 w-16" />
                    </div>
                  </div>
                </motion.div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-asc-purple" />
                        Communications récentes
                        {hasNewCommunications && (
                          <span 
                            className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"
                            title="Nouvelles communications"
                          ></span>
                        )}
                      </CardTitle>
                      <Link to="/notifications" className="text-sm text-asc-purple hover:text-purple-700 dark:hover:text-purple-400 flex items-center gap-1">
                        <span>Voir toutes les communications</span>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {isLoadingCommunications ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 text-asc-purple animate-spin" />
                          </div>
                        ) : communications.length > 0 ? (
                          communications.slice(0, 2).map((comm: any) => (
                            <motion.div
                              key={comm._id}
                              whileHover={{ scale: 1.02 }}
                              className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400">
                                  {new Date(comm.scheduledDate || comm.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="font-semibold truncate text-gray-800 dark:text-gray-100">
                                {comm.title}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                {comm.content?.length > 80 ? comm.content.slice(0, 80) + '…' : comm.content}
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            Aucune communication récente
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Gift className="h-5 w-5 text-asc-purple" />
                        Dernières récompenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingRewards ? (
                        <div className="flex justify-center items-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin text-asc-purple" />
                        </div>
                      ) : rewards.length > 0 ? (
                        <div className="space-y-4">
                          {rewards.map((reward) => (
                            <div key={reward._id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium">{reward.description || 'Récompense'}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(reward.date).toLocaleDateString()}
                                  </p>
                                </div>
                                {reward.status === 'not_collected' ? (
                                  <BadgeIcon className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <BadgeIcon className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {reward.type === 'remboursement' ? (
                                  <>
                                    <Ticket className="h-4 w-4 text-blue-500" />
                                    <span>{reward.amount} tickets</span>
                                  </>
                                ) : reward.type === 'participation' || reward.type === 'legendary' ? (
                                  <>
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span>{reward.amount} points</span>
                                  </>
                                ) : (
                                  <>
                                    <Coins className="h-4 w-4 text-green-500" />
                                    <span>{formatCurrency(reward.amount, user?.preferredCurrency || 'XOF')}</span>
                                  </>
                                )}
                              </div>
                              {reward.tournamentId && (
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  <span>{reward.tournamentId.title}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Aucune récompense récente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {user?.role === 'validator' && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => navigate('/validator-dashboard')}
                >
                  <Shield className="h-4 w-4" />
                  Espace Validateur
                </Button>
              )}
            </motion.div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Dashboard;
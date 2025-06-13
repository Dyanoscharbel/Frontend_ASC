import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp, Users, Medal, Calendar, Loader2, AlertTriangle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from '@/contexts/AuthContext';
import { statisticsService, UserOverallStats, MatchHistoryItem, MonthlyPerformanceItem } from '@/services/statisticsService';
import { Button } from '@/components/ui/button';

// Helper to format date, you might want to move this to a utils file
const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function Statistics() {
  const { user } = useAuth();
  const [overallStats, setOverallStats] = useState<UserOverallStats | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<MonthlyPerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) {
      setError("Utilisateur non connecté. Impossible de charger les statistiques.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, historyData, performanceData] = await Promise.all([
        statisticsService.getUserOverallStats(),
        statisticsService.getMatchHistory(), // Default limit is 10
        statisticsService.getMonthlyPerformance(),
      ]);
      setOverallStats(statsData);
      setMatchHistory(historyData);
      setMonthlyPerformance(performanceData);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      setError(err.response?.data?.message || err.message || "Une erreur est survenue lors du chargement des statistiques.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Erreur de chargement</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
        <Button onClick={fetchData}>Réessayer</Button>
      </div>
    );
  }
  
  if (!overallStats) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <Info className="h-12 w-12 text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucune donnée</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Aucune statistique n'est disponible pour le moment.</p>
        <Button onClick={fetchData} variant="outline">Actualiser</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold">Statistiques de {user?.username || 'l\'utilisateur'}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Suivez vos performances et votre progression</p>
            </div>
            <Button onClick={fetchData} variant="outline" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Actualiser
            </Button>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Victoires</p>
                      <p className="text-2xl font-bold">{overallStats.totalWins}</p>
                      {overallStats.currentMonthStats.wins > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">+{overallStats.currentMonthStats.wins} ce mois</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Défaites</p>
                      <p className="text-2xl font-bold">{overallStats?.totalLosses || 0}</p>
                      {overallStats?.currentMonthStats?.lossesThisMonth > 0 && (
                        <p className="text-xs text-red-500 dark:text-red-400">
                          +{overallStats.currentMonthStats.lossesThisMonth} ce mois-ci
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tournois Gagnés</p>
                      <p className="text-2xl font-bold">{overallStats.tournamentsWon}</p>
                      {overallStats.currentMonthStats.tournamentsWonThisMonth > 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">+{overallStats.currentMonthStats.tournamentsWonThisMonth} ce mois</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Matchs Joués</p>
                      <p className="text-2xl font-bold">{overallStats.totalMatchesPlayed}</p>
                      {overallStats.currentMonthStats.matchesPlayed > 0 && (
                        <p className="text-xs text-purple-600 dark:text-purple-400">+{overallStats.currentMonthStats.matchesPlayed} ce mois</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Derniers Matchs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {matchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {matchHistory.map((match) => (
                        <div 
                          key={match._id} 
                          className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">{match.opponentName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{match.tournamentName || 'Match amical'}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                match.result === "win" ? "text-green-600 dark:text-green-400" 
                                : match.result === "loss" ? "text-red-500 dark:text-red-400" 
                                : "text-gray-600 dark:text-gray-400" // Draw or other
                              }`}>
                                {match.result === "win" ? "Victoire" : match.result === "loss" ? "Défaite" : "Nul"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{match.score || '-'}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(match.date)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">Aucun historique de match disponible.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Performance Mensuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyPerformance.length > 0 ? (
                    <div className="h-[300px] relative flex items-end justify-around px-2 pb-8 border-b border-gray-200 dark:border-gray-700">
                      {monthlyPerformance.map((data, index) => {
                        const losses = data.matchesPlayed - data.wins;
                        const winHeight = Math.max(data.wins * 6, 2); // Min height for visibility
                        const lossHeight = Math.max(losses * 6, 2); // Min height for visibility
                        return (
                          <div key={`${data.month}-${data.year}`} className="flex flex-col items-center gap-1 w-12 text-center group">
                            <div className="flex items-end h-[220px]">
                               <div
                                title={`${data.wins} victoires`}
                                className="w-5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 rounded-t-md transition-all relative group"
                                style={{ height: `${winHeight}px` }}
                              >
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white px-1 rounded">
                                  {data.wins}
                                </span>
                               </div>
                               <div
                                title={`${losses} défaites`}
                                className="w-5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded-t-md transition-all relative group"
                                style={{ height: `${lossHeight}px` }}
                              >
                                 <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white px-1 rounded">
                                  {losses}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">{data.month}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{data.year}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4 h-[300px] flex items-center justify-center">
                      Aucune donnée de performance mensuelle disponible.
                    </p>
                  )}
                  {monthlyPerformance.length > 0 && (
                    <div className="mt-4 flex justify-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Victoires</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Défaites</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

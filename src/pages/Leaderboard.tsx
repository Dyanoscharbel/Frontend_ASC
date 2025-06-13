import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Medal, Award, Users, Coins, ChevronUp, Filter, Loader2 } from "lucide-react";
import api from "@/services/api";

// Définition des types pour les utilisateurs
interface UserBase {
  rank: number;
  username: string;
  avatar: string | null;
  badges: string[];
}

interface EarningsUser extends UserBase {
  earnings: number;
}

interface ReferralsUser extends UserBase {
  referrals: number;
}

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("earnings");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [earningsLeaderboard, setEarningsLeaderboard] = useState<EarningsUser[]>([]);
  const [referralsLeaderboard, setReferralsLeaderboard] = useState<ReferralsUser[]>([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setIsLoading(true);
      try {
        const [earningsRes, referralsRes] = await Promise.all([
          api.get('/leaderboard/earnings'),
          api.get('/leaderboard/referrals')
        ]);
        setEarningsLeaderboard(earningsRes.data);
        setReferralsLeaderboard(referralsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des classements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  // Fonction pour filtrer les classements en fonction de la recherche
  const filterLeaderboard = <T extends UserBase>(leaderboard: T[]): T[] => {
    if (!searchQuery) return leaderboard;
    return leaderboard.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Obtenir les classements filtrés
  const filteredEarnings = filterLeaderboard(earningsLeaderboard);
  const filteredReferrals = filterLeaderboard(referralsLeaderboard);

  // Fonction pour rendre les rangs avec des icônes spéciales pour le top 3
  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
          <Trophy className="h-4 w-4 text-yellow-600" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
          <Medal className="h-4 w-4 text-gray-500" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
          <Award className="h-4 w-4 text-orange-600" />
        </div>
      );
    }
    
    return <span className="text-lg font-medium text-gray-600">{rank}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-asc-purple mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement des classements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-asc-purple to-purple-600">
                  Classements
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Découvrez les meilleurs joueurs de la communauté ASC
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher un joueur" 
                    className="pl-9 w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm flex-nowrap overflow-x-auto max-w-full w-full">
              <TabsTrigger value="earnings" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span>Classement par gains</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Classement par filleuls</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="earnings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top gains</CardTitle>
                  <CardDescription>Classement des joueurs ayant remporté le plus de gains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEarnings.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">Aucun joueur trouvé</p>
                    ) : (
                      filteredEarnings.map((user) => (
                        <div 
                          key={user.username} 
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-asc-purple dark:hover:border-asc-purple transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 mr-4">
                              {renderRank(user.rank)}
                            </div>
                            
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 border-2 border-asc-purple">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.username} />
                                ) : (
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                                    {user.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              
                              <div className="ml-4">
                                <div className="font-medium text-lg">
                                  {user.username}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.badges.map((badge, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700">
                                      {badge}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-asc-purple">{user.earnings.toLocaleString()} XOF</div>
                            <div className="text-xs text-gray-500">Gains totaux</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top parrains</CardTitle>
                  <CardDescription>Classement des joueurs ayant parrainé le plus de filleuls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReferrals.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">Aucun joueur trouvé</p>
                    ) : (
                      filteredReferrals.map((user) => (
                        <div 
                          key={user.username} 
                          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-asc-purple dark:hover:border-asc-purple transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 mr-4">
                              {renderRank(user.rank)}
                            </div>
                            
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 border-2 border-asc-purple">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.username} />
                                ) : (
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                                    {user.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              
                              <div className="ml-4">
                                <div className="font-medium text-lg">
                                  {user.username}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.badges.map((badge, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-gray-50 dark:bg-gray-700">
                                      {badge}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-asc-purple">{user.referrals} filleuls</div>
                            <div className="text-xs text-gray-500">Filleuls actifs</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard; 
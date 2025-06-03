import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users, Trophy, AlertTriangle, Activity,
  LineChart, RefreshCw, Megaphone, Scale, 
  ChevronRight, MessageSquare, Plus, Info,
  CalendarClock, Crown, DollarSign
} from "lucide-react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';
import api from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Les données par défaut au cas où l'API ne renvoie rien
const defaultDailyData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    name: format(date, 'dd/MM', { locale: fr }),
    users: 0,
    revenue: 0,
    date: date.toISOString(),
  };
});

// Tournoi par défaut (placeholder)
const defaultTournament = {
  title: "ASC Premier League",
  status: "open",
  date: "À déterminer",
  final: {
    name: "Finale",
    date: "À déterminer",
    player1: "À déterminer",
    player2: "À déterminer",
    status: "upcoming"
  },
  semifinals: [
    {
      name: "Demi-finale 1",
      date: "À déterminer",
      player1: "À déterminer",
      player2: "À déterminer",
      status: "upcoming"
    },
    {
      name: "Demi-finale 2",
      date: "À déterminer",
      player1: "À déterminer",
      player2: "À déterminer",
      status: "upcoming"
    }
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState(defaultDailyData);
  const [currentTournament, setCurrentTournament] = useState<any>(null);
  const [ongoingTournaments, setOngoingTournaments] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
      
      // Mettre à jour les statistiques quotidiennes si elles sont disponibles
      if (res.data.dailyStats && Array.isArray(res.data.dailyStats) && res.data.dailyStats.length > 0) {
        const formattedStats = res.data.dailyStats.map(stat => {
          if (stat.date) {
            const dateObj = new Date(stat.date);
            return {
              ...stat,
              name: format(dateObj, 'dd/MM', { locale: fr }),
              originalDate: stat.date
            };
          }
          return stat;
        });
        formattedStats.sort((a, b) => {
          if (a.originalDate && b.originalDate) {
            return new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime();
          }
          return 0;
        });
        setDailyData(formattedStats);
      }
      
      // Récupérer les tournois en cours (statut "in-progress" uniquement)
      try {
        // Spécifier explicitement qu'on veut uniquement les tournois avec statut "in-progress"
        const tournamentsRes = await api.get('/admin/tournaments?status=in-progress');
        if (tournamentsRes?.data) {
          // S'assurer que les données sont un tableau
          let tournamentsData = Array.isArray(tournamentsRes.data) 
            ? tournamentsRes.data 
            : tournamentsRes.data.tournaments || [];
          
          // Filtrer pour ne garder que les tournois avec statut "in-progress"
          tournamentsData = tournamentsData.filter(tournament => 
            tournament.status === 'in-progress'
          );
          
          // Récupérer les détails complets pour chaque tournoi en cours
          const detailedTournaments = await Promise.all(
            tournamentsData.map(async (tournament) => {
              if (!tournament._id) return tournament;
              
              try {
                // Tenter de récupérer les détails complets du tournoi
                const detailRes = await api.get(`/admin/tournaments/${tournament._id}`);
                const detailedTournament = detailRes.data || tournament;
                
                // Ne renvoyer que si le statut est bien "in-progress"
                if (detailedTournament.status === 'in-progress') {
                  return detailedTournament;
                }
                return null;
              } catch (err) {
                console.error(`Erreur lors de la récupération des détails pour le tournoi ${tournament._id}:`, err);
                return tournament.status === 'in-progress' ? tournament : null;
              }
            })
          );
          
          // Filtrer les tournois nuls (ceux qui n'ont pas le statut "in-progress")
          const filteredTournaments = detailedTournaments.filter(Boolean);
          
          setOngoingTournaments(filteredTournaments);
          
          // Définir le premier tournoi en cours comme tournoi actuel à afficher
          if (filteredTournaments.length > 0) {
            // S'assurer que le tournoi a les propriétés nécessaires
            const firstTournament = filteredTournaments[0];
            // Vérifier si le tournoi a les propriétés de bracket attendues, sinon utiliser le défaut
            if (!firstTournament.final || !firstTournament.semifinals) {
              setCurrentTournament({
                ...firstTournament,
                ...defaultTournament
              });
            } else {
              setCurrentTournament(firstTournament);
            }
          } else {
            setCurrentTournament(null);
          }
        } else {
          setOngoingTournaments([]);
          setCurrentTournament(null);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des tournois en cours:", err);
        setOngoingTournaments([]);
        setCurrentTournament(null);
      }
      
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err);
      setOngoingTournaments([]);
      setCurrentTournament(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Chargement...' : 'Actualiser'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users">
          <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? stats.users.total : '--'}</div>
              <p className="text-xs text-muted-foreground">+{stats ? stats.users.growth : '--'}% ce mois</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/tournaments">
          <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tournois</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? stats.tournaments.total : '--'}</div>
              <p className="text-xs text-muted-foreground">{stats ? stats.tournaments.ongoing : '--'} en cours</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/disputes">
          <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Litiges</CardTitle>
              <Scale className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? stats.disputes.total : '--'}</div>
              <p className="text-xs text-muted-foreground">{stats ? stats.disputes.pending : '--'}/{stats ? stats.disputes.total : '--'} en attente</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/communications">
          <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Communications</CardTitle>
              <Megaphone className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? stats.communications.total : '--'}</div>
              <p className="text-xs text-muted-foreground">{stats ? stats.communications.scheduled : '--'} programmée(s)</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {`Tournois en cours (${ongoingTournaments.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ongoingTournaments.length > 0 ? (
              <div className="divide-y">
                {ongoingTournaments.map((tournament, index) => (
                  <div key={tournament?._id || index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-md mr-4">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-base">{tournament?.title || `Tournoi #${index + 1}`}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" /> 
                              {tournament?.players?.length || 0} joueurs
                            </span>
                            <span className="flex items-center mt-1">
                              <DollarSign className="h-3 w-3 mr-1" /> 
                              Prix: {tournament?.prize?.toLocaleString() || '--'} FCFA
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 shadow-sm">
                          En cours
                        </div>
                        <Link to={`/admin/tournaments/${tournament?._id || index}`}>
                          <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-4 flex justify-end bg-gray-50/50">
                  <Link to="/admin/tournaments">
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Voir tous les tournois
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <Info className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun tournoi en cours</h3>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  Créez un nouveau tournoi pour l'afficher ici et commencer à organiser des compétitions.
                </p>
                <Link to="/admin/tournaments/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un tournoi
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white via-indigo-50 to-purple-50">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Statistiques des inscriptions
            </CardTitle>
            <div className="text-sm text-gray-500 mt-1">Nombre d'inscriptions sur les 14 derniers jours</div>
          </CardHeader>
          <CardContent className="pt-6">
            <div style={{ width: '100%', height: 320, background: 'linear-gradient(120deg, #f5f3ff 0%, #e0e7ff 100%)', borderRadius: 16, padding: 8 }}>
              <ResponsiveContainer>
                <RechartsLineChart width={500} height={320} data={dailyData} margin={{ top: 30, right: 30, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7}/>
                      <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#a5b4fc" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6366f1', fontSize: 14, fontWeight: 500 }}
                    tickMargin={12}
                    axisLine={{ stroke: '#c7d2fe' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6366f1', fontSize: 14, fontWeight: 500 }}
                    axisLine={{ stroke: '#c7d2fe' }}
                    tickMargin={12}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 24px rgba(99,102,241,0.10)',
                      border: 'none',
                      padding: '14px',
                      background: '#fff',
                      color: '#3730a3',
                      fontWeight: 500
                    }} 
                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#6366f1', fontSize: 15 }}
                    formatter={(value) => [`${value} inscriptions`, 'Utilisateurs']}
                    separator={': '}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#6366f1" 
                    strokeWidth={0}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    filter="url(#shadow)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#7c3aed" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#fff', stroke: '#7c3aed', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#a5b4fc', stroke: '#7c3aed', strokeWidth: 3 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-600">
          {stats ? stats.disputes.pending : '...'} litiges nécessitent votre attention. <Link to="/admin/disputes" className="font-medium underline">Voir les litiges</Link>
        </AlertDescription>
      </Alert>
    </div>
  );
}

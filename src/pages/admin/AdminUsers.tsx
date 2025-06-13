import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserX, Shield, RefreshCw, Search, Mail, Phone, AlertTriangle, History, Clock, Unlock } from "lucide-react";
import api from '@/services/api';
import { toast } from "@/components/ui/use-toast";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTab, setSelectedTab] = useState("list");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // État pour la suspension
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState(null);
  const [suspendUsername, setSuspendUsername] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("24h");
  const [suspendLoading, setSuspendLoading] = useState(false);
  
  // État pour le bannissement
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banUserId, setBanUserId] = useState(null);
  const [banUsername, setBanUsername] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banLoading, setBanLoading] = useState(false);
  
  // État pour le débannissement
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [unbanUserId, setUnbanUserId] = useState(null);
  const [unbanUsername, setUnbanUsername] = useState("");
  const [unbanLoading, setUnbanLoading] = useState(false);
  
  // État pour la levée de suspension
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);
  const [unsuspendUserId, setUnsuspendUserId] = useState(null);
  const [unsuspendUsername, setUnsuspendUsername] = useState("");
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);

  // Fonction utilitaire pour mettre à jour le statut d'un utilisateur
  const updateUserStatus = (userId, isSuspended) => {
    setUsers(users.map(user => {
      if (user._id === userId) {
        return {
          ...user,
          isSuspended
        };
      }
      return user;
    }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      
      // Vérifier les suspensions expirées
      const usersWithUpdatedSuspensions = response.data.map(user => {
        if (user.isSuspended && user.suspendedUntil) {
          const now = new Date();
          const suspendedUntil = new Date(user.suspendedUntil);
          
          // Si la suspension est expirée, réinitialiser l'état de suspension dans l'UI
          if (suspendedUntil <= now) {
            return {
              ...user,
              isSuspended: false,
              suspendedUntil: null
            };
          }
        }
        return user;
      });
      
      setUsers(usersWithUpdatedSuspensions);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    // Ne jamais afficher les utilisateurs avec le rôle admin
    if (user.role === 'admin') return false;
    
    // Filtrage par onglet sélectionné
    if (selectedTab === "vip") {
      if (!user.sponsorship?.level || 
          !["Noble ASC", "Roturier ASC"].includes(user.sponsorship.level)) {
        return false;
      }
    } else if (selectedTab === "validators") {
      if (user.role !== 'validator') return false;
    } else if (selectedTab === "banned") {
      if (!user.isBanned) return false;
    }
    
    // Filtrage par recherche
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrage par statut
    if (selectedStatus === "all") {
      return matchesSearch;
    } else if (selectedStatus === "active") {
      return matchesSearch && !user.isBanned && !user.isSuspended;
    } else if (selectedStatus === "banned") {
      return matchesSearch && user.isBanned;
    } else if (selectedStatus === "suspended") {
      return matchesSearch && user.isSuspended;
    }

    return matchesSearch;
  });

  const handleSuspendUser = async () => {
    if (!suspendUserId) return;
    
    setSuspendLoading(true);
    try {
      await api.post(`/admin/users/${suspendUserId}/suspend`, {
        duration: suspendDuration
      });
      
      // Mettre à jour l'utilisateur dans la liste
      setUsers(users.map(user => {
        if (user._id === suspendUserId) {
          return {
            ...user,
            isSuspended: true,
            suspendedUntil: new Date(Date.now() + getDurationInMs(suspendDuration)).toISOString()
          };
        }
        return user;
      }));
      
      toast({
        title: "Utilisateur suspendu",
        description: `${suspendUsername} a été suspendu pour ${getSuspendDurationLabel(suspendDuration)}.`,
        variant: "default"
      });
      
      setSuspendDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suspension de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'utilisateur. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banUserId) return;
    
    setBanLoading(true);
    try {
      await api.post(`/admin/users/${banUserId}/ban`, {
        reason: banReason
      });
      
      // Mettre à jour l'utilisateur dans la liste
      setUsers(users.map(user => {
        if (user._id === banUserId) {
          return {
            ...user,
            isBanned: true,
            isSuspended: false // Si l'utilisateur était suspendu, on annule la suspension
          };
        }
        return user;
      }));
      
      toast({
        title: "Utilisateur banni",
        description: `${banUsername} a été banni définitivement.`,
        variant: "default"
      });
      
      setBanDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors du bannissement de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de bannir l'utilisateur. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!unbanUserId) return;
    
    setUnbanLoading(true);
    try {
      await api.post(`/admin/users/${unbanUserId}/unban`);
      
      // Mettre à jour l'utilisateur dans la liste
      setUsers(users.map(user => {
        if (user._id === unbanUserId) {
          return {
            ...user,
            isBanned: false
          };
        }
        return user;
      }));
      
      toast({
        title: "Utilisateur débanni",
        description: `${unbanUsername} a été débanni avec succès.`,
        variant: "default"
      });
      
      setUnbanDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors du débannissement de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de débannir l'utilisateur. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setUnbanLoading(false);
    }
  };

  // Fonction pour lever une suspension (avec confirmation via dialogue)
  const handleUnsuspendUser = async () => {
    if (!unsuspendUserId) return;
    
    setUnsuspendLoading(true);
    try {
      await api.post(`/admin/users/${unsuspendUserId}/unsuspend`);
      
      // Mettre à jour l'utilisateur dans la liste
      updateUserStatus(unsuspendUserId, false);
      
      toast({
        title: "Suspension levée",
        description: `La suspension de ${unsuspendUsername} a été levée.`,
        variant: "default"
      });
      
      setUnsuspendDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la levée de la suspension:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lever la suspension. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setUnsuspendLoading(false);
    }
  };

  // Fonction pour ouvrir le dialogue de levée de suspension
  const openUnsuspendDialog = (userId, username) => {
    setUnsuspendUserId(userId);
    setUnsuspendUsername(username);
    setUnsuspendDialogOpen(true);
  };

  const openSuspendDialog = (userId, username) => {
    setSuspendUserId(userId);
    setSuspendUsername(username);
    setSuspendDialogOpen(true);
  };

  const openBanDialog = (userId, username) => {
    setBanUserId(userId);
    setBanUsername(username);
    setBanDialogOpen(true);
  };

  const openUnbanDialog = (userId, username) => {
    setUnbanUserId(userId);
    setUnbanUsername(username);
    setUnbanDialogOpen(true);
  };

  const getDurationInMs = (duration) => {
    switch (duration) {
      case "1h": return 60 * 60 * 1000;
      case "6h": return 6 * 60 * 60 * 1000;
      case "12h": return 12 * 60 * 60 * 1000;
      case "24h": return 24 * 60 * 60 * 1000;
      case "3d": return 3 * 24 * 60 * 60 * 1000;
      case "7d": return 7 * 24 * 60 * 60 * 1000;
      case "30d": return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000; // 24h par défaut
    }
  };

  const getSuspendDurationLabel = (duration) => {
    switch (duration) {
      case "1h": return "1 heure";
      case "6h": return "6 heures";
      case "12h": return "12 heures";
      case "24h": return "24 heures";
      case "3d": return "3 jours";
      case "7d": return "7 jours";
      case "30d": return "30 jours";
      default: return "24 heures";
    }
  };

  const getUserStatusBadge = (user) => {
    if (user.isBanned) {
      return (
        <Badge className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white">
          Banni
        </Badge>
      );
    } else if (user.isSuspended) {
      const suspendedUntil = user.suspendedUntil ? new Date(user.suspendedUntil) : null;
      const formattedDate = suspendedUntil ? 
        `${suspendedUntil.toLocaleDateString()} ${suspendedUntil.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
        : 'Date inconnue';
      
      return (
        <div className="tooltip" title={`Jusqu'au: ${formattedDate}`}>
          <Badge className="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white cursor-help">
            Suspendu
          </Badge>
        </div>
      );
    } else {
      return (
        <Badge className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white">
          Actif
        </Badge>
      );
    }
  };

  const getSponsorshipBadge = (level) => {
    if (!level) return (
      <Badge variant="outline" className="px-2 py-1 text-xs text-gray-600 bg-gray-50 border-gray-200">
        Standard
      </Badge>
    );
    
    switch (level) {
      case "Noble ASC":
        return (
          <Badge variant="outline" className="px-2 py-1 text-xs text-amber-600 bg-amber-50 border-amber-200">
            Noble ASC
          </Badge>
        );
      case "Roturier ASC":
        return (
          <Badge variant="outline" className="px-2 py-1 text-xs text-emerald-600 bg-emerald-50 border-emerald-200">
            Roturier ASC
          </Badge>
        );
      // Ajoutez d'autres niveaux selon vos besoins
      default:
        return (
          <Badge variant="outline" className="px-2 py-1 text-xs text-purple-600 bg-purple-50 border-purple-200">
            {level}
          </Badge>
        );
    }
  };

  const getTabTitle = () => {
    switch (selectedTab) {
      case "list": return "Liste des Utilisateurs";
      case "vip": return "Utilisateurs VIP";
      case "validators": return "Validateurs";
      case "banned": return "Utilisateurs Bannis";
      default: return "Liste des Utilisateurs";
    }
  };

  return (
    <div className="space-y-4 w-full h-full overflow-y-auto px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold">Gestion des Utilisateurs</h1>
          <Button onClick={fetchUsers} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Chargement...' : 'Actualiser'}
          </Button>
        </div>

        <div className="w-full overflow-x-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-full flex mb-4">
                <TabsTrigger value="list" className="flex-1 whitespace-nowrap">Liste des Utilisateurs</TabsTrigger>
                <TabsTrigger value="vip" className="flex-1 whitespace-nowrap">VIP</TabsTrigger>
                <TabsTrigger value="validators" className="flex-1 whitespace-nowrap">Validateurs</TabsTrigger>
                <TabsTrigger value="banned" className="flex-1 whitespace-nowrap">Bannis</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={selectedTab} className="mt-0">
              <Card className="shadow border-t-4 border-t-primary w-full">
                <CardHeader className="bg-muted/50 p-4">
                  <CardTitle className="text-lg sm:text-xl text-primary">{getTabTitle()}</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="w-full sm:w-1/2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-full"
                        />
                      </div>
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="border rounded-md p-2 bg-white shadow-sm w-full sm:w-auto"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="banned">Banni</option>
                    </select>
                  </div>

                  <div className="w-full">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun utilisateur trouvé</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                          <Card key={user._id} className="overflow-hidden transition-all hover:shadow-md">
                            <div className={`h-20 flex items-center justify-center p-4 ${
                              user.isBanned ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                              user.isSuspended ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 
                              user.role === 'validator' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 
                              'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}>
                              <Avatar className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.username} />
                                ) : (
                                  <AvatarFallback>
                                <User className="h-7 w-7 text-gray-700" />
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            
                            <CardContent className="p-4">
                              <div className="mb-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-lg truncate">{user.username}</h3>
                                  <div className="flex items-center gap-1">
                                    {user.role === 'validator' && (
                                      <Badge variant="secondary" className="ml-1">Validateur</Badge>
                                    )}
                                    {getUserStatusBadge(user)}
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {user.email}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-muted/40 rounded-md p-2 text-center">
                                  <div className="text-xs text-muted-foreground">Tournois</div>
                                  <div className="font-medium">{user.statistics?.tournamentsPlayed || 0}</div>
                                </div>
                                <div className="bg-muted/40 rounded-md p-2 text-center">
                                  <div className="text-xs text-muted-foreground">Solde</div>
                                  <div className="font-medium truncate">{user.solde?.toLocaleString() || 0} FCFA</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  {getSponsorshipBadge(user.sponsorship?.level)}
                                </div>
                                
                                <div className="flex gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                                        <User className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[95vw] w-[600px] max-h-[90vh] overflow-y-auto p-0">
                                      {/* Banner section */}
                                      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-80"></div>
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
                                      </div>

                                      <div className="px-6 sm:px-8 -mt-24 pb-6 relative z-10">
                                        {/* En-tête du profil */}
                                        <div className="flex flex-col items-center text-center mb-6">
                                          <Avatar className="w-32 h-32 mb-4 ring-4 ring-white dark:ring-gray-800 shadow-lg bg-white">
                                            {user.avatar ? (
                                              <AvatarImage src={user.avatar} alt={user.username} />
                                            ) : (
                                              <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                                                {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                              </AvatarFallback>
                                            )}
                                          </Avatar>
                                          <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
                                          <div className="flex flex-wrap items-center justify-center gap-2">
                                            {user.role === 'validator' && (
                                              <Badge variant="secondary" className="px-3 py-1">
                                                <Shield className="w-3 h-3 mr-1" />
                                                Validateur
                                              </Badge>
                                            )}
                                            {getUserStatusBadge(user)}
                                            {getSponsorshipBadge(user.sponsorship?.level)}
                                          </div>
                                        </div>

                                        {/* Contenu principal */}
                                        <div className="space-y-8">
                                          {/* Informations de base */}
                                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                              <User className="h-5 w-5 text-primary" />
                                              Informations de base
                                            </h3>
                                            <div className="grid gap-4">
                                              <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                  <Mail className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                  <div className="text-sm text-muted-foreground">Email</div>
                                                  <div className="font-medium break-all">{user.email}</div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                  <History className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                  <div className="text-sm text-muted-foreground">Membre depuis</div>
                                                  <div className="font-medium">
                                                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                                      day: 'numeric',
                                                      month: 'long',
                                                      year: 'numeric'
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                  <AlertTriangle className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                  <div className="text-sm text-muted-foreground">ID Utilisateur</div>
                                                  <div className="font-mono text-sm">{user._id}</div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Statistiques */}
                                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                              <History className="h-5 w-5 text-primary" />
                                              Statistiques
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                                                <div className="text-sm text-blue-600 dark:text-blue-400">Tournois joués</div>
                                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                  {user.statistics?.tournamentsPlayed || 0}
                                                </div>
                                              </div>
                                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                                                <div className="text-sm text-green-600 dark:text-green-400">Victoires</div>
                                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                  {user.statistics?.totalWins || 0}
                                                </div>
                                              </div>
                                              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-4">
                                                <div className="text-sm text-red-600 dark:text-red-400">Défaites</div>
                                                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                                  {user.statistics?.totalLosses || 0}
                                                </div>
                                              </div>
                                              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4">
                                                <div className="text-sm text-purple-600 dark:text-purple-400">Ratio V/D</div>
                                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                  {user.statistics?.totalLosses ? 
                                                    ((user.statistics?.totalWins || 0) / user.statistics.totalLosses).toFixed(2) : 
                                                    (user.statistics?.totalWins || 0)}
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Finances et Fidélité */}
                                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                              <Shield className="h-5 w-5 text-primary" />
                                              Finances et Fidélité
                                            </h3>
                                            <div className="grid gap-4">
                                              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
                                                <div>
                                                  <div className="text-sm text-amber-600 dark:text-amber-400">Solde actuel</div>
                                                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                                    {user.solde?.toLocaleString()} FCFA
                                                  </div>
                                                </div>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
                                                  <div>
                                                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Points de fidélité</div>
                                                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                                      {user.pointsDeFidelite?.toLocaleString() || 0} pts
                                                    </div>
                                                  </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                                                  <div>
                                                    <div className="text-sm text-blue-600 dark:text-blue-400">Tickets de tournoi</div>
                                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                      {user.ticketsDeTournois?.toLocaleString() || 0}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {user.sponsorship?.level && (
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                                                  <div>
                                                    <div className="text-sm text-purple-600 dark:text-purple-400">Niveau de parrainage</div>
                                                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                      {user.sponsorship.level}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {user.sponsorship?.commissionEarned > 0 && (
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20 rounded-lg">
                                                  <div>
                                                    <div className="text-sm text-green-600 dark:text-green-400">Revenus parrainage</div>
                                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                      {user.sponsorship.commissionEarned?.toLocaleString()} FCFA
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {user.isBanned ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="rounded-full h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                      onClick={() => openUnbanDialog(user._id, user.username)}
                                    >
                                      <Unlock className="h-4 w-4" />
                                    </Button>
                                  ) : user.isSuspended ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="rounded-full h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                      onClick={() => openUnsuspendDialog(user._id, user.username)}
                                    >
                                      <Unlock className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="rounded-full h-8 w-8 p-0"
                                      onClick={() => openSuspendDialog(user._id, user.username)}
                                      disabled={user.isBanned}
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {!user.isBanned && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="rounded-full h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      onClick={() => openBanDialog(user._id, user.username)}
                                    >
                                      <UserX className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogue de suspension temporaire */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Suspendre l'utilisateur</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="suspend-duration">Durée de la suspension pour {suspendUsername}</Label>
                <Select
                  value={suspendDuration}
                  onValueChange={setSuspendDuration}
                >
                  <SelectTrigger className="w-full" id="suspend-duration">
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 heure</SelectItem>
                    <SelectItem value="6h">6 heures</SelectItem>
                    <SelectItem value="12h">12 heures</SelectItem>
                    <SelectItem value="24h">24 heures</SelectItem>
                    <SelectItem value="3d">3 jours</SelectItem>
                    <SelectItem value="7d">7 jours</SelectItem>
                    <SelectItem value="30d">30 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" onClick={handleSuspendUser} disabled={suspendLoading}>
                {suspendLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Suspendre"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogue de levée de suspension */}
        <Dialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Lever la suspension</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <p>Êtes-vous sûr de vouloir lever la suspension de <strong>{unsuspendUsername}</strong> ?</p>
                <p className="text-sm text-muted-foreground">
                  Cette action permettra à l'utilisateur de se reconnecter immédiatement à la plateforme.
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setUnsuspendDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleUnsuspendUser} 
                disabled={unsuspendLoading}
              >
                {unsuspendLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Lever la suspension"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogue de bannissement permanent */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Bannir l'utilisateur</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ban-reason">Raison du bannissement de {banUsername}</Label>
                <Textarea
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Raison du bannissement..."
                  className="resize-none"
                  rows={4}
                />
                <p className="text-xs text-red-600 font-medium">
                  Attention: Le bannissement est permanent et ne peut pas être annulé!
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleBanUser} disabled={banLoading}>
                {banLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Bannir définitivement"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialogue de débannissement */}
        <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Débannir l'utilisateur</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <p>Êtes-vous sûr de vouloir débannir <strong>{unbanUsername}</strong> ?</p>
                <p className="text-sm text-muted-foreground">
                  Cette action permettra à l'utilisateur de se connecter à nouveau à la plateforme.
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setUnbanDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleUnbanUser} 
                disabled={unbanLoading}
              >
                {unbanLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Débannir"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
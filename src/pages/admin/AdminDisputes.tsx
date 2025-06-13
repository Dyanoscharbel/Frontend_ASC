import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, Info, Search, Filter, Calendar, User, Shield, Eye, Trophy, File, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import api from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface Dispute {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  opponent: {
    _id: string;
    username: string;
    avatar?: string;
  };
  match: {
    _id: string;
    tournament?: {
      _id: string;
      title: string;
    };
    date: string;
    time?: string;
    status: string;
  };
  reason: string;
  category: string;
  description: string;
  proofUrl?: string;
  playerScore?: number;
  opponentScore?: number;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export default function AdminDisputes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [resolutionText, setResolutionText] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch real disputes from the API
  useEffect(() => {
    async function fetchDisputes() {
      try {
        setLoading(true);
        const response = await api.get('/disputes/admin');
        setDisputes(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des litiges:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les litiges",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDisputes();
  }, []);

  // Filtrer les litiges en fonction de la recherche, du statut et de la catégorie sélectionnés
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = searchTerm === "" || 
      dispute._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.opponent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dispute.match.tournament?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || dispute.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || dispute.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Ouvrir la boîte de dialogue avec les détails du litige
  const openDisputeDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsDetailsOpen(true);
  };

  // Obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'pending': return 'outline';
      case 'approved': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  // Obtenir la classe CSS pour les badges de statut
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'approved': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'rejected': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return '';
    }
  };

  // Traduire le statut en français
  const translateStatus = (status: string) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  // Formatter une date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Fonction pour résoudre un litige
  const resolveDispute = async () => {
    if (!selectedDispute) return;
    
    setProcessingAction(true);
    try {
      // Appel API pour résoudre le litige
      await api.put(`/disputes/${selectedDispute._id}/status`, {
        status: 'approved',
        adminComment: resolutionText
      });
      
      // Rafraîchir la liste des litiges
      const response = await api.get('/disputes/admin');
      setDisputes(response.data);
      
      toast({
        title: "Succès",
        description: "Le litige a été résolu avec succès.",
      });
      
      setResolutionText("");
    } catch (error) {
      console.error("Erreur lors de la résolution du litige:", error);
      toast({
        title: "Erreur",
        description: "Impossible de résoudre le litige",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
      setIsDetailsOpen(false);
    }
  };
  
  // Fonction pour rejeter un litige
  const rejectDispute = async () => {
    if (!selectedDispute) return;
    
    setProcessingAction(true);
    try {
      // Appel API pour rejeter le litige
      await api.put(`/disputes/${selectedDispute._id}/status`, {
        status: 'rejected',
        adminComment: resolutionText
      });
      
      // Rafraîchir la liste des litiges
      const response = await api.get('/disputes/admin');
      setDisputes(response.data);
      
      toast({
        title: "Succès",
        description: "Le litige a été rejeté avec succès.",
      });
      
      setResolutionText("");
    } catch (error) {
      console.error("Erreur lors du rejet du litige:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le litige",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
      setIsDetailsOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Litiges</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('card')} 
            className={viewMode === 'card' ? 'bg-primary text-white' : ''}
          >
            <Shield className="h-4 w-4 mr-2" />
            Vue Cartes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('table')} 
            className={viewMode === 'table' ? 'bg-primary text-white' : ''}
          >
            <Table className="h-4 w-4 mr-2" />
            Vue Tableau
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {/* Barre de recherche */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Rechercher un litige..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
        />
        </div>

        {/* Filtre par statut */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <select
            className="w-full border rounded-md py-2 pl-8 pr-4 appearance-none bg-white"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
        </select>
      </div>

        {/* Case à cocher pour les résultats de match */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="matchResultsOnly"
            checked={selectedCategory === "match_result"}
            onChange={(e) => setSelectedCategory(e.target.checked ? "match_result" : "all")}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="matchResultsOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Résultats de match uniquement
          </label>
        </div>

        {/* Compteur de litiges */}
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            {filteredDisputes.length} litige{filteredDisputes.length > 1 ? 's' : ''}
          </Badge>
          {selectedCategory === 'match_result' && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              {filteredDisputes.filter(d => d.category === 'match_result').length} résultat{filteredDisputes.filter(d => d.category === 'match_result').length > 1 ? 's' : ''} de match
            </Badge>
          )}
        </div>
      </div>

      {/* Vue Cartes */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDisputes.map(dispute => (
            <Card 
              key={dispute._id} 
              className={`border-l-4 ${
                dispute.status === 'pending' ? 'border-l-yellow-500' : 
                dispute.status === 'approved' ? 'border-l-green-500' : 
                'border-l-red-500'
              } hover:shadow-lg transition-all bg-white relative group`}
            >
              {/* Badge de catégorie et statut */}
              <div className="absolute top-3 right-3 z-10 flex gap-2">
                <Badge 
                  variant="outline" 
                  className={`${
                    dispute.category === 'match_result' 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {dispute.category === 'match_result' ? 'Résultat' : 'Plainte'}
                </Badge>
                <Badge 
                  variant={getStatusBadgeVariant(dispute.status)} 
                  className={getStatusBadgeClass(dispute.status)}
                >
                  {translateStatus(dispute.status)}
                </Badge>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    dispute.category === 'match_result' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {dispute.category === 'match_result' 
                      ? <Trophy className="h-5 w-5" />
                      : <AlertTriangle className="h-5 w-5" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base line-clamp-1 mb-1">{dispute.reason}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-mono truncate">{dispute._id}</span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(dispute.createdAt), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                {/* Profils et Scores */}
                <div className={`rounded-lg p-3 ${
                  dispute.category === 'match_result'
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50'
                    : 'bg-gradient-to-br from-purple-50 to-indigo-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    {/* Plaignant */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        {dispute.user.avatar ? (
                          <img 
                            src={dispute.user.avatar} 
                            alt={dispute.user.username}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border-2 border-white">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border border-white">
                          <Flag className="h-2.5 w-2.5 text-white" />
                        </div>
                      </div>
                  <div>
                        <p className="text-[11px] text-gray-500 leading-none">Plaignant</p>
                        <p className="text-sm font-medium leading-tight">{dispute.user.username}</p>
                        {dispute.category === 'match_result' && (
                          <p className="text-lg font-bold text-yellow-600 leading-none mt-1">
                            {dispute.playerScore}
                          </p>
                        )}
                      </div>
                    </div>

                    {dispute.category === 'match_result' && (
                      <div className="text-base font-bold text-gray-400">VS</div>
                    )}

                    {/* Opposant */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        {dispute.opponent.avatar ? (
                          <img 
                            src={dispute.opponent.avatar} 
                            alt={dispute.opponent.username}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border-2 border-white">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1 border border-white">
                          <Shield className="h-2.5 w-2.5 text-white" />
                        </div>
                  </div>
                  <div>
                        <p className="text-[11px] text-gray-500 leading-none">Opposant</p>
                        <p className="text-sm font-medium leading-tight">{dispute.opponent.username}</p>
                        {dispute.category === 'match_result' && (
                          <p className="text-lg font-bold text-yellow-600 leading-none mt-1">
                            {dispute.opponentScore}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preuve */}
                  {dispute.proofUrl && (
                    <div className="flex items-center gap-2 bg-white/50 rounded-md p-1.5 mt-2">
                      <div className="bg-white p-1 rounded">
                        {dispute.proofUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                          <img 
                            src={dispute.proofUrl} 
                            alt="Miniature" 
                            className="w-6 h-6 object-cover rounded"
                          />
                        ) : (
                          <File className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">
                          {dispute.proofUrl.split('/').pop()}
                        </p>
                </div>
                </div>
                  )}
                </div>
              </CardContent>

              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openDisputeDetails(dispute)}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Détails
                </Button>
            </Card>
          ))}
          
          {filteredDisputes.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed">
              <Info className="h-10 w-10 text-gray-300 mb-2" />
              <h3 className="text-base font-medium text-gray-600">Aucun litige trouvé</h3>
              <p className="text-sm text-gray-500">
                Aucun litige ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Vue Tableau */}
      {viewMode === 'table' && (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Signalé par</TableHead>
                <TableHead>Contre</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredDisputes.map(dispute => (
                <TableRow key={dispute._id}>
                  <TableCell className="font-mono">{dispute._id}</TableCell>
                  <TableCell>{dispute.match._id}</TableCell>
                  <TableCell>{dispute.category === 'match_result' ? 'Résultat' : 'Plainte'}</TableCell>
                  <TableCell>{dispute.user.username}</TableCell>
                  <TableCell>{dispute.opponent.username}</TableCell>
                  <TableCell>
                    {dispute.category === 'match_result' ? (
                      <div className="text-sm">
                        <span className="font-medium">{dispute.playerScore}</span>
                        <span className="text-gray-500 mx-1">-</span>
                        <span className="font-medium">{dispute.opponentScore}</span>
                      </div>
                    ) : (
                      <span className="text-sm truncate max-w-[200px] block">
                        {dispute.reason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                      <Badge variant={getStatusBadgeVariant(dispute.status)} className={getStatusBadgeClass(dispute.status)}>
                        {translateStatus(dispute.status)}
                    </Badge>
                  </TableCell>
                    <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openDisputeDetails(dispute)}
                        >
                          <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
                
                {filteredDisputes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Info className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-gray-500">Aucun litige trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Dialogue de détails du litige */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Détails du litige {selectedDispute?._id}
            </DialogTitle>
            <DialogDescription>
              Consulter et gérer les informations détaillées du litige
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="mt-4 space-y-4 overflow-y-auto pr-1">
              {/* Informations principales */}
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <h3 className="font-medium text-orange-800 mb-2">Information principale</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Raison du litige</p>
                    <p className="font-medium">{selectedDispute.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut actuel</p>
                    <Badge variant={getStatusBadgeVariant(selectedDispute.status)} className={getStatusBadgeClass(selectedDispute.status)}>
                      {translateStatus(selectedDispute.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de signalement</p>
                    <p className="font-medium">{formatDate(selectedDispute.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tournoi</p>
                    <p className="font-medium">{selectedDispute.match.tournament?.title || "Non spécifié"}</p>
                  </div>
                </div>
              </div>

              {/* Profils des joueurs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profil du plaignant */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative">
                      {selectedDispute.user.avatar ? (
                        <img 
                          src={selectedDispute.user.avatar} 
                          alt={selectedDispute.user.username}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center border-2 border-white shadow-md">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 border-2 border-white">
                        <Flag className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Plaignant</h4>
                      <p className="text-lg font-semibold text-blue-600">{selectedDispute.user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Profil de l'opposant */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative">
                      {selectedDispute.opponent.avatar ? (
                        <img 
                          src={selectedDispute.opponent.avatar} 
                          alt={selectedDispute.opponent.username}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center border-2 border-white shadow-md">
                          <User className="h-8 w-8 text-indigo-600" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-indigo-500 rounded-full p-1.5 border-2 border-white">
                        <Shield className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-800">Opposant</h4>
                      <p className="text-lg font-semibold text-indigo-600">{selectedDispute.opponent.username}</p>
                    </div>
                    </div>
                  </div>
                </div>

              {/* Score du Match */}
              {selectedDispute.category === 'match_result' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-inner">
                  <h3 className="font-medium text-blue-800 mb-4 flex items-center text-lg">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Score du Match
                    </h3>
                  <div className="flex items-center justify-center gap-8 bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-center flex-1">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{selectedDispute.user.username}</p>
                      <div className="text-3xl font-bold text-blue-600">
                        {selectedDispute.playerScore}
                      </div>
                      <p className="text-xs text-blue-600 mt-1">Score déclaré</p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-gray-400">VS</div>
                    </div>

                    <div className="text-center flex-1">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{selectedDispute.opponent.username}</p>
                      <div className="text-3xl font-bold text-indigo-600">
                        {selectedDispute.opponentScore}
                      </div>
                      <p className="text-xs text-indigo-600 mt-1">Score présumé</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600 bg-white/50 p-3 rounded-md border border-blue-100">
                    <p className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-500" />
                      Ces scores ont été déclarés par {selectedDispute.user.username} et sont en attente de validation.
                    </p>
                    </div>
                  </div>
                )}

              {/* Description détaillée */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="font-medium text-gray-800 mb-2">Description détaillée</h3>
                <p className="whitespace-pre-line text-sm">{selectedDispute.description || "Aucune description détaillée fournie."}</p>
              </div>

              {/* Preuves */}
              {selectedDispute.proofUrl && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="font-medium text-green-800 mb-3 flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    Preuve fournie
                  </h3>
                  <div className="space-y-4">
                    {selectedDispute.proofUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                      // Affichage des images
                      <div className="relative bg-white rounded-lg overflow-hidden border border-green-100">
                        <img 
                          src={selectedDispute.proofUrl} 
                          alt="Preuve" 
                          className="w-full h-auto max-h-[400px] object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                          <p className="text-xs text-white">Image • Cliquez pour voir en taille réelle</p>
                        </div>
                      </div>
                    ) : (
                      // Fallback pour les autres types de fichiers
                      <div className="bg-white p-3 rounded-md border border-green-100">
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-700 truncate">{selectedDispute.proofUrl}</span>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-green-600 hover:bg-green-50 gap-2"
                      asChild
                    >
                      <a 
                        href={selectedDispute.proofUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4" />
                        Voir en plein écran
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Section Résolution */}
              {selectedDispute.status !== 'pending' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="font-medium text-green-800 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Résolution
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Résolu par</p>
                      <p className="font-medium">{selectedDispute.resolvedBy?.username || "Non spécifié"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de résolution</p>
                      <p className="font-medium">
                        {selectedDispute.resolvedAt ? formatDate(selectedDispute.resolvedAt) : "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Décision</p>
                      <p className="font-medium">{selectedDispute.adminComment || "Non spécifié"}</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {selectedDispute.status === 'pending' && (
                <>
                  {/* Champ de texte pour la résolution */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Résolution
                    </h3>
                    <textarea
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      placeholder="Saisissez ici les détails de votre résolution..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                    />
                  </div>
                  
                  <DialogFooter className="flex flex-wrap gap-2 justify-end sm:justify-end">
                    <Button 
                      variant="outline" 
                      className="border-green-500 text-green-600 hover:bg-green-50" 
                      onClick={resolveDispute}
                      disabled={processingAction || !resolutionText.trim()}
                    >
                      {processingAction ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Résoudre
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-600 hover:bg-red-50" 
                      onClick={rejectDispute}
                      disabled={processingAction || !resolutionText.trim()}
                    >
                      {processingAction ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                      Fermer
                    </Button>
                  </DialogFooter>
                </>
              )}
              
              {selectedDispute.status !== 'pending' && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Fermer
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

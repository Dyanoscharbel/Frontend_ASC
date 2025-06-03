import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, DollarSign, Loader2, X, Trash2, AlertTriangle, Edit, Info, MoreHorizontal } from "lucide-react";
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

// Schéma de validation pour le formulaire
const tournamentSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  prize: z.coerce.number().min(0, "Le prix ne peut pas être négatif"),
  entryFee: z.coerce.number().min(0, "Le prix d'inscription ne peut pas être négatif"),
  firstPlaceReward: z.coerce.number().min(0, "La récompense pour la 1ère place ne peut pas être négative"),
  secondPlaceReward: z.coerce.number().min(0, "La récompense pour la 2ème place ne peut pas être négative"),
  thirdPlaceReward: z.coerce.number().optional(),
  date: z.string().min(1, "La date est requise"),
  maxPlayers: z.number().min(2, "Au moins 2 joueurs sont requis"),
  rules: z.string().optional(),
  type: z.enum(["elimination", "round-robin", "swiss"]),
  status: z.enum(["upcoming", "open"]),
  registrationStart: z.string().optional(),
});

export default function AdminTournaments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      title: '',
      description: '',
      prize: '',
      entryFee: '',
      firstPlaceReward: '',
      secondPlaceReward: '',
      thirdPlaceReward: '',
      date: '',
      maxPlayers: 32,
      rules: '',
      type: 'elimination',
      status: 'upcoming',
      registrationStart: '',
    }
  });

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data.tournaments || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des tournois:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les tournois. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const formatPrizeAmount = (prize) => {
    if (!prize) return '0 FCFA';
    
    // Si c'est déjà une chaîne formatée, la retourner
    if (typeof prize === 'string' && prize.includes('FCFA')) {
      // Si le format est déjà "X FCFA", on le retourne tel quel
      if (prize.endsWith('FCFA')) {
        return prize;
      }
      // Sinon on le convertit au nouveau format
      return prize.replace('FCFA ', '') + ' FCFA';
    }
    
    // Sinon, formater le nombre
    const amount = Number(prize) || 0;
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return <Badge variant="default">À venir</Badge>;
      case 'open':
        return <Badge variant="secondary">Inscription</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-green-500 text-white">En cours</Badge>;
      case 'complete':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterTournaments = () => {
    let filtered = tournaments;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(tournament => 
        tournament.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par onglet
    if (selectedTab !== "all") {
      switch (selectedTab) {
        case "upcoming":
          filtered = filtered.filter(t => t.status === 'upcoming' || t.status === 'open');
          break;
        case "active":
          filtered = filtered.filter(t => t.status === 'in-progress');
          break;
        case "completed":
          filtered = filtered.filter(t => t.status === 'complete');
          break;
      }
    }

    return filtered;
  };

  const handleSubmit = async (data) => {
    // Vérifier si la date du tournoi est aujourd'hui, si oui, mettre le statut à 'in-progress'
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser heure, minutes, secondes pour comparer uniquement la date
    
    const tournamentDate = data.date ? new Date(data.date) : null;
    if (tournamentDate) {
      tournamentDate.setHours(0, 0, 0, 0);
      
      // Si la date du tournoi est aujourd'hui ou dans le passé, mettre statut à 'in-progress'
      if (tournamentDate.getTime() === today.getTime() || tournamentDate < today) {
        data.status = 'in-progress';
      }
    }
    
    // Si le statut est 'open', s'assurer que la date de début d'inscription est aujourd'hui
    if (data.status === 'open') {
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      data.registrationStart = `${yyyy}-${mm}-${dd}`;
    }
    
    // Ajoute des valeurs par défaut et garantit que registrationStart est bien défini
    const submitData = { 
      ...data, 
      type: 'elimination',  // Type par défaut: élimination directe
      maxPlayers: 1000000   // Nombre maximum de joueurs à 1 million (sans limite pratique)
    };
    
    // Log pour vérifier que registrationStart est bien présent
    console.log("Données à envoyer au backend:", {
      ...submitData,
      registrationStart: submitData.registrationStart || 'Non défini',
      status: submitData.status
    });
    
    setIsSubmitting(true);
    try {
      let response;
      
      if (isEditDialogOpen && currentTournament) {
        response = await api.put(`/tournaments/${currentTournament._id}`, submitData);
        toast({
          title: "Tournoi modifié",
          description: "Le tournoi a été modifié avec succès.",
        });
      } else {
        response = await api.post('/tournaments', submitData);
        toast({
          title: "Tournoi créé",
          description: "Le tournoi a été créé avec succès.",
        });
      }
      
      // Fermer le dialogue et rafraîchir les tournois
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      await fetchTournaments();
      
      // Réinitialiser le formulaire
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la création/modification du tournoi:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de traiter le tournoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour ouvrir le dialogue d'édition avec les données du tournoi
  const openEditDialog = (tournament) => {
    setCurrentTournament(tournament);
    
    // Remplir le formulaire avec les données existantes
    form.reset({
      title: tournament.title || '',
      description: tournament.description || '',
      prize: tournament.prize || '',
      entryFee: tournament.entryFee || '',
      firstPlaceReward: tournament.firstPlaceReward || '',
      secondPlaceReward: tournament.secondPlaceReward || '',
      thirdPlaceReward: tournament.thirdPlaceReward || '',
      date: tournament.date ? format(new Date(tournament.date), 'yyyy-MM-dd') : '',
      maxPlayers: tournament.maxPlayers || 32,
      rules: tournament.rules || '',
      type: tournament.type || 'elimination',
      status: tournament.status || 'upcoming',
      registrationStart: tournament.registrationStart ? format(new Date(tournament.registrationStart), 'yyyy-MM-dd') : '',
    });
    
    setIsEditDialogOpen(true);
  };

  // Réinitialiser le formulaire quand le dialogue s'ouvre
  useEffect(() => {
    if (isAddDialogOpen) {
      form.reset({
        title: '',
        description: '',
        prize: '',
        entryFee: '',
        firstPlaceReward: '',
        secondPlaceReward: '',
        thirdPlaceReward: '',
        date: '',
        maxPlayers: 32,
        rules: '',
        type: 'elimination',
        status: 'upcoming',
        registrationStart: '',
      });
    }
  }, [isAddDialogOpen]);

  // Fonction pour supprimer un tournoi
  const openDeleteDialog = (tournament) => {
    setTournamentToDelete(tournament);
    // deleteConfirmationInput and cancellationReason will be initialized within DeleteTournamentDialog
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (deleteConfirmationTextValue, cancellationReasonValue) => {
    if (!tournamentToDelete) return;

    const confirmationText = `Delete(${tournamentToDelete.title})`;
    if (deleteConfirmationTextValue !== confirmationText) {
      toast({
        title: "Confirmation incorrecte",
        description: `Veuillez taper "${confirmationText}" pour confirmer la suppression.`,
        variant: "destructive",
      });
      return;
    }

    const requiresReason = tournamentToDelete.status === 'in-progress' || tournamentToDelete.status === 'open';
    if (requiresReason && cancellationReasonValue.trim() === "") {
      toast({
        title: "Raison manquante",
        description: "Veuillez fournir une raison pour l'annulation de ce tournoi.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Prepare request body if reason is needed
      const requestBody = requiresReason ? { cancellationReason: cancellationReasonValue.trim() } : {};
      
      await api.delete(`/admin/tournaments/${tournamentToDelete._id}`, {
        data: requestBody, // Axios uses `data` for DELETE request body
      });
      
      setTournaments(tournaments.filter(t => t._id !== tournamentToDelete._id));
      setIsDeleteDialogOpen(false);
      setTournamentToDelete(null);
      toast({
        title: "Tournoi Supprimé",
        description: `Le tournoi "${tournamentToDelete.title}" a été supprimé avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du tournoi:', error);
      toast({
        title: "Erreur de suppression",
        description: error.response?.data?.message || "Impossible de supprimer le tournoi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTournaments = filterTournaments();

  // Delete Confirmation Dialog
  const DeleteTournamentDialog = () => {
    if (!tournamentToDelete) return null;

    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
    const [cancellationReason, setCancellationReason] = useState("");

    // Reset local states when the dialog is opened for a new tournament
    useEffect(() => {
      if (isDeleteDialogOpen) {
        setDeleteConfirmationInput("");
        setCancellationReason("");
      }
    }, [isDeleteDialogOpen, tournamentToDelete]);

    const confirmationText = `Delete(${tournamentToDelete.title})`;
    const isConfirmationMatching = deleteConfirmationInput === confirmationText;
    const requiresReason = tournamentToDelete.status === 'in-progress' || tournamentToDelete.status === 'open';
    const isReasonProvided = !requiresReason || (requiresReason && cancellationReason.trim() !== "");

    return (
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le Tournoi : {tournamentToDelete.title}</DialogTitle>
            <DialogDescription>
              {requiresReason ? (
                <>
                  Ce tournoi est <strong>{tournamentToDelete.status === 'in-progress' ? 'en cours' : 'ouvert aux inscriptions'}</strong>. Une annonce sera créée. <br />
                </>
              ) : "Cette action est irréversible. "}
              Pour confirmer la suppression, veuillez taper exactement <br />
              <strong className="text-red-500">{confirmationText}</strong><br />
              dans le champ ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <Input 
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder={confirmationText}
              className={!isConfirmationMatching && deleteConfirmationInput.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {!isConfirmationMatching && deleteConfirmationInput.length > 0 && (
              <p className="text-red-500 text-xs mt-1">Le texte de confirmation ne correspond pas.</p>
            )}
            {requiresReason && (
              <div>
                <Label htmlFor="cancellationReason" className="text-sm font-medium">
                  Raison de l'annulation (pour l'annonce) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Expliquez brièvement pourquoi ce tournoi est annulé..."
                  className={`mt-1 min-h-[80px] ${!isReasonProvided && requiresReason && deleteConfirmationInput.length >0 && isConfirmationMatching ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {!isReasonProvided && requiresReason && deleteConfirmationInput.length > 0 && isConfirmationMatching && (
                   <p className="text-red-500 text-xs mt-1">La raison de l'annulation est requise.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(deleteConfirmationInput, cancellationReason)} 
              disabled={!isConfirmationMatching || !isReasonProvided || isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} 
              Confirmer la Suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Tournois</h1>
        <Button 
          variant="default"
          onClick={() => {
            console.log("Ouverture du dialogue d'ajout de tournoi");
            setIsAddDialogOpen(true);
          }}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Nouveau Tournoi
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Rechercher un tournoi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="flex-nowrap overflow-x-auto max-w-full w-full scrollbar-hide">
          <TabsTrigger value="all">Tous les tournois</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des tournois...</span>
                </div>
              ) : (
                <>
                  {filteredTournaments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Aucun tournoi trouvé</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Créer un nouveau tournoi
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredTournaments.map(tournament => (
                        <Card key={tournament._id} className="overflow-hidden transition-all duration-200 hover:shadow-lg border-0">
                          <div 
                            className={`relative h-48 flex items-center justify-center p-4 ${
                              tournament.status === 'upcoming' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 
                              tournament.status === 'open' ? 'bg-gradient-to-r from-green-500 to-teal-400' : 
                              tournament.status === 'in-progress' ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 
                              'bg-gradient-to-r from-gray-500 to-slate-400'
                            }`}
                          >
                            {/* Badge de statut en haut à droite */}
                            <div className="absolute top-3 right-3">
                              <Badge className={`border-0 font-medium px-3 py-1 ${
                                tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                                tournament.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                                tournament.status === 'in-progress' ? 'bg-pink-100 text-pink-800 hover:bg-pink-200' : 
                                'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}>
                                {tournament.status === 'upcoming' ? 'À venir' : 
                                 tournament.status === 'open' ? 'Inscriptions' : 
                                 tournament.status === 'in-progress' ? 'En cours' : 
                                 'Terminé'}
                              </Badge>
                            </div>
                            
                            {/* Icône de trophée centrée */}
                            <Trophy className="h-20 w-20 text-white/90" />
                          </div>
                          
                          <CardContent className="p-5">
                            <h3 className="font-bold text-xl mb-2 line-clamp-1">{tournament.title}</h3>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {tournament.description || "Aucune description disponible"}
                            </p>
                            
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {tournament.date ? format(new Date(tournament.date), 'dd/MM/yyyy', { locale: fr }) : 'Non défini'}
                                </span>
                              </div>
                              
                              <div className="text-sm font-medium">
                                {formatPrizeAmount(tournament.prize)}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {tournament.players?.length || 0} participant(s)
                                </span>
                              </div>
                              
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => openEditDialog(tournament)}
                                        disabled={tournament.status === 'in-progress' || tournament.status === 'complete'}
                                        className="h-8 w-8 p-0 rounded-full"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Éditer</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {tournament.status === 'in-progress' || tournament.status === 'complete' ? 
                                        'Tournoi non éditable' : 'Éditer le tournoi'}
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        asChild
                                        className="h-8 w-8 p-0 rounded-full"
                                      >
                                        <Link to={`/admin/tournaments/${tournament._id}`}>
                                          <Info className="h-4 w-4" />
                                          <span className="sr-only">Détails</span>
                                        </Link>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Voir les détails</TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => openDeleteDialog(tournament)}
                                        className="h-8 w-8 p-0 rounded-full"
                                      >
                                        <Trash2 className={`h-4 w-4 ${tournament.status !== 'in-progress' && tournament.status !== 'open' ? "text-red-500" : "text-orange-500"}`} />
                                        <span className="sr-only">Supprimer</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {tournament.status === 'complete' ? 
                                        'Supprimer le tournoi (terminé)' : 
                                      (tournament.status === 'in-progress' || tournament.status === 'open') ?
                                        'Annuler le tournoi (communication sera envoyée)':
                                        'Supprimer le tournoi'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogue d'ajout de tournoi */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Trophy className="mr-2 h-6 w-6 text-primary" /> 
              Ajouter un nouveau tournoi
            </DialogTitle>
            <DialogDescription className="text-md mt-2">
              Remplissez les détails du tournoi ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-6">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Informations générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Titre du tournoi</FormLabel>
                          <FormControl>
                            <Input placeholder="Titre du tournoi" {...field} className="border-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Date du tournoi</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="date" {...field} required className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Description détaillée du tournoi" 
                              className="min-h-[100px] resize-y"
                              {...field}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Prix et récompenses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="prize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Prix total</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 text-xs font-medium text-muted-foreground">FCFA</div>
                              <Input 
                                type="number" 
                                placeholder="ex: 500000" 
                                min={0} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                required 
                                className="pl-14"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="entryFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Prix d'inscription</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 text-xs font-medium text-muted-foreground">FCFA</div>
                              <Input 
                                type="number" 
                                placeholder="ex: 5000" 
                                min={0} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                required 
                                className="pl-14"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="firstPlaceReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            <span className="text-amber-500 mr-1">🥇</span> 1ère place
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="ex: 250000" 
                              min={0} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondPlaceReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            <span className="text-zinc-400 mr-1">🥈</span> 2ème place
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="ex: 150000" 
                              min={0} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="thirdPlaceReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            <span className="text-amber-700 mr-1">🥉</span> 3ème place
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="ex: 50000" 
                              min={0} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Détails du tournoi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Statut</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10"
                                {...field}
                                onChange={e => {
                                  field.onChange(e);
                                  if (e.target.value === 'open') {
                                    // Met la date de début des inscriptions à aujourd'hui si statut = open
                                    const today = new Date();
                                    const yyyy = today.getFullYear();
                                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                                    const dd = String(today.getDate()).padStart(2, '0');
                                    form.setValue('registrationStart', `${yyyy}-${mm}-${dd}`);
                                  } else {
                                    form.setValue('registrationStart', '');
                                  }
                                }}
                              >
                                <option value="upcoming">À venir</option>
                                <option value="open">Ouvert aux inscriptions</option>
                              </select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Champ Date de début des inscriptions juste en dessous du statut */}
                    {form.watch('status') === 'upcoming' && (
                      <FormField
                        control={form.control}
                        name="registrationStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Date de début des inscriptions</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" {...field} required className="pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="rules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Règlement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Règles détaillées du tournoi"
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      Création...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" /> Créer le tournoi
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition de tournoi */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setCurrentTournament(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Trophy className="mr-2 h-6 w-6 text-primary" /> 
              Modifier le tournoi
            </DialogTitle>
            <DialogDescription className="text-md mt-2">
              Modifiez les détails du tournoi ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-6">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Informations générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Titre du tournoi</FormLabel>
                          <FormControl>
                            <Input placeholder="Titre du tournoi" {...field} className="border-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Date du tournoi</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input type="date" {...field} required className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Description détaillée du tournoi" 
                              className="min-h-[100px] resize-y"
                              {...field}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Prix et récompenses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="prize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Prix total</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 text-xs font-medium text-muted-foreground">FCFA</div>
                              <Input 
                                type="number" 
                                placeholder="ex: 500000" 
                                min={0} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                required 
                                className="pl-14"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="entryFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Prix d'inscription</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 text-xs font-medium text-muted-foreground">FCFA</div>
                              <Input 
                                type="number" 
                                placeholder="ex: 5000" 
                                min={0} 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                required 
                                className="pl-14"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="firstPlaceReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            <span className="text-amber-500 mr-1">🥇</span> 1ère place
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="ex: 250000" 
                              min={0} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondPlaceReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            <span className="text-zinc-400 mr-1">🥈</span> 2ème place
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="ex: 150000" 
                              min={0} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              required 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="thirdPlaceReward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            <span className="text-amber-700 mr-1">🥉</span> 3ème place
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="ex: 50000" 
                              min={0} 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-lg font-medium mb-4">Détails du tournoi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Statut</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10"
                                {...field}
                                onChange={e => {
                                  field.onChange(e);
                                  if (e.target.value === 'open') {
                                    // Met la date de début des inscriptions à aujourd'hui si statut = open
                                    const today = new Date();
                                    const yyyy = today.getFullYear();
                                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                                    const dd = String(today.getDate()).padStart(2, '0');
                                    form.setValue('registrationStart', `${yyyy}-${mm}-${dd}`);
                                  } else {
                                    form.setValue('registrationStart', '');
                                  }
                                }}
                              >
                                <option value="upcoming">À venir</option>
                                <option value="open">Ouvert aux inscriptions</option>
                              </select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Champ Date de début des inscriptions juste en dessous du statut */}
                    {form.watch('status') === 'upcoming' && (
                      <FormField
                        control={form.control}
                        name="registrationStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Date de début des inscriptions</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" {...field} required className="pl-10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="rules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">Règlement</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Règles détaillées du tournoi"
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4" /> Enregistrer les modifications
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteTournamentDialog />
    </div>
  );
}
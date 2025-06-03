import { useState, FormEvent, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Calendar, Clock, Megaphone, Plus, Send, X, CalendarClock, Eye, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  fetchCommunications, 
  createCommunication, 
  updateCommunication, 
  deleteCommunication, 
  sendCommunicationNow as sendCommunicationApi,
  Communication as CommunicationType, 
  CommunicationInput 
} from "@/services/communications";

export default function AdminCommunications() {
  const [communications, setCommunications] = useState<CommunicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [newCommunication, setNewCommunication] = useState<CommunicationInput>({
    title: "",
    content: "",
    scheduled: false,
    scheduledDate: "",
    scheduledTime: ""
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState<CommunicationType | null>(null);
  const [commToDelete, setCommToDelete] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewCommunication({
      title: "",
      content: "",
      scheduled: false,
      scheduledDate: "",
      scheduledTime: ""
    });
  };

  // Charger les communications au chargement et quand l'onglet change
  const loadCommunications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch communications from API with optional filter by status
      const status = activeTab !== 'all' ? activeTab : undefined;
      const response = await fetchCommunications(status);
      setCommunications(response.communications);
    } catch (err: any) {
      console.error("Erreur lors du chargement des communications:", err);
      setError(err?.message || "Impossible de charger les communications");
      toast({
        title: "Erreur",
        description: "Impossible de charger les communications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadCommunications();
  }, [loadCommunications]);

  // Vérifier les communications programmées dépassées
  useEffect(() => {
    // Fonction pour vérifier si la date programmée est passée
    const checkScheduledDates = async () => {
      const now = new Date();
      
      // Trouver les communications programmées qui ont dépassé leur date
      const pastScheduledComms = communications.filter(comm => {
        if (comm.status !== 'scheduled' || !comm.scheduledDate || !comm.scheduledTime) {
          return false;
        }
        
        // Créer un objet Date à partir de la date et l'heure programmées
        const scheduledDateTime = new Date(`${comm.scheduledDate}T${comm.scheduledTime}`);
        
        // Ajouter une tolérance d'une minute pour éviter les mises à jour trop rapides
        const timeDifferenceMs = scheduledDateTime.getTime() - now.getTime();
        
        // Ne considérer une communication comme "dépassée" que si elle est au moins 1 minute dans le passé
        return timeDifferenceMs < -60000; // 60000 ms = 1 minute
      });
      
      // Si aucune communication n'a dépassé sa date, ne rien faire
      if (pastScheduledComms.length === 0) return;
      
      // Mettre à jour chaque communication dépassée
      for (const comm of pastScheduledComms) {
        try {
          console.log(`Envoi automatique de la communication ${comm.id} programmée pour ${comm.scheduledDate} à ${comm.scheduledTime}`);
          await sendCommunicationApi(comm.id);
        } catch (err) {
          console.error(`Erreur lors de l'envoi automatique de la communication ${comm.id}:`, err);
        }
      }
      
      // Recharger les communications pour refléter les changements
      if (pastScheduledComms.length > 0) {
        await loadCommunications();
        toast({
          title: "Communications mises à jour",
          description: `${pastScheduledComms.length} communication(s) programmée(s) ont été envoyées automatiquement`,
        });
      }
    };
    
    // Vérifier uniquement si la page est active, pas immédiatement au chargement
    const interval = setInterval(checkScheduledDates, 60000); // Vérifier toutes les minutes
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, [communications, loadCommunications]);

  // Gérer la création d'une nouvelle communication
  const handleCreateCommunication = async (e: FormEvent) => {
    e.preventDefault();
    
    // Valider les champs obligatoires
    if (!newCommunication.title.trim()) {
      toast({
        title: "Champ requis",
        description: "Le titre de la communication est requis",
        variant: "destructive"
      });
      return;
    }
    
    if (!newCommunication.content.trim()) {
      toast({
        title: "Champ requis",
        description: "Le contenu de la communication est requis",
        variant: "destructive"
      });
      return;
    }
    
    // Valider la programmation si elle est activée
    if (newCommunication.scheduled) {
      if (!newCommunication.scheduledDate) {
        toast({
          title: "Champ requis",
          description: "La date de programmation est requise",
          variant: "destructive"
        });
        return;
      }
      
      // Vérifier que la date programmée est dans le futur
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Date sélectionnée à midi par défaut (sans choix d'heure)
      const scheduledDate = new Date(newCommunication.scheduledDate);
      scheduledDate.setHours(12, 0, 0, 0);
      
      console.log("Date actuelle:", now.toISOString());
      console.log("Date programmée:", scheduledDate.toISOString());
      
      // Comparer uniquement les dates (pas les heures)
      if (scheduledDate < tomorrow) {
        toast({
          title: "Date invalide",
          description: "La date de programmation doit être au moins pour demain",
          variant: "destructive"
        });
        return;
      }
      
      // Assigner une heure par défaut (midi)
      newCommunication.scheduledTime = "12:00";
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer la communication dans la base de données
      await createCommunication(newCommunication);
      
      // Recharger les communications pour inclure la nouvelle
      await loadCommunications();
      
      // Fermer la boîte de dialogue et réinitialiser le formulaire
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Communication créée",
        description: newCommunication.scheduled 
          ? `Votre communication sera envoyée le ${formatDate(newCommunication.scheduledDate)} à ${newCommunication.scheduledTime}`
          : "Votre brouillon a été enregistré"
      });
    } catch (err: any) {
      console.error("Erreur lors de la création de la communication:", err);
      toast({
        title: "Erreur",
        description: err?.message || "Impossible de créer la communication",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour envoyer manuellement une communication
  const handleSendCommunication = async (id: string) => {
    setIsSending(true);
    
    try {
      // Appeler l'API pour envoyer la communication
      await sendCommunicationApi(id);
      
      // Recharger les communications pour refléter le changement de statut
      await loadCommunications();
      
      // Fermer la boîte de dialogue de détails si elle est ouverte
      setIsViewDialogOpen(false);
      
      toast({
        title: "Communication envoyée",
        description: "La communication a été envoyée avec succès",
      });
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de la communication:", err);
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'envoyer la communication",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Supprimer une communication
  const handleDeleteCommunication = async (id: string) => {
    setIsDeleting(true);
    
    try {
      // Appeler l'API pour supprimer la communication
      await deleteCommunication(id);
      
      // Mettre à jour l'état local
      setCommunications(prev => prev.filter(comm => comm.id !== id));
      
      // Fermer la boîte de dialogue de détails si elle est ouverte
      setIsViewDialogOpen(false);
      
      toast({
        title: "Communication supprimée",
        description: "La communication a été supprimée avec succès",
      });
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la communication:", err);
      toast({
        title: "Erreur",
        description: err?.message || "Impossible de supprimer la communication",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setCommToDelete(null);
    }
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Formater une heure en tenant compte du fuseau horaire
  const formatTime = (timeString?: string, dateString?: string) => {
    if (!timeString || !dateString) return timeString;
    
    try {
      // Créer une date complète à partir de la date et l'heure
      const fullDate = new Date(`${dateString}T${timeString}`);
      
      // Formater l'heure en utilisant le fuseau horaire local
      return format(fullDate, 'HH:mm');
    } catch (e) {
      return timeString;
    }
  };

  // Obtenir la couleur et le texte pour un statut
  const getStatusDetails = (status: string) => {
    switch(status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-700', text: 'Brouillon' };
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-700', text: 'Programmé' };
      case 'sent':
        return { color: 'bg-green-100 text-green-700', text: 'Envoyé' };
      default:
        return { color: 'bg-gray-100 text-gray-700', text: status };
    }
  };

  // Vue détaillée d'une communication
  const viewCommunication = (comm: CommunicationType) => {
    setSelectedComm(comm);
    setIsViewDialogOpen(true);
  };

  // Confirmer la suppression d'une communication
  const confirmDelete = (id: string) => {
    setCommToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">Gérez et programmez vos communications</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Communication
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'draft' | 'scheduled' | 'sent')}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="draft">Brouillons</TabsTrigger>
            <TabsTrigger value="scheduled">Programmées</TabsTrigger>
            <TabsTrigger value="sent">Envoyées</TabsTrigger>
          </TabsList>
          <Badge variant="outline">{communications.length} communication(s)</Badge>
        </div>

        <TabsContent value="all" className="mt-6">
          <CommunicationsList 
            communications={communications}
            loading={loading}
            error={error}
            onView={viewCommunication} 
            onDelete={(id) => {
              confirmDelete(id);
            }}
            onSend={handleSendCommunication}
            isSending={isSending}
            isDeleting={isDeleting}
            getStatusDetails={getStatusDetails}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <CommunicationsList 
            communications={communications}
            loading={loading}
            error={error}
            onView={viewCommunication} 
            onDelete={(id) => {
              confirmDelete(id);
            }}
            onSend={handleSendCommunication}
            isSending={isSending}
            isDeleting={isDeleting}
            getStatusDetails={getStatusDetails}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <CommunicationsList 
            communications={communications}
            loading={loading}
            error={error}
            onView={viewCommunication} 
            onDelete={(id) => {
              confirmDelete(id);
            }}
            onSend={handleSendCommunication}
            isSending={isSending}
            isDeleting={isDeleting}
            getStatusDetails={getStatusDetails}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <CommunicationsList 
            communications={communications}
            loading={loading}
            error={error}
            onView={viewCommunication} 
            onDelete={(id) => {
              confirmDelete(id);
            }}
            onSend={handleSendCommunication}
            isSending={isSending}
            isDeleting={isDeleting}
            getStatusDetails={getStatusDetails}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogue de création de communication */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Créer une nouvelle communication
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateCommunication}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Titre de la communication" 
                  value={newCommunication.title}
                  onChange={(e) => setNewCommunication(prev => ({...prev, title: e.target.value}))}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenu <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="content" 
                  placeholder="Contenu de la communication" 
                  rows={5} 
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication(prev => ({...prev, content: e.target.value}))}
                  disabled={isSubmitting}
                />
                </div>

              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newCommunication.scheduled}
                    onCheckedChange={(checked) => 
                      setNewCommunication(prev => ({...prev, scheduled: checked}))
                    }
                    disabled={isSubmitting}
                  />
                  <Label className="flex items-center gap-1">
                    <CalendarClock className="h-4 w-4" />
                    Programmer l'envoi
                  </Label>
                </div>
                
                {newCommunication.scheduled && (
                  <div className="grid grid-cols-1 gap-4 mt-4 p-4 border rounded-md bg-slate-50">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Date <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="scheduledDate" 
                          type="date" 
                          className="pl-10"
                          value={newCommunication.scheduledDate}
                          onChange={(e) => setNewCommunication(prev => ({...prev, scheduledDate: e.target.value}))}
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        La communication sera envoyée à midi le jour sélectionné.
                      </p>
                    </div>
                </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                <Send className="h-4 w-4 mr-2" />
                    {newCommunication.scheduled ? 'Programmer' : 'Enregistrer'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de visualisation de communication */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[600px]">
          {selectedComm && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  {selectedComm.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getStatusDetails(selectedComm.status).color}>
                    {getStatusDetails(selectedComm.status).text}
                  </Badge>
            </div>

                {selectedComm.scheduled && selectedComm.scheduledDate && selectedComm.status === 'scheduled' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span>Programmé pour le {formatDate(selectedComm.scheduledDate)} à {formatTime(selectedComm.scheduledTime, selectedComm.scheduledDate)}</span>
                      </div>
                )}

                {selectedComm.status === 'sent' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cette communication a été envoyée</span>
                  </div>
                )}

                <div className="p-4 border rounded-md bg-slate-50 whitespace-pre-line">
                  {selectedComm.content}
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <div>
                  {(selectedComm.status === 'draft' || selectedComm.status === 'scheduled') && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleSendCommunication(selectedComm.id)}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer maintenant
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      confirmDelete(selectedComm.id);
                      setIsViewDialogOpen(false);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Fermer
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette communication ?
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (commToDelete) {
                  handleDeleteCommunication(commToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Composant pour afficher la liste des communications
function CommunicationsList({ 
  communications, 
  loading,
  error,
  onView, 
  onDelete,
  onSend,
  isSending,
  isDeleting,
  getStatusDetails,
  formatDate,
  formatTime
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des communications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 font-medium mb-2">Une erreur est survenue</div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed">
        <Megaphone className="h-10 w-10 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Aucune communication trouvée</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {communications.map(comm => (
        <Card key={comm.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{comm.title}</CardTitle>
              <Badge className={getStatusDetails(comm.status).color}>
                {getStatusDetails(comm.status).text}
              </Badge>
            </div>
            <CardDescription>
              {comm.scheduled && comm.scheduledDate && comm.status === 'scheduled' && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <CalendarClock className="h-3 w-3" />
                  <span>{formatDate(comm.scheduledDate)} · {formatTime(comm.scheduledTime, comm.scheduledDate)}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="line-clamp-3 text-sm text-gray-600">
              {comm.content}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <p className="text-xs text-gray-500">
              {new Date(comm.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-1">
              {(comm.status === 'draft' || comm.status === 'scheduled') && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-500" 
                  onClick={() => onSend(comm.id)}
                  disabled={isSending}
                  title="Envoyer maintenant"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => onView(comm)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => onDelete(comm.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
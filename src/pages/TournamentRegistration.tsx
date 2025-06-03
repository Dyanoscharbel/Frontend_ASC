import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { tournamentService } from "@/services/tournament";
import { userService, User as AuthUser } from "@/services/user";
import { useToast } from "@/components/ui/use-toast";

// Shadcn UI Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TournamentRegistration() {
  const { id } = useParams();
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [isRegistrationConfirmDialogOpen, setIsRegistrationConfirmDialogOpen] = useState(false); // Nouvel état pour le dialogue
  
  const { user, updateUserInfo } = useAuth();
  const { toast } = useToast();

  // Coût du tournoi en FCFA (exemple, idéalement vient de l'API du tournoi)
  const tournamentCostFCFA = 5000; 
  const ticketsRequired = tournamentCostFCFA / 1000; // 1 ticket = 1000 FCFA
  const userTickets = user?.ticketsDeTournois || 0;

  // TODO: Obtenir l'ID et d'autres détails du tournoi via une API
  const tournamentId = id; // Utilise l'ID de l'URL pour l'instant
  const tournamentName = "Tournoi Exemple"; // Nom fictif pour l'instant

  const handleRegistrationWithTickets = async () => {
    if (!user || userTickets < ticketsRequired || !tournamentId) {
      console.error("Conditions d'inscription non remplies.");
       toast({
         title: "Erreur",
         description: "Impossible de procéder à l'inscription. Conditions non remplies.",
         variant: "destructive"
       });
      return;
    }

    try {
      console.log(`Tentative d'inscription au tournoi ${tournamentId} pour l'utilisateur ${user._id} avec ${ticketsRequired} tickets.`);

      // Appel au service backend pour l'inscription
      const response = await tournamentService.registerForTournament(tournamentId);

      console.log("Réponse backend:", response);

      // Synchroniser les infos utilisateur après une inscription réussie
      try {
        const profile = await userService.getUserProfile() as AuthUser;
        if (updateUserInfo) {
          updateUserInfo({ ...user, ...profile });
           console.log("Profil utilisateur synchronisé.");
        }
      } catch (syncError) {
        console.error("Erreur lors de la synchronisation du profil utilisateur:", syncError);
        toast({
          title: "Avertissement",
          description: "Inscription réussie, mais impossible de synchroniser le portefeuille.",
          variant: "default"
        });
      }

      setRegistrationStatus('confirmed');
       toast({
         title: "Inscription réussie",
         description: `Vous êtes maintenant inscrit au tournoi ${tournamentName || '[Sans titre]'}.`, // Utiliser le nom du tournoi si disponible
         variant: "default"
       });

    } catch (error: any) {
      console.error("Échec de l'inscription:", error);
      setRegistrationStatus('cancelled');

      let errorMessage = "Une erreur est survenue lors de l'inscription.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

       toast({
         title: "Erreur d'inscription",
         description: errorMessage,
         variant: "destructive"
       });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Inscription au Tournoi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <span>Coût de l'inscription: {ticketsRequired} Ticket{ticketsRequired > 1 ? 's' : ''}</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Votre Solde</h3>
                  <div className="flex items-center gap-2">
                     <CreditCard className="h-5 w-5 text-blue-500" />
                     <span>{userTickets} Ticket{userTickets > 1 ? 's' : ''} disponible{userTickets > 1 ? 's' : ''}</span>
                  </div>
                   {userTickets < ticketsRequired && (
                     <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Solde de tickets insuffisant.
                     </p>
                   )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={userTickets < ticketsRequired}
                  onClick={() => setIsRegistrationConfirmDialogOpen(true)} // Ouvre le dialogue au lieu d'appeler directement
                >
                  {/* <CreditCard className="mr-2 h-5 w-5" /> */}
                  S'inscrire avec {ticketsRequired} Ticket{ticketsRequired > 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Dialogue de Confirmation d'Inscription */}
      <Dialog open={isRegistrationConfirmDialogOpen} onOpenChange={setIsRegistrationConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'Inscription</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir utiliser {ticketsRequired} ticket{ticketsRequired > 1 ? 's' : ''} pour vous inscrire au tournoi {tournamentName || '[Sans titre]'} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrationConfirmDialogOpen(false)}>Annuler</Button>
            <Button onClick={async () => {
              setIsRegistrationConfirmDialogOpen(false);
              await handleRegistrationWithTickets(); // Appelle la logique d'inscription après confirmation
            }}>
              Confirmer l'inscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

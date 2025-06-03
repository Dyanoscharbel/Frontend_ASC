import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/user";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface BecomeValidatorDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BecomeValidatorDialog({ open, onClose }: BecomeValidatorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUserInfo } = useAuth();
  const navigate = useNavigate();

  const handleBecomeValidator = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await userService.updateRole('validator');
      
      if (updateUserInfo) {
        updateUserInfo(updatedUser);
      }
      
      toast({
        title: "Félicitations !",
        description: "Vous êtes maintenant un validateur. Bienvenue dans l'équipe !",
      });
      
      onClose();
      navigate(0); // Recharge la page pour refléter les changements
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Devenir Validateur
          </DialogTitle>
          <DialogDescription>
            Les validateurs jouent un rôle crucial dans notre communauté. Ils aident à résoudre les litiges et maintenir l'équité des tournois.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h4 className="font-medium mb-2">En tant que validateur, vous pourrez :</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Examiner et résoudre les litiges des matchs</li>
            <li>Gagner des récompenses pour chaque validation</li>
            <li>Contribuer à la croissance de la communauté</li>
            <li>Accéder à des fonctionnalités exclusives</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleBecomeValidator} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Devenir Validateur
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
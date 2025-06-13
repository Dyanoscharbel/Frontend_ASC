import { useState } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/auth";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Instructions envoyées à votre adresse email");
    } catch (error) {
      console.error("Erreur de réinitialisation:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            <Trophy className="h-10 w-10 text-asc-purple" />
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Mot de passe oublié</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted 
                ? "Vérifiez votre email pour les instructions de réinitialisation" 
                : "Entrez votre adresse email pour recevoir des instructions de réinitialisation"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Nous avons envoyé un email à <span className="font-medium">{email}</span> avec les instructions pour réinitialiser votre mot de passe.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Si vous ne recevez pas d'email dans les prochaines minutes, vérifiez votre dossier spam ou réessayez.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-asc-purple hover:bg-asc-dark-purple" disabled={isLoading}>
                    {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              <Link to="/login" className="text-asc-purple hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

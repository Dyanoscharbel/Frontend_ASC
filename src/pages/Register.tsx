import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    referralCode: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password) {
      toast.error("Tous les champs sont obligatoires");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return false;
    }

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }

    if (!agreed) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await register(
        formData.email, 
        formData.password, 
        formData.username,
        formData.referralCode || undefined
      );
      toast.success("Inscription réussie !");
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicators
  const passwordStrength = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    passwordsMatch: formData.password && formData.password === formData.confirmPassword
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
              <Trophy className="h-10 w-10 text-asc-purple" />
            </div>
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
              <CardDescription className="text-center">
                Rejoignez l'AfriK Soccer Cup  et participez aux tournois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Votre pseudo"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="referralCode">Code de parrainage (optionnel)</Label>
                    <Input
                      id="referralCode"
                      name="referralCode"
                      placeholder="Entrez un code de parrainage si vous en avez un"
                      value={formData.referralCode}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  {formData.password && (
                    <div className="grid gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${passwordStrength.minLength ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className={passwordStrength.minLength ? "text-green-600" : "text-gray-500"}>
                          Au moins 8 caractères
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${passwordStrength.hasNumber ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className={passwordStrength.hasNumber ? "text-green-600" : "text-gray-500"}>
                          Au moins un chiffre
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${passwordStrength.hasSpecialChar ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className={passwordStrength.hasSpecialChar ? "text-green-600" : "text-gray-500"}>
                          Au moins un caractère spécial
                        </span>
                      </div>
                      {formData.confirmPassword && (
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${passwordStrength.passwordsMatch ? "bg-green-500" : "bg-red-500"}`}></div>
                          <span className={passwordStrength.passwordsMatch ? "text-green-600" : "text-red-500"}>
                            Les mots de passe correspondent
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="/terms-of-use" 
                      checked={agreed} 
                      onCheckedChange={(checked) => setAgreed(checked === true)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="/terms-of-use"
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      J'accepte les{" "}
                      <Link to="/terms-of-use" className="text-asc-purple hover:underline">
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link to="/privacy" className="text-asc-purple hover:underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-asc-purple hover:bg-asc-dark-purple"
                    disabled={isLoading || !agreed}
                  >
                    {isLoading ? "Création en cours..." : "Créer un compte"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continuer avec
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                      <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                Déjà un compte?{' '}
                <Link to="/login" className="text-asc-purple hover:underline">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Edit, Flag, Check, Shield, Award, Trophy, Gamepad, Star, Plus, Clock, MapPin, Mail, Phone, Loader2, File, KeyRound, CheckCircle, Lock, PencilIcon, Globe, Crown, Wallet } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { uploadService } from "@/services/upload";
import { userService } from "@/services/user";
import { useToast } from "@/components/ui/use-toast";
import { User as UserType } from "@/services/auth";
import { COUNTRIES, TIMEZONES, getTimezoneForCountry } from "@/config/country-timezones";
import { convertCurrencySync, formatCurrency } from "@/config/currency";

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateUserInfo } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setUserInfo({
        username: user?.username || "Utilisateur",
        email: user?.email || "email@example.com",
        bio: user?.profile?.bio || "Aucune biographie disponible.",
        country: user?.profile?.country || "Non spécifié",
        timezone: user?.timezone || "GMT+0",
        avatar: user?.avatar || "",
        secondaryUsernames: [],
        badges: user?.rewards?.map(badge => ({
          name: badge.name,
          icon: <Trophy className="h-4 w-4" />,
          level: badge.level || 'Bronze',
          description: badge.description || "Description non disponible"
        })) 
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.solde) {
      const userCurrency = user?.preferredCurrency || 'XOF';
      try {
        const converted = convertCurrencySync(user.solde, 'XOF', userCurrency);
        setConvertedAmount(converted);
    } catch (error) {
        console.error('Erreur de conversion:', error);
        setConvertedAmount(user.solde);
      }
    }
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log('Fichier sélectionné:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier non supporté",
          description: "Veuillez sélectionner une image (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setAvatar(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
    }
  };
  }, [avatarPreview]);

  const [userInfo, setUserInfo] = useState({
    username: user?.username || "Utilisateur",
    email: user?.email || "email@example.com",
    bio: user?.profile?.bio || "Aucune biographie disponible.",
    country: user?.profile?.country || "Non spécifié",
    timezone: user?.timezone || "GMT+0",
    avatar: user?.avatar || "",
    secondaryUsernames: [],
    badges: user?.rewards?.map(badge => ({
      name: badge.name,
      icon: <Trophy className="h-4 w-4" />,
      level: badge.level || 'Bronze',
      description: badge.description || "Description non disponible"
    })) || [
      { name: "Champion DLS 2024", icon: <Trophy className="h-4 w-4" />, level: 'Or', description: "Récompense pour avoir remporté le tournoi DLS 2024." },
      { name: "Validateur", icon: <Shield className="h-4 w-4" />, level: 'Argent', description: "Badge décerné pour la validation d'un grand nombre de contenu." },
      { name: "50 Victoires", icon: <Star className="h-4 w-4" />, level: 'Bronze', description: "Atteint 50 victoires en mode compétition." },
      { name: "Paysan ASC", icon: <Award className="h-4 w-4" />, level: 'Bronze', description: "Badge pour les membres actifs de la communauté ASC." }
    ]
  });

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "country") {
      const timezone = getTimezoneForCountry(value);
      setUserInfo(prev => ({ 
        ...prev, 
        [name]: value,
        timezone: timezone 
      }));
    } else {
    setUserInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUploading(true);
      
      const timezone = getTimezoneForCountry(userInfo.country);
      
      let avatarUrl = userInfo.avatar;
      
      if (avatar) {
        try {
          console.log('Téléchargement de l\'avatar vers Cloudinary...');
          avatarUrl = await uploadService.uploadImage(avatar);
          console.log('Avatar téléchargé avec succès:', avatarUrl);
        } catch (error) {
          console.error("Erreur lors du téléchargement de l'avatar:", error);
          toast({
            title: "Erreur",
            description: "Impossible de télécharger l'image. Veuillez réessayer.",
            variant: "destructive"
          });
        }
      }
      
      const profileToUpdate = {
        username: userInfo.username,
        email: userInfo.email,
        phoneNumber: phoneNumber,
        timezone: timezone,
        profile: {
          bio: userInfo.bio,
          country: userInfo.country
        },
        avatar: avatarUrl
      };
      
      console.log('Mise à jour du profil avec données:', profileToUpdate);
      
      const updatedUser = await userService.updateProfile(profileToUpdate);
      console.log('Profil mis à jour avec succès:', updatedUser);
      
      setUserInfo(prev => ({ ...prev, avatar: avatarUrl }));
      
      if (updateUserInfo && user) {
        const updatedUserData: UserType = {
          ...user,
          username: userInfo.username,
          email: userInfo.email,
          avatar: avatarUrl,
          phoneNumber: phoneNumber,
          timezone: timezone,
          profile: {
            ...user.profile,
            bio: userInfo.bio,
            country: userInfo.country
          }
        };
        updateUserInfo(updatedUserData);
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
        variant: "default"
      });
      
    setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du profil.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getBadgeColor = (level: string) => {
    switch(level) {
      case 'Or':
        return "bg-gradient-to-r from-yellow-300 to-amber-500 text-amber-900 border-amber-400";
      case 'Argent':
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-gray-400";
      default:
        return "bg-gradient-to-r from-orange-200 to-amber-300 text-amber-800 border-amber-300";
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [id === "current-password" ? "currentPassword" : 
       id === "new-password" ? "newPassword" : "confirmPassword"]: value
    }));
  };

  const passwordStrength = {
    minLength: passwords.newPassword.length >= 8,
    hasNumber: /\d/.test(passwords.newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword),
    passwordsMatch: passwords.newPassword && passwords.newPassword === passwords.confirmPassword
  };

  const handleUpdatePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (!passwordStrength.minLength) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }

    if (!passwordStrength.hasNumber) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins un chiffre",
        variant: "destructive"
      });
      return;
    }

    if (!passwordStrength.hasSpecialChar) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins un caractère spécial",
        variant: "destructive"
      });
      return;
    }

    if (!passwordStrength.passwordsMatch) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      
      await userService.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Une erreur est survenue lors de la mise à jour du mot de passe";
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50/20 to-gray-100 dark:from-gray-900 dark:via-indigo-950/10 dark:to-gray-800">
      <main className="py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-80"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              <div className="px-6 sm:px-8 -mt-24 pb-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
              <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-asc-purple to-purple-600 rounded-xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white dark:ring-gray-800 overflow-hidden border-2 border-white/80 dark:border-gray-700/80">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : userInfo.avatar ? (
                        <img src={userInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                        <User className="h-16 w-16" />
                  )}
                </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-md border-2 border-white dark:border-gray-800">
                      <Gamepad className="h-5 w-5 text-white" />
                </div>
              </div>

                  <div className="mt-4 md:mt-0 flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-asc-purple to-purple-600 drop-shadow-sm">
                  {userInfo.username}
                </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-400 mt-2 justify-center md:justify-start">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                          <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm">{userInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                          <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm">{userInfo.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                          <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm">{phoneNumber || "Non spécifié"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm shadow-sm">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Statut et informations</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-sm">
                          <Crown className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Niveau</p>
                          <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            {user?.sponsorship?.level || "Aucun"}
                          </p>
                </div>
              </div>
            </div>

                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 p-4 rounded-lg shadow-sm border border-amber-100 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-sm">
                          <Star className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Points de fidélité</p>
                          <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">
                            {user?.pointsDeFidelite || 0} pts
                          </p>
                        </div>
              </div>
            </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg shadow-sm border border-green-100 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                          <Wallet className="h-5 w-5" />
                        </div>
                  <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Solde</p>
                          <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                            {user?.preferredCurrency 
                              ? formatCurrency(convertedAmount, user.preferredCurrency)
                              : `${user?.solde || 0} XOF`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Gérez vos devises dans la section <Link to="/wallet" className="underline">Portefeuille</Link>
                          </p>
                  </div>
                      </div>
                    </div>
                      </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                        {userInfo.badges.map((badge, idx) => (
                        <div key={idx} className="group relative">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${getBadgeColor(badge.level)} hover:shadow-md transition-shadow duration-200`}>
                              {badge.icon}
                              {badge.name}
                            </div>
                          <div className="absolute hidden group-hover:block z-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl -bottom-16 left-0 w-48 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-5 duration-200">
                              <p className="text-xs">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
              </div>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm w-full flex justify-center">
                <TabsTrigger value="profile" className="flex-1 sm:flex-none flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-1 sm:flex-none flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Sécurité</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="profile" className="space-y-6 mt-6">
                    <Card className="border-none shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <span>Informations Personnelles</span>
                          </CardTitle>
                          <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                        </div>
                        {!isEditing && (
                          <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300">
                            <Edit className="h-4 w-4" />
                            <span>Modifier</span>
                          </Button>
                        )}
                      </CardHeader>

                      <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={isEditing ? "editing" : "viewing"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                      {isEditing ? (
                              <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-medium flex items-center gap-1">
                                      <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Nom d'utilisateur</span>
                                    </Label>
                              <Input 
                                id="username"
                                name="username"
                                value={userInfo.username}
                                onChange={handleInfoChange}
                                      className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                              />
                            </div>

                            <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                                      <Mail className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Email</span>
                                    </Label>
                              <Input 
                                id="email"
                                name="email"
                                type="email"
                                value={userInfo.email}
                                onChange={handleInfoChange}
                                      className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                              />
                            </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="country" className="text-sm font-medium flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Pays</span>
                                    </Label>
                                    <Select 
                                      value={userInfo.country}
                                      onValueChange={(value) => handleSelectChange("country", value)}
                                    >
                                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
                                        <SelectValue placeholder="Sélectionnez un pays" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {COUNTRIES.map((country) => (
                                          <SelectItem key={country} value={country}>{country}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Fuseau horaire (automatique)</span>
                                    </Label>
                                    <div className="flex items-center gap-2 h-10 px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400">
                                      <Clock className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                      <span>{userInfo.timezone}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                        <span>Le fuseau horaire est déterminé par le pays sélectionné</span>
                                      </p>
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                        <span>Pour obtenir l'heure exacte de vos matches et tournois, ajoutez ce GMT aux heures affichées sur le site</span>
                                      </p>
                                    </div>
                                  </div>
                                  
                            <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                                      <Phone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Téléphone</span>
                                    </Label>
                              <Input 
                                id="phone"
                                name="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+221 XX XXX XX XX"
                                      className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                              />
                          </div>

                                  <div className="space-y-3">
                                    <Label htmlFor="avatar" className="text-sm font-medium flex items-center gap-1">
                                      <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>Photo de profil</span>
                                    </Label>
                                    <div className="relative">
                            <Input 
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                                        className="cursor-pointer bg-gray-50 dark:bg-gray-900 file:bg-indigo-100 file:text-indigo-700 file:border-0 file:rounded file:font-medium file:mr-4 file:py-2 file:px-3 hover:file:bg-indigo-200 dark:file:bg-indigo-950/30 dark:file:text-indigo-300"
                            />
                                      {avatarPreview && (
                                        <div className="mt-2 flex items-center gap-2">
                                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
                                            <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                                          </div>
                                          <span className="text-xs text-indigo-600 dark:text-indigo-400">Aperçu de l'image</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                          </div>

                          <div className="space-y-2">
                                  <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-1">
                                    <File className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Biographie</span>
                                  </Label>
                            <Textarea 
                              id="bio"
                              name="bio"
                              value={userInfo.bio}
                              onChange={handleInfoChange}
                                    rows={4}
                                    placeholder="Parlez-nous de vous..."
                                    className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 resize-none"
                            />
                          </div>
                            </div>
                            ) : (
                              <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                  <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                                        <User className="h-4 w-4" />
                            </div>
                                      <p className="text-sm font-medium">Nom d'utilisateur</p>
                          </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 ml-9">{userInfo.username}</p>
                        </div>

                            <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                                        <Mail className="h-4 w-4" />
                                      </div>
                                      <p className="text-sm font-medium">Email</p>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 ml-9">{userInfo.email}</p>
                            </div>

                            <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                                        <MapPin className="h-4 w-4" />
                                      </div>
                                      <p className="text-sm font-medium">Pays</p>
                            </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 ml-9">{userInfo.country}</p>
                          </div>

                          <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                                        <Clock className="h-4 w-4" />
                                      </div>
                                      <p className="text-sm font-medium">Fuseau horaire</p>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 ml-9">{userInfo.timezone}</p>
                          </div>

                            <div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                                        <Phone className="h-4 w-4" />
                                      </div>
                                      <p className="text-sm font-medium">Téléphone</p>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 ml-9">
                                      {phoneNumber || "Non spécifié"}
                                    </p>
                              </div>
                            </div>

                            <div>
                                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-100 dark:bg-indigo-900/50">
                                      <File className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm font-medium">Biographie</p>
                                  </div>
                                  <div className="ml-9">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 p-4 bg-gray-50 dark:bg-gray-900 rounded-md shadow-inner">{userInfo.bio}</p>
                            </div>
                          </div>
                        </div>
                      )}
                          </motion.div>
                        </AnimatePresence>
                </CardContent>

                {isEditing && (
                        <CardFooter className="justify-end space-x-3 border-t pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsEditing(false);
                              setAvatarPreview(null);
                              setAvatar(null);
                            }} 
                            disabled={isUploading}
                            className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                          >
                            Annuler
                          </Button>
                          <Button 
                            onClick={handleSaveProfile} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all"
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <Check className="mr-1.5 h-4 w-4" />
                                Enregistrer
                              </>
                            )}
                          </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

                  <TabsContent value="security" className="space-y-6 mt-6">
                    <Card className="border-none shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                      <CardHeader className="border-b">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <span>Modifier le mot de passe</span>
                        </CardTitle>
                </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-5 max-w-md mx-auto">
                    <div className="space-y-2">
                            <Label htmlFor="current-password" className="text-sm font-medium flex items-center gap-1">
                              <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Mot de passe actuel</span>
                            </Label>
                            <Input 
                              id="current-password" 
                              type="password" 
                              className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" 
                              placeholder="••••••••"
                              value={passwords.currentPassword}
                              onChange={handlePasswordChange}
                            />
                    </div>

                    <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-sm font-medium flex items-center gap-1">
                              <KeyRound className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Nouveau mot de passe</span>
                            </Label>
                            <Input 
                              id="new-password" 
                              type="password" 
                              className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" 
                              placeholder="••••••••"
                              value={passwords.newPassword}
                              onChange={handlePasswordChange}
                            />
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                              <span>Utilisez au moins 8 caractères avec lettres et chiffres</span>
                            </p>
                            
                            {passwords.newPassword && (
                              <div className="grid gap-1 text-xs mt-2">
                                <div className="flex items-center gap-1">
                                  <div className={`w-3 h-3 rounded-full ${passwordStrength.minLength ? "bg-green-500" : "bg-gray-300"}`}></div>
                                  <span className={passwordStrength.minLength ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                                    Au moins 8 caractères
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`w-3 h-3 rounded-full ${passwordStrength.hasNumber ? "bg-green-500" : "bg-gray-300"}`}></div>
                                  <span className={passwordStrength.hasNumber ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                                    Au moins un chiffre
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className={`w-3 h-3 rounded-full ${passwordStrength.hasSpecialChar ? "bg-green-500" : "bg-gray-300"}`}></div>
                                  <span className={passwordStrength.hasSpecialChar ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                                    Au moins un caractère spécial
                                  </span>
                                </div>
                              </div>
                            )}
                    </div>

                    <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Confirmer le nouveau mot de passe</span>
                            </Label>
                            <Input 
                              id="confirm-password" 
                              type="password" 
                              className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50" 
                              placeholder="••••••••"
                              value={passwords.confirmPassword}
                              onChange={handlePasswordChange}
                            />
                            
                            {passwords.confirmPassword && (
                              <div className="flex items-center gap-1 text-xs mt-2">
                                <div className={`w-3 h-3 rounded-full ${passwordStrength.passwordsMatch ? "bg-green-500" : "bg-red-500"}`}></div>
                                <span className={passwordStrength.passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                  {passwordStrength.passwordsMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                                </span>
                              </div>
                            )}
                    </div>
                  </div>
                </CardContent>
                      <CardFooter className="flex justify-center pb-6 border-t pt-4">
                        <Button 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full max-w-md shadow-sm hover:shadow transition-all"
                          disabled={isUpdatingPassword}
                          onClick={handleUpdatePassword}
                        >
                          {isUpdatingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              <Shield className="mr-1.5 h-4 w-4" />
                              Mettre à jour le mot de passe
                            </>
                          )}
                        </Button>
                </CardFooter>
              </Card>
            </TabsContent>
                </motion.div>
              </AnimatePresence>
          </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
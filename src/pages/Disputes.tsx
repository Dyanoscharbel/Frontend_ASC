import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, FileUp, Loader2, Send, HelpCircle, ListChecks } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';
import { disputeService, DisputeData } from '@/services/disputeService';
import { uploadService } from '@/services/upload';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mocked, replace with actual type from your services if available
interface RecentMatch {
  _id: string;
  opponent: {
    _id: string;
    username: string;
  };
  tournamentName?: string; // Optional: name of the tournament
  playedAt: string; // ISO string date
  time?: string; // Optional: time of the match in HH:MM format
  status: string; // Added to filter for pending matches
  // You might also want to include your own score and opponent score if relevant
}

// Ajouter l'interface pour les litiges
interface UserDispute {
  _id: string;
  match: {
    _id: string;
    tournament?: {
      title: string;
    };
  };
  opponent: {
    username: string;
  };
  category: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  adminComment?: string;
}

const DISPUTE_WINDOW_MINUTES = 30;

const Disputes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [opponentInfo, setOpponentInfo] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [playerScore, setPlayerScore] = useState<string>("");
  const [opponentScore, setOpponentScore] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [userDisputes, setUserDisputes] = useState<UserDispute[]>([]);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      setIsLoadingMatches(true);
      try {
        // This endpoint needs to be implemented on the backend
        // It should return matches played by the user in the last DISPUTE_WINDOW_MINUTES minutes
        const matches = await disputeService.getRecentMatchesForDispute();
        setRecentMatches(matches || []);
      } catch (error) {
        console.error("Error fetching recent matches:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les matchs récents.",
          variant: "destructive",
        });
        setRecentMatches([]); // Ensure it's an empty array on error
      }
      setIsLoadingMatches(false);
    };
    fetchMatches();
  }, [user, toast]);

  useEffect(() => {
    if (selectedMatch) {
      const match = recentMatches.find(m => m._id === selectedMatch);
      if (match && match.opponent) {
        setOpponentInfo(`Match contre ${match.opponent.username} (ID: ${match.opponent._id})`);
      } else {
        setOpponentInfo("");
      }
    } else {
      setOpponentInfo("");
    }
    // Reset category-specific fields when match changes
    setCategory("");
    setPlayerScore("");
    setOpponentScore("");
  }, [selectedMatch, recentMatches]);

  // Ajouter useEffect pour charger les litiges de l'utilisateur
  useEffect(() => {
    const fetchUserDisputes = async () => {
      if (!user) return;
      setIsLoadingDisputes(true);
      try {
        const disputes = await disputeService.getUserDisputes();
        setUserDisputes(disputes || []);
      } catch (error) {
        console.error("Error fetching user disputes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des litiges.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDisputes(false);
      }
    };
    fetchUserDisputes();
  }, [user, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La preuve ne doit pas dépasser 5MB.",
          variant: "destructive",
        });
        setProofFile(null);
        setProofPreview(null);
        event.target.value = ''; // Reset file input
        return;
      }
      
      // Vérification des formats supportés
      const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!supportedImageTypes.includes(file.type)) {
        toast({
          title: "Format non supporté",
          description: "Formats supportés : JPG, PNG, GIF, WEBP",
          variant: "destructive"
        });
        setProofFile(null);
        setProofPreview(null);
        event.target.value = ''; // Reset file input
        return;
      }

      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProofFile(null);
      setProofPreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMatch || !category || !description) {
      toast({
        title: "Champs requis",
        description: "Veuillez sélectionner un match, une catégorie et fournir une description.",
        variant: "default",
      });
      return;
    }

    if (category === "match_result" && (playerScore === "" || opponentScore === "")) {
      toast({
        title: "Scores requis",
        description: "Pour la catégorie 'Résultats de match', veuillez renseigner les deux scores.",
        variant: "default",
      });
      return;
    }

    if (category === "match_result" && !proofFile) {
      toast({
        title: "Preuve requise",
        description: "Pour soumettre un résultat de match, une preuve (capture d'écran du score) est obligatoire.",
        variant: "default", 
      });
      return;
    }

    const match = recentMatches.find(m => m._id === selectedMatch);
    if (!match || !match.opponent?._id) {
        toast({
            title: "Erreur de match",
            description: "Les informations du match sélectionné sont invalides ou l'adversaire n'a pas pu être identifié.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmitting(true);
    let proofUrl = undefined;

    try {
      if (proofFile) {
        // Assuming uploadService.uploadImage can handle videos or you have a specific video uploader
        // Ensure uploadService can handle both images and videos, or use a different service for videos.
        proofUrl = await uploadService.uploadImage(proofFile); // Changed from uploadFile to uploadImage
      }

      const disputeData: DisputeData = {
        matchId: selectedMatch,
        opponentId: match.opponent._id,
        reason: category === "complaint" ? "Gameplay issue/Complaint" : "Match Result Submission", // More specific reason
        description: description,
        proofUrl: proofUrl,
        category: category,
        playerScore: category === "match_result" ? parseInt(playerScore, 10) : undefined,
        opponentScore: category === "match_result" ? parseInt(opponentScore, 10) : undefined,
      };

      await disputeService.createDispute(disputeData);

      toast({
        title: category === "match_result" ? "Résultat soumis" : "Litige soumis",
        description: category === "match_result" 
            ? "Votre résultat de match a été soumis avec succès." 
            : "Votre litige a été soumis avec succès. Il sera examiné par nos validateurs.",
        variant: "default",
      });
      // Reset form
      setSelectedMatch("");
      setCategory("");
      setPlayerScore("");
      setOpponentScore("");
      setDescription("");
      setProofFile(null);
      setProofPreview(null);
      // Optionally redirect or update UI
    } catch (error: any) { // Added type annotation for error
      console.error("Error submitting dispute:", error);
      toast({
        title: "Erreur de soumission",
        description: error.response?.data?.message || error.message || "Une erreur est survenue lors de la soumission du litige.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'approved': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'rejected': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return '';
    }
  };

  // Fonction pour traduire le statut
  const translateStatus = (status: string) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-indigo-50/20 to-gray-100 dark:from-gray-900 dark:via-indigo-950/10 dark:to-gray-800 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 drop-shadow-sm">
            Soumission & Litiges
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-2">
            Soumettez un résultat de match ou signalez un problème.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="md:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Nouvelle Soumission / Litige
              </CardTitle>
              <CardDescription>
                Vous avez {DISPUTE_WINDOW_MINUTES} minutes après un match pour faire une soumission. Sélectionnez le match concerné.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="match">Match Concerné</Label>
                  {isLoadingMatches ? (
                    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    </div>
                  ) : recentMatches.length === 0 ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center space-y-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        Aucun match de la journée n'est disponible pour un litige.
                      </p>
                      <Link 
                        to="/dashboard" 
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline"
                      >
                        Retourner au tableau de bord
                      </Link>
                    </div>
                  ) : (
                    <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un match" />
                      </SelectTrigger>
                      <SelectContent>
                        {recentMatches.map((match) => (
                          <SelectItem key={match._id} value={match._id}>
                            {match.tournamentName ? `${match.tournamentName} - ` : ''} 
                            Match contre {match.opponent.username} ({match.time || 'Heure inconnue'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedMatch && opponentInfo && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">{opponentInfo}</p>
                  </div>
                )}

                {selectedMatch && (
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-medium">Catégorie</Label>
                    <Select onValueChange={setCategory} value={category} disabled={isSubmitting}>
                      <SelectTrigger id="category" className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
                        <SelectValue placeholder="Choisissez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match_result">
                          <div className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4" />
                            Résultats de match (soumettre un score)
                          </div>
                        </SelectItem>
                        <SelectItem value="complaint">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Plainte (problème de match, comportement, etc.)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {category === "match_result" && selectedMatch && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="playerScore" className="font-medium">Votre Score</Label>
                      <Input 
                        id="playerScore" 
                        type="number" 
                        value={playerScore} 
                        onChange={(e) => setPlayerScore(e.target.value)} 
                        placeholder="Ex: 3"
                        required={category === "match_result"}
                        disabled={isSubmitting}
                        className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opponentScore" className="font-medium">Score Adversaire</Label>
                      <Input 
                        id="opponentScore" 
                        type="number" 
                        value={opponentScore} 
                        onChange={(e) => setOpponentScore(e.target.value)} 
                        placeholder="Ex: 1"
                        required={category === "match_result"}
                        disabled={isSubmitting}
                        className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    {category === "match_result" ? "Commentaire (optionnel)" : "Description du Litige"}
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={category === "match_result" ? "Ajoutez un commentaire si nécessaire..." : "Décrivez clairement le problème rencontré..."}
                    rows={category === "match_result" ? 3 : 5}
                    required={category === "complaint"}
                    disabled={isSubmitting || !selectedMatch || !category}
                    className="bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof" className="font-medium flex items-center justify-between">
                    <span>Preuve {category === "match_result" ? "(Capture d'écran du score - Obligatoire)" : "(Image)"}</span>
                    <Badge variant="outline" className="font-normal">
                      Max: 5MB
                    </Badge>
                  </Label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    required={category === "match_result"}
                    disabled={isSubmitting || !selectedMatch || !category}
                    className="cursor-pointer bg-gray-50 dark:bg-gray-900 file:bg-indigo-100 file:text-indigo-700 file:border-0 file:rounded file:font-medium file:mr-4 file:py-2 file:px-3 hover:file:bg-indigo-200 dark:file:bg-indigo-950/30 dark:file:text-indigo-300"
                  />
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span>Formats supportés : JPG, PNG, GIF, WEBP</span>
                  </p>
                  {proofPreview && (
                    <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-900 max-h-60 overflow-auto">
                      <img src={proofPreview} alt="Aperçu de la preuve" className="rounded-md max-w-full h-auto" />
                    </div>
                  )}
                </div>
            </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow gap-2" 
                    disabled={isSubmitting || !selectedMatch || !category || (category === "complaint" && !description) || (category === "match_result" && (!playerScore || !opponentScore || !proofFile)) || isLoadingMatches}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Soumission en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-1.5 h-4 w-4" />
                      {category === "match_result" ? "Soumettre le Résultat" : "Soumettre le Litige"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                Mes Soumissions / Litiges
              </CardTitle>
              <CardDescription>Consultez l'historique et le statut de vos actions.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDisputes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : userDisputes.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {userDisputes.map((dispute) => (
                    <div 
                      key={dispute._id}
                      className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {dispute.category === 'match_result' ? 'Résultat de match' : 'Plainte'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Contre {dispute.opponent.username}
                            {dispute.match.tournament?.title && ` • ${dispute.match.tournament.title}`}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getStatusBadgeClass(dispute.status)}
                        >
                          {translateStatus(dispute.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p className="truncate">{dispute.reason}</p>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(dispute.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {dispute.resolvedAt && dispute.adminComment && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Réponse :</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {dispute.adminComment}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vous n'avez pas encore soumis de litige ou de résultat de match.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-md border-none">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">Processus de Traitement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[ 
              { title: "Soumission", description: "Remplissez le formulaire avec les informations exactes et les preuves.", icon: <FileUp className="h-8 w-8 text-indigo-500" /> },
              { title: "Examen", description: "Notre équipe (ou validateurs) examine votre soumission ou litige.", icon: <CheckCircle className="h-8 w-8 text-indigo-500" /> },
              { title: "Résolution", description: "Une décision est prise et appliquée. Vous serez notifié du statut.", icon: <Send className="h-8 w-8 text-indigo-500" /> },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center p-4 bg-white dark:bg-gray-700/50 rounded-lg shadow-sm">
                <div className="mb-3 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">{step.icon}</div>
                <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-100">{index + 1}. {step.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700/50 shadow-sm">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Attention:</strong> Les soumissions/litiges abusifs, faux ou répétés sans fondement peuvent entraîner des sanctions. Utilisez ce système de manière responsable.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Disputes
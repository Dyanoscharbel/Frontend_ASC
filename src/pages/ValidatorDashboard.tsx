import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, Trophy, Ban, Info, Shield, Loader2, CheckCircle, XCircle, Wallet } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { BecomeValidatorDialog } from "@/components/dialogs/BecomeValidatorDialog"
import { validatorService, Dispute } from "@/services/validator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatCurrency, convertCurrencySync } from "@/config/currency"

export default function ValidatorDashboard() {
  const { user, updateUserInfo } = useAuth();
  const [showValidatorDialog, setShowValidatorDialog] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);

  const formatRewardAmount = (amount: number) => {
    if (!user?.preferredCurrency || user.preferredCurrency === 'XOF') {
      return `${amount.toLocaleString('fr-FR')} FCFA`;
    }
    
    try {
      const convertedAmount = convertCurrencySync(amount, 'XOF', user.preferredCurrency);
      return formatCurrency(convertedAmount, user.preferredCurrency);
    } catch (error) {
      return `${amount.toLocaleString('fr-FR')} FCFA`;
    }
  };

  useEffect(() => {
    // Si l'utilisateur n'est pas validateur, afficher le dialogue
    if (user && user.role !== 'validator') {
      setShowValidatorDialog(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchDisputes = async () => {
      if (user?.role !== 'validator') return;
      
      try {
        setLoading(true);
        const allDisputes = await validatorService.getPendingDisputes();
        setDisputes(allDisputes);
      } catch (error) {
        console.error("Erreur lors de la récupération des litiges:", error);
        toast.error("Impossible de charger les litiges");
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [user]);

  useEffect(() => {
    const fetchRewards = async () => {
      if (user?.role !== 'validator') return;
      
      try {
        setLoadingRewards(true);
        const data = await validatorService.getValidatorRewards();
        setRewards(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des récompenses:", error);
        toast.error("Impossible de charger les récompenses");
      } finally {
        setLoadingRewards(false);
      }
    };

    fetchRewards();
  }, [user]);

  // Si l'utilisateur n'est pas validateur, ne pas afficher le contenu du tableau de bord
  if (user && user.role !== 'validator') {
    return (
      <BecomeValidatorDialog 
        open={showValidatorDialog} 
        onClose={() => setShowValidatorDialog(false)} 
      />
    );
  }

  const handleClaimReward = async (rewardId: string) => {
    try {
      setIsProcessing(true);
      const response = await validatorService.claimReward(rewardId);
      
      // Mettre à jour la liste des récompenses
      const updatedRewards = await validatorService.getValidatorRewards();
      setRewards(updatedRewards);
      
      // Mettre à jour le solde de l'utilisateur
      if (updateUserInfo && user) {
        updateUserInfo({
          ...user,
          solde: response.newBalance
        });
      }
      
      toast.success("Récompense réclamée avec succès");
    } catch (error) {
      console.error("Erreur lors de la réclamation de la récompense:", error);
      toast.error("Impossible de réclamer la récompense");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveDispute = async (status: 'approve' | 'reject') => {
    if (!selectedDispute) return;

    try {
      setIsProcessing(true);
      await validatorService.resolveDispute(selectedDispute._id, {
        status,
        comment
      });

      // Mettre à jour la liste des litiges
      const allDisputes = await validatorService.getPendingDisputes();
      setDisputes(allDisputes);

      // Mettre à jour la liste des récompenses
      const updatedRewards = await validatorService.getValidatorRewards();
      setRewards(updatedRewards);

      toast.success(
        status === 'approve' 
          ? "Litige approuvé avec succès" 
          : "Litige rejeté avec succès"
      );
      setIsDetailsOpen(false);
      setComment("");
      setSelectedDispute(null);
    } catch (error) {
      console.error("Erreur lors du traitement du litige:", error);
      toast.error(
        status === 'approve'
          ? "Erreur lors de l'approbation du litige"
          : "Erreur lors du rejet du litige"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tableau de bord Validateur</h1>
          <div className="flex items-center gap-2">
            <Badge className="flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Wallet className="h-4 w-4" />
              25 FCFA par validation
            </Badge>
          </div>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Vous recevrez 25 FCFA pour chaque validation effectuée. L'argent sera directement ajouté à votre solde et disponible dans la section Récompenses.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="flex-nowrap overflow-x-auto max-w-full w-full scrollbar-hide">
            <TabsTrigger value="pending">Litiges en cours</TabsTrigger>
            <TabsTrigger value="rules">Règles</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid gap-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : disputes.length > 0 ? (
                disputes.map((dispute) => (
                  <Card key={dispute._id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <span>Litige #{dispute._id.slice(-6)}</span>
                          <Badge variant="outline" className={dispute.category === 'match_result' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}>
                            {dispute.category === 'match_result' ? 'Résultat de match' : 'Plainte'}
                          </Badge>
                        </CardTitle>
                    <Badge className="bg-yellow-500">
                      <Clock className="w-4 h-4 mr-1" />
                          En attente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                      <div className="space-y-6">
                        {/* Informations sur les joueurs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              Plaignant
                            </h3>
                            <div className="flex items-center gap-3">
                              {dispute.user.avatar ? (
                                <img src={dispute.user.avatar} alt={dispute.user.username} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">{dispute.user.username[0]}</span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{dispute.user.username}</p>
                                <p className="text-sm text-gray-500">ID: {dispute.user._id.slice(-6)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-red-500" />
                              Adversaire
                            </h3>
                            <div className="flex items-center gap-3">
                              {dispute.opponent.avatar ? (
                                <img src={dispute.opponent.avatar} alt={dispute.opponent.username} className="w-10 h-10 rounded-full" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">{dispute.opponent.username[0]}</span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{dispute.opponent.username}</p>
                                <p className="text-sm text-gray-500">ID: {dispute.opponent._id.slice(-6)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Informations sur le match et le tournoi */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Détails du match
                          </h3>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-gray-500">ID du match:</span>{" "}
                              {dispute.match._id.slice(-6)}
                            </p>
                            {dispute.match.tournament && (
                              <p className="text-sm">
                                <span className="text-gray-500">Tournoi:</span>{" "}
                                {dispute.match.tournament.title}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Détails du litige */}
                        <div className="p-4 border rounded-lg space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Motif du litige</h3>
                            <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              {dispute.reason}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold mb-2">Description détaillée</h3>
                            <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap">
                              {dispute.description}
                            </p>
                          </div>

                          {dispute.proofUrl && (
                            <div>
                              <h3 className="text-sm font-semibold mb-2">Preuves</h3>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2"
                                onClick={() => window.open(dispute.proofUrl, '_blank')}
                              >
                                <Info className="h-4 w-4" />
                                Voir la preuve
                              </Button>
                      </div>
                          )}

                          <div className="pt-4 border-t grid grid-cols-2 gap-4">
                            <Button 
                              variant="outline" 
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approuver
                            </Button>
                            <Button 
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-700"
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Aucun litige en attente
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Tous les litiges ont été traités.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules">
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  Règles de validation
                </CardTitle>
                </CardHeader>
              <CardContent className="space-y-6">
                {/* Match standard */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Match standard
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2 joueurs, durée normale de match définie par DLS.
                  </p>
                      </div>

                {/* Triche */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Ban className="h-4 w-4 text-red-500" />
                    Triche interdite
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toute modification du jeu, triche, script ou abus de bug entraîne l'élimination immédiate.
                  </p>
                    </div>

                {/* Preuve de victoire */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Preuve de victoire
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chaque vainqueur doit fournir une capture d'écran claire du score final.
                  </p>
                      </div>

                {/* Match nul */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Match nul
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Relancer automatiquement le match avec le code d'origine. En cas de refus explicite ou d'absence d'un des joueurs à la relance automatique, l'autre est déclaré vainqueur par forfait.
                  </p>
                      </div>

                {/* Match non joué */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Match non joué
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Les deux joueurs présents doivent se plaindre. Si l'adversaire ne formule pas de plainte dans les 15 minutes suivant l'heure du match, il est déclaré forfait. Si aucun des deux ne formule de plainte, ils sont déclarés forfait.
                  </p>
                    </div>

                {/* Match interrompu */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Match interrompu
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    En cas de déconnexion, le système DLS attribue automatiquement la victoire au joueur qui ne s'est pas déconnecté. Cette décision est considérée comme définitive et incontestable par l'ASC.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Seuls les cas d'égalités injustifiées (match arrêté à 0-0 sans vainqueur) ou de bugs confirmés par capture vidéo peuvent être soumis à une analyse. Sinon, la décision du système DLS prévaut toujours.
                  </p>
                  </div>

                {/* Vérification des preuves */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    Vérification des preuves
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    En cas de doute sur un screenshot, une courte vidéo du score ou la capture originale depuis la galerie sera exigée.
                  </p>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résoudre le litige</DialogTitle>
            <DialogDescription>
              Veuillez fournir un commentaire expliquant votre décision.
              {selectedDispute && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  <p><strong>Motif:</strong> {selectedDispute.reason}</p>
                  <p><strong>Description:</strong> {selectedDispute.description}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Votre commentaire..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailsOpen(false);
                setComment("");
              }}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleResolveDispute('approve')}
              disabled={isProcessing || !comment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleResolveDispute('reject')}
              disabled={isProcessing || !comment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
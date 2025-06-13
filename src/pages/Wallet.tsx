import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  WalletIcon,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Sparkles,
  Coins,
  Info,
  Plus,
  ChevronDown,
  ChevronUp,
  Gift, // Pour les récompenses de points
  Repeat, // Pour l'échange
  DollarSign, // Pour le rechargement
  Loader2, // Pour l'indicateur de chargement
  Globe, // Pour l'icône de devise
  Check,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// Shadcn UI Dialog pour la simulation de rechargement
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Import des utilitaires de devise et du contexte d'authentification
import { CURRENCIES, convertCurrency, convertCurrencySync, formatCurrency } from "@/config/currency";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user";
import { walletService, Transaction as ApiTransaction } from "@/services/wallet";
import { User as AuthUser } from "@/services/auth";
import api from '@/services/api';

// --- TYPES ---
interface WalletData {
  zgeg: number;
  points: number;
  tickets: number;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  priceZgeg: number; // Prix en FCFA
  pointsForExchange?: number; // Points requis pour un échange direct contre cet item
  ticketYield: number; // Combien de tickets cet item donne (généralement 1)
  imagePlaceholderIcon: React.ElementType; // Pour un icône au lieu d'une image
  category: "ticket"; // Simplifié pour l'instant
}

// --- DONNÉES FICTIVES INITIALES ---
const initialWalletData: WalletData = {
  zgeg: 1250,
  points: 450,
  tickets: 3
};

const initialTransactions: ApiTransaction[] = [
  { _id: "tx1", userId: "demo", amount: 500, type: 'deposit', description: "Rechargement FCFA", currency: "zgeg", status: "completed", date: "2023-11-15T14:22:43Z" },
  { _id: "tx2", userId: "demo", amount: 20, type: "reward_points", description: "Points gagnés - Tournoi Alpha", currency: "points", status: "completed", date: "2023-11-14T10:15:32Z" },
  { _id: "tx3", userId: "demo", amount: 1000, type: "purchase_zgeg", description: "Achat Ticket Tournoi", currency: "zgeg", status: "completed", date: "2023-11-14T09:30:12Z" },
];

const POINTS_PER_TOURNAMENT = 20;
const TICKET_EXCHANGE_COST_POINTS = 1000;
const STANDARD_TICKET_ID = "ticket_std_1000";

const shopItemsAvailable: ShopItem[] = [
  {
    id: STANDARD_TICKET_ID,
    name: "Ticket Tournoi",
    description: "Ticket standard pour participer à un tournoi.",
    priceZgeg: 1000,
    pointsForExchange: TICKET_EXCHANGE_COST_POINTS,
    ticketYield: 1,
    imagePlaceholderIcon: CreditCard,
    category: "ticket",
  },
  // Potentiellement d'autres items plus tard, mais non achetables/échangeables pour le moment
  // {
  //   id: "ticket_premium_5000",
  //   name: "Ticket Tournoi Premium 5000F",
  //   description: "Accès aux tournois avec de plus grosses récompenses.",
  //   priceZgeg: 5000,
  //   ticketYield: 1,
  //   imagePlaceholderIcon: Star,
  //   category: "ticket",
  // }
];

// Liste complète des moyens de paiement (extrait de mode de paiement.txt)
const paymentMethodsList = [
  { name: 'Airtel Congo', code: 'airtel_cd', currency: 'CDF', country: 'CD' },
  { name: 'Airtel Money Malawi', code: 'airtel_mw', currency: 'MWK', country: 'MW' },
  { name: 'Airtel Money Nigeria', code: 'airtel_ng', currency: 'NGN', country: 'NG' },
  { name: 'Airtel Rwanda', code: 'airtel_rw', currency: 'RWF', country: 'RW' },
  { name: 'Airtel Tanzania', code: 'airtel_tz', currency: 'TZS', country: 'TZ' },
  { name: 'Airtel Uganda', code: 'airtel_ug', currency: 'UGX', country: 'UG' },
  { name: 'Airtel Zambia', code: 'airtel_zm', currency: 'ZMW', country: 'ZM' },
  { name: 'Djamo CI', code: 'djamo_ci', currency: 'XOF', country: 'CI' },
  { name: 'Djamo SN', code: 'djamo_sn', currency: 'XOF', country: 'SN' },
  { name: 'E-Money Senegal', code: 'e_money_sn', currency: 'XOF', country: 'SN' },
  { name: 'EU Mobile Money Cameroon', code: 'eu_mobile_cm', currency: 'XAF', country: 'CM' },
  { name: 'Free Money Senegal', code: 'freemoney_sn', currency: 'XOF', country: 'SN' },
  { name: 'Halopesa', code: 'halopesa_tz', currency: 'TZS', country: 'TZ' },
  { name: 'Test Payout Method', code: 'moneroo_payout_demo', currency: 'USD', country: 'US' },
  { name: 'Moov Money Benin', code: 'moov_bj', currency: 'XOF', country: 'BJ' },
  { name: 'Moov Money CI', code: 'moov_ci', currency: 'XOF', country: 'CI' },
  { name: 'Moov Money Togo', code: 'moov_tg', currency: 'XOF', country: 'TG' },
  { name: 'M-Pesa Kenya', code: 'mpesa_ke', currency: 'KES', country: 'KE' },
  { name: 'Vodacom Tanzania', code: 'mpesa_tz', currency: 'TZS', country: 'TZ' },
  { name: 'MTN MoMo Benin', code: 'mtn_bj', currency: 'XOF', country: 'BJ' },
  { name: 'MTN MoMo CI', code: 'mtn_ci', currency: 'XOF', country: 'CI' },
  { name: 'MTN MoMo Cameroon', code: 'mtn_cm', currency: 'XAF', country: 'CM' },
  { name: 'MTN MoMo Ghana', code: 'mtn_gh', currency: 'GHS', country: 'GH' },
  { name: 'MTN Nigeria', code: 'mtn_ng', currency: 'NGN', country: 'NG' },
  { name: 'MTN MoMo Rwanda', code: 'mtn_rw', currency: 'RWF', country: 'RW' },
  { name: 'MTN MoMo Uganda', code: 'mtn_ug', currency: 'UGX', country: 'UG' },
  { name: 'MTN MoMo Zambia', code: 'mtn_zm', currency: 'ZMW', country: 'ZM' },
  { name: 'Orange Congo', code: 'orange_cd', currency: 'CDF', country: 'CD' },
  { name: 'Orange Money CI', code: 'orange_ci', currency: 'XOF', country: 'CI' },
  { name: 'Orange Money Cameroon', code: 'orange_cm', currency: 'XAF', country: 'CM' },
  { name: 'Orange Money Mali', code: 'orange_ml', currency: 'XOF', country: 'ML' },
  { name: 'Orange Money Senegal', code: 'orange_sn', currency: 'XOF', country: 'SN' },
  { name: 'Airtel/Tigo Ghana', code: 'tigo_gh', currency: 'GHS', country: 'GH' },
  { name: 'Tigo Tanzania', code: 'tigo_tz', currency: 'TZS', country: 'TZ' },
  { name: 'TNM Mpamba Malawi', code: 'tnm_mw', currency: 'MWK', country: 'MW' },
  { name: 'Togocel Money', code: 'togocel', currency: 'XOF', country: 'TG' },
  { name: 'Vodacom Congo', code: 'vodacom_cd', currency: 'CDF', country: 'CD' },
  { name: 'Vodafone Ghana', code: 'vodafone_gh', currency: 'GHS', country: 'GH' },
  { name: 'Wave CI', code: 'wave_ci', currency: 'XOF', country: 'CI' },
  { name: 'Wave Senegal', code: 'wave_sn', currency: 'XOF', country: 'SN' },
  { name: 'Zamtel Kwacha', code: 'zamtel_zm', currency: 'ZMW', country: 'ZM' },
];

const Wallet = () => {
  const [walletData, setWalletData] = useState<WalletData>({ zgeg: 0, points: 0, tickets: 0 });
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [cartItems, setCartItems] = useState<{id: string, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number | string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExchangeConfirmDialogOpen, setIsExchangeConfirmDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Added state for loading
  const [phoneError, setPhoneError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('BJ');
  const [selectedPrefix, setSelectedPrefix] = useState<string>('229');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const { user, updateUserInfo } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(user?.preferredCurrency || "XOF");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const { toast } = useToast();

  // Charger les données du profil utilisateur (solde, points, tickets)
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await userService.getUserProfile() as AuthUser;
        console.log('Profil chargé (données brutes):', profile);
        console.log('Soldes:', {
          solde: profile.solde,
          pointsDeFidelite: profile.pointsDeFidelite,
          ticketsDeTournois: profile.ticketsDeTournois
        });
        
        setWalletData({
          zgeg: profile.solde ?? 0,
          points: profile.pointsDeFidelite ?? 0,
          tickets: profile.ticketsDeTournois ?? 0
        });
        
        console.log('WalletData mis à jour:', {
          zgeg: profile.solde ?? 0,
          points: profile.pointsDeFidelite ?? 0,
          tickets: profile.ticketsDeTournois ?? 0
        });

        if (updateUserInfo) {
          updateUserInfo(profile);
        }

        // Mettre à jour le montant converti
        if (profile.solde !== undefined && profile.solde !== null) {
          try {
            const converted = await convertCurrency(profile.solde, 'XOF', selectedCurrency);
            setConvertedAmount(converted);
            console.log('Montant converti:', converted);
          } catch (error) {
            const converted = convertCurrencySync(profile.solde, 'XOF', selectedCurrency);
            setConvertedAmount(converted);
            console.log('Montant converti (sync):', converted);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du portefeuille",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadUserProfile();
  }, [user?._id]);

  // Charger les transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await walletService.getTransactions(currentPage, 20);
        const newTransactions = response.transactions;
        setTransactions(prev => {
          // Si c'est la première page, remplacer complètement
          if (currentPage === 1) return newTransactions;
          // Sinon, ajouter les nouvelles transactions en évitant les doublons
          const existingIds = new Set(prev.map(t => t._id));
          const uniqueNewTransactions = newTransactions.filter(t => !existingIds.has(t._id));
          return [...prev, ...uniqueNewTransactions];
        });
        setHasMoreTransactions(currentPage < response.pagination.pages);
      } catch (error) {
        console.error('Erreur lors du chargement des transactions:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des transactions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [currentPage, toast]);

  const loadMoreTransactions = () => {
    if (!isLoading && hasMoreTransactions) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Effet pour mettre à jour le montant converti lorsque la devise ou le solde change
  useEffect(() => {
    const updateConvertedAmount = async () => {
      setIsLoadingRates(true);
      try {
        // Tenter d'utiliser l'API en temps réel
        const converted = await convertCurrency(walletData.zgeg, 'XOF', selectedCurrency);
        setConvertedAmount(converted);
      } catch (error) {
        // En cas d'erreur, utiliser la méthode synchrone avec taux fixes
        console.error('Erreur lors de la conversion avec API:', error);
        const converted = convertCurrencySync(walletData.zgeg, 'XOF', selectedCurrency);
        setConvertedAmount(converted);
      } finally {
        setIsLoadingRates(false);
      }
    };

    updateConvertedAmount();
  }, [selectedCurrency, walletData.zgeg]);

  // Fonction pour sauvegarder la devise préférée dans le profil utilisateur
  const savePreferredCurrency = async (currency: string) => {
    if (!user) {
      console.error("Impossible de sauvegarder la devise: utilisateur non connecté");
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier vos préférences",
        variant: "destructive"
      });
      return;
    }
    
    if (currency === selectedCurrency) return;
    
    const previousCurrency = selectedCurrency;
    setSelectedCurrency(currency); // Mise à jour optimiste de l'interface
    setIsLoadingRates(true); // Indiquer le chargement
    
    try {
      console.log("[DEVISE] Mise à jour de la devise préférée:", currency);
      
      // Utiliser la nouvelle méthode dédiée pour mettre à jour uniquement la devise
      const updatedUser = await userService.updatePreferredCurrency(currency);
      
      console.log("[DEVISE] Réponse API:", updatedUser?.preferredCurrency || "non définie");
      
      // Mettre à jour les infos utilisateur dans le contexte d'authentification
      if (updateUserInfo && updatedUser) {
        const updatedUserData = {
          ...user,
          preferredCurrency: updatedUser.preferredCurrency || currency
        };
        
        // Mise à jour du localStorage
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        console.log("[DEVISE] Contexte utilisateur mis à jour");
        
        updateUserInfo(updatedUserData);
        
        toast({
          title: "Devise mise à jour",
          description: `Votre devise préférée est maintenant ${currency}`,
          variant: "default"
        });
      } else {
        console.warn("[DEVISE] Données utilisateur manquantes dans la réponse");
      }
    } catch (error: any) {
      console.error("[DEVISE] Échec de mise à jour:", error);
      // Restaurer l'ancienne devise dans l'interface
      setSelectedCurrency(previousCurrency);
      
      let errorMessage = "Une erreur est survenue lors de la mise à jour de la devise";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        console.error("[DEVISE] Détails de l'erreur:", error.response.status, error.response.data);
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingRates(false); // Fin du chargement
    }
  };

  const createTransaction = (
    amount: number,
    type: ApiTransaction['type'],
    description: string,
    currency: ApiTransaction['currency']
  ): ApiTransaction => {
    return {
      _id: `tx${Date.now()}${Math.floor(Math.random() * 1000)}`,
      userId: user?._id || "system_user",
      date: new Date().toISOString(),
      amount,
      type,
      description,
      currency,
      status: "completed",
    };
  };

  // Après chaque opération, recharger le profil utilisateur
  const syncUserProfile = async () => {
    try {
      // Recharger le profil utilisateur
      const profile = await userService.getUserProfile() as AuthUser;
      console.log('Synchronisation du profil:', profile); // Debug log

      // Mettre à jour les données du portefeuille avec les valeurs directement depuis l'objet utilisateur
      setWalletData({
        zgeg: profile.solde ?? 0,
        points: profile.pointsDeFidelite ?? 0,
        tickets: profile.ticketsDeTournois ?? 0
      });

      // Mettre à jour le contexte utilisateur
      if (updateUserInfo) {
        updateUserInfo(profile);
      }

      // Recharger les transactions
      setCurrentPage(1);
      const response = await walletService.getTransactions(1, 20);
      setTransactions(response.transactions);
      setHasMoreTransactions(1 < response.pagination.pages);

      // Mettre à jour le montant converti
      if (profile.solde !== undefined && profile.solde !== null) {
        try {
          const converted = await convertCurrency(profile.solde, 'XOF', selectedCurrency);
          setConvertedAmount(converted);
        } catch (error) {
          const converted = convertCurrencySync(profile.solde, 'XOF', selectedCurrency);
          setConvertedAmount(converted);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation du profil utilisateur:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de mettre à jour les informations du portefeuille",
        variant: "destructive"
      });
    }
  };

  // --- ACTIONS UTILISATEUR (SIMULATIONS) ---

  const handleRechargeZgeg = async () => {
    const amount = Number(rechargeAmount);
    if (amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide pour la recharge.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide (8 chiffres sans 0 initial).",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const paymentData = await paymentService.initiateCinetPayPayment({
        amount,
        description: `Rechargement de portefeuille - ${user?.username}`,
        customer_email: user?.email || '',
        customer_name: user?.profile?.firstName || user?.username || '',
        customer_surname: user?.profile?.lastName || '',
        customer_phone_number: phoneNumber,
        operator: 'ALL'
      });

      if (paymentData && paymentData.payment_url) {
        // Réinitialiser les champs
        setRechargeAmount("");
        setPhoneNumber("");
        setIsRechargeDialogOpen(false);
        
        // Rediriger vers la page de paiement
        window.location.href = paymentData.payment_url;
      } else {
        throw new Error("URL de paiement CinetPay non reçue.");
      }
    } catch (error: any) {
      console.error(`Erreur lors de l'initiation du paiement CinetPay:`, error);
      toast({
        title: "Erreur de Paiement",
        description: error.response?.data?.message || error.message || "Impossible d'initier le paiement avec CinetPay. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const simulateTournamentParticipation = () => {
    setWalletData(prev => ({ ...prev, points: prev.points + POINTS_PER_TOURNAMENT }));
    const newTx = createTransaction(POINTS_PER_TOURNAMENT, "reward_points", `Récompense: ${POINTS_PER_TOURNAMENT} points (Participation Tournoi)`, "points");
    setTransactions(prevTx => [newTx, ...prevTx]);
    alert(`Vous avez gagné ${POINTS_PER_TOURNAMENT} points de fidélité !`);
  };

  // --- GESTION PANIER & ACHAT FCFA ---
  const addToCart = (itemId: string) => {
    const itemInShop = shopItemsAvailable.find(i => i.id === itemId);
    if (!itemInShop) return;

    // Pour l'instant, on n'ajoute au panier que pour un achat en FCFA
    if (walletData.zgeg < itemInShop.priceZgeg) {
        alert("Fonds FCFA insuffisants pour ajouter cet article au panier.");
        return;
    }

    const existingItem = cartItems.find(item => item.id === itemId);
    if (existingItem) {
      setCartItems(cartItems.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCartItems([...cartItems, { id: itemId, quantity: 1 }]);
    }
    if (!showCart) setShowCart(true);
  };
  
  const removeFromCart = (itemId: string) => {
    const existingItem = cartItems.find(item => item.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(cartItems.map(item => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item));
    } else {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    }
  };
  
  const cartTotalZgeg = cartItems.reduce((total, cartItem) => {
    const item = shopItemsAvailable.find(i => i.id === cartItem.id);
    return total + (item ? item.priceZgeg * cartItem.quantity : 0);
  }, 0);
  
  const checkoutCart = async () => {
    if (cartItems.length === 0) return;
    setIsCheckoutLoading(true);
    try {
      for (const item of cartItems) {
        const shopItem = shopItemsAvailable.find(si => si.id === item.id);
        if (!shopItem) continue;
        const payload = {
          amount: shopItem.priceZgeg * item.quantity,
          type: 'purchase_zgeg' as ApiTransaction['type'],
          description: `Achat ${item.quantity}x ${shopItem.name}`,
          currency: 'zgeg' as ApiTransaction['currency'],
          userId: user?._id,
          quantity: item.quantity
        };
        console.log("[Paiement] Payload envoyé à l'API:", payload);
        try {
          const response = await walletService.createTransaction(payload);
          console.log('[Paiement] Réponse du backend:', response);
        } catch (error) {
          // Enregistrer une transaction échouée
          await walletService.createTransaction({
            ...payload,
            status: 'failed'
          } as Partial<ApiTransaction>);
          toast({
            title: "Erreur",
            description: "La transaction a échoué et a été enregistrée comme échouée.",
            variant: "destructive"
          });
          setIsCheckoutLoading(false);
      return;
    }
      }
      await syncUserProfile();
      setCurrentPage(1);
      const response = await walletService.getTransactions(1, 20);
      setTransactions(response.transactions);
      setHasMoreTransactions(1 < response.pagination.pages);
    setCartItems([]);
    setShowCart(false);
      toast({
        title: "Succès",
        description: "Vos achats ont été effectués avec succès",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'achat a échoué.",
        variant: "destructive"
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // --- ÉCHANGE POINTS CONTRE TICKET ---
  const exchangePointsForTicket = async (itemId: string) => {
    const item = shopItemsAvailable.find(i => i.id === itemId);
    if (!item || !item.pointsForExchange) return;

    setIsCheckoutLoading(true); // Utiliser le même état de chargement pour l'échange

    try {
      // Recharger le profil utilisateur depuis la BD pour vérifier les points réels
      const profile = await userService.getUserProfile() as AuthUser;
      if ((profile.pointsDeFidelite || 0) < item.pointsForExchange) {
        toast({
          title: "Points insuffisants",
          description: "Votre solde de points est insuffisant pour cet échange.",
          variant: "destructive"
        });
        // Enregistrer une transaction échouée pour les points
        await walletService.createTransaction({
          amount: item.pointsForExchange,
          type: 'exchange_points_ticket' as ApiTransaction['type'],
          description: `Échange échoué de points pour ${item.name}`,
          currency: 'points' as ApiTransaction['currency'],
          userId: user?._id,
          status: 'failed'
        } as Partial<ApiTransaction>);
        setIsCheckoutLoading(false);
      return;
    }

      // Si les points sont suffisants, lancer la transaction d'échange
      const payload = {
        amount: item.pointsForExchange,
        type: 'exchange_points_ticket' as ApiTransaction['type'],
        description: `Échange de points pour ${item.name}`,
        currency: 'points' as ApiTransaction['currency'],
        userId: user?._id
      };

      console.log("[Échange Points] Payload envoyé à l'API:", payload);

      try {
        const response = await walletService.createTransaction(payload);
        console.log('[Échange Points] Réponse du backend:', response);
      } catch (error) {
        // Enregistrer une transaction échouée si l'appel API échoue
        await walletService.createTransaction({
          ...payload,
          status: 'failed'
        } as Partial<ApiTransaction>);
        toast({
          title: "Erreur d'échange",
          description: "L'échange de points a échoué et a été enregistré comme échoué.",
          variant: "destructive"
        });
        setIsCheckoutLoading(false);
      return;
    }

      // Si l'échange réussit, synchroniser le profil et afficher le succès
      await syncUserProfile();
      // On peut aussi synchroniser l'historique des transactions ici si on veut voir l'échange immédiatement
      setCurrentPage(1);
      const transactionsResponse = await walletService.getTransactions(1, 20);
      setTransactions(transactionsResponse.transactions);
      setHasMoreTransactions(1 < transactionsResponse.pagination.pages);

      toast({
        title: "Succès",
        description: `Vous avez échangé ${item.pointsForExchange} points contre ${item.ticketYield} ticket(s)`,
        variant: "default"
      });
    } catch (error) {
      console.error('[Échange Points] Erreur lors de l\'échange:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'échange de points.",
        variant: "destructive"
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };


  const getTransactionIcon = (transaction: ApiTransaction) => {
    switch (transaction.type) {
      case "deposit": return <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "purchase_zgeg": return <ShoppingBag className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "reward_points": return <Gift className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "exchange_points_ticket": return <Repeat className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColorClass = (transaction: ApiTransaction) => {
     switch (transaction.type) {
      case "deposit": return "text-green-600 dark:text-green-400";
      case "reward_points": return "text-yellow-600 dark:text-yellow-400"; // Points gagnés sont positifs
      case "purchase_zgeg": return "text-red-600 dark:text-red-400"; // Dépense FCFA
      case "exchange_points_ticket": return "text-red-600 dark:text-red-400"; // Dépense Points
      default: return "";
    }
  }
   const getTransactionSign = (transaction: ApiTransaction) => {
    switch (transaction.type) {
      case "deposit":
      case "reward_points":
        return "+";
      case "purchase_zgeg":
      case "exchange_points_ticket": // On affiche la dépense en points
        return "-";
      default:
        return "";
    }
  };

  // Ajouter cette fonction pour convertir les montants des transactions zgeg
  const formatTransactionAmount = (transaction: ApiTransaction): string => {
    if (transaction.currency === 'zgeg') {
      // Conversion du montant transactionnel en devise sélectionnée
      const convertedAmount = convertCurrencySync(
        transaction.amount, 
        'XOF', 
        selectedCurrency
      );
      return `${getTransactionSign(transaction)}${formatCurrency(convertedAmount, selectedCurrency)}`;
    } else if (transaction.currency === 'points') {
      return `${getTransactionSign(transaction)}${transaction.amount} Points`;
    } else {
      return `${getTransactionSign(transaction)}${transaction.amount}`;
    }
  };

  const TransactionsList = ({ limit }: { limit?: number } = {}) => {
    const displayTransactions = limit ? transactions.slice(0, limit) : transactions;
    
    return (
      <div className="space-y-4">
        {isLoading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {displayTransactions.map((transaction: ApiTransaction) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getTransactionColorClass(transaction)}`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTransactionColorClass(transaction)}`}>
                    {getTransactionSign(transaction)}{formatTransactionAmount(transaction)}
                  </p>
                  <Badge variant={transaction.status === 'completed' ? 'secondary' : 'default'}>
                    {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                  </Badge>
                </div>
              </motion.div>
            ))}
            
            {hasMoreTransactions && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMoreTransactions}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Charger plus'
                  )}
                </Button>
              </div>
            )}

            {!hasMoreTransactions && transactions.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Toutes les transactions ont été chargées
              </p>
            )}

            {transactions.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Aucune transaction</h3>
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas encore effectué de transaction
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^[1-9][0-9]{7}$/; // Format: 8 chiffres sans 0 initial
    return phoneRegex.test(number);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Enlever tous les caractères non numériques
    const cleanedValue = value.replace(/\D/g, '');
    // Si le numéro commence par 0, l'enlever
    const finalValue = cleanedValue.startsWith('0') ? cleanedValue.substring(1) : cleanedValue;
    setPhoneNumber(finalValue);
    if (selectedOperator) {
      validatePhoneNumber(finalValue);
    }
  };

  const handleOperatorChange = (value: string) => {
    setSelectedOperator(value);
    if (phoneNumber) {
      validatePhoneNumber(phoneNumber);
    }
  };

  // Liste des pays et préfixes (à adapter selon besoins)
  const countryOptions = [
    { code: 'BJ', name: 'Bénin', prefix: '229' },
    { code: 'CI', name: "Côte d'Ivoire", prefix: '225' },
    { code: 'TG', name: 'Togo', prefix: '228' },
    { code: 'SN', name: 'Sénégal', prefix: '221' },
    // ... autres pays si besoin
  ];

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    const found = countryOptions.find(c => c.code === value);
    if (found) setSelectedPrefix(found.prefix);
  };

  // Filtrer dynamiquement selon le pays sélectionné
  const filteredPaymentMethods = paymentMethodsList.filter(m => m.country === selectedCountry);

  // Ajouter la fonction de paiement Moneroo
  const handleMonerooPayment = async () => {
    try {
      setLoading(true);
      const fullPhoneNumber = selectedPrefix + phoneNumber;
      const response = await api.post('/payments/moneroo/initiate', {
        amount: rechargeAmount,
        description: `Rechargement de ${rechargeAmount} XOF`,
        paymentMethod: selectedPaymentMethod,
        country: selectedCountry,
        phoneNumber: fullPhoneNumber
      });
      console.log('Réponse Moneroo brute:', response);
      if (response.data.success && response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || error.message || "Une erreur est survenue lors de l'initiation du paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      const fullPhoneNumber = selectedPrefix + withdrawPhone;
      const response = await api.post('/payments/withdraw', {
        amount: withdrawAmount,
        method: withdrawMethod,
        country: selectedCountry,
        msisdn: fullPhoneNumber,
        customer: {
          email: user?.email,
          first_name: user?.profile?.firstName || user?.username,
          last_name: user?.profile?.lastName || user?.username
        }
      });
      if (response.data.success) {
        toast({ title: 'Retrait demandé', description: 'Votre demande de retrait est en cours de traitement.' });
        setIsWithdrawalDialogOpen(false);
        setWithdrawAmount('');
        setWithdrawMethod('');
        setWithdrawPhone('');
        syncUserProfile();
      } else {
        throw new Error(response.data.message || 'Erreur lors du retrait');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || error.message || 'Erreur lors du retrait',
        variant: 'destructive'
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex-grow py-8 px-4">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <WalletIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mon Portefeuille</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Gérez vos FCFA, points de fidélité et tickets de tournoi.
                </p>
              </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList className="inline-flex bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm flex-wrap overflow-x-auto">
                  <TabsTrigger value="overview" className="rounded-md px-3 py-1.5">Aperçu</TabsTrigger>
                  <TabsTrigger value="shop" className="rounded-md px-3 py-1.5">Boutique</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-md px-3 py-1.5">Historique</TabsTrigger>
                </TabsList>
                
                {activeTab === "shop" && cartItems.length > 0 && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCart(!showCart)}>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Panier ({cartItems.reduce((total, item) => total + item.quantity, 0)})</span>
                    <Badge className="bg-purple-500 ml-1">{formatCurrency(convertCurrencySync(cartTotalZgeg, 'XOF', selectedCurrency), selectedCurrency)}</Badge>
                  </Button>
                )}
              </div>
              
              {/* --- ONGLET APERÇU --- */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Solde FCFA */}
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-white/20 p-2">
                              <Coins className="h-5 w-5" />
                            </div>
                      <div>
                              <p className="text-xs opacity-80">Solde</p>
                              {isLoading ? (
                                <div className="flex items-center text-xs">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Chargement...
                                </div>
                              ) : isLoadingRates ? (
                                <div className="flex items-center text-xs">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Conversion...
                                </div>
                              ) : (
                                <motion.p 
                                  key={selectedCurrency}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-2xl font-bold"
                                >
                                  {formatCurrency(convertedAmount, selectedCurrency)}
                                </motion.p>
                              )}
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 border-none text-white"
                              onClick={() => setIsWithdrawalDialogOpen(true)}
                            >
                               Retirer
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 p-1.5 rounded-md">
                          <div className="flex flex-wrap items-center gap-1">
                            {CURRENCIES.slice(0, 6).map((currency) => (
                              <Button
                                key={currency.code}
                                variant="ghost"
                                size="sm"
                                onClick={() => savePreferredCurrency(currency.code)}
                                className={`px-2 py-0.5 h-auto min-w-[50px] ${
                                  selectedCurrency === currency.code 
                                    ? "bg-white/20 text-white font-bold" 
                                    : "bg-white/5 hover:bg-white/15 text-white/80"
                                }`}
                              >
                                <span className="text-xs">{currency.symbol} {currency.code}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                        
                        <Dialog open={isRechargeDialogOpen} onOpenChange={setIsRechargeDialogOpen}>
                          <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 border-none text-white">
                            <Plus className="h-3.5 w-3.5" /> Recharger
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Recharger votre portefeuille</DialogTitle>
                              <DialogDescription>
                                Choisissez le montant, le pays, le numéro et la méthode de paiement
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="amount">Montant (XOF)</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  value={rechargeAmount}
                                  onChange={(e) => setRechargeAmount(e.target.value)}
                                  placeholder="Entrez le montant"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="country">Pays</Label>
                                <Select
                                  value={selectedCountry}
                                  onValueChange={handleCountryChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choisissez un pays" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countryOptions.map((c) => (
                                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Numéro de téléphone</Label>
                                <div className="flex gap-2">
                                  <Select value={selectedPrefix} onValueChange={setSelectedPrefix}>
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {countryOptions.map((c) => (
                                        <SelectItem key={c.prefix} value={c.prefix}>+{c.prefix}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    id="phone"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Numéro sans le préfixe"
                                    maxLength={9}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                                <Select
                                  value={selectedPaymentMethod}
                                  onValueChange={setSelectedPaymentMethod}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choisissez une méthode de paiement" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredPaymentMethods.map((m) => (
                                      <SelectItem key={m.code} value={m.code}>{m.name} ({m.currency})</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleMonerooPayment}
                                disabled={loading || !rechargeAmount || !phoneNumber}
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Traitement en cours...
                                  </>
                                ) : (
                                  <>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Procéder au paiement
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </CardContent>
                  </Card>
                  
                  {/* Points de Fidélité */}
                  <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="rounded-full bg-white/20 p-3 flex-shrink-0">
                          <Star className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm opacity-80">Points de Fidélité</p>
                          {isLoading ? (
                            <div className="flex items-center text-xs mt-1">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Chargement...
                            </div>
                          ) : (
                            <motion.p
                              key={walletData.points}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-3xl font-bold"
                            >
                              {walletData.points}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs opacity-70 mt-auto mb-2">Gagnez {POINTS_PER_TOURNAMENT} points par tournoi.</p>
                      <Button
                        variant="link"
                        className="text-white p-0 h-auto text-sm font-semibold flex items-center gap-1 justify-start"
                        onClick={() => {
                            if (walletData.points >= TICKET_EXCHANGE_COST_POINTS && shopItemsAvailable.find(item => item.id === STANDARD_TICKET_ID && item.pointsForExchange)) {
                          setActiveTab("shop");
                            } else {
                                setActiveTab("shop");
                            }
                        }}
                        disabled={walletData.points < TICKET_EXCHANGE_COST_POINTS}
                      >
                        <Repeat className="h-3 w-3" /> Échanger contre un ticket ({TICKET_EXCHANGE_COST_POINTS} pts)
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Tickets de Tournoi */}
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="rounded-full bg-white/20 p-3 flex-shrink-0">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm opacity-80">Tickets de Tournoi</p>
                          {isLoading ? (
                            <div className="flex items-center text-xs mt-1">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Chargement...
                            </div>
                          ) : (
                            <motion.p
                              key={walletData.tickets}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-3xl font-bold"
                            >
                              {walletData.tickets}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="link"
                        className="text-white p-0 h-auto text-sm font-semibold flex items-center gap-1 justify-start mt-auto"
                        onClick={() => setActiveTab("shop")}
                      >
                        <ShoppingBag className="h-3 w-3" /> Acheter des tickets
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Dernières transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dernières Transactions</CardTitle>
                    <CardDescription>Vos 5 dernières activités de portefeuille.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionsList limit={5} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* --- ONGLET BOUTIQUE --- */}
              <TabsContent value="shop" className="space-y-4">
                {/* Panier (si actif) */}
                {showCart && cartItems.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                    <Card className="border-purple-100 dark:border-purple-800 mb-4">
                      <CardHeader className="pb-2"><CardTitle className="text-lg">Votre Panier</CardTitle></CardHeader>
                      <CardContent>
                          <>
                            <div className="space-y-3">
                              {cartItems.map(cartItem => {
                                const item = shopItemsAvailable.find(i => i.id === cartItem.id);
                                if (!item) return null;
                                const priceInSelected = formatCurrency(convertCurrencySync(item.priceZgeg, 'XOF', selectedCurrency), selectedCurrency);
                                return (
                                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-white dark:bg-gray-700 rounded-md p-2 w-12 h-12 flex items-center justify-center">
                                        <item.imagePlaceholderIcon className="h-6 w-6 text-purple-500" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{priceInSelected} × {cartItem.quantity}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-right">{formatCurrency(convertCurrencySync(item.priceZgeg * cartItem.quantity, 'XOF', selectedCurrency), selectedCurrency)}</p>
                                      <div className="flex flex-col gap-1">
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => addToCart(item.id)}><ChevronUp className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFromCart(item.id)}><ChevronDown className="h-3 w-3" /></Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                              <div><p className="text-sm font-medium">Total</p></div>
                              <div><p className="text-lg font-bold">{formatCurrency(convertCurrencySync(cartTotalZgeg, 'XOF', selectedCurrency), selectedCurrency)}</p></div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button variant="destructive" className="flex-1" onClick={() => setCartItems([])}>Vider le panier</Button>
                              <Button
                                className="flex-1 bg-purple-500 hover:bg-purple-600"
                                onClick={async () => {
                                  setIsCheckoutLoading(true);
                                  try {
                                    // Recharger le profil utilisateur depuis la BD
                                    const profile = await userService.getUserProfile() as AuthUser;
                                    if ((profile.solde || 0) < cartTotalZgeg) {
                                      toast({
                                        title: "Solde insuffisant",
                                        description: "Votre solde est insuffisant pour effectuer cette transaction.",
                                        variant: "destructive"
                                      });
                                      // Enregistrer une transaction échouée
                                      await walletService.createTransaction({
                                        amount: cartTotalZgeg,
                                        type: 'purchase_zgeg',
                                        description: `Achat échoué de ${cartItems.reduce((total, item) => total + item.quantity, 0)} ticket(s)` ,
                                        currency: 'zgeg',
                                        userId: user?._id,
                                        status: 'failed'
                                      } as Partial<ApiTransaction>);
                                      setIsCheckoutLoading(false);
                                      return;
                                    }
                                    setIsConfirmDialogOpen(true);
                                  } catch (error) {
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible de vérifier le solde utilisateur.",
                                      variant: "destructive"
                                    });
                                    setIsCheckoutLoading(false);
                                  }
                                }}
                                disabled={cartTotalZgeg === 0 || isCheckoutLoading}
                              >
                                {isCheckoutLoading ? (
                                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Paiement...</>
                                ) : (
                                  <>Payer {formatCurrency(convertCurrencySync(cartTotalZgeg, 'XOF', selectedCurrency), selectedCurrency)}</>
                                )}
                              </Button>
                            </div>
                          </>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                 {cartItems.length === 0 && showCart && (
                     <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Votre panier pour les achats en FCFA est vide.
                    </p>
                 )}


                {/* Articles de la boutique */}
                <Card>
                    <CardHeader>
                        <CardTitle>Acheter des Tickets</CardTitle>
                        <CardDescription>Achetez des tickets avec vos FCFA ou échangez vos points de fidélité.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shopItemsAvailable.filter(item => item.id === STANDARD_TICKET_ID).map(item => ( // Filtre pour n'afficher que le ticket 1000F pour l'instant
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="bg-gray-100 dark:bg-gray-800 h-32 flex items-center justify-center">
                            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
                            <item.imagePlaceholderIcon className="h-12 w-12 text-purple-500" />
                            </div>
                        </div>
                        <CardContent className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex-grow">{item.description}</p>
                            
                            {/* Option Achat */}
                            <div className="border-t pt-3 mt-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(convertCurrencySync(item.priceZgeg, 'XOF', selectedCurrency), selectedCurrency)}
                                    </span>
                                    <Button
                                        size="sm"
                                        className="bg-purple-500 hover:bg-purple-600 text-white"
                                        onClick={() => addToCart(item.id)}
                                        disabled={walletData.zgeg < convertCurrencySync(item.priceZgeg, 'XOF', selectedCurrency)}
                                    >
                                        <ShoppingBag className="h-4 w-4 mr-1" /> Acheter
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-400 italic">Le montant sera converti en FCFA lors du paiement</p>
                                {walletData.zgeg < convertCurrencySync(item.priceZgeg, 'XOF', selectedCurrency) && <p className="text-xs text-red-500">Solde insuffisant</p>}
                            </div>

                            {/* Option Échange Points */}
                            {item.pointsForExchange && (
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-yellow-500 dark:text-yellow-400">{item.pointsForExchange} Points</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-400 dark:text-yellow-300 dark:hover:bg-yellow-900/30"
                                    onClick={() => {
                                        if (!item.pointsForExchange) return;
                                        if ((user?.pointsDeFidelite || 0) < item.pointsForExchange) {
                                            toast({
                                                title: "Points insuffisants",
                                                description: "Votre solde de points est insuffisant pour cet échange.",
                                                variant: "destructive"
                                            });
                                            return;
                                        }
                                        setIsExchangeConfirmDialogOpen(true);
                                    }}
                                    disabled={walletData.points < item.pointsForExchange}
                                >
                                    <Repeat className="h-4 w-4 mr-1" /> Échanger ({item.pointsForExchange} Points)
                                </Button>
                                </div>
                                {walletData.points < item.pointsForExchange && <p className="text-xs text-red-500">Points insuffisants</p>}
                            </div>
                            )}
                        </CardContent>
                        </Card>
                    ))}
                    {shopItemsAvailable.filter(item => item.id === STANDARD_TICKET_ID).length === 0 && (
                        <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Aucun article disponible pour le moment.</p>
                    )}
                    </CardContent>
                </Card>
              </TabsContent>
              
              {/* --- ONGLET HISTORIQUE --- */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Historique Complet des Transactions</CardTitle>
                    <CardDescription>Toutes vos activités de portefeuille.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionsList />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir payer {formatCurrency(convertCurrencySync(cartTotalZgeg, 'XOF', selectedCurrency), selectedCurrency)} pour {cartItems.reduce((total, item) => total + item.quantity, 0)} ticket(s) ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Annuler</Button>
            <Button onClick={async () => { setIsConfirmDialogOpen(false); await checkoutCart(); }}>Confirmer et payer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isExchangeConfirmDialogOpen} onOpenChange={setIsExchangeConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'échange de points</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir échanger {TICKET_EXCHANGE_COST_POINTS} points de fidélité contre 1 ticket de tournoi ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExchangeConfirmDialogOpen(false)}>Annuler</Button>
            <Button onClick={async () => {
              setIsExchangeConfirmDialogOpen(false);
              // Trouver l'ID du ticket standard pour l'échange
              const standardTicketItem = shopItemsAvailable.find(item => item.id === STANDARD_TICKET_ID);
              if (standardTicketItem) {
                await exchangePointsForTicket(standardTicketItem.id);
              }
            }}>Confirmer l'échange</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Nouveau Dialogue de Retrait */}
      <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer de l'argent</DialogTitle>
            <DialogDescription>Saisissez le montant, le pays, la méthode et le numéro de téléphone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Montant (XOF)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="Entrez le montant à retirer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-country">Pays</Label>
              <Select value={selectedCountry} onValueChange={value => { setSelectedCountry(value); const found = countryOptions.find(c => c.code === value); if (found) setSelectedPrefix(found.prefix); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez un pays" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-method">Méthode de retrait</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez une méthode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodsList.filter(m => m.country === selectedCountry).map((m) => (
                    <SelectItem key={m.code} value={m.code}>{m.name} ({m.currency})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-phone">Numéro de téléphone</Label>
              <div className="flex gap-2">
                <Select value={selectedPrefix} onValueChange={setSelectedPrefix}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((c) => (
                      <SelectItem key={c.prefix} value={c.prefix}>+{c.prefix}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="withdraw-phone"
                  type="tel"
                  value={withdrawPhone}
                  onChange={e => setWithdrawPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Numéro sans le préfixe"
                  maxLength={9}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleWithdraw} disabled={isWithdrawing || !withdrawAmount || !withdrawMethod || !withdrawPhone}>
              {isWithdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDownLeft className="mr-2 h-4 w-4" />}
              {isWithdrawing ? 'Traitement...' : 'Valider le retrait'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;
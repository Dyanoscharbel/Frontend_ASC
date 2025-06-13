/**
 * Configuration des devises pour l'application
 */

// Liste des devises disponibles avec leur symbole et nom complet
export const CURRENCIES = [
  { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA BCEAO' }, // XOF est le code ISO officiel pour le Franc CFA
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar américain' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
  { code: 'NGN', symbol: '₦', name: 'Naira nigérian' },
  { code: 'GHS', symbol: 'GH₵', name: 'Cedi ghanéen' },
  { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain' },
];

// Fonction pour récupérer les taux de change en temps réel
export const fetchExchangeRates = async (baseCurrency: string = 'EUR'): Promise<Record<string, number>> => {
  try {
    // Utiliser l'API gratuite pour obtenir les taux de change actuels
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    const data = await response.json();
    
    if (data.result === 'success') {
      return data.rates;
    } else {
      throw new Error('Impossible de récupérer les taux de change');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des taux de change:', error);
    // Valeurs de secours en cas d'échec
    return {
      'XOF': 655.957, // 1 EUR = 655.957 XOF (taux fixe)
      'EUR': 1,
      'USD': 1.09,
      'MAD': 10.85,
      'NGN': 1655.47,
      'GHS': 15.21,
      'ZAR': 20.35,
    };
  }
};

/**
 * Fonction pour convertir un montant d'une devise à une autre
 * Utilise un taux de change en temps réel via une API
 */
export const convertCurrency = async (
  amount: number, 
  fromCurrency: string = 'XOF', 
  toCurrency: string
): Promise<number> => {
  // Si les devises sont identiques, retourner le montant sans conversion
  if (fromCurrency === toCurrency) return amount;
  
  // Traiter le cas où FCFA est utilisé (le remplacer par XOF qui est le code ISO officiel)
  const from = fromCurrency === 'FCFA' ? 'XOF' : fromCurrency;
  const to = toCurrency === 'FCFA' ? 'XOF' : toCurrency;
  
  try {
    // Utiliser l'EUR comme devise de base pour la conversion
    const rates = await fetchExchangeRates('EUR');
    
    // Si les taux ne contiennent pas l'une des devises, utiliser les valeurs par défaut
    if (!rates[from] || !rates[to]) {
      throw new Error(`Taux non disponible pour ${from} ou ${to}`);
    }
    
    // Convertir en utilisant l'EUR comme intermédiaire
    // 1. Convertir du montant initial en EUR
    const amountInEUR = amount / rates[from];
    // 2. Convertir d'EUR à la devise cible
    return amountInEUR * rates[to];
  } catch (error) {
    console.error('Erreur de conversion:', error);
    // Fallback aux taux fixes en cas d'erreur
    const fallbackRates = {
      'XOF': 655.957, // 1 EUR = 655.957 XOF
      'EUR': 1,
      'USD': 1.09,
      'MAD': 10.85,
      'NGN': 1655.47,
      'GHS': 15.21,
      'ZAR': 20.35,
    };
    
    // Utiliser les taux de secours pour la conversion
    const amountInEUR = amount / fallbackRates[from];
    return amountInEUR * fallbackRates[to];
  }
};

/**
 * Version synchrone pour les cas où l'attente d'une API n'est pas possible
 * Utilise des taux fixes de secours
 */
export const convertCurrencySync = (
  amount: number, 
  fromCurrency: string = 'XOF', 
  toCurrency: string
): number => {
  // Si les devises sont identiques, retourner le montant sans conversion
  if (fromCurrency === toCurrency) return amount;
  
  // Traiter le cas où FCFA est utilisé (le remplacer par XOF)
  const from = fromCurrency === 'FCFA' ? 'XOF' : fromCurrency;
  const to = toCurrency === 'FCFA' ? 'XOF' : toCurrency;
  
  // Taux de change fixes par rapport à l'euro (valeurs approximatives)
  const fixedRates = {
    'XOF': 655.957, // 1 EUR = 655.957 XOF (taux fixe)
    'EUR': 1,
    'USD': 1.09,
    'MAD': 10.85,
    'NGN': 1655.47,
    'GHS': 15.21,
    'ZAR': 20.35,
  };
  
  // Conversion via l'EUR comme devise intermédiaire
  const amountInEUR = amount / fixedRates[from];
  return amountInEUR * fixedRates[to];
};

/**
 * Fonction pour formater un montant selon la devise
 */
export const formatCurrency = (amount: number, currency: string): string => {
  // Gérer le cas FCFA/XOF
  const currencyCode = currency === 'FCFA' ? 'XOF' : currency;
  const currencyInfo = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  
  // Arrondir à 2 décimales pour EUR/USD, entiers pour les autres
  const decimals = ['EUR', 'USD'].includes(currencyCode) ? 2 : 0;
  
  // Formatage du nombre avec séparateurs de milliers et décimales selon la locale
  const formattedAmount = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  // Positionnement du symbole selon la devise
  if (['EUR', 'USD', 'GHS', 'ZAR'].includes(currencyCode)) {
    return `${formattedAmount} ${currencyInfo.symbol}`;
  } else {
    return `${formattedAmount} ${currencyInfo.symbol}`;
  }
}; 
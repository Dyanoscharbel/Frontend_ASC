/**
 * Configuration des pays d'Afrique et de leurs fuseaux horaires
 */

export interface CountryInfo {
  name: string;
  timezone: string;
  code: string;
}

/**
 * Mapping des pays africains avec leurs fuseaux horaires correspondants
 */
export const AFRICAN_COUNTRIES: CountryInfo[] = [
  // Afrique du Nord
  { name: "Algérie", timezone: "GMT+1", code: "DZ" },
  { name: "Égypte", timezone: "GMT+2", code: "EG" },
  { name: "Libye", timezone: "GMT+2", code: "LY" },
  { name: "Maroc", timezone: "GMT+1", code: "MA" },
  { name: "Soudan", timezone: "GMT+2", code: "SD" },
  { name: "Tunisie", timezone: "GMT+1", code: "TN" },
  
  // Afrique de l'Ouest
  { name: "Bénin", timezone: "GMT+1", code: "BJ" },
  { name: "Burkina Faso", timezone: "GMT+0", code: "BF" },
  { name: "Cabo Verde", timezone: "GMT-1", code: "CV" },
  { name: "Côte d'Ivoire", timezone: "GMT+0", code: "CI" },
  { name: "Gambie", timezone: "GMT+0", code: "GM" },
  { name: "Ghana", timezone: "GMT+0", code: "GH" },
  { name: "Guinée", timezone: "GMT+0", code: "GN" },
  { name: "Guinée-Bissau", timezone: "GMT+0", code: "GW" },
  { name: "Liberia", timezone: "GMT+0", code: "LR" },
  { name: "Mali", timezone: "GMT+0", code: "ML" },
  { name: "Mauritanie", timezone: "GMT+0", code: "MR" },
  { name: "Niger", timezone: "GMT+1", code: "NE" },
  { name: "Nigeria", timezone: "GMT+1", code: "NG" },
  { name: "Sénégal", timezone: "GMT+0", code: "SN" },
  { name: "Sierra Leone", timezone: "GMT+0", code: "SL" },
  { name: "Togo", timezone: "GMT+0", code: "TG" },
  
  // Afrique Centrale
  { name: "Cameroun", timezone: "GMT+1", code: "CM" },
  { name: "République centrafricaine", timezone: "GMT+1", code: "CF" },
  { name: "Tchad", timezone: "GMT+1", code: "TD" },
  { name: "République du Congo", timezone: "GMT+1", code: "CG" },
  { name: "République démocratique du Congo", timezone: "GMT+1", code: "CD" },
  { name: "Guinée équatoriale", timezone: "GMT+1", code: "GQ" },
  { name: "Gabon", timezone: "GMT+1", code: "GA" },
  { name: "São Tomé et Príncipe", timezone: "GMT+0", code: "ST" },
  
  // Afrique de l'Est
  { name: "Burundi", timezone: "GMT+2", code: "BI" },
  { name: "Comores", timezone: "GMT+3", code: "KM" },
  { name: "Djibouti", timezone: "GMT+3", code: "DJ" },
  { name: "Érythrée", timezone: "GMT+3", code: "ER" },
  { name: "Éthiopie", timezone: "GMT+3", code: "ET" },
  { name: "Kenya", timezone: "GMT+3", code: "KE" },
  { name: "Madagascar", timezone: "GMT+3", code: "MG" },
  { name: "Malawi", timezone: "GMT+2", code: "MW" },
  { name: "Maurice", timezone: "GMT+4", code: "MU" },
  { name: "Mozambique", timezone: "GMT+2", code: "MZ" },
  { name: "Rwanda", timezone: "GMT+2", code: "RW" },
  { name: "Seychelles", timezone: "GMT+4", code: "SC" },
  { name: "Somalie", timezone: "GMT+3", code: "SO" },
  { name: "Soudan du Sud", timezone: "GMT+2", code: "SS" },
  { name: "Tanzanie", timezone: "GMT+3", code: "TZ" },
  { name: "Ouganda", timezone: "GMT+3", code: "UG" },
  { name: "Zambie", timezone: "GMT+2", code: "ZM" },
  { name: "Zimbabwe", timezone: "GMT+2", code: "ZW" },
  
  // Afrique Australe
  { name: "Angola", timezone: "GMT+1", code: "AO" },
  { name: "Botswana", timezone: "GMT+2", code: "BW" },
  { name: "Eswatini", timezone: "GMT+2", code: "SZ" },
  { name: "Lesotho", timezone: "GMT+2", code: "LS" },
  { name: "Namibie", timezone: "GMT+2", code: "NA" },
  { name: "Afrique du Sud", timezone: "GMT+2", code: "ZA" }
];

/**
 * Obtient le fuseau horaire par défaut pour un pays donné
 * @param countryName Nom du pays
 * @returns Le fuseau horaire correspondant ou "GMT+0" par défaut
 */
export const getTimezoneForCountry = (countryName: string): string => {
  const country = AFRICAN_COUNTRIES.find(
    c => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return country?.timezone || "GMT+0";
};

/**
 * Liste des pays (utilisée pour les sélecteurs)
 */
export const COUNTRIES = AFRICAN_COUNTRIES.map(country => country.name).sort();

/**
 * Liste des fuseaux horaires (utilisée pour les sélecteurs)
 */
export const TIMEZONES = ["GMT-1", "GMT+0", "GMT+1", "GMT+2", "GMT+3", "GMT+4"]; 
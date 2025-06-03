interface EnvConfig {
  apiUrl: string;
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const envConfig: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Validation de la configuration
if (!envConfig.apiUrl) {
  console.warn('VITE_API_URL is not set, using default: http://localhost:5000/api');
}

export default envConfig; 
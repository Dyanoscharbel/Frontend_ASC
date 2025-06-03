import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SponsorshipStats {
  activeReferrals: number;
  totalReferrals: number;
  currentLevel: number;
  requiredReferrals: number;
}

export const useSponsorshipProgress = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SponsorshipStats>({
    activeReferrals: 0,
    totalReferrals: 0,
    currentLevel: 0,
    requiredReferrals: 10
  });

  useEffect(() => {
    const fetchSponsorshipStats = async () => {
      try {
        // Ici, vous devrez implémenter l'appel API réel pour obtenir les statistiques
        // Pour l'instant, nous utilisons des données statiques
        const response = await fetch(`/api/sponsorship/stats/${user?.id}`);
        const data = await response.json();
        
        setStats({
          activeReferrals: data.activeReferrals,
          totalReferrals: data.totalReferrals,
          currentLevel: data.currentLevel,
          requiredReferrals: data.requiredReferrals
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de parrainage:', error);
      }
    };

    if (user?.id) {
      fetchSponsorshipStats();
    }
  }, [user?.id]);

  const updateProgress = (activeReferrals: number) => {
    setStats(prev => ({
      ...prev,
      activeReferrals
    }));
  };

  return {
    stats,
    updateProgress
  };
};

export default useSponsorshipProgress; 
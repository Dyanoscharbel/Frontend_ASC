import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Users, Crown, ArrowRight, Award, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sponsorshipService } from "@/services/sponsorship";

const SponsorshipInfo = () => {
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setIsLoading(true);
        const sponsorshipLevels = await sponsorshipService.getSponsorshipLevels();
        const formattedLevels = sponsorshipLevels.map(level => ({
          title: level.name,
          icon: getIconForLevel(level.name),
          requirements: `${level.minReferrals} filleuls actifs`,
          benefits: [
            `${level.earningsPercentage}% commission sur gains`,
            `${level.rechargePercentage}% sur recharges`,
            `${level.rewardTickets} tickets de récompense`,
            level.order >= 5 ? "Accès aux tournois VIP" : null
          ].filter(Boolean)
        }));
        setLevels(formattedLevels);
      } catch (error) {
        console.error('Erreur lors du chargement des niveaux:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const getIconForLevel = (levelName: string) => {
    switch (levelName) {
      case 'Esclave ASC':
        return <Users className="h-8 w-8 text-gray-600" />;
      case 'Paysan ASC':
        return <User className="h-8 w-8 text-blue-600" />;
      case 'Roturier ASC':
        return <Trophy className="h-8 w-8 text-purple-600" />;
      case 'Noble ASC':
        return <Star className="h-8 w-8 text-yellow-600" />;
      case 'Chef de caste':
        return <Crown className="h-8 w-8 text-orange-600" />;
      case 'Gouverneur ASC':
        return <Award className="h-8 w-8 text-red-600" />;
      case 'Roi ASC':
        return <Crown className="h-8 w-8 text-pink-600" />;
      case 'Empereur ASC':
        return <Crown className="h-8 w-8 text-indigo-600" />;
      default:
        return <Trophy className="h-8 w-8 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Programme de <span className="gradient-text">Parrainage ASC</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Rejoignez notre programme de parrainage exclusif et bénéficiez de récompenses exceptionnelles en développant votre réseau de joueurs.
          </p>
        </motion.div>

        {/* Comment ça marche */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="h-12 w-12 bg-asc-purple/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-asc-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Invitez des joueurs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Partagez votre lien unique de parrainage avec de nouveaux joueurs
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="h-12 w-12 bg-asc-blue/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-asc-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Filleuls actifs</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vos filleuls participent à des tournois et restent actifs
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <div className="h-12 w-12 bg-asc-green/10 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-asc-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Gagnez des récompenses</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Débloquez des avantages exclusifs et des commissions permanentes
              </p>
            </motion.div>
          </div>
        </section>

        {/* Niveaux de Parrainage */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Niveaux de Parrainage</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-asc-purple" />
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level, index) => (
              <motion.div
                key={level.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  {level.icon}
                  <span className="text-sm font-medium text-gray-500">Niveau {index + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{level.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{level.requirements}</p>
                <ul className="space-y-2">
                  {level.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-asc-purple" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          )}
        </section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Link to="/register">
            <Button size="lg" className="bg-asc-purple hover:bg-asc-dark-purple">
              Commencer à Parrainer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorshipInfo;

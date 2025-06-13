import { Crown, User, Users, Award, Trophy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SponsorLevel {
  name: string;
  status: string;
  requiredReferrals: number;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

const sponsorLevels: SponsorLevel[] = [
  {
    name: "Esclave ASC",
    status: "Niveau 1",
    requiredReferrals: 1,
    benefits: [
      "1% des gains des filleuls actifs",
      "1% des recharges des filleuls actifs",
      "Badge Esclave exclusif"
    ],
    icon: <Users />,
    color: "bg-gray-100 text-gray-800 border-gray-200"
  },
  {
    name: "Paysan ASC",
    status: "Niveau 2",
    requiredReferrals: 3,
    benefits: [
      "2% des gains des filleuls actifs",
      "2% des recharges des filleuls actifs",
      "Badge Paysan exclusif"
    ],
    icon: <User />,
    color: "bg-blue-50 text-blue-800 border-blue-200"
  },
  {
    name: "Roturier ASC",
    status: "Niveau 3",
    requiredReferrals: 10,
    benefits: [
      "5% des gains des filleuls actifs",
      "5% des recharges des filleuls actifs",
      "Badge Roturier exclusif"
    ],
    icon: <Trophy />,
    color: "bg-purple-50 text-purple-800 border-purple-200"
  },
  {
    name: "Noble ASC",
    status: "Niveau 4",
    requiredReferrals: 50,
    benefits: [
      "10% des gains des filleuls actifs",
      "10% des recharges des filleuls actifs",
      "Badge Noble exclusif"
    ],
    icon: <Star />,
    color: "bg-yellow-50 text-yellow-800 border-yellow-200"
  },
  {
    name: "Chef de caste",
    status: "Niveau 5",
    requiredReferrals: 100,
    benefits: [
      "15% des gains des filleuls actifs",
      "15% des recharges des filleuls actifs",
      "Badge Chef de caste exclusif",
      "Accès aux tournois VIP"
    ],
    icon: <Crown />,
    color: "bg-orange-50 text-orange-800 border-orange-200"
  },
  {
    name: "Gouverneur ASC",
    status: "Niveau 6",
    requiredReferrals: 200,
    benefits: [
      "20% des gains des filleuls actifs",
      "20% des recharges des filleuls actifs",
      "Badge Gouverneur exclusif",
      "Accès aux tournois VIP"
    ],
    icon: <Award />,
    color: "bg-red-50 text-red-800 border-red-200"
  },
  {
    name: "Roi ASC",
    status: "Niveau 7",
    requiredReferrals: 500,
    benefits: [
      "25% des gains des filleuls actifs",
      "25% des recharges des filleuls actifs",
      "Badge Roi exclusif",
      "Accès aux tournois VIP"
    ],
    icon: <Crown />,
    color: "bg-pink-50 text-pink-800 border-pink-200"
  },
  {
    name: "Empereur ASC",
    status: "Niveau 8",
    requiredReferrals: 1000,
    benefits: [
      "30% des gains des filleuls actifs",
      "30% des recharges des filleuls actifs",
      "Badge Empereur exclusif",
      "Accès aux tournois VIP"
    ],
    icon: <Crown />,
    color: "bg-indigo-50 text-indigo-800 border-indigo-200"
  }
];

const SponsorshipLevels = () => {
  return (
    <div className="py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Système de <span className="gradient-text">Parrainage</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Parrainez des joueurs et gagnez un pourcentage de leurs gains et recharges. Plus vous avez de filleuls actifs, plus votre niveau augmente !
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsorLevels.map((level) => (
            <Card key={level.name} className={`sponsor-card ${level.color}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="px-2 py-1">
                    {level.status}
                  </Badge>
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-asc-purple">
                    {level.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold mb-1">{level.name}</h3>
                <p className="text-sm mb-4">{level.requiredReferrals} filleuls actifs requis</p>

                <div className="space-y-2">
                  {level.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-asc-purple"></div>
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorshipLevels;

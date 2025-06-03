
import { Trophy, Users, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export type TournamentStatus = "open" | "in-progress" | "complete" | "upcoming";

export interface TournamentCardProps {
  id: string;
  title: string;
  description: string;
  prize: string;
  players: number;
  maxPlayers: number;
  date: string;
  status: TournamentStatus;
  image?: string;
  isRegistered?: boolean;
  showDetails?: boolean;
  nextMatch?: {
    date: string;
    opponent: string;
    code: string;
  };
}

const statusLabels: Record<TournamentStatus, string> = {
  "open": "Ouvert",
  "in-progress": "En cours",
  "complete": "Complet",
  "upcoming": "À venir"
};

const statusClasses: Record<TournamentStatus, string> = {
  "open": "badge-open",
  "in-progress": "badge-in-progress",
  "complete": "badge-complete",
  "upcoming": "badge-upcoming"
};

const TournamentCard = ({
  id,
  title,
  description,
  prize,
  players,
  maxPlayers,
  date,
  status,
  image,
  isRegistered,
  showDetails,
  nextMatch
}: TournamentCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-asc-purple/70 to-asc-blue/70 flex items-center justify-center">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <Trophy className="h-16 w-16 text-white/90" />
          )}
        </div>
        <span className={`absolute top-4 right-4 ${statusClasses[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-asc-orange" />
            <span className="text-sm">{prize}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-asc-blue" />
            <span className="text-sm">{players}/{maxPlayers}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-asc-purple" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-asc-green" />
            <span className="text-sm">Validé</span>
          </div>
        </div>

        <div className="mt-auto">
          {showDetails && isRegistered && nextMatch ? (
            <div className="space-y-4 mt-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Prochain match</h4>
                <span className="text-sm">{nextMatch.date}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>vs {nextMatch.opponent}</span>
                  <span className="text-sm font-mono">Code: {nextMatch.code}</span>
                </div>
              </div>
            </div>
          ) : (
            <Link to={`/tournament/details/${id}`}>
              <Button className="w-full bg-asc-purple hover:bg-asc-dark-purple">
                {status === "open" ? "S'inscrire" : 
                 status === "in-progress" ? "Voir le match" :
                 status === "upcoming" ? "Rappel" : "Détails"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;

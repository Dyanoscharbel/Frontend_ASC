import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, User, AlertCircle, Pencil, CalendarDays, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/services/api";
import { Button } from "@/components/ui/button";

export interface Player {
  _id: string;
  username: string;
  avatar?: string;
  email?: string;
  joinedAt?: string;
}

export interface Match {
  _id: string;
  round: number;
  matchNumber: number;
  players: Player[];
  winner?: Player;
  status: 'pending' | 'in_progress' | 'completed' | 'dispute' | 'bye';
  nextMatchId?: string;
  bracketPosition: {
    x: number;
    y: number;
  };
  date?: string;
  time?: string;
  player1Score?: number;
  player2Score?: number;
  matchCode?: string;
}

interface TournamentBracketProps {
  tournamentId: string;
  onBracketExistsChange?: (exists: boolean) => void;
  onEditMatch?: (match: Match) => void;
}

export default function TournamentBracket({ tournamentId, onBracketExistsChange, onEditMatch }: TournamentBracketProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (tournamentId) {
      fetchBracket();
    }
  }, [tournamentId]);

  const fetchBracket = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // D'abord, vérifier si le tournoi a un arbre généré
      const tournamentResponse = await api.get(`/tournaments/${tournamentId}`);
      const tournament = tournamentResponse.data;
      
      if (!tournament.hasGeneratedBracket) {
        onBracketExistsChange?.(false);
        setMatches([]);
        return;
      }

      // Si l'arbre existe, récupérer les matchs
      const response = await api.get(`/tournaments/${tournamentId}/bracket`);
      
      if (response.data && Array.isArray(response.data)) {
        setMatches(response.data);
        onBracketExistsChange?.(true);
      } else {
        throw new Error("Format de données invalide");
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération de l'arbre:", err);
      if (err?.response?.status === 404) {
        onBracketExistsChange?.(false);
        setMatches([]);
      } else {
        setError(err?.response?.data?.message || "Impossible de charger l'arbre du tournoi");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Aucun match n'a encore été généré pour ce tournoi</p>
      </div>
    );
  }

  // Organiser les matchs par tour
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const maxRound = Math.max(...Object.keys(matchesByRound).map(Number));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 p-4 min-w-[800px]">
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex-1">
            <h3 className="text-sm font-medium mb-4 text-center">
              {round === maxRound ? "Finale" : round === maxRound - 1 ? "Demi-finales" : `Tour ${round}`}
            </h3>
            <div className="space-y-4">
              {matchesByRound[round]?.map((match) => (
                <Card key={match._id} className="p-4 text-sm">
                  <div className="mb-2">
                    {match.matchCode && (
                      <div className="text-xs text-gray-400 mb-1">
                        <span className="font-semibold">Code:</span> {match.matchCode}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        {round === maxRound
                          ? match.matchNumber === 1
                            ? "Finale"
                            : match.matchNumber === 2
                              ? "Finale 2"
                              : `Match ${round}-${match.matchNumber}`
                          : `Match ${round}-${match.matchNumber}`}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {match.date && (
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                        )}
                        {match.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {match.time} UTC
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                  {match.players.map((player, index) => (
                    <div
                      key={player?._id || index}
                          className={`flex items-center justify-between gap-2 ${
                            index === 0 ? "mb-1" : ""
                      } ${
                        match.winner?._id === player?._id
                              ? "text-green-600 font-semibold"
                          : ""
                      }`}
                    >
                          <div className="flex items-center gap-2">
                      {player ? (
                        <>
                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                            {player.avatar ? (
                              <img
                                src={player.avatar}
                                alt={player.username}
                                      className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                                    <User className="h-3.5 w-3.5 text-gray-500" />
                            )}
                          </div>
                          <span>{player.username}</span>
                        </>
                      ) : (
                              <span className="text-gray-400 italic">À déterminer</span>
                      )}
                          </div>
                          <span className="font-medium">
                            {index === 0 && match.player1Score !== undefined ? match.player1Score : ""}
                            {index === 1 && match.player2Score !== undefined ? match.player2Score : ""}
                            {(index === 0 && match.player1Score === undefined && player) ? "-" : ""}
                            {(index === 1 && match.player2Score === undefined && player) ? "-" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                    {match.status === 'pending' && onEditMatch && (
                      <Button 
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEditMatch(match)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Modifier le match</span>
                      </Button>
                    )}
                  </div>
                  {match.status === 'bye' && (
                    <div className="text-center text-xs text-gray-500 mt-1 italic">
                       (BYE)
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
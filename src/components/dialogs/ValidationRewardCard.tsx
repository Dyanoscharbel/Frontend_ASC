import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Clock } from "lucide-react";
import { formatCurrency, convertCurrencySync } from "@/config/currency";
import { useAuth } from "@/contexts/AuthContext";

interface ValidationRewardCardProps {
  id: string;
  amount: number;
  date: string;
  disputeId: string;
  status: 'collected' | 'not_collected';
  onCollect: (rewardId: string) => void;
}

export function ValidationRewardCard({ id, amount, date, disputeId, status, onCollect }: ValidationRewardCardProps) {
  const { user } = useAuth();
  
  const formatAmount = (amount: number) => {
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

  return (
    <Card className="relative overflow-hidden">
      {status === 'not_collected' && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        >
          À réclamer
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-lg">
          Récompense pour la validation du litige #{disputeId.slice(-6)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Date : {new Date(date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-lg text-green-600">
                {formatAmount(amount)}
              </span>
            </div>
          </div>

          {status === 'not_collected' && (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onCollect(id)}
            >
              Réclamer la récompense
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const CinetPayCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'unknown'>('loading');
  const [message, setMessage] = useState<string>('Traitement de votre paiement...');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('status');
    const txId = params.get('transaction_id');

    setTransactionId(txId);

    if (paymentStatus === 'ACCEPTED') {
      setStatus('success');
      setMessage('Votre paiement a été approuvé ! Votre solde sera mis à jour sous peu.');
    } else if (paymentStatus === 'REFUSED') {
      setStatus('failed');
      setMessage('Votre paiement a été refusé. Veuillez réessayer ou contacter le support.');
    } else if (txId) {
      setStatus('unknown');
      setMessage('Le statut de votre paiement est en cours de vérification. Veuillez patienter ou vérifier votre solde plus tard.');
    } else {
      setStatus('unknown');
      setMessage('Impossible de déterminer le statut du paiement. Veuillez vérifier votre historique de transactions.');
    }
  }, [location.search]);

  const handleReturnToWallet = () => {
    navigate('/wallet');
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">
            {status === 'loading' && 'Traitement en cours'}
            {status === 'success' && 'Paiement Réussi'}
            {status === 'failed' && 'Paiement Échoué'}
            {status === 'unknown' && 'Statut Indéterminé'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 mx-auto text-green-500" />}
            {status === 'failed' && <XCircle className="h-12 w-12 mx-auto text-red-500" />}
            {status === 'unknown' && <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-500" />}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-700">{message}</p>
          {transactionId && (
            <p className="text-sm text-gray-500 mb-6">
              ID de Transaction: {transactionId}
            </p>
          )}
          <Button onClick={handleReturnToWallet} className="w-full">
            Retourner au Portefeuille
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CinetPayCallbackPage; 
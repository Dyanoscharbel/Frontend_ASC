import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const MonerooCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    if (status === 'success') {
      toast.success('Paiement effectué avec succès !', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error('Le paiement a échoué. Veuillez réessayer.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // Rediriger vers la page du portefeuille après 2 secondes
    setTimeout(() => {
      navigate('/wallet');
    }, 2000);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Traitement du paiement</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous traitons votre paiement...</p>
      </div>
    </div>
  );
};

export default MonerooCallbackPage; 
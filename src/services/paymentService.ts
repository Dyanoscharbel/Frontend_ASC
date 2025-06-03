import api from './api';

interface CinetPayInitiateResponse {
  transaction_id: string;
  payment_token: string;
  payment_url: string;
}

interface CinetPayPaymentRequest {
  amount: number;
  description: string;
  customer_email: string;
  customer_name: string;
  customer_surname: string;
  customer_phone_number: string;
  operator: string;
}

const initiateCinetPayPayment = async (paymentData: CinetPayPaymentRequest): Promise<CinetPayInitiateResponse> => {
  const response = await api.post<CinetPayInitiateResponse>('/payments/cinetpay/initiate', paymentData);
  
  // Si nous avons une URL de paiement, rediriger directement
  if (response.data.payment_url) {
    window.location.href = response.data.payment_url;
  }
  
  return response.data;
};

export const paymentService = {
  initiateCinetPayPayment,
}; 
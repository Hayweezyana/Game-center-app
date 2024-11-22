// src/hooks/usePayment.js
import { useState } from 'react';
import axios from 'axios';

const usePayment = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  const processPayment = async (amount, email, game) => {
    try {
      const { data: { clientSecret } } = await axios.post('/api/payment', { amount, email });
      
      if (clientSecret) {
        setIsPaymentSuccessful(true);
        setPaymentStatus('Payment Successful!');
        
        await axios.post('/assign-game', { game_id: game.id, customer_id: 1 });
      } else {
        throw new Error('Payment failed.');
      }
    } catch (error) {
      setPaymentStatus(error.message);
      setIsPaymentSuccessful(false);
    }
  };

  return { paymentStatus, isPaymentSuccessful, processPayment };
};

export default usePayment;

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './checkout.css';

// Load your Stripe public key
const stripePromise = loadStripe('pk_test_51QABgb2MJKCBkMkWdAzFUkRxIUpSzmxgNHoELA6aoTzN2FrZvnoPoJSUIsSMwy0olsoeb9erTLHHdKzfKqVMDEUt0035KJ0TuG');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3002', // Adjust as needed
      },
    });

    if (error) {
      setPaymentMessage(error.message);
    } else {
      setPaymentMessage("Payment successful!");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div id="payment-element">
        <PaymentElement />
      </div>
      <button id="submit" disabled={isLoading || !stripe || !elements}>
        <div className={`spinner ${isLoading ? '' : 'hidden'}`} id="spinner"></div>
        <span id="button-text">{isLoading ? 'Processing...' : 'Pay now'}</span>
      </button>
      {paymentMessage && <div id="payment-message">{paymentMessage}</div>}
    </form>
  );
};

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Fetch clientSecret from your backend
    fetch('http://localhost:3002/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 }) // Replace with actual amount
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const options = { clientSecret };

  return (
    clientSecret && (
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
        <div id="dpm-annotation">
          <p>
            Payment methods are dynamically displayed based on customer location, order amount, and currency.&nbsp;
            <a href="#" target="_blank" rel="noopener noreferrer" id="dpm-integration-checker">
              Preview payment methods by transaction
            </a>
          </p>
        </div>
      </Elements>
    )
  );
};

export default PaymentPage;

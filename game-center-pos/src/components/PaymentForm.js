import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameSelection.css';

const PaymentForm = ({ cartTotal }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'cash', amount: cartTotal }]);
  const [remainingAmount, setRemainingAmount] = useState(cartTotal);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const totalPaid = paymentMethods.reduce((sum, method) => sum + parseFloat(method.amount || 0), 0);
    setRemainingAmount(cartTotal - totalPaid);
  }, [paymentMethods, cartTotal]);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{10,15}$/.test(phone);

  const handleAddPaymentMethod = () => {
    if (remainingAmount > 0) {
      setPaymentMethods([...paymentMethods, { method: 'cash', amount: 0 }]);
    }
  };

  const handlePaymentChange = (index, field, value) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index][field] = field === 'amount' ? parseFloat(value) : value;
    setPaymentMethods(updatedMethods);
  };

  const handleCustomerSetup = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(email && { email }), ...(phone && { phone }) }),
      });

      if (!response.ok) throw new Error('Failed to create or fetch customer');

      const data = await response.json();
      setCustomerId(data.customer_id);
    } catch (error) {
      console.error('Error fetching or creating customer:', error);
      setError('Failed to fetch customer details. Please try again.');
    }
  }, [email, phone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email || phone) handleCustomerSetup();
    }, 500);

    return () => clearTimeout(timer);
  }, [email, phone, handleCustomerSetup]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    const totalPaid = paymentMethods.reduce((sum, method) => sum + parseFloat(method.amount || 0), 0);
    if (totalPaid !== cartTotal) {
      alert('Total payment must equal the cart total.');
      return;
    }

    try {
      const responses = await Promise.all(
        paymentMethods.map(async ({ method, amount }) => {
          if (method === 'cash') {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cash-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, customerId: parseInt(customerId, 10) }),
            });

            if (!response.ok) throw new Error('Failed cash payment');
            return { success: true };
          } else if (method === 'stripe') {
            navigate('/PaymentPage', { state: { amount, email, phone, customerId } });
            return { success: true };
          }
          return { success: false };
        })
      );

      if (responses.every((response) => response.success)) {
        alert('Payment successful!');
        navigate('/QueueStatus', { state: { paymentStatus: 'success', email, phone, totalPaid, customerId } });
      } else {
        alert('Some payments failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      alert('There was an error processing your payment.');
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit}>
      <label htmlFor="email">Email:</label>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email (optional)"
      />
      {!validateEmail(email) && email && <p className="error">Invalid email format</p>}

      <label htmlFor="phone">Phone Number:</label>
      <input
        type="tel"
        id="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter phone number"
        required
      />
      {!validatePhone(phone) && phone && <p className="error">Invalid phone number</p>}

      <label htmlFor="cartTotal">Cart Total:</label>
      <input type="number" id="cartTotal" value={cartTotal} disabled />

      <label htmlFor="remainingAmount">Remaining Amount:</label>
      <input type="number" id="remainingAmount" value={remainingAmount} disabled />

      {paymentMethods.map((method, index) => (
        <div key={index}>
          <label htmlFor={`paymentMethod${index}`}>Method {index + 1}:</label>
          <select
            id={`paymentMethod${index}`}
            value={method.method}
            onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="stripe">Card</option>
          </select>

          <label htmlFor={`amount${index}`}>Amount:</label>
          <input
            type="number"
            id={`amount${index}`}
            value={method.amount}
            onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
            min="0"
            max={remainingAmount + method.amount}
            required
          />
        </div>
      ))}

      <button type="button" onClick={handleAddPaymentMethod} disabled={remainingAmount === 0}>
        Add Payment Method
      </button>

      <button type="submit" disabled={remainingAmount > 0}>
        Pay Now
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default PaymentForm;

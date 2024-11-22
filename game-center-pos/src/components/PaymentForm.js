import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './checkout.css';

const PaymentForm = ({ cartTotal }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'cash', amount: cartTotal }]);
  const [remainingAmount, setRemainingAmount] = useState(cartTotal);
  const navigate = useNavigate();

  useEffect(() => {
    const totalPaid = paymentMethods.reduce((sum, method) => sum + parseFloat(method.amount || 0), 0);
    setRemainingAmount(cartTotal - totalPaid);
  }, [paymentMethods, cartTotal]);

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

  const handleCustomerSetup = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(email && { email }), ...(phone && { phone }) }),
      });
      const data = await response.json();
      setCustomerId(data.customer_id);
    } catch (error) {
      console.error('Error fetching or creating customer:', error);
    }
  };

  useEffect(() => {
    if (email || phone) {
      handleCustomerSetup();
    }
  }, [email, phone]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    const totalPaid = paymentMethods.reduce((sum, method) => sum + parseFloat(method.amount || 0), 0);
    if (totalPaid !== cartTotal) {
      alert("Total payment must equal the cart total.");
      return;
    }

    try {
      const responses = await Promise.all(
        paymentMethods.map(async ({ method, amount }) => {
          if (method === 'cash') {
            const response = await fetch('http://localhost:3002/api/cash-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, customerId }),
            });
            const data = await response.json();
            return data.success ? { success: true } : { success: false };
          } else if (method === 'stripe') {
            navigate('/PaymentPage', { state: { amount, email, phone, customerId } });
            return { success: true };
          }
          return { success: false };
        })
      );

      if (responses.every(response => response.success)) {
        alert("Payment successful!");
        navigate('/QueueStatus', { state: { paymentStatus: 'success', email, phone, totalPaid, customerId } });
      } else {
        alert("Some payments failed. Please try again.");
      }
    } catch (error) {
      console.error('Error during payment:', error);
      alert("There was an error processing your payment.");
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
      />

      <label htmlFor="phone">Phone Number:</label>
      <input
        type="tel"
        id="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

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
    </form>
  );
};

export default PaymentForm;

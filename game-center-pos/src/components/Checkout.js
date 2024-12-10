import React from 'react';
import { useLocation } from 'react-router-dom';
import PaymentForm from './PaymentForm';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const { checkoutCart, cartTotal } = location.state || { checkoutCart: [], cartTotal: 0 };
  const navigate = useNavigate();
  return (
    <div>
      <h1>Checkout</h1>
      {/* Display the cartTotal without dividing by 100 */}
      <h2>Total: ₦{cartTotal}</h2>
      {/* Pass the cartTotal to the PaymentForm as-is */}
      <PaymentForm cartTotal={cartTotal} />
      <div>
        <h3>Items in your cart:</h3>
        <ul>
          {checkoutCart.map((item, index) => (
            <li key={index}>
              {item.title} - ₦{item.price} x {item.quantity} = ₦{item.price * item.quantity}
            </li>
          ))}
        </ul>
      </div>
      <button
  onClick={() => navigate('/Queue', { state: { checkoutCart } })}
>
  Proceed to Queue
</button>

    </div>
  );
};

export default Checkout;

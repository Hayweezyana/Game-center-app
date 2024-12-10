import React, { useState} from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import GameSelection from './components/GameSelection';
import AdminLogin from './components/admin/AdminLogin.js';
import EditGameDuration from './components/admin/EditGameDuration';
import Reports from './components/admin/Reports';
import PaymentForm from './components/PaymentForm';
import QueueStatus from './components/QueueStatus';
import Queue from './components/Queue';
import Checkout from './components/Checkout';
import ClientPC from './components/ClientPC';
import ServerPC from './components/ServerPC';
import useFetchGameData from './hooks/useFetchGameData';
import usePayment from './hooks/usePayment';
import useQueue from './hooks/useQueue';
import useNavigateOnCondition from './hooks/useNavigateOnCondition';

import './App.css';

const stripePromise = loadStripe('pk_live_51QABgb2MJKCBkMkWZHHhCFoCzGolWponmHdJmkO7bimN95NVRs7vxp2BZk153BBYpaYzt7e7fcrEBAwX8qsLMToL00ui4ajBc0');

function App() {
  const [cart, setCart] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  
  const { data, loading, error } = useFetchGameData();
  const { paymentStatus, isPaymentSuccessful, setIsPaymentSuccessful, processPayment } = usePayment();
  const { queue, queueStatus, addToQueue, updateQueueStatus } = useQueue();

  useNavigateOnCondition(isPaymentSuccessful, '/QueueStatus');
  const navigate = useNavigate();

  axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

  const handleGameSelection = async (game) => {
    setSelectedGame(game);

    // Get the clientSecret for payment
    const { clientSecret } = await processPayment(5000, 'customer@example.com', game);
    setClientSecret(clientSecret);

    addToQueue(1, game.id);
    updateQueueStatus('Game assignment successful!');
  };

  const handleCheckout = (selectedGames) => {
    setCart(selectedGames);
    navigate('/checkout');
  };

  return (
    <div className="App">
      <h1>Game Center POS:Immersia</h1>

      {loading && <p>Loading games...</p>}
      {error && <p>Error loading games: {error.message}</p>}
      {selectedGame && <h2>Selected Game: {selectedGame.name}</h2>}


      <Routes>
        
        <Route path="/admin/AdminLogin" element={<AdminLogin />} />
        <Route path="/admin/EditGameDuration" element={<EditGameDuration />} />
        <Route path="/reports" element={<Reports />} />
        
        <Route path="/" element={<GameSelection onGameSelect={handleGameSelection} onCheckout={handleCheckout} />} />
        
        <Route path="/Checkout" element={<Checkout cart={cart} onCheckout={handleCheckout} />} />
        
        
        {/* Conditionally render PaymentForm based on clientSecret availability */}
        <Route
          path="/PaymentForm"
          element={
            clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm cart={cart} onPaymentSuccess={() => setIsPaymentSuccessful(true)} />
              </Elements>
            ) : (
              <p>Loading payment information...</p>
            )
          }
        />
        
        <Route path="/QueueStatus" element={<QueueStatus status={queueStatus} onProceedToQueue={() => navigate('/queue')} />} />
        <Route path="/Queue" element={<Queue queue={queue} />} />
        <Route path="/ClientPC" element={<ClientPC />} />
        <Route path="/ServerPC" element={<ServerPC />} />
        
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

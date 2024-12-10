import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameSelection.css'; // Import the CSS file
import io from 'socket.io-client';

let socket; // Declare socket outside the component to avoid reinitialization

const GameSelection = () => {
    const [Game, setGames] = useState([]);
    const [quantities, setQuantities] = useState([]);
    const navigate = useNavigate();

    const goToAdminLogin = () => {
        navigate('/admin/AdminLogin');
      };

    useEffect(() => {
        // Initialize the socket connection
        if (!socket) {
            socket = io(process.env.REACT_APP_BACKEND_URL);

            socket.on('connect', () => {
                console.log('Connected to the backend');
            });

            socket.on('someGameEvent', (data) => {
                console.log('Received game event:', data);
            });
        }

        // Fetch games data from the backend
        axios
            .get(`${process.env.REACT_APP_BACKEND_URL}/api/games`)
            .then((response) => {
                setGames(response.data);
                setQuantities(Array(response.data.length).fill(0));
            })
            .catch((error) => console.error('Error loading games:', error));

        return () => {
            // Cleanup socket listeners to avoid memory leaks
            if (socket) {
                socket.off('connect');
                socket.off('someGameEvent');
            }
        };
    }, []);

    const handleQuantityChange = (index, quantity) => {
        setQuantities((prevQuantities) => {
            const newQuantities = [...prevQuantities];
            newQuantities[index] = Number(quantity);
            return newQuantities;
        });
    };

    const handleCheckout = () => {
        const checkoutCart = Game.map((game, index) => ({
            title: game.title,
            price: game.price,
            quantity: quantities[index],
        })).filter((item) => item.quantity > 0);

        if (checkoutCart.length > 0) {
            const cartTotal = checkoutCart.reduce((total, item) => total + item.price * item.quantity, 0);
            navigate('/checkout', { state: { checkoutCart, cartTotal } });
        } else {
            alert('Your cart is empty.');
        }
    };

    return (
        <div className="game-selection-container">
            <h1 className="title">Game Center POS</h1>
            <button className="admin-login-button" onClick={goToAdminLogin}>
        Admin Login
      </button>
            <div className="games-grid">
                {Game.map((game, index) => (
                    <div key={game.id} className="game-item">
                        <YouTube videoId={game.url} className="youtube-video" />
                        <h2 className="game-title">{game.title}</h2>
                        <p className="game-price">Price: ₦{game.price}</p>
                        <p className="game-time_slot">Duration: {game.time_slot}</p>
                        <input
                            type="number"
                            min="0"
                            className="quantity-input"
                            value={quantities[index] || 0}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <button className="checkout-button" onClick={handleCheckout}>
                Checkout
            </button>
        </div>
    );
};

export default GameSelection;

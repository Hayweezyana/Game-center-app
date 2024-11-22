import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameSelection.css'; // Import the CSS file
// Ensure the port matches
import io from 'socket.io-client';

// Connect to the default namespace
const socket = io('http://localhost:3002');

// Games namespace
const gamesSocket = io('http://localhost:3002/api/games');

gamesSocket.on('connect', () => {
    console.log('Connected to /games namespace');
});

gamesSocket.on('someGameEvent', (data) => {
    console.log('Received game event:', data);
});


const GameSelection = () => {
    const [Game, setGames] = useState([]);
    const [quantities, setQuantities] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3002/api/games')
            .then((response) => {
                setGames(response.data);
                setQuantities(Array(response.data.length).fill(0));
            })
            .catch((error) => console.error('Error loading games:', error));
    }, []);

    const handleQuantityChange = (index, quantity) => {
        setQuantities((prevQuantities) => {
            const newQuantities = [...prevQuantities];
            newQuantities[index] = Number(quantity);
            return newQuantities;
        });
    };

    const handleCheckout = () => {
        const checkoutCart = Game
            .map((game, index) => ({
                title: game.title,
                price: game.price,
                quantity: quantities[index],
            }))
            .filter((item) => item.quantity > 0);

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
            <div className="games-grid">
                {Game.map((game, index) => (
                    <div key={game.id} className="game-item">
                        <YouTube videoId={game.url} className="youtube-video" />
                        <h2 className="game-title">{game.title}</h2>
                        <p className="game-price">Price: ₦{game.price}</p>
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
            <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
        </div>
    );
};

export default GameSelection;

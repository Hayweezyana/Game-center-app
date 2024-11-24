import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './GameSelection.css';

const socket = io('http://localhost:3002');

const QueueStatus = () => {
  const [queue, setQueue] = useState([]);
  const [availablePCs, setAvailablePCs] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState({});
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  // Fetch queue data
  const fetchQueue = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/queue');
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  // Fetch available PCs
  const fetchAvailablePCs = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/pcs/available');
      setAvailablePCs(response.data);
    } catch (error) {
      console.error('Error fetching available PCs:', error);
    }
  };

  // Fetch membership types
  const fetchMembershipTypes = async (customerIds) => {
    if (!customerIds.length) return;

    try {
      const response = await axios.post('http://localhost:3002/api/customers/membership_level', {
        customer_ids: customerIds,
      });
      setMembershipTypes(response.data);
    } catch (error) {
      console.error('Error fetching membership types:', error);
    }
  };

  // Fetch games
  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchAvailablePCs();
    fetchGames();

    socket.on('queueUpdate', (updatedQueue) => {
      if (Array.isArray(updatedQueue)) {
        console.log('Updating queue state:', updatedQueue);
      setQueue(updatedQueue);
      fetchMembershipTypes(updatedQueue.map((item) => item.customer_id));
    } else {
      console.warn('Received invalid queue data:', updatedQueue);
    }
    });

    return () => {
      socket.off('queueUpdate');
    };
  }, []);

  return (
    <div>
      <h2>Queue Status</h2>
      <div>
        <h3>Current Queue</h3>
        {queue.length > 0 ? (
          <ul>
            {queue.map((item) => (
              <li key={item.id}>
                Customer {item.customer_id} is waiting for Game {item.game_id}
                {membershipTypes[item.customer_id] && ` (${membershipTypes[item.customer_id]} Membership)`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No customers in the queue.</p>
        )}
      </div>

      <div>
        <h3>Available PCs</h3>
        {availablePCs.length > 0 ? (
          <ul>{availablePCs.map((pc) => <li key={pc.id}>PC {pc.id}</li>)}</ul>
        ) : (
          <p>No PCs are currently available.</p>
        )}
      </div>

      <div>
        <h3>Games</h3>
        {games.length > 0 ? (
          <ul>{games.map((game) => <li key={game.id}>{game.title}</li>)}</ul>
        ) : (
          <p>No games available.</p>
        )}
      </div>

      <button onClick={() => navigate('/queue')}>Proceed to Queue</button>
    </div>
  );
};

export default QueueStatus;

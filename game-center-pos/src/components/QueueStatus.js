import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:3002'); // Ensure backend server is running here

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

  // Fetch membership types based on customer IDs
  const fetchMembershipTypes = async (customerIds) => {
    if (customerIds.length === 0) return; // Skip if no customer IDs
    try {
      const response = await axios.post('http://localhost:3002/api/customers/membership_level', {
        customer_ids: customerIds,
      });
      setMembershipTypes(response.data); // Assumes response is a mapping of customer_id to membership level
    } catch (error) {
      console.error('Error fetching membership types:', error);
    }
  };

  // Fetch available games
  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Initial data fetch and setup Socket.IO
  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        await Promise.all([fetchQueue(), fetchAvailablePCs(), fetchGames()]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();

    // Setup Socket.IO listeners
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('queueUpdate', (updatedQueue) => {
      console.log('Received queue update:', updatedQueue);
      setQueue(updatedQueue);

      // Fetch updated membership types
      const customerIds = updatedQueue.map((item) => item.customer_id);
      fetchMembershipTypes(customerIds);
    });

    // Cleanup Socket.IO on component unmount
    return () => {
      socket.off('queueUpdate');
    };
  }, []);

  return (
    <div>
      <h2>Queue Status</h2>

      {/* Display queue */}
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

      {/* Display available PCs */}
      <div>
        <h3>Available PCs</h3>
        {availablePCs.length > 0 ? (
          <ul>
            {availablePCs.map((pc) => (
              <li key={pc.id}>PC {pc.id} is available</li>
            ))}
          </ul>
        ) : (
          <p>No PCs are currently available.</p>
        )}
      </div>

      {/* Display games */}
      <div>
        <h3>Games</h3>
        {games.length > 0 ? (
          <ul>
            {games.map((game) => (
              <li key={game.id}>{game.title}</li>
            ))}
          </ul>
        ) : (
          <p>No games available.</p>
        )}
      </div>

      {/* Button to navigate to Queue page */}
      <button onClick={() => navigate('/queue')}>Proceed to Queue</button>
    </div>
  );
};

export default QueueStatus;

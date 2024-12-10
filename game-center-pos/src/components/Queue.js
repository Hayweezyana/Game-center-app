import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL, { transports: ['websocket', 'polling'] });

const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [timers, setTimers] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch queue from the backend
  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/queue`);
      const queueData = Array.isArray(response.data) ? response.data : [];

      setQueue(queueData);

      // Initialize timers for "playing" status
      const initialTimers = {};
      queueData.forEach((entry) => {
        if (entry.status === 'playing' && entry.remaining_time) {
          initialTimers[entry.id] = entry.remaining_time;
        }
      });
      setTimers(initialTimers);
    } catch (error) {
      console.error('Error fetching queue data:', error);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Set up Socket.IO listener for live updates
    socket.on('queueUpdate', (updatedQueue) => {
      setQueue(updatedQueue);

      // Update timers for "playing" customers
      const updatedTimers = {};
      updatedQueue.forEach((entry) => {
        if (entry.status === 'playing' && entry.remaining_time) {
          updatedTimers[entry.id] = entry.remaining_time;
        }
      });
      setTimers(updatedTimers);
    });

    return () => {
      socket.off('queueUpdate');
    };
  }, []);

  // Countdown for remaining time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };
        Object.keys(updatedTimers).forEach((key) => {
          if (updatedTimers[key] > 0) {
            updatedTimers[key] -= 1;
          }
        });
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Game Center Queue
      </Typography>
      {loading ? (
        <Typography variant="h6" align="center">
          Loading...
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Queue ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Game</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>PC</TableCell>
              <TableCell>Remaining Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.id}</TableCell>
                <TableCell>{entry.customer?.id || 'N/A'}</TableCell>
                <TableCell>{entry.game?.title || 'N/A'}</TableCell>
                <TableCell>{entry.status || 'Waiting'}</TableCell>
                <TableCell>{entry.pc?.id ? `PC-${entry.pc.id}` : 'Unassigned'}</TableCell>
                <TableCell>
                  {timers[entry.id] > 0
                    ? `${Math.floor(timers[entry.id] / 60)}m ${timers[entry.id] % 60}s`
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
};

export default Queue;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';

const socket = io(process.env.REACT_APP_BACKEND_URL, { transports: ['websocket', 'polling'] });

const CountdownTimer = ({ duration }) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span>
      {Math.floor(remainingTime / 60)}m {remainingTime % 60}s
    </span>
  );
};

const QueueStatus = () => {
  const [queue, setQueue] = useState([]);
  const [games, setGames] = useState([]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/queue`);
      setQueue(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/games`);
      setGames(response.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleAssignPCs = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/queue/assign-pcs`);
      fetchQueue();
    } catch (error) {
      console.error('Error assigning PCs:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchGames();
    socket.on('queueUpdate', (updatedQueue) => setQueue(updatedQueue));
    return () => socket.off('queueUpdate');
  }, []);

  const getGameTitle = (gameId) => {
    const game = games.find((g) => g.id === gameId);
    return game ? game.title : 'Unknown Game';
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Queue Status
      </Typography>
      <Button variant="contained" color="primary" onClick={handleAssignPCs}>
        Assign PCs
      </Button>
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
              <TableCell>{getGameTitle(entry.game_id)}</TableCell>
              <TableCell>
                {entry.status === 'Playing' ? <CountdownTimer duration={entry.playDuration} /> : entry.status}
              </TableCell>
              <TableCell>{entry.pc?.id ? `PC-${entry.pc.id}` : 'Waiting for PC'}</TableCell>
              <TableCell>
                {entry.remaining_time > 0
                  ? `${Math.floor(entry.remaining_time / 60)}m ${entry.remaining_time % 60}s`
                  : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default QueueStatus;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';
import { io } from 'socket.io-client';
import './GameSelection.css';

const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial queue data
  const fetchQueue = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/queue');
      const data = await response.json();
      setQueue(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle requeue action
  const handleRequeue = async (id) => {
    try {
      const response = await fetch('http://localhost:3002/api/queue/requeue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      alert(result.success ? `Customer ${id} successfully requeued!` : `Failed to requeue customer ${id}.`);
    } catch (error) {
      console.error('Error requeuing customer:', error);
    }
  };

  useEffect(() => {
    console.log('Connecting to Socket.IO...');

    // Correct namespace connection
    const socket = io('http://localhost:3002/queue'); // Connect to the "/queue" namespace

    fetchQueue();

    // Set up Socket.IO listeners
    socket.on('queueUpdate', (updatedQueue) => setQueue(updatedQueue));

    // Clean up socket connection
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Game Center Queue
      </Typography>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </div>
      ) : queue.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Game</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queue.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{customer.customer_name}</TableCell>
                <TableCell>{customer.game}</TableCell>
                <TableCell>{customer.status}</TableCell>
                <TableCell>
                  {customer.status === 'Waiting' ? (
                    <Button variant="contained" color="primary" onClick={() => handleRequeue(customer.id)}>
                      Requeue
                    </Button>
                  ) : (
                    <Button variant="outlined" color="secondary" disabled>
                      Playing
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="h6" align="center">
          No customers in the queue.
        </Typography>
      )}
    </Container>
  );
};

export default Queue;

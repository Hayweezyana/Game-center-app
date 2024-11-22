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

// Connect to Queue namespace
const queueSocket = io('http://localhost:3002/api/queue'); // Updated namespace

const Queue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial queue data
  const fetchQueue = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/queue');
      const data = await response.json();
      if (Array.isArray(data)) {
        setQueue(data);
      } else {
        console.error('Queue data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Requeue customer action
  const handleRequeue = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/api/queue/requeue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`Customer ${id} successfully requeued!`);
      } else {
        alert(`Failed to requeue customer ${id}.`);
      }
    } catch (error) {
      console.error('Error requeuing customer:', error);
    }
  };

  useEffect(() => {
    // Fetch initial queue data
    fetchQueue();

    // Set up Socket.IO listeners
    queueSocket.on('connect', () => {
      console.log('Connected to /queue namespace');
    });

    queueSocket.on('queueUpdate', (updatedQueue) => {
      console.log('Received queue update:', updatedQueue);
      setQueue(updatedQueue);
    });

    // Cleanup socket listeners on component unmount
    return () => {
      queueSocket.off('queueUpdate');
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
                <TableCell>{index + 1}</TableCell> {/* Display position in the queue */}
                <TableCell>{customer.customer_name}</TableCell>
                <TableCell>{customer.game}</TableCell>
                <TableCell>{customer.status}</TableCell>
                <TableCell>
                  {customer.status === 'Waiting' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRequeue(customer.id)}>
                      Requeue
                    </Button>
                  )}
                  {customer.status === 'Playing' && (
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

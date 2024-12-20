// src/components/PCStatus.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the default namespace
const socket = io('http://localhost:3002');

// PC namespace
const pcsSocket = io('http://localhost:3002/api/pcs/available');

pcsSocket.on('connect', () => {
    console.log('Connected to /pcs namespace');
});

pcsSocket.on('somePCEvent', (data) => {
    console.log('Received pcs event:', data);
});

const PCStatus = () => {
  const [pcStatus, setPCStatus] = useState({});

  useEffect(() => {
    // Listen for PC status updates
    socket.on('pcStatusUpdate', (data) => {
      setPCStatus(prevState => ({
        ...prevState,
        [data.pc_id]: data.status
      }));
    });

    return () => {
      socket.off('pcStatusUpdate');
    };
  }, []);

  return (
    <div>
      <h2>PC Status</h2>
      <ul>
        {Object.keys(pcStatus).map((pc_id) => (
          <li key={pc_id}>
            PC {pc_id} is {pcStatus[pc_id]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PCStatus;

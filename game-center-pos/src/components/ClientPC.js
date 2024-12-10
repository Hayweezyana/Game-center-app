import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL);

function ClientPC() {
  const [assignedCustomer, setAssignedCustomer] = useState(null);

  useEffect(() => {
    // Listen for customer assignment events
    socket.on('customerAssigned', (data) => {
      if (data.pc.name === "PC1") { // Check if this PC is the assigned one
        setAssignedCustomer(data.customer_id);
      }
    });

    return () => {
      socket.off('customerAssigned');
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {assignedCustomer ? (
        <h1>Next Customer: {assignedCustomer}</h1>
      ) : (
        <h1>No customer assigned yet.</h1>
      )}
    </div>
  );
}

export default ClientPC;

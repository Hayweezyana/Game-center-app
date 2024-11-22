import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3002');

function ServerPC() {
  const [gameSelection, setGameSelection] = useState(null);

  useEffect(() => {
    // Listen for game selection updates from the server
    socket.on('serverGameSelectionUpdate', (data) => {
      setGameSelection(data.selectedGame);
    });

    return () => {
      socket.off('serverGameSelectionUpdate');
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Game Selection</h2>
      {gameSelection ? (
        <p>Selected Game ID: {gameSelection}</p>
      ) : (
        <p>No game selected yet.</p>
      )}
    </div>
  );
}

export default ServerPC;

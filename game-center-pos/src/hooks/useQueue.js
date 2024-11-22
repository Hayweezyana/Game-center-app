// src/hooks/useQueue.js
import { useState } from 'react';

const useQueue = () => {
  const [queue, setQueue] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);

  const addToQueue = (customer_id, game_id) => {
    setQueue((prevQueue) => [...prevQueue, { customer_id, game_id }]);
  };

  const updateQueueStatus = (status) => setQueueStatus(status);

  return { queue, queueStatus, addToQueue, updateQueueStatus };
};

export default useQueue;

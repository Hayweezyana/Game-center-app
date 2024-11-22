// src/hooks/useFetchGameData.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchGameData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/games');
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};

export default useFetchGameData;

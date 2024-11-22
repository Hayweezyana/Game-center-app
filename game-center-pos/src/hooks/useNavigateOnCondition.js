// src/hooks/useNavigateOnCondition.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useNavigateOnCondition = (condition, path) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (condition) navigate(path);
  }, [condition, path, navigate]);
};

export default useNavigateOnCondition;

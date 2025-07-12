import { useCallback, useEffect } from 'react';
import { useTestfeature3Context } from '../store';
import { Testfeature3Api } from '../api';
import { CreateTestfeature3Dto, UpdateTestfeature3Dto } from '../types';

export function useTestfeature3() {
  const { state, dispatch } = useTestfeature3Context();

  const fetchTestfeature3 = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await Testfeature3Api.getById(id);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  const createTestfeature3 = useCallback(async (data: CreateTestfeature3Dto) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await Testfeature3Api.create(data);
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const updateTestfeature3 = useCallback(async (id: string, data: UpdateTestfeature3Dto) => {
    try {
      const result = await Testfeature3Api.update(id, data);
      dispatch({ type: 'UPDATE', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const deleteTestfeature3 = useCallback(async (id: string) => {
    try {
      await Testfeature3Api.delete(id);
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchTestfeature3,
    createTestfeature3,
    updateTestfeature3,
    deleteTestfeature3,
  };
}

export function useTestfeature3List() {
  const { state, dispatch } = useTestfeature3Context();

  const fetchAll = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await Testfeature3Api.getAll();
      // For list view, we might want different state management
      // This is a simplified example
      dispatch({ type: 'FETCH_SUCCESS', payload: data[0] || null });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    ...state,
    refetch: fetchAll,
  };
}
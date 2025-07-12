import { useCallback, useEffect } from 'react';
import { usePilotreadyContext } from '../store';
import { PilotreadyApi } from '../api';
import { CreatePilotreadyDto, UpdatePilotreadyDto } from '../types';

export function usePilotready() {
  const { state, dispatch } = usePilotreadyContext();

  const fetchPilotready = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await PilotreadyApi.getById(id);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  const createPilotready = useCallback(async (data: CreatePilotreadyDto) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await PilotreadyApi.create(data);
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const updatePilotready = useCallback(async (id: string, data: UpdatePilotreadyDto) => {
    try {
      const result = await PilotreadyApi.update(id, data);
      dispatch({ type: 'UPDATE', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const deletePilotready = useCallback(async (id: string) => {
    try {
      await PilotreadyApi.delete(id);
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchPilotready,
    createPilotready,
    updatePilotready,
    deletePilotready,
  };
}

export function usePilotreadyList() {
  const { state, dispatch } = usePilotreadyContext();

  const fetchAll = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await PilotreadyApi.getAll();
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
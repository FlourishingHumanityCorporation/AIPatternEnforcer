import { useCallback, useEffect } from 'react';
import { useSamplefeatureContext } from '../store';
import { SamplefeatureApi } from '../api';
import { CreateSamplefeatureDto, UpdateSamplefeatureDto } from '../types';

export function useSamplefeature() {
  const { state, dispatch } = useSamplefeatureContext();

  const fetchSamplefeature = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await SamplefeatureApi.getById(id);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  const createSamplefeature = useCallback(async (data: CreateSamplefeatureDto) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await SamplefeatureApi.create(data);
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const updateSamplefeature = useCallback(async (id: string, data: UpdateSamplefeatureDto) => {
    try {
      const result = await SamplefeatureApi.update(id, data);
      dispatch({ type: 'UPDATE', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const deleteSamplefeature = useCallback(async (id: string) => {
    try {
      await SamplefeatureApi.delete(id);
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchSamplefeature,
    createSamplefeature,
    updateSamplefeature,
    deleteSamplefeature,
  };
}

export function useSamplefeatureList() {
  const { state, dispatch } = useSamplefeatureContext();

  const fetchAll = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await SamplefeatureApi.getAll();
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
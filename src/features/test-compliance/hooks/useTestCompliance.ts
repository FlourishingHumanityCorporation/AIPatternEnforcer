import { useCallback, useEffect } from 'react';
import { useTestcomplianceContext } from '../store';
import { TestcomplianceApi } from '../api';
import { CreateTestcomplianceDto, UpdateTestcomplianceDto } from '../types';

export function useTestcompliance() {
  const { state, dispatch } = useTestcomplianceContext();

  const fetchTestcompliance = useCallback(async (id: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await TestcomplianceApi.getById(id);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [dispatch]);

  const createTestcompliance = useCallback(async (data: CreateTestcomplianceDto) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await TestcomplianceApi.create(data);
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const updateTestcompliance = useCallback(async (id: string, data: UpdateTestcomplianceDto) => {
    try {
      const result = await TestcomplianceApi.update(id, data);
      dispatch({ type: 'UPDATE', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  const deleteTestcompliance = useCallback(async (id: string) => {
    try {
      await TestcomplianceApi.delete(id);
      dispatch({ type: 'RESET' });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchTestcompliance,
    createTestcompliance,
    updateTestcompliance,
    deleteTestcompliance,
  };
}

export function useTestcomplianceList() {
  const { state, dispatch } = useTestcomplianceContext();

  const fetchAll = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await TestcomplianceApi.getAll();
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
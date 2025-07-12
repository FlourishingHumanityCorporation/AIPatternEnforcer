import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SamplefeatureState, SamplefeatureAction } from '../types';

const initialState: SamplefeatureState = {
  loading: false,
  error: null,
  data: null,
};

function sampleFeatureReducer(
  state: SamplefeatureState,
  action: SamplefeatureAction
): SamplefeatureState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE':
      return {
        ...state,
        data: state.data ? { ...state.data, ...action.payload } : null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface SamplefeatureContextValue {
  state: SamplefeatureState;
  dispatch: React.Dispatch<SamplefeatureAction>;
}

const SamplefeatureContext = createContext<SamplefeatureContextValue | undefined>(undefined);

export function SamplefeatureProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sampleFeatureReducer, initialState);

  return (
    <SamplefeatureContext.Provider value={{ state, dispatch }}>
      {children}
    </SamplefeatureContext.Provider>
  );
}

export function useSamplefeatureContext() {
  const context = useContext(SamplefeatureContext);
  if (!context) {
    throw new Error('useSamplefeatureContext must be used within SamplefeatureProvider');
  }
  return context;
}
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PilotreadyState, PilotreadyAction } from '../types';

const initialState: PilotreadyState = {
  loading: false,
  error: null,
  data: null,
};

function pilotReadyReducer(
  state: PilotreadyState,
  action: PilotreadyAction
): PilotreadyState {
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

interface PilotreadyContextValue {
  state: PilotreadyState;
  dispatch: React.Dispatch<PilotreadyAction>;
}

const PilotreadyContext = createContext<PilotreadyContextValue | undefined>(undefined);

export function PilotreadyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pilotReadyReducer, initialState);

  return (
    <PilotreadyContext.Provider value= state, dispatch }}>
      {children}
    </PilotreadyContext.Provider>
  );
}

export function usePilotreadyContext() {
  const context = useContext(PilotreadyContext);
  if (!context) {
    throw new Error('usePilotreadyContext must be used within PilotreadyProvider');
  }
  return context;
}
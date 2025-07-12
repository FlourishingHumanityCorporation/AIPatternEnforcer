import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Testfeature3State, Testfeature3Action } from '../types';

const initialState: Testfeature3State = {
  loading: false,
  error: null,
  data: null,
};

function testFeature3Reducer(
  state: Testfeature3State,
  action: Testfeature3Action
): Testfeature3State {
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

interface Testfeature3ContextValue {
  state: Testfeature3State;
  dispatch: React.Dispatch<Testfeature3Action>;
}

const Testfeature3Context = createContext<Testfeature3ContextValue | undefined>(undefined);

export function Testfeature3Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testFeature3Reducer, initialState);

  return (
    <Testfeature3Context.Provider value={{ state, dispatch }}>
      {children}
    </Testfeature3Context.Provider>
  );
}

export function useTestfeature3Context() {
  const context = useContext(Testfeature3Context);
  if (!context) {
    throw new Error('useTestfeature3Context must be used within Testfeature3Provider');
  }
  return context;
}
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TestcomplianceState, TestcomplianceAction } from '../types';

const initialState: TestcomplianceState = {
  loading: false,
  error: null,
  data: null,
};

function testComplianceReducer(
  state: TestcomplianceState,
  action: TestcomplianceAction
): TestcomplianceState {
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

interface TestcomplianceContextValue {
  state: TestcomplianceState;
  dispatch: React.Dispatch<TestcomplianceAction>;
}

const TestcomplianceContext = createContext<TestcomplianceContextValue | undefined>(undefined);

export function TestcomplianceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testComplianceReducer, initialState);

  return (
    <TestcomplianceContext.Provider value= state, dispatch }}>
      {children}
    </TestcomplianceContext.Provider>
  );
}

export function useTestcomplianceContext() {
  const context = useContext(TestcomplianceContext);
  if (!context) {
    throw new Error('useTestcomplianceContext must be used within TestcomplianceProvider');
  }
  return context;
}
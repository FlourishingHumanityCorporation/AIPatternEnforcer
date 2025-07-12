// TestFeature2 feature types

export interface Testfeature2State {
  loading: boolean;
  error: Error | null;
  data: Testfeature2Data | null;
}

export interface Testfeature2Data {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestfeature2Dto {
  // Add creation fields here
}

export interface UpdateTestfeature2Dto {
  // Add update fields here
}

export type Testfeature2Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Testfeature2Data }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<Testfeature2Data> }
  | { type: 'RESET' };
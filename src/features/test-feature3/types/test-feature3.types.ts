// TestFeature3 feature types

export interface Testfeature3State {
  loading: boolean;
  error: Error | null;
  data: Testfeature3Data | null;
}

export interface Testfeature3Data {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestfeature3Dto {
  // Add creation fields here
}

export interface UpdateTestfeature3Dto {
  // Add update fields here
}

export type Testfeature3Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Testfeature3Data }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<Testfeature3Data> }
  | { type: 'RESET' };
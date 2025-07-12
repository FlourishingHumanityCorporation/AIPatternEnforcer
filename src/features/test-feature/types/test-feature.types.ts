// TestFeature feature types

export interface TestfeatureState {
  loading: boolean;
  error: Error | null;
  data: TestfeatureData | null;
}

export interface TestfeatureData {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestfeatureDto {
  // Add creation fields here
}

export interface UpdateTestfeatureDto {
  // Add update fields here
}

export type TestfeatureAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: TestfeatureData }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<TestfeatureData> }
  | { type: 'RESET' };
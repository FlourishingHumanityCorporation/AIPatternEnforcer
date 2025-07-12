// TestCompliance feature types

export interface TestcomplianceState {
  loading: boolean;
  error: Error | null;
  data: TestcomplianceData | null;
}

export interface TestcomplianceData {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestcomplianceDto {
  // Add creation fields here
}

export interface UpdateTestcomplianceDto {
  // Add update fields here
}

export type TestcomplianceAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: TestcomplianceData }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<TestcomplianceData> }
  | { type: 'RESET' };
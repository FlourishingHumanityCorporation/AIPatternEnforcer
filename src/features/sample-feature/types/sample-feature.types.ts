// SampleFeature feature types

export interface SamplefeatureState {
  loading: boolean;
  error: Error | null;
  data: SamplefeatureData | null;
}

export interface SamplefeatureData {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSamplefeatureDto {
  // Add creation fields here
}

export interface UpdateSamplefeatureDto {
  // Add update fields here
}

export type SamplefeatureAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: SamplefeatureData }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<SamplefeatureData> }
  | { type: 'RESET' };
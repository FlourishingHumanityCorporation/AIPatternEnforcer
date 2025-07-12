// PilotReady feature types

export interface PilotreadyState {
  loading: boolean;
  error: Error | null;
  data: PilotreadyData | null;
}

export interface PilotreadyData {
  id: string;
  // Add your data properties here
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePilotreadyDto {
  // Add creation fields here
}

export interface UpdatePilotreadyDto {
  // Add update fields here
}

export type PilotreadyAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: PilotreadyData }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'UPDATE'; payload: Partial<PilotreadyData> }
  | { type: 'RESET' };
import { 
  PilotreadyData, 
  CreatePilotreadyDto, 
  UpdatePilotreadyDto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class PilotreadyApi {
  private static endpoint = `${API_BASE}/pilot-ready`;

  static async getAll(): Promise<PilotreadyData[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch PilotReady: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<PilotreadyData> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch PilotReady: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(data: CreatePilotreadyDto): Promise<PilotreadyData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create PilotReady: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: string, data: UpdatePilotreadyDto): Promise<PilotreadyData> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update PilotReady: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete PilotReady: ${response.statusText}`);
    }
  }
}
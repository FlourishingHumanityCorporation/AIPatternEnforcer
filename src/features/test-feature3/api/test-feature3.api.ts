import { 
  Testfeature3Data, 
  CreateTestfeature3Dto, 
  UpdateTestfeature3Dto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class Testfeature3Api {
  private static endpoint = `${API_BASE}/test-feature3`;

  static async getAll(): Promise<Testfeature3Data[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestFeature3: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<Testfeature3Data> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestFeature3: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(data: CreateTestfeature3Dto): Promise<Testfeature3Data> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create TestFeature3: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: string, data: UpdateTestfeature3Dto): Promise<Testfeature3Data> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update TestFeature3: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete TestFeature3: ${response.statusText}`);
    }
  }
}
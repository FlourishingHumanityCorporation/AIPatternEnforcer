import { 
  Testfeature2Data, 
  CreateTestfeature2Dto, 
  UpdateTestfeature2Dto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class Testfeature2Api {
  private static endpoint = `${API_BASE}/test-feature2`;

  static async getAll(): Promise<Testfeature2Data[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestFeature2: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<Testfeature2Data> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestFeature2: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(data: CreateTestfeature2Dto): Promise<Testfeature2Data> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create TestFeature2: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: string, data: UpdateTestfeature2Dto): Promise<Testfeature2Data> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update TestFeature2: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete TestFeature2: ${response.statusText}`);
    }
  }
}
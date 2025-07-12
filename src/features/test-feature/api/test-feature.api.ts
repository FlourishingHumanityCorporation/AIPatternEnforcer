import { 
  TestfeatureData, 
  CreateTestfeatureDto, 
  UpdateTestfeatureDto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class TestfeatureApi {
  private static endpoint = `${API_BASE}/test-feature`;

  static async getAll(): Promise<TestfeatureData[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<TestfeatureData> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(data: CreateTestfeatureDto): Promise<TestfeatureData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create TestFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: string, data: UpdateTestfeatureDto): Promise<TestfeatureData> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update TestFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete TestFeature: ${response.statusText}`);
    }
  }
}
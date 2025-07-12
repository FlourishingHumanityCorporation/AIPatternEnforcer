import { 
  TestcomplianceData, 
  CreateTestcomplianceDto, 
  UpdateTestcomplianceDto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class TestcomplianceApi {
  private static endpoint = `${API_BASE}/test-compliance`;

  static async getAll(): Promise<TestcomplianceData[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestCompliance: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<TestcomplianceData> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch TestCompliance: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(data: CreateTestcomplianceDto): Promise<TestcomplianceData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create TestCompliance: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: string, data: UpdateTestcomplianceDto): Promise<TestcomplianceData> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update TestCompliance: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete TestCompliance: ${response.statusText}`);
    }
  }
}
import { 
  SamplefeatureData, 
  CreateSamplefeatureDto, 
  UpdateSamplefeatureDto 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export class SamplefeatureApi {
  private static endpoint = `${API_BASE}/sample-feature`;

  static async getAll(): Promise<SamplefeatureData[]> {
    const response = await fetch(this.endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch SampleFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async getById(id: string): Promise<SamplefeatureData> {
    const response = await fetch(`${this.endpoint}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch SampleFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async create(data: CreateSamplefeatureDto): Promise<SamplefeatureData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create SampleFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async update(id: string, data: UpdateSamplefeatureDto): Promise<SamplefeatureData> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update SampleFeature: ${response.statusText}`);
    }
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete SampleFeature: ${response.statusText}`);
    }
  }
}
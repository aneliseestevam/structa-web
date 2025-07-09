import { apiService } from './api';
import { Obra, ApiResponse, PaginatedResponse } from '@/types';

export class ObrasService {
  private readonly baseUrl = '/obras';

  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Obra>> {
    return apiService.get(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  async getById(id: string): Promise<ApiResponse<Obra>> {
    return apiService.get(`${this.baseUrl}/${id}`);
  }

  async create(obra: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Obra>> {
    return apiService.post(this.baseUrl, obra);
  }

  async update(id: string, obra: Partial<Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Obra>> {
    return apiService.put(`${this.baseUrl}/${id}`, obra);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async getByStatus(status: Obra['status']): Promise<ApiResponse<Obra[]>> {
    return apiService.get(`${this.baseUrl}/status/${status}`);
  }

  async updateStatus(id: string, status: Obra['status']): Promise<ApiResponse<Obra>> {
    return apiService.patch(`${this.baseUrl}/${id}/status`, { status });
  }

  async getKPIs(): Promise<ApiResponse<{
    total: number;
    emAndamento: number;
    finalizadas: number;
    planejadas: number;
  }>> {
    return apiService.get(`${this.baseUrl}/kpis`);
  }
}

export const obrasService = new ObrasService(); 
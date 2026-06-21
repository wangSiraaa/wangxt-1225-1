import { get, post, put, del } from './request';

export interface Pond {
  id: string;
  pondCode: string;
  pondName: string;
  area: number;
  species: string;
  stockQuantity: number;
  averageWeight: number;
  status: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterQualityRecord {
  id: string;
  pondId: string;
  dissolvedOxygen: number;
  ph: number;
  temperature: number;
  ammoniaNitrogen?: number;
  nitrite?: number;
  turbidity?: number;
  recorder: string;
  remark?: string;
  recordedAt: string;
}

export interface MortalityRecord {
  id: string;
  pondId: string;
  mortalityCount: number;
  mortalityRate: number;
  cause?: string;
  recorder: string;
  remark?: string;
  recordedAt: string;
}

export interface PondStatus {
  pond: Pond;
  sensorData: any;
  latestAeratorOrder: any | null;
}

export const pondApi = {
  list: () => get<Pond[]>('/pond'),
  detail: (id: string) => get<Pond>(`/pond/${id}`),
  create: (data: Partial<Pond>) => post<Pond>('/pond', data),
  update: (id: string, data: Partial<Pond>) => put<Pond>(`/pond/${id}`, data),
  remove: (id: string) => del(`/pond/${id}`),

  listWaterQuality: (pondId: string) => get<WaterQualityRecord[]>(`/pond/${pondId}/water-quality`),
  createWaterQuality: (data: any) => post<WaterQualityRecord>('/pond/water-quality', data),

  listMortality: (pondId: string) => get<MortalityRecord[]>(`/pond/${pondId}/mortality`),
  createMortality: (data: any) => post<MortalityRecord>('/pond/mortality', data),

  getSensorLatest: (pondId: string) => get<any>(`/pond/${pondId}/sensor/latest`),
  getSensorHistory: (pondId: string) => get<any[]>(`/pond/${pondId}/sensor/history`),
  checkDO: (pondId: string, threshold?: number) =>
    get<any>(`/pond/${pondId}/sensor/check-do${threshold ? `?threshold=${threshold}` : ''}`),

  getPondStatus: (pondId: string) => get<PondStatus>(`/pond/${pondId}/status`),
  getLatestAeratorOrder: (pondId: string) => get<any | null>(`/pond/${pondId}/aerator/latest`),
};

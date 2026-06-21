import { get, post, put } from './request';

export interface Batch {
  id: string;
  batchCode: string;
  pondId: string;
  batchName: string;
  stockDate: string;
  stockQuantity: number;
  species: string;
  initialAverageWeight?: number;
  source?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pond?: any;
}

export interface SalesBatch {
  id: string;
  salesBatchCode: string;
  batchId: string;
  pondId: string;
  harvestDate: string;
  harvestQuantity: number;
  averageWeight: number;
  totalWeight: number;
  qualityInspector: string;
  inspectionDate: string;
  inspectionReport?: string;
  withdrawalPeriodVerified: boolean;
  withdrawalEndDate?: string;
  qualityRemarks?: string;
  status: string;
  customer?: string;
  destination?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  batch?: Batch;
  pond?: any;
}

export const batchApi = {
  listBatches: (status?: string) =>
    get<Batch[]>(`/batch/list${status ? `?status=${status}` : ''}`),
  batchDetail: (id: string) => get<Batch>(`/batch/${id}`),
  createBatch: (data: any) => post<Batch>('/batch/create', data),
  completeBatch: (id: string) => put<Batch>(`/batch/${id}/complete`),

  listSalesBatches: (status?: string) =>
    get<SalesBatch[]>(`/batch/sales/list${status ? `?status=${status}` : ''}`),
  salesBatchDetail: (id: string) => get<SalesBatch>(`/batch/sales/${id}`),
  createSalesBatch: (data: any) => post<SalesBatch>('/batch/sales/create', data),
  releaseSalesBatch: (id: string) => put<SalesBatch>(`/batch/sales/${id}/release`),
  rejectSalesBatch: (id: string, reason: string) =>
    put<SalesBatch>(`/batch/sales/${id}/reject`, { reason }),
  inspectSalesBatch: (id: string, passed: boolean, inspector: string, report?: string) =>
    put<SalesBatch>(`/batch/sales/${id}/inspect`, { passed, inspector, report }),

  preCheckWithdrawal: (pondId: string, harvestDate: string) =>
    get<any>(`/batch/pre-check/withdrawal?pondId=${pondId}&harvestDate=${harvestDate}`),
};

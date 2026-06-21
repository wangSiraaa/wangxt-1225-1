import { get, post, put } from './request';

export interface DeviceWorkOrder {
  id: string;
  orderCode: string;
  pondId: string;
  title: string;
  deviceType: string;
  description: string;
  orderType: string;
  triggerSource?: string;
  triggerValue?: number;
  thresholdValue?: number;
  status: string;
  assignee?: string;
  startedAt?: string;
  completedAt?: string;
  handleResult?: string;
  operator?: string;
  remark?: string;
  aeratorHandleRemark?: string;
  createdAt: string;
  updatedAt: string;
  pond?: any;
}

export const workOrderApi = {
  list: (params?: { status?: string; pondId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return get<DeviceWorkOrder[]>(`/workorder/list${query ? `?${query}` : ''}`);
  },
  detail: (id: string) => get<DeviceWorkOrder>(`/workorder/${id}`),
  create: (data: any) => post<DeviceWorkOrder>('/workorder/create', data),
  start: (id: string, assignee: string) =>
    put<DeviceWorkOrder>(`/workorder/${id}/start`, { assignee }),
  complete: (id: string, data: any) =>
    put<DeviceWorkOrder>(`/workorder/${id}/complete`, data),
  cancel: (id: string, reason: string, operator: string) =>
    put<DeviceWorkOrder>(`/workorder/${id}/cancel`, { reason, operator }),
  checkAerator: (pondId: string, threshold?: number) =>
    post<DeviceWorkOrder>(`/workorder/aerator/check/${pondId}${threshold ? `?threshold=${threshold}` : ''}`),
  stats: () => get<any>('/workorder/stats/summary'),
  getLatestAeratorOrder: (pondId: string) =>
    get<DeviceWorkOrder | null>(`/workorder/aerator/latest/${pondId}`),
};

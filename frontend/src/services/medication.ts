import { get, post, put, del } from './request';

export interface Medicine {
  id: string;
  medicineName: string;
  medicineCode: string;
  manufacturer?: string;
  specification: string;
  unit: string;
  withdrawalPeriodDays: number;
  isBanned: boolean;
  usageInstructions?: string;
  contraindications?: string;
  remark?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationPlan {
  id: string;
  pondId: string;
  medicineId: string;
  planCode: string;
  planName: string;
  dosage: number;
  dosageUnit: string;
  startDate: string;
  endDate: string;
  withdrawalEndDate: string;
  technician: string;
  usageMethod?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  medicine?: Medicine;
  pond?: any;
}

export const medicationApi = {
  listMedicines: (includeBanned?: boolean) =>
    get<Medicine[]>(`/medication/medicines${includeBanned ? '?includeBanned=true' : ''}`),
  medicineDetail: (id: string) => get<Medicine>(`/medication/medicines/${id}`),
  createMedicine: (data: any) => post<Medicine>('/medication/medicines', data),
  updateMedicine: (id: string, data: any) => put<Medicine>(`/medication/medicines/${id}`, data),
  removeMedicine: (id: string) => del(`/medication/medicines/${id}`),

  listPlans: (params?: { pondId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return get<MedicationPlan[]>(`/medication/plans${query ? `?${query}` : ''}`);
  },
  planDetail: (id: string) => get<MedicationPlan>(`/medication/plans/${id}`),
  createPlan: (data: any) => post<MedicationPlan>('/medication/plans', data),
  cancelPlan: (id: string) => put<MedicationPlan>(`/medication/plans/${id}/cancel`),
  completePlan: (id: string) => put<MedicationPlan>(`/medication/plans/${id}/complete`),
  pondActivePlans: (pondId: string) => get<MedicationPlan[]>(`/medication/plans/pond/${pondId}/active`),

  checkWithdrawal: (pondId: string) =>
    get<any>(`/medication/withdrawal/check/${pondId}`),
};

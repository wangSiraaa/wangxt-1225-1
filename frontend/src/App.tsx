import { Routes, Route, Navigate } from 'react-router-dom';
import BasicLayout from './layouts/BasicLayout';
import Dashboard from './pages/Dashboard';
import PondList from './pages/pond/PondList';
import PondDetail from './pages/pond/PondDetail';
import MedicineList from './pages/medication/MedicineList';
import MedicationPlanList from './pages/medication/MedicationPlanList';
import BatchList from './pages/batch/BatchList';
import SalesBatchList from './pages/batch/SalesBatchList';
import WorkOrderList from './pages/workorder/WorkOrderList';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BasicLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pond" element={<PondList />} />
        <Route path="pond/:id" element={<PondDetail />} />
        <Route path="medication/medicine" element={<MedicineList />} />
        <Route path="medication/plan" element={<MedicationPlanList />} />
        <Route path="batch/list" element={<BatchList />} />
        <Route path="batch/sales" element={<SalesBatchList />} />
        <Route path="workorder" element={<WorkOrderList />} />
      </Route>
    </Routes>
  );
}

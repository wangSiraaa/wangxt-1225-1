import { useEffect, useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
  ProFormDateRangePicker,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { medicationApi, MedicationPlan, Medicine } from '@/services/medication';
import { pondApi, Pond } from '@/services/pond';

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  active: { color: 'blue', text: '进行中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'red', text: '已取消' },
};

export default function MedicationPlanList() {
  const [modalVisible, setModalVisible] = useState(false);
  const actionRef = useRef<ActionType>();
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const [pondList, medicineList] = await Promise.all([
      pondApi.list(),
      medicationApi.listMedicines(false),
    ]);
    setPonds(pondList);
    setMedicines(medicineList);
  };

  const columns = [
    { title: '方案编号', dataIndex: 'planCode', width: 160 },
    { title: '方案名称', dataIndex: 'planName', width: 160 },
    {
      title: '池塘',
      dataIndex: ['pond', 'pondName'],
      width: 120,
      render: (_: any, r: MedicationPlan) => r.pond?.pondName,
    },
    {
      title: '药品',
      dataIndex: ['medicine', 'medicineName'],
      width: 140,
      render: (_: any, r: MedicationPlan) => r.medicine?.medicineName,
    },
    {
      title: '剂量',
      width: 100,
      render: (_: any, r: MedicationPlan) => `${r.dosage} ${r.dosageUnit}`,
    },
    {
      title: '用药周期',
      width: 200,
      render: (_: any, r: MedicationPlan) =>
        `${dayjs(r.startDate).format('YYYY-MM-DD')} ~ ${dayjs(r.endDate).format('YYYY-MM-DD')}`,
    },
    {
      title: '停药截止',
      dataIndex: 'withdrawalEndDate',
      width: 120,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    { title: '开方人', dataIndex: 'technician', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: MedicationPlan) => (
        <Space>
          {record.status === 'active' && (
            <>
              <Popconfirm
                title="确定标记该方案完成？"
                onConfirm={async () => {
                  await medicationApi.completePlan(record.id);
                  message.success('已标记完成');
                  actionRef.current?.reload();
                }}
              >
                <Button type="link" icon={<CheckOutlined />}>
                  完成
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定取消该用药方案？"
                onConfirm={async () => {
                  await medicationApi.cancelPlan(record.id);
                  message.success('已取消');
                  actionRef.current?.reload();
                }}
              >
                <Button type="link" danger icon={<CloseOutlined />}>
                  取消
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<MedicationPlan>
        headerTitle="用药方案"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            开具用药方案
          </Button>,
        ]}
        columns={columns}
        request={async () => {
          const data = await medicationApi.listPlans();
          return { data };
        }}
      />

      <ModalForm
        title="开具用药方案"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (values: any) => {
          const payload = {
            pondId: values.pondId,
            medicineId: values.medicineId,
            planName: values.planName,
            dosage: values.dosage,
            dosageUnit: values.dosageUnit,
            startDate: dayjs(values.dateRange[0]).format('YYYY-MM-DD'),
            endDate: dayjs(values.dateRange[1]).format('YYYY-MM-DD'),
            technician: values.technician,
            usageMethod: values.usageMethod,
            notes: values.notes,
          };
          await medicationApi.createPlan(payload);
          message.success('用药方案开具成功');
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        modalProps={{ destroyOnClose: true, width: 640 }}
      >
        <ProFormSelect
          name="pondId"
          label="选择池塘"
          rules={[{ required: true, message: '请选择池塘' }]}
          options={ponds.map(p => ({ label: `${p.pondCode} - ${p.pondName}`, value: p.id }))}
          placeholder="请选择池塘"
        />
        <ProFormSelect
          name="medicineId"
          label="选择药品"
          rules={[{ required: true, message: '请选择药品' }]}
          options={medicines.map(m => ({
            label: `${m.medicineName} (停药期${m.withdrawalPeriodDays}天)`,
            value: m.id,
          }))}
          placeholder="请选择药品（禁用药已过滤）"
        />
        <ProFormText
          name="planName"
          label="方案名称"
          rules={[{ required: true, message: '请输入方案名称' }]}
        />
        <ProFormDigit
          name="dosage"
          label="用药剂量"
          rules={[{ required: true, message: '请输入剂量' }]}
          min={0}
          fieldProps={{ precision: 2 }}
        />
        <ProFormText
          name="dosageUnit"
          label="剂量单位"
          rules={[{ required: true, message: '请输入单位' }]}
          placeholder="如：ml、g、kg"
        />
        <ProFormDateRangePicker
          name="dateRange"
          label="用药周期"
          rules={[{ required: true, message: '请选择用药周期' }]}
          fieldProps={{ style: { width: '100%' } }}
        />
        <ProFormText
          name="technician"
          label="开方技术员"
          rules={[{ required: true, message: '请输入技术员姓名' }]}
        />
        <ProFormTextArea name="usageMethod" label="使用方法" fieldProps={{ rows: 2 }} />
        <ProFormTextArea name="notes" label="备注说明" fieldProps={{ rows: 2 }} />
      </ModalForm>
    </div>
  );
}

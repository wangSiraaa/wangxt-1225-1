import { useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSwitch,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Space, Tag, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { medicationApi, Medicine } from '@/services/medication';

export default function MedicineList() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<Medicine | null>(null);
  const [includeBanned, setIncludeBanned] = useState(false);
  const actionRef = useRef<ActionType>();

  const columns = [
    { title: '药品编码', dataIndex: 'medicineCode', width: 120 },
    { title: '药品名称', dataIndex: 'medicineName', width: 160 },
    { title: '生产厂家', dataIndex: 'manufacturer', width: 160 },
    { title: '规格', dataIndex: 'specification', width: 100 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    {
      title: '停药期(天)',
      dataIndex: 'withdrawalPeriodDays',
      width: 100,
      render: (v: number) => <Tag color="blue">{v} 天</Tag>,
    },
    {
      title: '禁用药',
      dataIndex: 'isBanned',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="red">禁用药</Tag> : <Tag color="green">正常</Tag>,
    },
    { title: '状态', dataIndex: 'status', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: Medicine) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditRecord(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该药品？"
            onConfirm={async () => {
              await medicationApi.removeMedicine(record.id);
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<Medicine>
        headerTitle="药品档案"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Space key="filter">
            <span>显示禁用药：</span>
            <Switch checked={includeBanned} onChange={setIncludeBanned} />
          </Space>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRecord(null);
              setModalVisible(true);
            }}
          >
            新增药品
          </Button>,
        ]}
        columns={columns}
        request={async () => {
          const data = await medicationApi.listMedicines(includeBanned);
          return { data };
        }}
      />

      <ModalForm
        title={editRecord ? '编辑药品' : '新增药品'}
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (values: any) => {
          if (editRecord) {
            await medicationApi.updateMedicine(editRecord.id, values);
          } else {
            await medicationApi.createMedicine(values);
          }
          message.success(editRecord ? '更新成功' : '创建成功');
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        modalProps={{ destroyOnClose: true }}
        initialValues={editRecord || { isBanned: false, status: 'active' }}
      >
        <ProFormText
          name="medicineCode"
          label="药品编码"
          disabled={!!editRecord}
          rules={[{ required: true, message: '请输入药品编码' }]}
        />
        <ProFormText
          name="medicineName"
          label="药品名称"
          rules={[{ required: true, message: '请输入药品名称' }]}
        />
        <ProFormText name="manufacturer" label="生产厂家" />
        <ProFormText
          name="specification"
          label="规格"
          rules={[{ required: true, message: '请输入规格' }]}
          placeholder="如：100ml/瓶、500g/袋"
        />
        <ProFormText
          name="unit"
          label="单位"
          rules={[{ required: true, message: '请输入单位' }]}
          placeholder="如：瓶、袋、kg"
        />
        <ProFormDigit
          name="withdrawalPeriodDays"
          label="停药期(天)"
          rules={[{ required: true, message: '请输入停药期天数' }]}
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormSwitch
          name="isBanned"
          label="是否禁用药"
          fieldProps={{ checkedChildren: '禁用', unCheckedChildren: '正常' }}
        />
        <ProFormTextArea name="usageInstructions" label="使用说明" fieldProps={{ rows: 2 }} />
        <ProFormTextArea name="contraindications" label="禁忌症" fieldProps={{ rows: 2 }} />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 2 }} />
      </ModalForm>
    </div>
  );
}

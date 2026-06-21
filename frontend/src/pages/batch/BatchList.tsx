import { useEffect, useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
  ProFormDatePicker,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Space, Tag, message } from 'antd';
import { PlusOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { batchApi, Batch } from '@/services/batch';
import { pondApi, Pond } from '@/services/pond';

const statusMap: Record<string, { color: string; text: string }> = {
  farming: { color: 'blue', text: '养殖中' },
  harvested: { color: 'orange', text: '已出塘' },
  completed: { color: 'green', text: '已完成' },
};

export default function BatchList() {
  const [modalVisible, setModalVisible] = useState(false);
  const actionRef = useRef<ActionType>();
  const [ponds, setPonds] = useState<Pond[]>([]);

  useEffect(() => {
    pondApi.list().then(setPonds);
  }, []);

  const columns = [
    { title: '批次编号', dataIndex: 'batchCode', width: 160 },
    { title: '批次名称', dataIndex: 'batchName', width: 160 },
    {
      title: '池塘',
      dataIndex: ['pond', 'pondName'],
      width: 120,
      render: (_: any, r: Batch) => r.pond?.pondName,
    },
    { title: '养殖品种', dataIndex: 'species', width: 100 },
    { title: '放苗数量', dataIndex: 'stockQuantity', width: 100 },
    {
      title: '放苗日期',
      dataIndex: 'stockDate',
      width: 120,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    { title: '苗种来源', dataIndex: 'source', width: 120 },
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
      width: 120,
      fixed: 'right',
      render: (_: any, record: Batch) => (
        <Space>
          {record.status === 'farming' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={async () => {
                await batchApi.completeBatch(record.id);
                message.success('批次已标记完成');
                actionRef.current?.reload();
              }}
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<Batch>
        headerTitle="养殖批次"
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
            创建批次
          </Button>,
        ]}
        columns={columns}
        request={async () => {
          const data = await batchApi.listBatches();
          return { data };
        }}
      />

      <ModalForm
        title="创建养殖批次"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (values: any) => {
          const payload = {
            ...values,
            stockDate: dayjs(values.stockDate).format('YYYY-MM-DD'),
          };
          await batchApi.createBatch(payload);
          message.success('养殖批次创建成功');
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormText
          name="batchName"
          label="批次名称"
          rules={[{ required: true, message: '请输入批次名称' }]}
        />
        <ProFormSelect
          name="pondId"
          label="池塘"
          rules={[{ required: true, message: '请选择池塘' }]}
          options={ponds.map(p => ({ label: `${p.pondCode} - ${p.pondName}`, value: p.id }))}
          placeholder="请选择池塘"
        />
        <ProFormDatePicker
          name="stockDate"
          label="放苗日期"
          rules={[{ required: true, message: '请选择放苗日期' }]}
          fieldProps={{ style: { width: '100%' } }}
        />
        <ProFormDigit
          name="stockQuantity"
          label="放苗数量(尾)"
          rules={[{ required: true, message: '请输入放苗数量' }]}
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormText
          name="species"
          label="养殖品种"
          rules={[{ required: true, message: '请输入养殖品种' }]}
        />
        <ProFormDigit
          name="initialAverageWeight"
          label="初始平均体重(g)"
          min={0}
          fieldProps={{ precision: 2 }}
        />
        <ProFormText name="source" label="苗种来源" />
        <ProFormTextArea name="notes" label="备注" fieldProps={{ rows: 2 }} />
      </ModalForm>
    </div>
  );
}

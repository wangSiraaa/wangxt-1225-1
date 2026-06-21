import { useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { pondApi, Pond } from '@/services/pond';

const statusMap: Record<string, { color: string; text: string }> = {
  active: { color: 'green', text: '养殖中' },
  inactive: { color: 'default', text: '空闲' },
  maintenance: { color: 'orange', text: '维护中' },
};

export default function PondList() {
  const navigate = useNavigate();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const actionRef = useRef<ActionType>();

  const columns = [
    {
      title: '池塘编号',
      dataIndex: 'pondCode',
      width: 120,
    },
    {
      title: '池塘名称',
      dataIndex: 'pondName',
      width: 150,
    },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      width: 100,
    },
    {
      title: '养殖品种',
      dataIndex: 'species',
      width: 120,
    },
    {
      title: '存塘数量',
      dataIndex: 'stockQuantity',
      width: 100,
    },
    {
      title: '平均体重(g)',
      dataIndex: 'averageWeight',
      width: 110,
    },
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
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: Pond) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/pond/${record.id}`)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定删除该池塘？"
            onConfirm={async () => {
              await pondApi.remove(record.id);
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
      <ProTable<Pond>
        headerTitle="池塘列表"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新增池塘
          </Button>,
        ]}
        columns={columns}
        request={async () => {
          const data = await pondApi.list();
          return { data };
        }}
      />

      <ModalForm
        title="新增池塘"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values: any) => {
          await pondApi.create(values);
          message.success('创建成功');
          actionRef.current?.reload();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        <ProFormText
          name="pondCode"
          label="池塘编号"
          rules={[{ required: true, message: '请输入池塘编号' }]}
          placeholder="如：P001"
        />
        <ProFormText
          name="pondName"
          label="池塘名称"
          rules={[{ required: true, message: '请输入池塘名称' }]}
        />
        <ProFormDigit
          name="area"
          label="面积(平方米)"
          rules={[{ required: true, message: '请输入面积' }]}
          min={0.01}
          fieldProps={{ precision: 2 }}
        />
        <ProFormText
          name="species"
          label="养殖品种"
          rules={[{ required: true, message: '请输入养殖品种' }]}
          placeholder="如：草鱼、鲤鱼"
        />
        <ProFormDigit
          name="stockQuantity"
          label="投放数量"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDigit
          name="averageWeight"
          label="平均体重(g)"
          min={0}
          fieldProps={{ precision: 2 }}
        />
        <ProFormSelect
          name="status"
          label="状态"
          initialValue="active"
          options={[
            { value: 'active', label: '养殖中' },
            { value: 'inactive', label: '空闲' },
            { value: 'maintenance', label: '维护中' },
          ]}
        />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
      </ModalForm>
    </div>
  );
}

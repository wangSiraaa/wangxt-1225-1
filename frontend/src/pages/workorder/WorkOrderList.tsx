import { useEffect, useState, useRef } from 'react';
import {
  ProTable,
  ActionType,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDigit,
  ModalForm,
} from '@ant-design/pro-components';
import { Button, Space, Tag, message, Popconfirm, Modal, Form, Input, Statistic, Row, Col, Card } from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { workOrderApi, DeviceWorkOrder } from '@/services/workorder';
import { pondApi, Pond } from '@/services/pond';

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待处理' },
  processing: { color: 'blue', text: '处理中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};

const deviceTypeMap: Record<string, { color: string; text: string }> = {
  aerator: { color: 'cyan', text: '增氧设备' },
  pump: { color: 'geekblue', text: '水泵' },
  feeder: { color: 'purple', text: '投饵机' },
  other: { color: 'default', text: '其他' },
};

export default function WorkOrderList() {
  const [modalVisible, setModalVisible] = useState(false);
  const actionRef = useRef<ActionType>();
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [stats, setStats] = useState<any>({});
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<DeviceWorkOrder | null>(null);
  const [startForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [cancelForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pondList, statsData] = await Promise.all([
      pondApi.list(),
      workOrderApi.stats(),
    ]);
    setPonds(pondList);
    setStats(statsData);
  };

  const columns = [
    { title: '工单编号', dataIndex: 'orderCode', width: 160 },
    { title: '标题', dataIndex: 'title', width: 200 },
    {
      title: '池塘',
      dataIndex: ['pond', 'pondName'],
      width: 120,
      render: (_: any, r: DeviceWorkOrder) => r.pond?.pondName,
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      width: 100,
      render: (type: string) => {
        const info = deviceTypeMap[type] || { color: 'default', text: type };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '触发方式',
      dataIndex: 'orderType',
      width: 100,
      render: (type: string) =>
        type === 'automatic' ? <Tag color="red">自动触发</Tag> : <Tag color="blue">人工创建</Tag>,
    },
    {
      title: '溶氧值/阈值',
      width: 130,
      render: (_: any, r: DeviceWorkOrder) =>
        r.triggerValue != null ? (
          <Space>
            <span style={{ color: r.triggerValue < (r.thresholdValue || 5) ? '#cf1322' : undefined }}>
              {r.triggerValue}
            </span>
            <span style={{ color: '#999' }}>/</span>
            <span>{r.thresholdValue}</span>
          </Space>
        ) : '-',
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
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
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_: any, record: DeviceWorkOrder) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setCurrentOrder(record);
                setStartModalVisible(true);
              }}
            >
              开始处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => {
                setCurrentOrder(record);
                setCompleteModalVisible(true);
              }}
            >
              完成
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setCurrentOrder(record);
                setCancelModalVisible(true);
              }}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="工单总数" value={stats.total || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={stats.pending || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="处理中" value={stats.processing || 0} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="今日新增"
              value={stats.todayCount || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <ProTable<DeviceWorkOrder>
        headerTitle="设备工单"
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
            创建设备工单
          </Button>,
        ]}
        columns={columns}
        request={async () => {
          const data = await workOrderApi.list();
          return { data };
        }}
      />

      <ModalForm
        title="创建设备工单"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (values: any) => {
          await workOrderApi.create(values);
          message.success('工单创建成功');
          actionRef.current?.reload();
          loadData();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        modalProps={{ destroyOnClose: true }}
      >
        <ProFormSelect
          name="pondId"
          label="池塘"
          rules={[{ required: true, message: '请选择池塘' }]}
          options={ponds.map(p => ({ label: `${p.pondCode} - ${p.pondName}`, value: p.id }))}
          placeholder="请选择池塘"
        />
        <ProFormText
          name="title"
          label="工单标题"
          rules={[{ required: true, message: '请输入工单标题' }]}
        />
        <ProFormSelect
          name="deviceType"
          label="设备类型"
          rules={[{ required: true, message: '请选择设备类型' }]}
          options={[
            { value: 'aerator', label: '增氧设备' },
            { value: 'pump', label: '水泵' },
            { value: 'feeder', label: '投饵机' },
            { value: 'other', label: '其他' },
          ]}
          placeholder="请选择设备类型"
        />
        <ProFormTextArea
          name="description"
          label="问题描述"
          rules={[{ required: true, message: '请输入问题描述' }]}
          fieldProps={{ rows: 3 }}
        />
        <ProFormDigit name="triggerValue" label="触发值" fieldProps={{ precision: 2 }} />
        <ProFormDigit name="thresholdValue" label="阈值" fieldProps={{ precision: 2 }} />
        <ProFormText name="assignee" label="指派处理人" />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 2 }} />
      </ModalForm>

      <Modal
        title="开始处理工单"
        open={startModalVisible}
        onCancel={() => setStartModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <p style={{ color: '#666' }}>工单：{currentOrder?.title}</p>
        <Form form={startForm} layout="vertical" onFinish={async (values: any) => {
          if (currentOrder) {
            await workOrderApi.start(currentOrder.id, values.assignee);
            message.success('已开始处理');
            setStartModalVisible(false);
            actionRef.current?.reload();
            loadData();
          }
        }}>
          <Form.Item name="assignee" label="处理人"
            rules={[{ required: true, message: '请输入处理人姓名' }]}>
            <Input placeholder="请输入处理人姓名" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setStartModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">确认开始</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="完成工单"
        open={completeModalVisible}
        onCancel={() => setCompleteModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <p style={{ color: '#666' }}>工单：{currentOrder?.title}</p>
        <Form form={completeForm} layout="vertical" onFinish={async (values: any) => {
          if (currentOrder) {
            await workOrderApi.complete(currentOrder.id, values);
            message.success('工单已完成');
            setCompleteModalVisible(false);
            actionRef.current?.reload();
            loadData();
          }
        }}>
          <Form.Item name="handleResult" label="处理结果"
            rules={[{ required: true, message: '请填写处理结果' }]}>
            <Input.TextArea rows={4} placeholder="请详细描述处理过程和结果" />
          </Form.Item>
          <Form.Item name="operator" label="操作人"
            rules={[{ required: true, message: '请输入操作人姓名' }]}>
            <Input placeholder="请输入操作人姓名" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCompleteModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">确认完成</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="取消工单"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <p style={{ color: '#666' }}>工单：{currentOrder?.title}</p>
        <Form form={cancelForm} layout="vertical" onFinish={async (values: any) => {
          if (currentOrder) {
            await workOrderApi.cancel(currentOrder.id, values.reason, values.operator);
            message.success('工单已取消');
            setCancelModalVisible(false);
            actionRef.current?.reload();
            loadData();
          }
        }}>
          <Form.Item name="reason" label="取消原因"
            rules={[{ required: true, message: '请输入取消原因' }]}>
            <Input.TextArea rows={3} placeholder="请输入取消原因" />
          </Form.Item>
          <Form.Item name="operator" label="操作人"
            rules={[{ required: true, message: '请输入操作人姓名' }]}>
            <Input placeholder="请输入操作人姓名" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCancelModalVisible(false)}>取消</Button>
              <Button type="primary" danger htmlType="submit">确认取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  pondApi,
  Pond,
  WaterQualityRecord,
  MortalityRecord,
} from '@/services/pond';
import { medicationApi } from '@/services/medication';
import { workOrderApi } from '@/services/workorder';

export default function PondDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pond, setPond] = useState<Pond | null>(null);
  const [sensorLatest, setSensorLatest] = useState<any>(null);
  const [waterRecords, setWaterRecords] = useState<WaterQualityRecord[]>([]);
  const [mortalityRecords, setMortalityRecords] = useState<MortalityRecord[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [withdrawalCheck, setWithdrawalCheck] = useState<any>(null);
  const [latestAeratorOrder, setLatestAeratorOrder] = useState<any>(null);
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [mortalityModalVisible, setMortalityModalVisible] = useState(false);
  const [waterForm] = Form.useForm();
  const [mortalityForm] = Form.useForm();

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    const [
      pondData,
      sensor,
      water,
      mortality,
      plans,
      withdrawal,
      aeratorOrder,
    ] = await Promise.all([
      pondApi.detail(id),
      pondApi.getSensorLatest(id),
      pondApi.listWaterQuality(id),
      pondApi.listMortality(id),
      medicationApi.pondActivePlans(id),
      medicationApi.checkWithdrawal(id),
      pondApi.getLatestAeratorOrder(id),
    ]);
    setPond(pondData);
    setSensorLatest(sensor);
    setWaterRecords(water);
    setMortalityRecords(mortality);
    setActivePlans(plans);
    setWithdrawalCheck(withdrawal);
    setLatestAeratorOrder(aeratorOrder);
  };

  const waterQualityColumns = [
    { title: '记录时间', dataIndex: 'recordedAt', render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm') },
    { title: '溶氧(mg/L)', dataIndex: 'dissolvedOxygen',
      render: (v: number) => <Tag color={v < 5 ? 'red' : 'green'}>{v}</Tag> },
    { title: 'pH', dataIndex: 'ph' },
    { title: '水温(℃)', dataIndex: 'temperature' },
    { title: '氨氮(mg/L)', dataIndex: 'ammoniaNitrogen' },
    { title: '亚硝酸盐(mg/L)', dataIndex: 'nitrite' },
    { title: '浊度(NTU)', dataIndex: 'turbidity' },
    { title: '记录人', dataIndex: 'recorder' },
  ];

  const mortalityColumns = [
    { title: '记录时间', dataIndex: 'recordedAt', render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm') },
    { title: '死亡数量', dataIndex: 'mortalityCount' },
    { title: '死亡率(%)', dataIndex: 'mortalityRate',
      render: (v: number) => <Tag color={v > 1 ? 'red' : 'blue'}>{v}%</Tag> },
    { title: '死亡原因', dataIndex: 'cause' },
    { title: '记录人', dataIndex: 'recorder' },
  ];

  const handleWaterSubmit = async (values: any) => {
    await pondApi.createWaterQuality({ pondId: id, ...values });
    message.success('水质记录提交成功');
    setWaterModalVisible(false);
    waterForm.resetFields();

    if (values.dissolvedOxygen < 5) {
      try {
        const order = await workOrderApi.checkAerator(id!);
        if (order) message.warning('溶氧偏低，已自动触发增氧设备工单');
      } catch (e) {}
    }
    loadData();
  };

  const handleMortalitySubmit = async (values: any) => {
    await pondApi.createMortality({ pondId: id, ...values });
    message.success('死亡率记录提交成功');
    setMortalityModalVisible(false);
    mortalityForm.resetFields();
    loadData();
  };

  if (!pond) return <div>加载中...</div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <h2 style={{ margin: 0 }}>{pond.pondName} - 池塘详情</h2>
      </Space>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="池塘编号">{pond.pondCode}</Descriptions.Item>
          <Descriptions.Item label="养殖品种">{pond.species}</Descriptions.Item>
          <Descriptions.Item label="面积">{pond.area} ㎡</Descriptions.Item>
          <Descriptions.Item label="存塘数量">{pond.stockQuantity} 尾</Descriptions.Item>
          <Descriptions.Item label="平均体重">{pond.averageWeight} g</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="green">{pond.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="当前溶氧"
              value={sensorLatest?.dissolvedOxygen ?? '--'}
              suffix="mg/L"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: sensorLatest?.dissolvedOxygen < 5 ? '#cf1322' : '#3f8600' }}
            />
            {sensorLatest?.timestamp && (
              <div style={{ fontSize: 12, color: '#999' }}>
                更新于 {dayjs(sensorLatest.timestamp).format('MM-DD HH:mm')}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="当前 pH"
              value={sensorLatest?.ph ?? '--'}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="当前水温"
              value={sensorLatest?.temperature ?? '--'}
              suffix="℃"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            {withdrawalCheck?.canRelease ? (
              <Statistic title="停药期状态" value="可正常出塘" valueStyle={{ color: '#3f8600' }} />
            ) : (
              <div>
                <div style={{ fontSize: 14, color: '#cf1322', fontWeight: 'bold' }}>
                  <WarningOutlined /> 停药期未满
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  最早可出塘日期：
                  {withdrawalCheck?.latestWithdrawalEndDate &&
                    dayjs(withdrawalCheck.latestWithdrawalEndDate).format('YYYY-MM-DD')}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card size="small" title="进行中用药方案" style={{ marginBottom: 16 }}>
        {activePlans.length > 0 ? (
          <Table
            size="small"
            dataSource={activePlans}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '方案编号', dataIndex: 'planCode', width: 160 },
              { title: '方案名称', dataIndex: 'planName' },
              { title: '药品', dataIndex: ['medicine', 'medicineName'] },
              { title: '剂量', render: (_: any, r: any) => `${r.dosage} ${r.dosageUnit}` },
              { title: '用药周期', render: (_: any, r: any) =>
                `${dayjs(r.startDate).format('MM-DD')} ~ ${dayjs(r.endDate).format('MM-DD')}` },
              { title: '停药截止', dataIndex: 'withdrawalEndDate',
                render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
              { title: '开方人', dataIndex: 'technician' },
            ]}
          />
        ) : (
          <span style={{ color: '#999' }}>暂无进行中的用药方案</span>
        )}
      </Card>

      <Card size="small" title="最近增氧处理记录" style={{ marginBottom: 16 }}>
        {latestAeratorOrder ? (
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="工单编号">{latestAeratorOrder.orderCode}</Descriptions.Item>
            <Descriptions.Item label="处理时间">
              {dayjs(latestAeratorOrder.completedAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="触发溶氧值">
              {latestAeratorOrder.triggerValue} mg/L
            </Descriptions.Item>
            <Descriptions.Item label="处理人">{latestAeratorOrder.operator}</Descriptions.Item>
            <Descriptions.Item label="处理结果" span={2}>
              {latestAeratorOrder.handleResult}
            </Descriptions.Item>
            {latestAeratorOrder.aeratorHandleRemark && (
              <Descriptions.Item label="增氧设备处理备注" span={2}>
                {latestAeratorOrder.aeratorHandleRemark}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <span style={{ color: '#999' }}>暂无增氧处理记录</span>
        )}
      </Card>

      <Card
        size="small"
        tabBarExtraContent={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setWaterModalVisible(true)}
            >
              录入水质
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setMortalityModalVisible(true)}
            >
              录入死亡率
            </Button>
          </Space>
        }
      >
        <Tabs
          items={[
            {
              key: 'water',
              label: '水质记录',
              children: (
                <Table
                  size="small"
                  dataSource={waterRecords}
                  rowKey="id"
                  columns={waterQualityColumns}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'mortality',
              label: '死亡率记录',
              children: (
                <Table
                  size="small"
                  dataSource={mortalityRecords}
                  rowKey="id"
                  columns={mortalityColumns}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="录入水质数据"
        open={waterModalVisible}
        onCancel={() => setWaterModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={waterForm} layout="vertical" onFinish={handleWaterSubmit}>
          <Form.Item name="dissolvedOxygen" label="溶氧量(mg/L)"
            rules={[{ required: true, message: '请输入溶氧量' }]}>
            <InputNumber min={0} max={20} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ph" label="pH值"
            rules={[{ required: true, message: '请输入pH值' }]}>
            <InputNumber min={0} max={14} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="temperature" label="水温(℃)"
            rules={[{ required: true, message: '请输入水温' }]}>
            <InputNumber min={-10} max={50} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ammoniaNitrogen" label="氨氮(mg/L)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nitrite" label="亚硝酸盐(mg/L)">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="recorder" label="记录人"
            rules={[{ required: true, message: '请输入记录人' }]}>
            <Input placeholder="请输入记录人姓名" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setWaterModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">提交</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="录入死亡率数据"
        open={mortalityModalVisible}
        onCancel={() => setMortalityModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={mortalityForm} layout="vertical" onFinish={handleMortalitySubmit}>
          <Form.Item name="mortalityCount" label="死亡数量(尾)"
            rules={[{ required: true, message: '请输入死亡数量' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="mortalityRate" label="死亡率(%)"
            rules={[{ required: true, message: '请输入死亡率' }]}>
            <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cause" label="死亡原因">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="recorder" label="记录人"
            rules={[{ required: true, message: '请输入记录人' }]}>
            <Input placeholder="请输入记录人姓名" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setMortalityModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">提交</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Tag, Space } from 'antd';
import {
  ThunderboltOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { pondApi } from '@/services/pond';
import { medicationApi } from '@/services/medication';
import { workOrderApi } from '@/services/workorder';

export default function Dashboard() {
  const [pondCount, setPondCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [activePlans, setActivePlans] = useState(0);
  const [workOrderStats, setWorkOrderStats] = useState<any>({});
  const [lowDoPonds, setLowDoPonds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ponds, medicines, plans, stats] = await Promise.all([
        pondApi.list(),
        medicationApi.listMedicines(),
        medicationApi.listPlans({ status: 'active' }),
        workOrderApi.stats(),
      ]);
      setPondCount(ponds.length);
      setMedicineCount(medicines.length);
      setActivePlans(plans.length);
      setWorkOrderStats(stats);

      const lowDo: string[] = [];
      for (const pond of ponds.filter(p => p.status === 'active')) {
        const latest = await pondApi.getSensorLatest(pond.id);
        if (latest && latest.dissolvedOxygen < 5) {
          lowDo.push(pond.pondName);
        }
      }
      setLowDoPonds(lowDo);
    } catch (e) {}
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="养殖池塘"
              value={pondCount}
              prefix={<ThunderboltOutlined />}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在用药品"
              value={medicineCount}
              prefix={<MedicineBoxOutlined />}
              suffix="种"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中用药方案"
              value={activePlans}
              prefix={<ShoppingCartOutlined />}
              suffix="个"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理工单"
              value={workOrderStats.pending || 0}
              prefix={<FileTextOutlined />}
              suffix="单"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="工单统计" size="small">
            <Space wrap>
              <Tag color="default">总计: {workOrderStats.total || 0}</Tag>
              <Tag color="orange">待处理: {workOrderStats.pending || 0}</Tag>
              <Tag color="blue">处理中: {workOrderStats.processing || 0}</Tag>
              <Tag color="green">已完成: {workOrderStats.completed || 0}</Tag>
              <Tag color="red">今日新增: {workOrderStats.todayCount || 0}</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="溶氧预警" size="small">
            {lowDoPonds.length > 0 ? (
              <Space direction="vertical">
                <Space>
                  <WarningOutlined style={{ color: '#cf1322' }} />
                  <span style={{ color: '#cf1322', fontWeight: 'bold' }}>
                    以下池塘溶氧低于 5mg/L，请及时开启增氧设备：
                  </span>
                </Space>
                <Space wrap>
                  {lowDoPonds.map(name => (
                    <Tag key={name} color="red">{name}</Tag>
                  ))}
                </Space>
              </Space>
            ) : (
              <span style={{ color: '#3f8600' }}>✓ 所有池塘溶氧正常</span>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

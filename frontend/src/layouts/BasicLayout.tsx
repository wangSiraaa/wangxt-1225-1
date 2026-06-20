import { Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  MedicineBoxOutlined,
  ClusterOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
  {
    key: 'pond',
    icon: <ThunderboltOutlined />,
    label: '池塘管理',
    children: [
      { key: '/pond', label: '池塘列表' },
    ],
  },
  {
    key: 'medication',
    icon: <MedicineBoxOutlined />,
    label: '用药管理',
    children: [
      { key: '/medication/medicine', label: '药品档案' },
      { key: '/medication/plan', label: '用药方案' },
    ],
  },
  {
    key: 'batch',
    icon: <ClusterOutlined />,
    label: '批次管理',
    children: [
      { key: '/batch/list', label: '养殖批次' },
      { key: '/batch/sales', label: '销售批次' },
    ],
  },
  {
    key: '/workorder',
    icon: <FileTextOutlined />,
    label: '设备工单',
  },
];

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/pond')) return ['/pond'];
    if (path.startsWith('/medication/medicine')) return ['/medication/medicine'];
    if (path.startsWith('/medication/plan')) return ['/medication/plan'];
    if (path.startsWith('/batch/list')) return ['/batch/list'];
    if (path.startsWith('/batch/sales')) return ['/batch/sales'];
    return [path];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          🐟 水产养殖管理
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={['pond', 'medication', 'batch']}
          items={menuItems}
          onClick={({ key }) => navigate(key as string)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          <h2 style={{ margin: 0, lineHeight: '64px' }}>水产养殖基地管理系统</h2>
        </Header>
        <Content style={{ margin: '24px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
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
import { Button, Space, Tag, message, Popconfirm, Alert, Modal, Form, Input } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, SafetyOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { batchApi, SalesBatch, Batch } from '@/services/batch';
import { pondApi, Pond } from '@/services/pond';

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '待质检' },
  qualified: { color: 'blue', text: '质检合格' },
  released: { color: 'green', text: '已放行' },
  rejected: { color: 'red', text: '已驳回' },
};

export default function SalesBatchList() {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionRef, setActionRef] = useState<ActionType | undefined>();
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [preCheckResult, setPreCheckResult] = useState<any>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectBatchId, setRejectBatchId] = useState<string | null>(null);
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    const [pondList, batchList] = await Promise.all([
      pondApi.list(),
      batchApi.listBatches(),
    ]);
    setPonds(pondList);
    setBatches(batchList.filter(b => b.status === 'farming' || b.status === 'harvested'));
  };

  const handlePreCheck = async (pondId: string, harvestDate: string) => {
    if (!pondId || !harvestDate) {
      setPreCheckResult(null);
      return;
    }
    try {
      const result = await batchApi.preCheckWithdrawal(pondId, dayjs(harvestDate).format('YYYY-MM-DD'));
      setPreCheckResult(result);
    } catch (e) {}
  };

  const columns = [
    { title: '销售批次号', dataIndex: 'salesBatchCode', width: 160 },
    {
      title: '养殖批次',
      dataIndex: ['batch', 'batchCode'],
      width: 140,
      render: (_: any, r: SalesBatch) => r.batch?.batchCode,
    },
    {
      title: '池塘',
      dataIndex: ['pond', 'pondName'],
      width: 120,
      render: (_: any, r: SalesBatch) => r.pond?.pondName,
    },
    {
      title: '出塘日期',
      dataIndex: 'harvestDate',
      width: 120,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    { title: '出塘数量', dataIndex: 'harvestQuantity', width: 100 },
    { title: '平均体重(g)', dataIndex: 'averageWeight', width: 110 },
    { title: '总重量(kg)', dataIndex: 'totalWeight', width: 110 },
    { title: '质检员', dataIndex: 'qualityInspector', width: 100 },
    {
      title: '停药期校验',
      dataIndex: 'withdrawalPeriodVerified',
      width: 100,
      render: (v: boolean) => (
        v ? <Tag color="green" icon={<SafetyOutlined />}>通过</Tag> : <Tag color="red">未通过</Tag>
      ),
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
    { title: '客户', dataIndex: 'customer', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: SalesBatch) => (
        <Space>
          {record.status === 'qualified' && (
            <Popconfirm
              title="确定放行该销售批次？"
              description="放行后将允许出塘销售"
              onConfirm={async () => {
                await batchApi.releaseSalesBatch(record.id);
                message.success('已放行');
                actionRef?.reload();
              }}
            >
              <Button type="link" icon={<CheckOutlined />}>
                放行
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'pending' || record.status === 'qualified') && (
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setRejectBatchId(record.id);
                setRejectModalVisible(true);
              }}
            >
              驳回
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<SalesBatch>
        headerTitle="销售批次"
        actionRef={setActionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setPreCheckResult(null);
              setModalVisible(true);
            }}
          >
            创建销售批次（出塘）
          </Button>,
        ]}
        columns={columns}
        request={async () => {
          const data = await batchApi.listSalesBatches();
          return { data };
        }}
      />

      <ModalForm
        title="创建销售批次（出塘）"
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={async (values: any) => {
          if (preCheckResult && !preCheckResult.canCreate) {
            message.error(preCheckResult.reason);
            return false;
          }
          const payload = {
            ...values,
            harvestDate: dayjs(values.harvestDate).format('YYYY-MM-DD'),
            inspectionDate: dayjs(values.inspectionDate).format('YYYY-MM-DD'),
          };
          await batchApi.createSalesBatch(payload);
          message.success('销售批次创建成功，已通过停药期校验');
          actionRef?.reload();
          loadOptions();
          return true;
        }}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        modalProps={{ destroyOnClose: true, width: 640 }}
      >
        <ProFormSelect
          name="pondId"
          label="池塘"
          rules={[{ required: true, message: '请选择池塘' }]}
          options={ponds.map(p => ({ label: `${p.pondCode} - ${p.pondName}`, value: p.id }))}
          placeholder="请选择池塘"
          fieldProps={{
            onChange: (_v: any, _: any, form: any) => {
              const values = form?.getFieldsValue?.();
              handlePreCheck(values?.pondId, values?.harvestDate);
            },
          }}
        />
        <ProFormSelect
          name="batchId"
          label="养殖批次"
          rules={[{ required: true, message: '请选择养殖批次' }]}
          options={batches.map(b => ({ label: `${b.batchCode} - ${b.batchName}`, value: b.id }))}
          placeholder="请选择养殖批次"
        />
        <ProFormDatePicker
          name="harvestDate"
          label="出塘日期"
          rules={[{ required: true, message: '请选择出塘日期' }]}
          fieldProps={{
            style: { width: '100%' },
            onChange: (value: any, _: any, form: any) => {
              const values = form?.getFieldsValue?.();
              handlePreCheck(values?.pondId, value);
            },
          }}
        />

        {preCheckResult && (
          <div style={{ marginBottom: 16 }}>
            {preCheckResult.canCreate ? (
              <Alert
                type="success"
                showIcon
                message="停药期校验通过，可以创建销售批次"
              />
            ) : (
              <Alert
                type="error"
                showIcon
                message={preCheckResult.reason}
                description={
                  preCheckResult.activePlans?.length > 0 ? (
                    <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                      {preCheckResult.activePlans.map((p: any, i: number) => (
                        <li key={i}>
                          {p.medicineName} - 停药至 {p.withdrawalEndDate}
                        </li>
                      ))}
                    </ul>
                  ) : undefined
                }
              />
            )}
          </div>
        )}

        <ProFormDigit
          name="harvestQuantity"
          label="出塘数量(尾)"
          rules={[{ required: true, message: '请输入出塘数量' }]}
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDigit
          name="averageWeight"
          label="平均体重(g)"
          rules={[{ required: true, message: '请输入平均体重' }]}
          min={0}
          fieldProps={{ precision: 2 }}
        />
        <ProFormDigit
          name="totalWeight"
          label="总重量(kg)"
          rules={[{ required: true, message: '请输入总重量' }]}
          min={0}
          fieldProps={{ precision: 2 }}
        />
        <ProFormText
          name="qualityInspector"
          label="质检员"
          rules={[{ required: true, message: '请输入质检员姓名' }]}
        />
        <ProFormDatePicker
          name="inspectionDate"
          label="质检日期"
          rules={[{ required: true, message: '请选择质检日期' }]}
          fieldProps={{ style: { width: '100%' } }}
        />
        <ProFormTextArea name="inspectionReport" label="质检报告" fieldProps={{ rows: 2 }} />
        <ProFormTextArea name="qualityRemarks" label="质量备注" fieldProps={{ rows: 2 }} />
        <ProFormText name="customer" label="客户" />
        <ProFormText name="destination" label="目的地" />
        <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 2 }} />
      </ModalForm>

      <Modal
        title="驳回销售批次"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={rejectForm} layout="vertical" onFinish={async (values: any) => {
          if (rejectBatchId) {
            await batchApi.rejectSalesBatch(rejectBatchId, values.reason);
            message.success('已驳回');
            setRejectModalVisible(false);
            actionRef?.reload();
          }
        }}>
          <Form.Item
            name="reason"
            label="驳回原因"
            rules={[{ required: true, message: '请输入驳回原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细说明驳回原因" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setRejectModalVisible(false)}>取消</Button>
              <Button type="primary" danger htmlType="submit">确认驳回</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

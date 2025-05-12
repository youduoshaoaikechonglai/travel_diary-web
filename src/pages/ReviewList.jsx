import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Tag, Input, Tooltip, Image, Radio, Space } from 'antd';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const statusMap = {
  pending: { color: 'orange', text: '待审核' },
  approved: { color: 'green', text: '已通过' },
  rejected: { color: 'red', text: '未通过' },
};

export default function ReviewList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, note: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, note: null });
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('role') || '{}');

  const fetchData = async (status = '') => {
    setLoading(true);
    try {
      // 构建API查询参数
      const queryParams = status && status !== 'all' ? `?status=${status}` : '';
      const res = await api.get(`/review/notes${queryParams}`);
      setData(res);
    } catch (e) {
      message.error('获取游记失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(statusFilter);
  }, [statusFilter]);

  // 处理状态筛选变化
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  // 审核通过
  const handleApprove = async (note) => {
    try {
      await api.post('/review/action', {
        noteId: note._id,
        action: 'approved',
      });
      message.success('审核通过');
      fetchData(statusFilter);
    } catch (e) {
      message.error('操作失败');
    }
  };

  // 审核拒绝
  const handleReject = async () => {
    if (!rejectReason) return message.warning('请填写拒绝原因');
    try {
      await api.post('/review/action', {
        noteId: rejectModal.note._id,
        action: 'rejected',
        reason: rejectReason,
      });
      message.success('已拒绝');
      setRejectModal({ open: false, note: null });
      setRejectReason('');
      fetchData(statusFilter);
    } catch (e) {
      message.error('操作失败');
    }
  };

  // 删除游记
  const handleDelete = async (note) => {
    setDeleteModal({ open: true, note });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/review/note/${deleteModal.note._id}`, {
        data: { reason: '逻辑删除' },
      });
      message.success('已删除');
      setDeleteModal({ open: false, note: null });
      fetchData(statusFilter);
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  const columns = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      )
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (content) => (
        <Tooltip placement="topLeft" title={content}>
          {content}
        </Tooltip>
      )
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 200,
      render: (images) => (
        <div style={{
          display: 'flex',
          gap: 8,
          maxWidth: 200,
          overflowX: 'auto',
          padding: '8px 0'
        }}>
          <Image.PreviewGroup>
            {images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt="游记图片"
                width={50}
                height={50}
                style={{
                  objectFit: 'cover',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                preview={{
                  maskClassName: 'customize-mask'
                }}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      )
    },
    {
      title: '视频',
      dataIndex: 'video',
      key: 'video',
      width: 120,
      render: (video) => {
        if (!video) return <span style={{ color: '#999' }}>无视频</span>;
        return (
          <div style={{ width: 100, height: 100 }}>
            <video
              src={video}
              width="100%"
              height="100%"
              style={{ objectFit: 'cover' }}
              controls
            />
          </div>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => (
        <Tag color={statusMap[v]?.color}>
          {statusMap[v]?.text}
        </Tag>
      )
    },
    {
      title: '拒绝原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      width: 150,
      render: (reason) => {
        if (!reason) return <span style={{ color: '#999' }}>-</span>;
        return (
          <Tooltip placement="topLeft" title={reason}>
            <span style={{ color: '#ff4d4f' }}>{reason.length > 15 ? reason.slice(0, 15) + '...' : reason}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, note) => (
        <>
          <Button
            size="small"
            onClick={() => handleApprove(note)}
            disabled={note.status !== 'pending'}
          >
            通过
          </Button>
          <Button
            size="small"
            danger
            style={{ marginLeft: 8 }}
            onClick={() => setRejectModal({ open: true, note })}
            disabled={note.status !== 'pending'}
          >
            拒绝
          </Button>
          {user.role === 'admin' && (
            <Button
              size="small"
              style={{ marginLeft: 8 }}
              onClick={() => handleDelete(note)}
              danger
            >
              删除
            </Button>
          )}
        </>
      )
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <button style={{ position: 'absolute', right: 20, top: 20, zIndex: 10 }} onClick={handleLogout}>退出登录</button>
      <h2>游记审核列表</h2>

      {/* 状态筛选 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>状态筛选：</span>
          <Radio.Group value={statusFilter} onChange={handleStatusFilterChange}>
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="approved">已通过</Radio.Button>
            <Radio.Button value="rejected">未通过</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1200 }}
      />

      {/* 拒绝原因弹窗 */}
      <Modal
        open={rejectModal.open}
        title="填写拒绝原因"
        onOk={handleReject}
        onCancel={() => setRejectModal({ open: false, note: null })}
      >
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="请输入拒绝原因"
        />
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        open={deleteModal.open}
        title="确认删除"
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, note: null })}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>逻辑删除</p>
      </Modal>
    </div>
  );
}

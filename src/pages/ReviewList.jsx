import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, message, Tag, Input } from 'antd';
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
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('role') || '{}');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/review/notes');
      setData(res);
    } catch (e) {
      message.error('获取游记失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 审核通过
  const handleApprove = async (note) => {
    try {
      await api.post('/review/action', {
        noteId: note._id,
        action: 'approved',
      });
      message.success('审核通过');
      fetchData();
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
      fetchData();
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
        data: { reason: '违规删除' },
      });
      message.success('已删除');
      setDeleteModal({ open: false, note: null });
      fetchData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '用户', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '图片', dataIndex: 'images', key: 'images',
      render: (images) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {images.map((img, index) => (
            <img key={index} src={img} alt="游记图片" style={{ width: 50, height: 50 }} />
          ))}
        </div>
      )
    },
    {
      title: '视频', dataIndex: 'video', key: 'video',
      render: (video) => video ? <video src={video} width={100} controls /> : null
    },

    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag>
    },
    {
      title: '操作', key: 'action',
      render: (_, note) => (
        <>
          <Button size="small" onClick={() => handleApprove(note)} disabled={note.status !== 'pending'}>通过</Button>
          <Button size="small" danger style={{ marginLeft: 8 }} onClick={() => setRejectModal({ open: true, note })} disabled={note.status !== 'pending'}>拒绝</Button>
          {user.role === 'admin' && (
            <Button size="small" style={{ marginLeft: 8 }} onClick={() => handleDelete(note)} danger>删除</Button>
          )}
        </>
      )
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <button style={{ position: 'absolute', right: 20, top: 20, zIndex: 10 }} onClick={handleLogout}>退出登录</button>
      <h2>游记审核列表</h2>
      <Table rowKey="_id" columns={columns} dataSource={data} loading={loading} />

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
        <p>删除后无法恢复，是否确认删除该游记？</p>
      </Modal>
    </div>
  );
}

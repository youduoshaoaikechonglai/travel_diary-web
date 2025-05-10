import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const users = [
  { label: '审核人员', username: 'reviewer', password: 'review123' },
  { label: '管理员', username: 'admin', password: 'admin123' }
];

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (user) => {
    try {
      const res = await api.post('/admin/login', {
        username: user.username,
        password: user.password
      });
      localStorage.setItem('role', JSON.stringify({ role: res.role }));
      console.log('localStorage:', localStorage.getItem('role'));
      navigate('/review-list');
    } catch {
      alert('登录失败');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h2>后台登录</h2>
      {users.map(u => (
        <button key={u.username} style={{ margin: 20, fontSize: 18 }} onClick={() => handleLogin(u)}>
          {u.label}
        </button>
      ))}
    </div>
  );
} 

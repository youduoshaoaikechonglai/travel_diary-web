import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ReviewList from './pages/ReviewList';

function App() {
  const user = JSON.parse(localStorage.getItem('role') || 'null');

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/review-list"
        element={user ? <ReviewList /> : <Navigate to="/login" />}
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

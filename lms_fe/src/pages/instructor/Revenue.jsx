import React from 'react';

const Revenue = () => (
  <div>
    <h2>Thống Kê Doanh Thu</h2>
    <div className="admin-card">
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
          <h4>Tháng này</h4>
          <h2 style={{ color: '#10b981' }}>15,000,000đ</h2>
        </div>
        <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
          <h4>Tổng doanh thu</h4>
          <h2 style={{ color: '#3b82f6' }}>25,000,000đ</h2>
        </div>
      </div>
      <button className="btn btn-primary">Yêu cầu rút tiền</button>
    </div>
  </div>
);
export default Revenue;

import React from 'react';

const ComingSoon = ({ title }) => (
  <div>
    <h2 style={{ marginBottom: '25px', color: 'var(--text-dark)' }}>{title}</h2>
    <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
      <h3 style={{ color: '#334155', marginBottom: '10px' }}>Chức năng đang được phát triển</h3>
      <p style={{ color: '#64748b' }}>Vui lòng quay lại sau. Đội ngũ kỹ thuật đang hoàn thiện tính năng này.</p>
    </div>
  </div>
);

export default ComingSoon;

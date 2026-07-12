import React from 'react';

const Coupons = () => {
  const coupons = [
    { code: 'GIAM50', discount: '50%', uses: 25, status: 'Active' },
    { code: 'MEMBER20', discount: '20%', uses: 110, status: 'Expired' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Mã Giảm Giá</h2>
        <button className="btn btn-primary">+ Tạo Mã Mới</button>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Mã (Code)</th><th>Mức Giảm</th><th>Lượt Dùng</th><th>Trạng Thái</th></tr></thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 'bold' }}>{c.code}</td><td>{c.discount}</td><td>{c.uses}</td>
                <td style={{ color: c.status === 'Active' ? '#10b981' : '#ef4444' }}>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Coupons;

import React from 'react';

const Orders = () => (
  <div>
    <h2>Quản Lý Đơn Hàng</h2>
    <div className="admin-card">
      <table className="admin-table">
        <thead><tr><th>Mã Đơn</th><th>Khách Hàng</th><th>Khóa Học</th><th>Thanh Toán</th><th>Trạng Thái</th></tr></thead>
        <tbody>
          <tr><td>#ORD-001</td><td>Nguyễn Văn A</td><td>React Native</td><td>500,000đ</td><td style={{color:'#10b981'}}>Hoàn thành</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);
export default Orders;

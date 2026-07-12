import React from 'react';

const AdminCertificates = () => (
  <div>
    <h2>Quản Lý Chứng Chỉ</h2>
    <div className="admin-card">
      <table className="admin-table">
        <thead><tr><th>Học Viên</th><th>Khóa Học</th><th>Mã Chứng Chỉ</th><th>Ngày Cấp</th></tr></thead>
        <tbody>
          <tr><td>Trần Thị B</td><td>NodeJS Master</td><td>CERT-99812</td><td>14/06/2026</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);
export default AdminCertificates;

import React from 'react';

const Students = () => (
  <div>
    <h2>Học Viên Của Tôi</h2>
    <div className="admin-card">
      <table className="admin-table">
        <thead><tr><th>Học Viên</th><th>Khóa Học</th><th>Tiến Độ</th></tr></thead>
        <tbody>
          <tr><td>Nguyễn Văn A</td><td>React Native</td><td>80%</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);
export default Students;

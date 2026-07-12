import React, { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateUser } from '../../utils/lmsApi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    adminGetUsers()
      .then(res => setUsers(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleUpdateRole = async (id, newRole) => {
    if (window.confirm(`Đổi quyền người dùng này thành ${newRole}?`)) {
      try {
        await adminUpdateUser(id, { role: newRole });
        alert('Cập nhật quyền thành công');
        fetchUsers();
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '25px', color: 'var(--text-dark)' }}>Quản Lý Người Dùng</h2>
      
      <div className="admin-card">
        {loading ? <p>Đang tải...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Quyền (Role)</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td style={{ fontWeight: '500' }}>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <select 
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="student">Student</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span style={{ color: user.status === 'active' ? '#10b981' : '#ef4444' }}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444', borderColor: '#ef4444' }}>
                      Khóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

import 'react-datepicker/dist/react-datepicker.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { format } from 'date-fns';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

const PendingUsersTable = ({ isAdmin }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});
  const [updatingRole, setUpdatingRole] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      const requesterId = localStorage.getItem('userId');
      if (!requesterId) {
        setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      let startDate = new Date(); // Thời gian hiện tại
      let endDate = new Date(); // Thời gian hiện tại

      // Cập nhật startDate và endDate tùy theo lựa chọn khoảng thời gian
      switch (selectedTimeFrame) {
        case '1_week':
          // Lấy ngày bắt đầu của 1 tuần trước
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '1_month':
          // Lấy ngày bắt đầu của 1 tháng trước
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'custom':
          // Dùng startDate và endDate tùy chỉnh nếu có
          startDate = customStartDate || startDate;
          endDate = customEndDate || endDate;
          break;
        default:
          // Mặc định: hôm nay
          startDate.setHours(0, 0, 0, 0); // Set startDate về 12h đêm của hôm nay
          break;
      }

      // Định dạng thời gian để truyền vào API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd HH:mm:ss');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd HH:mm:ss');

      console.log('Fetching users between:', formattedStartDate, 'and', formattedEndDate);

      try {
        const response = await axios.get('https://www.system.crmkhitam.com/api/v1/admin/users/pending-approval', {
          params: {
            requesterId,
            startDate: formattedStartDate,
            endDate: formattedEndDate
          }
        });

        setPendingUsers(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy dữ liệu người dùng.');
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [selectedTimeFrame, customStartDate, customEndDate]);

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const saveRole = async (userId) => {
    setUpdatingRole(true);

    const requesterId = '677dfbbe6c669132bb775947'; // Static value for the requester
    const role = selectedRoles[userId];

    try {
      await axios.patch(`https://www.system.crmkhitam.com/api/v1/admin/users/${userId}/edit-role-manager`, {
        role,
        requesterId
      });
      alert('Cập nhật vai trò thành công.');

      const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/admin/users/pending-approval?requesterId=${requesterId}`);
      setPendingUsers(response.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật vai trò.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleApproval = async (userId) => {
    const requesterId = '677dfbbe6c669132bb775947';

    try {
      const response = await axios.patch(`https://www.system.crmkhitam.com/api/v1/admin/users/${userId}/approve`, { requesterId });

      alert('Người dùng đã được xác nhận thành công.');

      const refreshResponse = await axios.get(
        `https://www.system.crmkhitam.com/api/v1/admin/users/pending-approval?requesterId=${requesterId}`
      );
      setPendingUsers(refreshResponse.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xác nhận người dùng.');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center my-4">
        {error}
      </Alert>
    );
  }

  const getBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success text-light';
      case 'pending approval':
        return 'bg-warning text-dark';
      case 'suspended':
        return 'bg-danger text-light';
      default:
        return 'bg-secondary text-light';
    }
  };

  return (
    <div>
      {/* Dropdown to select the time frame */}
      <Form.Group className="mb-2" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <Form.Label style={{ marginBottom: '5px' }}>Chọn khoảng thời gian</Form.Label>
        <Form.Select
          value={selectedTimeFrame}
          onChange={(e) => setSelectedTimeFrame(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '4px',
            width: '200px' // Adjust the width as needed
          }}
        >
          <option value="today">Hôm nay</option>
          <option value="1_week">1 Tuần</option>
          <option value="1_month">1 Tháng</option>
          <option value="custom">Tùy chỉnh</option>
        </Form.Select>
      </Form.Group>

      {/* Custom date range selector */}
      {selectedTimeFrame === 'custom' && (
        <div>
          <Form.Group className="mb-3">
            <Form.Label>Chọn ngày bắt đầu</Form.Label>
            <DatePicker
              selected={customStartDate}
              onChange={(date) => setCustomStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Chọn ngày kết thúc</Form.Label>
            <DatePicker
              selected={customEndDate}
              onChange={(date) => setCustomEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </Form.Group>
        </div>
      )}

      <Table striped bordered hover style={{ fontSize: '10px', textAlign: 'center', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã nhân viên</th>
            <th>Thông Tin Người Dùng</th>
            <th>Ngày Sinh</th>
            <th>Thông Tin Địa Chỉ</th>
            <th>Role </th>
            <th>Chọn role </th>
            <th>Team</th>
            <th>Trạng thái</th>
            <th>Thời Gian Cập Nhật</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.employeeCode || 'Không có'}</td>
              <td>
                <strong>Tên:</strong> {user.firstname} {user.lastname} <br />
                <strong>Email:</strong> {user.email} <br />
                <strong>Số điện thoại:</strong> {user.profileDetails?.phone || 'Không có'}
              </td>
              <td>{user.profileDetails?.dateOfBirth ? format(new Date(user.profileDetails.dateOfBirth), 'dd/MM/yyyy') : 'Không có'}</td>
              <td>
                <span style={{ display: 'block', marginBottom: '5px' }}>{user.profileDetails?.address || 'Không có'}</span>
                <span style={{ display: 'block', marginBottom: '5px' }}>{user.province || 'Không có'}</span>
                <span style={{ display: 'block' }}>{user.region || 'Không có'}</span>
              </td>
              <td>
                <div>
                  <span>{user.role?.name || 'Không có'}</span>
                  {user.status === 'pending approval' && user.employeeCode && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproval(user._id)}
                      style={{
                        fontSize: '12px',
                        padding: '5px 10px',
                        marginTop: '5px',
                        display: 'block',
                        marginLeft: '30px'
                      }}
                    >
                      Xác nhận
                    </Button>
                  )}
                </div>
              </td>
              <td>
                <Form.Select
                  value={selectedRoles[user._id] || user.role?._id || ''}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  style={{
                    fontSize: '12px',
                    padding: '5px',
                    height: '30px'
                  }}
                >
                  <option value="">Chọn vai trò</option>
                  <option value="6757ea333ccb112baecbe263">KTT Sale Team Leader</option>
                </Form.Select>
              </td>
              <td>
                <span>{user.teamName || 'Không có'}</span>
              </td>
              <td>
                <span
                  className={`badge ${getBadgeClass(user.status)}`}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '12px'
                  }}
                >
                  {user.status}
                </span>
              </td>
              <td>{user.updatedAt ? format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm:ss') : 'Không có'}</td>
              <td>
                {user.status !== 'active' && (
                  <Button
                    onClick={() => saveRole(user._id)}
                    disabled={updatingRole}
                    style={{
                      fontSize: '12px',
                      padding: '5px 10px'
                    }}
                  >
                    {updatingRole ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PendingUsersTable;

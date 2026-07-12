import React, { useState } from 'react';

import axios from 'axios';
import { Alert, Button, Form, Modal, Table } from 'react-bootstrap';

const UserSearch = () => {
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ email: '', phone: '' });
  const [searchError, setSearchError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ role: '', managedBy: '' });
  const [actionMessage, setActionMessage] = useState('');
  const [noResults, setNoResults] = useState(false); // Theo dõi khi không có kết quả

  const handleSearch = async () => {
    const requesterId = localStorage.getItem('userId');
    if (!searchQuery.email && !searchQuery.phone) {
      setSearchError('Vui lòng nhập ít nhất email hoặc số điện thoại để tìm kiếm.');
      return;
    }

    setSearchError('');
    setNoResults(false); // Reset trạng thái khi bắt đầu tìm kiếm
    try {
      const response = await axios.get(
        `https://www.system.crmkhitam.com/api/v1/admin/users/search?requesterId=${requesterId}&email=${searchQuery.email}&phone=${searchQuery.phone}`
      );
      const users = response.data.data;
      setSearchedUsers(users);
      if (users.length === 0) {
        setNoResults(true); // Hiển thị thông báo nếu không có kết quả
      }
      setSearchQuery({ email: '', phone: '' });
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Không thể tìm kiếm người dùng.');
    }
  };

  const handleOpenModal = (user) => {
    const requesterId = localStorage.getItem('userId');
    setSelectedUser(user);
    setFormData({
      role: user.role?._id || '',
      managedBy: user.managedBy || requesterId
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ role: '', managedBy: '' });
  };

  const handleEditRole = async () => {
    if (!selectedUser) return;

    const requesterId = localStorage.getItem('userId');

    try {
      const response = await axios.patch(`https://www.system.crmkhitam.com/api/v1/admin/users/${selectedUser._id}/edit-role-manager`, {
        role: formData.role,
        managedBy: formData.managedBy,
        requesterId
      });
      setActionMessage('Vai trò đã được cập nhật thành công.');
      handleCloseModal();
      handleSearch(); // Cập nhật danh sách người dùng sau chỉnh sửa
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Không thể cập nhật vai trò.');
    }
  };

  return (
    <div>
      <h4>Tìm kiếm người dùng</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Control
            type="email"
            placeholder="Email"
            value={searchQuery.email}
            onChange={(e) => setSearchQuery({ ...searchQuery, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Số điện thoại"
            value={searchQuery.phone}
            onChange={(e) => setSearchQuery({ ...searchQuery, phone: e.target.value })}
          />
        </Form.Group>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
      </Form>
      {searchError && (
        <Alert variant="danger" className="mt-3">
          {searchError}
        </Alert>
      )}
      {actionMessage && (
        <Alert variant="success" className="mt-3">
          {actionMessage}
        </Alert>
      )}
      {noResults && (
        <Alert variant="warning" className="mt-3">
          Không tìm thấy kết quả nào phù hợp với từ khóa tìm kiếm.
        </Alert>
      )}
      {searchedUsers.length > 0 && (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã nhân viên</th>
              <th>Thông Tin Người Dùng</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {searchedUsers.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.employeeCode || 'Không có'}</td>
                <td>
                  <strong>Tên:</strong> {user.firstname} {user.lastname} <br />
                  <strong>Email:</strong> {user.email} <br />
                  <strong>Số điện thoại:</strong> {user.profileDetails?.phone || 'Không có'}
                </td>
                <td>{user.role?.name || 'Không có'}</td>
                <td>
                  <Button variant="primary" onClick={() => handleOpenModal(user)} style={{ fontSize: '12px', padding: '5px 10px' }}>
                    Chỉnh sửa vai trò
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {selectedUser && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa vai trò</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Vai trò</Form.Label>
                <Form.Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="">Chọn vai trò</option>
                  <option value="6757ea333ccb112baecbe266">KTT User</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Đóng
            </Button>
            <Button variant="primary" onClick={handleEditRole}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default UserSearch;

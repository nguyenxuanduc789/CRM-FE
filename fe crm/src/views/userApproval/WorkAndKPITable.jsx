import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';

const WorkAndKPITable = () => {
  const [data, setData] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [kpiModal, setKPIModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [kpiData, setKPIData] = useState({
    target: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    setUserRole(role);

    if (!userId || !role) {
      setError('User ID hoặc Role không tồn tại trong localStorage.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/kpi/managed?user_id=${userId}`);
        setData(response.data.data || []); // Đảm bảo `data` luôn là mảng
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy dữ liệu.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowTeamDetails = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const handleOpenKPIModal = (user) => {
    setSelectedUser(user);
    setKPIModal(true);
  };

  const handleCloseKPIModal = () => {
    setKPIModal(false);
    setSelectedUser(null);
    setKPIData({ target: '', startDate: '', endDate: '' });
  };

  const handleKPIChange = (e) => {
    const { name, value } = e.target;
    setKPIData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateKPI = async () => {
    const { target, startDate, endDate } = kpiData;

    // Kiểm tra tính hợp lệ của các trường
    if (!target || !startDate || !endDate) {
      alert('Vui lòng nhập đầy đủ thông tin: Mục tiêu, Ngày bắt đầu và Ngày kết thúc.');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!selectedUser || !userId) {
        alert('Không có thông tin người giao KPI hoặc người nhận KPI.');
        return;
      }

      // Gọi API để tạo KPI
      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/kpi/kpi', {
        user: selectedUser.id,
        assignedBy: userId,
        target: parseFloat(target),
        startDate,
        endDate
      });

      alert(response.data.message); // Hiển thị thông báo thành công

      handleCloseKPIModal(); // Đóng modal tạo KPI

      // Gọi lại API để lấy dữ liệu mới
      setLoading(true); // Hiển thị spinner trong khi tải lại dữ liệu
      const newData = await axios.get(`https://www.system.crmkhitam.com/api/v1/kpi/managed?user_id=${userId}`);
      setData(newData.data.data || []); // Cập nhật dữ liệu mới
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi tạo KPI.');
    } finally {
      setLoading(false); // Tắt spinner sau khi hoàn tất
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  const handleUpdatePartnershipStatus = async (teamId, currentStatus) => {
    try {
      const newStatus = !currentStatus; // Toggle the status

      // Send PUT request to update partnership status
      const response = await axios.put(`https://www.system.crmkhitam.com/api/v1/admin/team/${teamId}/partnership`, {
        isPartnership: newStatus
      });

      alert(response.data.message); // Show success message
      // Optionally, re-fetch the data to update the table
      setLoading(true);
      const newData = await axios.get(`https://www.system.crmkhitam.com/api/v1/kpi/managed?user_id=${localStorage.getItem('userId')}`);
      setData(newData.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái đối tác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Nếu là Admin hoặc Sale Manager, hiển thị danh sách các nhóm */}
      {(userRole === 'Admin' || userRole === 'KTT Sale Manager') && data && (
        <div>
          <h4>Danh sách các nhóm</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Nhóm</th>
                <th>Leader</th>
                <th>Số lượng thành viên</th>
                <th>KPI (Mục tiêu / Thực tế / Thời gian)</th>
                <th>Trạng thái KPI</th>
                <th>Đối tác kinh doanh</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.map((team, index) => {
                const lastKPI = team.kpis?.[team.kpis.length - 1] || null;

                return (
                  <tr key={team.teamName}>
                    <td>{index + 1}</td>
                    <td>{team.teamName}</td>
                    <td>{team.leader?.name || 'Không rõ'}</td>
                    <td style={{ cursor: 'pointer', color: 'blue' }} onClick={() => handleShowTeamDetails(team)}>
                      {team.users?.length || 0}
                    </td>
                    <td>
                      {lastKPI ? (
                        <>
                          <strong>Mục tiêu:</strong> {lastKPI.target.toLocaleString()} <br />
                          <strong>Thực tế:</strong> {lastKPI.actual.toLocaleString()} <br />
                          <strong>Thời gian:</strong> {new Date(lastKPI.startDate).toLocaleDateString()} -{' '}
                          {new Date(lastKPI.endDate).toLocaleDateString()}
                        </>
                      ) : (
                        'Chưa có KPI'
                      )}
                    </td>

                    <td>{lastKPI ? lastKPI.status : 'Chưa có KPI'}</td>
                    {userRole === 'KTT Sale Manager' && (
                      <td>
                        <Button variant="primary" size="sm" onClick={() => handleOpenKPIModal(team.leader)}>
                          Tạo KPI
                        </Button>
                      </td>
                    )}
                    <td>
                      <Button
                        variant={team.isPartnership ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => handleUpdatePartnershipStatus(team.id, team.isPartnership)}
                      >
                        {team.isPartnership ? 'Hủy đối tác' : 'Thiết lập đối tác'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Nếu là Sale Team Leader, hiển thị thông tin nhóm của mình */}
      {userRole === 'KTT Sale Team Leader' && data && (
        <div>
          <h4>Thông tin nhóm</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Thành Viên</th>
                <th>Email</th>
                <th>KPI (Mục tiêu / Thực tế / Thời gian)</th>
                <th>Trạng thái KPI</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.users?.map((user, index) => {
                const userKPI = data.kpis?.find((kpi) => kpi.userId === user.id) || {};
                return (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {userKPI.target ? (
                        <>
                          <strong>Mục tiêu:</strong> {userKPI.target.toLocaleString()} <br />
                          <strong>Thực tế:</strong> {userKPI.actual.toLocaleString()} <br />
                          <strong>Thời gian:</strong> {new Date(userKPI.startDate).toLocaleDateString()} -{' '}
                          {new Date(userKPI.endDate).toLocaleDateString()}
                        </>
                      ) : (
                        'Chưa có KPI'
                      )}
                    </td>
                    <td>{userKPI.status || 'Chưa có KPI'}</td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => handleOpenKPIModal(user)}>
                        Tạo KPI
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal để hiển thị thành viên của nhóm */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg" // Tăng kích thước modal
        centered // Căn giữa modal
        style={{
          maxWidth: '80%', // Tăng chiều rộng modal
          margin: 'auto' // Căn giữa
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Thành viên trong nhóm</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '500px', // Giới hạn chiều cao body
            overflowY: 'auto' // Cuộn dọc nếu nội dung vượt quá
          }}
        >
          {selectedTeam ? (
            <Table
              striped
              bordered
              hover
              style={{
                fontSize: '14px', // Kích thước chữ
                textAlign: 'center' // Căn giữa nội dung
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      backgroundColor: '#f8f9fa', // Màu nền tiêu đề
                      fontWeight: 'bold', // Chữ đậm
                      verticalAlign: 'middle', // Căn giữa dọc
                      whiteSpace: 'nowrap' // Giữ chữ trong một dòng
                    }}
                  >
                    STT
                  </th>
                  <th
                    style={{
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Tên Thành Viên
                  </th>
                  <th
                    style={{
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      verticalAlign: 'middle',
                      maxWidth: '250px', // Giới hạn chiều rộng cột email
                      wordBreak: 'break-word', // Xuống dòng nếu email dài
                      textOverflow: 'ellipsis', // Cắt ngang nếu quá dài
                      overflow: 'hidden'
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      verticalAlign: 'middle'
                    }}
                  >
                    KPI (Mục tiêu / Thực tế / Thời gian)
                  </th>
                  <th
                    style={{
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      verticalAlign: 'middle'
                    }}
                  >
                    Trạng thái KPI
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedTeam.users?.map((user, index) => {
                  const userKPI = selectedTeam.kpis?.find((kpi) => kpi.userId === user.id) || {};
                  return (
                    <tr key={user.id}>
                      <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{index + 1}</td>
                      <td style={{ verticalAlign: 'middle' }}>{user.name}</td>
                      <td
                        style={{
                          verticalAlign: 'middle',
                          maxWidth: '250px', // Giới hạn chiều rộng cột email
                          wordBreak: 'break-word', // Xuống dòng nếu cần
                          textOverflow: 'ellipsis', // Cắt chữ nếu quá dài
                          overflow: 'hidden'
                        }}
                      >
                        {user.email}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        {userKPI.target ? (
                          <>
                            <strong>Mục tiêu:</strong> {userKPI.target.toLocaleString()} <br />
                            <strong>Thực tế:</strong> {userKPI.actual.toLocaleString()} <br />
                            <strong>Thời gian:</strong> {new Date(userKPI.startDate).toLocaleDateString()} -{' '}
                            {new Date(userKPI.endDate).toLocaleDateString()}
                          </>
                        ) : (
                          'Chưa có KPI'
                        )}
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>{userKPI.status || 'Chưa có KPI'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal để tạo KPI */}
      <Modal show={kpiModal} onHide={handleCloseKPIModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo KPI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mục tiêu</Form.Label>
              <Form.Control
                type="text"
                name="target"
                required
                value={
                  kpiData.target
                    ? Number(kpiData.target).toLocaleString('en-US') // Format số có dấu phẩy
                    : ''
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, ''); // Loại bỏ dấu phẩy để xử lý
                  if (!isNaN(rawValue)) {
                    setKPIData((prev) => ({
                      ...prev,
                      target: rawValue // Lưu giá trị thô không có dấu phẩy
                    }));
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày bắt đầu</Form.Label>
              <Form.Control type="date" name="startDate" required value={kpiData.startDate} onChange={handleKPIChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày kết thúc</Form.Label>
              <Form.Control type="date" name="endDate" required value={kpiData.endDate} onChange={handleKPIChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseKPIModal}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleCreateKPI}>
            Tạo KPI
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WorkAndKPITable;

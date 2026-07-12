import React, { useState } from 'react';
import axios from 'axios';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';

const Reportcontact = ({ customers, loading, onSearch }) => {
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const detailStyle = {
    padding: '5px',
    backgroundColor: '#fff',
    borderRadius: '4px'
  };

  const openNoteModal = (customer) => {
    setSelectedCustomer(customer);
    setSelectedNote(customer.notes || 'Không có ghi chú');
    setNewNote('');
    setIsNoteModalVisible(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalVisible(false);
    setSelectedCustomer(null);
    setSelectedNote('');
    setNewNote('');
  };

  const toggleRow = (customerId) => {
    setExpandedRow(expandedRow === customerId ? null : customerId);
  };

  const handleNoteChange = (e) => {
    setNewNote(e.target.value);
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Người dùng chưa đăng nhập.');
        return;
      }

      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/customer/add-note', {
        profileCode: selectedCustomer.profileCode,
        content: newNote,
        userId
      });

      alert(response.data.message);
      setSelectedNote(newNote);
      setNewNote('');
    } catch (error) {
      console.error('Lỗi khi thêm ghi chú:', error);
      alert('Lỗi khi thêm ghi chú.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      onSearch([]); // Reset danh sách nếu không có từ khóa tìm kiếm
      return;
    }

    setSearchLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Người dùng chưa đăng nhập.');
        setSearchLoading(false);
        return;
      }

      const response = await axios.get('https://www.system.crmkhitam.com/api/v1/contact/suggest-contacts', {
        params: {
          user_id: userId,
          search: searchQuery
        }
      });

      onSearch(response.data.contacts || []);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm khách hàng:', error);
      alert('Lỗi khi tìm kiếm khách hàng.');
      onSearch([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Danh sách khách hàng</Card.Title>
              <Form onSubmit={handleSearch} className="mt-3">
                <Form.Group controlId="formSearch">
                  <Form.Control
                    type="text"
                    placeholder="Nhập email hoặc số điện thoại để tìm kiếm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '300px', display: 'inline-block', marginRight: '10px' }}
                  />
                  <Button variant="primary" type="submit" disabled={searchLoading}>
                    {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                  </Button>
                </Form.Group>
              </Form>
            </Card.Header>
            <Card.Body>
              {loading || searchLoading ? (
                <Spinner animation="border" variant="primary" />
              ) : !customers || !Array.isArray(customers) || customers.length === 0 ? (
                <Table striped responsive>
                  <tbody>
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Mã Hồ Sơ</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Người tạo & Affiliate</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Thông Tin Khách Hàng</th>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Ngày sinh</th>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Interaction Level</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Note</th>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <React.Fragment key={customer._id}>
                        <tr onClick={() => toggleRow(customer._id)} style={{ cursor: 'pointer' }}>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                            {customer.profileCode || 'Không có mã'} <span>{expandedRow === customer._id ? '▼' : '▶'}</span>
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>
                            {customer.assignedTo ? (
                              <>
                                {`${customer.assignedTo.lastname || ''} ${customer.assignedTo.firstname || ''}`} -
                                {(() => {
                                  let roleName = 'Chưa phân công vai trò';
                                  let roleColor = 'black';

                                  if (customer.assignedTo.role) {
                                    switch (customer.assignedTo.role) {
                                      case '6757ea323ccb112baecbe25c':
                                        roleName = 'Admin';
                                        roleColor = 'red';
                                        break;
                                      case '6757ea333ccb112baecbe260':
                                        roleName = 'KTT Sale Manager';
                                        roleColor = 'blue';
                                        break;
                                      case '6757ea333ccb112baecbe263':
                                        roleName = 'KTT Sale Team Leader';
                                        roleColor = 'green';
                                        break;
                                      case '6757ea333ccb112baecbe266':
                                        roleName = 'KTT User';
                                        roleColor = 'gray';
                                        break;
                                      case '69df101f29f96a3dbd215a19':
                                        roleName = 'KTT Partner';
                                        roleColor = 'purple'; // 🟣 Partner (đối tác ngoài)
                                        break;
                                      default:
                                        roleName = 'Chưa phân công vai trò';
                                        roleColor = 'black';
                                        break;
                                    }
                                  }

                                  return <span style={{ color: roleColor }}>{roleName}</span>;
                                })()}
                                <br />
                                {customer.affiliate_id && customer.affiliate_name ? (
                                  <span style={{ color: '#007bff', fontSize: '0.9em' }}>
                                    Affiliate: {customer.affiliate_id} - {customer.affiliate_name}
                                  </span>
                                ) : (
                                  <span style={{ color: '#6c757d', fontSize: '0.9em' }}></span>
                                )}
                              </>
                            ) : (
                              <>
                                Chưa phân công
                                <br />
                                <span style={{ color: '#6c757d', fontSize: '0.9em' }}>Không có thông tin Affiliate</span>
                              </>
                            )}
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>
                            <strong>{customer.name || 'Không có tên'}</strong>
                            <br />
                            <span>{customer.email || 'Không có email'}</span>
                            <br />
                            <span>{customer.phone || 'Không có số điện thoại'}</span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                            {customer.birthDate && !isNaN(new Date(customer.birthDate))
                              ? new Date(customer.birthDate).toLocaleDateString('vi-VN')
                              : 'Không có ngày sinh'}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                            {customer.interactionLevel || 'Không xác định'}
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>
                            <Button
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openNoteModal(customer);
                              }}
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Xem Ghi Chú
                            </Button>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                            {customer.createdAt && !isNaN(new Date(customer.createdAt))
                              ? new Date(customer.createdAt).toLocaleDateString('vi-VN')
                              : 'Không có ngày tạo'}
                          </td>
                        </tr>
                        {expandedRow === customer._id && (
                          <tr>
                            <td colSpan="7" style={{ backgroundColor: '#f8f9fa', padding: '20px', borderTop: '2px solid #dee2e6' }}>
                              <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '1em' }}>
                                Chi tiết khách hàng: {customer.profileCode || 'Không có mã'}
                              </div>
                              <Row style={{ fontSize: '0.85em', gap: '10px' }}>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Tên:</strong>
                                  <div style={detailStyle}>{customer.name || 'Không có tên'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Email:</strong>
                                  <div style={detailStyle}>{customer.email || 'Không có email'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Số điện thoại:</strong>
                                  <div style={detailStyle}>{customer.phone || 'Không có số điện thoại'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Thành phố:</strong>
                                  <div style={detailStyle}>{customer.city || 'Không có thông tin'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Quốc gia:</strong>
                                  <div style={detailStyle}>{customer.country || 'Không có thông tin'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Interaction Level:</strong>
                                  <div style={detailStyle}>{customer.interactionLevel || 'Không xác định'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Trạng thái:</strong>
                                  <div style={detailStyle}>{customer.status || 'Không xác định'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Ghi chú:</strong>
                                  <div style={detailStyle}>{customer.notes || 'Không có ghi chú'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Affiliate ID:</strong>
                                  <div style={detailStyle}>{customer.affiliate_id || 'Không có'}</div>
                                </Col>
                                <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                  <strong style={{ color: '#007bff' }}>Affiliate Name:</strong>
                                  <div style={detailStyle}>{customer.affiliate_name || 'Không có'}</div>
                                </Col>
                              </Row>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}

              <Modal show={isNoteModalVisible} onHide={closeNoteModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Ghi Chú Khách Hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    <strong>Khách Hàng:</strong> {selectedCustomer?.name || 'Không có tên'}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedCustomer?.email || 'Không có email'}
                  </p>
                  <p>
                    <strong>Affiliate ID:</strong> {selectedCustomer?.affiliate_id || 'Không có'}
                  </p>
                  <p>
                    <strong>Affiliate Name:</strong> {selectedCustomer?.affiliate_name || 'Không có'}
                  </p>
                  <p>
                    <strong>Ghi Chú:</strong> {selectedNote}
                  </p>
                  <Form.Group controlId="formNewNote">
                    <Form.Label>Thêm ghi chú mới</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Nhập nội dung ghi chú" value={newNote} onChange={handleNoteChange} />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={closeNoteModal} style={{ fontSize: '12px' }}>
                    Đóng
                  </Button>
                  <Button variant="primary" onClick={addNote} disabled={isSubmitting || !newNote.trim()} style={{ fontSize: '12px' }}>
                    {isSubmitting ? 'Đang gửi...' : 'Thêm Ghi Chú'}
                  </Button>
                </Modal.Footer>
              </Modal>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Reportcontact;

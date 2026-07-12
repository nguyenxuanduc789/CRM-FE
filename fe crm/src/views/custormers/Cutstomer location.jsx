import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';

const CustomerLocation = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTable, setActiveTable] = useState('orders'); // State để theo dõi bảng đang hiển thị
  const [showModal, setShowModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    // Lấy userId từ localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('userId không tồn tại trong localStorage!');
      return;
    }

    // Gọi API với userId
    fetch(`https://www.system.crmkhitam.com/api/v1/pineline/getpinelinerole?user_id=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.pipelines || []); // Lưu mảng `pipelines` vào state
        setLoading(false); // Tắt trạng thái loading
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [activeTable]);
  useEffect(() => {
    // Lấy user_id từ localStorage
    const userId = localStorage.getItem('userId');

    if (!userId) {
      //console.log('User ID không tìm thấy trong localStorage');
      setLoading(false); // Đánh dấu đã hoàn thành việc tải dù không có user_id
      return;
    }

    // Thực hiện gọi API với user_id từ localStorage
    fetch(`https://www.system.crmkhitam.com/api/v1/contact/contacts?user_id=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data.contacts || []); // Cập nhật dữ liệu khách hàng
        setLoading(false); // Đánh dấu đã hoàn thành việc tải
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu khách hàng:', error);
        setLoading(false); // Đánh dấu đã hoàn thành việc tải khi có lỗi
      });
  }, []);

  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrderCode, setActiveOrderCode] = useState(null);
  const handleNoteChange = (e) => {
    setNote(e.target.value); // Update note state on input change
  };

  const addNoteToPipeline = async (orderCode) => {
    if (!note.trim()) return; // Don't proceed if no note is entered

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId'); // Get userId from localStorage
      if (!userId) {
        alert('User not logged in.');
        return; // Exit if userId is not found in localStorage
      }

      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/add-note', {
        orderCode: activeOrder.orderCode,
        content: note,
        userId
      });
      alert(response.data.message); // Show success message
      setNote(''); // Clear the input field
      setActiveOrderCode(null); // Reset active order after submission
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi thêm ghi chú.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleShowNotes = (order) => {
    setActiveOrder(order); // Set đơn hàng hiện tại
    setNote(''); // Reset ghi chú
    setShowModal(true); // Hiển thị modal
  };

  // To handle the selection of an order
  const handleSelectOrder = (orderCode, currentNote) => {
    setActiveOrderCode(orderCode); // Set the active order
    setNote(currentNote || ''); // Pre-fill note with existing content (if any)
  };
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false); // Đổi tên state modal
  const [selectedNote, setSelectedNote] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const openNoteModal = (customer) => {
    setSelectedCustomer(customer); // Lưu thông tin khách hàng
    setSelectedNote(customer.notes || 'Không có ghi chú'); // Lưu ghi chú hoặc hiển thị mặc định
    setIsNoteModalVisible(true); // Hiển thị modal
  };

  const closeNoteModal = () => {
    setIsNoteModalVisible(false); // Đóng modal
    setSelectedCustomer(null); // Reset khách hàng được chọn
    setSelectedNote(''); // Reset ghi chú
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Danh sách khách hàng</Card.Title>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <span
                  onClick={() => setActiveTable('orders')}
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTable === 'orders' ? 'bold' : 'normal',
                    textDecoration: activeTable === 'orders' ? 'underline' : 'none',
                    color: activeTable === 'orders' ? '#007bff' : '#6c757d'
                  }}
                >
                  Danh sách khách hàng của Nhóm
                </span>
                <span
                  onClick={() => setActiveTable('paid')}
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTable === 'paid' ? 'bold' : 'normal',
                    textDecoration: activeTable === 'paid' ? 'underline' : 'none',
                    color: activeTable === 'paid' ? '#007bff' : '#6c757d'
                  }}
                >
                  Danh sách đơn hàng đang xử lý
                </span>
                <span
                  onClick={() => setActiveTable('installments')}
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTable === 'installments' ? 'bold' : 'normal',
                    textDecoration: activeTable === 'installments' ? 'underline' : 'none',
                    color: activeTable === 'installments' ? '#007bff' : '#6c757d'
                  }}
                >
                  Danh sách đơn hàng thành công
                </span>
                <span
                  onClick={() => setActiveTable('cancelled')}
                  style={{
                    cursor: 'pointer',
                    fontWeight: activeTable === 'cancelled' ? 'bold' : 'normal',
                    textDecoration: activeTable === 'cancelled' ? 'underline' : 'none',
                    color: activeTable === 'cancelled' ? '#007bff' : '#6c757d'
                  }}
                >
                  Danh sách đơn hàng đã hủy
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                // Hiển thị Spinner khi dữ liệu đang được tải
                <Spinner animation="border" variant="primary" />
              ) : activeTable === 'orders' ? (
                // Bảng khách hàng
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Mã Hồ Sơ</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Người tạo</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Thông Tin Khách Hàng</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Ngày sinh</th>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Interaction Level</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Note</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Thành phố</th>
                      <th style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>Quốc gia</th>
                      <th style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>Ngày tạo</th>
                      <th style={{ textAlign: 'right', fontSize: '12px', padding: '5px' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer, index) => (
                        <tr key={customer._id}>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>{customer.profileCode}</td>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>
                            {customer.assignedTo ? (
                              <>
                                {`${customer.assignedTo.lastname} ${customer.assignedTo.firstname}`} -
                                {(() => {
                                  let roleName;
                                  let roleColor;

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

                                  return <span style={{ color: roleColor }}>{roleName}</span>;
                                })()}
                              </>
                            ) : (
                              'Chưa phân công'
                            )}
                          </td>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>
                            <strong>{customer.name}</strong>
                            <br />
                            <span>{customer.email}</span>
                            <br />
                            <span>{customer.phone}</span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                            {new Date(customer.birthDate).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>{customer.interactionLevel}</td>
                          <Button
                            variant="primary"
                            onClick={() => openNoteModal(customer)} // Gọi hàm mới
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            Xem Ghi Chú
                          </Button>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>{customer.city}</td>
                          <td style={{ textAlign: 'left', fontSize: '12px', padding: '5px' }}>{customer.country}</td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>{customer.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <Modal show={isNoteModalVisible} onHide={closeNoteModal}>
                    <Modal.Header closeButton>
                      <Modal.Title>Ghi Chú Khách Hàng</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <p>
                        <strong>Khách Hàng:</strong> {selectedCustomer?.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedCustomer?.email}
                      </p>
                      <p>
                        <strong>Ghi Chú:</strong> {selectedNote}
                      </p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={closeNoteModal} style={{ fontSize: '12px' }}>
                        Đóng
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </Table>
              ) : activeTable === 'installments' ? (
                // Bảng trả góp (installments)
                <Table striped bordered hover style={{ width: '100%', fontSize: '0.75em', tableLayout: 'auto' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Mã Đơn Hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Người tạo</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Thông tin khách hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Sản phẩm và dịch vụ</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Khóa</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ghi chú</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Giai đoạn</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng Tiền Thực tế </th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng Tiền</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Hình ảnh</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Trạng thái</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ngày Đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((order) => order.status === 'Completed') // Lọc trạng thái Completed
                      .map((order) => (
                        <tr key={order._id}>
                          {/* Mã Đơn Hàng */}
                          <td>{order.orderCode || 'Không có mã'}</td>

                          {/* Người tạo */}
                          <td>
                            {order.createdBy?.lastname || ''} {order.createdBy?.firstname || ''} -{' '}
                            <span>{order.createdBy?.role?.name || 'Không có vai trò'}</span>
                          </td>

                          {/* Thông tin khách hàng */}
                          <td>
                            {order.contact?.name || 'Không có tên'}
                            <br />
                            {order.contact?.email || 'Không có email'}
                          </td>

                          {/* Sản phẩm và dịch vụ */}
                          <td>
                            {order.products?.length > 0
                              ? order.products.map((product) => (
                                  <div key={product._id}>
                                    {product.name} - {product.price.toLocaleString('vi-VN')} VND
                                  </div>
                                ))
                              : 'Không có sản phẩm'}
                          </td>
                          <td>
                            {order.K?.length > 0
                              ? order.K.map((kValue, index) => (
                                  <div key={index}>Khóa: {kValue.value}</div> // Thêm chữ "Khóa" đằng trước giá trị
                                ))
                              : 'Không có giá trị K'}
                          </td>
                          {/* Ghi chú */}
                          <td>
                            <Button
                              variant="primary"
                              onClick={() => handleShowNotes(order)}
                              style={{ padding: '2px 6px', fontSize: '0.75em' }}
                            >
                              Xem/Ghi Chú
                            </Button>
                          </td>

                          {/* Giai đoạn */}
                          <td>{order.stage || 'Không xác định'}</td>

                          {/* Tổng Tiền */}
                          <td>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: '1em',
                                textDecoration: 'underline'
                              }}
                            >
                              {order.amountTotal?.toLocaleString('vi-VN') || '0'} VND
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: '1em',
                                textDecoration: 'underline'
                              }}
                            >
                              {order.totalAmount?.toLocaleString('vi-VN') || '0'} VND
                            </span>
                          </td>

                          {/* Hình ảnh */}
                          <td>
                            {order.images && order.images.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                {order.images.map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => window.open(`https://www.system.crmkhitam.com${img.url}`, '_blank')}
                                    style={{
                                      backgroundColor: '#007bff',
                                      color: 'white',
                                      border: 'none',
                                      padding: '3px 6px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.7em'
                                    }}
                                  >
                                    Ảnh {idx + 1}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'red', fontStyle: 'italic' }}>Không có ảnh</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td>{order.status || 'Không xác định'}</td>

                          {/* Ngày Đặt */}
                          <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : activeTable === 'cancelled' ? (
                // Bảng trả góp (installments)
                <Table striped bordered hover style={{ width: '100%', fontSize: '0.75em', tableLayout: 'auto' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Mã Đơn Hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Người tạo</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Thông tin khách hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Sản phẩm và dịch vụ</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Khóa</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ghi chú</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Giai đoạn</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng Tiền Thực tế </th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng Tiền</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Hình ảnh</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Trạng thái</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ngày Đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((order) => order.status === 'Cancelled') // Filter for Cancelled orders
                      .map((order) => (
                        <tr key={order._id}>
                          {/* Mã Đơn Hàng */}
                          <td>{order.orderCode || 'Không có mã'}</td>

                          {/* Người tạo */}
                          <td>
                            {order.createdBy?.lastname || ''} {order.createdBy?.firstname || ''} -{' '}
                            <span>{order.createdBy?.role?.name || 'Không có vai trò'}</span>
                          </td>

                          {/* Thông tin khách hàng */}
                          <td>
                            {order.contact?.name || 'Không có tên'}
                            <br />
                            {order.contact?.email || 'Không có email'}
                          </td>

                          {/* Sản phẩm và dịch vụ */}
                          <td>
                            {order.products?.length > 0
                              ? order.products.map((product) => (
                                  <div key={product._id}>
                                    {product.name} - {product.price.toLocaleString('vi-VN')} VND
                                  </div>
                                ))
                              : 'Không có sản phẩm'}
                          </td>
                          <td>
                            {order.K?.length > 0
                              ? order.K.map((kValue, index) => (
                                  <div key={index}>Khóa: {kValue.value}</div> // Thêm chữ "Khóa" đằng trước giá trị
                                ))
                              : 'Không có giá trị K'}
                          </td>
                          {/* Ghi chú */}
                          <td>
                            <Button
                              variant="primary"
                              onClick={() => handleShowNotes(order)}
                              style={{ padding: '2px 6px', fontSize: '0.75em' }}
                            >
                              Xem/Ghi Chú
                            </Button>
                          </td>

                          {/* Giai đoạn */}
                          <td>{order.stage || 'Không xác định'}</td>

                          {/* Tổng Tiền */}
                          <td>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: '1em',
                                textDecoration: 'underline'
                              }}
                            >
                              {order.amountTotal?.toLocaleString('vi-VN') || '0'} VND
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: '1em',
                                textDecoration: 'underline'
                              }}
                            >
                              {order.totalAmount?.toLocaleString('vi-VN') || '0'} VND
                            </span>
                          </td>

                          {/* Hình ảnh */}
                          <td>
                            {order.images && order.images.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                {order.images.map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => window.open(`https://www.system.crmkhitam.com${img.url}`, '_blank')}
                                    style={{
                                      backgroundColor: '#007bff',
                                      color: 'white',
                                      border: 'none',
                                      padding: '3px 6px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.7em'
                                    }}
                                  >
                                    Ảnh {idx + 1}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'red', fontStyle: 'italic' }}>Không có ảnh</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td>{order.status || 'Không xác định'}</td>

                          {/* Ngày Đặt */}
                          <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : (
                <Table striped bordered hover style={{ width: '100%', fontSize: '0.75em', tableLayout: 'auto' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Mã Đơn Hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Người tạo</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Thông tin khách hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Sản phẩm và dịch vụ</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Khóa</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Ghi chú</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Giai đoạn</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Tổng Tiền Thực Tế</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Tổng Tiền</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Hình ảnh</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Trạng thái</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.9em' }}>Ngày Đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((order) => order.status === 'Pending') // Lọc trạng thái Installment
                      .map((order) => (
                        <tr key={order._id}>
                          {/* Mã Đơn Hàng */}
                          <td>{order.orderCode || 'Không có mã'}</td>

                          {/* Người tạo */}
                          <td>
                            {order.createdBy?.lastname || ''} {order.createdBy?.firstname || ''} -{' '}
                            <span>{order.createdBy?.role?.name || 'Không có vai trò'}</span>
                          </td>

                          {/* Thông tin khách hàng */}
                          <td>
                            {order.contact?.name || 'Không có tên'}
                            <br />
                            {order.contact?.email || 'Không có email'}
                          </td>

                          {/* Sản phẩm và dịch vụ */}
                          <td>
                            {order.products?.length > 0
                              ? order.products.map((product) => (
                                  <div key={product._id}>
                                    {product.name} - {product.price.toLocaleString('vi-VN')} VND
                                  </div>
                                ))
                              : 'Không có sản phẩm'}
                          </td>
                          <td>
                            {order.K?.length > 0
                              ? order.K.map((kValue, index) => (
                                  <div key={index}>Khóa: {kValue.value}</div> // Thêm chữ "Khóa" đằng trước giá trị
                                ))
                              : 'Không có giá trị K'}
                          </td>
                          {/* Notes */}
                          <td>
                            {/* Hiển thị ghi chú nội bộ */}
                            {/* Nút mở modal */}
                            <Button variant="primary" onClick={() => handleShowNotes(order)}>
                              Xem/Ghi Chú
                            </Button>
                          </td>

                          {/* Giai đoạn */}
                          <td>{order.stage || 'Không xác định'}</td>

                          {/* Tổng Tiền */}
                          <td>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: '1em',
                                textDecoration: 'underline'
                              }}
                            >
                              {order.amountTotal?.toLocaleString('vi-VN') || '0'} VND
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: '#3498db',
                                fontSize: '1em',
                                textDecoration: 'underline'
                              }}
                            >
                              {order.totalAmount?.toLocaleString('vi-VN') || '0'} VND
                            </span>
                          </td>
                          <td>
                            {order.images && order.images.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                {order.images.map((img, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => window.open(`https://www.system.crmkhitam.com${img.url}`, '_blank')}
                                    style={{
                                      backgroundColor: '#007bff',
                                      color: 'white',
                                      border: 'none',
                                      padding: '3px 6px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                  >
                                    Ảnh {idx + 1}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'red', fontStyle: 'italic' }}>Không có ảnh</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td>{order.status || 'Không xác định'}</td>

                          {/* Ngày Đặt */}
                          <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
              <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Ghi Chú Đơn Hàng: {activeOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <h5>Ghi chú từ hệ thống:</h5>
                  <div>
                    <strong>Nội bộ:</strong> {activeOrder?.pipelineNotes || 'Không có ghi chú nội bộ'}
                  </div>
                  <h5 style={{ marginTop: '20px' }}>Ghi chú bên ngoài:</h5>
                  <ul>
                    {activeOrder?.externalNotes?.length > 0 ? (
                      activeOrder.externalNotes.map((note) => (
                        <li key={note._id}>
                          <strong>
                            {note.createdBy?.lastname || ''} {note.createdBy?.firstname || ''}
                          </strong>{' '}
                          ({new Date(note.createdAt).toLocaleString('vi-VN')}): {note.content}
                        </li>
                      ))
                    ) : (
                      <p>Không có ghi chú bên ngoài</p>
                    )}
                  </ul>
                  <Form.Group controlId="formNote">
                    <Form.Label>Thêm ghi chú mới</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Nhập nội dung ghi chú" value={note} onChange={handleNoteChange} />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Đóng
                  </Button>
                  <Button variant="primary" onClick={addNoteToPipeline}>
                    Thêm Ghi Chú
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

export default CustomerLocation;

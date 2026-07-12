import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import AsyncSelect from 'react-select/async';

const ReportAcademy = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTable, setActiveTable] = useState('installments');
  const [showModal, setShowModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [note, setNote] = useState('');
  const [dateFilter, setDateFilter] = useState('lastWeek'); // State để lưu giá trị lựa chọn ngày
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState(''); // State for product search term
  const [searchQuery, setSearchQuery] = useState('');
  const [productName, setProductName] = useState('');
  const searchPipelines = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/search-pipeline', {
        searchTerm: searchTerm.trim() // Ensure searchTerm is a string
      });
      //console.log(response.data); // Check the returned data
      setOrders(response.data.pipelines); // Update pipelines in state
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pipelines:', error.response ? error.response.data : error.message);
      setLoading(false);
    }
  };
  const [selectedProduct, setSelectedProduct] = useState(null); // Lưu sản phẩm đã chọn
  //console.log(productName);
  const searchProducts = async (query) => {
    if (!query) return [];

    try {
      const response = await axios.get('https://www.system.crmkhitam.com/api/v1/products/categoryproducts', {
        params: { query: query } // Tìm kiếm sản phẩm dựa trên từ khóa nhập vào
      });

      const products = response.data.map((product) => {
        return {
          label: product.name, // Chỉ gửi tên sản phẩm
          value: product._id // Lưu giá trị ID sản phẩm
        };
      });

      return products; // Trả về các sản phẩm chỉ có tên và ID
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchPipelines(); // Call API after a delay (debounced)
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer); // Clean up timeout on every input change
  }, [searchTerm]);

  useEffect(() => {
    if (productSearchTerm && productSearchTerm.trim().length > 0) {
      searchProducts(); // Gọi API tìm kiếm sản phẩm nếu productSearchTerm thay đổi
    }
  }, [productSearchTerm]);
  const [error, setError] = useState('');

  // Hàm xử lý khi gửi form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngừng hành động mặc định của form (refresh trang)

    if (!productName) {
      setError('Please enter a product name');
      return;
    }
    console.log(productName);

    try {
      // Clear previous search results before making a new request
      setOrders([]); // Reset the orders state to an empty array

      // Gửi yêu cầu POST với searchTerm là productName
      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/search-product', { searchTerm: productName });

      // Nếu tìm kiếm thành công, lưu kết quả pipelines vào state
      setOrders(response.data.pipelines);
      console.log(response.data);
      setError('');
    } catch (error) {
      console.error('Error during product search:', error);
      setError('An error occurred while searching for the product');
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('userId không tồn tại trong localStorage!');
      return;
    }

    let startDateFilter = new Date();
    let endDateFilter = new Date();

    if (dateFilter === 'lastWeek') {
      startDateFilter.setDate(startDateFilter.getDate() - 7); // 1 tuần qua
    } else if (dateFilter === 'lastMonth') {
      startDateFilter.setMonth(startDateFilter.getMonth() - 1); // 1 tháng qua
    } else if (dateFilter === 'today') {
      startDateFilter.setHours(0, 0, 0, 0); // Ngày hôm nay
    } else if (dateFilter === 'custom') {
      // Đảm bảo startDate và endDate được sử dụng đúng khi chọn khoảng thời gian
      startDateFilter = startDate;
      endDateFilter = endDate;
    }

    // Gửi yêu cầu với các giá trị ngày đã chọn
    fetch(
      `https://www.system.crmkhitam.com/api/v1/pineline/getpinelineroleaca?user_id=${userId}&start_date=${startDateFilter.toISOString()}&end_date=${endDateFilter.toISOString()}`
    )
      .then((response) => response.json())
      .then((data) => {
        setOrders(data.pipelines || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, [startDate, endDate, dateFilter]); // Đảm bảo dùng startDate, endDate và dateFilter để thay đổi dữ liệu
  // Thêm startDate, endDate và dateFilter vào dependencies để khi thay đổi sẽ gọi lại useEffect // Thêm dateFilter vào dependencies để khi thay đổi sẽ gọi lại useEffect

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value); // Cập nhật giá trị lọc ngày
    if (e.target.value === 'custom') {
      setIsCustomDate(true); // Hiển thị trường chọn ngày nếu chọn "Chọn khoảng thời gian"
    } else {
      setIsCustomDate(false); // Ẩn trường chọn ngày nếu không phải "Chọn khoảng thời gian"
    }
  };
  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const addNoteToPipeline = async (orderCode) => {
    if (!note.trim()) return; // Không thêm ghi chú nếu không có nội dung

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('User not logged in.');
        return;
      }

      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/add-note', {
        orderCode: activeOrder.orderCode,
        content: note,
        userId
      });

      alert(response.data.message);
      setNote(''); // Làm sạch trường ghi chú
      setActiveOrder(null); // Đặt lại đơn hàng hoạt động
      setNoteAdded(true); // Đánh dấu ghi chú đã được thêm
      setShowModal(false); // Đóng modal sau khi ghi chú được thêm
    } catch (error) {
      console.error(error);
      alert('Lỗi khi thêm ghi chú.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowNotes = (order) => {
    setActiveOrder(order);
    setNote('');
    setShowModal(true);
  };
  //console.log(selectedOption)
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header style={{ maxWidth: '600px' }}>
              <Card.Title as="h5">Danh sách khách hàng</Card.Title>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                {/* Dropdown chọn ngày */}
                <select onChange={handleDateFilterChange} value={dateFilter}>
                  <option value="today">Ngày hôm nay</option>
                  <option value="lastWeek">1 tuần qua</option>
                  <option value="lastMonth">1 tháng qua</option>
                  <option value="custom">Chọn khoảng thời gian</option>
                </select>

                {/* Nếu người dùng chọn "Chọn khoảng thời gian" thì hiển thị DatePicker */}
                {isCustomDate && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="Chọn ngày bắt đầu"
                    />
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="Chọn ngày kết thúc"
                    />
                  </div>
                )}
              </div>
              <Form.Group controlId="searchInput">
                <Form.Label>Tìm kiếm đơn hàng</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập thông tin khách hàng"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value); // Cập nhật searchTerm khi người dùng nhập
                    setSelectedProduct(null); // Xóa giá trị sản phẩm đã chọn khi thay đổi khách hàng
                  }}
                  style={{ width: '400px' }}
                />
              </Form.Group>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicProducts">
                  <Form.Label>Tìm kiếm theo sản phẩm</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    loadOptions={searchProducts}
                    value={selectedProduct ? { label: selectedProduct.label, value: selectedProduct.value } : null}
                    onChange={(selectedOption) => {
                      setSelectedProduct(selectedOption);
                      setSearchQuery(selectedOption ? selectedOption.label : '');
                      setSearchTerm('');

                      // Chỉ lấy tên sản phẩm khi chọn
                      setProductName(selectedOption ? selectedOption.label : '');
                    }}
                    onInputChange={(newValue) => {
                      setSearchQuery(newValue);
                    }}
                    placeholder="Tìm sản phẩm"
                  />

                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                </Form.Group>
              </Form>
            </Card.Header>
            <Card.Body>
              {loading ? (
                // Hiển thị Spinner khi dữ liệu đang được tải
                <Spinner animation="border" variant="primary" />
              ) : activeTable === 'installments' ? (
                // Bảng trả góp (installments)
                <Table striped bordered hover style={{ width: '100%', fontSize: '0.75em', tableLayout: 'auto' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Mã đơn hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Người tạo</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Thông tin khách hàng</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Sản phẩm và dịch vụ</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Khóa</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ghi chú</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Giai đoạn</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng tiền thực tế</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng tiền</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Hình ảnh</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Trạng thái</th>
                      <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((order) => order.status === 'Completed') // Lọc trạng thái Completed
                      .map((order) => (
                        <tr key={order._id}>
                          {/* Mã đơn hàng */}
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
                            <br />
                            {order.contact?.phone || 'Không có phone'}
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
                              Xem/Ghi chú
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
                              <button
                                onClick={() => window.open(`https://www.system.crmkhitam.com${order.images[0].url}`, '_blank')} // Mở ảnh trong tab mới
                                style={{
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  border: 'none',
                                  padding: '3px 8px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontSize: '0.75em'
                                }}
                              >
                                Xem ảnh
                              </button>
                            ) : (
                              <span style={{ color: 'red', fontStyle: 'italic' }}>Không có ảnh</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td>{order.status || 'Không xác định'}</td>

                          {/* Ngày đặt */}
                          <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              ) : null}
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

export default ReportAcademy;

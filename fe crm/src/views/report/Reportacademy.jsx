import 'react-datepicker/dist/react-datepicker.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import AsyncSelect from 'react-select/async';
import * as XLSX from 'xlsx';
import { FaUserCheck } from 'react-icons/fa';

const ReportAcademy = () => {
  const [service, setService] = useState('Academy'); // Mặc định là Academy
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTable, setActiveTable] = useState('installments');
  const [showModal, setShowModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [note, setNote] = useState('');
  const [dateFilter, setDateFilter] = useState('lastWeek');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productName, setProductName] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const userRole = localStorage.getItem('role'); // Lấy vai trò người dùng

  const detailStyle = {
    padding: '5px',
    backgroundColor: '#fff',
    borderRadius: '4px'
  };

  // Tính tổng tiền thực tế
  const calculateTotalAmount = (filteredOrders) => {
    return filteredOrders
      .filter((order) => order.products && order.products.length > 0)
      .reduce((total, order) => {
        const amountTotal = order.amountTotal || 0;
        return total + amountTotal;
      }, 0);
  };

  // Lấy thông tin thời gian hiện tại để hiển thị
  const getDateRangeText = () => {
    if (dateFilter === 'today') {
      return 'Hôm nay';
    } else if (dateFilter === 'lastWeek') {
      return '1 tuần qua';
    } else if (dateFilter === 'lastMonth') {
      return '1 tháng qua';
    } else if (dateFilter === 'custom') {
      return `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`;
    }
    return '';
  };

  const searchPipelines = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID is not available');
      }

      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/search-pipeline', {
        searchTerm: searchTerm.trim(),
        user_id: userId
      });

      setOrders(response.data.pipelines);
    } catch (error) {
      console.error('Error fetching pipelines:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    if (!query) return [];

    try {
      const response = await axios.get('https://www.system.crmkhitam.com/api/v1/products/categoryproducts', {
        params: { query: query }
      });

      const products = response.data.map((product) => ({
        label: product.name,
        value: product._id
      }));

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  const toggleRow = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchPipelines();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (productSearchTerm && productSearchTerm.trim().length > 0) {
      searchProducts();
    }
  }, [productSearchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName) {
      setError('Please enter a product name');
      return;
    }

    try {
      const user_id = localStorage.getItem('userId');
      if (!user_id) {
        setError('User ID is missing. Please log in again.');
        return;
      }

      setOrders([]);

      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/search-product', {
        searchTerm: productName,
        user_id: user_id
      });

      setOrders(response.data.pipelines);
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
      setLoading(false);
      return;
    }

    let startDateFilter = new Date();
    let endDateFilter = new Date();

    if (dateFilter === 'lastWeek') {
      startDateFilter.setDate(startDateFilter.getDate() - 7);
    } else if (dateFilter === 'lastMonth') {
      startDateFilter.setMonth(startDateFilter.getMonth() - 1);
    } else if (dateFilter === 'today') {
      startDateFilter.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'custom') {
      startDateFilter = startDate;
      endDateFilter = endDate;
    }

    // Sử dụng service cố định là "Academy" cho Aca_Specialis
    const serviceValue = userRole === 'Aca_Specialis' ? 'Academy' : service;

    fetch(
      `https://www.system.crmkhitam.com/api/v1/pineline/getpinelineroleaca?user_id=${userId}&start_date=${startDateFilter.toISOString()}&end_date=${endDateFilter.toISOString()}&service=${encodeURIComponent(
        serviceValue
      )}`
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
  }, [startDate, endDate, dateFilter, service, userRole]);

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    if (e.target.value === 'custom') {
      setIsCustomDate(true);
    } else {
      setIsCustomDate(false);
    }
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const addNoteToPipeline = async () => {
    if (!note.trim()) return;

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
      setNote('');
      setActiveOrder((prevState) => ({
        ...prevState,
        externalNotes: [
          ...(prevState.externalNotes || []),
          {
            content: note,
            createdBy: {
              firstname: 'Your Firstname', // Thay bằng thông tin thực tế từ API hoặc user
              lastname: 'Your Lastname'
            },
            createdAt: new Date()
          }
        ]
      }));
      setNoteAdded(true);
      setShowModal(false);
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

  const exportToExcel = () => {
    const filteredOrders = orders.filter((order) => order.products.length > 0);
    const totalAmount = calculateTotalAmount(filteredOrders);

    const worksheetData = filteredOrders.map((order) => ({
      'Mã đơn hàng': order.orderCode || 'Không có mã',
      'Người tạo': `${order.createdBy?.lastname || ''} ${order.createdBy?.firstname || ''} - ${
        order.createdBy?.role?.name || 'Không có vai trò'
      }`,
      'Affiliate ID': order.affiliate_id || 'Không có',
      'Affiliate Name': order.affiliate_name || 'Không có',
      'Tên khách hàng': order.contact?.name || 'Không có tên',
      'Email khách hàng': order.contact?.email || 'Không có email',
      'Số điện thoại khách hàng': order.contact?.phone || 'Không có phone',
      'Sản phẩm và dịch vụ':
        order.products?.length > 0
          ? order.products.map((product) => `${product.name} - ${product.price.toLocaleString('vi-VN')} VND`).join('\n')
          : 'Không có sản phẩm',
      'Phụ thu': order.surcharge?.toLocaleString('vi-VN') || '0',
      Khóa: order.K?.length > 0 ? order.K.map((kValue) => `Khóa: ${kValue.value}`).join('\n') : 'Không có giá trị K',
      'Ghi chú': 'Xem/Ghi chú',
      'Giai đoạn': order.stage || 'Không xác định',
      'Tổng tiền thực tế': order.amountTotal?.toLocaleString('vi-VN') || '0',
      'Tổng tiền': order.totalAmount?.toLocaleString('vi-VN') || '0',
      'Hình ảnh': order.images?.length > 0 ? 'Xem ảnh' : 'Không có ảnh',
      'Trạng thái': order.status || 'Không xác định',
      'Ngày đặt': new Date(order.createdAt).toLocaleDateString('vi-VN')
    }));

    // Thêm dòng tổng kết vào cuối
    worksheetData.push({
      'Mã đơn hàng': '',
      'Người tạo': '',
      'Affiliate ID': '',
      'Affiliate Name': '',
      'Tên khách hàng': '',
      'Email khách hàng': '',
      'Số điện thoại khách hàng': '',
      'Sản phẩm và dịch vụ': '',
      'Phụ thu': '',
      Khóa: '',
      'Ghi chú': '',
      'Giai đoạn': '',
      'Tổng tiền thực tế': `TỔNG CỘNG: ${totalAmount.toLocaleString('vi-VN')} VND`,
      'Tổng tiền': '',
      'Hình ảnh': '',
      'Trạng thái': '',
      'Ngày đặt': ''
    });

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng');

    XLSX.writeFile(wb, 'Danh_sach_don_hang.xlsx');
  };

  const renderTable = (filteredOrders) => {
    // Sắp xếp theo ngày cập nhật
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const totalAmount = calculateTotalAmount(sortedOrders);

    return (
      <>
        <Table striped bordered hover style={{ width: '100%', fontSize: '0.75em', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Mã Đơn Hàng</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Người tạo & Affiliate</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Thông tin khách hàng</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Sản phẩm và dịch vụ</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Phụ thu</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Tổng tiền thực tế</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Hình ảnh</th>
              <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ngày Đặt</th>
              <th
                style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em', cursor: 'pointer', whiteSpace: 'nowrap' }}
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                title="Nhấn để đổi chiều sắp xếp"
              >
                Ngày Cập Nhật {sortOrder === 'newest' ? '▼' : '▲'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'red', fontStyle: 'italic' }}>
                  Không có dữ liệu để hiển thị
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => {
                const productMap = order.products?.reduce((acc, product) => {
                  const key = `${product.name}-${product.price}`;
                  if (!acc[key]) {
                    acc[key] = { ...product, count: 1 };
                  } else {
                    acc[key].count += 1;
                  }
                  return acc;
                }, {});

                const uniqueProducts = productMap ? Object.values(productMap) : [];

                return (
                  <React.Fragment key={order._id}>
                    <tr onClick={() => toggleRow(order._id)} style={{ cursor: 'pointer' }}>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {order.orderCode || 'Không có mã'} <span>{expandedRow === order._id ? '▼' : '▶'}</span>
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'left', fontSize: '0.85em' }}>
                        {order.createdBy ? (
                          <>
                            {`${order.createdBy.lastname || ''} ${order.createdBy.firstname || ''}`} -{' '}
                            <span
                              style={{
                                color:
                                  order.createdBy.role?.name === 'Admin'
                                    ? 'red'
                                    : order.createdBy.role?.name === 'KTT Sale Manager'
                                      ? 'blue'
                                      : order.createdBy.role?.name === 'KTT Sale Team Leader'
                                        ? 'green'
                                        : 'gray'
                              }}
                            >
                              {order.createdBy.role?.name || 'Không có vai trò'}
                            </span>
                            <br />
                            {order.affiliate_id && order.affiliate_name ? (
                              <span style={{ color: '#007bff', fontSize: '0.8em' }}>
                                <FaUserCheck style={{ marginRight: '5px' }} />
                                Affiliate: {order.affiliate_id} - {order.affiliate_name}
                              </span>
                            ) : (
                              <span style={{ color: '#6c757d', fontSize: '0.8em' }}>Không có thông tin Affiliate</span>
                            )}
                          </>
                        ) : (
                          <>
                            Chưa phân công
                            <br />
                            <span style={{ color: '#6c757d', fontSize: '0.8em' }}>Không có thông tin Affiliate</span>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'left', fontSize: '0.85em' }}>
                        <strong>{order.contact?.name || 'Không có tên'}</strong>
                        <br />
                        {order.contact?.email || 'Không có email'}
                        <br />
                        {order.contact?.phone || 'Không có phone'}
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {uniqueProducts.length > 0
                          ? uniqueProducts.map((product) => (
                              <div key={`${product.name}-${product.price}`}>
                                {product.name}{' '}
                                {product.count > 1 ? (
                                  <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff4444', marginLeft: '5px' }}>
                                    (x{product.count})
                                  </span>
                                ) : (
                                  ''
                                )}
                                {' - '} {product.price.toLocaleString('vi-VN')} VND
                              </div>
                            ))
                          : 'Không có sản phẩm'}
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {order.surcharge?.toLocaleString('vi-VN') || '0'} VND
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {order.amountTotal?.toLocaleString('vi-VN') || '0'} VND
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {order.images && order.images.length > 0 ? (
                          order.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.system.crmkhitam.com${image.url}`, '_blank');
                              }}
                              style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                marginBottom: '5px'
                              }}
                            >
                              Xem ảnh {index + 1}
                            </button>
                          ))
                        ) : (
                          <span style={{ color: 'red', fontStyle: 'italic' }}>Không có ảnh</span>
                        )}
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {order.createdAt && !isNaN(new Date(order.createdAt))
                          ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                          : 'Không có ngày tạo'}
                      </td>
                      <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                        {order.updatedAt && !isNaN(new Date(order.updatedAt)) ? (
                          <span style={{ color: '#007bff', fontWeight: '500' }}>
                            {new Date(order.updatedAt).toLocaleDateString('vi-VN')}
                            <br />
                            <small style={{ color: '#6c757d' }}>
                              {new Date(order.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </span>
                        ) : (
                          <span style={{ color: '#aaa', fontStyle: 'italic' }}>Không có</span>
                        )}
                      </td>
                    </tr>
                    {expandedRow === order._id && (
                      <tr>
                        <td colSpan={9} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderTop: '2px solid #dee2e6' }}>
                          <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '1em' }}>
                            Chi tiết đơn hàng: {order.orderCode || 'Không có mã'}
                          </div>
                          <Row style={{ fontSize: '0.85em', gap: '10px' }}>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Ghi chú:</strong>
                              <div
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '200px',
                                  ...detailStyle
                                }}
                                title={order.pipelineNotes || 'Không có ghi chú nội bộ'}
                              >
                                {order.pipelineNotes || 'Không có ghi chú nội bộ'}
                              </div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Giai đoạn:</strong>
                              <div style={detailStyle}>{order.stage || 'Không xác định'}</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Tạm ứng:</strong>
                              <div style={detailStyle}>{order.depositAmount?.toLocaleString('vi-VN') || '0'} VND</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Phụ thu:</strong>
                              <div style={detailStyle}>{order.surcharge?.toLocaleString('vi-VN') || '0'} VND</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Tổng Tiền Thực Tế:</strong>
                              <div style={detailStyle}>{order.amountTotal?.toLocaleString('vi-VN') || '0'} VND</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Tổng Tiền:</strong>
                              <div style={detailStyle}>{order.totalAmount?.toLocaleString('vi-VN') || '0'} VND</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Khóa:</strong>
                              <div style={detailStyle}>
                                {order.K?.length > 0
                                  ? order.K.map((kValue, index) => <div key={index}>Khóa: {kValue.value}</div>)
                                  : 'Không có giá trị K'}
                              </div>
                            </Col>
                            {order.status === 'Installment' && (
                              <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                                <strong style={{ color: '#007bff' }}>Số đợt:</strong>
                                <div style={detailStyle}>
                                  Lần 1: {order.Firstpayment?.toLocaleString() || '0'} VND
                                  {order.installmentPlans?.length > 0 &&
                                    order.installmentPlans.map((plan, idx) => (
                                      <div key={idx}>
                                        {plan.installmentNumber}: {plan.PaidAmount.toLocaleString()} VND ({plan.Status})
                                      </div>
                                    ))}
                                </div>
                              </Col>
                            )}
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Trạng thái:</strong>
                              <div style={detailStyle}>{order.status || 'Không xác định'}</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Affiliate ID:</strong>
                              <div style={detailStyle}>{order.affiliate_id || 'Không có'}</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#007bff' }}>Affiliate Name:</strong>
                              <div style={detailStyle}>{order.affiliate_name || 'Không có'}</div>
                            </Col>
                            <Col xs={12} sm={6} md={3} className="d-flex align-items-center" style={{ marginBottom: '10px' }}>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowNotes(order);
                                }}
                              >
                                Xem/Ghi Chú
                              </Button>
                            </Col>
                          </Row>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </Table>

        {/* Thêm dòng tổng kết */}
        {filteredOrders.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#e8f4fd',
              border: '2px solid #007bff',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}
            >
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>
                <span style={{ color: '#007bff' }}>Dịch vụ:</span> {userRole === 'Aca_Specialis' ? 'Academy' : service}
              </div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>
                <span style={{ color: '#007bff' }}>Thời gian:</span> {getDateRangeText()}
              </div>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>
                <span style={{ color: '#007bff' }}>Tổng số đơn hàng:</span> {filteredOrders.length}
              </div>
              <div
                style={{
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  color: '#28a745',
                  padding: '8px 15px',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '5px'
                }}
              >
                <span style={{ color: '#155724' }}>Tổng tiền thực tế:</span> {totalAmount.toLocaleString('vi-VN')} VND
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header
              style={{
                maxWidth: '600px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}
              >
                {/* Dropdown sắp xếp theo ngày cập nhật */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                  title="Sắp xếp theo ngày cập nhật"
                >
                  <option value="newest">Cập nhật: Mới nhất</option>
                  <option value="oldest">Cập nhật: Cũ nhất</option>
                </select>
                <select
                  onChange={handleDateFilterChange}
                  value={dateFilter}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    background: 'white'
                  }}
                >
                  <option value="today">Ngày hôm nay</option>
                  <option value="lastWeek">1 tuần qua</option>
                  <option value="lastMonth">1 tháng qua</option>
                  <option value="custom">Chọn khoảng thời gian</option>
                </select>
                {userRole !== 'Aca_Specialis' && userRole !== 'Hub Specialist' && (
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    style={{
                      padding: '8px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: 'white',
                      color: 'black',
                      transition: '0.3s'
                    }}
                  >
                    <option value="Academy">Academy</option>
                    <option value="Health Hub">Health Hub</option>
                  </select>
                )}
              </div>

              {isCustomDate && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="Chọn ngày bắt đầu"
                    style={{
                      padding: '8px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="Chọn ngày kết thúc"
                    style={{
                      padding: '8px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
              )}

              <Form.Group controlId="searchInput" style={{ marginBottom: '15px' }}>
                <Form.Label style={{ fontWeight: 'bold' }}>Tìm kiếm đơn hàng</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập thông tin khách hàng"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedProduct(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
              </Form.Group>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicProducts">
                  <Form.Label style={{ fontWeight: 'bold' }}>Tìm kiếm theo sản phẩm</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    loadOptions={searchProducts}
                    value={selectedProduct ? { label: selectedProduct.label, value: selectedProduct.value } : null}
                    onChange={(selectedOption) => {
                      setSelectedProduct(selectedOption);
                      setSearchQuery(selectedOption ? selectedOption.label : '');
                      setSearchTerm('');
                      setProductName(selectedOption ? selectedOption.label : '');
                    }}
                    onInputChange={(newValue) => {
                      setSearchQuery(newValue);
                    }}
                    placeholder="Tìm sản phẩm"
                  />
                  <Button variant="primary" type="submit" style={{ marginTop: '10px' }}>
                    Tìm kiếm
                  </Button>
                  {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </Form.Group>
              </Form>

              <Button
                variant="primary"
                onClick={exportToExcel}
                style={{
                  marginTop: '15px',
                  backgroundColor: '#FF5733',
                  borderColor: '#C70039',
                  color: 'white',
                  padding: '10px 20px',
                  fontSize: '1em',
                  borderRadius: '5px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                Xuất ra Excel
              </Button>
            </Card.Header>

            <Card.Body>
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                renderTable(orders.filter((order) => order.products && order.products.length > 0))
              )}

              <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Ghi Chú Đơn Hàng: {activeOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    <strong>Khách Hàng:</strong> {activeOrder?.contact?.name || 'Không có tên'}
                  </p>
                  <p>
                    <strong>Email:</strong> {activeOrder?.contact?.email || 'Không có email'}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {activeOrder?.contact?.phone || 'Không có phone'}
                  </p>
                  <p>
                    <strong>Affiliate ID:</strong> {activeOrder?.affiliate_id || 'Không có'}
                  </p>
                  <p>
                    <strong>Affiliate Name:</strong> {activeOrder?.affiliate_name || 'Không có'}
                  </p>
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
                  <Button variant="primary" onClick={addNoteToPipeline} disabled={isSubmitting}>
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

export default ReportAcademy;

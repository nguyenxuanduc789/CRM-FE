import React, { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Row,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Nav,
  Tab,
  Badge,
  Pagination
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PortalService from '../../services/portalService';
import './PortalDataView.css';

const PortalDataView = () => {
  // Tính toán ngày mặc định: từ ngày 05 của tháng trước đến ngày hiện tại
  const getDefaultDates = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    // Ngày bắt đầu: ngày 05 của tháng trước
    const startDate = new Date(currentYear, currentMonth - 1, 5);
    
    // Ngày kết thúc: ngày hiện tại
    const endDate = new Date(currentYear, currentMonth, currentDay);
    
    return { startDate, endDate };
  };

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates();

  // Lấy thông tin user từ localStorage
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('role');
  
  console.log('User ID:', userId);
  console.log('User Role from localStorage:', userRole);

  // Khởi tạo activeTab dựa vào role
  const getInitialActiveTab = () => {
    if (userRole === 'Aca_Specialis' || userRole === 'Aca_Specialist') return 'aca';
    if (userRole === 'Hub Specialist' || userRole === 'Hub Specialis') return 'hub';
    return 'all';
  };

  // States
  const [portalData, setPortalData] = useState([]);
  const [portalStats, setPortalStats] = useState({
    total: 0,
    hubPortal: 0,
    pipelinePortal: 0,
    hubAcademy: 0,
    hubService: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(getInitialActiveTab());
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [kMin, setKMin] = useState('');
  const [kMax, setKMax] = useState('');
  const [kAll, setKAll] = useState(true);

  // Format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch data từ API
  const fetchPortalData = async () => {
    if (!userId) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedStartDate = formatDateToYYYYMMDD(startDate);
      const formattedEndDate = formatDateToYYYYMMDD(endDate);
      
      console.log('Fetching portal data with dates:', { formattedStartDate, formattedEndDate });
      
      // Xác định source parameter dựa vào role
      let sourceParam = null;
      if (userRole === 'Admin' || userRole === 'Cust_service') {
        // Admin và Cust_service có thể chọn tab
        if (activeTab === 'hub') sourceParam = 'hub';
        else if (activeTab === 'aca') sourceParam = 'aca';
      } else if (userRole === 'Aca_Specialis' || userRole === 'Aca_Specialist') {
        // Aca_Specialis chỉ xem Academy
        sourceParam = 'aca';
      } else if (userRole === 'Hub Specialist' || userRole === 'Hub Specialis') {
        // Hub Specialist chỉ xem Hub
        sourceParam = 'hub';
      }
      
      // Lấy dữ liệu portal
      const response = await PortalService.getPortalsByContactDate({
        userId: userId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        page: currentPage,
        limit: pageSize,
        source: sourceParam,
        search: searchTerm.trim() || undefined
      });

      setPortalData(response.data || []);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));

      // Lấy thống kê
      const statsResponse = await PortalService.getPortalStats({
        userId: userId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        search: searchTerm.trim() || undefined
      });

      setPortalStats(statsResponse);
    } catch (error) {
      console.error('Error fetching portal data:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount hoặc khi thay đổi filter
  useEffect(() => {
    fetchPortalData();
  }, [currentPage, pageSize, startDate, endDate, searchTerm]);

  // Filter data theo tab và role
  const getFilteredData = () => {
    console.log('Current userRole:', userRole);
    console.log('Current activeTab:', activeTab);
    console.log('Portal data length:', portalData.length);
    
    // Nếu là Aca_Specialis, chỉ xem Academy Portal
    if (userRole === 'Aca_Specialis' || userRole === 'Aca_Specialist') {
      console.log('Filtering for Aca_Specialis - Academy Portal only');
      const filtered = portalData.filter(item => {
        if (item.products && item.products.length > 0) {
          return item.products.some(product => product.source === 'AcademyPortal');
        }
        return item.source === 'AcademyPortal';
      });
      console.log('Filtered data for Aca_Specialis:', filtered.length);
      return filtered;
    }
    
    // Nếu là Hub Specialist, chỉ xem Hub Portal
    if (userRole === 'Hub Specialist' || userRole === 'Hub Specialis') {
      console.log('Filtering for Hub Specialist - Hub Portal only');
      const filtered = portalData.filter(item => {
        if (item.products && item.products.length > 0) {
          return item.products.some(product => product.source === 'HubPortal');
        }
        return item.source === 'HubPortal';
      });
      console.log('Filtered data for Hub Specialist:', filtered.length);
      return filtered;
    }
    
    // Admin và Cust_service có thể chọn tab
    if (activeTab === 'all') {
      console.log('Admin/Cust_service - showing all data');
      return portalData;
    } else if (activeTab === 'hub') {
      console.log('Admin/Cust_service - filtering Hub Portal');
      // Lọc dữ liệu HubPortal
      const filtered = portalData.filter(item => {
        if (item.products && item.products.length > 0) {
          return item.products.some(product => product.source === 'HubPortal');
        }
        return item.source === 'HubPortal';
      });
      console.log('Filtered Hub data:', filtered.length);
      return filtered;
    } else if (activeTab === 'aca') {
      console.log('Admin/Cust_service - filtering Academy Portal');
      // Lọc dữ liệu AcademyPortal
      const filtered = portalData.filter(item => {
        if (item.products && item.products.length > 0) {
          return item.products.some(product => product.source === 'AcademyPortal');
        }
        return item.source === 'AcademyPortal';
      });
      console.log('Filtered Academy data:', filtered.length);
      return filtered;
    }
    return portalData;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get status badge
  const getStatusBadge = (source) => {
    if (source === 'HubPortal') {
      return <Badge bg="success">Hub Portal</Badge>;
    } else if (source === 'AcademyPortal') {
      return <Badge bg="info">Academy Portal</Badge>;
    }
    return <Badge bg="secondary">Unknown</Badge>;
  };

  // Get service badge
  const getServiceBadge = (service) => {
    if (service === 'Hub Academy') {
      return <Badge bg="warning" text="dark">Hub Academy</Badge>;
    } else if (service === 'Hub') {
      return <Badge bg="primary">Hub Service</Badge>;
    }
    return <Badge bg="secondary">{service}</Badge>;
  };

  // Handle date change
  const handleDateChange = () => {
    setCurrentPage(1); // Reset về trang đầu
    fetchPortalData();
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handle status change
  const handleStatusChange = async (id, source, newStatus) => {
    setPortalData(prevData => prevData.map(item => {
      if (item.products && item.products.length > 0) {
        return { ...item, products: item.products.map(p => (p._id === id && p.source === source) ? { ...p, status: newStatus } : p) };
      }
      if (item._id === id && item.source === source) return { ...item, status: newStatus };
      return item;
    }));
    try {
      await PortalService.updatePortalStatus({ id, source, status: newStatus });
    } catch (error) {
      console.error('Lỗi khi cập nhật status:', error);
      fetchPortalData();
    }
  };

  const handleGraduationStatusChange = async (id, source, newGradStatus) => {
    setPortalData(prevData => prevData.map(item => {
      if (item.products && item.products.length > 0) {
        return { ...item, products: item.products.map(p => (p._id === id && p.source === source) ? { ...p, graduationStatus: newGradStatus } : p) };
      }
      if (item._id === id && item.source === source) return { ...item, graduationStatus: newGradStatus };
      return item;
    }));
    try {
      await PortalService.updatePortalStatus({ id, source, graduationStatus: newGradStatus });
    } catch (error) {
      console.error('Lỗi khi cập nhật graduation status:', error);
      fetchPortalData();
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
    fetchPortalData();
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Lấy số K từ orderId (VD: "K8" → 8)
  const extractKNumber = (orderId) => {
    if (!orderId || orderId === 'N/A') return null;
    const match = String(orderId).match(/K(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const applyProductAndKFilter = (data) => {
    let result = data;
    if (productSearch.trim()) {
      const keyword = productSearch.trim().toLowerCase();
      result = result.map(item => {
        if (item.products && item.products.length > 0) {
          const matchedProducts = item.products.filter(p =>
            (p.productName || '').toLowerCase().includes(keyword) ||
            (p.orderId || '').toLowerCase().includes(keyword)
          );
          if (matchedProducts.length === 0) return null;
          return { ...item, products: matchedProducts };
        }
        if ((item.productName || '').toLowerCase().includes(keyword) || (item.orderId || '').toLowerCase().includes(keyword)) return item;
        return null;
      }).filter(Boolean);
    }
    if (!kAll) {
      const minK = kMin !== '' ? Number(kMin) : null;
      const maxK = kMax !== '' ? Number(kMax) : null;
      result = result.map(item => {
        if (item.products && item.products.length > 0) {
          const matchedProducts = item.products.filter(p => {
            const kNum = extractKNumber(p.orderId);
            if (kNum === null) return false;
            if (minK !== null && kNum < minK) return false;
            if (maxK !== null && kNum > maxK) return false;
            return true;
          });
          if (matchedProducts.length === 0) return null;
          return { ...item, products: matchedProducts };
        }
        const kNum = extractKNumber(item.orderId);
        if (kNum === null) return false;
        if (minK !== null && kNum < minK) return false;
        if (maxK !== null && kNum > maxK) return false;
        return item;
      }).filter(Boolean);
    }
    return result;
  };

  const filteredData = applyProductAndKFilter(getFilteredData());

  return (
    <div className="portal-data-view">
      <Card>
        <Card.Header>
          <h4 className="mb-0">
            <i className="fas fa-chart-line me-2"></i>
            Portal Data View
          </h4>
        </Card.Header>
        <Card.Body>
          {/* Filter Section */}
          <Row className="mb-4">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Từ ngày:</Form.Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Đến ngày:</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tìm kiếm:</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <i className="fas fa-search"></i>
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Số bản ghi:</Form.Label>
                <Form.Select value={pageSize} onChange={handlePageSizeChange}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <Button 
                  variant="primary" 
                  onClick={handleDateChange}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Tải lại'}
                </Button>
              </Form.Group>
            </Col>
            <Col md={1}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <div className="text-end">
                  <small className="text-muted">
                    Tổng: {portalData.length} bản ghi
                  </small>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Lọc sản phẩm & Khoá (K) */}
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tìm kiếm khóa học:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên SP hoặc mã order..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Lọc theo khoảng K:</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Check 
                    type="checkbox"
                    label="Tất cả K"
                    checked={kAll}
                    onChange={(e) => {
                      setKAll(e.target.checked);
                      if (e.target.checked) {
                        setKMin('');
                        setKMax('');
                      }
                    }}
                    style={{ minWidth: '100px' }}
                  />
                  <Form.Control
                    type="number"
                    placeholder="K Từ..."
                    value={kMin}
                    onChange={(e) => { setKMin(e.target.value); setKAll(false); }}
                    disabled={kAll}
                  />
                  <span>-</span>
                  <Form.Control
                    type="number"
                    placeholder="Đến K..."
                    value={kMax}
                    onChange={(e) => { setKMax(e.target.value); setKAll(false); }}
                    disabled={kAll}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
  

          {/* Tab Navigation */}
          <Nav variant="tabs" className="mb-3">
            {(userRole === 'Admin' || userRole === 'Cust_service') && (
              <>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'all'} 
                    onClick={() => setActiveTab('all')}
                  >
                    Tất cả ({portalStats.total})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'hub'} 
                    onClick={() => setActiveTab('hub')}
                  >
                    Hub Portal ({portalStats.hubPortal})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'aca'} 
                    onClick={() => setActiveTab('aca')}
                  >
                    Academy Portal ({portalStats.academyPortal})
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
            {userRole === 'Aca_Specialis' && (
              <Nav.Item>
                <Nav.Link active={true}>
                  Academy Portal ({portalStats.academyPortal})
                </Nav.Link>
              </Nav.Item>
            )}
            {userRole === 'Hub Specialist' && (
              <Nav.Item>
                <Nav.Link active={true}>
                  Hub Portal ({portalStats.hubPortal})
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>

          {/* Data Table */}
          {loading ? (
            <div className="loading-container">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <Alert variant="info" className="text-center">
              <i className="fas fa-info-circle me-2"></i>
              Không có dữ liệu để hiển thị
            </Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-dark">
                    <tr>
                      <th>STT</th>
                      <th>Khách hàng</th>
                      <th>Trạng thái học</th>
                      <th>Trạng thái tốt nghiệp</th>
                      <th>Người giới thiệu</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Nguồn</th>
                      <th>Ngày tạo contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      if (item.products && item.products.length > 0) {
                        return item.products.map((product, productIndex) => (
                          <tr key={`${item.contactId}-${product.orderId}-${productIndex}`}>
                            <td>{(currentPage - 1) * pageSize + index + productIndex + 1}</td>
                            <td>
                              <strong>{item.customerName}</strong>
                              {item.email !== 'N/A' && (
                                <div><small className="text-muted"><i className="fas fa-envelope me-1"></i>{item.email}</small></div>
                              )}
                              {item.phone !== 'N/A' && (
                                <div><small className="text-muted"><i className="fas fa-phone me-1"></i>{item.phone}</small></div>
                              )}
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={product.status || 'Pending'}
                                onChange={(e) => handleStatusChange(product._id, product.source, e.target.value)}
                                style={{ width: '130px' }}
                              >
                                <option value="Pending">Chờ học</option>
                                <option value="Enrolled">Đã enroll</option>
                                <option value="Not Enrolled">Chưa enroll</option>
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={product.graduationStatus || 'Chưa tốt nghiệp'}
                                onChange={(e) => handleGraduationStatusChange(product._id, product.source, e.target.value)}
                                style={{ width: '150px' }}
                              >
                                <option value="Chưa tốt nghiệp">Chưa tốt nghiệp</option>
                                <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
                                <option value="Đang bảo lưu">Đang bảo lưu</option>
                              </Form.Select>
                            </td>
                            <td>{item.nguoiGT === 'N/A' ? '' : item.nguoiGT}</td>
                            <td>
                              <strong>{product.productName}</strong>
                              {product.orderId !== 'N/A' && (
                                <>
                                  <br />
                                  <small className="text-muted">Mã: {product.orderId}</small>
                                </>
                              )}
                            </td>
                            <td className="text-center">{product.quantity}</td>
                            <td>{getStatusBadge(product.source)}</td>
                            <td>{formatDate(item.contactCreatedAt)}</td>
                          </tr>
                        ));
                      } else {
                        return (
                          <tr key={`${item.contactId}-${item.orderId}-${index}`}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>
                              <strong>{item.customerName}</strong>
                              {item.email !== 'N/A' && (
                                <div><small className="text-muted"><i className="fas fa-envelope me-1"></i>{item.email}</small></div>
                              )}
                              {item.phone !== 'N/A' && (
                                <div><small className="text-muted"><i className="fas fa-phone me-1"></i>{item.phone}</small></div>
                              )}
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={item.status || 'Pending'}
                                onChange={(e) => handleStatusChange(item._id, item.source, e.target.value)}
                                style={{ width: '130px' }}
                              >
                                <option value="Pending">Chờ học</option>
                                <option value="Enrolled">Đã enroll</option>
                                <option value="Not Enrolled">Chưa enroll</option>
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Select
                                size="sm"
                                value={item.graduationStatus || 'Chưa tốt nghiệp'}
                                onChange={(e) => handleGraduationStatusChange(item._id, item.source, e.target.value)}
                                style={{ width: '150px' }}
                              >
                                <option value="Chưa tốt nghiệp">Chưa tốt nghiệp</option>
                                <option value="Đã tốt nghiệp">Đã tốt nghiệp</option>
                                <option value="Đang bảo lưu">Đang bảo lưu</option>
                              </Form.Select>
                            </td>
                            <td>{item.nguoiGT === 'N/A' ? '' : item.nguoiGT}</td>
                            <td>
                              <strong>{item.productName}</strong>
                              {item.orderId !== 'N/A' && (
                                <>
                                  <br />
                                  <small className="text-muted">Mã: {item.orderId}</small>
                                </>
                              )}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td>{getStatusBadge(item.source)}</td>
                            <td>{formatDate(item.contactCreatedAt)}</td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, portalData.length)} 
                      trong tổng số {portalData.length} bản ghi
                    </small>
                  </div>
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PortalDataView; 
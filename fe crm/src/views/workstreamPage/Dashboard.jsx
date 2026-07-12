import 'react-datepicker/dist/react-datepicker.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Button, Col, Container, Dropdown, DropdownButton, Form, Modal, Row, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

function Dashboard() {
  const [pipelinesData, setPipelinesData] = useState([]);
  const [totalPipelinesCount, setTotalPipelinesCount] = useState(0);
  const [data, setData] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [birthdayCustomers, setBirthdayCustomers] = useState([]);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [dateRangeTitle, setDateRangeTitle] = useState('1 tuần qua');
  const [completedPipelinesCount, setCompletedPipelinesCount] = useState(0);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedPipelines, setCompletedPipelines] = useState([]);
  const [cancelledPipelines, setCancelledPipelines] = useState([]);
  const [cancelledPipelinesCount, setCancelledPipelinesCount] = useState(0);
  const [cancelRate, setCancelRate] = useState(0);
  const [products, setProducts] = useState([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCancelledModal, setShowCancelledModal] = useState(false);

  const defaultUserId = '6673b41f56d8b67ed4a5465e';

  // ── Fetch sản phẩm ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/products/getallproducts/${defaultUserId}`);
      const raw = Array.isArray(response.data) ? response.data : response.data?.products || [];
      // Chỉ lấy sản phẩm có TaxCode hợp lệ — loại null, undefined, '', 'N/A'
      const INVALID_CODES = ['', 'n/a', 'null', 'undefined', 'N/A'];
      const result = raw.filter((p) => {
        if (!p.TaxCode) return false;
        const code = p.TaxCode.toString().trim();
        return code.length > 0 && !INVALID_CODES.includes(code);
      });
      setProducts(result);
      setTotalProductsCount(result.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalProductsCount(0);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Date range ────────────────────────────────────────────────────────────
  const handleDateRange = (range) => {
    const now = new Date();
    setDateRangeTitle(range);
    if (range === 'Hôm nay') {
      setStartDate(new Date());
      setEndDate(new Date());
    } else if (range === '1 tuần qua') {
      setStartDate(new Date(new Date().setDate(now.getDate() - 7)));
      setEndDate(new Date());
    } else if (range === '1 tháng qua') {
      setStartDate(new Date(new Date().setMonth(now.getMonth() - 1)));
      setEndDate(new Date());
    }
  };

  // ── Fetch pipelines ───────────────────────────────────────────────────────
  const fetchPipelinesRole = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(
        `https://www.system.crmkhitam.com/api/v1/pineline/getpinelinerole?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      const pipelinesList = result.pipelines || [];
      const completed = pipelinesList.filter((p) => p.status === 'Completed');
      const cancelled = pipelinesList.filter((p) => p.status === 'Cancelled');
      const totalAmount = completed.reduce((sum, p) => sum + (p.amountTotal || 0), 0);
      const cancelRateValue = completed.length > 0 ? (cancelled.length / completed.length) * 100 : 0;
      setTotalPipelinesCount(totalAmount);
      setPipelinesData(pipelinesList);
      setCompletedPipelines(completed);
      setCancelledPipelines(cancelled);
      setCompletedPipelinesCount(completed.length);
      setCancelledPipelinesCount(cancelled.length);
      setCancelRate(cancelRateValue.toFixed(2));
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    }
  };

  // ── Fetch contacts ────────────────────────────────────────────────────────
  const fetchData = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(
        `https://www.system.crmkhitam.com/api/v1/contact/contacts?user_id=${userId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result.contacts || []);
      setTotalCustomers(result.contacts?.length || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchData1 = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`https://www.system.crmkhitam.com/api/v1/contact/contacts?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result.contacts || []);
      const currentMonth = new Date().getMonth() + 1;
      const birthdays = (result.contacts || []).filter((c) => new Date(c.birthDate).getMonth() + 1 === currentMonth);
      setBirthdayCustomers(birthdays);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData1();
  }, []);
  useEffect(() => {
    fetchData();
    fetchPipelinesRole();
  }, [startDate, endDate]);

  return (
    <Container fluid>
      {/* ── Banner ── */}
      <Row className="text-center mb-4">
        <Col md={12}>
          <div
            style={{
              background: '#f0f8ff',
              border: '1px solid #054a27',
              borderRadius: '8px',
              padding: '15px',
              color: '#054a27',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            Yêu thương chúc bạn một hành trình thịnh vượng và hạnh phúc
            <br />
            <span style={{ fontStyle: 'italic', fontSize: '16px' }}>Chia sẻ từ Cô Sridevi Tố Hải</span>
          </div>
        </Col>
      </Row>

      {/* ── Bộ lọc ngày ── */}
      <Row className="mb-4">
        <Col md={12}>
          <h5>Lọc theo ngày</h5>
          <div className="d-flex align-items-center">
            <DropdownButton id="date-range-dropdown" title={dateRangeTitle} onSelect={handleDateRange}>
              <Dropdown.Item eventKey="Hôm nay">Hôm nay</Dropdown.Item>
              <Dropdown.Item eventKey="1 tuần qua">1 tuần qua</Dropdown.Item>
              <Dropdown.Item eventKey="1 tháng qua">1 tháng qua</Dropdown.Item>
            </DropdownButton>
            <Form className="d-flex ml-3">
              <Form.Group className="mr-3">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Chọn ngày bắt đầu"
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />
              </Form.Group>
              <Form.Group>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="Chọn ngày kết thúc"
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                />
              </Form.Group>
            </Form>
          </div>
        </Col>
      </Row>

      {/* ── Báo cáo ── */}
      <Row className="mb-4">
        <Col md={12}>
          <h3 className="mt-3">Báo cáo</h3>
        </Col>
      </Row>
      <Row className="mb-4 text-center">
        <Col
          md={2}
          className="border p-3"
          onClick={() => {
            setModalData(data);
            setShowModal(true);
          }}
          style={{ cursor: 'pointer' }}
        >
          <h4>{totalCustomers}</h4>
          <p>Khách hàng mới</p>
        </Col>
        <Col md={2} className="border p-3" onClick={() => setShowBirthdayModal(true)} style={{ cursor: 'pointer' }}>
          <h4>{birthdayCustomers.length}</h4>
          <p>Tháng sinh nhật</p>
        </Col>
        <Col md={2} className="border p-3" onClick={() => setShowCompletedModal(true)} style={{ cursor: 'pointer' }}>
          <p>Doanh số kiếm được</p>
          <h4>{totalPipelinesCount.toLocaleString('vi-VN')} VND</h4>
          <p>Số lượng đơn hàng</p>
          <h4>{completedPipelinesCount}</h4>
        </Col>
        <Col md={2} className="border p-3" onClick={() => setShowCancelledModal(true)} style={{ cursor: 'pointer' }}>
          <p>Tỉ lệ hủy đơn</p>
          <h4>{cancelRate}%</h4>
          <p>Số lượng đơn hủy</p>
          <h4>{cancelledPipelinesCount}</h4>
        </Col>
        <Col md={2} className="border p-3" onClick={() => setShowProductModal(true)} style={{ cursor: 'pointer' }}>
          <h4>{totalProductsCount}</h4>
          <p>Danh sách sản phẩm</p>
        </Col>
        <Col md={2} className="border p-3">
          <h4>2</h4>
          <p>KPI</p>
        </Col>
      </Row>

      {/* ── Quote ── */}
      <Row className="text-center">
        <Col md={12}>
          <div
            style={{
              background: '#fffbea',
              border: '1px solid #054a27',
              borderRadius: '8px',
              padding: '10px',
              color: '#054a27',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '15px'
            }}
          >
            Chúc bạn thành công.
            <br />
            <span style={{ fontStyle: 'italic', fontSize: '14px' }}>
              "Tư vấn tận tâm, làm việc tận lực để thành công không phiền muộn"
              <br />- Master Sridevi Tố Hải
            </span>
          </div>
        </Col>
      </Row>

      {/* ══ Modal khách hàng mới ═══════════════════════════════════════════ */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Danh sách khách hàng mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {modalData
                .filter((item) => {
                  const code = String(item.profileCode ?? '').trim();
                  return code !== '' && code !== 'N/A' && code !== 'null' && code !== 'undefined' && code !== 'NaN';
                })
                .map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.profileCode}</td>
                    <td>{item.name || 'Không có tên'}</td>
                    <td>{item.email || 'Không có email'}</td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ══ Modal sinh nhật ════════════════════════════════════════════════ */}
      <Modal show={showBirthdayModal} onHide={() => setShowBirthdayModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Khách hàng sinh nhật trong tháng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {birthdayCustomers.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên khách hàng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Sinh nhật</th>
                  <th>Thành phố</th>
                </tr>
              </thead>
              <tbody>
                {birthdayCustomers.map((customer, index) => (
                  <tr key={customer._id || index}>
                    <td>{customer.profileCode || 'N/A'}</td>
                    <td>{customer.name || 'Không có tên'}</td>
                    <td>{customer.email || 'Không có email'}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{customer.birthDate ? new Date(customer.birthDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{customer.city || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Không có khách hàng nào sinh nhật trong tháng này.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBirthdayModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ══ Modal đơn completed ════════════════════════════════════════════ */}
      <Modal show={showCompletedModal} onHide={() => setShowCompletedModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Danh sách đơn hàng Completed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {completedPipelines.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên khách hàng</th>
                  <th>Email</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {completedPipelines.map((pipeline, index) => (
                  <tr key={pipeline._id || index}>
                    <td>{pipeline.orderCode || 'N/A'}</td>
                    <td>{pipeline.contact?.name || 'Không có tên'}</td>
                    <td>{pipeline.contact?.email || 'Không có email'}</td>
                    <td>{(pipeline.amountTotal || 0).toLocaleString('vi-VN')} VND</td>
                    <td>{pipeline.createdAt ? new Date(pipeline.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Không có đơn hàng Completed.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletedModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ══ Modal đơn hủy ══════════════════════════════════════════════════ */}
      <Modal show={showCancelledModal} onHide={() => setShowCancelledModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Danh sách đơn hàng bị hủy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelledPipelines.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên khách hàng</th>
                  <th>Email</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {cancelledPipelines.map((pipeline, index) => (
                  <tr key={pipeline._id || index}>
                    <td>{index + 1}</td>
                    <td>{pipeline.contact?.name || 'Không có tên'}</td>
                    <td>{pipeline.contact?.email || 'Không có email'}</td>
                    <td>{(pipeline.amountTotal || 0).toLocaleString('vi-VN')} VND</td>
                    <td>{pipeline.createdAt ? new Date(pipeline.createdAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Không có đơn hàng nào bị hủy.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelledModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ══ Modal sản phẩm — gộp Academy + Health Hub → KhiTamTherapy ══════ */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg" dialogClassName="custom-wide-modal">
        <Modal.Header closeButton>
          <Modal.Title>Danh sách sản phẩm KhiTamTherapy</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {products.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã sản phẩm</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((product) => {
                    const code = String(product.TaxCode ?? '').trim();
                    return code !== '' && code !== 'N/A' && code !== 'null' && code !== 'undefined' && code !== 'NaN';
                  })
                  .map((product, index) => (
                    <tr key={product._id || index}>
                      <td>{index + 1}</td>
                      <td>{product.TaxCode}</td>
                      <td
                        style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        title={product.name}
                      >
                        {product.name || 'Không có tên'}
                      </td>
                      <td>{(product.price || 0).toLocaleString('vi-VN')} VND</td>
                      <td>{product.status || 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          ) : (
            <p>Không có sản phẩm nào.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Dashboard;

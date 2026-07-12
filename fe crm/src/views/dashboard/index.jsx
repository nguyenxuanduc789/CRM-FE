import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tabs, Tab, Spinner } from 'react-bootstrap';
import axios from 'axios';

const DashDefault = () => {
  const [leads, setLeads] = useState([]);
  const [successfulOrders, setSuccessfulOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, ordersRes] = await Promise.all([
          axios.get('https://www.beassess.khitamtherapyintl.com/api/customers'),
          axios.get('https://www.beassess.khitamtherapyintl.com/api/orders?status=PAID')
        ]);
        
        if (leadsRes.data.success) {
          setLeads(leadsRes.data.data || []);
        }
        if (ordersRes.data.success) {
          setSuccessfulOrders(ordersRes.data.data || []);
        }
      } catch (err) {
        setError('Lỗi kết nối đến máy chủ API');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Gom nhóm dữ liệu theo Task
  const groupedLeads = leads.reduce((acc, lead) => {
    const taskName = lead.task || 'Khác (Không có task)';
    if (!acc[taskName]) {
      acc[taskName] = [];
    }
    acc[taskName].push(lead);
    return acc;
  }, {});

  const tasks = Object.keys(groupedLeads);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Đang tải dữ liệu khách hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <React.Fragment>
      <Row>
        <Col xl={12}>
          <h4 className="mb-4">Dashboard - Quản lý Khách Hàng Tiềm Năng (Leads)</h4>
        </Col>
        
        {/* Thẻ tổng hợp tổng số khách hàng */}
        <Col xl={4} md={6}>
          <Card>
            <Card.Body>
              <h6 className="mb-4">Tổng số Khách hàng (Tất cả)</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-users text-c-blue f-30 m-r-10" /> {leads.length}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Thẻ tổng hợp Đơn hàng thành công */}
        <Col xl={4} md={6}>
          <Card>
            <Card.Body>
              <h6 className="mb-4 text-success">Đơn hàng Thành công (PAID)</h6>
              <div className="row d-flex align-items-center">
                <div className="col-9">
                  <h3 className="f-w-300 d-flex align-items-center m-b-0">
                    <i className="feather icon-shopping-cart text-c-green f-30 m-r-10" /> {successfulOrders.length}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Các thẻ tổng hợp theo từng Task */}
        {tasks.map((taskName, idx) => (
          <Col xl={4} md={6} key={idx}>
            <Card>
              <Card.Body>
                <h6 className="mb-4 text-truncate" title={taskName}>{taskName}</h6>
                <div className="row d-flex align-items-center">
                  <div className="col-9">
                    <h3 className="f-w-300 d-flex align-items-center m-b-0">
                      <i className="feather icon-user-check text-c-green f-30 m-r-10" /> {groupedLeads[taskName].length}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="Recent-Users widget-focus-lg">
            <Card.Header>
              <Card.Title as="h5">Danh sách Khách hàng chi tiết theo Mục đích (Task)</Card.Title>
            </Card.Header>
            <Card.Body className="px-0 py-2">
              <Tabs defaultActiveKey={tasks[0] || 'all'} id="leads-tab" className="mb-3 px-4">
                {tasks.map((taskName, idx) => (
                  <Tab eventKey={taskName} title={`${taskName} (${groupedLeads[taskName].length})`} key={idx}>
                    <Table responsive hover className="recent-users mt-3">
                      <thead>
                        <tr>
                          <th>Họ và Tên</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Nguồn</th>
                          <th>Ngày đăng ký</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedLeads[taskName].map((lead, i) => (
                          <tr key={i} className="unread">
                            <td>
                              <h6 className="mb-1">{lead.fullName}</h6>
                            </td>
                            <td>{lead.email}</td>
                            <td>{lead.phone}</td>
                            <td>{lead.source || 'Website'}</td>
                            <td>
                              <h6 className="text-muted">
                                <i className="fa fa-circle text-c-green f-10 m-r-15" />
                                {new Date(lead.createdAt).toLocaleString('vi-VN')}
                              </h6>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Tab>
                ))}
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <Card className="Recent-Users widget-focus-lg">
            <Card.Header>
              <Card.Title as="h5" className="text-success">Đơn Hàng Thành Công (PAID)</Card.Title>
            </Card.Header>
            <Card.Body className="px-0 py-2">
              <div className="px-4">
                <Table responsive hover className="recent-users mt-3">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Email / SĐT</th>
                      <th>Khóa học</th>
                      <th>Số tiền</th>
                      <th>Ngày thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successfulOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">Chưa có đơn hàng nào thành công</td>
                      </tr>
                    ) : (
                      successfulOrders.map((order, i) => (
                        <tr key={i} className="unread">
                          <td>
                            <h6 className="mb-1">{order.customerName}</h6>
                          </td>
                          <td>
                            <div>{order.customerEmail}</div>
                            <div className="text-muted">{order.customerPhone}</div>
                          </td>
                          <td>{order.courseName}</td>
                          <td>
                            <h6 className="text-success font-weight-bold">
                              {new Intl.NumberFormat('vi-VN').format(order.totalAmount || 0)} {order.currency || 'VND'}
                            </h6>
                          </td>
                          <td>
                            <h6 className="text-muted">
                              <i className="fa fa-circle text-c-green f-10 m-r-15" />
                              {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </h6>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DashDefault;

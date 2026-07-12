import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Table, Spinner, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaUserCheck,
  FaSortDown,
  FaSortUp,
  FaRegStickyNote,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileExcel,
  FaFilter,
  FaSearch,
  FaInfoCircle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const Accountant = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [dateFilter, setDateFilter] = useState('lastMonth');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [processingInstallments, setProcessingInstallments] = useState(new Set());

  // Modern UI Styles
  const cardStyle = {
    borderRadius: '16px',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #edf2f7'
  };

  const tabButtonStyle = (status) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: currentStatus === status ? '#0061ff' : 'transparent',
    color: currentStatus === status ? '#ffffff' : '#718096',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: currentStatus === status ? '0 4px 12px rgba(0, 97, 255, 0.2)' : 'none'
  });

  const installmentCardStyle = (isPaid) => ({
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '0.75rem',
    border: isPaid ? '1px solid #c6f6d5' : '1px solid #feebc8',
    backgroundColor: isPaid ? '#f0fff4' : '#fffaf0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '6673b41f56d8b67ed4a5465e';
        let startDateFilter = new Date();
        let endDateFilter = new Date();

        if (dateFilter === 'lastWeek') startDateFilter.setDate(startDateFilter.getDate() - 7);
        else if (dateFilter === 'lastMonth') startDateFilter.setMonth(startDateFilter.getMonth() - 1);
        else if (dateFilter === 'today') startDateFilter.setHours(0, 0, 0, 0);
        else if (dateFilter === 'custom') {
          startDateFilter = startDate;
          endDateFilter = endDate;
        }

        const response = await fetch(
          `https://www.system.crmkhitam.com/api/v1/pineline/getpinelinerole?user_id=${userId}&start_date=${startDateFilter.toISOString()}&end_date=${endDateFilter.toISOString()}`
        );
        const data = await response.json();
        setOrders(data.pipelines || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [refresh, dateFilter, startDate, endDate]);

  const handleStatusChange = async () => {
    if (!selectedOrder) return;
    const userId = localStorage.getItem('userId');
    setConfirmLoading(true);
    try {
      const response = await fetch(`https://www.system.crmkhitam.com/api/v1/pineline/pipelines/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId })
      });
      if (response.ok) {
        setRefresh(!refresh);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setConfirmLoading(false);
      setShowModal(false);
    }
  };

  const handleEditStatus = async (installmentId, statusValue) => {
    try {
      setProcessingInstallments((prev) => new Set(prev).add(installmentId));
      const userId = localStorage.getItem('userId');
      const response = await fetch(`https://www.system.crmkhitam.com/api/v1/pineline/installments/update-status/${installmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusValue, userId })
      });
      if (response.ok) {
        setRefresh(!refresh);
      } else {
        const err = await response.json();
        alert(`Lỗi: ${err.message || 'Không thể cập nhật'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessingInstallments((prev) => {
        const next = new Set(prev);
        next.delete(installmentId);
        return next;
      });
    }
  };

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      'Mã Đơn': order.orderCode,
      'Khách Hàng': order.contact?.name,
      Email: order.contact?.email,
      'Tổng Tiền': order.amountTotal,
      'Trạng Thái': order.status,
      'Ngày Đặt': new Date(order.createdAt).toLocaleDateString('vi-VN')
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `Bao_Cao_Ke_Toan_${currentStatus}.xlsx`);
  };

  const filteredOrders = orders
    .filter((o) => o.status === currentStatus)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const renderTable = () => (
    <div className="table-responsive px-4 pb-4">
      <Table hover className="align-middle border-0">
        <thead className="bg-white">
          <tr className="text-secondary text-uppercase small font-weight-bold" style={{ letterSpacing: '0.05em' }}>
            <th className="border-0 py-3 text-center" style={{ width: '80px' }}>
              Mã Đơn
            </th>
            <th className="border-0 py-3" style={{ width: '180px' }}>
              Người tạo & Affiliate
            </th>
            <th className="border-0 py-3" style={{ width: '160px' }}>
              Khách hàng
            </th>
            <th className="border-0 py-3" style={{ width: '200px' }}>
              Sản phẩm
            </th>
            <th className="border-0 py-3" style={{ width: '300px' }}>
              Lịch trình Trả góp / Phụ thu
            </th>
            <th className="border-0 py-3 text-end" style={{ width: '130px' }}>
              Tổng thực tế
            </th>
            <th className="border-0 py-3 text-center" style={{ width: '80px' }}>
              Chứng từ
            </th>
            <th className="border-0 py-3 text-center" style={{ width: '100px' }}>
              Trạng thái
            </th>
            <th
              className="border-0 py-3 text-center"
              style={{ cursor: 'pointer', color: '#0061ff', width: '100px' }}
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            >
              Cập nhật {sortOrder === 'newest' ? <FaSortDown /> : <FaSortUp />}
            </th>
            <th className="border-0 py-3 text-center" style={{ width: '60px' }}>
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-5 text-muted">
                <FaInfoCircle size={30} className="mb-2 opacity-50" />
                <br />
                Không có dữ liệu trong mục này
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <React.Fragment key={order._id}>
                <tr
                  className="border-bottom"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: order.PaymentType === 'Install' ? '#fcfaff' : 'inherit'
                  }}
                >
                  <td className="text-center">
                    <div className="font-weight-bold text-dark">{order.orderCode || 'N/A'}</div>
                    {order.PaymentType === 'Install' && (
                      <Badge bg="warning" text="dark" className="smaller mt-1" style={{ fontSize: '0.6rem' }}>
                        TRẢ GÓP
                      </Badge>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="font-weight-bold smaller">
                          {order.createdBy?.lastname} {order.createdBy?.firstname}
                        </div>
                        {order.affiliate_id && (
                          <div className="text-primary smaller" style={{ fontSize: '0.7rem' }}>
                            <FaUserCheck /> {order.affiliate_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-weight-bold smaller">{order.contact?.name}</div>
                    <div className="text-muted smaller" style={{ fontSize: '0.7rem' }}>
                      {order.contact?.phone}
                    </div>
                  </td>
                  <td>
                    {order.products?.map((p, i) => (
                      <div key={i} className="smaller font-weight-bold text-dark mb-1">
                        • {p.name}
                      </div>
                    ))}
                    {order.stage && <div className="smaller text-muted mt-1 italic">GĐ: {order.stage}</div>}
                  </td>
                  <td>
                    <div className="installment-column-view">
                      {order.PaymentType === 'Install' ? (
                        <div className="d-flex flex-column gap-1">
                          {/* First Payment row in column */}
                          <div
                            className={`d-flex justify-content-between align-items-center p-1 rounded ${order.firstPaymentConfirmed ? 'bg-success-light' : 'bg-warning-light'}`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <span>
                              Tiền cọc: <strong>{(order.Firstpayment || 0).toLocaleString()}</strong>
                            </span>
                            {order.firstPaymentConfirmed ? (
                              <Badge bg="success" pill style={{ fontSize: '0.6rem' }}>
                                Đã thu
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="warning"
                                style={{ fontSize: '0.6rem', padding: '1px 5px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setNewStatus('Installment');
                                  setShowModal(true);
                                }}
                              >
                                Duyệt cọc
                              </Button>
                            )}
                          </div>
                          {/* Next installments in column */}
                          {order.installmentPlans?.map((plan, idx) => {
                            const instNumMatch = plan.installmentNumber?.match(/\d+/);
                            const instNum = instNumMatch ? parseInt(instNumMatch[0]) : null;
                            const pipelineInst = order.installments?.find((i) => i.installmentNumber === instNum);
                            const isActuallyPaid = pipelineInst ? pipelineInst.isPaid : plan.Status === 'Completed';

                            return (
                              <div
                                key={plan._id}
                                className="d-flex justify-content-between align-items-center p-1 rounded bg-light"
                                style={{ fontSize: '0.7rem', border: '1px solid #eee' }}
                              >
                                <span>
                                  {plan.installmentNumber}: <strong>{(plan.PaidAmount || 0).toLocaleString()}</strong>
                                </span>
                                {!isActuallyPaid ? (
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    style={{ fontSize: '0.6rem', padding: '1px 5px', minWidth: '50px' }}
                                    disabled={processingInstallments.has(plan._id)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditStatus(plan._id, 'Completed');
                                    }}
                                  >
                                    {processingInstallments.has(plan._id) ? <Spinner animation="border" size="sm" /> : 'Duyệt'}
                                  </Button>
                                ) : (
                                  <Badge bg="success" pill style={{ fontSize: '0.6rem' }}>
                                    ✓
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-muted smaller">Một lần</div>
                      )}
                      {order.surcharge > 0 && <div className="smaller text-danger mt-1">Phụ thu: +{order.surcharge.toLocaleString()}</div>}
                    </div>
                  </td>
                  <td className="text-end font-weight-bold text-dark">{(order.amountTotal || 0).toLocaleString()}</td>
                  <td className="text-center">
                    {order.images && order.images.length > 0 ? (
                      <div className="d-flex flex-wrap justify-content-center gap-1">
                        {order.images.map((img, idx) => (
                          <Button
                            key={idx}
                            variant="primary"
                            size="sm"
                            className="py-0 px-1"
                            style={{ fontSize: '0.7rem', backgroundColor: '#007bff', border: 'none', minWidth: '40px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.system.crmkhitam.com${img.url}`, '_blank');
                            }}
                          >
                            Ảnh {idx + 1}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted font-italic" style={{ fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td className="text-center">
                    <Form.Select
                      size="sm"
                      className="border-0 bg-light rounded-pill px-3 py-1 font-weight-bold smaller"
                      value={order.status}
                      onChange={(e) => {
                        setSelectedOrder(order);
                        setNewStatus(e.target.value);
                        setShowModal(true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Installment">Installment</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                  </td>
                  <td className="text-center smaller text-muted">
                    {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    <br />
                    {order.updatedAt && new Date(order.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="link"
                      className="text-primary p-0 shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedRow(expandedRow === order._id ? null : order._id);
                      }}
                    >
                      {expandedRow === order._id ? <FaChevronUp /> : <FaRegStickyNote size={16} />}
                    </Button>
                  </td>
                </tr>

                {expandedRow === order._id && (
                  <tr>
                    <td colSpan="10" className="bg-light-soft p-4 border-0">
                      <div className="bg-white rounded-lg shadow-sm p-4 border animate-fade-in">
                        <Row className="gy-4">
                          <Col lg={12}>
                            <h6 className="text-uppercase text-muted smaller font-weight-bold mb-3">Thông tin chi tiết đơn hàng</h6>
                            <Row className="g-3">
                              {[
                                { label: 'Giai đoạn', value: order.stage, icon: <FaFilter className="text-info" /> },
                                {
                                  label: 'Tạm ứng',
                                  value: (order.depositAmount || 0).toLocaleString() + ' VND',
                                  icon: <FaMoneyBillWave className="text-success" />
                                },
                                {
                                  label: 'Phụ thu',
                                  value: (order.surcharge || 0).toLocaleString() + ' VND',
                                  icon: <FaMoneyBillWave className="text-warning" />
                                },
                                {
                                  label: 'Tổng tiền gốc',
                                  value: (order.totalAmount || 0).toLocaleString() + ' VND',
                                  icon: <FaMoneyBillWave className="text-primary" />
                                }
                              ].map((item, i) => (
                                <Col sm={3} key={i}>
                                  <div className="d-flex align-items-center p-3 border rounded-lg bg-light-soft">
                                    <div className="mr-3 p-2 bg-white rounded-circle shadow-sm">{item.icon}</div>
                                    <div>
                                      <div className="smaller text-muted">{item.label}</div>
                                      <div className="font-weight-bold text-dark smaller">{item.value}</div>
                                    </div>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                            <div className="mt-4 p-3 bg-white border rounded-lg">
                              <label className="smaller text-muted font-weight-bold d-block mb-2 text-uppercase">Ghi chú nội bộ</label>
                              <div className="text-dark italic small border-left-blue pl-3">{order.pipelineNotes || 'Trống...'}</div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div className="ke-toan-wrapper bg-soft-gray min-vh-100 p-4">
      <Card style={cardStyle} className="mb-4">
        <div style={headerStyle}>
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <div>
              <h3 className="font-weight-bold text-dark mb-1">Xác nhận đơn hàng</h3>
              <p className="text-muted mb-0 small">Quản lý và đối soát các giao dịch thanh toán từ Sale</p>
            </div>
            <div className="d-flex gap-2 mt-2 mt-md-0">
              <Button
                variant="white"
                className="border shadow-sm font-weight-bold rounded-lg px-4"
                onClick={exportToExcel}
                disabled={filteredOrders.length === 0}
              >
                <FaFileExcel className="mr-2 text-success" /> Xuất Excel
              </Button>
            </div>
          </div>

          <div className="filters-row d-flex mt-4 gap-3 flex-wrap">
            <div className="filter-group d-flex align-items-center bg-white border rounded-lg px-3 shadow-sm" style={{ height: '48px' }}>
              <FaCalendarAlt className="text-muted mr-2" />
              <Form.Select
                className="border-0 shadow-none smaller font-weight-bold"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setIsCustomDate(e.target.value === 'custom');
                }}
              >
                <option value="today">Ngày hôm nay</option>
                <option value="lastWeek">1 tuần qua</option>
                <option value="lastMonth">1 tháng qua</option>
                <option value="custom">Tùy chọn...</option>
              </Form.Select>
            </div>

            {isCustomDate && (
              <div className="d-flex gap-2 align-items-center bg-white border rounded-lg px-3 shadow-sm">
                <DatePicker selected={startDate} onChange={(d) => setStartDate(d)} className="border-0 smaller w-100" />
                <span className="text-muted">→</span>
                <DatePicker selected={endDate} onChange={(d) => setEndDate(d)} className="border-0 smaller w-100" />
              </div>
            )}

            <div className="tabs-container d-flex bg-light-soft p-1 rounded-xl shadow-inner ml-auto">
              {['Pending', 'Completed', 'Installment', 'Cancelled'].map((status) => (
                <button key={status} onClick={() => setCurrentStatus(status)} style={tabButtonStyle(status)}>
                  {status === 'Pending' && 'Chờ xử lý'}
                  {status === 'Completed' && 'Thành công'}
                  {status === 'Installment' && 'Trả góp'}
                  {status === 'Cancelled' && 'Đã hủy'}
                  <Badge
                    bg={currentStatus === status ? 'light' : 'secondary'}
                    className={currentStatus === status ? 'text-primary' : 'text-white'}
                  >
                    {orders.filter((o) => o.status === status).length}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Card.Body className="p-0 mt-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="lg" />
              <p className="mt-3 text-muted font-weight-bold">Đang tải đơn hàng...</p>
            </div>
          ) : (
            renderTable()
          )}
        </Card.Body>
      </Card>

      <style>{`
        .ke-toan-wrapper { font-family: 'Inter', sans-serif; }
        .bg-soft-gray { background-color: #f4f7fa; }
        .bg-light-soft { background-color: #f8fafc; }
        .rounded-xl { border-radius: 14px; }
        .rounded-lg { border-radius: 12px; }
        .shadow-inner { box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
        .smaller { font-size: 0.85rem; }
        .smaller-bold { font-size: 0.85rem; font-weight: 700; }
        .italic { font-style: italic; }
        .text-orange { color: #fd7e14; }
        .border-left-blue { border-left: 4px solid #0061ff; }
        .dashed-border { border: 2px dashed #e2e8f0; }
        .bg-light-blue { background-color: #e3f2fd; }
        .avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .bg-success-light { background-color: #f0fff4; }
        .bg-warning-light { background-color: #fffaf0; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .installment-scroll { max-height: 400px; overflow-y: auto; padding-right: 5px; }
        .installment-scroll::-webkit-scrollbar { width: 4px; }
        .installment-scroll::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
        .status-select:focus { box-shadow: none; border-color: #0061ff; }
      `}</style>

      {/* Confirmation Modals */}
      <Modal show={showModal} onHide={() => !confirmLoading && setShowModal(false)} centered className="border-0">
        <Modal.Body className="text-center p-5">
          {confirmLoading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <>
              <div className="mb-4 bg-light-blue rounded-circle p-4 d-inline-block">
                <FaInfoCircle size={40} className="text-primary" />
              </div>
              <h4 className="font-weight-bold mb-3">Xác nhận thay đổi</h4>
              <p className="text-muted mb-4 px-4">
                Bạn có chắc chắn muốn chuyển trạng thái đơn hàng <strong>{selectedOrder?.orderCode}</strong> sang{' '}
                <strong>{newStatus}</strong>?
              </p>
              <div className="d-grid gap-2">
                <Button variant="primary" size="lg" className="rounded-pill font-weight-bold shadow-sm" onClick={handleStatusChange}>
                  Xác nhận ngay
                </Button>
                <Button variant="light" size="lg" className="rounded-pill font-weight-bold text-muted" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="font-weight-bold">Chi tiết ghi chú</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-5">
          <div className="bg-light p-4 rounded-lg">
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }} className="mb-0 small">
              {selectedNotes}
            </pre>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Accountant;

import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Table, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaUserCheck, FaSortDown, FaSortUp } from 'react-icons/fa';
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
  const [confirmLoading, setConfirmLoading] = useState(false); // � loading riêng cho nút xác nhận
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  const detailStyle = {
    padding: '5px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const handleShowNotes = (order) => {
    const allNotes = [];
    if (order.pipelineNotes) {
      allNotes.push(`Ghi chú n�i b�: ${order.pipelineNotes}`);
    }
    if (order.externalNotes && order.externalNotes.length > 0) {
      order.externalNotes.forEach((note) => {
        const creatorName = `${note.createdBy?.firstname || ''} ${note.createdBy?.lastname || ''}` || 'Người tạo không xác ��nh';
        const noteDate = new Date(note.createdAt).toLocaleDateString('vi-VN') || 'Ngày không xác ��nh';
        allNotes.push(`Người tạo: ${creatorName} (Ngày: ${noteDate})\n${note.content}`);
      });
    }
    setSelectedNotes(allNotes.join('\n\n'));
    setSelectedOrder(order);
    setShowNotesModal(true);
  };

  const handleCloseNotes = () => {
    setShowNotesModal(false);
    setSelectedOrder(null);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setIsCustomDate(e.target.value === 'custom');
  };

  const toggleRow = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = '6673b41f56d8b67ed4a5465e';
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

        const response = await fetch(
          `https://www.system.crmkhitam.com/api/v1/pineline/getpinelinerole?user_id=${userId}&start_date=${startDateFilter.toISOString()}&end_date=${endDateFilter.toISOString()}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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

  const confirmStatusChange = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setShowModal(true);
  };

  // � Thêm confirmLoading bao quanh toàn b� xử lý
  const handleStatusChange = async () => {
    if (!selectedOrder) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    setConfirmLoading(true); // � Bắt �ầu loading
    try {
      const response = await fetch(`https://www.system.crmkhitam.com/api/v1/pineline/pipelines/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId })
      });

      if (response.ok) {
        setOrders((prevOrders) => prevOrders.map((order) => (order._id === selectedOrder._id ? { ...order, status: newStatus } : order)));
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setConfirmLoading(false); // � Kết thúc loading
      setShowModal(false);
      setSelectedOrder(null);
    }
  };

  const handleEditStatus = async (installmentId, newStatus) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`https://www.system.crmkhitam.com/api/v1/pineline/installments/update-status/${installmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Cập nhật trạng thái thành công!');
        setRefresh((prev) => !prev);
      } else {
        alert('L�i khi cập nhật trạng thái: ' + result.message);
      }
    } catch (error) {
      console.error('L�i khi gửi yêu cầu:', error);
      alert('Có l�i xảy ra, vui lòng thử lại.');
    }
  };

  const exportToExcel = () => {
    // M�i sản phẩm trong �ơn hàng sẽ tách thành 1 dòng riêng
    const exportData = [];

    filteredOrders.forEach((order) => {
      const products = order.products && order.products.length > 0 ? order.products : [null];

      products.forEach((product, idx) => {
        const isFirst = idx === 0;
        exportData.push({
          // Thông tin �ơn hàng ch� hi�n th� � dòng �ầu tiên
          'Mã Đơn Hàng': isFirst ? order.orderCode || '' : '',
          'Người Tạo': isFirst
            ? order.createdBy
              ? `${order.createdBy.lastname || ''} ${order.createdBy.firstname || ''}`.trim()
              : 'Chưa phân công'
            : '',
          'Vai Trò': isFirst ? order.createdBy?.role?.name || '' : '',
          'Affiliate ID': isFirst ? order.affiliate_id || '' : '',
          'Affiliate Name': isFirst ? order.affiliate_name || '' : '',
          'Tên Khách Hàng': isFirst ? order.contact?.name || '' : '',
          Email: isFirst ? order.contact?.email || '' : '',
          'S� Đi�n Thoại': isFirst ? order.contact?.phone || '' : '',

          // Thông tin sản phẩm � m�i dòng 1 sản phẩm
          'Tên Sản Phẩm': product ? product.name || '' : '',
          'Danh Mục': product ? product.category || '' : '',
          'Giá Sản Phẩm (VND)': product ? (typeof product.price === 'number' ? product.price : 0) : '',

          // Tài chính ch� hi�n th� � dòng �ầu �� không b� c�ng trùng
          'Phụ Thu (VND)': isFirst ? (typeof order.surcharge === 'number' ? order.surcharge : 0) : '',
          'T�ng Tiền Thực Tế (VND)': isFirst ? (typeof order.amountTotal === 'number' ? order.amountTotal : 0) : '',
          'Tạm Ứng (VND)': isFirst ? (typeof order.depositAmount === 'number' ? order.depositAmount : 0) : '',
          'T�ng Tiền G�c (VND)': isFirst ? (typeof order.totalAmount === 'number' ? order.totalAmount : 0) : '',

          // Thông tin trạng thái ch� � dòng �ầu
          'Giai Đoạn': isFirst ? order.stage || '' : '',
          'Trạng Thái': isFirst ? order.status || '' : '',
          'Ngày Tạo': isFirst ? (order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '') : '',
          'Ngày Cập Nhật': isFirst ? (order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('vi-VN') : '') : '',
          'Ghi Chú': isFirst ? order.pipelineNotes || '' : ''
        });
      });
    });

    if (exportData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const headers = Object.keys(exportData[0]);

    // Xác ��nh index các c�t tiền t� (�� format number)
    const moneyCols = ['Giá Sản Phẩm (VND)', 'Phụ Thu (VND)', 'T�ng Tiền Thực Tế (VND)', 'Tạm Ứng (VND)', 'T�ng Tiền G�c (VND)'];
    const moneyColLetters = moneyCols
      .map((name) => {
        const colIdx = headers.indexOf(name);
        if (colIdx === -1) return null;
        // Convert index to Excel column letter (A=0, B=1, ...)
        let letter = '';
        let n = colIdx;
        do {
          letter = String.fromCharCode(65 + (n % 26)) + letter;
          n = Math.floor(n / 26) - 1;
        } while (n >= 0);
        return letter;
      })
      .filter(Boolean);

    const rowCount = exportData.length;

    // Format s� cho các c�t tiền t�
    moneyColLetters.forEach((col) => {
      for (let row = 2; row <= rowCount + 1; row++) {
        const cellRef = `${col}${row}`;
        if (worksheet[cellRef] !== undefined && worksheet[cellRef].v !== '') {
          const raw = worksheet[cellRef].v;
          const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
          worksheet[cellRef] = {
            v: isNaN(num) ? 0 : num,
            t: 'n',
            z: '#,##0'
          };
        }
      }
    });

    // Dòng T�NG C�NG � cu�i � ch� sum các c�t tài chính (không sum Giá Sản Phẩm vì có th� trùng)
    const totalRow = rowCount + 2;
    worksheet[`A${totalRow}`] = { v: 'T�NG C�NG', t: 's' };

    const sumCols = ['Phụ Thu (VND)', 'T�ng Tiền Thực Tế (VND)', 'Tạm Ứng (VND)', 'T�ng Tiền G�c (VND)'];
    sumCols.forEach((name) => {
      const colIdx = headers.indexOf(name);
      if (colIdx === -1) return;
      let letter = '';
      let n = colIdx;
      do {
        letter = String.fromCharCode(65 + (n % 26)) + letter;
        n = Math.floor(n / 26) - 1;
      } while (n >= 0);
      worksheet[`${letter}${totalRow}`] = {
        f: `SUM(${letter}2:${letter}${rowCount + 1})`,
        t: 'n',
        z: '#,##0'
      };
    });

    // Cập nhật vùng dữ li�u
    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: totalRow, c: headers.length - 1 }
    });

    // Đ� r�ng c�t tự ��ng
    worksheet['!cols'] = headers.map((key) => {
      const isMoneyCol = moneyCols.includes(key);
      if (isMoneyCol) return { wch: 22 };
      const maxLen = Math.max(key.length, ...exportData.map((row) => String(row[key] || '').length));
      return { wch: Math.min(maxLen + 2, 50) };
    });

    const workbook = XLSX.utils.book_new();
    const tabLabel =
      currentStatus === 'Pending'
        ? 'Cho_xu_ly'
        : currentStatus === 'Completed'
          ? 'Thanh_cong'
          : currentStatus === 'Installment'
            ? 'Tra_gop'
            : 'Da_huy';

    XLSX.utils.book_append_sheet(workbook, worksheet, tabLabel);
    XLSX.writeFile(workbook, `DonHang_${tabLabel}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };
  const filteredOrders = [...orders.filter((order) => order.status === currentStatus)].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const tabStyle = (status) => ({
    cursor: 'pointer',
    fontWeight: currentStatus === status ? 'bold' : 'normal',
    textDecoration: currentStatus === status ? 'underline' : 'none',
    color: currentStatus === status ? '#007bff' : '#6c757d',
    padding: '5px 10px',
    borderRadius: '5px'
  });

  const renderTable = (filteredOrders) => (
    <Table striped bordered hover style={{ width: '100%', fontSize: '0.75em', tableLayout: 'auto' }}>
      <thead>
        <tr>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Mã Đơn Hàng</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Người tạo & Affiliate</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Thông tin khách hàng</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Sản phẩm và d�ch vụ</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Phụ thu</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>T�ng tiền thực tế</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Hình ảnh</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Trạng thái</th>
          <th style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>Ngày Đặt</th>
          <th
            style={{
              padding: '0.3rem',
              textAlign: 'center',
              fontSize: '0.85em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: '#fd7e14'
            }}
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            title="Nhấn �� ��i chiều sắp xếp"
          >
            Ngày CN {sortOrder === 'newest' ? <FaSortDown style={{ fontSize: '11px' }} /> : <FaSortUp style={{ fontSize: '11px' }} />}
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredOrders.length === 0 ? (
          <tr>
            <td colSpan="10" style={{ textAlign: 'center', color: 'red', fontStyle: 'italic' }}>
              Không có dữ li�u �� hi�n th�
            </td>
          </tr>
        ) : (
          filteredOrders.map((order) => {
            const productMap = order.products?.reduce((acc, product) => {
              const key = `${product.name}-${product.price}`;
              if (!acc[key]) acc[key] = { ...product, count: 1 };
              else acc[key].count += 1;
              return acc;
            }, {});
            const uniqueProducts = productMap ? Object.values(productMap) : [];

            return (
              <React.Fragment key={order._id}>
                <tr onClick={() => toggleRow(order._id)} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                    {order.orderCode || 'Không có mã'} <span>{expandedRow === order._id ? '�' : '�'}</span>
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
                          <span style={{ color: '#6c757d', fontSize: '0.8em' }}></span>
                        )}
                      </>
                    ) : (
                      <>
                        Chưa phân công
                        <br />
                        <span style={{ color: '#6c757d', fontSize: '0.8em' }}></span>
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
                            {product.count > 1 && (
                              <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff4444', marginLeft: '5px' }}>
                                (x{product.count})
                              </span>
                            )}
                            {' - '}
                            {product.price.toLocaleString('vi-VN')} VND
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
                            window.open(`https://www.system.crmkhitam.com${image.url.replace(/^.*:\/\/[^/]+/, '')}`, '_blank');
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
                    <Form.Control
                      as="select"
                      value={order.status}
                      onChange={(e) => confirmStatusChange(order, e.target.value)}
                      style={{ backgroundColor: '#f8f9fa', border: '1px solid #ccc', padding: '5px', fontSize: '14px', width: '90px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Installment">Installment</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Control>
                  </td>
                  <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em' }}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.85em', whiteSpace: 'nowrap' }}>
                    {order.updatedAt && !isNaN(new Date(order.updatedAt)) ? (
                      <span style={{ color: '#fd7e14', fontWeight: '500' }}>
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
                    <td colSpan={10} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderTop: '2px solid #dee2e6' }}>
                      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '1em' }}>
                        Chi tiết �ơn hàng: {order.orderCode || 'Không có mã'}
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
                            title={order.pipelineNotes || 'Không có ghi chú n�i b�'}
                          >
                            {order.pipelineNotes || 'Không có ghi chú n�i b�'}
                          </div>
                        </Col>
                        <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#007bff' }}>Giai �oạn:</strong>
                          <div style={detailStyle}>{order.stage || 'Không xác ��nh'}</div>
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
                          <strong style={{ color: '#007bff' }}>T�ng Tiền Thực Tế:</strong>
                          <div style={detailStyle}>{order.amountTotal?.toLocaleString('vi-VN') || '0'} VND</div>
                        </Col>
                        <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#007bff' }}>T�ng Tiền:</strong>
                          <div style={detailStyle}>{order.totalAmount?.toLocaleString('vi-VN') || '0'} VND</div>
                        </Col>
                        {(order.status === 'Installment' || order.installmentPlans?.length > 0) && (
                          <Col xs={12} sm={12} md={12} style={{ marginBottom: '10px' }}>
                            <strong style={{ color: '#007bff', fontSize: '0.9em' }}>� Chi tiết các �ợt trả góp:</strong>
                            <div style={{ marginTop: '8px', border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                              {/* Lần �ầu / Firstpayment */}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '8px 12px',
                                  backgroundColor: order.firstPaymentConfirmed ? '#d1fae5' : '#fff8e1',
                                  borderBottom: '1px solid #dee2e6'
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: '0.85em' }}>� Tiền �ặt cọc / Lần �ầu</span>
                                  <div style={{ fontSize: '0.82em', color: '#374151', marginTop: 2 }}>
                                    <strong>{order.Firstpayment?.toLocaleString() || '0'} VND</strong>
                                    <span style={{ color: '#6b7280', marginLeft: 8 }}>
                                      Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.78em',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    color: order.firstPaymentConfirmed ? '#065f46' : '#92400e',
                                    backgroundColor: order.firstPaymentConfirmed ? '#a7f3d0' : '#fde68a',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {order.firstPaymentConfirmed ? '� Đã thu' : '⏳ Chờ xác nhận'}
                                </span>
                              </div>
                              {/* Các �ợt góp tiếp theo */}
                              {order.installmentPlans?.length > 0 &&
                                order.installmentPlans.map((plan, idx) => (
                                  <div
                                    key={plan._id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      backgroundColor: plan.Status === 'Completed' ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#f9fafb',
                                      borderBottom: idx < order.installmentPlans.length - 1 ? '1px solid #f3f4f6' : 'none'
                                    }}
                                  >
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 600, fontSize: '0.85em' }}>{plan.installmentNumber}</div>
                                      <div style={{ fontSize: '0.82em', color: '#374151' }}>
                                        <strong>{plan.PaidAmount?.toLocaleString()} VND</strong>
                                      </div>
                                      <div style={{ fontSize: '0.78em', color: '#6b7280', marginTop: 2 }}>
                                        Hạn:{' '}
                                        <strong
                                          style={{
                                            color:
                                              plan.dueDate && new Date(plan.dueDate) < new Date() && plan.Status !== 'Completed'
                                                ? '#dc3545'
                                                : '#374151'
                                          }}
                                        >
                                          {plan.dueDate ? new Date(plan.dueDate).toLocaleDateString('vi-VN') : '�'}
                                        </strong>
                                        {plan.paidAt && (
                                          <span style={{ marginLeft: 6, color: '#198754' }}>
                                            � Đã thu: {new Date(plan.paidAt).toLocaleDateString('vi-VN')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 110 }}>
                                      {plan.Status === 'pending' ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditStatus(plan._id, 'Completed');
                                          }}
                                          style={{
                                            background: 'linear-gradient(135deg, #059669, #047857)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '5px 12px',
                                            fontSize: '0.78em',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(5,150,105,0.3)',
                                            transition: 'opacity 0.15s'
                                          }}
                                          onMouseOver={(e) => (e.target.style.opacity = '0.85')}
                                          onMouseOut={(e) => (e.target.style.opacity = '1')}
                                        >
                                          � Duy�t �ợt này
                                        </button>
                                      ) : (
                                        <span
                                          style={{
                                            display: 'inline-block',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.78em',
                                            fontWeight: 700,
                                            color: plan.Status === 'Completed' ? '#065f46' : '#dc3545',
                                            backgroundColor: plan.Status === 'Completed' ? '#a7f3d0' : '#fee2e2'
                                          }}
                                        >
                                          {plan.Status === 'Completed' ? '� Đã thu' : '� Thất bại'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </Col>
                        )}
                        <Col xs={12} sm={6} md={3} style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#007bff' }}>Trạng thái:</strong>
                          <div style={detailStyle}>{order.status || 'Không xác ��nh'}</div>
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
  );

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
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Card.Title as="h5" style={{ marginBottom: '15px' }}>
                Danh sách �ơn hàng
              </Card.Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <select
                  onChange={handleDateFilterChange}
                  value={dateFilter}
                  style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '5px', background: 'white', fontSize: '0.9em' }}
                >
                  <option value="today">Ngày hôm nay</option>
                  <option value="lastWeek">1 tuần qua</option>
                  <option value="lastMonth">1 tháng qua</option>
                  <option value="custom">Chọn khoảng thời gian</option>
                </select>
                {/* Dropdown sắp xếp theo ngày cập nhật */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    background: 'white',
                    fontSize: '0.9em',
                    cursor: 'pointer'
                  }}
                  title="Sắp xếp theo ngày cập nhật"
                >
                  <option value="newest">Cập nhật: M�i nhất</option>
                  <option value="oldest">Cập nhật: Cũ nhất</option>
                </select>
                {isCustomDate && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="Chọn ngày bắt �ầu"
                      className="form-control"
                    />
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="Chọn ngày kết thúc"
                      className="form-control"
                    />
                  </div>
                )}
                <Button
                  variant="success"
                  onClick={exportToExcel}
                  disabled={filteredOrders.length === 0}
                  style={{ padding: '8px 12px', fontSize: '0.9em' }}
                >
                  Xuất Excel
                </Button>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                {['Pending', 'Completed', 'Installment', 'Cancelled'].map((status) => (
                  <span key={status} onClick={() => setCurrentStatus(status)} style={tabStyle(status)}>
                    {status === 'Pending'
                      ? 'Chờ xử lý'
                      : status === 'Completed'
                        ? 'Thành công'
                        : status === 'Installment'
                          ? 'Trả góp'
                          : 'Đơn hủy'}
                  </span>
                ))}
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                renderTable(filteredOrders)
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal ghi chú */}
      <Modal show={showNotesModal} onHide={handleCloseNotes} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ghi chú �ơn hàng: {selectedOrder?.orderCode || 'N/A'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Khách Hàng:</strong> {selectedOrder?.contact?.name || 'Không có tên'}
          </p>
          <p>
            <strong>Email:</strong> {selectedOrder?.contact?.email || 'Không có email'}
          </p>
          <p>
            <strong>S� �i�n thoại:</strong> {selectedOrder?.contact?.phone || 'Không có phone'}
          </p>
          <p>
            <strong>Affiliate ID:</strong> {selectedOrder?.affiliate_id || 'Không có'}
          </p>
          <p>
            <strong>Affiliate Name:</strong> {selectedOrder?.affiliate_name || 'Không có'}
          </p>
          <h5>Ghi chú:</h5>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85em' }}>{selectedNotes || 'Không có ghi chú'}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNotes}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* � Modal xác nhận ��i trạng thái - có loading */}
      <Modal show={showModal} onHide={() => !confirmLoading && setShowModal(false)} centered>
        <Modal.Header closeButton={!confirmLoading}>
          <Modal.Title>Xác nhận thay ��i trạng thái</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmLoading ? (
            // � Hi�n th� spinner khi �ang xử lý
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spinner animation="border" variant="primary" style={{ marginBottom: '10px' }} />
              <p style={{ color: '#555', marginBottom: 0 }}>Đang cập nhật trạng thái, vui lòng chờ...</p>
            </div>
          ) : (
            <p>
              Bạn có chắc chắn mu�n thay ��i trạng thái của �ơn hàng <strong>{selectedOrder?.orderCode}</strong> thành{' '}
              <strong>{newStatus}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* � Ẩn nút khi �ang loading */}
          {!confirmLoading && (
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleStatusChange}>
                Xác nhận
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default Accountant;

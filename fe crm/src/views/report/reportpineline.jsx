import React, { useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaUserCheck, FaFileExcel, FaUser, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const fmtNum = (v) => (v || 0).toLocaleString('vi-VN');

const ReportPineline = ({ orders, loading, statusFilter }) => {
  const [activeTable, setActiveTable] = useState('paid');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  React.useEffect(() => {
    if (statusFilter === 'completed') setActiveTable('installments');
    else if (statusFilter === 'pending') setActiveTable('paid');
    else if (statusFilter === 'cancelled') setActiveTable('cancelled');
    else setActiveTable('paid');
  }, [statusFilter]);

  // Danh sách người tạo unique
  const creatorList = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (o.createdBy) {
        const id = o.createdBy._id;
        if (!map[id]) {
          map[id] = {
            id,
            name: `${o.createdBy.lastname || ''} ${o.createdBy.firstname || ''}`.trim(),
            role: o.createdBy.role?.name || ''
          };
        }
      }
    });
    return Object.values(map);
  }, [orders]);

  // Lọc theo category + creator
  const filterOrders = (ordersList) => {
    return ordersList.filter((o) => {
      const catMatch = categoryFilter === 'all' || (o.products || []).some((p) => p.category === categoryFilter);
      const creatorMatch = creatorFilter === 'all' || o.createdBy?._id === creatorFilter;
      return catMatch && creatorMatch;
    });
  };

  const getStatusOrders = (status) => {
    return filterOrders(orders.filter((o) => o.status === status));
  };

  const totalAmounts = useMemo(() => {
    return {
      pending: getStatusOrders('Pending').reduce((s, o) => s + (o.amountTotal || 0), 0),
      completed: getStatusOrders('Completed').reduce((s, o) => s + (o.amountTotal || 0), 0),
      cancelled: getStatusOrders('Cancelled').reduce((s, o) => s + (o.amountTotal || 0), 0),
      installment: getStatusOrders('Installment').reduce((s, o) => s + (o.amountTotal || 0), 0)
    };
  }, [orders, categoryFilter, creatorFilter]);

  const getCurrentTotal = () => {
    switch (activeTable) {
      case 'paid':
        return totalAmounts.pending;
      case 'installments':
        return totalAmounts.completed;
      case 'cancelled':
        return totalAmounts.cancelled;
      case 'installment':
        return totalAmounts.installment;
      default:
        return 0;
    }
  };

  const statusMap = {
    paid: 'Pending',
    installments: 'Completed',
    cancelled: 'Cancelled',
    installment: 'Installment'
  };

  const rawCurrentOrders = getStatusOrders(statusMap[activeTable]);

  // Sắp xếp theo updatedAt (fallback về createdAt)
  const currentOrders = [...rawCurrentOrders].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleNoteChange = (e) => setNote(e.target.value);

  const addNoteToPipeline = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Người dùng chưa đăng nhập.');
        return;
      }
      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/pineline/add-note', {
        orderCode: activeOrder.orderCode,
        content: note,
        userId
      });
      alert(response.data.message);
      setNote('');
      setActiveOrder((prev) => ({
        ...prev,
        externalNotes: [
          ...(prev.externalNotes || []),
          {
            content: note,
            createdBy: { firstname: 'Your Firstname', lastname: 'Your Lastname' },
            createdAt: new Date()
          }
        ]
      }));
    } catch (error) {
      console.error('Lỗi khi thêm ghi chú:', error);
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

  const toggleRow = (orderId) => setExpandedRow(expandedRow === orderId ? null : orderId);

  // Export Excel - Đã thêm cột Đối tác
  const handleExportExcel = () => {
    const data = currentOrders.map((o) => {
      const productMap = (o.products || []).reduce((acc, p) => {
        const key = `${p.name}-${p.price}`;
        acc[key] = acc[key] || { ...p, count: 0 };
        acc[key].count++;
        return acc;
      }, {});
      const uniqueProducts = Object.values(productMap);
      const categories = [...new Set((o.products || []).map((p) => p.category).filter(Boolean))].join(', ');

      const isBusinessPartner = o.isBusinessPartner === true || o.contact?.isBusinessPartner === true;

      return {
        'Mã đơn hàng': o.orderCode || '',
        'Người tạo': o.createdBy ? `${o.createdBy.lastname} ${o.createdBy.firstname}` : 'Chưa phân công',
        'Vai trò': o.createdBy?.role?.name || '',
        'Tên khách hàng': o.contact?.name || '',
        Email: o.contact?.email || '',
        'Số điện thoại': o.contact?.phone || '',
        'Sản phẩm': uniqueProducts
          .map((p) => `${p.name}${p.count > 1 ? ` x${p.count}` : ''} (${(p.price || 0).toLocaleString('vi-VN')} VND)`)
          .join(' | '),
        'Danh mục': categories,
        'Đối tác': isBusinessPartner ? 'Đối tác' : 'Cá nhân',
        'Phụ thu (VND)': o.surcharge || 0,
        'Tổng tiền thực tế (VND)': o.amountTotal || 0,
        'Tổng tiền (VND)': o.totalAmount || 0,
        'Trạng thái': o.status || '',
        'Giai đoạn': o.stage || '',
        Nguồn: o.isAffiliate ? 'Affiliate' : 'Trực tiếp',
        'Affiliate ID': o.affiliate_id || '',
        'Affiliate Name': o.affiliate_name || '',
        'Ghi chú': o.pipelineNotes || '',
        'Ngày tạo': o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '',
        'Ngày cập nhật': o.updatedAt ? new Date(o.updatedAt).toLocaleDateString('vi-VN') : ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 12 },
      { wch: 20 },
      { wch: 22 },
      { wch: 25 },
      { wch: 28 },
      { wch: 16 },
      { wch: 50 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 22 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 20 },
      { wch: 40 },
      { wch: 14 },
      { wch: 16 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const tabLabels = {
      paid: 'Dang_xu_ly',
      installments: 'Thanh_cong',
      installment: 'Tra_gop',
      cancelled: 'Da_huy'
    };

    XLSX.utils.book_append_sheet(wb, ws, tabLabels[activeTable] || 'DonHang');

    const catLabel = categoryFilter === 'all' ? 'TatCa' : categoryFilter.replace(' ', '_');
    const creatorLabel = creatorFilter === 'all' ? '' : `_${creatorList.find((c) => c.id === creatorFilter)?.name.replace(' ', '_') || ''}`;

    const fileName = `DonHang_${tabLabels[activeTable]}_${catLabel}${creatorLabel}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const getCategoryTag = (products) => {
    const cats = [...new Set((products || []).map((p) => p.category).filter(Boolean))];
    if (cats.length === 0) return null;
    if (cats.includes('Academy') && cats.includes('Health Hub')) return <span style={styles.catMix}>Mixed</span>;
    if (cats[0] === 'Academy') return <span style={styles.catAcademy}>Academy</span>;
    if (cats[0] === 'Health Hub') return <span style={styles.catHub}>Health Hub</span>;
    return <span style={styles.catMix}>{cats[0]}</span>;
  };

  const getRoleColor = (roleName) => {
    if (roleName === 'Admin') return '#dc3545';
    if (roleName === 'KTT Sale Manager') return '#0d6efd';
    if (roleName === 'KTT Sale Team Leader') return '#198754';
    return '#6c757d';
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card style={styles.card}>
            <Card.Header style={styles.cardHeader}>
              {/* Filter bar */}
              <div style={styles.filterBar}>
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Danh mục:</span>
                  {['all', 'Academy', 'Health Hub'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      style={{ ...styles.filterBtn, ...(categoryFilter === cat ? styles.filterBtnActive : {}) }}
                    >
                      {cat === 'all' ? 'Tất cả' : cat}
                    </button>
                  ))}
                </div>

                <div style={styles.filterDivider} />

                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>
                    <FaUser style={{ marginRight: '4px', fontSize: '11px' }} />
                    Người tạo ({creatorList.length}):
                  </span>
                  <div style={styles.creatorScroll}>
                    <button
                      onClick={() => setCreatorFilter('all')}
                      style={{ ...styles.filterBtn, ...(creatorFilter === 'all' ? styles.filterBtnActive : {}) }}
                    >
                      Tất cả
                    </button>
                    {creatorList.map((c) => {
                      const orderCount = filterOrders(orders.filter((o) => o.createdBy?._id === c.id)).length;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setCreatorFilter(c.id)}
                          style={{
                            ...styles.filterBtn,
                            ...(creatorFilter === c.id ? styles.filterBtnCreatorActive : {}),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span>{c.name}</span>
                          <span
                            style={{
                              ...styles.creatorBadge,
                              ...(creatorFilter === c.id ? styles.creatorBadgeActive : {})
                            }}
                          >
                            {orderCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dropdown sắp xếp theo ngày cập nhật */}
                <div style={styles.filterDivider} />
                <div style={styles.filterGroup}>
                  <span style={styles.filterLabel}>Sắp xếp:</span>
                  <button
                    onClick={() => setSortOrder('newest')}
                    style={{
                      ...styles.filterBtn,
                      ...(sortOrder === 'newest' ? styles.filterBtnActive : {}),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaSortDown style={{ fontSize: '11px' }} /> Mới nhất
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    style={{
                      ...styles.filterBtn,
                      ...(sortOrder === 'oldest' ? styles.filterBtnActive : {}),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaSortUp style={{ fontSize: '11px' }} /> Cũ nhất
                  </button>
                </div>

                <div style={{ marginLeft: 'auto' }}>
                  <button onClick={handleExportExcel} style={styles.exportBtn}>
                    <FaFileExcel style={{ marginRight: '6px', fontSize: '14px' }} />
                    Xuất Excel
                  </button>
                </div>
              </div>

              {/* Hero tổng tiền */}
              <div style={styles.heroTotal}>
                <div>
                  <div style={styles.heroLabel}>Tổng tiền thực tế</div>
                  <div style={styles.heroAmount}>{getCurrentTotal().toLocaleString('vi-VN')} VND</div>
                  <div style={styles.heroSub}>
                    {currentOrders.length} đơn hàng
                    {categoryFilter !== 'all' && <span style={styles.heroPill}>{categoryFilter}</span>}
                    {creatorFilter !== 'all' && (
                      <span style={styles.heroPill}>{creatorList.find((c) => c.id === creatorFilter)?.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={styles.tabBar}>
                {[
                  { key: 'paid', label: 'Đang xử lý', status: 'Pending' },
                  { key: 'installments', label: 'Thành công', status: 'Completed' },
                  { key: 'installment', label: 'Trả góp', status: 'Installment' },
                  { key: 'cancelled', label: 'Đã hủy', status: 'Cancelled' }
                ].map((tab) => {
                  const count = getStatusOrders(tab.status).length;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTable(tab.key)}
                      style={{ ...styles.tabBtn, ...(activeTable === tab.key ? styles.tabBtnActive : {}) }}
                    >
                      {tab.label}
                      <span style={{ ...styles.tabCount, ...(activeTable === tab.key ? styles.tabCountActive : {}) }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </Card.Header>

            <Card.Body style={{ padding: '0' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <Table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          <th style={styles.th}>Mã đơn</th>
                          <th style={styles.th}>Người tạo</th>
                          <th style={styles.th}>Khách hàng</th>
                          <th style={styles.th}>Sản phẩm</th>
                          <th style={styles.th}>Danh mục</th>
                          <th style={{ ...styles.th, textAlign: 'center' }}>Đối tác</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Phụ thu</th>
                          <th style={{ ...styles.th, textAlign: 'right', color: '#0d6efd', fontWeight: '700' }}>Tổng tiền thực tế ↓</th>
                          <th style={{ ...styles.th, textAlign: 'center' }}>Hình ảnh</th>
                          <th style={styles.th}>Ngày tạo</th>
                          <th
                            style={{ ...styles.th, cursor: 'pointer', whiteSpace: 'nowrap', color: '#fd7e14' }}
                            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                            title="Nhấn để đổi chiều sắp xếp"
                          >
                            Ngày CN{' '}
                            {sortOrder === 'newest' ? (
                              <FaSortDown style={{ fontSize: '11px' }} />
                            ) : (
                              <FaSortUp style={{ fontSize: '11px' }} />
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontStyle: 'italic' }}>
                              Không có đơn hàng nào
                            </td>
                          </tr>
                        ) : (
                          currentOrders.map((order) => {
                            const productMap = (order.products || []).reduce((acc, p) => {
                              const key = `${p.name}-${p.price}`;
                              acc[key] = acc[key] || { ...p, count: 0 };
                              acc[key].count++;
                              return acc;
                            }, {});
                            const uniqueProducts = Object.values(productMap);
                            const isExpanded = expandedRow === order._id;

                            // Xác định là đối tác hay không
                            const isBusinessPartner = order.isBusinessPartner === true || order.contact?.isBusinessPartner === true;

                            return (
                              <React.Fragment key={order._id}>
                                <tr
                                  onClick={() => toggleRow(order._id)}
                                  style={{ ...styles.tr, backgroundColor: isExpanded ? '#f0f4ff' : undefined }}
                                >
                                  <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={styles.orderCode}>#{order.orderCode || '—'}</span>
                                      <span style={{ fontSize: '10px', color: '#aaa' }}>{isExpanded ? '▼' : '▶'}</span>
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    {order.createdBy ? (
                                      <>
                                        <div style={{ fontWeight: '500', fontSize: '0.82em' }}>
                                          {order.createdBy.lastname} {order.createdBy.firstname}
                                        </div>
                                        <span
                                          style={{ fontSize: '0.75em', color: getRoleColor(order.createdBy.role?.name), fontWeight: '500' }}
                                        >
                                          {order.createdBy.role?.name || '—'}
                                        </span>
                                        {order.affiliate_name && (
                                          <div style={{ fontSize: '0.72em', color: '#0d6efd', marginTop: '2px' }}>
                                            <FaUserCheck style={{ marginRight: '3px' }} />
                                            {order.affiliate_name}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <span style={{ color: '#aaa', fontSize: '0.82em' }}>Chưa phân công</span>
                                    )}
                                  </td>
                                  <td style={styles.td}>
                                    <div style={{ fontWeight: '500', fontSize: '0.82em' }}>{order.contact?.name || '—'}</div>
                                    <div style={{ fontSize: '0.75em', color: '#6c757d' }}>{order.contact?.email}</div>
                                    <div style={{ fontSize: '0.75em', color: '#6c757d' }}>{order.contact?.phone}</div>
                                  </td>
                                  <td style={{ ...styles.td, maxWidth: '200px' }}>
                                    {uniqueProducts.map((p) => (
                                      <div key={`${p.name}-${p.price}`} style={{ fontSize: '0.78em', marginBottom: '2px' }}>
                                        {p.name}
                                        {p.count > 1 && (
                                          <span style={{ color: '#dc3545', fontWeight: '600', marginLeft: '4px' }}>×{p.count}</span>
                                        )}
                                        <span style={{ color: '#6c757d' }}> — {p.price?.toLocaleString('vi-VN')} VND</span>
                                      </div>
                                    ))}
                                  </td>
                                  <td style={styles.td}>{getCategoryTag(order.products)}</td>

                                  {/* Cột Đối tác */}
                                  <td style={{ ...styles.td, textAlign: 'center' }}>
                                    {isBusinessPartner ? (
                                      <span style={styles.businessPartnerYes}>ĐỐI TÁC</span>
                                    ) : (
                                      <span style={styles.businessPartnerNo}>CÁ NHÂN</span>
                                    )}
                                  </td>

                                  <td style={{ ...styles.td, textAlign: 'right', fontSize: '0.82em' }}>
                                    {(order.surcharge || 0).toLocaleString('vi-VN')} VND
                                  </td>
                                  <td style={{ ...styles.td, textAlign: 'right' }}>
                                    <div style={styles.amountCell}>
                                      {(order.amountTotal || 0).toLocaleString('vi-VN')}
                                      <span style={styles.amountVnd}>VND</span>
                                    </div>
                                  </td>
                                  <td style={{ ...styles.td, textAlign: 'center' }}>
                                    {order.images?.length > 0 ? (
                                      order.images.map((img, i) => (
                                        <button
                                          key={i}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`https://www.system.crmkhitam.com${img.url}`, '_blank');
                                          }}
                                          style={styles.imgBtn}
                                        >
                                          Ảnh {i + 1}
                                        </button>
                                      ))
                                    ) : (
                                      <span style={{ color: '#ccc', fontSize: '0.75em', fontStyle: 'italic' }}>Không có</span>
                                    )}
                                  </td>
                                  <td style={{ ...styles.td, fontSize: '0.78em', color: '#6c757d', whiteSpace: 'nowrap' }}>
                                    {order.createdAt && !isNaN(new Date(order.createdAt))
                                      ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                                      : '—'}
                                  </td>
                                  <td style={{ ...styles.td, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {order.updatedAt && !isNaN(new Date(order.updatedAt)) ? (
                                      <span style={{ color: '#fd7e14', fontWeight: '500', fontSize: '0.78em' }}>
                                        {new Date(order.updatedAt).toLocaleDateString('vi-VN')}
                                        <br />
                                        <small style={{ color: '#6c757d' }}>
                                          {new Date(order.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                      </span>
                                    ) : (
                                      <span style={{ color: '#ccc', fontSize: '0.75em', fontStyle: 'italic' }}>—</span>
                                    )}
                                  </td>
                                </tr>

                                {isExpanded && (
                                  <tr style={{ backgroundColor: '#f8f9ff' }}>
                                    <td colSpan={11} style={{ padding: '16px 20px', borderTop: '2px solid #e0e7ff' }}>
                                      <div style={styles.expandGrid}>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Giai đoạn</div>
                                          <div style={styles.detailValue}>{order.stage || '—'}</div>
                                        </div>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Tạm ứng</div>
                                          <div style={styles.detailValue}>{(order.depositAmount || 0).toLocaleString('vi-VN')} VND</div>
                                        </div>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Phụ thu</div>
                                          <div style={styles.detailValue}>{(order.surcharge || 0).toLocaleString('vi-VN')} VND</div>
                                        </div>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Tổng tiền (gốc)</div>
                                          <div style={styles.detailValue}>{(order.totalAmount || 0).toLocaleString('vi-VN')} VND</div>
                                        </div>
                                        <div style={{ ...styles.detailCard, border: '1.5px solid #0d6efd' }}>
                                          <div style={styles.detailLabel}>Tổng tiền thực tế</div>
                                          <div style={{ ...styles.detailValue, color: '#0d6efd', fontSize: '1.1em' }}>
                                            {(order.amountTotal || 0).toLocaleString('vi-VN')} VND
                                          </div>
                                        </div>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Trạng thái</div>
                                          <div style={styles.detailValue}>{order.status}</div>
                                        </div>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Nguồn</div>
                                          <div style={styles.detailValue}>
                                            {order.isAffiliate ? (
                                              <span style={{ color: '#198754' }}>
                                                <FaUserCheck /> Affiliate
                                              </span>
                                            ) : (
                                              'Trực tiếp'
                                            )}
                                          </div>
                                        </div>
                                        <div style={styles.detailCard}>
                                          <div style={styles.detailLabel}>Loại khách hàng</div>
                                          <div style={styles.detailValue}>
                                            {isBusinessPartner ? 'Đối tác / Doanh nghiệp' : 'Khách hàng cá nhân'}
                                          </div>
                                        </div>

                                        {/* Phần hiển thị chi tiết Trả góp */}
                                        {(order.PaymentType === 'Install' || (order.installments && order.installments.length > 0)) && (
                                          <div
                                            style={{
                                              ...styles.detailCard,
                                              gridColumn: 'span 2',
                                              background: '#fffbeb',
                                              border: '1px solid #ffeeba'
                                            }}
                                          >
                                            <div
                                              style={{
                                                ...styles.detailLabel,
                                                color: '#856404',
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                              }}
                                            >
                                              <span>LỊCH TRÌNH TRẢ GÓP</span>
                                              <span style={{ fontWeight: '700' }}>
                                                Đã thu:{' '}
                                                {fmtNum(
                                                  (order.installments || []).filter((i) => i.isPaid).reduce((s, i) => s + i.amount, 0)
                                                )}{' '}
                                                / {fmtNum(order.amountTotal)} VND
                                              </span>
                                            </div>
                                            <div style={{ overflowX: 'auto', marginTop: '8px' }}>
                                              <table style={{ width: '100%', fontSize: '0.85em', borderCollapse: 'collapse' }}>
                                                <thead>
                                                  <tr style={{ borderBottom: '1px solid #ffeeba' }}>
                                                    <th style={{ padding: '4px', textAlign: 'left' }}>Kỳ</th>
                                                    <th style={{ padding: '4px', textAlign: 'right' }}>Số tiền</th>
                                                    <th style={{ padding: '4px', textAlign: 'center' }}>Ngày hạn</th>
                                                    <th style={{ padding: '4px', textAlign: 'right' }}>Trạng thái</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  <tr style={{ borderBottom: '1px dashed #ffeeba' }}>
                                                    <td style={{ padding: '4px' }}>Đầu</td>
                                                    <td style={{ padding: '4px', textAlign: 'right', fontWeight: '600' }}>
                                                      {fmtNum(order.Firstpayment)}
                                                    </td>
                                                    <td style={{ padding: '4px', textAlign: 'center' }}>—</td>
                                                    <td style={{ padding: '4px', textAlign: 'right' }}>
                                                      <span style={{ color: '#0a6640', fontWeight: '700' }}>ĐÃ THU</span>
                                                    </td>
                                                  </tr>
                                                  {(order.installments || order.installmentPlans || []).map((inst, idx) => (
                                                    <tr
                                                      key={idx}
                                                      style={{
                                                        borderBottom:
                                                          idx === (order.installments || []).length - 1 ? 'none' : '1px dashed #ffeeba'
                                                      }}
                                                    >
                                                      <td style={{ padding: '4px' }}>#{inst.installmentNumber}</td>
                                                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: '600' }}>
                                                        {fmtNum(inst.amount || inst.PaidAmount)}
                                                      </td>
                                                      <td style={{ padding: '4px', textAlign: 'center' }}>
                                                        {inst.expectedDate
                                                          ? new Date(inst.expectedDate).toLocaleDateString('vi-VN')
                                                          : inst.dueDate || '—'}
                                                      </td>
                                                      <td style={{ padding: '4px', textAlign: 'right' }}>
                                                        {inst.isPaid || inst.Status === 'paid' || inst.Status === 'Completed' ? (
                                                          <span style={{ color: '#0a6640', fontWeight: '700' }}>ĐÃ THU</span>
                                                        ) : (
                                                          <span style={{ color: '#856404', fontWeight: '700' }}>CHƯA THU</span>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}

                                        <div style={{ ...styles.detailCard, gridColumn: 'span 2' }}>
                                          <div style={styles.detailLabel}>Ghi chú</div>
                                          <div style={{ ...styles.detailValue, fontWeight: '400', fontSize: '0.82em' }}>
                                            {order.pipelineNotes || 'Không có ghi chú'}
                                          </div>
                                        </div>
                                        <div style={{ ...styles.detailCard, display: 'flex', alignItems: 'flex-end' }}>
                                          <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShowNotes(order);
                                            }}
                                          >
                                            Xem / Ghi chú
                                          </Button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Footer tổng tiền */}
                  <div style={styles.footerTotal}>
                    <span style={{ fontSize: '0.85em', color: '#6c757d' }}>
                      {currentOrders.length} đơn hàng
                      {categoryFilter !== 'all' && ` — ${categoryFilter}`}
                      {creatorFilter !== 'all' && ` — ${creatorList.find((c) => c.id === creatorFilter)?.name}`}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={handleExportExcel} style={{ ...styles.exportBtn, fontSize: '0.8em', padding: '6px 14px' }}>
                        <FaFileExcel style={{ marginRight: '5px' }} />
                        Xuất Excel ({currentOrders.length} dòng)
                      </button>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '0.85em', color: '#6c757d' }}>Tổng tiền thực tế:</span>
                        <span style={styles.footerAmount}>{getCurrentTotal().toLocaleString('vi-VN')} VND</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal ghi chú */}
              <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title style={{ fontSize: '1em', fontWeight: '600' }}>Ghi chú — Đơn #{activeOrder?.orderCode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <div style={styles.modalInfo}>
                        <strong>Khách hàng:</strong> {activeOrder?.contact?.name || '—'}
                      </div>
                      <div style={styles.modalInfo}>
                        <strong>Email:</strong> {activeOrder?.contact?.email || '—'}
                      </div>
                      <div style={styles.modalInfo}>
                        <strong>SĐT:</strong> {activeOrder?.contact?.phone || '—'}
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div style={styles.modalInfo}>
                        <strong>Loại khách:</strong>
                        {activeOrder?.isBusinessPartner === true || activeOrder?.contact?.isBusinessPartner === true
                          ? 'Đối tác / Doanh nghiệp'
                          : 'Cá nhân'}
                      </div>
                      <div style={styles.modalInfo}>
                        <strong>Affiliate ID:</strong> {activeOrder?.affiliate_id || 'Không có'}
                      </div>
                      <div style={styles.modalInfo}>
                        <strong>Affiliate Name:</strong> {activeOrder?.affiliate_name || 'Không có'}
                      </div>
                    </Col>
                  </Row>

                  {/* Phần ghi chú giữ nguyên */}
                  <div style={styles.noteSection}>
                    <strong style={{ fontSize: '0.85em', color: '#6c757d' }}>Ghi chú nội bộ:</strong>
                    <div style={styles.noteBox}>{activeOrder?.pipelineNotes || 'Không có'}</div>
                  </div>
                  <div style={{ ...styles.noteSection, marginTop: '12px' }}>
                    <strong style={{ fontSize: '0.85em', color: '#6c757d' }}>Ghi chú bên ngoài:</strong>
                    {activeOrder?.externalNotes?.length > 0 ? (
                      <ul style={{ marginTop: '8px', paddingLeft: '16px' }}>
                        {activeOrder.externalNotes.map((n, i) => (
                          <li key={i} style={{ fontSize: '0.85em', marginBottom: '6px' }}>
                            <strong>
                              {n.createdBy?.lastname} {n.createdBy?.firstname}
                            </strong>{' '}
                            ({new Date(n.createdAt).toLocaleString('vi-VN')}): {n.content}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ fontSize: '0.82em', color: '#aaa', marginTop: '6px' }}>Không có ghi chú</div>
                    )}
                  </div>

                  <Form.Group className="mt-3">
                    <Form.Label style={{ fontSize: '0.85em', fontWeight: '600' }}>Thêm ghi chú mới</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Nhập nội dung ghi chú..."
                      value={note}
                      onChange={handleNoteChange}
                      style={{ fontSize: '0.85em' }}
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                    Đóng
                  </Button>
                  <Button variant="primary" size="sm" onClick={addNoteToPipeline} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Thêm ghi chú'}
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

const styles = {
  card: { border: 'none', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardHeader: { backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '16px 20px' },
  filterBar: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  filterDivider: { width: '1px', height: '28px', background: '#e9ecef', alignSelf: 'center' },
  filterLabel: { fontSize: '0.78em', color: '#6c757d', whiteSpace: 'nowrap', fontWeight: '500' },
  filterBtn: {
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid #dee2e6',
    background: '#f8f9fa',
    color: '#6c757d',
    fontSize: '0.78em',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap'
  },
  filterBtnActive: { background: '#0d6efd', color: '#fff', border: '1px solid #0d6efd' },
  filterBtnCreatorActive: { background: '#198754', color: '#fff', border: '1px solid #198754' },
  creatorScroll: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  creatorBadge: {
    background: '#dee2e6',
    color: '#495057',
    padding: '1px 6px',
    borderRadius: '10px',
    fontSize: '0.85em',
    fontWeight: '600'
  },
  creatorBadgeActive: { background: 'rgba(255,255,255,0.3)', color: '#fff' },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#1D6F42',
    color: '#fff',
    fontSize: '0.82em',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap'
  },
  heroTotal: {
    background: 'linear-gradient(135deg, #0d6efd 0%, #0856c7 100%)',
    borderRadius: '10px',
    padding: '18px 22px',
    marginBottom: '16px',
    color: '#fff'
  },
  heroLabel: { fontSize: '0.82em', opacity: '0.85', marginBottom: '4px', fontWeight: '500' },
  heroAmount: { fontSize: '1.9em', fontWeight: '700', letterSpacing: '-0.5px', lineHeight: '1.1' },
  heroSub: { fontSize: '0.78em', opacity: '0.8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  heroPill: { background: 'rgba(255,255,255,0.25)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.9em' },
  tabBar: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  tabBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #dee2e6',
    background: '#f8f9fa',
    color: '#6c757d',
    fontSize: '0.8em',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s'
  },
  tabBtnActive: { background: '#0d6efd', color: '#fff', border: '1px solid #0d6efd' },
  tabCount: { background: '#e9ecef', color: '#6c757d', padding: '1px 7px', borderRadius: '10px', fontSize: '0.85em', fontWeight: '600' },
  tabCountActive: { background: 'rgba(255,255,255,0.25)', color: '#fff' },
  table: { width: '100%', marginBottom: '0', fontSize: '0.82em' },
  thead: { backgroundColor: '#f8f9fa' },
  th: {
    padding: '10px 12px',
    fontSize: '0.8em',
    fontWeight: '600',
    color: '#6c757d',
    borderBottom: '2px solid #e9ecef',
    whiteSpace: 'nowrap'
  },
  tr: { cursor: 'pointer', transition: 'background 0.1s' },
  td: { padding: '10px 12px', verticalAlign: 'middle', borderBottom: '1px solid #f0f0f0' },
  orderCode: { fontWeight: '600', color: '#343a40' },
  amountCell: {
    fontWeight: '700',
    fontSize: '1em',
    color: '#0d6efd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    lineHeight: '1.2'
  },
  amountVnd: { fontSize: '0.7em', color: '#6c757d', fontWeight: '400' },
  imgBtn: {
    background: '#e7f1ff',
    color: '#0d6efd',
    border: 'none',
    padding: '3px 8px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.78em',
    marginBottom: '3px',
    display: 'block'
  },
  expandGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' },
  detailCard: { background: '#fff', border: '1px solid #e9ecef', borderRadius: '8px', padding: '10px 12px' },
  detailLabel: { fontSize: '0.75em', color: '#6c757d', marginBottom: '4px', fontWeight: '500' },
  detailValue: { fontSize: '0.85em', fontWeight: '600', color: '#343a40' },
  footerTotal: {
    padding: '14px 20px',
    borderTop: '2px solid #e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    flexWrap: 'wrap',
    gap: '10px'
  },
  footerAmount: { fontSize: '1.2em', fontWeight: '700', color: '#0d6efd' },
  catAcademy: { background: '#d1f7e8', color: '#0a6640', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78em', fontWeight: '600' },
  catHub: { background: '#ede7ff', color: '#4a2fb5', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78em', fontWeight: '600' },
  catMix: { background: '#f0f0f0', color: '#555', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78em', fontWeight: '600' },

  // Style cho cột Đối tác
  businessPartnerYes: {
    background: '#198754',
    color: '#fff',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '0.76em',
    fontWeight: '700',
    display: 'inline-block',
    letterSpacing: '0.5px'
  },
  businessPartnerNo: {
    background: '#6c757d',
    color: '#fff',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '0.76em',
    fontWeight: '700',
    display: 'inline-block'
  },

  modalInfo: { fontSize: '0.85em', marginBottom: '4px' },
  noteSection: { borderTop: '1px solid #f0f0f0', paddingTop: '12px' },
  noteBox: { fontSize: '0.85em', color: '#495057', background: '#f8f9fa', borderRadius: '6px', padding: '8px 12px', marginTop: '6px' }
};

export default ReportPineline;

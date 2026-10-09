import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { BRAND, BRAND_LOGO_URL } from '../../config/brand';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import AffiliateLeadsTable from './AffiliateLeadsTable';

const C = BRAND;

// ── Inline Styles ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    background: C.cream,
    minHeight: '100vh',
    fontFamily: "'Inter', 'Arial', sans-serif",
    color: C.charcoal,
    padding: '0 0 48px',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    background: C.charcoal,
    padding: '20px 36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 16px rgba(62,58,56,0.18)',
    marginBottom: '36px',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { height: '48px', objectFit: 'contain' },
  headerTitle: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    color: C.cream,
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    margin: 0,
  },
  headerSub: {
    color: C.beige,
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  headerBadge: {
    background: C.terracotta,
    color: C.white,
    borderRadius: '20px',
    padding: '6px 18px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
  },

  // ── Section wrapper ──────────────────────────────────────────────────────────
  container: { padding: '0 36px' },
  sectionLabel: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    color: C.sage,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  divider: {
    flex: 1,
    height: '1px',
    background: `linear-gradient(to right, ${C.beige}, transparent)`,
  },

  // ── Stat cards ───────────────────────────────────────────────────────────────
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '36px',
  },
  statCard: {
    background: C.white,
    borderRadius: '14px',
    padding: '24px 22px',
    boxShadow: '0 2px 12px rgba(62,58,56,0.07)',
    border: `1px solid ${C.beige}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  statCardAccent: {
    borderLeft: `4px solid ${C.terracotta}`,
  },
  statCardNavy: {
    borderLeft: `4px solid ${C.navy}`,
  },
  statCardSage: {
    borderLeft: `4px solid ${C.sage}`,
  },
  statCardGold: {
    borderLeft: `4px solid ${C.gold}`,
  },
  statLabel: {
    color: C.sage,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  statValue: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    color: C.charcoal,
    fontSize: '40px',
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: '6px',
  },
  statMeta: {
    color: C.beige,
    fontSize: '12px',
  },

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  tabsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    borderBottom: `2px solid ${C.beige}`,
    paddingBottom: '0',
  },
  tab: {
    padding: '8px 18px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    background: 'transparent',
    color: C.sage,
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.18s',
    letterSpacing: '0.03em',
    marginBottom: '-2px',
  },
  tabActive: {
    background: C.charcoal,
    color: C.cream,
    borderBottom: `2px solid ${C.charcoal}`,
  },

  // ── Table card ────────────────────────────────────────────────────────────────
  card: {
    background: C.white,
    borderRadius: '16px',
    boxShadow: '0 2px 16px rgba(62,58,56,0.07)',
    border: `1px solid ${C.beige}`,
    marginBottom: '28px',
    overflow: 'hidden',
  },
  cardHeader: {
    background: C.charcoal,
    padding: '18px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitle: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    color: C.cream,
    fontSize: '18px',
    fontWeight: 700,
    margin: 0,
  },
  cardHeaderBadge: {
    background: C.terracotta,
    color: C.white,
    borderRadius: '20px',
    padding: '3px 14px',
    fontSize: '12px',
    fontWeight: 600,
  },
  cardBody: { padding: '0' },

  // ── Table ─────────────────────────────────────────────────────────────────────
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    background: C.cream,
    color: C.sage,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontSize: '11px',
    padding: '12px 20px',
    textAlign: 'left',
    borderBottom: `1px solid ${C.beige}`,
  },
  td: {
    padding: '13px 20px',
    borderBottom: `1px solid ${C.cream}`,
    color: C.charcoal,
    verticalAlign: 'middle',
  },
  trHover: {
    background: '#FAF8F5',
  },
  tdName: {
    fontWeight: 600,
    color: C.charcoal,
    fontSize: '13.5px',
  },
  tdMuted: {
    color: C.sage,
    fontSize: '12px',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  badgeSuccess: {
    background: '#EBF5F0',
    color: '#2D7A5A',
  },
  badgeSource: {
    background: C.cream,
    color: C.sage,
    border: `1px solid ${C.beige}`,
  },

  // ── Empty / Loading ───────────────────────────────────────────────────────────
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '320px',
    gap: '16px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: `3px solid ${C.beige}`,
    borderTop: `3px solid ${C.terracotta}`,
    borderRadius: '50%',
    animation: 'kt-spin 0.9s linear infinite',
  },
  loadingText: {
    color: C.sage,
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
  emptyRow: {
    textAlign: 'center',
    color: C.sage,
    padding: '40px',
    fontSize: '13px',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    textAlign: 'center',
    color: C.sage,
    fontSize: '11px',
    marginTop: '48px',
    letterSpacing: '0.05em',
  },
};

// ── Spinner CSS injection ─────────────────────────────────────────────────────
const spinnerStyle = document.createElement('style');
spinnerStyle.innerHTML = `@keyframes kt-spin { to { transform: rotate(360deg); } }
  .kt-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(62,58,56,0.12) !important; }
  .kt-tr:hover td { background: #FAF8F5 !important; }
  .kt-tab:hover { background: ${C.cream} !important; }
`;
if (!document.head.querySelector('[data-kt-style]')) {
  spinnerStyle.setAttribute('data-kt-style', '1');
  document.head.appendChild(spinnerStyle);
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
const DashDefault = () => {
  const { language } = useLanguage();
  const t = useTranslations(language);

  const [leads, setLeads] = useState([]);
  const [successfulOrders, setSuccessfulOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, ordersRes] = await Promise.all([
          axios.get('https://www.beassess.khitamtherapyintl.com/api/customers'),
          axios.get('https://www.beassess.khitamtherapyintl.com/api/orders?status=PAID'),
        ]);
        if (leadsRes.data.success) setLeads(leadsRes.data.data || []);
        if (ordersRes.data.success) setSuccessfulOrders(ordersRes.data.data || []);
      } catch {
        setError(t.common?.error || 'Lỗi kết nối đến máy chủ API');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t.common?.error]);

  const groupedLeads = leads.reduce((acc, lead) => {
    const taskName = lead.task || 'Khác';
    if (!acc[taskName]) acc[taskName] = [];
    acc[taskName].push(lead);
    return acc;
  }, {});
  const tasks = Object.keys(groupedLeads);

  useEffect(() => {
    if (tasks.length && !activeTab) setActiveTab(tasks[0]);
  }, [tasks, activeTab]);

  // ── LOADING: vẫn hiện khung dashboard, không chặn cả trang ─────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div>
              <p style={styles.headerTitle}>Khí Tâm Therapy®</p>
              <p style={styles.headerSub}>CRM Dashboard</p>
            </div>
          </div>
        </div>
        <div style={{ ...styles.container, ...styles.loading, minHeight: 240 }}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>{t.common?.loading || 'Đang tải dữ liệu...'}</p>
        

        {/* Bảng Affiliate Leads từ Đắc Sư */}
        <div style={{ marginTop: 24 }}>
          <AffiliateLeadsTable />
        </div>
        </div>
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ ...styles.page, ...styles.loading }}>
        <div style={{ color: C.terracotta, fontSize: '32px' }}>⚠</div>
        <p style={{ color: C.terracotta, fontWeight: 600 }}>{error}</p>
      </div>
    );
  }

  const accentStyles = [styles.statCardAccent, styles.statCardNavy, styles.statCardSage, styles.statCardGold];

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img
            src={BRAND_LOGO_URL}
            alt="Khí Tâm Therapy Logo"
            style={styles.logo}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div>
            <p style={styles.headerTitle}>Khí Tâm Therapy®</p>
            <p style={styles.headerSub}>CRM Dashboard  ·  {t.dashboard?.overview || 'Hệ thống quản lý nội bộ'}</p>
          </div>
        </div>
        <span style={styles.headerBadge}>© 2026 Khí Tâm Therapy Ltd.</span>
      </div>

      <div style={styles.container}>

        {/* ── Section Label: Stats ── */}
        <div style={styles.sectionLabel}>
          <span>{t.dashboard?.overview || 'Tổng quan'}</span>
          <div style={styles.divider} />
        </div>

        {/* ── Stat Cards ── */}
        <div style={styles.statsGrid}>
          {/* Tổng khách hàng */}
          <div className="kt-stat-card" style={{ ...styles.statCard, ...styles.statCardAccent }}>
            <div style={styles.statLabel}>{t.dashboard?.total_customers || 'Tổng Khách Hàng'}</div>
            <div style={styles.statValue}>{leads.length}</div>
            <div style={styles.statMeta}>{t.dashboard?.all_leads || 'Tất cả leads trong hệ thống'}</div>
          </div>

          {/* Đơn thành công */}
          <div className="kt-stat-card" style={{ ...styles.statCard, ...styles.statCardNavy }}>
            <div style={styles.statLabel}>{t.dashboard?.successful_orders || 'Đơn Hàng PAID'}</div>
            <div style={{ ...styles.statValue, color: C.navy }}>{successfulOrders.length}</div>
            <div style={styles.statMeta}>{t.dashboard?.paid_desc || 'Đã thanh toán thành công'}</div>
          </div>

          {/* Stat per task */}
          {tasks.map((taskItem, i) => (
            <div className="kt-stat-card" key={taskItem} style={{ ...styles.statCard, ...accentStyles[(i + 2) % accentStyles.length] }}>
              <div style={styles.statLabel}>{taskItem}</div>
              <div style={{ ...styles.statValue, fontSize: '32px' }}>{groupedLeads[taskItem].length}</div>
              <div style={styles.statMeta}>{t.dashboard?.leads_by_task || 'Leads trong nhóm này'}</div>
            </div>
          ))}
        </div>

        {/* ── Section Label: Leads ── */}
        <div style={styles.sectionLabel}>
          <span>{t.dashboard?.title || 'Danh Sách Khách Hàng Tiềm Năng'}</span>
          <div style={styles.divider} />
        </div>

        {/* ── Leads Table with Tabs ── */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardHeaderTitle}>{t.dashboard?.leads_by_task || 'Khách Hàng Theo Mục Đích (Task)'}</span>
            <span style={styles.cardHeaderBadge}>{leads.length} leads</span>
          </div>
          <div style={{ padding: '16px 24px 0' }}>
            {/* Tabs */}
            <div style={styles.tabsRow}>
              {tasks.map(taskItem => (
                <button
                  key={taskItem}
                  className="kt-tab"
                  onClick={() => setActiveTab(taskItem)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === taskItem ? styles.tabActive : {}),
                  }}
                >
                  {taskItem} <span style={{ opacity: 0.7, fontSize: '11px' }}>({groupedLeads[taskItem].length})</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    t.dashboard?.table_no || '#',
                    t.dashboard?.table_fullname || 'Họ và Tên',
                    t.dashboard?.table_email || 'Email',
                    t.dashboard?.table_phone || 'Số điện thoại',
                    t.dashboard?.table_source || 'Nguồn',
                    t.dashboard?.table_date || 'Ngày đăng ký'
                  ].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTab && groupedLeads[activeTab] ? (
                  groupedLeads[activeTab].map((lead, i) => (
                    <tr
                      key={i}
                      className="kt-tr"
                      onMouseEnter={() => setHoveredRow(`lead-${i}`)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={{ ...styles.td, color: C.beige, width: '40px' }}>{i + 1}</td>
                      <td style={styles.td}>
                        <span style={styles.tdName}>{lead.fullName || '—'}</span>
                      </td>
                      <td style={styles.td}>{lead.email || '—'}</td>
                      <td style={styles.td}>{lead.phone || '—'}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...styles.badgeSource }}>
                          {lead.source || 'Website'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, ...styles.tdMuted }}>
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'vi-VN') : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={styles.emptyRow}>{t.dashboard?.empty_leads || 'Chưa có dữ liệu.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section Label: Orders ── */}
        <div style={styles.sectionLabel}>
          <span>{t.dashboard?.successful_orders || 'Đơn Hàng Thành Công'}</span>
          <div style={styles.divider} />
        </div>

        {/* ── Orders Table ── */}
        <div style={styles.card}>
          <div style={{ ...styles.cardHeader, background: C.navy }}>
            <span style={styles.cardHeaderTitle}>{t.dashboard?.successful_orders || 'Đơn Hàng PAID'}</span>
            <span style={{ ...styles.cardHeaderBadge, background: C.gold, color: C.charcoal }}>
              {successfulOrders.length} {t.common?.total || 'đơn'}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    t.dashboard?.table_no || '#',
                    t.customers?.customerName || 'Khách Hàng',
                    'Email / SĐT',
                    t.dashboard?.table_course || 'Khóa Học',
                    t.dashboard?.table_amount || 'Số Tiền',
                    t.dashboard?.table_payment_date || 'Ngày Thanh Toán'
                  ].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {successfulOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyRow}>{t.dashboard?.empty_orders || 'Chưa có đơn hàng nào thành công.'}</td>
                  </tr>
                ) : (
                  successfulOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="kt-tr"
                      onMouseEnter={() => setHoveredRow(`order-${i}`)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={{ ...styles.td, color: C.beige, width: '40px' }}>{i + 1}</td>
                      <td style={styles.td}>
                        <span style={styles.tdName}>{order.customerName || '—'}</span>
                      </td>
                      <td style={styles.td}>
                        <div>{order.customerEmail || '—'}</div>
                        <div style={styles.tdMuted}>{order.customerPhone || ''}</div>
                      </td>
                      <td style={styles.td}>{order.courseName || '—'}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...styles.badgeSuccess, fontSize: '13px' }}>
                          {new Intl.NumberFormat(language === 'en' ? 'en-US' : 'vi-VN').format(order.totalAmount || 0)} {order.currency || 'VND'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, ...styles.tdMuted }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'vi-VN') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={styles.footer}>
          © 2026 Khí Tâm Therapy® Ltd. All rights reserved.&nbsp;&nbsp;|&nbsp;&nbsp;
          KHÍ TÂM TRỊ LIỆU® &nbsp;·&nbsp; KHI TAM MOVEMENT THERAPY© &nbsp;·&nbsp; KHI TAM MANUAL THERAPY©
        </div>
      </div>
    </div>
  );
};

export default DashDefault;

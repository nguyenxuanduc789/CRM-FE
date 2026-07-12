import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CertificateLookup.css';
import CertTab1 from './CertTab1';
import CertTab3 from './CertTab3';

const API_URL = 'https://www.system.crmkhitam.com/api/certificates';
const LOGO_URL = 'https://lwfiles.mycourse.app/6a2f9c7e022659b22cad0ee8-public/9af6dfb75cb3cadde47ece4cd01527e8.png';
const ITEMS_PER_PAGE = 5;
const ADMIN_ITEMS_PER_PAGE = 10;

const CertificateLookup = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tab2');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal and Pagination states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Auth states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem('cert_token') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('cert_role') || null);

  const [editingUrlId, setEditingUrlId] = useState(null);
  const [editingUrlValue, setEditingUrlValue] = useState('');

  useEffect(() => {
    // Tự động tải dữ liệu nếu đã đăng nhập (User lấy của User, Admin lấy tất cả)
    if (userToken) {
      handleSearch(null, userToken, userRole, true);
    }
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!emailInput) return setAuthError('Vui lòng nhập email');
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_URL}/request-otp`, { email: emailInput });
      if (res.data.success) {
        setLoginStep(2);
      } else {
        setAuthError(res.data.message);
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Lỗi hệ thống khi gửi OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput) return setAuthError('Vui lòng nhập mã OTP');
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email: emailInput, otp: otpInput });
      if (res.data.success) {
        localStorage.setItem('cert_token', res.data.token);
        localStorage.setItem('cert_role', res.data.role);
        setUserToken(res.data.token);
        setUserRole(res.data.role);
        setIsLoginModalOpen(false);
        // Tự động tải dữ liệu sau khi đăng nhập
        handleSearch(null, res.data.token, res.data.role, true);
      } else {
        setAuthError(res.data.message);
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cert_token');
    localStorage.removeItem('cert_role');
    setUserToken(null);
    setUserRole(null);
    setResults([]);
    setHasSearched(false);
    setIsModalOpen(false);
    setSearchQuery('');
    setCourseQuery('');
  };

  const handleSearch = async (e, tokenOverride = null, roleOverride = null, isAutoLoad = false) => {
    if (e) e.preventDefault();
    const activeToken = tokenOverride || userToken;
    const activeRole = roleOverride || userRole;

    const q = searchQuery.trim();
    const cq = courseQuery.trim();

    // Nếu không phải admin và không phải tự động load, chặn search ngắn
    if (activeRole !== 'admin' && !isAutoLoad && q.length < 2 && cq.length < 2) {
      setError('Vui lòng nhập ít nhất 2 ký tự.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    // Nếu autoload thì không xoá kết quả cũ ngay để tránh chớp giật, chỉ cập nhật sau
    if (!isAutoLoad) setResults([]);

    try {
      const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};

      const res = await axios.post(`${API_URL}/search`, { q, courseQ: cq }, { headers });

      if (res.data.success) {
        const foundData = res.data.data || [];
        setResults(foundData);
        setCurrentPage(1);

        // Chỉ mở popup nếu là Public User (chưa đăng nhập)
        if (!activeToken && foundData.length > 0 && !isAutoLoad) {
          setIsModalOpen(true);
        }
      } else {
        if (!isAutoLoad) setError(res.data.message || 'Không tìm thấy dữ liệu.');
      }
    } catch (err) {
      if (!isAutoLoad) setError(err.response?.data?.message || 'Lỗi khi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUrl = async (id) => {
    try {
      const res = await axios.put(
        `${API_URL}/${id}/url`,
        { url: editingUrlValue },
        {
          headers: { Authorization: `Bearer ${userToken}` }
        }
      );
      if (res.data.success) {
        setResults(results.map((c) => (c._id === id ? { ...c, certificateUrl: editingUrlValue } : c)));
        setEditingUrlId(null);
      }
    } catch (err) {
      alert('Lỗi cập nhật URL');
    }
  };

  const renderPagination = (itemsPerPage) => {
    const totalPages = Math.ceil(results.length / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="cert-pagination">
        <button className="cert-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          &laquo; Trước
        </button>
        <span className="cert-page-info">
          Trang {currentPage} / {totalPages}
        </span>
        <button className="cert-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
          Sau &raquo;
        </button>
      </div>
    );
  };

  const renderTable = (itemsPerPage) => {
    const currentData = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <div className="cert-table-responsive">
        <table className="cert-horizontal-table">
          <thead>
            <tr>
              <th>Thông tin Học viên</th>
              <th>Khóa học / Mã</th>
              <th>Số CC cũ</th>
              <th>Số CC mới</th>
              <th>Mã học viên</th>
              <th>Ngày cấp / TT khóa</th>
              <th>Bản Mềm</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((cert) => {
              const certNumberOld = cert.certNumber || '—';
              const certNumberNew = cert.newCertNumber || '—';
              const issuedOn = cert.issueDate || cert.issuedOn || '—';
              const isMasked = cert.fullName === '*** Bảo mật ***';

              return (
                <tr key={cert._id}>
                  <td>
                    {isMasked ? (
                      <span className="cert-muted-text">*** Bảo mật ***</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="fw-bold" style={{ fontSize: '1rem' }}>
                          {cert.fullName || '—'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--kht-muted)' }}>
                          📧 {cert.email || '—'} <br />
                          📞 {cert.phone || '—'}
                        </div>
                        <div className="cert-cell-wrap" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                          📍 {cert.address || '—'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="text-highlight">{cert.courseName || '—'}</span>
                    {' / '}
                    <span className="course-badge">{cert.courseCode || '—'}</span>
                  </td>
                  <td>{certNumberOld}</td>
                  <td className="fw-bold" style={{ color: 'var(--kht-highlight)' }}>
                    {certNumberNew}
                  </td>
                  <td className={isMasked ? 'cert-muted-text' : ''}>{cert.studentCode || '—'}</td>
                  <td className="cert-cell-wrap">{issuedOn}</td>
                  <td>
                    {userRole === 'admin' ? (
                      editingUrlId === cert._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                          <input
                            type="text"
                            value={editingUrlValue}
                            onChange={(e) => setEditingUrlValue(e.target.value)}
                            placeholder="Dán link OneDrive..."
                            style={{ padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                          />
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleUpdateUrl(cert._id)}
                              style={{
                                flex: 1,
                                padding: '4px 8px',
                                background: 'var(--kht-green)',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingUrlId(null)}
                              style={{
                                flex: 1,
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                background: '#f9f9f9',
                                fontSize: '0.8rem'
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '100px' }}>
                          {cert.certificateUrl ? (
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--kht-green-mid)', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }}
                            >
                              🔗 Xem Link
                            </a>
                          ) : (
                            <span style={{ color: '#999', fontSize: '0.85rem' }}>Chưa có link</span>
                          )}
                          <button
                            onClick={() => {
                              setEditingUrlId(cert._id);
                              setEditingUrlValue(cert.certificateUrl || '');
                            }}
                            style={{
                              fontSize: '0.8rem',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              border: '1px solid var(--kht-border)',
                              borderRadius: '6px',
                              background: 'var(--kht-bg)',
                              color: 'var(--kht-text)',
                              fontWeight: '600'
                            }}
                          >
                            ✏️ Sửa Link
                          </button>
                        </div>
                      )
                    ) : cert.certificateUrl && !isMasked ? (
                      <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="cert-download-btn">
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginRight: '4px' }}
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Tải Bản Mềm 📲
                      </a>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // ==========================================
  // GIAO DIỆN ADMIN (Dashboard)
  // ==========================================
  const renderAdminDashboard = () => (
    <div className="cert-dashboard fade-in">
      <div className="cert-dashboard-header">
        <h2>
          <span className="admin-badge">Admin</span> Quản lý Văn Bằng
        </h2>
        <p>Hệ thống tra cứu và quản lý toàn bộ dữ liệu chứng chỉ</p>
      </div>

      <div className="cert-admin-search-card">
        <form onSubmit={handleSearch} className="cert-admin-form">
          <div className="cert-admin-inputs">
            <div className="cert-input-wrap">
              <label>Tìm kiếm chung</label>
              <input
                type="text"
                placeholder="Họ tên, SĐT, Email, Mã chứng chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="cert-input-wrap">
              <label>Lọc theo khóa học</label>
              <input
                type="text"
                placeholder="Tên khóa học hoặc Mã khóa..."
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="cert-admin-actions">
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <span className="loader-ring"></span> : 'Lọc Dữ Liệu'}
            </button>
            <button
              type="button"
              className="reset-button"
              onClick={() => {
                setSearchQuery('');
                setCourseQuery('');
                handleSearch(null, userToken, userRole, true);
              }}
            >
              Tải lại tất cả
            </button>
          </div>
        </form>
      </div>

      <div className="cert-dashboard-content">
        {loading && results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="loader-ring" style={{ borderColor: 'var(--kht-green) transparent var(--kht-green) transparent' }}></span>
          </div>
        ) : (
          <>
            <div className="cert-dashboard-meta">
              <p>
                Hiển thị <strong>{results.length}</strong> chứng chỉ trong hệ thống
              </p>
            </div>
            {results.length > 0 ? (
              <div className="cert-dashboard-table-wrap">
                {renderTable(ADMIN_ITEMS_PER_PAGE)}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>{renderPagination(ADMIN_ITEMS_PER_PAGE)}</div>
              </div>
            ) : (
              <div className="cert-empty-state fade-in">
                <div className="cert-empty-state__icon">🗂️</div>
                <h3>Không có dữ liệu</h3>
                <p>Hệ thống không tìm thấy chứng chỉ nào phù hợp.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ==========================================
  // GIAO DIỆN HỌC VIÊN (User Dashboard)
  // ==========================================
  const renderUserDashboard = () => (
    <div className="cert-dashboard fade-in">
      <div className="cert-dashboard-header user-theme">
        <h2>Hồ Sơ Văn Bằng Của Bạn</h2>
        <p>Xem thông tin chứng chỉ cá nhân hoặc tra cứu thêm hệ thống</p>
      </div>

      <div className="cert-user-search-wrapper">
        <form onSubmit={handleSearch} className="cert-lookup-search-form user-inline-search">
          <input
            type="text"
            className="search-input"
            placeholder="Tra cứu người khác (Ví dụ: 0901234567, email@gmail.com...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? <span className="loader-ring"></span> : 'Tra Cứu Nhanh'}
          </button>
        </form>
      </div>

      <div className="cert-dashboard-content">
        {error && <div className="cert-alert cert-alert--error">{error}</div>}

        {results.length > 0 ? (
          <div className="cert-dashboard-table-wrap fade-in-up">
            <h3 style={{ margin: '0 0 20px', color: 'var(--kht-green-dark)' }}>Kết quả hiển thị ({results.length})</h3>
            {renderTable(ITEMS_PER_PAGE)}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>{renderPagination(ITEMS_PER_PAGE)}</div>
          </div>
        ) : (
          !loading &&
          hasSearched && (
            <div className="cert-empty-state fade-in">
              <div className="cert-empty-state__icon">🔍</div>
              <h3>Không tìm thấy dữ liệu</h3>
              <p>Không có chứng chỉ nào khớp với từ khóa "{searchQuery}"</p>
              <div style={{ marginTop: '20px' }}>
                <p style={{ marginBottom: '10px' }}>Nếu cần hỗ trợ đính chính hoặc cấp lại chứng chỉ, vui lòng điền form dưới đây:</p>
                <div className="bounce-arrow">👇</div>
                <a 
                  href="https://khitamtherapy.sg.larksuite.com/share/base/form/shrlgRMhZ8NqR45DBtgwf1dYs6g?from=navigation" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: 'var(--kht-highlight)',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}
                >
                  Form Hỗ Trợ Kịp Thời
                </a>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  // ==========================================
  // GIAO DIỆN CÔNG CỘNG (Public Lookup)
  // ==========================================
  const renderPublicLookup = () => (
    <div className="cert-lookup-container fade-in">
      <div className="cert-lookup-header fade-in-down">
        <img src={LOGO_URL} alt="Khí Tâm Therapy" className="cert-lookup-logo" />
        <h1 className="cert-lookup-title">Tra Cứu Văn Bằng</h1>
        <p className="cert-lookup-desc">
          Nhập email, số điện thoại, họ tên, hoặc mã chứng chỉ để xác thực hệ thống văn bằng Khí Tâm Therapy.
        </p>
      </div>

      <div className="cert-lookup-search-wrapper fade-in-up">
        <form onSubmit={handleSearch} className="cert-lookup-search-form">
          <div className="search-input-group">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Ví dụ: KTA/12345, 0901234567, email@gmail.com..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setError(null);
              }}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? <span className="loader-ring"></span> : 'Tra Cứu'}
            </button>
          </div>
        </form>
      </div>

      <div className="cert-lookup-results-section">
        {error && (
          <div className="cert-alert cert-alert--error fade-in">
            <span className="cert-alert__icon">⚠️</span>
            {error}
          </div>
        )}

        {!loading && hasSearched && !error && results.length === 0 && (
          <div className="cert-empty-state fade-in">
            <div className="cert-empty-state__icon">🔍</div>
            <h3>Không tìm thấy dữ liệu</h3>
            <p>Hệ thống không ghi nhận chứng chỉ nào khớp với thông tin "{searchQuery}". Vui lòng kiểm tra lại.</p>
            <div style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '10px' }}>Nếu bạn cần hỗ trợ đính chính thông tin hoặc cấp lại chứng chỉ, vui lòng điền form:</p>
              <div className="bounce-arrow">👇</div>
              <a 
                href="https://khitamtherapy.sg.larksuite.com/share/base/form/shrlgRMhZ8NqR45DBtgwf1dYs6g?from=navigation" 
                target="_blank" 
                rel="noreferrer" 
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'var(--kht-highlight)',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                Form Hỗ Trợ Kịp Thời
              </a>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && !isModalOpen && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              className="cert-page-btn"
              style={{ background: 'var(--kht-green)', color: '#fff', padding: '10px 24px' }}
              onClick={() => setIsModalOpen(true)}
            >
              Xem lại {results.length} kết quả
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================
  // RENDER MAIN
  // ==========================================
  const renderLoginModal = () => {
    if (!isLoginModalOpen) return null;
    return (
      <div className="cert-modal-overlay fade-in" onClick={() => setIsLoginModalOpen(false)}>
        <div className="cert-auth-modal fade-in-up" onClick={(e) => e.stopPropagation()}>
          <div className="cert-auth-header">
            <h3 className="auth-title">Tra Cứu Văn Bằng</h3>
            <p className="auth-desc">Nhập thông tin bên dưới để tra cứu.</p>
            <div className="user-inline-search" style={{ marginTop: '20px' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Ví dụ: Nguyễn Văn A, 090xxxxxxx, KTA/KHL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-button" onClick={() => handleSearch()} disabled={loading}>
                {loading ? <span className="loader-ring"></span> : 'Tra Cứu'}
              </button>
            </div>
            <button className="cert-modal-close" onClick={() => setIsLoginModalOpen(false)}>
              &times;
            </button>
          </div>
          <div className="cert-auth-body">
            {authError && <div className="cert-alert cert-alert--error">{authError}</div>}

            {loginStep === 1 ? (
              <form onSubmit={handleRequestOtp}>
                <p>Nhập email của bạn (Học viên hoặc Quản trị) để nhận mã OTP xác thực.</p>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Nhập email của bạn..."
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setAuthError(null);
                  }}
                  required
                />
                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? <span className="loader-ring"></span> : 'Gửi mã OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <p>
                  Mã OTP gồm 6 chữ số đã được gửi đến email <strong>{emailInput}</strong>. Mã có hiệu lực trong 5 phút.
                </p>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Nhập mã OTP..."
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setAuthError(null);
                  }}
                  required
                />
                <button type="submit" className="auth-submit-btn" disabled={authLoading}>
                  {authLoading ? <span className="loader-ring"></span> : 'Xác thực'}
                </button>
                <button
                  type="button"
                  className="auth-back-btn"
                  onClick={() => {
                    setLoginStep(1);
                    setOtpInput('');
                    setAuthError(null);
                  }}
                >
                  &laquo; Nhập lại email khác
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPublicResultsModal = () => {
    if (!isModalOpen || userToken) return null;
    return (
      <div className="cert-modal-overlay fade-in" onClick={() => setIsModalOpen(false)}>
        <div className="cert-modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
          <div className="cert-modal-header">
            <h2 className="cert-modal-title">KẺT QUẢ TRA CỨU CHỨNG CHỈ</h2>
            <button className="cert-modal-close" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
          </div>
          <div className="cert-modal-body">
            <div className="cert-modal-count">
              Tìm thấy <strong>{results.length}</strong> kết quả khớp với "{searchQuery}"
              <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#888' }}>
                <i>* Thông tin cá nhân đang được ẩn để bảo mật. Hãy đăng nhập học viên để xem toàn bộ thông tin.</i>
              </div>
            </div>
            {renderTable(ITEMS_PER_PAGE)}
          </div>
          <div className="cert-modal-footer">{renderPagination(ITEMS_PER_PAGE)}</div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'tab1') return <CertTab1 />;
    if (activeTab === 'tab3') return <CertTab3 />;

    // Tab 2: Tra cứu (Dashboard)
    if (userRole === 'admin') return renderAdminDashboard();
    if (userRole === 'user') return renderUserDashboard();

    return renderPublicLookup();
  };

  return (
    <div className="cert-lookup-page">
      <nav className="cert-navbar">
        <div className="cert-navbar__container">
          <div className="cert-navbar__brand" onClick={() => setActiveTab('lookup')}>
            <img src={LOGO_URL} alt="Khí Tâm Logo" className="cert-navbar__logo" />
          </div>

          <div className="cert-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="cert-tabs-nav desktop-tabs" style={{ marginTop: '0', marginBottom: '0' }}>
              <button className={`cert-tab-btn ${activeTab === 'tab1' ? 'active' : ''}`} onClick={() => setActiveTab('tab1')}>
                Giới thiệu & Quy định
              </button>
              <button className={`cert-tab-btn ${activeTab === 'tab2' ? 'active' : ''}`} onClick={() => setActiveTab('tab2')}>
                Tra cứu chứng chỉ
              </button>
              <button className={`cert-tab-btn ${activeTab === 'tab3' ? 'active' : ''}`} onClick={() => setActiveTab('tab3')}>
                Hỗ trợ học viên
              </button>
            </div>

            <div className="cert-navbar__auth-area desktop-tabs">
              {userToken ? (
                <button className="cert-auth-badge" onClick={handleLogout} title="Bấm để đăng xuất">
                  Đã đăng nhập ({userRole === 'admin' ? 'Admin' : 'Học viên'}) - Thoát
                </button>
              ) : (
                <button
                  className="cert-auth-login-btn"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setLoginStep(1);
                    setEmailInput('');
                    setOtpInput('');
                    setAuthError(null);
                  }}
                >
                  Đăng nhập OTP
                </button>
              )}
            </div>

            <button className="mobile-hamburger" onClick={() => setIsMobileMenuOpen(true)}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-drawer-close" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
        <div className="mobile-drawer-content">
          <button className={`mobile-drawer-btn ${activeTab === 'tab1' ? 'active' : ''}`} onClick={() => { setActiveTab('tab1'); setIsMobileMenuOpen(false); }}>
            Giới thiệu & Quy định
          </button>
          <button className={`mobile-drawer-btn ${activeTab === 'tab2' ? 'active' : ''}`} onClick={() => { setActiveTab('tab2'); setIsMobileMenuOpen(false); }}>
            Tra cứu chứng chỉ
          </button>
          <button className={`mobile-drawer-btn ${activeTab === 'tab3' ? 'active' : ''}`} onClick={() => { setActiveTab('tab3'); setIsMobileMenuOpen(false); }}>
            Hỗ trợ học viên
          </button>
          
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--kht-border)' }}>
              {userToken ? (
                <button className="mobile-drawer-btn" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                  Đã đăng nhập ({userRole === 'admin' ? 'Admin' : 'Học viên'}) - Thoát
                </button>
              ) : (
                <button
                  className="mobile-drawer-btn login-btn"
                  style={{ background: 'var(--kht-green)', color: '#fff' }}
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setLoginStep(1);
                    setEmailInput('');
                    setOtpInput('');
                    setAuthError(null);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Đăng nhập OTP
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="cert-lookup-main-content">{renderTabContent()}</div>

      <footer className="cert-lookup-footer">
        <p>
          Hỗ trợ: <a href="mailto:academy@khitamtherapy.com">academy@khitamtherapy.com</a>
        </p>
        <p className="cert-lookup-copyright">© {new Date().getFullYear()} Khí Tâm Therapy. All rights reserved.</p>
      </footer>

      {renderPublicResultsModal()}
      {renderLoginModal()}
    </div>
  );
};

export default CertificateLookup;

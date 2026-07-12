import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Form, InputGroup, Row, Col, Card } from 'react-bootstrap';

const API = 'https://www.system.crmkhitam.com/api/v1/elite-mastermind/getmasters';

const CAREER_MAP = {
  tam_ly_tri_lieu: 'Tâm lý trị liệu',
  than_tri_lieu: 'Thân trị liệu',
  dao_tao_kinh_doanh: 'Đào tạo kinh doanh',
  chuyen_gia_tong_luc: 'Chuyên gia tổng lực',
  khac: 'Khác'
};

const MENTOR_MAP = {
  ca_benh_kho: 'Ca bệnh khó',
  tam_ly_khai_van: 'Tâm lý khai vấn',
  thuong_hieu_khach: 'Thương hiệu & khách',
  khac: 'Khác'
};

const DISCIPLINE_MAP = {
  san_sang: '✅ Sẵn sàng và quyết tâm',
  can_nhac_nho: '🙏 Cần hỗ trợ nhắc nhở'
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');
const fmtMoney = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—');
const getInitials = (name) =>
  name
    ? name
        .trim()
        .split(' ')
        .slice(-2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
    : '?';

const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'warning', text: 'Chờ duyệt' },
    reviewed: { bg: 'info', text: 'Đã review' },
    onboarded: { bg: 'success', text: 'Onboarded' }
  };
  const cfg = map[status] || { bg: 'secondary', text: status };
  return (
    <Badge bg={cfg.bg} style={{ fontSize: 11 }}>
      {cfg.text}
    </Badge>
  );
};

const TagPill = ({ children }) => (
  <span
    style={{
      display: 'inline-block',
      background: '#f5ebe0',
      color: '#7a4010',
      borderRadius: 4,
      padding: '2px 7px',
      fontSize: 11,
      margin: '2px 2px 0 0'
    }}
  >
    {children}
  </span>
);

const InfoRow = ({ label, value }) => (
  <tr>
    <td style={{ color: '#888', fontSize: 12, padding: '4px 8px 4px 0', whiteSpace: 'nowrap', width: '40%' }}>{label}</td>
    <td style={{ fontSize: 12, color: '#2c1a08', padding: '4px 0' }}>{value || '—'}</td>
  </tr>
);

const SectionTitle = ({ step, title }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 600,
      color: '#a07840',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1px solid #f0e4cc',
      paddingBottom: 4,
      marginBottom: 10,
      marginTop: 14
    }}
  >
    Bước {step} — {title}
  </div>
);

const ExpandDetail = ({ d }) => (
  <tr>
    <td colSpan={7} style={{ background: '#fdf8f2', padding: '16px 20px', borderBottom: '1px solid #e8d8c0' }}>
      <Row>
        {/* Step 1 */}
        <Col md={6}>
          <SectionTitle step={1} title="Thông tin cá nhân & Nền tảng" />
          <table style={{ width: '100%' }}>
            <tbody>
              <InfoRow label="Họ và tên" value={d.name} />
              <InfoRow label="Email" value={d.email} />
              <InfoRow label="Số điện thoại" value={d.phone} />
              <InfoRow label="Năm sinh" value={d.yearOfBirth} />
              <InfoRow label="Khu vực sinh sống" value={d.location} />
              <InfoRow label="Công việc hiện tại" value={d.currentJob} />
            </tbody>
          </table>
          {d.completedCourses?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Khóa đã hoàn thành</div>
              {d.completedCourses.map((c) => (
                <TagPill key={c}>{c}</TagPill>
              ))}
            </div>
          )}
        </Col>

        {/* Step 2 */}
        <Col md={6}>
          <SectionTitle step={2} title="Định vị bản thân" />
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Định hướng nghề nghiệp</div>
          {d.careerDirections?.length > 0 ? (
            d.careerDirections.map((v) => <TagPill key={v}>{CAREER_MAP[v] || v}</TagPill>)
          ) : (
            <span style={{ fontSize: 12, color: '#ccc' }}>—</span>
          )}
          {d.careerDirectionOther && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
              <span style={{ color: '#aaa' }}>Khác: </span>
              {d.careerDirectionOther}
            </div>
          )}

          <SectionTitle step={3} title="Kế hoạch tài chính" />
          <table style={{ width: '100%' }}>
            <tbody>
              <InfoRow label="Phí mong muốn / giờ" value={fmtMoney(d.desiredHourlyRate)} />
              <InfoRow label="Thu nhập MT / tháng" value={fmtMoney(d.targetMonthlyIncome)} />
              <InfoRow label="Thu nhập MT / năm" value={fmtMoney(d.targetYearlyIncome)} />
              <InfoRow label="Thị trường ngách" value={d.nicheMarket} />
            </tbody>
          </table>
        </Col>

        {/* Step 4 */}
        <Col md={6}>
          <SectionTitle step={4} title="Cam kết & Kỷ luật" />
          <table style={{ width: '100%' }}>
            <tbody>
              <InfoRow label="Giờ tự học / ngày" value={d.dailyStudyHours ? d.dailyStudyHours + 'h' : null} />
              <InfoRow label="Khung giờ học" value={d.dailyStudyTimeSlot} />
              <InfoRow label="Giờ trị liệu / tuần" value={d.weeklyClientHours ? d.weeklyClientHours + 'h' : null} />
              <InfoRow label="Tính kỷ luật" value={DISCIPLINE_MAP[d.disciplineCommitment]} />
            </tbody>
          </table>
        </Col>

        {/* Step 5 */}
        <Col md={6}>
          <SectionTitle step={5} title="Trăn trở & Nhu cầu dẫn dắt" />
          {d.biggestFear && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>Nỗi sợ lớn nhất</div>
              <div
                style={{
                  fontSize: 12,
                  background: '#fff8f0',
                  border: '0.5px solid #e8d8c0',
                  borderRadius: 6,
                  padding: '6px 10px',
                  lineHeight: 1.6
                }}
              >
                {d.biggestFear}
              </div>
            </div>
          )}
          {d.directHelpNeeded && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 3 }}>Cần Master giúp trực tiếp</div>
              <div
                style={{
                  fontSize: 12,
                  background: '#fff8f0',
                  border: '0.5px solid #e8d8c0',
                  borderRadius: 6,
                  padding: '6px 10px',
                  lineHeight: 1.6
                }}
              >
                {d.directHelpNeeded}
              </div>
            </div>
          )}
          {d.mentorFocus?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>Mảng muốn được Mentor</div>
              {d.mentorFocus.map((v) => (
                <TagPill key={v}>{MENTOR_MAP[v] || v}</TagPill>
              ))}
            </div>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: 12, fontSize: 11, color: '#bbb' }}>
        Ngày nộp: {fmtDate(d.submittedAt)} &nbsp;|&nbsp; CRM synced: {d.crmSynced ? 'Có' : 'Chưa'} &nbsp;|&nbsp; ID: {d._id}
      </div>
    </td>
  </tr>
);

export default function EliteMastermindList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('new');

  useEffect(() => {
    fetch(API)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((json) => setData(json.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = [...data]
    .filter((d) => {
      const q = search.toLowerCase();
      const match =
        !q || (d.name || '').toLowerCase().includes(q) || (d.email || '').toLowerCase().includes(q) || (d.phone || '').includes(q);
      return match && (!filterStatus || d.status === filterStatus);
    })
    .sort((a, b) => {
      if (sortBy === 'new') return new Date(b.submittedAt) - new Date(a.submittedAt);
      if (sortBy === 'old') return new Date(a.submittedAt) - new Date(b.submittedAt);
      return (a.name || '').localeCompare(b.name || '', 'vi');
    });

  const counts = {
    total: data.length,
    pending: data.filter((d) => d.status === 'pending').length,
    reviewed: data.filter((d) => d.status === 'reviewed').length,
    onboarded: data.filter((d) => d.status === 'onboarded').length
  };

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div style={{ padding: '1.25rem' }}>
      {/* Banner */}
      <div
        style={{
          background: '#2c1a08',
          borderRadius: 12,
          padding: '1rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#a07840', letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' }}>
            Hội viên Membership VIP
          </div>
          <div style={{ color: '#e8d0a0', fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
            Đăng ký đồng hành & Phát triển sự nghiệp cùng Master Sridevi Tố Hải (VIP Elite)
          </div>
          <div style={{ color: '#a07840', fontSize: 11, marginTop: 3 }}>Hành trình xây dựng sự nghiệp trị liệu thịnh vượng</div>
        </div>
        <div
          style={{
            background: '#b8955a',
            color: '#2c1a08',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 4,
            whiteSpace: 'nowrap'
          }}
        >
          VIP ELITE
        </div>
      </div>

      {/* Stats */}
      <Row className="g-2 mb-3">
        {[
          { label: 'Tổng đơn', value: counts.total, color: '#2c1a08' },
          { label: 'Chờ duyệt', value: counts.pending, color: '#854F0B' },
          { label: 'Đã review', value: counts.reviewed, color: '#185FA5' },
          { label: 'Onboarded', value: counts.onboarded, color: '#3B6D11' }
        ].map(({ label, value, color }) => (
          <Col key={label} xs={6} md={3}>
            <Card style={{ background: '#fdf8f2', border: '0.5px solid #e8d8c0' }}>
              <Card.Body style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 500, color }}>{value}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Toolbar */}
      <Row className="g-2 mb-3">
        <Col md={6}>
          <Form.Control
            placeholder="Tìm tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 13, borderColor: '#d8c8b0' }}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ fontSize: 13, borderColor: '#d8c8b0' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="reviewed">Đã review</option>
            <option value="onboarded">Onboarded</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ fontSize: 13, borderColor: '#d8c8b0' }}>
            <option value="new">Mới nhất</option>
            <option value="old">Cũ nhất</option>
            <option value="az">Tên A → Z</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table */}
      <Card style={{ border: '0.5px solid #e8d8c0', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spinner animation="border" variant="warning" />
            <div style={{ marginTop: 10, fontSize: 13, color: '#aaa' }}>Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#A32D2D', fontSize: 13 }}>Không thể kết nối API: {error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa', fontSize: 13 }}>Không có dữ liệu phù hợp</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table style={{ margin: 0, fontSize: 13, minWidth: 700 }}>
              <thead style={{ background: '#fdf8f2' }}>
                <tr>
                  {['Họ và tên', 'Điện thoại', 'Khu vực', 'Định hướng nghề', 'Thu nhập MT/tháng', 'Trạng thái', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '9px 12px',
                        fontSize: 11,
                        color: '#a07840',
                        fontWeight: 600,
                        borderBottom: '1px solid #e8d8c0',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <>
                    <tr
                      key={d._id}
                      onClick={() => toggle(d._id)}
                      style={{ cursor: 'pointer', background: openId === d._id ? '#fdf8f2' : 'transparent' }}
                    >
                      <td style={{ padding: '9px 12px', borderBottom: '0.5px solid #f0e8d8', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#f5ebe0',
                              color: '#7a4010',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 500,
                              flexShrink: 0
                            }}
                          >
                            {getInitials(d.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: '#2c1a08' }}>{d.name || '—'}</div>
                            <div style={{ fontSize: 11, color: '#aaa' }}>{d.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: '0.5px solid #f0e8d8', verticalAlign: 'middle' }}>
                        {d.phone || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: '0.5px solid #f0e8d8', verticalAlign: 'middle' }}>
                        {d.location || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: '0.5px solid #f0e8d8', verticalAlign: 'middle' }}>
                        {d.careerDirections?.length > 0 ? (
                          d.careerDirections.map((v) => <TagPill key={v}>{CAREER_MAP[v] || v}</TagPill>)
                        ) : (
                          <span style={{ color: '#ccc' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: '0.5px solid #f0e8d8', verticalAlign: 'middle' }}>
                        {fmtMoney(d.targetMonthlyIncome)}
                      </td>
                      <td style={{ padding: '9px 12px', borderBottom: '0.5px solid #f0e8d8', verticalAlign: 'middle' }}>
                        <StatusBadge status={d.status} />
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          borderBottom: '0.5px solid #f0e8d8',
                          verticalAlign: 'middle',
                          color: '#aaa',
                          textAlign: 'center'
                        }}
                      >
                        {openId === d._id ? '▾' : '▸'}
                      </td>
                    </tr>
                    {openId === d._id && <ExpandDetail key={d._id + '_exp'} d={d} />}
                  </>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

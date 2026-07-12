import React from 'react';

const sec = {
  marginBottom: '28px',
  background: '#fff',
  borderRadius: '10px',
  border: '1px solid var(--kht-border)',
  padding: '20px 24px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
};
const h3 = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--kht-text)',
  marginBottom: '10px',
  paddingBottom: '8px',
  borderBottom: '1.5px solid var(--kht-border)',
  letterSpacing: '0.01em',
  textTransform: 'uppercase'
};
const p = { fontSize: '0.88rem', color: 'var(--kht-text)', lineHeight: '1.65', margin: '0 0 6px 0' };
const li = { fontSize: '0.87rem', color: 'var(--kht-text)', lineHeight: '1.65', marginBottom: '6px' };
const lnk = { color: 'var(--kht-highlight)', fontWeight: '600', textDecoration: 'none', display: 'block', marginBottom: '4px' };
const bdg = {
  display: 'inline-block',
  background: 'var(--kht-bg)',
  color: 'var(--kht-highlight)',
  borderRadius: '4px',
  padding: '2px 8px',
  fontSize: '0.78rem',
  fontWeight: '700',
  marginRight: '6px',
  flexShrink: 0
};
const cod = { color: 'var(--kht-highlight)', background: 'var(--kht-bg)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.85rem' };

const STEPS = [
  ['B1', 'Hoàn thành đào tạo', 'Tham gia đầy đủ thời lượng, đáp ứng quy định chuyên cần và hoàn thành bài tập theo yêu cầu.'],
  ['B2', 'Đạt điều kiện khảo thí', 'Vượt qua bài kiểm tra lý thuyết, bài luận và các buổi thực hành lâm sàng.'],
  ['B3', 'Phê duyệt hội đồng', 'Hội đồng Khảo thí và Ban Giám đốc phê duyệt danh sách tốt nghiệp dựa trên kết quả thực tế.'],
  ['B4', 'Số hóa & Cấp phát', 'Cấp chứng nhận tại lễ tốt nghiệp, đồng bộ thông tin lên Portal để tra cứu vĩnh viễn.']
];

const ACCRED = [
  ['CHP', 'Anh Quốc', 'Complementary Health Professionals — Kiểm định độc lập, công nhận giáo trình đạt tiêu chuẩn lâm sàng quốc tế.'],
  [
    'CNHC',
    'Anh Quốc',
    'Complementary and Natural Healthcare Council — Do Chính phủ Anh thành lập, bảo chứng tính khoa học và an toàn lâm sàng.'
  ],
  [
    'RYS 200/300/500',
    'Yoga Alliance — Mỹ',
    'Đăng ký chính thức với Yoga Alliance (Hiệp hội Yoga Mỹ), cấp chứng chỉ Huấn luyện viên toàn cầu.'
  ]
];

const CertTab1 = () => (
  <div className="cert-tab-content fade-in" style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 0' }}>
    <div style={sec}>
      <h3 style={h3}>Chào mừng quý học viên</h3>
      <p style={p}>
        Chào mừng bạn đến với <strong>Hệ thống Xác thực Văn bằng và Chứng nhận Điện tử chính thức</strong> của The Khi Tam School. Trang
        portal này giúp học viên chủ động quản lý lộ trình học tập, đồng thời giúp các đối tác, nhà tuyển dụng dễ dàng đối chiếu, xác thực
        tính pháp lý văn bằng một cách minh bạch.
      </p>
    </div>

    <div style={sec}>
      <h3 style={h3}>Quy trình cấp chứng nhận tại Học viện</h3>
      <p style={p}>Để sở hữu tấm bằng chính thức, mỗi học viên đều trải qua quy trình 4 bước:</p>
      {STEPS.map(([b, t, d]) => (
        <div key={b} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
          <span style={bdg}>{b}</span>
          <p style={{ ...p, margin: 0 }}>
            <strong>{t}:</strong> {d}
          </p>
        </div>
      ))}
    </div>

    <div style={sec}>
      <h3 style={h3}>Số hiệu bằng & Mã học viên mới (Áp dụng từ 2026)</h3>
      <p style={p}>Cấu trúc được chuẩn hóa toàn hệ thống:</p>
      <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
        <li style={li}>
          <strong>Số hiệu bằng mới:</strong> <code style={cod}>KTA/[Mã Học Viên]/[Năm cấp]</code>
        </li>
        <li style={li}>
          <strong>Cấu trúc Mã HV:</strong> <code style={cod}>[Mã khóa]-[Số thứ tự khóa]-[Số thứ tự HV]</code>
        </li>
        <li style={li}>
          <strong>Ví dụ:</strong> <code style={cod}>KTA/KHL200-K01-0001/2026</code>
        </li>
      </ul>
    </div>

    <div style={sec}>
      <h3 style={h3}>Ghi chú lịch sử — Văn bằng hệ cũ (Trước 2026)</h3>
      <p style={p}>Hệ thống vẫn nhận diện chính xác theo các định dạng cũ:</p>
      <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
        <li style={li}>
          <strong>K21 trở về trước:</strong> <code style={cod}>No: 05/YTL–K21/2023</code>
        </li>
        <li style={li}>
          <strong>K22 đến 2025 (Hệ dài hạn):</strong> <code style={cod}>01/YTL200/Aca2025</code> hoặc{' '}
          <code style={cod}>01/YTL200_K28/Aca2025</code>
        </li>
        <li style={li}>
          <strong>Khóa ngắn hạn/Bổ trợ:</strong> <code style={cod}>01/Aca2024</code>
        </li>
      </ul>
    </div>

    <div style={{ ...sec, background: 'linear-gradient(135deg, var(--kht-bg), #fff)', border: '1px solid var(--kht-border)' }}>
      <h3 style={{ ...h3, color: 'var(--kht-text)', borderColor: 'var(--kht-border)' }}>🌐 Các tổ chức Kiểm định Quốc tế</h3>
      <p style={{ ...p, marginBottom: '14px' }}>Giáo trình của Khí Tâm được kiểm định bởi các tổ chức Y học hàng đầu thế giới:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '10px', marginBottom: '16px' }}>
        {ACCRED.map(([b, c, d]) => (
          <div key={b} style={{ background: '#fff', borderRadius: '8px', padding: '12px 14px', border: '1px solid var(--kht-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', color: 'var(--kht-text)', fontSize: '0.9rem' }}>{b}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--kht-muted)', background: 'var(--kht-bg)', padding: '1px 6px', borderRadius: '3px' }}>
                {c}
              </span>
            </div>
            <p style={{ ...p, margin: 0, fontSize: '0.82rem' }}>{d}</p>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--kht-border)', paddingTop: '14px' }}>
        <p style={{ ...p, fontWeight: '600', marginBottom: '8px' }}>Tra cứu pháp lý quốc tế chính thức:</p>
        <a
          href="https://www.complementaryhealthprofessionals.co.uk/accredited-course-providers"
          target="_blank"
          rel="noreferrer"
          style={lnk}
        >
          👉 Danh sách đơn vị đào tạo đạt chuẩn CHP (Anh Quốc)
        </a>
        <a
          href="https://app.yogaalliance.org/schoolpublicprofile?id=0013g000002phZzAAI&sid=0013g000002nmk1AAA&name=The-Khi-Tam-School"
          target="_blank"
          rel="noreferrer"
          style={lnk}
        >
          👉 Hồ sơ The Khi Tam School trên Yoga Alliance
        </a>
        <a href="https://app.yogaalliance.org/teacherpublicprofile?id=0033g0000023XCbAAM" target="_blank" rel="noreferrer" style={lnk}>
          👉 Hồ sơ Master Sridevi Tố Hải trên Yoga Alliance
        </a>
        <a href="https://khitamhealthhub.com" target="_blank" rel="noreferrer" style={lnk}>
          👉 Trang thông tin chính thức tại UK: khitamhealthhub.com
        </a>
        <a href="#" style={{ ...lnk, color: '#999' }}>
          👉 Tải file PDF tiêu chuẩn đào tạo CHP (Đang cập nhật link)
        </a>
      </div>
    </div>
  </div>
);

export default CertTab1;

import React from 'react';

const sec = { marginBottom: '20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--kht-border)', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' };
const h3 = { fontSize: '0.95rem', fontWeight: '700', color: 'var(--kht-text)', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1.5px solid var(--kht-border)', letterSpacing: '0.01em', textTransform: 'uppercase' };
const p = { fontSize: '0.87rem', color: 'var(--kht-text)', lineHeight: '1.65', margin: '0 0 8px 0' };
const li = { fontSize: '0.87rem', color: 'var(--kht-text)', lineHeight: '1.65', marginBottom: '8px' };
const lnk = { color: 'var(--kht-highlight)', fontWeight: '600', textDecoration: 'none' };
const stepSt = { fontSize: '0.87rem', color: 'var(--kht-text)', lineHeight: '1.65', margin: '0 0 6px 0', paddingLeft: '8px', borderLeft: '3px solid var(--kht-border)' };
const btn = { display: 'inline-block', backgroundColor: 'var(--kht-highlight)', color: '#fff', padding: '10px 22px', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem', marginTop: '12px' };
const card = { background: 'var(--kht-bg)', borderRadius: '7px', padding: '12px 14px', border: '1px solid var(--kht-border)' };

const STEPS_YA = [
  'Truy cập trang chủ Yoga Alliance, tạo tài khoản và chọn "Register as a Teacher".',
  'Chọn cấp độ tương ứng (RYT200/RYT500). Tìm trường: Khi Tam Therapy Academy trong danh mục RYS.',
  'Tải file chứng nhận bản mềm lên hệ thống, điền ngày bắt đầu/kết thúc khóa học.',
  'Hệ thống Yoga Alliance sẽ gửi email xác nhận. Học viện sẽ Approve hồ sơ trực tuyến cho bạn.',
];

const CertTab3 = () => (
  <div className="cert-tab-content fade-in" style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 0' }}>

    <div style={sec}>
      <h3 style={h3}>🔒 Chính sách bảo mật</h3>
      <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
        <li style={li}><strong>Bảo mật thông tin học viên:</strong> Chỉ hiển thị dữ liệu tối thiểu. Toàn bộ thông tin nhạy cảm (SĐT, Email, Địa chỉ) được ẩn hoàn toàn khi tra cứu công khai.</li>
        <li style={li}><strong>Tính pháp lý chứng nhận điện tử:</strong> Bản sao điện tử (E-Certificate) và kết quả tra cứu trên Portal này có giá trị xác thực tương đương bản phôi bằng giấy.</li>
        <li style={li}><strong>Miễn trừ trách nhiệm văn bằng giả:</strong> Học viện không chịu trách nhiệm đối với các tài liệu có thông tin không trùng khớp với dữ liệu gốc trên Portal.</li>
      </ul>
    </div>

    <div style={sec}>
      <h3 style={h3}>🏅 Đăng ký Yoga Alliance (RYT200, RYT500)</h3>
      <p style={p}>Dành cho học viên tốt nghiệp các hệ khóa HLV Yoga của Khí Tâm muốn quốc tế hóa bằng cấp:</p>
      {STEPS_YA.map((s, i) => (
        <p key={i} style={stepSt}><strong>Bước {i + 1}:</strong> {s}</p>
      ))}
      <a href="https://khitamtherapy.com/huong-dan-yoga-alliance-us/" target="_blank" rel="noreferrer" style={lnk}>
        👉 Xem hướng dẫn chi tiết bằng hình ảnh tại đây
      </a>
    </div>

    <div style={sec}>
      <h3 style={h3}>📞 Hỗ trợ khác</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={card}>
          <p style={{ ...p, fontWeight: '600', color: 'var(--kht-text)', margin: '0 0 4px 0' }}>Khóa Yoga Liên Đoàn Việt Nam</p>
          <p style={{ ...p, margin: 0 }}>Dành cho HLV tốt nghiệp hệ 200h muốn hoàn thiện pháp lý hành nghề. Liên hệ Ban Đào tạo: <em>SĐT cô Hiền [Đang cập nhật]</em></p>
        </div>
        <div style={card}>
          <p style={{ ...p, fontWeight: '600', color: 'var(--kht-text)', margin: '0 0 4px 0' }}>Khóa nâng cao chuyên sâu</p>
          <p style={{ ...p, margin: 0 }}>HLV Khí Tâm Yoga 300h/500h, Chuyên viên Massage 100h... <a href="#" style={lnk}>Xem lịch khai giảng &amp; Đăng ký</a></p>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
      <div style={{ ...sec, marginBottom: 0 }}>
        <h3 style={h3}>📝 Form cấp lại / đính chính văn bằng</h3>
        <p style={p}>Thất lạc bằng giấy, phát hiện sai lệch thông tin? Bộ phận IT xử lý trong <strong>24h–48h</strong>. Cấp lại bản cứng: <strong>15–20 ngày.</strong></p>
        <a href="https://khitamtherapy.sg.larksuite.com/share/base/form/shrlgRMhZ8NqR45DBtgwf1dYs6g?from=navigation" target="_blank" rel="noreferrer" style={btn}>
          Mở Form Cấp Lại / Đính Chính
        </a>
      </div>
      <div style={{ ...sec, marginBottom: 0 }}>
        <h3 style={h3}>🔄 Chuyển đổi hệ 200h Khí Tâm</h3>
        <p style={p}>Tốt nghiệp HLV Yoga 200h tại trường khác? Học viện có chính sách <strong>miễn giảm học phần, ưu đãi học phí</strong> khi chuyển đổi sang hệ đào tạo Khí Tâm.</p>
        <a href="https://khitamtherapy.sg.larksuite.com/share/base/form/shrlgEjPRQsqA1WFTDvYr3bAgkc" target="_blank" rel="noreferrer" style={btn}>
          Mở Form Xin Chuyển Đổi
        </a>
      </div>
    </div>

  </div>
);

export default CertTab3;

import React, { useState } from 'react';

const BE_API = 'https://www.system.crmkhitam.com';

const TestPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', note: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BE_API}/api/public/landing-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, note: form.note })
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message || 'Gửi thất bại, vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#fff', color: '#222', margin: 0, padding: 0 }}>
      {/* HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a5c36 0%, #1a8a52 60%, #2ecc71 100%)',
          color: '#fff',
          padding: '60px 20px 50px',
          textAlign: 'center'
        }}
      >
        <img
          src="https://healthhub.khitamtherapy.com/wp-content/uploads/2024/02/logo-khi-tam-health-hub.png"
          alt="Khí Tâm Logo"
          style={{ height: 60, marginBottom: 24, filter: 'brightness(0) invert(1)' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>Lót Giày Chỉnh Hình Cá Nhân Hoá</h1>
        <p style={{ fontSize: '1.15rem', maxWidth: 680, margin: '0 auto 28px', opacity: 0.92, lineHeight: 1.7 }}>
          Thiết kế bởi công nghệ và thiết bị nhập khẩu độc quyền từ châu Âu, với chất liệu hoàn toàn khác biệt so với thị trường.
        </p>
        <a
          href="#dangky"
          style={{
            background: '#fff',
            color: '#0a5c36',
            fontWeight: 700,
            fontSize: '1.1rem',
            padding: '14px 38px',
            borderRadius: 50,
            textDecoration: 'none',
            display: 'inline-block',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.2s'
          }}
        >
          🔬 Đăng Ký Tư Vấn Ngay
        </a>
      </div>

      {/* ẢNH SẢN PHẨM */}
      <div style={{ background: '#f8fbf9', padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center', color: '#0a5c36', fontSize: '1.8rem', fontWeight: 700, marginBottom: 36 }}>
          Quy Trình 6 Bước — Đo & Sản Xuất Chuẩn Y Khoa
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', maxWidth: 1100, margin: '0 auto' }}>
          {[
            {
              icon: '📊',
              step: 'Bước 1',
              title: 'Đo áp lực bàn chân',
              desc: 'Bằng thiết bị y tế FreeMed nhập khẩu từ Đức — đo chính xác từng điểm áp lực.'
            },
            {
              icon: '📸',
              step: 'Bước 2',
              title: 'Chụp tư thế 4 chiều',
              desc: 'Thiết bị Spine 3D quét hình thể, đánh giá độ lệch cột sống, xương chậu và cổ chân.'
            },
            {
              icon: '🦶',
              step: 'Bước 3',
              title: 'Đo quét 3D bàn chân',
              desc: 'Máy Scan 3D Podoscan lấy dữ liệu 3D chính xác hình dáng lòng bàn chân.'
            },
            {
              icon: '💻',
              step: 'Bước 4',
              title: 'Thiết kế cá nhân hoá',
              desc: 'Bác sĩ phân tích dữ liệu và thiết kế lót giày bằng phần mềm EasyCAD của Ý.'
            },
            {
              icon: '⚙️',
              step: 'Bước 5',
              title: 'Sản xuất CNC',
              desc: 'Máy phay CNC sản xuất từ phôi nguyên khối chất liệu chuyên dụng Eva cao cấp.'
            },
            {
              icon: '✅',
              step: 'Bước 6',
              title: 'Hoàn thiện & Bàn giao',
              desc: 'Chỉnh sửa thủ công tỉ mỉ, kiểm tra chất lượng và bàn giao sản phẩm đến khách hàng.'
            }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '28px 24px',
                width: 300,
                flexShrink: 0,
                boxShadow: '0 2px 16px rgba(10,92,54,0.08)',
                borderTop: '4px solid #1a8a52',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{item.icon}</div>
              <div
                style={{
                  color: '#1a8a52',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 6
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, color: '#0a5c36' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ẢNH THIẾT BỊ FREEMED */}
      <div style={{ padding: '50px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#0a5c36', fontSize: '1.8rem', fontWeight: 700, marginBottom: 12 }}>
          Thiết Bị FreeMed — Đo Áp Lực Bàn Chân
        </h2>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: 36, maxWidth: 700, margin: '0 auto 36px' }}>
          Hệ thống nền đo áp lực bàn chân FreeMed cung cấp phân tích động, tĩnh và đo lường ổn định hoàn hảo.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
          {[
            { src: 'https://healthtech.khitamtherapy.com/wp-content/uploads/2023/05/Gallery1-scaled.webp', label: 'Basic 40×40' },
            { src: 'https://healthtech.khitamtherapy.com/wp-content/uploads/2023/05/Gallery3-scaled.webp', label: 'Basic 120×50' },
            { src: 'https://healthtech.khitamtherapy.com/wp-content/uploads/2023/05/Gallery4-scaled.webp', label: 'Maxi 60×50' },
            { src: 'https://healthtech.khitamtherapy.com/wp-content/uploads/2023/05/Gallery5-scaled.webp', label: 'Basic 40×40 + Walkways' }
          ].map((img, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <img
                src={img.src}
                alt={img.label}
                style={{ width: 220, height: 160, objectFit: 'cover', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/220x160?text=' + img.label;
                }}
              />
              <p style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 600, color: '#0a5c36' }}>{img.label}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <img
            src="https://healthtech.khitamtherapy.com/wp-content/uploads/2023/05/Mockup.webp"
            alt="FreeStep Software"
            style={{ maxWidth: '100%', width: 700, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <p style={{ color: '#555', marginTop: 12, fontStyle: 'italic' }}>Phần mềm FreeStep — Phân tích tư thế & áp lực bàn chân</p>
        </div>
      </div>

      {/* ĐỐI TƯỢNG */}
      <div style={{ background: '#0a5c36', color: '#fff', padding: '50px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Ai Cần Lót Giày Chỉnh Hình?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              'Bệnh bàn chân tiểu đường, bàn chân Charcot, viêm khớp dạng thấp',
              'Biến dạng bàn chân, bàn chân bẹt, gãy xương và ghép xương',
              'Sau phẫu thuật cắt cụt chi hoặc các phẫu thuật chỉnh hình khác',
              'Chênh lệch chiều dài chân do bệnh Paget hoặc yếu cơ do đột quỵ',
              'Đau mỏi chân, cổ chân, khớp gối, khớp háng, cột sống lưng',
              'Bất kỳ vấn đề bàn chân nào đòi hỏi chỉnh hình cá nhân hoá'
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12
                }}
              >
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>✔️</span>
                <span style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LỢI ÍCH */}
      <div style={{ padding: '50px 20px', background: '#f8fbf9' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', color: '#0a5c36', marginBottom: 32 }}>
            Lợi Ích Khi Sử Dụng Lót Giày Chỉnh Hình Khí Tâm
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '⚖️', title: 'Phân bổ đều lực', desc: 'Hỗ trợ phân bổ đều lực tác động lên bàn chân, giảm điểm chịu lực cục bộ.' },
              { icon: '💊', title: 'Giảm đau hiệu quả', desc: 'Giảm đau mỏi chân, cổ chân, khớp gối, khớp háng và cột sống lưng.' },
              {
                icon: '🛡️',
                title: 'Ngăn ngừa biến chứng',
                desc: 'Ngăn ngừa biến chứng nguy hiểm do bàn chân bẹt, lệch trục cổ chân gây ra.'
              },
              { icon: '🚶', title: 'Cải thiện tư thế', desc: 'Cải thiện tư thế đi đứng chuẩn xác, hỗ trợ vận động tự nhiên hơn.' }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '28px 22px',
                  textAlign: 'center',
                  boxShadow: '0 2px 16px rgba(10,92,54,0.08)'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ color: '#0a5c36', fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ĐỘI NGŨ */}
      <div style={{ padding: '50px 20px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center', color: '#0a5c36', marginBottom: 32 }}>
            Đội Ngũ Chuyên Gia
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {[
              { name: 'Master Sridevi Tố Hải', role: 'Chuyên gia trị liệu', img: null },
              { name: 'Trương Thị Minh Hiền', role: 'Chuyên gia chỉnh hình', img: null },
              {
                name: 'Trần Ngọc Xuân',
                role: 'Chuyên gia bàn chân',
                img: 'https://healthhub.khitamtherapy.com/wp-content/uploads/2024/12/z6175990851841_803eb26366bf6cba91b47dcc13fe9d01.jpg.webp'
              },
              {
                name: 'Lê Vũ Đông',
                role: 'Chuyên gia vật lý trị liệu',
                img: 'https://healthhub.khitamtherapy.com/wp-content/uploads/2024/12/z6175990831570_153f24e4ba6b023de91fed7f5ea04f7a.jpg.webp'
              }
            ].map((expert, i) => (
              <div key={i} style={{ textAlign: 'center', width: 180 }}>
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    background: expert.img ? 'transparent' : '#e8f5ee',
                    overflow: 'hidden',
                    border: '3px solid #1a8a52',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                  }}
                >
                  {expert.img ? (
                    <img
                      src={expert.img}
                      alt={expert.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.parentNode.innerHTML = '👤';
                      }}
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div style={{ fontWeight: 700, color: '#0a5c36', marginBottom: 4 }}>{expert.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#777' }}>{expert.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM ĐĂNG KÝ */}
      <div id="dangky" style={{ background: 'linear-gradient(135deg, #0a5c36, #1a8a52)', color: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Đăng Ký Tư Vấn Miễn Phí</h2>
          <p style={{ opacity: 0.88, marginBottom: 32, fontSize: '1rem' }}>
            Để lại thông tin, chuyên gia Khí Tâm sẽ liên hệ tư vấn và đặt lịch đo bàn chân cho bạn.
          </p>
          {sent ? (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '32px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>Đăng ký thành công!</div>
              <div style={{ opacity: 0.85, fontSize: '0.95rem' }}>
                Cảm ơn <strong>{form.name}</strong>! Chuyên gia Khí Tâm sẽ gọi lại trong vòng 24 giờ.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'name', label: 'Họ và tên *', type: 'text', placeholder: 'Nguyễn Văn A', required: true },
                { key: 'phone', label: 'Số điện thoại *', type: 'tel', placeholder: '0912 345 678', required: true },
                {
                  key: 'note',
                  label: 'Vấn đề bàn chân (nếu có)',
                  type: 'textarea',
                  placeholder: 'Bàn chân bẹt, đau gót chân, ...',
                  required: false
                }
              ].map((field) => (
                <div key={field.key} style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        borderRadius: 10,
                        padding: '12px 14px',
                        border: 'none',
                        fontSize: '0.95rem',
                        resize: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        borderRadius: 10,
                        padding: '12px 14px',
                        border: 'none',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>
              ))}
              {error && (
                <div
                  style={{
                    background: 'rgba(255,80,80,0.2)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    textAlign: 'left'
                  }}
                >
                  ⚠️ {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(255,255,255,0.6)' : '#fff',
                  color: '#0a5c36',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  padding: '15px',
                  borderRadius: 50,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  marginTop: 8,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ Đang gửi...' : 'Gửi Đăng Ký →'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: '#053d24', color: '#aaa', padding: '32px 20px', textAlign: 'center', fontSize: '0.9rem' }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Khí Tâm Therapy</p>
        <p>
          📞 Hotline:{' '}
          <a href="tel:1900292989" style={{ color: '#2ecc71', fontWeight: 700, textDecoration: 'none' }}>
            1900 292989
          </a>
        </p>
        <p>
          📧{' '}
          <a href="mailto:academy@khitamtherapy.com" style={{ color: '#2ecc71', textDecoration: 'none' }}>
            academy@khitamtherapy.com
          </a>
        </p>
        <p style={{ marginTop: 12, opacity: 0.6, fontSize: '0.8rem' }}>© 2024 Khí Tâm Therapy. All rights reserved.</p>
      </div>
    </div>
  );
};

export default TestPage;

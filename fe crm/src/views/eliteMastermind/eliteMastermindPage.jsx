import { useState, useEffect } from 'react';

const API_URL = 'https://www.system.crmkhitam.com/api/v1/elite-mastermind/createmaster'; // ← đổi URL backend

const STEPS = ['Thông tin cá nhân', 'Định vị bản thân', 'Kế hoạch tài chính', 'Cam kết & Kỷ luật', 'Trăn trở & Nhu cầu'];

const initialState = {
  name: '',
  email: '',
  phone: '',
  yearOfBirth: '',
  location: '',
  completedCourses: '',
  currentJob: '',
  careerDirections: [],
  careerDirectionOther: '',
  desiredHourlyRate: '',
  targetMonthlyIncome: '',
  targetYearlyIncome: '',
  nicheMarket: '',
  dailyStudyHours: '',
  dailyStudyTimeSlot: '',
  weeklyClientHours: '',
  disciplineCommitment: '',
  biggestFear: '',
  directHelpNeeded: '',
  mentorFocus: [],
  mentorFocusOther: ''
};

export default function EliteMastermindForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleArray = (field, value) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter((v) => v !== value) : [...p[field], value]
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      setError('Vui lòng nhập Họ tên và Email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        completedCourses: form.completedCourses
          ? form.completedCourses
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        yearOfBirth: form.yearOfBirth ? Number(form.yearOfBirth) : undefined,
        desiredHourlyRate: form.desiredHourlyRate ? Number(form.desiredHourlyRate) : undefined,
        targetMonthlyIncome: form.targetMonthlyIncome ? Number(form.targetMonthlyIncome) : undefined,
        targetYearlyIncome: form.targetYearlyIncome ? Number(form.targetYearlyIncome) : undefined,
        dailyStudyHours: form.dailyStudyHours ? Number(form.dailyStudyHours) : undefined,
        weeklyClientHours: form.weeklyClientHours ? Number(form.weeklyClientHours) : undefined
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi server');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessScreen name={form.name} />;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLogos}>
            {/* Left logos */}
            <div style={styles.logosLeft}>
              <img
                src="https://static.wixstatic.com/media/c424b9_8add5ed382524216bb07b758e2e08ef1~mv2.png"
                alt="Logo 1"
                style={styles.logoImg}
              />
              <img
                src="https://static.wixstatic.com/media/c424b9_b0ab355003e4408a93e8d429d3d9b017~mv2.png"
                alt="Logo 2"
                style={styles.logoImg}
              />
            </div>

            {/* Center title */}
            <div style={styles.headerCenter}>
              <p style={styles.titleMembership}>HỘI VIÊN MEMBERSHIP VIP</p>
              <h1 style={styles.titleMain}>
                <span style={{ display: 'block' }}>ĐĂNG KÝ ĐỒNG HÀNH &amp; PHÁT TRIỂN SỰ NGHIỆP</span>
                <span style={{ display: 'block' }}>CÙNG MASTER SRIDEVI TỐ HẢI (VIP ELITE)</span>
              </h1>
            </div>

            {/* Right logo */}
            <div style={styles.logosRight}>
              <img
                src="https://static.wixstatic.com/media/c424b9_dd0007bb8f1544a5b67ac523e479136d~mv2.png"
                alt="Logo 3"
                style={styles.logoImgRight}
              />
            </div>
          </div>
          {/* Line 3: subtitle — keep as is */}
          <p style={styles.subtitle}>Hành trình xây dựng sự nghiệp trị liệu thịnh vượng</p>
        </div>

        {/* Intro — step 0 only */}
        {step === 0 && (
          <div style={styles.intro}>
            <p style={styles.introText}>
              Chào mừng bạn đã chính thức bước chân vào Hành trình Elite Mastermind – nơi chúng ta không chỉ học về kỹ thuật, mà cùng nhau
              xây dựng một sự nghiệp trị liệu tử tế và thịnh vượng. Hãy trả lời thật chân thành, vì mỗi câu chữ của bạn đều giúp cô biết
              mình cần nắm tay bạn như thế nào trên con đường trở thành một Chuyên gia Khí Tâm thực thụ.
            </p>
          </div>
        )}

        {/* Step indicator */}
        <div style={styles.stepBar}>
          {STEPS.map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{ ...styles.stepDot, ...(i <= step ? styles.stepDotActive : {}) }}>{i < step ? '✓' : i + 1}</div>
              <span style={{ ...styles.stepLabel, ...(i === step ? styles.stepLabelActive : {}) }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Form body */}
        <div style={styles.body}>
          {step === 0 && <Step1 form={form} set={set} />}
          {step === 1 && <Step2 form={form} set={set} toggleArray={toggleArray} />}
          {step === 2 && <Step3 form={form} set={set} />}
          {step === 3 && <Step4 form={form} set={set} />}
          {step === 4 && <Step5 form={form} set={set} toggleArray={toggleArray} />}
        </div>

        {/* Error */}
        {error && <div style={styles.error}>⚠ {error}</div>}

        {/* Navigation */}
        <div style={styles.nav}>
          {step > 0 && (
            <button style={styles.btnBack} onClick={() => setStep((s) => s - 1)}>
              ← Quay lại
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button style={styles.btnNext} onClick={() => setStep((s) => s + 1)}>
              Tiếp theo →
            </button>
          ) : (
            <button style={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang gửi...' : '✦ GỬI ĐĂNG KÝ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 1 ────────────────────────────────────────────────────────────────
function Step1({ form, set }) {
  return (
    <Section icon="①" title="Thông tin cá nhân & Nền tảng">
      <Row>
        <Field label="Họ và tên *">
          <input style={styles.input} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nguyễn Thị A" />
        </Field>
        <Field label="Email *">
          <input style={styles.input} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@gmail.com" />
        </Field>
      </Row>
      <Row>
        <Field label="Số điện thoại">
          <input style={styles.input} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0909 xxx xxx" />
        </Field>
        <Field label="Năm sinh">
          <input
            style={styles.input}
            type="number"
            value={form.yearOfBirth}
            onChange={(e) => set('yearOfBirth', e.target.value)}
            placeholder="1990"
          />
        </Field>
      </Row>
      <Field label="Khu vực sinh sống">
        <input style={styles.input} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="TP. Hồ Chí Minh" />
      </Field>
      <Field label="Nền tảng Khí Tâm – Các khóa đã hoàn thành">
        <input
          style={styles.input}
          value={form.completedCourses}
          onChange={(e) => set('completedCourses', e.target.value)}
          placeholder="100h Manual, 200h Yoga Therapy, ... (cách nhau bởi dấu phẩy)"
        />
      </Field>
      <Field label="Công việc hiện tại">
        <textarea
          style={styles.textarea}
          value={form.currentJob}
          onChange={(e) => set('currentJob', e.target.value)}
          placeholder="Trị liệu tự do, kinh doanh, nội trợ..."
          rows={3}
        />
      </Field>
    </Section>
  );
}

// ─── STEP 2 ────────────────────────────────────────────────────────────────
function Step2({ form, set, toggleArray }) {
  const options = [
    { value: 'tam_ly_tri_lieu', label: 'Hướng 1', desc: 'Chuyên gia Tâm lý trị liệu – Nghiên cứu sâu tâm trí, chữa lành cảm xúc.' },
    { value: 'than_tri_lieu', label: 'Hướng 2', desc: 'Chuyên gia Thân trị liệu – Phục hồi tự nhiên, chuyên sâu vận động & xương khớp.' },
    {
      value: 'dao_tao_kinh_doanh',
      label: 'Hướng 3',
      desc: 'Nhà đào tạo & Kinh doanh – Mở trung tâm, đào tạo khóa 200h, xây dựng đội ngũ.'
    },
    { value: 'chuyen_gia_tong_luc', label: 'Hướng 4', desc: 'Chuyên gia Tổng lực 1.200h – Đi trọn lộ trình bằng cấp quốc tế cao nhất.' },
    { value: 'khac', label: 'Hướng khác', desc: '' }
  ];
  return (
    <Section icon="②" title="Định vị bản thân (Tầm nhìn 3–5 năm)">
      <p style={styles.hint}>Bạn hình dung mình sẽ đứng ở đâu trong hệ sinh thái Khí Tâm sau 3–5 năm nữa? (Có thể chọn nhiều)</p>
      <div style={styles.checkGrid}>
        {options.map((o) => (
          <label key={o.value} style={{ ...styles.checkCard, ...(form.careerDirections.includes(o.value) ? styles.checkCardActive : {}) }}>
            <input
              type="checkbox"
              style={{ display: 'none' }}
              checked={form.careerDirections.includes(o.value)}
              onChange={() => toggleArray('careerDirections', o.value)}
            />
            <span style={styles.checkBadge}>{form.careerDirections.includes(o.value) ? '✓' : '○'}</span>
            <div>
              <strong>{o.label}</strong>
              {o.desc && <p style={styles.checkDesc}>{o.desc}</p>}
            </div>
          </label>
        ))}
      </div>
      {form.careerDirections.includes('khac') && (
        <Field label="Mô tả hướng khác">
          <input
            style={styles.input}
            value={form.careerDirectionOther}
            onChange={(e) => set('careerDirectionOther', e.target.value)}
            placeholder="Nhập hướng phát triển của bạn..."
          />
        </Field>
      )}
    </Section>
  );
}

// ─── STEP 3 ────────────────────────────────────────────────────────────────
function Step3({ form, set }) {
  return (
    <Section icon="③" title="Kế hoạch tài chính & Hiệu suất mục tiêu">
      <Row>
        <Field label="Mức phí mong muốn / giờ (VNĐ)">
          <input
            style={styles.input}
            type="number"
            value={form.desiredHourlyRate}
            onChange={(e) => set('desiredHourlyRate', e.target.value)}
            placeholder="500000"
          />
        </Field>
        <Field label="Thu nhập mục tiêu / tháng (VNĐ) – sau 1 năm">
          <input
            style={styles.input}
            type="number"
            value={form.targetMonthlyIncome}
            onChange={(e) => set('targetMonthlyIncome', e.target.value)}
            placeholder="30000000"
          />
        </Field>
      </Row>
      <Row>
        <Field label="Thu nhập mục tiêu / năm (VNĐ) – sau 3–5 năm">
          <input
            style={styles.input}
            type="number"
            value={form.targetYearlyIncome}
            onChange={(e) => set('targetYearlyIncome', e.target.value)}
            placeholder="500000000"
          />
        </Field>
        <Field label="Thị trường ngách">
          <input
            style={styles.input}
            value={form.nicheMarket}
            onChange={(e) => set('nicheMarket', e.target.value)}
            placeholder="Mẹ bầu, Dân văn phòng, Người già, Trẻ em..."
          />
        </Field>
      </Row>
    </Section>
  );
}

// ─── STEP 4 ────────────────────────────────────────────────────────────────
function Step4({ form, set }) {
  const hoursOptions = ['1', '2'];
  const disciplineOptions = [
    { value: 'san_sang', label: '✅ Sẵn sàng và quyết tâm.' },
    { value: 'can_nhac_nho', label: '🙏 Cần cô hỗ trợ nhắc nhở thêm.' }
  ];
  return (
    <Section icon="④" title="Cam kết & Kỷ luật">
      <Field label="Quỹ thời gian tự học & thực hành mỗi ngày">
        <div style={styles.radioGroup}>
          {hoursOptions.map((h) => (
            <label key={h} style={{ ...styles.radioCard, ...(form.dailyStudyHours === h ? styles.radioCardActive : {}) }}>
              <input
                type="radio"
                style={{ display: 'none' }}
                checked={form.dailyStudyHours === h}
                onChange={() => set('dailyStudyHours', h)}
              />
              {h} giờ/ngày
            </label>
          ))}
          <label
            style={{
              ...styles.radioCard,
              ...(form.dailyStudyHours && !['1', '2'].includes(form.dailyStudyHours) ? styles.radioCardActive : {})
            }}
          >
            <input type="radio" style={{ display: 'none' }} onChange={() => set('dailyStudyHours', '')} />
            Khác
          </label>
        </div>
        {form.dailyStudyHours && !['1', '2'].includes(form.dailyStudyHours) && (
          <input
            style={{ ...styles.input, marginTop: 8 }}
            type="number"
            value={form.dailyStudyHours}
            onChange={(e) => set('dailyStudyHours', e.target.value)}
            placeholder="Số giờ / ngày"
          />
        )}
      </Field>
      <Field label="Khung giờ học">
        <input
          style={styles.input}
          value={form.dailyStudyTimeSlot}
          onChange={(e) => set('dailyStudyTimeSlot', e.target.value)}
          placeholder="Ví dụ: 20:00 – 22:00"
        />
      </Field>
      <Field label="Số giờ trị liệu thực tế cho khách hàng / tuần">
        <input
          style={styles.input}
          type="number"
          value={form.weeklyClientHours}
          onChange={(e) => set('weeklyClientHours', e.target.value)}
          placeholder="10"
        />
      </Field>
      <Field label="Tính kỷ luật – Ghi chép nhật ký & báo cáo tiến độ hàng tháng">
        <div style={styles.radioGroup}>
          {disciplineOptions.map((o) => (
            <label
              key={o.value}
              style={{
                ...styles.radioCard,
                ...(form.disciplineCommitment === o.value ? styles.radioCardActive : {}),
                width: '100%',
                justifyContent: 'flex-start'
              }}
            >
              <input
                type="radio"
                style={{ display: 'none' }}
                checked={form.disciplineCommitment === o.value}
                onChange={() => set('disciplineCommitment', o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </Field>
    </Section>
  );
}

// ─── STEP 5 ────────────────────────────────────────────────────────────────
function Step5({ form, set, toggleArray }) {
  const mentorOptions = [
    { value: 'ca_benh_kho', label: '🩺 Chuyên môn ca bệnh khó' },
    { value: 'tam_ly_khai_van', label: '🧠 Tư vấn tâm lý / khai vấn tư duy' },
    { value: 'thuong_hieu_khach', label: '🌟 Xây dựng thương hiệu / tìm kiếm khách hàng' },
    { value: 'khac', label: '✏️ Khác' }
  ];
  return (
    <Section icon="⑤" title="Trăn trở & Nhu cầu được dẫn dắt">
      <Field label="Nỗi sợ lớn nhất hiện tại của bạn là gì?">
        <textarea
          style={styles.textarea}
          value={form.biggestFear}
          onChange={(e) => set('biggestFear', e.target.value)}
          placeholder="Thiếu tự tin, sợ khách chê đắt, không biết marketing, bận việc gia đình..."
          rows={4}
        />
      </Field>
      <Field label="Điều bạn cần Master Sridevi Tố Hải giúp đỡ trực tiếp nhất lúc này?">
        <textarea
          style={styles.textarea}
          value={form.directHelpNeeded}
          onChange={(e) => set('directHelpNeeded', e.target.value)}
          placeholder="Mô tả cụ thể điều bạn cần được hỗ trợ..."
          rows={4}
        />
      </Field>
      <Field label="Bạn muốn được Mentor về mảng nào nhất trong 2 giờ/tháng? (Có thể chọn nhiều)">
        <div style={styles.checkGrid}>
          {mentorOptions.map((o) => (
            <label key={o.value} style={{ ...styles.checkCard, ...(form.mentorFocus.includes(o.value) ? styles.checkCardActive : {}) }}>
              <input
                type="checkbox"
                style={{ display: 'none' }}
                checked={form.mentorFocus.includes(o.value)}
                onChange={() => toggleArray('mentorFocus', o.value)}
              />
              <span style={styles.checkBadge}>{form.mentorFocus.includes(o.value) ? '✓' : '○'}</span>
              {o.label}
            </label>
          ))}
        </div>
      </Field>
      {form.mentorFocus.includes('khac') && (
        <Field label="Mô tả mảng Mentor khác">
          <input
            style={styles.input}
            value={form.mentorFocusOther}
            onChange={(e) => set('mentorFocusOther', e.target.value)}
            placeholder="Nhập mảng bạn muốn được mentor..."
          />
        </Field>
      )}

      {/* Closing quote */}
      <div style={styles.quote}>
        <p>
          "Đừng sợ mất khách. Khách hàng sẽ rời bỏ một người thợ, nhưng họ sẽ luôn trung thành với một{' '}
          <em>chuyên gia có tâm và có phương pháp.</em>"
        </p>
        <span style={styles.quoteAuthor}>— Master Sridevi Tố Hải</span>
      </div>
    </Section>
  );
}

// ─── SUCCESS ───────────────────────────────────────────────────────────────
function SuccessScreen({ name }) {
  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🙏</div>
        <h2 style={{ color: '#2c1f0f', fontSize: 28, fontWeight: 'normal', letterSpacing: 2 }}>Cảm ơn {name}!</h2>
        <p style={{ color: '#7a6a5a', lineHeight: 1.8, marginTop: 16, maxWidth: 480, margin: '16px auto 0' }}>
          Đơn của bạn đã được nhận thành công. Team sẽ review trong <strong>24–48h</strong> và liên hệ để xác nhận + gửi lịch Mentorship đầu
          tiên.
        </p>
        <p style={{ marginTop: 32, color: '#b5956a', fontStyle: 'italic' }}>Hẹn gặp bạn sớm tại phòng làm việc online của cô! ✦</p>
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ─────────────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={styles.row}>{children}</div>;
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const C = {
  bg: '#fdf8f3',
  card: '#ffffff',
  gold: '#b5956a',
  goldLight: '#e8d5b7',
  goldDark: '#8a6a45',
  text: '#2c1f0f',
  muted: '#7a6a5a',
  border: '#e8ddd0',
  active: '#f5ede0',
  error: '#c0392b'
};

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, #fdf8f3 0%, #f5ede0 50%, #fdf8f3 100%)`,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 16px 80px',
    fontFamily: "'Be Vietnam Pro', 'Georgia', serif"
  },
  card: {
    background: C.card,
    borderRadius: 20,
    boxShadow: '0 8px 48px rgba(181,149,106,0.15), 0 2px 8px rgba(0,0,0,0.06)',
    maxWidth: 760,
    width: '100%',
    overflow: 'hidden',
    border: `1px solid ${C.border}`
  },
  header: {
    background: `linear-gradient(135deg, #2c1f0f 0%, #4a3020 100%)`,
    padding: '20px 24px 18px',
    textAlign: 'center'
  },
  headerLogos: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 12
  },
  logosLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    width: 110,
    justifyContent: 'flex-start'
  },
  logoImg: {
    height: 44,
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(1.1)'
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
    minWidth: 0
  },
  logosRight: {
    flexShrink: 0,
    width: 110,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  logoImgRight: {
    height: 44,
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(1.1)'
  },
  // Line 1: HỘI VIÊN MEMBERSHIP VIP — gold, bold, uppercase
  titleMembership: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
    margin: '0 0 5px',
    letterSpacing: 2,
    fontFamily: "'Be Vietnam Pro', sans-serif",
    whiteSpace: 'nowrap'
  },
  // Line 2: ĐĂNG KÝ ĐỒNG HÀNH... — white, uppercase
  titleMain: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
    margin: '0 0 4px',
    letterSpacing: 0.3,
    lineHeight: 1.6,
    fontFamily: "'Be Vietnam Pro', sans-serif"
  },
  // Line 3: subtitle — italic gold light, kept as-is
  subtitle: { color: C.goldLight, fontSize: 14, marginTop: 8, letterSpacing: 1, fontStyle: 'italic' },
  intro: {
    background: `linear-gradient(135deg, #fdf8f3, #f5ede0)`,
    borderBottom: `1px solid ${C.border}`,
    padding: '24px 40px'
  },
  introText: { color: C.muted, lineHeight: 1.9, fontSize: 15, margin: 0, fontStyle: 'italic' },
  stepBar: {
    display: 'flex',
    padding: '20px 40px',
    borderBottom: `1px solid ${C.border}`,
    gap: 0,
    overflowX: 'auto'
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    minWidth: 80
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: C.border,
    color: C.muted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  stepDotActive: { background: C.gold, color: '#fff' },
  stepLabel: { fontSize: 11, color: C.muted, textAlign: 'center', letterSpacing: 0.5 },
  stepLabelActive: { color: C.goldDark, fontWeight: 'bold' },
  body: { padding: '32px 40px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  sectionIcon: { fontSize: 22, color: C.gold },
  sectionTitle: { color: C.text, fontSize: 20, fontWeight: 'normal', margin: 0, letterSpacing: 1 },
  sectionBody: { display: 'flex', flexDirection: 'column', gap: 20 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: C.muted, letterSpacing: 0.5, fontWeight: 'bold' },
  hint: { color: C.muted, fontSize: 14, fontStyle: 'italic', margin: '0 0 16px' },
  input: {
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 15,
    color: C.text,
    background: '#fdfaf7',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  },
  textarea: {
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 15,
    color: C.text,
    background: '#fdfaf7',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box'
  },
  checkGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  checkCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 16px',
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    color: C.text,
    background: '#fdfaf7',
    transition: 'all 0.2s',
    lineHeight: 1.5
  },
  checkCardActive: { border: `1.5px solid ${C.gold}`, background: C.active },
  checkBadge: { color: C.gold, fontWeight: 'bold', flexShrink: 0, marginTop: 1 },
  checkDesc: { fontSize: 12, color: C.muted, margin: '4px 0 0', lineHeight: 1.5 },
  radioGroup: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  radioCard: {
    padding: '10px 20px',
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: C.text,
    background: '#fdfaf7',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  radioCardActive: { border: `1.5px solid ${C.gold}`, background: C.active, color: C.goldDark },
  quote: {
    background: `linear-gradient(135deg, #2c1f0f, #4a3020)`,
    borderRadius: 12,
    padding: '24px 28px',
    color: C.goldLight,
    fontSize: 15,
    lineHeight: 1.8,
    marginTop: 16,
    fontStyle: 'italic'
  },
  quoteAuthor: { display: 'block', marginTop: 12, color: C.gold, fontSize: 13, fontStyle: 'normal', letterSpacing: 1 },
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 40px 32px',
    borderTop: `1px solid ${C.border}`
  },
  btnBack: {
    padding: '10px 24px',
    border: `1.5px solid ${C.border}`,
    borderRadius: 8,
    background: 'transparent',
    color: C.muted,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit'
  },
  btnNext: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: 8,
    background: C.gold,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 15,
    fontFamily: 'inherit',
    letterSpacing: 1
  },
  btnSubmit: {
    padding: '14px 40px',
    border: 'none',
    borderRadius: 8,
    background: `linear-gradient(135deg, #2c1f0f, #4a3020)`,
    color: C.gold,
    cursor: 'pointer',
    fontSize: 16,
    fontFamily: 'inherit',
    letterSpacing: 2,
    fontWeight: 'bold'
  },
  error: {
    margin: '0 40px 16px',
    padding: '12px 16px',
    background: '#fdf0f0',
    border: `1px solid ${C.error}`,
    borderRadius: 8,
    color: C.error,
    fontSize: 14
  }
};

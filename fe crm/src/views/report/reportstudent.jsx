import "react-datepicker/dist/react-datepicker.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import AsyncSelect from "react-select/async";

const ITEMS_PER_PAGE = 10;
const SEARCH_ITEMS_PER_PAGE = 10;
const BASE_URL = "http://localhost:3056/api/v1/contact";
const API_PRODUCTS = "http://localhost:3056/api/v1";
const CAN_ASSIGN_ROLES = ["Admin", "KTT Sale Manager"];

const getOneWeekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

const SEARCH_START_DATE = new Date("2021-02-01T00:00:00.000Z");
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};
/* ─── Color tokens ──────────────────────────────────────────────────────── */
const C = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF6FF",
  success: "#059669",
  successSoft: "#ECFDF5",
  warning: "#D97706",
  warningSoft: "#FFFBEB",
  danger: "#DC2626",
  purple: "#7C3AED",
  purpleSoft: "#F5F3FF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  white: "#FFFFFF",
  radius: "10px",
  radiusSm: "6px",
  shadow: "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,.10)",
};

const S = {
  page: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: C.gray800 },

  tabBar: {
    display: "flex",
    gap: "6px",
    marginBottom: "16px",
    borderBottom: `2px solid ${C.gray200}`,
    paddingBottom: "0",
  },
  tab: (active, color = C.primary) => ({
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 18px",
    border: "none",
    borderRadius: `${C.radiusSm} ${C.radiusSm} 0 0`,
    cursor: "pointer",
    fontWeight: active ? 700 : 500,
    fontSize: "14px",
    background: active ? C.white : "transparent",
    color: active ? color : C.gray600,
    borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
    marginBottom: "-2px",
    transition: "all .18s",
  }),

  searchWrap: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "20px",
  },
  searchInput: {
    height: "42px",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${C.gray200}`,
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    flex: 1,
    maxWidth: "380px",
    transition: "border-color .18s",
  },
  btnPrimary: {
    height: "42px",
    padding: "0 20px",
    borderRadius: C.radiusSm,
    border: "none",
    background: C.primary,
    color: C.white,
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background .18s",
  },
  btnSuccess: {
    height: "42px",
    padding: "0 20px",
    borderRadius: C.radiusSm,
    border: "none",
    background: C.success,
    color: C.white,
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background .18s",
  },
  btnGhost: {
    height: "42px",
    padding: "0 14px",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${C.gray200}`,
    background: C.white,
    color: C.gray600,
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
  },

  resultCard: (color) => ({
    border: `1.5px solid ${color}20`,
    borderRadius: C.radius,
    boxShadow: C.shadowMd,
    marginBottom: "24px",
    overflow: "hidden",
  }),
  resultHeader: (bg) => ({
    background: bg,
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),
  resultTitle: {
    color: C.white,
    fontWeight: 700,
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  badge: (bg, text = C.white) => ({
    background: bg,
    color: text,
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "12px",
    fontWeight: 600,
  }),
  closeBtn: {
    background: "rgba(255,255,255,.2)",
    border: "none",
    color: C.white,
    borderRadius: C.radiusSm,
    padding: "4px 12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },

  filterBox: {
    background: C.white,
    border: `1.5px solid ${C.gray200}`,
    borderRadius: C.radius,
    padding: "18px 20px",
    marginBottom: "24px",
    boxShadow: C.shadow,
  },
  filterTitle: {
    fontWeight: 700,
    fontSize: "14px",
    color: C.gray600,
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  quickBtn: (active) => ({
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 500,
    border: `1.5px solid ${active ? C.primary : C.gray200}`,
    background: active ? C.primarySoft : C.white,
    color: active ? C.primary : C.gray600,
    cursor: "pointer",
    transition: "all .15s",
  }),
  dateInput: {
    height: "38px",
    border: `1.5px solid ${C.gray200}`,
    borderRadius: C.radiusSm,
    padding: "0 12px",
    fontSize: "13px",
    outline: "none",
    width: "140px",
  },

  mainCard: {
    border: `1.5px solid ${C.gray200}`,
    borderRadius: C.radius,
    boxShadow: C.shadowMd,
    overflow: "hidden",
    marginBottom: "24px",
  },
  mainCardHeader: {
    background: C.white,
    padding: "16px 20px",
    borderBottom: `1.5px solid ${C.gray100}`,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  mainCardTitle: { fontWeight: 700, fontSize: "16px", margin: 0 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "13.5px" },
  th: {
    background: C.gray50,
    padding: "11px 14px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "12px",
    color: C.gray600,
    textTransform: "uppercase",
    letterSpacing: ".4px",
    borderBottom: `2px solid ${C.gray200}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 14px",
    borderBottom: `1px solid ${C.gray100}`,
    verticalAlign: "middle",
  },

  infoLine: { fontSize: "13px", color: C.gray600, marginBottom: "2px" },
  infoLabel: { fontWeight: 600, color: C.gray800, marginRight: "4px" },

  btnDetail: {
    padding: "5px 12px",
    borderRadius: C.radiusSm,
    border: "none",
    background: "#EFF6FF",
    color: C.primary,
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnAssign: {
    padding: "5px 12px",
    borderRadius: C.radiusSm,
    border: "none",
    background: C.warningSoft,
    color: C.warning,
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  // ── nút gửi email ──
  btnEmail: {
    padding: "5px 12px",
    borderRadius: C.radiusSm,
    border: "none",
    background: "#F5F3FF",
    color: "#7C3AED",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  paginationWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "4px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  pageBtn: (active, disabled) => ({
    minWidth: "34px",
    height: "34px",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${active ? C.primary : C.gray200}`,
    background: active ? C.primary : disabled ? C.gray100 : C.white,
    color: active ? C.white : disabled ? C.gray400 : C.gray700,
    cursor: disabled ? "default" : "pointer",
    fontWeight: active ? 700 : 400,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  pageInfo: {
    textAlign: "center",
    color: C.gray400,
    fontSize: "12px",
    marginTop: "8px",
  },

  empty: { textAlign: "center", padding: "48px 0", color: C.gray400 },
  emptyIcon: { fontSize: "42px", marginBottom: "10px" },
  emptyText: { fontSize: "14px", fontWeight: 500 },
  emptyHint: { fontSize: "12px", marginTop: "4px" },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
    padding: "20px",
  },
  modalBox: {
    background: C.white,
    borderRadius: C.radius,
    boxShadow: "0 20px 60px rgba(0,0,0,.2)",
    width: "100%",
    maxWidth: "680px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    padding: "18px 24px",
    borderBottom: `1px solid ${C.gray100}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { fontWeight: 700, fontSize: "16px", margin: 0 },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: C.gray400,
    lineHeight: 1,
  },
  modalBody: { padding: "20px 24px" },
  modalFooter: {
    padding: "14px 24px",
    borderTop: `1px solid ${C.gray100}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  infoBox: {
    background: C.gray50,
    border: `1px solid ${C.gray200}`,
    borderRadius: C.radiusSm,
    padding: "14px 16px",
    marginBottom: "16px",
  },
  infoRow: { fontSize: "13.5px", marginBottom: "4px" },

  select: {
    width: "100%",
    height: "40px",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${C.gray200}`,
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
  },
  label: {
    fontWeight: 600,
    fontSize: "13.5px",
    marginBottom: "6px",
    display: "block",
  },

  // email fields
  emailFieldWrap: { marginBottom: "16px" },
  emailInput: {
    width: "100%",
    height: "40px",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${C.gray200}`,
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .18s",
  },
  emailTextarea: {
    width: "100%",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${C.gray200}`,
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    minHeight: "200px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    lineHeight: 1.6,
    transition: "border-color .18s",
  },

  alertSuccess: {
    background: "#ECFDF5",
    border: "1px solid #6EE7B7",
    borderRadius: C.radiusSm,
    padding: "10px 14px",
    color: C.success,
    fontSize: "13.5px",
    marginTop: "12px",
  },
  alertDanger: {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    borderRadius: C.radiusSm,
    padding: "10px 14px",
    color: C.danger,
    fontSize: "13.5px",
    marginTop: "12px",
  },

  btnSecondary: {
    height: "38px",
    padding: "0 18px",
    borderRadius: C.radiusSm,
    border: `1.5px solid ${C.gray200}`,
    background: C.white,
    color: C.gray600,
    fontWeight: 600,
    fontSize: "13.5px",
    cursor: "pointer",
  },
  btnWarning: {
    height: "38px",
    padding: "0 18px",
    borderRadius: C.radiusSm,
    border: "none",
    background: "#F59E0B",
    color: C.white,
    fontWeight: 600,
    fontSize: "13.5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnPurple: {
    height: "38px",
    padding: "0 18px",
    borderRadius: C.radiusSm,
    border: "none",
    background: "#7C3AED",
    color: C.white,
    fontWeight: 600,
    fontSize: "13.5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const statusMapping = {
  Pending: "Đang xử lý",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  Installment: "Trả góp",
};
const paginate = (list, page, perPage) =>
  list.slice((page - 1) * perPage, page * perPage);
const QUICK_RANGES = [
  "Hôm nay",
  "1 tuần qua",
  "1 tháng qua",
  "1 năm qua",
  "Từ đầu",
];

/* ─── PaginationBar ─────────────────────────────────────────────────────── */
function PaginationBar({ total, current, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const maxV = 5;
  let s = Math.max(1, current - Math.floor(maxV / 2));
  let e = Math.min(totalPages, s + maxV - 1);
  if (e - s + 1 < maxV) s = Math.max(1, e - maxV + 1);

  const items = [];
  const Btn = ({ label, page, disabled, active }) => (
    <button
      style={{ ...S.pageBtn(active, disabled) }}
      onClick={() => !disabled && onChange(page)}
      disabled={disabled}
    >
      {label}
    </button>
  );

  items.push(
    <Btn key="prev" label="‹" page={current - 1} disabled={current === 1} />,
  );
  if (s > 1) {
    items.push(<Btn key={1} label={1} page={1} />);
    if (s > 2)
      items.push(
        <span key="d1" style={{ ...S.pageBtn(false, true), padding: "0 8px" }}>
          …
        </span>,
      );
  }
  for (let i = s; i <= e; i++)
    items.push(<Btn key={i} label={i} page={i} active={i === current} />);
  if (e < totalPages) {
    if (e < totalPages - 1)
      items.push(
        <span
          key="d2"
          style={{
            ...S.pageBtn(false, true),
            minWidth: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          …
        </span>,
      );
    items.push(<Btn key={totalPages} label={totalPages} page={totalPages} />);
  }
  items.push(
    <Btn
      key="next"
      label="›"
      page={current + 1}
      disabled={current === totalPages}
    />,
  );

  return (
    <div>
      <div style={S.paginationWrap}>{items}</div>
      <div style={S.pageInfo}>
        Hiển thị {total === 0 ? 0 : (current - 1) * perPage + 1}–
        {Math.min(current * perPage, total)} / {total} bản ghi
      </div>
    </div>
  );
}

/* ─── EmptyState ────────────────────────────────────────────────────────── */
function EmptyState({ icon, text, hint }) {
  return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>{icon}</div>
      <div style={S.emptyText}>{text}</div>
      {hint && <div style={S.emptyHint}>{hint}</div>}
    </div>
  );
}

/* ─── EmailModal ────────────────────────────────────────────────────────── */
function EmailModal({ contact, onClose }) {
  const [to, setTo] = useState(contact?.email || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const canSend = to.trim() && subject.trim() && body.trim() && !sending;

  const handleSend = () => {
    if (!canSend) return;
    setSending(true);
    setSuccess("");
    setError("");
    console.log("Gửi email:", { to, subject, body });
    axios
      .post("http://localhost:3056/api/v1/emailmaketing/send", {
        to: to.trim(),
        subject: subject.trim(),
        html: body.trim(),
      })
      .then(() => {
        setSuccess("✅ Email đã được gửi thành công!");
        setSending(false);
        setTimeout(() => onClose(), 1500);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Gửi email thất bại. Vui lòng thử lại.",
        );
        setSending(false);
      });
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div
        style={{ ...S.modalBox, maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            ...S.modalHeader,
            background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
            borderBottom: "none",
          }}
        >
          <span
            style={{
              ...S.modalTitle,
              color: C.white,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ✉️ Soạn & Gửi Email
          </span>
          <button
            style={{
              background: "rgba(255,255,255,.15)",
              border: "none",
              color: C.white,
              borderRadius: C.radiusSm,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div style={S.modalBody}>
          {/* Thông tin khách hàng */}
          <div
            style={{
              ...S.infoBox,
              borderLeft: `3px solid #7C3AED`,
              background: "#F5F3FF",
              border: `1px solid #DDD6FE`,
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#7C3AED",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: ".6px",
              }}
            >
              📋 Thông tin khách hàng
            </div>
            <div style={S.infoRow}>
              <strong>Tên:</strong> {contact?.name || "—"}
            </div>
            <div style={S.infoRow}>
              <strong>Email:</strong> {contact?.email || "—"}
            </div>
            {contact?.phone && (
              <div style={S.infoRow}>
                <strong>SĐT:</strong> {contact.phone}
              </div>
            )}
          </div>

          {/* Trường To */}
          <div style={S.emailFieldWrap}>
            <label style={S.label}>
              Đến (To) <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              style={S.emailInput}
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@example.com"
              onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
              onBlur={(e) => (e.target.style.borderColor = C.gray200)}
            />
          </div>

          {/* Tiêu đề */}
          <div style={S.emailFieldWrap}>
            <label style={S.label}>
              Tiêu đề (Subject) <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              style={S.emailInput}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề email..."
              onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
              onBlur={(e) => (e.target.style.borderColor = C.gray200)}
            />
          </div>

          <div style={S.emailFieldWrap}>
            <label
              style={{
                ...S.label,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                Nội dung <span style={{ color: C.danger }}>*</span>
              </span>
              <span
                style={{ fontSize: "12px", color: C.gray400, fontWeight: 400 }}
              >
                {body.length} ký tự
              </span>
            </label>

            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              style={{ background: "#fff", borderRadius: 8 }}
              placeholder={`Kính gửi ${contact?.name || "Quý khách"},\n\nNội dung email...\n\nTrân trọng,`}
            />
          </div>

          {success && <div style={S.alertSuccess}>{success}</div>}
          {error && <div style={S.alertDanger}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={S.modalFooter}>
          <button style={S.btnSecondary} onClick={onClose} disabled={sending}>
            Hủy
          </button>
          <button
            style={{ ...S.btnPurple, ...(!canSend ? S.btnDisabled : {}) }}
            onClick={handleSend}
            disabled={!canSend}
          >
            {sending ? <Spinner animation="border" size="sm" /> : "✉️"}
            {sending ? "Đang gửi..." : "Gửi email"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
const ReportStudent = () => {
  const role = localStorage.getItem("role");

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [startDate, setStartDate] = useState(getOneWeekAgo());
  const [endDate, setEndDate] = useState(new Date());
  const [activeRange, setActiveRange] = useState("1 tuần qua");

  const [activeTab, setActiveTab] = useState("customer");

  // search customer
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // search product
  const [productInput, setProductInput] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [productQuery, setProductQuery] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [hasProductSearched, setHasProductSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // AsyncSelect controlled value

  // modal products
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);

  // modal assign
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignContact, setAssignContact] = useState(null);
  const [saleUsers, setSaleUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");
  const [assignError, setAssignError] = useState("");

  // modal email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContact, setEmailContact] = useState(null);

  const [hoveredRow, setHoveredRow] = useState(null);

  const searchRef = useRef(null);
  const searchResultRef = useRef(null);
  const productResultRef = useRef(null);

  const getUserId = () => localStorage.getItem("userId");
  const canAssign = CAN_ASSIGN_ROLES.includes(role);

  /* ── API ── */
  const fetchByDate = (start, end) => {
    const userId = getUserId();
    if (!userId) return;
    setLoading(true);
    const params = new URLSearchParams({
      user_id: userId,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    });
    axios
      .get(`${BASE_URL}/contactsstudents?${params}`)
      .then((res) => {
        setContacts(res.data.contacts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchBySearch = (keyword) => {
    const userId = getUserId();
    if (!userId || !keyword.trim()) return;
    setSearchLoading(true);
    setHasSearched(true);
    const params = new URLSearchParams({
      user_id: userId,
      start_date: SEARCH_START_DATE.toISOString(),
      end_date: new Date().toISOString(),
      search: keyword.trim(),
    });
    axios
      .get(`${BASE_URL}/contactsstudentss?${params}`)
      .then((res) => {
        setSearchResults(res.data.contacts || []);
        setSearchCurrentPage(1);
        setSearchLoading(false);
        setTimeout(
          () =>
            searchResultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100,
        );
      })
      .catch((err) => {
        console.error(err);
        setSearchLoading(false);
      });
  };

  const fetchByProduct = (keyword) => {
    if (!keyword.trim()) return;
    setProductLoading(true);
    setHasProductSearched(true);
    const params = new URLSearchParams({
      search: keyword.trim(),
      start_date: SEARCH_START_DATE.toISOString(),
      end_date: new Date().toISOString(),
    });
    axios
      .get(`${BASE_URL}/searchbyproduct?${params}`)
      .then((res) => {
        setProductResults(res.data.contacts || []);
        setProductCurrentPage(1);
        setProductLoading(false);
        setTimeout(
          () =>
            productResultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100,
        );
      })
      .catch((err) => {
        console.error(err);
        setProductLoading(false);
      });
  };

  /* ── AsyncSelect: gợi ý sản phẩm từ API /products/categoryproducts ── */
  const loadProductOptions = async (inputValue) => {
    if (!inputValue?.trim()) return [];
    try {
      const res = await axios.get(`${API_PRODUCTS}/products/categoryproducts`, {
        params: { query: inputValue.trim() },
      });
      const now = new Date();
      return (res.data || [])
        .filter((p) => {
          const code = String(p.TaxCode ?? "").trim();
          return (
            code &&
            !["n/a", "null", "undefined", "nan", ""].includes(
              code.toLowerCase(),
            )
          );
        })
        .map((p) => {
          const activeVouchers = (p.vouchers || []).filter((v) => {
            const from = new Date(v.validityPeriodFrom);
            const to = new Date(v.validityPeriodTo);
            return v.status === "active" && now >= from && now <= to;
          });
          const price = p.price?.toLocaleString("vi-VN") || "0";
          return {
            label: `${p.name} (${p.TaxCode}) — ${price} VND`,
            value: p._id,
            productName: p.name,
            productData: { ...p, vouchers: activeVouchers },
          };
        });
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  /* Khi người dùng chọn 1 sản phẩm từ AsyncSelect → tự động tìm khách hàng đã mua */
  const handleProductSelect = (opt) => {
    setSelectedProduct(opt);
    if (!opt) {
      // người dùng xóa selection
      handleClearProduct();
      return;
    }
    const name = opt.productName || opt.label;
    setProductQuery(name);
    setProductInput(name);
    fetchByProduct(name);
  };

  const fetchSaleUsers = () => {
    setUsersLoading(true);
    axios
      .get(`${BASE_URL}/users/active`)
      .then((res) => {
        setSaleUsers(res.data.users || []);
        setUsersLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setUsersLoading(false);
      });
  };

  const patchAssignContact = (contactId, userId) =>
    axios.patch(`${BASE_URL}/assign/${contactId}`, { assignedTo: userId });

  useEffect(() => {
    fetchByDate(getOneWeekAgo(), new Date());
    if (canAssign) fetchSaleUsers();
  }, []);

  /* ── Handlers ── */
  const handleDateRange = (range) => {
    const today = new Date();
    setActiveRange(range);
    let newStart,
      newEnd = new Date();
    switch (range) {
      case "Hôm nay":
        newStart = new Date(new Date(today).setHours(0, 0, 0, 0));
        newEnd = new Date(new Date(today).setHours(23, 59, 59, 999));
        break;
      case "1 tuần qua":
        newStart = new Date(new Date().setDate(today.getDate() - 7));
        break;
      case "1 tháng qua":
        newStart = new Date(new Date().setMonth(today.getMonth() - 1));
        break;
      case "1 năm qua":
        newStart = new Date(new Date().setFullYear(today.getFullYear() - 1));
        break;
      default:
        newStart = new Date("2021-02-01T00:00:00.000Z");
        break;
    }
    setStartDate(newStart);
    setEndDate(newEnd);
    setCurrentPage(1);
    fetchByDate(newStart, newEnd);
  };

  const handleCustomDate = (type, date) => {
    const newStart = type === "start" ? date : startDate;
    const newEnd = type === "end" ? date : endDate;
    if (type === "start") setStartDate(date);
    else setEndDate(date);
    setActiveRange("");
    setCurrentPage(1);
    fetchByDate(newStart, newEnd);
  };

  const handleSearch = () => {
    const kw = searchInput.trim();
    if (!kw) return;
    setSearchQuery(kw);
    fetchBySearch(kw);
  };
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setSearchCurrentPage(1);
  };

  const handleProductSearch = () => {
    const kw = productInput.trim();
    if (!kw) return;
    setProductQuery(kw);
    fetchByProduct(kw);
  };
  const handleClearProduct = () => {
    setProductInput("");
    setProductQuery("");
    setProductResults([]);
    setHasProductSearched(false);
    setProductCurrentPage(1);
    setSelectedProduct(null);
  };

  const handleViewProducts = (pipelines = []) => {
    setModalData(
      pipelines.map((p) => ({
        products: p.products,
        totalAmount: p.totalAmount?.toLocaleString("vi-VN") || "0",
        status: p.status,
        paymentType: p.PaymentType,
      })),
    );
    setShowModal(true);
  };

  const handleOpenAssign = (contact) => {
    setAssignContact(contact);
    setSelectedUserId(contact.assignedTo?._id || "");
    setAssignSuccess("");
    setAssignError("");
    setShowAssignModal(true);
  };

  // mở modal email
  const handleOpenEmail = (contact) => {
    setEmailContact(contact);
    setShowEmailModal(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedUserId || !assignContact) return;
    setAssignLoading(true);
    setAssignSuccess("");
    setAssignError("");
    patchAssignContact(assignContact._id, selectedUserId)
      .then(() => {
        setAssignSuccess("✅ Chuyển khách hàng thành công!");
        setAssignLoading(false);
        const upd = (list) =>
          list.map((c) => {
            if (c._id !== assignContact._id) return c;
            const u = saleUsers.find((u) => u._id === selectedUserId);
            return {
              ...c,
              assignedTo: u
                ? { _id: u._id, firstname: u.firstname, lastname: u.lastname }
                : c.assignedTo,
            };
          });
        setContacts((prev) => upd(prev));
        setSearchResults((prev) => upd(prev));
        setProductResults((prev) => upd(prev));
        setTimeout(() => setShowAssignModal(false), 1200);
      })
      .catch((err) => {
        setAssignError(err.response?.data?.message || "Chuyển thất bại.");
        setAssignLoading(false);
      });
  };

  /* ── Table ── */
  // Thêm cột "Gửi Email" vào header
  const TableHead = () => (
    <thead>
      <tr>
        {[
          "#",
          "Mã Hồ Sơ",
          "Người Tạo",
          "Thông Tin KH",
          "Sản Phẩm",
          "Tổng Đơn",
          "Ngày Tạo",
          "Gửi Email",
          ...(canAssign ? ["Assign"] : []),
        ].map((h) => (
          <th key={h} style={S.th}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderRows = (list, page, perPage) => {
    if (list.length === 0)
      return (
        <tr>
          <td
            colSpan={canAssign ? 9 : 8}
            style={{ padding: "40px", textAlign: "center", color: C.gray400 }}
          >
            Không có dữ liệu
          </td>
        </tr>
      );
    return paginate(list, page, perPage).map((contact, index) => {
      const total =
        contact.pipelines?.reduce((sum, p) => sum + (p.amountTotal || 0), 0) ||
        0;
      const rowNum = (page - 1) * perPage + index + 1;
      const isHovered = hoveredRow === contact._id;
      return (
        <tr
          key={contact._id}
          style={{
            background: isHovered ? C.gray50 : C.white,
            transition: "background .12s",
          }}
          onMouseEnter={() => setHoveredRow(contact._id)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          <td
            style={{
              ...S.td,
              color: C.gray400,
              fontWeight: 500,
              width: "40px",
            }}
          >
            {rowNum}
          </td>
          <td style={{ ...S.td, fontWeight: 700, color: C.primary }}>
            {contact.profileCode || "—"}
          </td>
          <td style={S.td}>
            <span style={{ fontSize: "13px", color: C.gray700 }}>
              {contact.assignedTo
                ? `${contact.assignedTo.lastname || ""} ${contact.assignedTo.firstname || ""}`.trim()
                : "—"}
            </span>
          </td>
          <td style={S.td}>
            <div style={S.infoLine}>
              <span style={S.infoLabel}>Tên:</span>
              {contact.name || "—"}
            </div>
            <div style={S.infoLine}>
              <span style={S.infoLabel}>Email:</span>
              {contact.email || "—"}
            </div>
            <div style={S.infoLine}>
              <span style={S.infoLabel}>SĐT:</span>
              {contact.phone || "—"}
            </div>
            <div style={S.infoLine}>
              <span style={S.infoLabel}>Sinh nhật:</span>
              {contact.birthDate
                ? new Date(contact.birthDate).toLocaleDateString("vi-VN")
                : "—"}
            </div>
          </td>
          <td style={S.td}>
            <button
              style={S.btnDetail}
              onClick={() => handleViewProducts(contact.pipelines)}
            >
              📋 Xem chi tiết
            </button>
          </td>
          <td
            style={{
              ...S.td,
              fontWeight: 700,
              color: C.gray800,
              whiteSpace: "nowrap",
            }}
          >
            {total.toLocaleString("vi-VN")}{" "}
            <span style={{ color: C.gray400, fontWeight: 400 }}>₫</span>
          </td>
          <td style={{ ...S.td, color: C.gray600, whiteSpace: "nowrap" }}>
            {new Date(contact.createdAt).toLocaleDateString("vi-VN")}
          </td>

          {/* ── Cột nút Gửi Email ── */}
          <td style={S.td}>
            {contact.email ? (
              <button
                style={S.btnEmail}
                onClick={() => handleOpenEmail(contact)}
                title={`Gửi email tới ${contact.email}`}
              >
                ✉️ Gửi email
              </button>
            ) : (
              <span style={{ fontSize: "12px", color: C.gray400 }}>
                Không có email
              </span>
            )}
          </td>

          {canAssign && (
            <td style={S.td}>
              <button
                style={S.btnAssign}
                onClick={() => handleOpenAssign(contact)}
              >
                🔄 Assign
              </button>
            </td>
          )}
        </tr>
      );
    });
  };

  const ResultCard = ({
    title,
    color,
    headerBg,
    count,
    loading: isLoading,
    results,
    query,
    page,
    setPage,
    onClose,
    emptyIcon,
    emptyHint,
    refProp,
  }) => (
    <div ref={refProp} style={S.resultCard(color)}>
      <div style={S.resultHeader(headerBg)}>
        <div style={S.resultTitle}>
          {title}
          {!isLoading && (
            <span style={S.badge("rgba(255,255,255,.25)")}>
              {count} kết quả
            </span>
          )}
        </div>
        <button style={S.closeBtn} onClick={onClose}>
          ✕ Đóng
        </button>
      </div>
      <div style={{ padding: "20px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spinner animation="border" style={{ color }} />
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            text={`Không tìm thấy kết quả nào cho "${query}"`}
            hint={emptyHint}
          />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <TableHead />
                <tbody>
                  {renderRows(results, page, SEARCH_ITEMS_PER_PAGE)}
                </tbody>
              </table>
            </div>
            <PaginationBar
              total={results.length}
              current={page}
              perPage={SEARCH_ITEMS_PER_PAGE}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <div style={S.page}>
      {/* Tab bar */}
      <div style={S.tabBar}>
        <button
          style={S.tab(activeTab === "customer", C.primary)}
          onClick={() => setActiveTab("customer")}
        >
          🔍 Tìm theo khách hàng
        </button>
        <button
          style={S.tab(activeTab === "product", C.success)}
          onClick={() => setActiveTab("product")}
        >
          📦 Tìm theo sản phẩm
        </button>
      </div>

      {/* Search: Khách hàng */}
      {activeTab === "customer" && (
        <div style={S.searchWrap}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Tìm họ tên / email / SĐT..."
            value={searchInput}
            style={S.searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onFocus={(e) => (e.target.style.borderColor = C.primary)}
            onBlur={(e) => (e.target.style.borderColor = C.gray200)}
          />
          {hasSearched && (
            <button style={S.btnGhost} onClick={handleClearSearch}>
              ✕ Xóa
            </button>
          )}
          <button
            style={{
              ...S.btnPrimary,
              ...(!searchInput.trim() ? S.btnDisabled : {}),
            }}
            onClick={handleSearch}
            disabled={!searchInput.trim()}
          >
            🔍 Tìm
          </button>
        </div>
      )}

      {/* Search: Sản phẩm — dùng AsyncSelect gợi ý từ /products/categoryproducts */}
      {activeTab === "product" && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* AsyncSelect chiếm phần lớn chiều rộng */}
            <div style={{ flex: 1, maxWidth: "500px" }}>
              <AsyncSelect
                cacheOptions
                loadOptions={loadProductOptions}
                onChange={handleProductSelect}
                value={selectedProduct}
                isClearable
                placeholder="🔍 Gõ tên hoặc mã TaxCode để tìm sản phẩm..."
                noOptionsMessage={({ inputValue }) =>
                  inputValue.trim()
                    ? "Không tìm thấy sản phẩm"
                    : "Nhập tên sản phẩm để tìm kiếm"
                }
                loadingMessage={() => "Đang tìm kiếm..."}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "42px",
                    fontSize: "14px",
                    borderRadius: C.radiusSm,
                    border: `1.5px solid ${state.isFocused ? C.success : C.gray200}`,
                    boxShadow: state.isFocused
                      ? `0 0 0 3px ${C.success}22`
                      : "none",
                    transition: "border-color .18s, box-shadow .18s",
                    "&:hover": { borderColor: C.success },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: C.gray400,
                    fontSize: "14px",
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: C.radius,
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                    border: `1px solid ${C.gray200}`,
                    zIndex: 9999,
                  }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: "13px",
                    background: state.isSelected
                      ? C.success
                      : state.isFocused
                        ? C.successSoft
                        : "#fff",
                    color: state.isSelected ? "#fff" : C.gray800,
                    cursor: "pointer",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "14px",
                    color: C.gray800,
                  }),
                }}
              />
            </div>

            {/* Nút xóa khi đã có kết quả */}
            {hasProductSearched && (
              <button style={S.btnGhost} onClick={handleClearProduct}>
                ✕ Xóa
              </button>
            )}
          </div>

          {/* Hint khi chưa chọn sản phẩm */}
          {!selectedProduct && (
            <div
              style={{
                fontSize: "12px",
                color: C.gray400,
                marginTop: "6px",
                paddingLeft: "2px",
              }}
            >
              💡 Gợi ý sẽ xuất hiện khi bạn gõ ít nhất 1 ký tự. Chọn sản phẩm để
              tìm khách hàng đã mua.
            </div>
          )}

          {/* Badge sản phẩm đang được tìm */}
          {selectedProduct && productQuery && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <span style={{ fontSize: "12px", color: C.gray600 }}>
                Đang xem khách hàng mua:
              </span>
              <span
                style={{
                  background: C.successSoft,
                  color: C.success,
                  border: `1px solid ${C.success}30`,
                  borderRadius: "20px",
                  padding: "3px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                📦 {selectedProduct.productName || productQuery}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Kết quả tìm khách hàng */}
      {hasSearched && activeTab === "customer" && (
        <ResultCard
          refProp={searchResultRef}
          title={`🔍 Kết quả: "${searchQuery}"`}
          color={C.primary}
          headerBg={C.primary}
          count={searchResults.length}
          loading={searchLoading}
          results={searchResults}
          query={searchQuery}
          page={searchCurrentPage}
          setPage={setSearchCurrentPage}
          onClose={handleClearSearch}
          emptyIcon="🔍"
          emptyHint="Thử tìm với họ tên, email hoặc số điện thoại"
        />
      )}

      {/* Kết quả tìm sản phẩm */}
      {hasProductSearched && activeTab === "product" && (
        <ResultCard
          refProp={productResultRef}
          title={`📦 Khách hàng mua: "${productQuery}"`}
          color={C.success}
          headerBg={C.success}
          count={productResults.length}
          loading={productLoading}
          results={productResults}
          query={productQuery}
          page={productCurrentPage}
          setPage={setProductCurrentPage}
          onClose={handleClearProduct}
          emptyIcon="📦"
          emptyHint="Kiểm tra lại tên sản phẩm"
        />
      )}

      {/* Bộ lọc ngày */}
      {!hasSearched && !hasProductSearched && (
        <div style={S.filterBox}>
          <div style={S.filterTitle}>📅 Lọc theo ngày</div>
          <div style={S.filterRow}>
            {QUICK_RANGES.map((r) => (
              <button
                key={r}
                style={S.quickBtn(activeRange === r)}
                onClick={() => handleDateRange(r)}
              >
                {r}
              </button>
            ))}
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                marginLeft: "4px",
              }}
            >
              <span style={{ fontSize: "13px", color: C.gray600 }}>Từ</span>
              <DatePicker
                selected={startDate}
                onChange={(date) => handleCustomDate("start", date)}
                placeholderText="Ngày bắt đầu"
                dateFormat="dd/MM/yyyy"
                className="form-control"
                customInput={<input style={S.dateInput} />}
                minDate={new Date("2021-02-01")}
                maxDate={endDate}
              />
              <span style={{ fontSize: "13px", color: C.gray600 }}>đến</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => handleCustomDate("end", date)}
                placeholderText="Ngày kết thúc"
                dateFormat="dd/MM/yyyy"
                className="form-control"
                customInput={<input style={S.dateInput} />}
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Danh sách chính */}
      {!hasSearched && !hasProductSearched && (
        <div style={S.mainCard}>
          <div style={S.mainCardHeader}>
            <span style={S.mainCardTitle}>Danh sách khách hàng</span>
            {!loading && (
              <span
                style={{ ...S.badge(C.gray100, C.gray600), marginLeft: "6px" }}
              >
                {contacts.length} bản ghi
              </span>
            )}
          </div>
          <div style={{ padding: "16px 20px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spinner animation="border" style={{ color: C.primary }} />
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={S.table}>
                    <TableHead />
                    <tbody>
                      {renderRows(contacts, currentPage, ITEMS_PER_PAGE)}
                    </tbody>
                  </table>
                </div>
                <PaginationBar
                  total={contacts.length}
                  current={currentPage}
                  perPage={ITEMS_PER_PAGE}
                  onChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal chi tiết sản phẩm */}
      {showModal && (
        <div style={S.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            style={{ ...S.modalBox, maxWidth: "760px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>📋 Chi Tiết Sản Phẩm</span>
              <button style={S.modalClose} onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div style={S.modalBody}>
              {modalData.length === 0 ? (
                <EmptyState icon="📭" text="Không có dữ liệu sản phẩm" />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {[
                          "Sản Phẩm",
                          "Giá",
                          "Trạng Thái",
                          "Thanh Toán",
                          "Tổng Tiền",
                        ].map((h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((pipeline, i) => (
                        <tr key={i}>
                          <td style={S.td}>
                            {pipeline.products?.map((p, j) => (
                              <div key={j} style={{ fontWeight: 500 }}>
                                {p.name}
                              </div>
                            ))}
                          </td>
                          <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                            {pipeline.products?.map((p, j) => (
                              <div
                                key={j}
                                style={{ color: C.primary, fontWeight: 600 }}
                              >
                                {p.price?.toLocaleString("vi-VN")} ₫
                              </div>
                            ))}
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                                background:
                                  pipeline.status === "Completed"
                                    ? C.successSoft
                                    : pipeline.status === "Cancelled"
                                      ? "#FEF2F2"
                                      : C.warningSoft,
                                color:
                                  pipeline.status === "Completed"
                                    ? C.success
                                    : pipeline.status === "Cancelled"
                                      ? C.danger
                                      : C.warning,
                              }}
                            >
                              {statusMapping[pipeline.status] ||
                                pipeline.status}
                            </span>
                          </td>
                          <td style={S.td}>{pipeline.paymentType}</td>
                          <td
                            style={{
                              ...S.td,
                              fontWeight: 700,
                              color: C.gray800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pipeline.totalAmount?.toLocaleString("vi-VN") || pipeline.amountTotal?.toLocaleString("vi-VN") || pipeline.totalAmount} ₫
                          </td>
                          <td style={{ ...S.td, whiteSpace: "nowrap", color: C.gray600 }}>
                            {pipeline.createdAt ? new Date(pipeline.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={S.modalFooter}>
              <button
                style={S.btnSecondary}
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assign */}
      {showAssignModal && (
        <div style={S.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div
            style={{ ...S.modalBox, maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={S.modalHeader}>
              <span style={S.modalTitle}>🔄 Chuyển Khách Hàng</span>
              <button
                style={S.modalClose}
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div style={S.modalBody}>
              {assignContact && (
                <div style={S.infoBox}>
                  <div style={S.infoRow}>
                    <strong>Khách hàng:</strong> {assignContact.name || "—"}
                  </div>
                  <div style={S.infoRow}>
                    <strong>Email:</strong> {assignContact.email || "—"}
                  </div>
                  <div style={S.infoRow}>
                    <strong>SĐT:</strong> {assignContact.phone || "—"}
                  </div>
                  <div style={S.infoRow}>
                    <strong>Phụ trách:</strong>{" "}
                    {assignContact.assignedTo
                      ? `${assignContact.assignedTo.lastname || ""} ${assignContact.assignedTo.firstname || ""}`.trim()
                      : "—"}
                  </div>
                </div>
              )}
              <label style={S.label}>Chuyển sang Sale:</label>
              {usersLoading ? (
                <div style={{ textAlign: "center", padding: "16px" }}>
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <select
                  style={S.select}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- Chọn nhân viên sale --</option>
                  {saleUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.lastname} {u.firstname} — {u.email}
                      {u.role?.name ? ` (${u.role.name})` : ""}
                    </option>
                  ))}
                </select>
              )}
              {assignSuccess && (
                <div style={S.alertSuccess}>{assignSuccess}</div>
              )}
              {assignError && <div style={S.alertDanger}>{assignError}</div>}
            </div>
            <div style={S.modalFooter}>
              <button
                style={S.btnSecondary}
                onClick={() => setShowAssignModal(false)}
              >
                Hủy
              </button>
              <button
                style={{
                  ...S.btnWarning,
                  ...(!selectedUserId || assignLoading ? S.btnDisabled : {}),
                }}
                onClick={handleAssignSubmit}
                disabled={!selectedUserId || assignLoading}
              >
                {assignLoading && <Spinner animation="border" size="sm" />}
                Xác nhận chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Soạn Email */}
      {showEmailModal && (
        <EmailModal
          contact={emailContact}
          onClose={() => {
            setShowEmailModal(false);
            setEmailContact(null);
          }}
        />
      )}
    </div>
  );
};

export default ReportStudent;

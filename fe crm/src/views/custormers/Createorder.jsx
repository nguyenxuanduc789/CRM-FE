import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MdClose, MdEdit, MdDelete, MdCheck, MdRefresh } from 'react-icons/md';
import AsyncSelect from 'react-select/async';
import { GETCONTACT_URLS } from '../../config/api';

const API = 'https://www.system.crmkhitam.com/api/v1';

/* ─── helpers ─────────────────────────────────────────────────────── */
const fmtNum = (v) => new Intl.NumberFormat('vi-VN').format(v || 0);
const toVNTime = (d) =>
  new Date(d).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

const STAGES = [
  'Quan tâm/tiềm năng',
  'Đang tìm hiểu',
  'Gởi báo giá',
  'Đang cân nhắc',
  'Chốt Deal',
  'Hoàn tất thu tiền',
  'Deal chưa thành công'
];
const STAGE_CLS = {
  'Quan tâm/tiềm năng': 'pill-interest',
  'Đang tìm hiểu': 'pill-consider',
  'Gởi báo giá': 'pill-quote',
  'Đang cân nhắc': 'pill-consider',
  'Chốt Deal': 'pill-closed',
  'Hoàn tất thu tiền': 'pill-done',
  'Deal chưa thành công': 'pill-failed'
};
const STATUS_MAP = {
  orders: 'Pending',
  paid: 'Completed',
  canceled: 'Cancelled',
  installment: 'Installment'
};
const TABS = [
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'canceled', label: 'Đơn hủy' },
  { key: 'installment', label: 'Trả góp' }
];

/* ─── toast hook ──────────────────────────────────────────────────── */
let _tid = 0;
function useToast() {
  const [list, setList] = useState([]);
  const push = useCallback((msg, type = 'info', ms = 3500) => {
    const id = ++_tid;
    setList((p) => [...p, { id, msg, type }]);
    setTimeout(() => setList((p) => p.filter((t) => t.id !== id)), ms);
  }, []);
  const Toast = () => (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none'
      }}
    >
      {list.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            background: '#fff',
            pointerEvents: 'all',
            maxWidth: 360,
            borderLeft: `4px solid ${t.type === 'success' ? '#057A55' : t.type === 'error' ? '#C81E1E' : '#1A56DB'}`,
            animation: '_slideIn .2s ease'
          }}
        >
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'} {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, Toast };
}

/* ─── sub-components ──────────────────────────────────────────────── */
const Counter = ({ value, onChange, min = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
    <button
      type="button"
      onClick={() => value > min && onChange(value - 1)}
      disabled={value <= min}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid #D1D5DB',
        background: '#fff',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      −
    </button>
    <input
      type="number"
      value={value}
      min={min}
      onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || min))}
      style={{
        width: 48,
        height: 28,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        border: '1px solid #D1D5DB',
        borderRadius: 6,
        background: '#fff',
        MozAppearance: 'textfield'
      }}
    />
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid #D1D5DB',
        background: '#fff',
        fontSize: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      +
    </button>
  </div>
);

const StagePill = ({ stage }) => {
  const map = {
    'Quan tâm/tiềm năng': { bg: '#EBF2FF', c: '#1E429F' },
    'Đang tìm hiểu': { bg: '#EDEBFE', c: '#5521B5' },
    'Gởi báo giá': { bg: '#FDF6B2', c: '#723B13' },
    'Đang cân nhắc': { bg: '#EDEBFE', c: '#5521B5' },
    'Chốt Deal': { bg: '#DEF7EC', c: '#03543F' },
    'Hoàn tất thu tiền': { bg: '#E1EFFE', c: '#1A56DB' },
    'Deal chưa thành công': { bg: '#FDE8E8', c: '#9B1C1C' }
  };
  const s = map[stage] || { bg: '#F3F4F6', c: '#6B7280' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.c
      }}
    >
      {stage}
    </span>
  );
};

const PartnerBadge = ({ yes }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: yes ? '#DEF7EC' : '#FDE8E8',
      color: yes ? '#03543F' : '#9B1C1C'
    }}
  >
    {yes ? '✔ Đối tác KD' : '✘ Không phải đối tác'}
  </span>
);

const StageSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    style={{
      fontSize: 12,
      padding: '5px 8px',
      borderRadius: 6,
      border: '1px solid #D1D5DB',
      cursor: 'pointer',
      background: '#fff',
      color: '#374151',
      fontFamily: 'inherit'
    }}
  >
    {STAGES.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
);

/* ─── CSS injection ───────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
@keyframes _slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes _spin{to{transform:rotate(360deg)}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Be Vietnam Pro','Segoe UI',sans-serif}
.co-wrap{font-family:'Be Vietnam Pro','Segoe UI',sans-serif;color:#1F2937;background:#F9FAFB;min-height:100vh}
.co-header{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.5rem;background:#fff;border-bottom:1px solid #E5E7EB;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.co-header h1{font-size:17px;font-weight:700;color:#111827;letter-spacing:-.3px}
.co-header p{font-size:12px;color:#6B7280;margin-top:1px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;font-family:inherit}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-primary{background:#1A56DB;color:#fff}
.btn-primary:hover:not(:disabled){background:#1347C0;transform:translateY(-1px);box-shadow:0 4px 12px rgba(26,86,219,.3)}
.btn-secondary{background:#fff;color:#374151;border:1px solid #D1D5DB}
.btn-secondary:hover{background:#F9FAFB}
.btn-danger{background:#FDF2F2;color:#C81E1E;font-size:12px;padding:4px 10px;border-radius:6px}
.btn-danger:hover{background:#FDE8E8}
.btn-icon{padding:5px;border-radius:6px;background:transparent;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s}
.btn-icon:hover{background:#F3F4F6;border-color:#E5E7EB}
.spinner{width:13px;height:13px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:_spin .55s linear infinite;display:inline-block}
.spinner-dark{border-color:rgba(0,0,0,.12);border-top-color:#1A56DB}
/* list */
.co-list{padding:1.5rem;max-width:1440px;margin:0 auto}
.co-card{background:#fff;border-radius:14px;border:1px solid #E5E7EB;box-shadow:0 1px 3px rgba(0,0,0,.06);overflow:hidden}
.co-tabs{display:flex;gap:4px;border-bottom:2px solid #E5E7EB;padding:0 1.5rem;background:#F9FAFB}
.co-tab{padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#9CA3AF;border-bottom:2px solid transparent;margin-bottom:-2px;font-family:inherit;transition:all .15s}
.co-tab.active{color:#1A56DB;border-bottom-color:#1A56DB}
.co-tab:hover:not(.active){color:#4B5563}
.tab-cnt{display:inline-flex;align-items:center;justify-content:center;background:#E5E7EB;color:#6B7280;font-size:10px;font-weight:700;border-radius:20px;padding:1px 6px;margin-left:5px}
.co-tab.active .tab-cnt{background:#EBF2FF;color:#1A56DB}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl thead tr{background:#F9FAFB}
.tbl th{padding:10px 12px;text-align:left;font-size:10.5px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;border-bottom:1px solid #E5E7EB}
.tbl td{padding:10px 12px;border-bottom:1px solid #F3F4F6;color:#374151;vertical-align:middle}
.tbl tbody tr:hover td{background:#EBF2FF}
/* form */
.co-form{max-width:1200px;margin:0 auto;padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
.sec{background:#fff;border-radius:14px;border:1px solid #E5E7EB;box-shadow:0 1px 3px rgba(0,0,0,.06);overflow:hidden}
.sec-head{display:flex;align-items:center;gap:12px;padding:.9rem 1.5rem;background:#F9FAFB;border-bottom:1px solid #E5E7EB}
.sec-num{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
.sec-head h2{font-size:14px;font-weight:700;color:#1F2937;letter-spacing:-.2px}
.sec-head span{font-size:12px;color:#9CA3AF;margin-left:auto}
.sec-body{padding:1.5rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
@media(max-width:768px){.g2,.g3,.g4{grid-template-columns:1fr}}
.field{display:flex;flex-direction:column;gap:5px}
.field label{font-size:11.5px;font-weight:600;color:#4B5563;letter-spacing:.2px;text-transform:uppercase}
.field label .req{color:#E02424;margin-left:2px}
.field input,.field select,.field textarea{font-family:inherit;font-size:13px;color:#1F2937;background:#fff;border:1px solid #D1D5DB;border-radius:10px;padding:9px 12px;transition:border-color .15s,box-shadow .15s;outline:none;width:100%}
.field input:hover,.field select:hover,.field textarea:hover{border-color:#9CA3AF}
.field input:focus,.field select:focus,.field textarea:focus{border-color:#1A56DB;box-shadow:0 0 0 3px rgba(26,86,219,.1)}
.field input:disabled,.field select:disabled{background:#F9FAFB;color:#6B7280;cursor:not-allowed}
.field textarea{resize:vertical;min-height:80px;line-height:1.6}
.field select{cursor:pointer}
/* react-select */
.rs__control{border:1px solid #D1D5DB!important;border-radius:10px!important;box-shadow:none!important;font-size:13px;min-height:40px}
.rs__control:hover{border-color:#9CA3AF!important}
.rs__control--is-focused{border-color:#1A56DB!important;box-shadow:0 0 0 3px rgba(26,86,219,.1)!important}
.rs__placeholder{color:#9CA3AF}
.rs__menu{border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.1);border:1px solid #E5E7EB}
.rs__option--is-focused{background:#EBF2FF!important;color:#1F2937}
.rs__option--is-selected{background:#1A56DB!important}
/* customer info */
.cust-box{background:linear-gradient(135deg,#EBF2FF 0%,#fff 100%);border:1px solid #BFCFEC;border-radius:14px;padding:1rem 1.25rem;display:flex;flex-direction:column;gap:8px}
.cust-row{display:flex;align-items:center;gap:10px}
.cust-lbl{font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:.3px;min-width:100px}
.cust-val{font-size:13px;font-weight:600;color:#1F2937}
.avatar{width:42px;height:42px;border-radius:50%;background:#1A56DB;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0}
/* partner checkbox */
.partner-cb{display:flex;align-items:center;gap:12px;padding:11px 16px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;cursor:pointer;transition:all .15s;margin-top:.75rem}
.partner-cb:hover{border-color:#1A56DB;background:#EBF2FF}
.partner-cb input[type=checkbox]{width:16px;height:16px;accent-color:#1A56DB;cursor:pointer}
/* product table */
.ptbl-wrap{overflow-x:auto}
.ptbl{width:100%;border-collapse:collapse;font-size:12.5px}
.ptbl thead tr{background:#F9FAFB;border-bottom:2px solid #E5E7EB}
.ptbl th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap}
.ptbl td{padding:10px 12px;border-bottom:1px solid #F3F4F6;vertical-align:middle;color:#374151}
.ptbl tbody tr:hover td{background:#F9FAFB}
.ptbl tbody tr:last-child td{border-bottom:none}
.tbl-input{padding:6px 8px;font-size:12px;border:1px solid #D1D5DB;border-radius:6px;font-family:inherit;color:#1F2937;background:#fff;width:100%;outline:none;transition:border-color .15s}
.tbl-input:focus{border-color:#1A56DB;box-shadow:0 0 0 2px rgba(26,86,219,.08)}
/* voucher */
.v-pill{background:#ECFDF5;color:#057A55;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;white-space:nowrap}
.no-v{font-size:11px;color:#9CA3AF;font-style:italic}
/* payment tabs */
.pay-tabs{display:flex;gap:8px;padding:4px;background:#F3F4F6;border-radius:10px;margin-bottom:1.25rem;width:fit-content}
.ptab{padding:7px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6B7280;font-family:inherit;transition:all .15s}
.ptab.active{background:#fff;color:#1A56DB;box-shadow:0 1px 3px rgba(0,0,0,.07)}
/* summary */
.sum-box{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden}
.sum-row{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px}
.sum-row:last-child{border-bottom:none}
.sum-lbl{color:#6B7280;font-weight:500}
.sum-val{font-weight:700;color:#1F2937}
.sum-total{background:linear-gradient(135deg,#1A56DB 0%,#3B82F6 100%);padding:14px 16px}
.sum-total .sum-lbl{color:rgba(255,255,255,.8);font-size:13px;font-weight:600}
.sum-total .sum-val{color:#fff;font-size:20px;font-weight:700;letter-spacing:-.4px}
/* installment */
.inst-box{background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:1rem 1.25rem;margin-top:1rem}
.inst-title{font-size:12px;font-weight:700;color:#B45309;margin-bottom:.75rem}
.inst-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px dashed #FDE68A}
.inst-row:last-child{border-bottom:none}
/* img */
.img-btn{display:inline-block;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:none;margin-right:3px;margin-bottom:3px;font-family:inherit}
.img-view{background:#ECFDF5;color:#057A55}
.img-up{background:#FFFBEB;color:#B45309}
/* notes */
.note-item{padding:8px 10px;border-bottom:1px solid #F3F4F6;font-size:12px;border-radius:6px;transition:background .12s}
.note-item:last-child{border-bottom:none}
.note-item:hover{background:#F9FAFB}
.note-content{color:#374151;line-height:1.5}
.note-meta{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap}
.note-time{color:#9CA3AF;font-size:11px}
.note-author{color:#1A56DB;font-size:11px;font-weight:600}
.note-actions{margin-left:auto;display:flex;gap:3px}
.note-edit-row{display:flex;gap:6px;margin-top:6px}
.note-edit-row textarea{flex:1;font-family:inherit;font-size:12px;border:1px solid #1A56DB;border-radius:6px;padding:6px 8px;outline:none;resize:none;line-height:1.5}
/* modal */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(2px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-box{background:#fff;border-radius:20px;width:100%;max-width:560px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.15);overflow:hidden}
.modal-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid #E5E7EB}
.modal-head h3{font-size:15px;font-weight:700;color:#111827}
.modal-body{flex:1;overflow-y:auto;padding:1.25rem}
.modal-foot{padding:1rem 1.25rem;border-top:1px solid #E5E7EB;display:flex;justify-content:flex-end;gap:8px}
/* empty */
.empty{text-align:center;padding:3rem 1rem;color:#9CA3AF}
.empty .ei{font-size:40px;margin-bottom:.75rem;opacity:.4}
.empty p{font-size:14px;font-weight:500}
.empty small{font-size:12px}
/* price */
.price{font-weight:700;color:#1A56DB;font-size:13px}
/* scrollbar */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:10px}
`;

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const CreateOrder = () => {
  const { push: toast, Toast } = useToast();
  const abortRef = useRef(null);

  /* ── view ─────────────────────────────────────────────────── */
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  /* ── customer ─────────────────────────────────────────────── */
  const [selContact, setSelContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', stage: '' });
  const [notes, setNotes] = useState('');
  const [isPartner, setIsPartner] = useState(false);

  /* ── products ─────────────────────────────────────────────── */
  const [products, setProducts] = useState([]);
  const [searchQ, setSearchQ] = useState('');

  /* ── pricing ──────────────────────────────────────────────── */
  const [surcharge, setSurcharge] = useState(0);
  const [voucherType, setVoucherType] = useState('');
  const [voucherInt, setVoucherInt] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [totalBefore, setTotalBefore] = useState(0);

  /* ── payment ──────────────────────────────────────────────── */
  const [payType, setPayType] = useState('Full');
  const [firstPay, setFirstPay] = useState(0);
  const [installMode, setInstallMode] = useState('auto'); // 'auto' | 'manual'
  const [autoMonths, setAutoMonths] = useState(1);
  const [autoStartDate, setAutoStartDate] = useState('');
  // Mỗi item: { amountDue: number, dueDate: string }
  const [installmentPlans, setInstallmentPlans] = useState([]);

  /* ── orders list ──────────────────────────────────────────── */
  const [orderList, setOrderList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  /* ── ui ───────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  /* ── note modal ───────────────────────────────────────────── */
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selOrder, setSelOrder] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  /* ── recalc totalBefore ───────────────────────────────────── */
  useEffect(() => {
    setTotalBefore(products.reduce((s, p) => s + p.total, 0));
  }, [products]);

  /* ── mount / unmount ──────────────────────────────────────── */
  useEffect(() => {
    abortRef.current = new AbortController();
    fetchOrders();
    return () => abortRef.current?.abort();
  }, []); // eslint-disable-line

  /* ═══ pricing helpers ═════════════════════════════════════ */
  const getProductTotal = useCallback((p) => {
    const v = p.latestVoucher;
    let t = p.price * p.quantity;
    if (v?.voucherType === 'Amount' && v.voucherValue > 0) t -= v.voucherValue;
    else if (v?.voucherType === '%' && v.voucherValue > 0) t *= 1 - v.voucherValue / 100;
    return Math.max(t, 0);
  }, []);

  const calcTotal = useCallback(() => {
    let t = products.reduce((s, p) => s + getProductTotal(p), 0);
    if (voucherType === 'Percent') t *= 1 - voucherInt / 100;
    else if (voucherType === 'Amount') t -= voucherInt;
    return Math.max(t + Number(surcharge), 0);
  }, [products, voucherType, voucherInt, surcharge, getProductTotal]);

  const generateQRUrl = useCallback(() => {
    const bankId = 'vietcombank';
    const accountNo = '1037757201';
    const template = 'compact2';
    const amount = calcTotal();
    const codes = products.map((p) => p.TaxCode).join(',');
    const description = `${formData.name} ${codes}`;
    const accountName = 'CTCP KHI TAM CONG NGHE SUC KHOE VN';
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
  }, [calcTotal, products, formData.name]);

  const downloadQR = useCallback(async () => {
    try {
      const response = await fetch(generateQRUrl());
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_ThanhToan_${formData.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(generateQRUrl(), '_blank');
    }
  }, [generateQRUrl, formData.name]);

  // Số tiền còn lại sau khi trừ tiền trả trước
  const remainAfterFirst = useCallback(() => Math.max(calcTotal() - firstPay, 0), [calcTotal, firstPay]);

  // Tổng tiền đã nhập trong các kỳ góp (manual)
  const totalInstallmentEntered = useCallback(
    () => installmentPlans.reduce((s, p) => s + (Number(p.amountDue) || 0), 0),
    [installmentPlans]
  );

  // Tạo plans tự động chia đều theo tháng
  const buildAutoPlans = useCallback(() => {
    const remain = Math.max(calcTotal() - firstPay, 0);
    if (!autoMonths || autoMonths < 1 || !autoStartDate) return [];
    const each = Math.round(remain / autoMonths);
    return Array.from({ length: autoMonths }, (_, i) => {
      const d = new Date(autoStartDate);
      d.setMonth(d.getMonth() + i);
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const amt = i === autoMonths - 1 ? remain - each * (autoMonths - 1) : each;
      return { amountDue: amt, dueDate: `${yy}-${mm}-${dd}` };
    });
  }, [calcTotal, firstPay, autoMonths, autoStartDate]);

  // Helpers cập nhật từng kỳ
  const handleInstallmentChange = useCallback((idx, field, value) => {
    setInstallmentPlans((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], [field]: value };
      return u;
    });
  }, []);

  const addInstallmentRow = useCallback(() => {
    setInstallmentPlans((prev) => [...prev, { amountDue: '', dueDate: '' }]);
  }, []);

  const removeInstallmentRow = useCallback((idx) => {
    setInstallmentPlans((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  /* ═══ API: contacts ═══════════════════════════════════════ */
  const loadContacts = useCallback(async (input) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !input?.trim()) return [];
    try {
      const res = await axios.get(`${GETCONTACT_URLS}/${userId}`, {
        params: { query: input },
        signal: abortRef.current?.signal
      });
      return res.data.map((c) => ({
        label: `${c.name} (${c.email}) — ${c.phone}`,
        value: c._id,
        contactData: c
      }));
    } catch (e) {
      if (!axios.isCancel(e)) console.error(e);
      return [];
    }
  }, []);

  const handleContactChange = useCallback((opt) => {
    setSelContact(opt);
    if (opt?.contactData) {
      const { name, email, phone } = opt.contactData;
      setFormData((p) => ({ ...p, name, email, phone }));
    }
  }, []);

  /* ═══ API: products ═══════════════════════════════════════ */
  const searchProducts = useCallback(async (query) => {
    if (!query?.trim()) return [];
    try {
      const res = await axios.get(`${API}/products/categoryproducts`, {
        params: { query },
        signal: abortRef.current?.signal
      });
      const now = new Date();
      return res.data
        .map((p) => {
          const active = (p.vouchers || []).filter((v) => {
            const from = new Date(v.validityPeriodFrom);
            const to = new Date(v.validityPeriodTo);
            return v.status === 'active' && now >= from && now <= to;
          });
          const latest = active[active.length - 1];
          return {
            label: `${p.TaxCode} — ${p.name} (${fmtNum(p.price)} VND)`,
            value: p._id,
            productData: { ...p, vouchers: active, latestVoucher: latest }
          };
        });
    } catch (e) {
      if (!axios.isCancel(e)) console.error(e);
      return [];
    }
  }, []);

  const handleAddProduct = useCallback((opt) => {
    if (!opt?.productData) return;
    const p = opt.productData;
    setProducts((prev) => [
      ...prev,
      {
        id: p._id,
        name: p.name,
        TaxCode: p.TaxCode,
        category: p.category,
        price: p.price,
        quantity: 1,
        discountPercent: 0,
        vat: 0,
        total: p.price,
        vouchers: p.vouchers || [],
        latestVoucher: p.latestVoucher,
        K: 0
      }
    ]);
    setSearchQ('');
  }, []);

  const handleProductChange = useCallback((idx, field, value) => {
    setProducts((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], [field]: value };
      u[idx].total = u[idx].price * u[idx].quantity * (1 - u[idx].discountPercent / 100) * (1 + u[idx].vat / 100);
      return u;
    });
  }, []);

  const deleteProduct = useCallback((idx) => setProducts((prev) => prev.filter((_, i) => i !== idx)), []);

  /* ═══ API: fetch orders ═══════════════════════════════════ */
  const fetchOrders = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    setLoadingOrders(true);
    try {
      const res = await axios.get(`${API}/pineline/pipelines/${userId}`);
      setOrderList(res.data);
    } catch (e) {
      if (!axios.isCancel(e)) toast('Không thể tải danh sách đơn hàng.', 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, [toast]);

  /* ═══ API: edit click ═════════════════════════════════════ */
  const handleEditClick = useCallback((order) => {
    setIsEditing(true);
    setEditId(order._id);
    setShowForm(true);

    // Map order data to form
    const contactObj = order.user || order.contact;
    setSelContact({
      label: `${contactObj?.name || 'Unknown'} (${contactObj?.email || ''})`,
      value: contactObj?._id,
      contactData: contactObj
    });
    setFormData({
      name: contactObj?.name || '',
      email: contactObj?.email || '',
      phone: contactObj?.phone || '',
      stage: order.stage || ''
    });
    setNotes(order.notes || '');
    setIsPartner(order.isBusinessPartner || false);
    setSurcharge(order.surcharge || 0);
    setVoucherType(order.voucherType || '');
    setVoucherInt(order.voucherInt || 0);
    setDeposit(order.depositAmount || 0);
    setPayType(order.PaymentType || 'Full');
    setFirstPay(order.Firstpayment || 0);

    // Reconstruct products state
    if (order.products && Array.isArray(order.products)) {
      const counts = {};
      order.products.forEach((p) => {
        if (!p) return;
        const pid = p._id || p;
        if (!counts[pid]) {
          counts[pid] = {
            id: pid,
            name: p.name || 'Unknown Product',
            TaxCode: p.TaxCode || '',
            category: p.category || '',
            price: p.price || 0,
            quantity: 0,
            discountPercent: 0,
            vat: 0,
            total: 0,
            vouchers: p.vouchers || [],
            latestVoucher: p.latestVoucher || null,
            K: order.K?.find((k) => (k.product?._id || k.product)?.toString() === pid.toString())?.value || 0
          };
        }
        counts[pid].quantity += 1;
        counts[pid].total = counts[pid].price * counts[pid].quantity;
      });
      setProducts(Object.values(counts));
    }

    // Installments
    if (order.installments && order.installments.length > 0) {
      setInstallmentPlans(
        order.installments.map((i) => ({
          amountDue: i.amount,
          dueDate: i.expectedDate ? new Date(i.expectedDate).toISOString().split('T')[0] : ''
        }))
      );
      setInstallMode('manual');
    } else {
      setInstallmentPlans([]);
      setInstallMode('auto');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
    // Reset form
    setSelContact(null);
    setFormData({ name: '', email: '', phone: '', stage: '' });
    setNotes('');
    setProducts([]);
    setSurcharge(0);
    setVoucherType('');
    setVoucherInt(0);
    setDeposit(0);
    setPayType('Full');
    setFirstPay(0);
    setInstallMode('auto');
    setAutoMonths(1);
    setAutoStartDate('');
    setInstallmentPlans([]);
    setIsPartner(false);
  }, []);

  /* ═══ API: create order ═══════════════════════════════════ */
  const handleCreateOrder = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    const errs = [];
    if (!selContact) errs.push('Vui lòng chọn khách hàng.');
    if (!formData.name) errs.push('Họ & tên không được để trống.');
    if (!formData.email) errs.push('Email không được để trống.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.push('Email không hợp lệ.');
    if (!formData.stage) errs.push('Vui lòng chọn giai đoạn.');
    if (errs.length) {
      toast(errs.join(' | '), 'error', 5000);
      return;
    }

    const today = new Date();
    const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const expandedProducts = products.flatMap((p) => Array(p.quantity).fill(p.id));
    const kData = products.filter((p) => p.K && p.K !== 0).map((p) => ({ value: p.K, product: p.id }));

    // Validate & build paymentPlans
    let paymentPlans = [];
    if (payType === 'Install') {
      if (installMode === 'auto') {
        if (!autoStartDate) {
          toast('Vui lòng chọn ngày bắt đầu trả góp.', 'error');
          return;
        }
        if (!autoMonths || autoMonths < 1) {
          toast('Số tháng phải lớn hơn 0.', 'error');
          return;
        }
        paymentPlans = buildAutoPlans();
      } else {
        if (installmentPlans.length === 0) {
          toast('Vui lòng thêm ít nhất 1 kỳ trả góp.', 'error');
          return;
        }
        for (let i = 0; i < installmentPlans.length; i++) {
          const kp = installmentPlans[i];
          if (!kp.amountDue || Number(kp.amountDue) <= 0) {
            toast(`Kỳ ${i + 1}: Nhập số tiền hợp lệ.`, 'error');
            return;
          }
          if (!kp.dueDate) {
            toast(`Kỳ ${i + 1}: Chọn ngày thanh toán.`, 'error');
            return;
          }
        }
        paymentPlans = installmentPlans.map((p) => ({ amountDue: Number(p.amountDue), dueDate: p.dueDate }));
      }
    }

    setLoading(true);
    try {
      const url = isEditing ? `${API}/pineline/pipelines/${editId}` : `${API}/pineline/createpineline`;
      const method = isEditing ? 'put' : 'post';

      await axios[method](url, {
        user: selContact.value,
        stage: formData.stage,
        contact: selContact.value,
        amountTotal: calcTotal(),
        voucherType: voucherType || undefined,
        voucherInt: voucherInt || undefined,
        totalAmount: totalBefore || undefined,
        expectedCloseDate: currentDate,
        notes: notes.trim() || undefined,
        paymentPlans,
        products: expandedProducts,
        createdBy: userId,
        depositAmount: deposit,
        PaymentType: payType,
        Firstpayment: firstPay,
        surcharge: Number(surcharge),
        K: kData,
        isBusinessPartner: isPartner
      });
      toast(isEditing ? 'Cập nhật thành công!' : 'Đơn hàng tạo thành công!', 'success');
      // reset form
      setSelContact(null);
      setFormData({ name: '', email: '', phone: '', stage: '' });
      setNotes('');
      setProducts([]);
      setSurcharge(0);
      setVoucherType('');
      setVoucherInt(0);
      setDeposit(0);
      setPayType('Full');
      setFirstPay(0);
      setInstallMode('auto');
      setAutoMonths(1);
      setAutoStartDate('');
      setInstallmentPlans([]);
      setIsPartner(false);
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      await fetchOrders();
    } catch (e) {
      console.error(e);
      toast(e.response?.data?.message || (isEditing ? 'Cập nhật thất bại.' : 'Tạo đơn hàng thất bại.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [
    selContact,
    formData,
    products,
    notes,
    isPartner,
    surcharge,
    voucherType,
    voucherInt,
    deposit,
    totalBefore,
    payType,
    firstPay,
    installMode,
    autoMonths,
    autoStartDate,
    installmentPlans,
    calcTotal,
    buildAutoPlans,
    fetchOrders,
    toast,
    isEditing,
    editId
  ]);

  /* ═══ API: update stage ═══════════════════════════════════ */
  const handleStageChange = useCallback(
    async (pipelineId, newStage) => {
      if (!window.confirm('Chắc chắn muốn thay đổi giai đoạn?')) return;
      const userId = localStorage.getItem('userId');
      const current = orderList.find((o) => o._id === pipelineId);
      // optimistic
      setOrderList((prev) => prev.map((o) => (o._id === pipelineId ? { ...o, stage: newStage } : o)));
      try {
        const res = await fetch(`${API}/pineline/${pipelineId}/update-stage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: newStage, createdBy: userId })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        await axios
          .post(`${API}/pineline/add-note`, {
            orderCode: current?.orderCode,
            content: `[Chuyển giai đoạn] ${current?.stage} → ${newStage} (${now})`,
            userId
          })
          .catch((e) => console.warn(e));
        toast('Cập nhật giai đoạn thành công.', 'success');
      } catch (e) {
        toast('Cập nhật giai đoạn thất bại.', 'error');
        setOrderList((prev) => prev.map((o) => (o._id === pipelineId ? { ...o, stage: current?.stage } : o)));
      }
    },
    [orderList, toast]
  );

  /* ═══ API: delete order ═══════════════════════════════════ */
  const handleDeleteOrder = useCallback(
    async (orderId) => {
      if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
      const userId = localStorage.getItem('userId');
      setOrderList((prev) => prev.filter((o) => o._id !== orderId));
      try {
        const res = await fetch(`${API}/pineline/pineline/${orderId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `HTTP ${res.status}`);
        }
        toast('Đã xóa đơn hàng.', 'success');
      } catch (e) {
        toast(`Không thể xóa: ${e.message}`, 'error');
        await fetchOrders();
      }
    },
    [fetchOrders, toast]
  );

  /* ═══ API: upload image ═══════════════════════════════════ */
  const handleImageUpload = useCallback(
    async (orderId, file) => {
      if (!file) return;

      // Tìm thông tin đơn hàng hiện tại để kiểm tra logic upload lần 2
      const currentOrder = orderList.find((o) => o._id === orderId);
      const isInstallment = currentOrder?.PaymentType === 'Install' || currentOrder?.status === 'Installment';
      const hasImageBefore = currentOrder?.images && currentOrder.images.length > 0;

      const fd = new FormData();
      fd.append('image', file);
      try {
        const res = await axios.put(`${API}/pineline/${orderId}/upload`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast(res.data.message || 'Tải ảnh thành công.', 'success');

        // ✅ Logic: Nếu là đơn trả góp và upload ảnh từ lần thứ 2 trở đi -> Chuyển về Pending
        if (isInstallment && hasImageBefore) {
          const userId = localStorage.getItem('userId');
          await axios
            .put(`${API}/pineline/pipelines/${orderId}/status`, {
              status: 'Pending',
              userId: userId // Backend yêu cầu userId để lưu ActionLog
            })
            .catch((err) => console.error('Lỗi cập nhật status sau upload:', err));

          toast('Đã chuyển trạng thái đơn hàng về Chờ duyệt (Pending).', 'info');
        }

        await fetchOrders();
      } catch (e) {
        toast('Lỗi khi tải ảnh.', 'error');
      }
    },
    [fetchOrders, toast, orderList]
  );

  /* ═══ API: refresh notes for modal ═══════════════════════ */
  const refreshModalNotes = useCallback(async (orderCode) => {
    const userId = localStorage.getItem('userId');
    try {
      const res = await axios.get(`${API}/pineline/pipelines/${userId}`);
      setOrderList(res.data);
      const updated = res.data.find((o) => o.orderCode === orderCode);
      if (updated) setSelOrder(updated);
    } catch (e) {
      console.error(e);
    }
  }, []);

  /* ═══ API: add note ═══════════════════════════════════════ */
  const handleAddNote = useCallback(async () => {
    if (!newNote.trim()) {
      toast('Vui lòng nhập nội dung ghi chú.', 'info');
      return;
    }
    const userId = localStorage.getItem('userId');
    setSubmittingNote(true);
    try {
      await axios.post(`${API}/pineline/add-note`, {
        orderCode: selOrder.orderCode,
        content: newNote.trim(),
        userId
      });
      toast('Đã thêm ghi chú.', 'success');
      setNewNote('');
      await refreshModalNotes(selOrder.orderCode);
    } catch (e) {
      toast('Lỗi khi thêm ghi chú.', 'error');
    } finally {
      setSubmittingNote(false);
    }
  }, [newNote, selOrder, refreshModalNotes, toast]);

  /* ═══ API: edit note ══════════════════════════════════════ */
  const handleEditNote = useCallback(
    async (noteId) => {
      if (!editingContent.trim()) {
        toast('Nội dung không được để trống.', 'info');
        return;
      }
      const userId = localStorage.getItem('userId');
      setSavingEdit(true);
      try {
        await axios.put(`${API}/pineline/note/${noteId}`, {
          content: editingContent.trim(),
          userId
        });
        toast('Đã cập nhật ghi chú.', 'success');
        setEditingNoteId(null);
        setEditingContent('');
        await refreshModalNotes(selOrder.orderCode);
      } catch (e) {
        toast(e.response?.data?.message || 'Lỗi khi cập nhật ghi chú.', 'error');
      } finally {
        setSavingEdit(false);
      }
    },
    [editingContent, selOrder, refreshModalNotes, toast]
  );

  /* ═══ API: delete note ════════════════════════════════════ */
  const handleDeleteNote = useCallback(
    async (noteId) => {
      if (!window.confirm('Xóa ghi chú này?')) return;
      const userId = localStorage.getItem('userId');
      try {
        await axios.delete(`${API}/pineline/note/${noteId}`, { data: { userId } });
        toast('Đã xóa ghi chú.', 'success');
        await refreshModalNotes(selOrder.orderCode);
      } catch (e) {
        toast(e.response?.data?.message || 'Lỗi khi xóa ghi chú.', 'error');
      }
    },
    [selOrder, refreshModalNotes, toast]
  );

  /* ═══ derived ═════════════════════════════════════════════ */
  const tabCounts = {
    orders: orderList.filter((o) => o.status === 'Pending').length,
    paid: orderList.filter((o) => o.status === 'Completed').length,
    canceled: orderList.filter((o) => o.status === 'Cancelled').length,
    installment: orderList.filter((o) => o.status === 'Installment').length
  };
  const currentUserId = localStorage.getItem('userId');

  /* ═══ sub-renders ═════════════════════════════════════════ */
  const ImageCell = ({ order }) => (
    <td>
      {order.images?.map((img, i) => (
        <button key={i} className="img-btn img-view" onClick={() => window.open(`https://www.system.crmkhitam.com${img.url}`, '_blank')}>
          Ảnh {i + 1}
        </button>
      ))}
      <button className="img-btn img-up" onClick={() => document.getElementById(`up-${order._id}`).click()}>
        Tải lên
      </button>
      <input
        id={`up-${order._id}`}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files[0]) handleImageUpload(order._id, e.target.files[0]);
        }}
      />
    </td>
  );

  const OrderRow = ({ order, showDelete, showInstallment, canEdit }) => (
    <tr>
      <td style={{ display: 'flex', gap: 4 }}>
        {showDelete && (
          <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDeleteOrder(order._id)}>
            Xóa
          </button>
        )}
        {canEdit && (
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleEditClick(order)}>
            Sửa
          </button>
        )}
      </td>
      <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6B7280' }}>{order.orderCode}</td>
      <ImageCell order={order} />
      <td style={{ fontWeight: 600 }}>{order.user?.name || '—'}</td>
      <td>{order.user?.email || '—'}</td>
      <td>{order.contact?.phone || '—'}</td>
      {/* products */}
      <td>
        {order.products?.map((p, i) => (
          <div key={i} style={{ marginBottom: 3 }}>
            {expanded === `${order._id}-${i}` ? (
              <div>
                <strong>{p.name}</strong>: {fmtNum(p.price)} VND
                <button className="btn-icon" style={{ fontSize: 10, marginLeft: 4 }} onClick={() => setExpanded(null)}>
                  ↑
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}
                >
                  <strong>{p.name}</strong>
                </span>
                <button className="btn-icon" style={{ fontSize: 10 }} onClick={() => setExpanded(`${order._id}-${i}`)}>
                  ↓
                </button>
              </div>
            )}
          </div>
        ))}
      </td>
      {/* K */}
      <td>
        {order.K?.length > 0 ? (
          order.K.map((k, i) => (
            <div key={i} style={{ fontSize: 11 }}>
              K: {k.value}
            </div>
          ))
        ) : (
          <span style={{ color: '#9CA3AF', fontSize: 11 }}>—</span>
        )}
      </td>
      {/* notes preview + open modal */}
      <td style={{ minWidth: 180 }}>
        {order.note?.slice(-2).map((n) => (
          <div key={n._id} className="note-item">
            <div className="note-content">{n.content}</div>
            <div className="note-meta">
              <span className="note-time">{toVNTime(n.createdAt)}</span>
              <span className="note-author">
                {n.createdBy?.lastname} {n.createdBy?.firstname}
              </span>
            </div>
          </div>
        ))}
        <button
          className="btn btn-secondary"
          style={{ fontSize: 11, padding: '4px 10px', marginTop: 4 }}
          onClick={() => {
            setSelOrder(order);
            setShowNoteModal(true);
          }}
        >
          Xem/Thêm ghi chú
        </button>
      </td>
      {/* stage */}
      <td>
        <StageSelect value={order.stage} onChange={(v) => handleStageChange(order._id, v)} />
      </td>
      {/* money */}
      <td className="price" style={{ textAlign: 'right' }}>
        {fmtNum(order.depositAmount)} VND
      </td>
      <td className="price" style={{ textAlign: 'right' }}>
        {fmtNum(order.surcharge)} VND
      </td>
      <td className="price" style={{ textAlign: 'right' }}>
        {fmtNum(order.amountTotal)} VND
      </td>
      <td className="price" style={{ textAlign: 'right' }}>
        {fmtNum(order.totalAmount)} VND
      </td>
      {showInstallment && (
        <td style={{ fontSize: 12, textAlign: 'right' }}>
          <div style={{ fontWeight: 700 }}>Đầu: {fmtNum(order.Firstpayment)} VND</div>
          {(order.installments && order.installments.length > 0 ? order.installments : order.installmentPlans)?.map((p, i) => {
            const amount = p.amount || p.PaidAmount;
            const isPaid = p.isPaid || p.Status === 'paid' || p.Status === 'Completed';
            return (
              <div key={i} style={{ marginTop: 2, color: '#6B7280' }}>
                #{p.installmentNumber}: {fmtNum(amount)} VND
                <span
                  style={{
                    marginLeft: 6,
                    fontWeight: 600,
                    color: isPaid ? '#057A55' : '#B45309'
                  }}
                >
                  {isPaid ? 'Đã thu' : 'Chưa thu'}
                </span>
              </div>
            );
          })}
        </td>
      )}
      <td>
        <PartnerBadge yes={order.isBusinessPartner} />
      </td>
      <td>
        <StagePill stage={order.stage} />
      </td>
      <td style={{ whiteSpace: 'nowrap', fontSize: 11, color: '#6B7280' }}>{toVNTime(order.createdAt)}</td>
    </tr>
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="co-wrap">
      <style>{CSS}</style>
      <Toast />

      {/* ── header ─────────────────────────────────────────── */}
      <div className="co-header">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Tạo và theo dõi pipeline bán hàng</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={fetchOrders} title="Làm mới">
            <MdRefresh size={16} />
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Tạo đơn hàng
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          ORDER LIST
          ════════════════════════════════════════════════════ */}
      {!showForm && (
        <div className="co-list">
          <div className="co-card">
            {/* tabs */}
            <div className="co-tabs">
              {TABS.map(({ key, label }) => (
                <button key={key} className={`co-tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
                  {label}
                  <span className="tab-cnt">{tabCounts[key]}</span>
                </button>
              ))}
            </div>

            {loadingOrders ? (
              <div className="empty">
                <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3, margin: '2rem auto' }} />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Thao tác</th>
                      <th>Mã đơn</th>
                      <th>Hình ảnh</th>
                      <th>Tên KH</th>
                      <th>Email</th>
                      <th>SĐT</th>
                      <th>Sản phẩm</th>
                      <th>Khóa (K)</th>
                      <th>Ghi chú</th>
                      <th>Giai đoạn</th>
                      <th style={{ textAlign: 'right' }}>Tạm ứng</th>
                      <th style={{ textAlign: 'right' }}>Phụ thu</th>
                      <th style={{ textAlign: 'right' }}>Tổng thực tế</th>
                      <th style={{ textAlign: 'right' }}>Tổng gốc</th>
                      {activeTab === 'installment' && <th style={{ textAlign: 'right' }}>Lịch góp</th>}
                      <th>Đối tác KD</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderList
                      .filter((o) => o.status === STATUS_MAP[activeTab])
                      .map((order) => (
                        <OrderRow
                          key={order._id}
                          order={order}
                          showDelete={activeTab === 'orders' || activeTab === 'canceled'}
                          showInstallment={activeTab === 'installment'}
                          canEdit={activeTab === 'orders' || activeTab === 'installment'}
                        />
                      ))}
                  </tbody>
                </table>
                {orderList.filter((o) => o.status === STATUS_MAP[activeTab]).length === 0 && (
                  <div className="empty">
                    <div className="ei">📋</div>
                    <p>Không có đơn hàng nào</p>
                    <small>Chưa có dữ liệu cho danh mục này</small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CREATE ORDER FORM
          ════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="co-form">
          {/* ── Section 1: Khách hàng ──────────────────────── */}
          <div className="sec">
            <div className="sec-head">
              <div className="sec-num" style={{ background: '#EBF2FF', color: '#1A56DB' }}>
                1
              </div>
              <h2>{isEditing ? 'Cập nhật thông tin khách hàng' : 'Thông tin khách hàng'}</h2>
              <span>{isEditing ? `Đang chỉnh sửa đơn #${selOrder?.orderCode}` : 'Tìm kiếm từ CRM'}</span>
            </div>
            <div className="sec-body">
              <div className="g2" style={{ alignItems: 'start', gap: '1.5rem' }}>
                {/* left: search + info */}
                <div>
                  <div className="field" style={{ marginBottom: '1rem' }}>
                    <label>Tìm kiếm khách hàng</label>
                    <AsyncSelect
                      cacheOptions
                      loadOptions={loadContacts}
                      onChange={handleContactChange}
                      placeholder="Nhập tên, email, SĐT..."
                      classNamePrefix="rs"
                    />
                  </div>
                  {selContact && (
                    <div className="cust-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div className="avatar">{formData.name?.charAt(0)?.toUpperCase() || '?'}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{formData.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>Đã chọn từ danh sách liên hệ</div>
                        </div>
                      </div>
                      <div className="cust-row">
                        <span className="cust-lbl">Email</span>
                        <span className="cust-val">{formData.email}</span>
                      </div>
                      <div className="cust-row">
                        <span className="cust-lbl">Số điện thoại</span>
                        <span className="cust-val">{formData.phone}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* right: stage + notes + partner */}
                <div>
                  <div className="g2" style={{ marginBottom: '1rem' }}>
                    <div className="field">
                      <label>
                        Tình trạng <span className="req">*</span>
                      </label>
                      <select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })}>
                        <option value="">— Chọn giai đoạn —</option>
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {formData.stage && (
                        <div style={{ marginTop: 6 }}>
                          <StagePill stage={formData.stage} />
                        </div>
                      )}
                    </div>
                    <div className="field">
                      <label>Ghi chú</label>
                      <textarea placeholder="Ghi chú về đơn hàng..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                  </div>
                  <label className="partner-cb">
                    <input type="checkbox" checked={isPartner} onChange={(e) => setIsPartner(e.target.checked)} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Đối tác kinh doanh</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Đánh dấu nếu khách hàng là đối tác KD</div>
                    </div>
                    {isPartner && <PartnerBadge yes />}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Sản phẩm ────────────────────────── */}
          <div className="sec">
            <div className="sec-head">
              <div className="sec-num" style={{ background: '#FFFBEB', color: '#92400E' }}>
                2
              </div>
              <h2>Sản phẩm</h2>
              <span>{products.length} sản phẩm đã chọn</span>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <AsyncSelect
                cacheOptions
                loadOptions={searchProducts}
                onChange={handleAddProduct}
                inputValue={searchQ}
                onInputChange={(v) => setSearchQ(v)}
                value={null}
                placeholder="Tìm và thêm sản phẩm theo tên hoặc mã TaxCode..."
                classNamePrefix="rs"
              />
            </div>
            <div className="ptbl-wrap">
              {products.length === 0 ? (
                <div className="empty">
                  <div className="ei">📦</div>
                  <p>Chưa có sản phẩm nào</p>
                  <small>Tìm kiếm và thêm sản phẩm từ thanh tìm kiếm phía trên</small>
                </div>
              ) : (
                <table className="ptbl">
                  <thead>
                    <tr>
                      <th>TaxCode</th>
                      <th>Tên sản phẩm</th>
                      <th style={{ width: 80 }}>Khóa (K)</th>
                      <th>Nhãn hàng</th>
                      <th style={{ textAlign: 'center', width: 110 }}>Số lượng</th>
                      <th style={{ textAlign: 'right' }}>Đơn giá</th>
                      <th>Voucher</th>
                      <th style={{ textAlign: 'right' }}>Thành tiền</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, idx) => {
                      const v = p.latestVoucher;
                      return (
                        <tr key={idx}>
                          <td>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: 11,
                                background: '#F3F4F6',
                                padding: '2px 6px',
                                borderRadius: 4,
                                color: '#4B5563'
                              }}
                            >
                              {p.TaxCode}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: '#1F2937' }}>{p.name}</td>
                          <td>
                            <input
                              className="tbl-input"
                              type="text"
                              value={p.K === 0 ? '' : p.K}
                              placeholder="—"
                              onKeyDown={(e) => {
                                const ok = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                if (!(e.key >= '0' && e.key <= '9') && !ok.includes(e.key)) e.preventDefault();
                              }}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                handleProductChange(idx, 'K', val === '' ? 0 : Number(val));
                              }}
                            />
                          </td>
                          <td style={{ color: '#6B7280', fontSize: 12 }}>{p.category}</td>
                          <td>
                            <Counter value={p.quantity} min={1} onChange={(val) => handleProductChange(idx, 'quantity', val)} />
                          </td>
                          <td style={{ textAlign: 'right', color: '#6B7280', fontSize: 12 }}>{fmtNum(p.price)} VND</td>
                          <td>
                            {v ? (
                              <span className="v-pill">
                                {fmtNum(v.voucherValue)} ({v.voucherType})
                              </span>
                            ) : (
                              <span className="no-v">Không có voucher</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="price">{fmtNum(getProductTotal(p))} VND</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '4px 7px' }}
                              onClick={() => deleteProduct(idx)}
                            >
                              <MdClose size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Section 3: Thanh toán ───────────────────────── */}
          <div className="sec">
            <div className="sec-head">
              <div className="sec-num" style={{ background: '#F5F3FF', color: '#4C1D95' }}>
                3
              </div>
              <h2>Thanh toán & tổng tiền</h2>
            </div>
            <div className="sec-body">
              <div className="g2" style={{ gap: '2rem' }}>
                {/* left: inputs */}
                <div>
                  <div className="g2" style={{ marginBottom: '1rem' }}>
                    <div className="field">
                      <label>Loại giảm giá</label>
                      <select value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
                        <option value="">Không áp dụng</option>
                        <option value="Percent">Phần trăm (%)</option>
                        <option value="Amount">Số tiền (VND)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>{voucherType === 'Percent' ? 'Giảm giá (%)' : 'Giảm giá (VND)'}</label>
                      <input
                        type="text"
                        placeholder={voucherType === 'Percent' ? 'Nhập %...' : 'Nhập VND...'}
                        value={voucherType === 'Amount' ? fmtNum(voucherInt) : voucherInt}
                        onChange={(e) => {
                          if (voucherType === 'Amount') setVoucherInt(Number(e.target.value.replace(/\D/g, '')));
                          else if (voucherType === 'Percent') {
                            const n = Number(e.target.value);
                            if (n >= 0 && n <= 100) setVoucherInt(n);
                          }
                        }}
                      />
                    </div>
                    <div className="field">
                      <label>Số tiền tạm ứng</label>
                      <input
                        type="text"
                        placeholder="0 VND"
                        value={deposit ? fmtNum(deposit) : ''}
                        onChange={(e) => setDeposit(Math.min(Number(e.target.value.replace(/\D/g, '')), calcTotal()))}
                      />
                    </div>
                    <div className="field">
                      <label>Phụ thu</label>
                      <input
                        type="text"
                        placeholder="0 VND"
                        value={surcharge ? fmtNum(surcharge) : ''}
                        onChange={(e) => setSurcharge(Number(e.target.value.replace(/\D/g, '')))}
                      />
                    </div>
                  </div>

                  {/* payment type */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '.3px',
                        marginBottom: 8
                      }}
                    >
                      Hình thức thanh toán
                    </div>
                    <div className="pay-tabs">
                      {['Full', 'Install'].map((t) => (
                        <button key={t} className={`ptab ${payType === t ? 'active' : ''}`} onClick={() => setPayType(t)}>
                          {t === 'Full' ? 'Thanh toán đủ' : 'Trả góp'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* installment config */}
                  {payType === 'Install' && (
                    <div className="inst-box">
                      <div className="inst-title">⚙ Cấu hình trả góp</div>

                      {/* Tiền trả trước - dùng chung */}
                      <div className="field" style={{ marginBottom: '1rem' }}>
                        <label>
                          Số tiền trả trước (ban đầu) <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập số tiền trả trước..."
                          value={firstPay ? fmtNum(firstPay) : ''}
                          onChange={(e) => setFirstPay(Number(e.target.value.replace(/\D/g, '')))}
                        />
                        {firstPay > 0 && (
                          <div style={{ fontSize: 11, color: '#B45309', marginTop: 4, fontWeight: 600 }}>
                            Còn lại cần góp: <strong>{fmtNum(remainAfterFirst())} VND</strong>
                          </div>
                        )}
                      </div>

                      {/* Chọn chế độ */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                        {[
                          { key: 'auto', label: '📊 Chia đều theo tháng' },
                          { key: 'manual', label: '✏️ Nhập tay từng kỳ' }
                        ].map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setInstallMode(m.key)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                              transition: 'all .15s',
                              border: installMode === m.key ? '2px solid #B45309' : '1.5px solid #FDE68A',
                              background: installMode === m.key ? '#B45309' : 'transparent',
                              color: installMode === m.key ? '#fff' : '#B45309'
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {/* ── CHẾ ĐỘ 1: Chia đều tự động ── */}
                      {installMode === 'auto' && (
                        <>
                          <div className="g2" style={{ marginBottom: '0.75rem' }}>
                            <div className="field">
                              <label>
                                Số tháng góp <span className="req">*</span>
                              </label>
                              <Counter value={autoMonths} min={1} onChange={(v) => setAutoMonths(v)} />
                            </div>
                            <div className="field">
                              <label>
                                Ngày bắt đầu kỳ 1 <span className="req">*</span>
                              </label>
                              <input
                                className="tbl-input"
                                type="date"
                                value={autoStartDate}
                                onChange={(e) => setAutoStartDate(e.target.value)}
                              />
                            </div>
                          </div>
                          {autoMonths > 0 && autoStartDate && (
                            <>
                              <div className="inst-title" style={{ marginBottom: 6 }}>
                                📅 Lịch thanh toán dự kiến
                              </div>
                              {buildAutoPlans().map((p, i) => (
                                <div key={i} className="inst-row">
                                  <span style={{ color: '#B45309', fontWeight: 600 }}>
                                    Kỳ {i + 1} — {p.dueDate}
                                  </span>
                                  <span style={{ fontWeight: 700 }}>{fmtNum(p.amountDue)} VND</span>
                                </div>
                              ))}
                              <div style={{ marginTop: 8, fontSize: 11, color: '#057A55', fontWeight: 600 }}>
                                Mỗi kỳ ≈ {fmtNum(Math.round(remainAfterFirst() / autoMonths))} VND &nbsp;·&nbsp; {autoMonths} kỳ
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* ── CHẾ ĐỘ 2: Nhập tay ── */}
                      {installMode === 'manual' && (
                        <>
                          {installmentPlans.length === 0 && (
                            <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 8 }}>
                              Chưa có kỳ nào. Nhấn "+ Thêm kỳ" để thêm.
                            </div>
                          )}
                          {installmentPlans.map((plan, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '24px 1fr 1fr 28px',
                                gap: 8,
                                alignItems: 'center',
                                padding: '7px 0',
                                borderBottom: '1px dashed #FDE68A'
                              }}
                            >
                              <div
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  background: '#FDE68A',
                                  color: '#B45309',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0
                                }}
                              >
                                {idx + 1}
                              </div>
                              <div className="field" style={{ gap: 2 }}>
                                <label style={{ fontSize: 10 }}>Số tiền (VND)</label>
                                <input
                                  className="tbl-input"
                                  type="text"
                                  placeholder="Nhập số tiền..."
                                  value={plan.amountDue ? fmtNum(plan.amountDue) : ''}
                                  onChange={(e) => handleInstallmentChange(idx, 'amountDue', Number(e.target.value.replace(/\D/g, '')))}
                                />
                              </div>
                              <div className="field" style={{ gap: 2 }}>
                                <label style={{ fontSize: 10 }}>Ngày thanh toán</label>
                                <input
                                  className="tbl-input"
                                  type="date"
                                  value={plan.dueDate}
                                  onChange={(e) => handleInstallmentChange(idx, 'dueDate', e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeInstallmentRow(idx)}
                                style={{
                                  width: 26,
                                  height: 26,
                                  border: 'none',
                                  borderRadius: 6,
                                  background: '#FEE2E2',
                                  color: '#C81E1E',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <MdClose size={13} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addInstallmentRow}
                            style={{
                              marginTop: 10,
                              width: '100%',
                              padding: '7px',
                              border: '1.5px dashed #FDE68A',
                              borderRadius: 8,
                              background: 'transparent',
                              color: '#B45309',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'inherit'
                            }}
                          >
                            + Thêm kỳ thanh toán
                          </button>
                          {installmentPlans.length > 0 && (
                            <div
                              style={{
                                marginTop: 10,
                                padding: '8px 12px',
                                background: '#FEF9C3',
                                borderRadius: 8,
                                fontSize: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#92400E' }}>Số kỳ:</span>
                                <strong>{installmentPlans.length} kỳ</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#92400E' }}>Tổng đã nhập:</span>
                                <strong>{fmtNum(totalInstallmentEntered())} VND</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#92400E' }}>Tổng cộng:</span>
                                <strong style={{ color: firstPay + totalInstallmentEntered() === calcTotal() ? '#057A55' : '#C81E1E' }}>
                                  {fmtNum(firstPay + totalInstallmentEntered())} VND
                                  {firstPay + totalInstallmentEntered() !== calcTotal() && ` ≠ ${fmtNum(calcTotal())} VND`}
                                </strong>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* right: summary */}
                <div>
                  <div className="sum-box">
                    <div className="sum-row">
                      <span className="sum-lbl">Tổng tiền sản phẩm</span>
                      <span className="sum-val">{fmtNum(totalBefore)} VND</span>
                    </div>
                    {voucherType && voucherInt > 0 && (
                      <div className="sum-row">
                        <span className="sum-lbl">
                          Giảm giá ({voucherType === 'Percent' ? `${voucherInt}%` : `${fmtNum(voucherInt)} VND`})
                        </span>
                        <span className="sum-val" style={{ color: '#057A55' }}>
                          − {voucherType === 'Percent' ? fmtNum((totalBefore * voucherInt) / 100) : fmtNum(voucherInt)} VND
                        </span>
                      </div>
                    )}
                    {surcharge > 0 && (
                      <div className="sum-row">
                        <span className="sum-lbl">Phụ thu</span>
                        <span className="sum-val" style={{ color: '#B45309' }}>
                          + {fmtNum(surcharge)} VND
                        </span>
                      </div>
                    )}
                    {deposit > 0 && (
                      <div className="sum-row">
                        <span className="sum-lbl">Đã tạm ứng</span>
                        <span className="sum-val">− {fmtNum(deposit)} VND</span>
                      </div>
                    )}
                    <div className="sum-row">
                      <span className="sum-lbl">Còn lại phải đóng</span>
                      <span className="sum-val" style={{ color: '#1A56DB' }}>
                        {fmtNum(calcTotal() - deposit)} VND
                      </span>
                    </div>
                    <div className="sum-row sum-total">
                      <span className="sum-lbl">Tổng tiền phải đóng</span>
                      <span className="sum-val">{fmtNum(calcTotal())} VND</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
                    <button className="btn btn-primary" onClick={handleCreateOrder} disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner" /> Đang tạo...
                        </>
                      ) : (
                        '✓ Tạo đơn hàng'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ color: '#057A55', borderColor: '#057A55' }}
                      onClick={() => {
                        if (!formData.name || products.length === 0) {
                          toast('Vui lòng nhập tên KH và chọn sản phẩm để tạo QR.', 'info');
                          return;
                        }
                        setShowQRModal(true);
                      }}
                    >
                      QR Thanh toán
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          NOTE MODAL — xem / thêm / sửa / xóa ghi chú
          ════════════════════════════════════════════════════ */}
      {showNoteModal && selOrder && (
        <div
          className="modal-ov"
          onClick={() => {
            setShowNoteModal(false);
            setEditingNoteId(null);
          }}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Ghi chú — #{selOrder.orderCode}</h3>
              <button
                className="btn-icon"
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNoteId(null);
                }}
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* note list */}
              {(!selOrder.note || selOrder.note.length === 0) && (
                <div className="empty" style={{ padding: '1.5rem' }}>
                  <p>Chưa có ghi chú nào</p>
                </div>
              )}

              {selOrder.note?.map((n, i) => (
                <div key={n._id || i} className="note-item">
                  {editingNoteId === n._id ? (
                    /* ── edit mode ── */
                    <div className="note-edit-row">
                      <textarea
                        rows={2}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleEditNote(n._id);
                          }
                          if (e.key === 'Escape') {
                            setEditingNoteId(null);
                            setEditingContent('');
                          }
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          disabled={savingEdit}
                          onClick={() => handleEditNote(n._id)}
                        >
                          {savingEdit ? <span className="spinner" /> : <MdCheck size={14} />}
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingContent('');
                          }}
                        >
                          <MdClose size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── view mode ── */
                    <>
                      <div className="note-content">{n.content}</div>
                      <div className="note-meta">
                        <span className="note-time">{toVNTime(n.createdAt)}</span>
                        <span className="note-author">
                          {n.createdBy?.lastname} {n.createdBy?.firstname}
                        </span>
                        {/* only creator can edit/delete */}
                        {String(n.createdBy?._id) === String(currentUserId) && (
                          <div className="note-actions">
                            <button
                              className="btn-icon"
                              title="Sửa"
                              onClick={() => {
                                setEditingNoteId(n._id);
                                setEditingContent(n.content);
                              }}
                            >
                              <MdEdit size={14} style={{ color: '#1A56DB' }} />
                            </button>
                            <button className="btn-icon" title="Xóa" onClick={() => handleDeleteNote(n._id)}>
                              <MdDelete size={14} style={{ color: '#C81E1E' }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* add new note */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                <div className="field">
                  <label>Thêm ghi chú mới</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung ghi chú... (Enter để gửi)"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNoteId(null);
                }}
              >
                Đóng
              </button>
              <button className="btn btn-primary" disabled={submittingNote} onClick={handleAddNote}>
                {submittingNote ? (
                  <>
                    <span className="spinner" /> Đang lưu...
                  </>
                ) : (
                  '+ Thêm ghi chú'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ════════════════════════════════════════════════════
          QR MODAL
          ════════════════════════════════════════════════════ */}
      {showQRModal && (
        <div className="modal-ov" onClick={() => setShowQRModal(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>QR Thanh toán</h3>
              <button className="btn-icon" onClick={() => setShowQRModal(false)}>
                <MdClose size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img
                src={generateQRUrl()}
                alt="QR Code"
                style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <div style={{ marginTop: 15, fontSize: 13, lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: '#1F2937' }}>VIETCOMBANK</p>
                <p style={{ fontWeight: 600 }}>STK: 1037757201</p>
                <p style={{ fontSize: 12, color: '#6B7280' }}>CTCP KHI TAM CONG NGHE SUC KHOE VN</p>
                <div style={{ marginTop: 10, padding: 10, background: '#F3F4F6', borderRadius: 8 }}>
                  <p style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase' }}>Số tiền thanh toán</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#1A56DB' }}>{fmtNum(calcTotal())} VND</p>
                </div>
              </div>
            </div>
            <div className="modal-foot" style={{ flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={downloadQR}>
                Tải mã QR về máy
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowQRModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;

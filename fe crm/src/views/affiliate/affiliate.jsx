import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import AffiliateData from './AffiliateData'; // Component hiển thị dữ liệu affiliate
import PipelineAffiliateData from './PipelineAffiliateData'; // Component mới cho danh sách đơn hàng

/* CSS Styles */
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    color: #333;
  }

  .container {
    width: 100%;
    max-width: 1500px;
    margin: 20px auto;
    padding: 15px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    text-align: center;
    font-size: 28px;
    margin-bottom: 20px;
    padding: 12px;
    border-radius: 8px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  .form-group label {
    font-size: 16px;
    font-weight: bold;
  }

  .form-group .input-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .form-group input {
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    color: #333;
    flex: 1;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus {
    border-color: #666;
    outline: none;
  }

  .form-group button {
    padding: 10px 20px;
    background-color: #1976d2;
    color: #fff;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, opacity 0.3s ease;
  }

  .form-group button:hover:not(:disabled) {
    background-color: #1565c0;
  }

  .form-group button:disabled {
    background-color: #90caf9;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .message {
    text-align: center;
    font-size: 16px;
    margin-top: 15px;
    color: #d32f2f;
  }

  .message.success {
    color: #2e7d32;
  }

  .filter-section {
    margin-top: 20px;
  }

  .filter-section h3 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .filter-section .filter-controls {
    display: flex;
    gap: 15px;
    align-items: center;
    margin-bottom: 15px;
  }

  .filter-section select,
  .filter-section .react-datepicker-wrapper input {
    padding: 12px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    color: #333;
  }

  .tab-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .tab-controls button {
    padding: 10px 20px;
    background-color: #e0e0e0;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
  }

  .tab-controls button.active {
    background-color: #1976d2;
    color: #fff;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  table th {
    padding: 12px;
    text-align: left;
    border-bottom: 2px solid #ddd;
  }

  table td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
  }

  table tr:hover {
    background-color: #f5f5f5;
  }

  .no-data {
    font-size: 16px;
    text-align: center;
  }
`;

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

const Affiliate = () => {
  const userId = localStorage.getItem('userId');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [affiliateData, setAffiliateData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]); // State cho danh sách đơn hàng
  const [dateFilter, setDateFilter] = useState('month');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState('affiliate'); // Quản lý tab (affiliate hoặc pipeline)

  const fetchAffiliateData = async () => {
    try {
      let startDate, endDate;

      if (dateFilter === 'week') {
        startDate = moment().startOf('week').format('YYYY-MM-DD');
        endDate = moment().endOf('week').format('YYYY-MM-DD');
      } else if (dateFilter === 'month') {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().add(1, 'days').format('YYYY-MM-DD');
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        startDate = moment(customStartDate).format('YYYY-MM-DD');
        endDate = moment(customEndDate).format('YYYY-MM-DD');
      } else {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().add(1, 'days').format('YYYY-MM-DD');
      }

      const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/aff/${userId}?startDate=${startDate}&endDate=${endDate}`);
      setAffiliateData(response.data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu affiliate:', error);
      setMessage('Lỗi khi tải dữ liệu affiliate.');
    }
  };

  const fetchSummaryData = async () => {
    try {
      let startDate, endDate;

      if (dateFilter === 'week') {
        startDate = moment().startOf('week').format('YYYY-MM-DD');
        endDate = moment().endOf('week').format('YYYY-MM-DD');
      } else if (dateFilter === 'month') {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().format('YYYY-MM-DD');
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        startDate = moment(customStartDate).format('YYYY-MM-DD');
        endDate = moment(customEndDate).format('YYYY-MM-DD');
      } else {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().format('YYYY-MM-DD');
      }

      const response = await axios.get(
        `https://www.system.crmkhitam.com/api/v1/aff/reports/summary/${userId}?startDate=${startDate}&endDate=${endDate}`
      );
      setSummaryData(response.data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu tổng hợp affiliate:', error);
      setMessage('Lỗi khi tải dữ liệu tổng hợp affiliate.');
    }
  };

  const fetchPipelineData = async () => {
    try {
      let startDate, endDate;

      if (dateFilter === 'week') {
        startDate = moment().startOf('week').format('YYYY-MM-DD');
        endDate = moment().endOf('week').format('YYYY-MM-DD');
      } else if (dateFilter === 'month') {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().add(1, 'days').format('YYYY-MM-DD');
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        startDate = moment(customStartDate).format('YYYY-MM-DD');
        endDate = moment(customEndDate).format('YYYY-MM-DD');
      } else {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().add(1, 'days').format('YYYY-MM-DD');
      }

      const response = await axios.get(
        `https://www.system.crmkhitam.com/api/v1/pineline/pipelineaff/${userId}?start_date=${startDate}&end_date=${endDate}`
      );
      setPipelineData(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu đơn hàng affiliate:', error);
      setMessage('Lỗi khi tải dữ liệu đơn hàng affiliate.');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAffiliateData();
      fetchSummaryData();
      fetchPipelineData();
    }
  }, [userId, dateFilter, customStartDate, customEndDate]);

  const handleAffiliateCodeChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setAffiliateCode(value);
      setMessage('');
    } else {
      setMessage('Chỉ được nhập tối đa 4 số.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!affiliateCode) {
      setMessage('Mã giới thiệu không thể trống.');
      return;
    }

    setLoading(true);

    try {
      const fullAffiliateId = `AFF${affiliateCode.padStart(4, '0')}`;

      const response = await axios.post(`https://www.system.crmkhitam.com/api/v1/admin/profile/${userId}/affiliate`, {
        affiliateId: fullAffiliateId
      });

      if (response.data) {
        setMessage(response.data.message);
        setAffiliateCode('');
        await Promise.all([fetchAffiliateData(), fetchSummaryData(), fetchPipelineData()]);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật mã giới thiệu:', error);
      setMessage(`Có lỗi xảy ra khi cập nhật: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Thông tin người dùng</h2>
      <form onSubmit={handleSubmit} className="form-group">
        <div className="input-container">
          <label htmlFor="affiliateCode">Mã giới thiệu (chỉ nhập số, ví dụ: 002):</label>
          <input
            type="text"
            id="affiliateCode"
            value={affiliateCode}
            onChange={handleAffiliateCodeChange}
            maxLength={4}
            placeholder="Nhập 0001 đến 9999"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </form>
      {message && <p className={`message ${!message.includes('lỗi') && !message.includes('Chỉ được nhập') ? 'success' : ''}`}>{message}</p>}

      <div className="filter-section">
        <h3>Lọc dữ liệu Affiliate:</h3>
        <div className="filter-controls">
          <label>Lọc theo thời gian:</label>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="month">1 tháng</option>
            <option value="week">1 tuần</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: '15px' }}>
              <DatePicker
                selected={customStartDate}
                onChange={(date) => setCustomStartDate(date)}
                selectsStart
                startDate={customStartDate}
                endDate={customEndDate}
                placeholderText="Ngày bắt đầu"
                dateFormat="yyyy-MM-dd"
              />
              <DatePicker
                selected={customEndDate}
                onChange={(date) => setCustomEndDate(date)}
                selectsEnd
                startDate={customStartDate}
                endDate={customEndDate}
                minDate={customStartDate}
                placeholderText="Ngày kết thúc"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          )}
        </div>
        <div className="tab-controls">
          <button className={activeTab === 'affiliate' ? 'active' : ''} onClick={() => setActiveTab('affiliate')}>
            Dữ liệu Affiliate
          </button>
          <button className={activeTab === 'pipeline' ? 'active' : ''} onClick={() => setActiveTab('pipeline')}>
            Danh sách đơn hàng
          </button>
        </div>
        {activeTab === 'affiliate' && <AffiliateData summaryData={summaryData} affiliateData={affiliateData} />}
        {activeTab === 'pipeline' && <PipelineAffiliateData pipelineData={pipelineData} />}
      </div>
    </div>
  );
};

export default Affiliate;

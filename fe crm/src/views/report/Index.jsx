import 'react-datepicker/dist/react-datepicker.css';
import React, { useEffect, useState, useMemo } from 'react';
import { Col, Container, Row, Card, Badge } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ReportAcademy from './ReportAcademy';
import Reportcontact from './Reportcontact';
import ReportPineline from './reportpineline';
import ReportTeam from './ReportTeam';

const Reportsummarize = () => {
  const [activeTab, setActiveTab] = useState('pineline');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDataLoaded, setApiDataLoaded] = useState({
    contact: false,
    pineline: false,
    students: false,
    team: false // Add team
  });
  const [userRole, setUserRole] = useState(null);
  const [dateRange, setDateRange] = useState('lastWeek');
  const [customDateRange, setCustomDateRange] = useState({ startDate: null, endDate: null });
  const [chartData, setChartData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    const role = localStorage.getItem('role');
    // console.log(role)
    setUserRole(role);

    if (role === 'Admin' || role === 'KTT Sale Manager' || role === 'KTT Sale Team Leader') {
      setActiveTab('pineline');
    } else if (role === 'Aca_Specialis' || role === 'Cust_service' || role === 'Hub Specialist') {
      setActiveTab('students');
    } else {
      setActiveTab('pineline');
    }
  }, []);

  useEffect(() => {
    const fetchData = async (tab) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);

        // Tính toán dữ liệu cho biểu đồ và thống kê
        if (tab === 'pineline' && data.pipelines) {
          calculateChartData(data.pipelines);
          calculateSummaryStats(data.pipelines);
        }
        return;
      }

      try {
        let url = '';
        let params = new URLSearchParams({ user_id: userId });

        let startDate, endDate;
        const currentDate = new Date();

        switch (dateRange) {
          case 'today':
            startDate = new Date(currentDate.setHours(0, 0, 0, 0));
            endDate = new Date(currentDate.setHours(23, 59, 59, 999));
            break;
          case 'lastWeek':
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - 7);
            endDate = new Date(currentDate);
            break;
          case 'lastMonth':
            startDate = new Date(currentDate);
            startDate.setMonth(currentDate.getMonth() - 1);
            endDate = new Date(currentDate);
            break;
          case 'custom':
            if (customDateRange.startDate && customDateRange.endDate) {
              startDate = customDateRange.startDate;
              endDate = customDateRange.endDate;
            } else {
              return;
            }
            break;
          default:
            startDate = new Date(currentDate.setHours(0, 0, 0, 0));
            endDate = new Date(currentDate.setHours(23, 59, 59, 999));
            break;
        }

        params.append('start_date', startDate.toISOString());
        params.append('end_date', endDate.toISOString());

        if (tab === 'contact' && !apiDataLoaded.contact) {
          setLoading(true);
          url = `https://www.system.crmkhitam.com/api/v1/contact/contacts?${params.toString()}`;
          const response = await fetch(url);
          const data = await response.json();
          setCustomers(data.contacts || []);
          setApiDataLoaded((prev) => ({ ...prev, contact: true }));
        } else if (tab === 'pineline' && !apiDataLoaded.pineline) {
          setLoading(true);
          url = `https://www.system.crmkhitam.com/api/v1/pineline/getpinelinerole?${params.toString()}`;
          const response = await fetch(url);
          const data = await response.json();
          setOrders(data.pipelines || []);
          setApiDataLoaded((prev) => ({ ...prev, pineline: true }));

          // Tính toán dữ liệu cho biểu đồ và thống kê
          if (data.pipelines) {
            calculateChartData(data.pipelines);
            calculateSummaryStats(data.pipelines);
          }
        } else if (tab === 'team' && !apiDataLoaded.team) {
          setLoading(true);
          const teamId = '6673b41f56d8b67ed4a5465e'; // Replace with dynamic teamId if available, e.g., localStorage.getItem('teamId')
          url = `https://www.system.crmkhitam.com/api/v1/pineline/teams/${teamId}/members?fromDate=${startDate.toISOString()}&toDate=${endDate.toISOString()}`;
          const response = await fetch(url);
          const data = await response.json();
          setTeams(data.teams || []);
          setApiDataLoaded((prev) => ({ ...prev, team: true }));
          setLoading(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setLoading(false);
      }
    };

    if (!apiDataLoaded[activeTab]) {
      fetchData(activeTab);
    }
  }, [activeTab, apiDataLoaded, dateRange, customDateRange]);

  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    if (value !== 'custom') {
      setCustomDateRange({ startDate: null, endDate: null });
    }
    setApiDataLoaded({
      contact: false,
      pineline: false,
      students: false
    });
    setCustomers([]); // Reset danh sách khách hàng khi thay đổi khoảng thời gian
  };

  const handleCustomDateChange = (dates) => {
    const [startDate, endDate] = dates;
    setCustomDateRange({ startDate, endDate });
    setApiDataLoaded({
      contact: false,
      pineline: false,
      students: false
    });
    setCustomers([]); // Reset danh sách khách hàng khi thay đổi khoảng thời gian tùy chỉnh
  };

  const handleSearch = (searchResults) => {
    setCustomers(searchResults); // Cập nhật danh sách khách hàng từ kết quả tìm kiếm
    setApiDataLoaded((prev) => ({ ...prev, contact: true })); // Đánh dấu dữ liệu đã được tải
  };

  // Tính toán dữ liệu cho biểu đồ theo tháng
  const calculateChartData = (orders) => {
    const monthlyData = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          revenue: 0,
          orders: 0,
          pending: 0,
          completed: 0,
          cancelled: 0
        };
      }

      monthlyData[monthKey].revenue += order.amountTotal || 0;
      monthlyData[monthKey].orders += 1;

      switch (order.status) {
        case 'Pending':
          monthlyData[monthKey].pending += 1;
          break;
        case 'Completed':
          monthlyData[monthKey].completed += 1;
          break;
        case 'Cancelled':
          monthlyData[monthKey].cancelled += 1;
          break;
      }
    });

    const chartDataArray = Object.values(monthlyData).sort((a, b) => {
      const [aYear, aMonth] = a.month.split(' ');
      const [bYear, bMonth] = b.month.split(' ');
      return new Date(aYear, getMonthNumber(aMonth)) - new Date(bYear, getMonthNumber(bMonth));
    });

    setChartData(chartDataArray);
  };

  // Hàm hỗ trợ chuyển đổi tên tháng sang số
  const getMonthNumber = (monthName) => {
    const months = {
      'tháng 1': 0,
      'tháng 2': 1,
      'tháng 3': 2,
      'tháng 4': 3,
      'tháng 5': 4,
      'tháng 6': 5,
      'tháng 7': 6,
      'tháng 8': 7,
      'tháng 9': 8,
      'tháng 10': 9,
      'tháng 11': 10,
      'tháng 12': 11
    };
    return months[monthName] || 0;
  };

  // Tính toán thống kê tổng quan
  const calculateSummaryStats = (orders) => {
    const stats = {
      totalRevenue: 0,
      totalOrders: orders.length,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    orders.forEach((order) => {
      stats.totalRevenue += order.amountTotal || 0;

      switch (order.status) {
        case 'Pending':
          stats.pendingOrders += 1;
          break;
        case 'Completed':
          stats.completedOrders += 1;
          break;
        case 'Cancelled':
          stats.cancelledOrders += 1;
          break;
      }
    });

    setSummaryStats(stats);
  };

  // Tính toán doanh thu dựa trên status filter
  const getFilteredRevenue = () => {
    if (statusFilter === 'all') {
      return summaryStats.totalRevenue;
    } else if (statusFilter === 'pending') {
      return orders.filter((order) => order.status === 'Pending').reduce((sum, order) => sum + (order.amountTotal || 0), 0);
    } else if (statusFilter === 'completed') {
      return orders.filter((order) => order.status === 'Completed').reduce((sum, order) => sum + (order.amountTotal || 0), 0);
    } else if (statusFilter === 'cancelled') {
      return orders.filter((order) => order.status === 'Cancelled').reduce((sum, order) => sum + (order.amountTotal || 0), 0);
    }
    return summaryStats.totalRevenue;
  };

  return (
    <Container fluid style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row>
        <Col>
          {/* Header với tiêu đề và thống kê tổng quan */}
          <div
            style={{
              marginBottom: '30px',
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            {/* Thống kê tổng quan cho tab pineline */}
            {activeTab === 'pineline' && (
              <Row className="mb-4">
                <Col md={3}>
                  <Card
                    className="text-center"
                    style={{
                      backgroundColor: statusFilter === 'completed' ? '#28a745' : '#28a745',
                      color: 'white',
                      border: statusFilter === 'completed' ? '3px solid #fff' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: statusFilter === 'completed' ? 1 : 0.8
                    }}
                    onClick={() => {
                      setStatusFilter('completed');
                      setActiveTab('pineline');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(40, 167, 69, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Card.Body>
                      <h4>{summaryStats.completedOrders}</h4>
                      <small>Đã hoàn thành</small>
                      <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.8' }}>👆 Click để lọc</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card
                    className="text-center"
                    style={{
                      backgroundColor: statusFilter === 'pending' ? '#ffc107' : '#ffc107',
                      color: 'white',
                      border: statusFilter === 'pending' ? '3px solid #fff' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: statusFilter === 'pending' ? 1 : 0.8
                    }}
                    onClick={() => {
                      setStatusFilter('pending');
                      setActiveTab('pineline');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(255, 193, 7, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Card.Body>
                      <h4>{summaryStats.pendingOrders}</h4>
                      <small>Đang xử lý</small>
                      <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.8' }}>👆 Click để lọc</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card
                    className="text-center"
                    style={{
                      backgroundColor: statusFilter === 'cancelled' ? '#dc3545' : '#dc3545',
                      color: 'white',
                      border: statusFilter === 'cancelled' ? '3px solid #fff' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: statusFilter === 'cancelled' ? 1 : 0.8
                    }}
                    onClick={() => {
                      setStatusFilter('cancelled');
                      setActiveTab('pineline');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(220, 53, 69, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Card.Body>
                      <h4>{summaryStats.cancelledOrders}</h4>
                      <small>Đã hủy</small>
                      <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.8' }}>👆 Click để lọc</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card
                    className="text-center"
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setStatusFilter('all');
                      setActiveTab('pineline');
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 16px rgba(23, 162, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Card.Body>
                      <h4>{getFilteredRevenue().toLocaleString('vi-VN')} VND</h4>
                      <small>
                        {statusFilter === 'all'
                          ? 'Tổng doanh thu'
                          : statusFilter === 'completed'
                            ? 'Doanh thu hoàn thành'
                            : statusFilter === 'pending'
                              ? 'Doanh thu đang xử lý'
                              : statusFilter === 'cancelled'
                                ? 'Doanh thu đã hủy'
                                : 'Tổng doanh thu'}
                      </small>
                      <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.8' }}>👆 Click để reset</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </div>

          {/* Navigation tabs với CSS cải thiện */}
          <div
            style={{
              marginBottom: '30px',
              padding: '10px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '10px'
            }}
          >
            {userRole === 'Admin' || userRole === 'KTT Sale Manager' ? (
              <>
                <span
                  onClick={() => setActiveTab('pineline')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: activeTab === 'pineline' ? '#198754' : '#f8f9fa',
                    color: activeTab === 'pineline' ? 'white' : 'black',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: activeTab === 'pineline' ? 'none' : '1px solid #dee2e6',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📋 Danh sách đơn hàng
                </span>
                <span
                  onClick={() => setActiveTab('contact')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: activeTab === 'contact' ? '#198754' : '#f8f9fa',
                    color: activeTab === 'contact' ? 'white' : 'black',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: activeTab === 'contact' ? 'none' : '1px solid #dee2e6',
                    whiteSpace: 'nowrap'
                  }}
                >
                  👥 Danh sách khách hàng mới
                </span>

                <span
                  onClick={() => setActiveTab('students')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: activeTab === 'students' ? '#198754' : '#f8f9fa',
                    color: activeTab === 'students' ? 'white' : 'black',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: activeTab === 'students' ? 'none' : '1px solid #dee2e6',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🎓 Danh sách học viên
                </span>
                {/* <span
                  onClick={() => setActiveTab('team')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: activeTab === 'team' ? '#198754' : '#f8f9fa',
                    color: activeTab === 'team' ? 'white' : 'black',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: activeTab === 'team' ? 'none' : '1px solid #dee2e6',
                    whiteSpace: 'nowrap'
                  }}
                >
                  👥 Báo Cáo Theo Team
                </span> */}
              </>
            ) : userRole === 'Aca_Specialis' || userRole === 'Cust_service' || userRole === 'Hub Specialist' ? (
              <span
                onClick={() => setActiveTab('students')}
                style={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'students' ? '#198754' : '#f8f9fa',
                  color: activeTab === 'students' ? 'white' : 'black',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  border: activeTab === 'students' ? 'none' : '1px solid #dee2e6',
                  whiteSpace: 'nowrap'
                }}
              >
                🎓 Danh sách học viên
              </span>
            ) : userRole === 'KTT Sale Team Leader' ? (
              <>
                <span
                  onClick={() => setActiveTab('contact')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: activeTab === 'contact' ? '#198754' : '#f8f9fa',
                    color: activeTab === 'contact' ? 'white' : 'black',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: activeTab === 'contact' ? 'none' : '1px solid #dee2e6',
                    whiteSpace: 'nowrap'
                  }}
                >
                  👥 Danh sách khách hàng của nhóm
                </span>
                <span
                  onClick={() => setActiveTab('pineline')}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: activeTab === 'pineline' ? '#198754' : '#f8f9fa',
                    color: activeTab === 'pineline' ? 'white' : 'black',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: activeTab === 'pineline' ? 'none' : '1px solid #dee2e6',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📋 Danh sách đơn hàng
                </span>
              </>
            ) : null}
          </div>

          {/* Date range selection */}
          <div className="mb-4">
            {activeTab !== 'students' && (
              <select onChange={handleDateRangeChange} value={dateRange} style={{ padding: '8px 16px', borderRadius: '5px' }}>
                <option value="today">Hôm nay</option>
                <option value="lastWeek">1 tuần qua</option>
                <option value="lastMonth">1 tháng qua</option>
                <option value="custom">Chọn khoảng thời gian</option>
              </select>
            )}

            {dateRange === 'custom' && (
              <div className="mt-2">
                <DatePicker
                  selected={customDateRange.startDate}
                  onChange={handleCustomDateChange}
                  startDate={customDateRange.startDate}
                  endDate={customDateRange.endDate}
                  selectsRange
                  inline
                  dateFormat="yyyy/MM/dd"
                />
              </div>
            )}
          </div>

          {/* Display corresponding component */}
          {activeTab === 'contact' ? (
            <Reportcontact customers={customers} loading={loading} onSearch={handleSearch} />
          ) : activeTab === 'pineline' ? (
            <ReportPineline orders={orders} loading={loading} statusFilter={statusFilter} />
          ) : activeTab === 'students' ? (
            <ReportAcademy />
          ) : activeTab === 'team' ? (
            <ReportTeam teams={teams} loading={loading} />
          ) : null}
        </Col>
      </Row>
    </Container>
  );
};

export default Reportsummarize;

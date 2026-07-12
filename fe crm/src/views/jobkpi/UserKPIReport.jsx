import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Alert, Form, ProgressBar, Spinner, Table } from 'react-bootstrap';

const UserKPIReport = () => {
  const [kpiData, setKpiData] = useState([]); // Dữ liệu KPI
  const [userRole, setUserRole] = useState(''); // Vai trò người dùng
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [error, setError] = useState(''); // Lỗi nếu có
  const [month, setMonth] = useState(1); // Mặc định tháng 1
  const [year, setYear] = useState(2025); // Mặc định năm 2025

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID không tồn tại trong localStorage.');
        }

        const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/kpi/kpis?user_id=${userId}&month=${month}&year=${year}`);
        setKpiData(response.data.data); // Lưu dữ liệu KPI
        setUserRole(response.data.message); // Lưu vai trò người dùng (Admin, Manager, etc.)
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu KPI.');
        setLoading(false);
      }
    };

    fetchKPIData();
  }, [month, year]); // Gọi lại khi tháng hoặc năm thay đổi

  const handleMonthChange = (e) => {
    setMonth(Number(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="mb-4 text-center">
        <h4>
          Báo Cáo KPI Tháng {month}/{year}
        </h4>
        <p>
          <strong>Vai trò:</strong> {userRole}
        </p>
      </div>

      <div className="d-flex justify-content-center mb-4">
        <Form.Select value={month} onChange={handleMonthChange} className="me-2" style={{ width: '120px' }}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </option>
          ))}
        </Form.Select>
        <Form.Select value={year} onChange={handleYearChange} style={{ width: '120px' }}>
          {[...Array(5)].map((_, i) => (
            <option key={year - i} value={year - i}>
              {year - i}
            </option>
          ))}
        </Form.Select>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Người Dùng</th>
            <th>Email</th>
            <th>Mục Tiêu</th>
            <th>Thực Tế</th>
            <th>Thời Gian</th>
            <th>Trạng Thái</th>
            <th>Tiến Độ</th>
          </tr>
        </thead>
        <tbody>
          {kpiData.length > 0 ? (
            kpiData.map((kpi, index) => {
              const progressPercentage = Math.min(((kpi.actual || 0) / kpi.target) * 100, 100);

              return (
                <tr key={kpi.id}>
                  <td>{index + 1}</td>
                  <td>{kpi.user.name}</td>
                  <td>{kpi.user.email}</td>
                  <td>{kpi.target.toLocaleString()}</td>
                  <td>{kpi.actual.toLocaleString()}</td>
                  <td>
                    {new Date(kpi.startDate).toLocaleDateString()} - {new Date(kpi.endDate).toLocaleDateString()}
                  </td>
                  <td>{kpi.status}</td>
                  <td>
                    <ProgressBar
                      now={progressPercentage}
                      label={`${progressPercentage.toFixed(1)}%`}
                      variant={
                        progressPercentage >= 100
                          ? 'success'
                          : progressPercentage >= 75
                            ? 'info'
                            : progressPercentage >= 50
                              ? 'warning'
                              : 'danger'
                      }
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                Không có KPI nào cho tháng {month}/{year}.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default UserKPIReport;

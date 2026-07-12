import React, { useState } from 'react';

import {
  Col,
  Container,
  Row
} from 'react-bootstrap';

import AdminPage from './role';
import WorkAndKPITable from './WorkAndKPITable';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('pendingUsers'); // Tab mặc định là "pendingUsers"

  return (
    <Container>
      <Row>
        <Col>
          {/* Menu điều hướng */}
          <div className="mb-4">
            <span
              onClick={() => setActiveTab('pendingUsers')}
              style={{
                cursor: 'pointer',
                marginRight: '20px',
                textDecoration: activeTab === 'pendingUsers' ? 'underline' : 'none'
              }}
            >
              Danh sách team
            </span>
            <span
              onClick={() => setActiveTab('workAndKPI')}
              style={{
                cursor: 'pointer',
                textDecoration: activeTab === 'workAndKPI' ? 'underline' : 'none'
              }}
            >
              Quản lý KPI
            </span>
          </div>

          {/* Hiển thị bảng tương ứng */}
          {activeTab === 'pendingUsers' ? <AdminPage /> : <WorkAndKPITable />}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

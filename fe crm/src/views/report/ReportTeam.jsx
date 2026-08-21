import React, { useState } from 'react';
import { Container, Row, Col, Table, Card, Spinner, Accordion, Badge } from 'react-bootstrap';

const ReportTeam = ({ teams, loading }) => {
  if (loading) {
    return <Spinner animation="border" variant="primary" className="d-block mx-auto mt-4" />;
  }

  if (!teams || teams.length === 0) {
    return <p className="text-center text-muted mt-4">Không có dữ liệu báo cáo team.</p>;
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="text-center mb-4" style={{ color: '#054a27' }}>Báo Cáo Theo Team</h2>
          {teams.map((team, index) => {
            // Group pipelines by createdBy
            const pipelinesByCreator = (team.pipelines || []).reduce((acc, pipeline) => {
              const creatorId = pipeline.createdBy;
              if (!acc[creatorId]) {
                acc[creatorId] = [];
              }
              acc[creatorId].push(pipeline);
              return acc;
            }, {});

            // Combine lead and members into a list of personnel
            const personnel = [];
            if (team.lead) {
              personnel.push({ ...team.lead, isLead: true });
            }
            if (Array.isArray(team.members)) {
              personnel.push(...team.members);
            }

            // Map creatorId to personnel info
            const getPersonInfo = (id) => {
              return personnel.find(p => p.id === id) || { firstname: 'Unknown', lastname: '', email: '' };
            };

            // Calculate team totals
            const totalRevenue = (team.pipelines || []).reduce((sum, p) => sum + (p.amountTotal || 0), 0);
            const totalOrders = (team.pipelines || []).length;

            return (
              <Card key={index} className="mb-4 shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <Card.Header className="bg-success text-white" style={{ padding: '10px' }}>
                  <h4 className="mb-0" style={{ fontSize: '1.2rem' }}>{team.teamName}</h4>
                </Card.Header>
                <Card.Body style={{ padding: '15px' }}>
                  <h5 className="mt-3" style={{ fontSize: '1rem' }}>Thành Viên và Pipeline:</h5>
                  <Accordion>
                    {personnel.map((person, cIndex) => {
                      const personPipelines = pipelinesByCreator[person.id] || [];
                      const personRevenue = personPipelines.reduce((sum, p) => sum + (p.amountTotal || 0), 0);
                      const personOrders = personPipelines.length;

                      const successfulRevenue = personPipelines.reduce((sum, p) => sum + (p.status === 'Completed' ? (p.amountTotal || 0) : 0), 0);
                      const expectedRevenue = personPipelines.reduce((sum, p) => sum + (p.status === 'Pending' ? (p.amountTotal || 0) : 0), 0);

                      return (
                        <Accordion.Item eventKey={cIndex.toString()} key={cIndex}>
                          <Accordion.Header style={{ fontSize: '0.95rem', backgroundColor: '#e7f1ff', padding: '8px 12px', borderRadius: '5px' }}>
                            <div style={{ width: '100%' }}>
                              {person.isLead ? 'Lead: ' : ''}{person.firstname || 'Ẩn danh'} {person.lastname || ''} {person.email ? `(${person.email})` : ''}
                              <br />
                              <small style={{ fontSize: '0.85rem', color: '#0d6efd' }}>
                                Tổng doanh thu: {personRevenue.toLocaleString('vi-VN')} VNĐ | 
                                Doanh thu (thành công): {successfulRevenue.toLocaleString('vi-VN')} VND | 
                                Doanh thu (dự kiến): {expectedRevenue.toLocaleString('vi-VN')} VNĐ
                              </small>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body style={{ padding: '10px' }}>
                            {personPipelines.length > 0 ? (
                              <Table striped bordered hover responsive className="mt-2" size="sm">
                                <thead className="bg-light" style={{ fontSize: '0.85rem' }}>
                                  <tr>
                                    <th>Mã Đơn</th>
                                    <th>Khách Hàng</th>
                                    <th>Trạng Thái</th>
                                    <th>Tổng Tiền</th>
                                    <th>Ngày Dự Kiến</th>
                                    <th>Sản Phẩm</th>
                                  </tr>
                                </thead>
                                <tbody style={{ fontSize: '0.85rem' }}>
                                  {personPipelines.map((pipeline, pIndex) => (
                                    <tr key={pIndex}>
                                      <td>{pipeline.orderCode || 'N/A'}</td>
                                      <td>{pipeline.contact ? pipeline.contact.email : 'N/A'}</td>
                                      <td>{pipeline.status || 'N/A'}</td>
                                      <td>{(pipeline.amountTotal || 0).toLocaleString('vi-VN')} VND</td>
                                      <td>{pipeline.expectedCloseDate ? new Date(pipeline.expectedCloseDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                      <td>
                                        <ul className="list-unstyled mb-0" style={{ fontSize: '0.85rem' }}>
                                          {(pipeline.products || []).map((product, prIndex) => (
                                            <li key={prIndex}>{product.name}</li>
                                          ))}
                                        </ul>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p className="text-muted">Không có pipeline.</p>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>

                  {team.members.length === 0 && Object.keys(pipelinesByCreator).length === 0 && (
                    <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>Không có thành viên hoặc pipeline.</p>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </Col>
      </Row>
    </Container>
  );
};

export default ReportTeam;

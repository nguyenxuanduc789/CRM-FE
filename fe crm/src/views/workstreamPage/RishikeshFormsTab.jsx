import React, { useState, useEffect } from 'react';
import { Spinner, Alert, Card, Table, Badge, Button, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaWpforms, FaEye } from 'react-icons/fa';

const RishikeshFormsTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://www.system.crmkhitam.com/api/v1/rishikesh');
      setData(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (sub) => {
    setSelectedSubmission(sub);
    setShowModal(true);
  };

  const InfoRow = ({ label, value }) => (
    <div style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
      <strong style={{ color: '#555' }}>{label}:</strong>
      <div style={{ marginTop: '4px', fontWeight: '500' }}>{value || <span className="text-muted">Chưa điền</span>}</div>
    </div>
  );

  return (
    <>
      <Card className="shadow-sm border-info mt-3">
        <Card.Header className="bg-white text-info fw-bold d-flex align-items-center">
          <FaWpforms className="me-2" />
          Danh sách thông tin form Rishikesh
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="info" /> <span className="ms-2">Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Table responsive hover bordered striped className="mt-2">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Họ và Tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Nghề nghiệp</th>
                  <th>Ngày gửi</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      Chưa có dữ liệu form nào.
                    </td>
                  </tr>
                ) : (
                  data.map((sub, index) => (
                    <tr key={sub._id || index}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{sub.fullName}</td>
                      <td>{sub.phoneNumber}</td>
                      <td>{sub.email}</td>
                      <td>{sub.occupation}</td>
                      <td>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : 
                         sub.createdAt ? new Date(sub.createdAt).toLocaleString('vi-VN') : ''}
                      </td>
                      <td className="text-center">
                        <Button variant="outline-info" size="sm" onClick={() => handleView(sub)}>
                          <FaEye className="me-1" /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-info">
            <FaWpforms className="me-2" /> Chi Tiết Form Rishikesh
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <Row>
              <Col md={6}>
                <InfoRow label="Họ và Tên" value={selectedSubmission.fullName} />
                <InfoRow label="Số điện thoại" value={selectedSubmission.phoneNumber} />
                <InfoRow label="Email" value={selectedSubmission.email} />
                <InfoRow label="Năm sinh" value={selectedSubmission.birthYear} />
                <InfoRow label="Tỉnh/Thành phố" value={selectedSubmission.city} />
                <InfoRow label="Nghề nghiệp hiện tại" value={selectedSubmission.occupation} />
                <InfoRow label="Ngày nộp" value={selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString('vi-VN') : ''} />
              </Col>
              <Col md={6}>
                <InfoRow label="Kinh nghiệm Yoga/Trị liệu" value={selectedSubmission.yogaExperience} />
                <InfoRow label="Chương trình Khí Tâm đã tham gia" value={selectedSubmission.khiTamPrograms} />
                <InfoRow label="Làm việc với khách hàng" value={selectedSubmission.workingWithClients} />
                <InfoRow 
                  label="Điều quan tâm ở Rishikesh" 
                  value={
                    Array.isArray(selectedSubmission.interestInRishikesh) 
                      ? selectedSubmission.interestInRishikesh.join(', ') 
                      : selectedSubmission.interestInRishikesh
                  } 
                />
                <InfoRow label="Mục tiêu lớn nhất" value={selectedSubmission.mainGoal} />
                <InfoRow label="Thời điểm tham gia dự kiến" value={selectedSubmission.expectedTime} />
                <InfoRow label="Kinh nghiệm đi nước ngoài" value={selectedSubmission.travelAbroadExperience} />
                <InfoRow label="Điều băn khoăn nhất" value={selectedSubmission.concerns} />
                <InfoRow label="Nội dung cần hỗ trợ" value={selectedSubmission.supportNeeded} />
                <InfoRow label="Câu hỏi / Chia sẻ thêm" value={selectedSubmission.additionalQuestions} />
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RishikeshFormsTab;

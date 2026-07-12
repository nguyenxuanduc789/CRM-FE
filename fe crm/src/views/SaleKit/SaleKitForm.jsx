import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Container, Form, Modal, Table } from 'react-bootstrap';

const BASE_URL = 'https://www.system.crmkhitam.com/api/saleKit';

const SaleKitForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saleKits, setSaleKits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [userRole, setUserRole] = useState('');

  // ── Chỉ Admin và KTT Sale Manager được upload và xoá ─────────────────────
  const canUpload = userRole === 'Admin' || userRole === 'KTT Sale Manager';

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    fetchSaleKits();
  }, []);

  // ── GET /api/saleKit ──────────────────────────────────────────────────────
  const fetchSaleKits = async () => {
    try {
      const res = await axios.get(BASE_URL);
      setSaleKits(res.data);
    } catch (error) {
      console.error('Error fetching sale kits', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ── POST /api/saleKit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !file) {
      setMessage('Tên và file là bắt buộc!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);

    setIsLoading(true);
    try {
      await axios.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Upload thành công!');
      setName('');
      setDescription('');
      setFile(null);
      await fetchSaleKits();
      setShowForm(false);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  // ── DELETE /api/saleKit/:id ───────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá Sale Kit này?')) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setSaleKits((prev) => prev.filter((sk) => sk._id !== id));
      setMessage('Xoá thành công!');
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Xoá thất bại!');
    }
  };

  // ── GET /api/saleKit/download/:fileName ──────────────────────────────────
  const handleDownload = (fileName) => {
    axios({
      url: `${BASE_URL}/download/${fileName}`,
      method: 'GET',
      responseType: 'blob'
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        setMessage('Không thể tải file');
        console.error('Download error:', error);
      });
  };

  // ── GET /api/saleKit/read/:fileName ──────────────────────────────────────
  const handleViewContent = async (fileName) => {
    try {
      const response = await axios.get(`${BASE_URL}/read/${fileName}`, {
        responseType: 'text'
      });
      setFileContent(response.data);
      setShowModal(true);
    } catch (error) {
      setMessage('Không thể xem nội dung file');
      console.error('View error:', error);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Container className="mt-5">
      <h2 className="text-center">Quản Lý Sale Kit</h2>

      {message && (
        <Alert variant={message.includes('thành công') ? 'success' : 'danger'} dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {/* Chỉ Admin và KTT Sale Manager thấy nút Upload */}
      {canUpload && (
        <Button variant="primary" onClick={() => setShowForm(true)} className="mb-4">
          Upload file
        </Button>
      )}

      {/* ══ Modal Upload ════════════════════════════════════════════════════ */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Tên File</Form.Label>
              <Form.Control type="text" placeholder="Nhập tên sale kit" value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mb-3">
              <Form.Label>Mô Tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Chọn File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang Upload...' : 'Upload'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ══ Danh sách Sale Kits ══════════════════════════════════════════════ */}
      <h3 className="mt-5">Danh Sách Sale Kits</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Sale Kit</th>
            <th>Mô Tả</th>
            <th>Tải xuống</th>
            {/* Cột Thao tác chỉ hiện với Admin / KTT Sale Manager */}
            {canUpload && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {saleKits.length === 0 ? (
            <tr>
              <td colSpan={canUpload ? 5 : 4} className="text-center text-muted py-3">
                Chưa có Sale Kit nào
              </td>
            </tr>
          ) : (
            saleKits.map((saleKit, index) => (
              <tr key={saleKit._id}>
                <td>{index + 1}</td>
                <td>{saleKit.name}</td>
                <td>{saleKit.description}</td>
                <td>
                  <a href={`${BASE_URL}/download/${saleKit.file}`} target="_blank" rel="noopener noreferrer">
                    Tải về
                  </a>
                </td>
                {/* Nút Xoá — chỉ Admin / KTT Sale Manager */}
                {canUpload && (
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(saleKit._id)}>
                      🗑 Xoá
                    </Button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* ══ Modal xem nội dung ══════════════════════════════════════════════ */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xem Nội Dung</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre>{fileContent}</pre>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SaleKitForm;

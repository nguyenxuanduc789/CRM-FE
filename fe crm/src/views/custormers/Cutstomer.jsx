import 'react-toastify/dist/ReactToastify.css';

import React, { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { Button, Card, Col, Form, Modal, Row, Table, Spinner, ProgressBar } from 'react-bootstrap';
import { MdClose, MdUploadFile, MdDownload } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';

import { CREATE_CUSTOMER_URL, GETCONTACT_URL } from '../../config/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const IMPORT_EXCEL_URL = 'https://www.system.crmkhitam.com/api/v1/contact/importContactsFromExcel';
const SAMPLE_EXCEL_URL = '/import_khachhang_mau.xlsx'; // hoặc link tải file mẫu từ server

const Customer = () => {
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);

  // ── State import Excel ────────────────────────────────────────────────────
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    interactionLevel: 'Tư vấn lần 1',
    notes: '',
    city: '',
    country: 'Vietnam',
    birthDate: '',
    gender: '',
    ageGroup: '',
    occupation: '',
    facebookLink: '',
    customerSource: '',
    maritalStatus: 'Độc thân',
    numberOfChildren: 0,
    childrenAgeGroup: '',
    familyNotes: '',
    interests: {
      academy: {
        therapyCareer: {
          interestLevel: 'Cơ bản',
          careerGoals: '',
          startTime: ''
        },
        business: {
          model: '',
          scale: '',
          investmentCapital: '',
          educationExperience: ''
        }
      },
      healthHub: {
        therapyTreatment: {
          healthIssues: '',
          severityLevel: '',
          previousTreatments: ''
        },
        otherServices: ''
      },
      yogiShop: {
        interestedProducts: '',
        usagePurpose: ''
      },
      otherWishes: {
        internationalWork: {
          desiredCountries: '',
          workExperience: ''
        },
        migration: {
          desiredCountries: '',
          reasons: ''
        },
        childEducation: {
          childAge: '',
          issues: '',
          wishes: ''
        }
      }
    },
    consultantNotes: {
      initialImpression: '',
      hiddenNeeds: '',
      financialEstimate: '',
      consultationPlan: '',
      nextSteps: ''
    }
  });

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Vietnam');
  const [filteredCities, setFilteredCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingLocations(true);
        const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
        const apiData = response.data;
        if (apiData.error) {
          toast.error('Không tải được danh sách quốc gia!');
          return;
        }
        const sortedCountries = apiData.data.sort((a, b) => a.country.localeCompare(b.country));
        setCountries(sortedCountries);
        const vietnam = sortedCountries.find((c) => c.country === 'Vietnam');
        if (vietnam) {
          setSelectedCountry('Vietnam');
          setFilteredCities(vietnam.cities || []);
          setFormData((prev) => ({ ...prev, country: 'Vietnam', city: '' }));
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Lỗi kết nối API quốc gia!');
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry && countries.length > 0) {
      const selected = countries.find((c) => c.country === selectedCountry);
      if (selected) {
        setFilteredCities(selected.cities || []);
        setFormData((prev) => ({ ...prev, country: selectedCountry, city: '' }));
      } else {
        setFilteredCities([]);
      }
    }
  }, [selectedCountry, countries]);

  const [contacts, setContacts] = useState([]);
  const userId = localStorage.getItem('userId');
  const [refreshContacts, setRefreshContacts] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      axios
        .get(`${GETCONTACT_URL}/${userId}`)
        .then((response) => setContacts(response.data))
        .catch((error) => console.error('Error fetching contacts:', error));
    }
  }, [userId, refreshContacts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = name.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value || '' }));
  };

  const toggleView = () => setIsInputVisible((prevState) => !prevState);

  const [visibleSections, setVisibleSections] = useState({
    academy: true,
    healthHub: true,
    yogiShop: true,
    otherWishes: true
  });

  const handleCheckboxChange = (section) => {
    setVisibleSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const assignedTo = localStorage.getItem('userId');
    const data = { ...formData, assignedTo };
    try {
      await axios.post(CREATE_CUSTOMER_URL, data);
      toast.success('Thông tin khách hàng đã được tạo thành công!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        interactionLevel: 'Tư vấn lần 1',
        notes: '',
        city: '',
        country: '',
        birthDate: '',
        gender: ''
      });
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Thông tin khách hàng đã có trên hệ thống!');
    }
  };

  // ── Xử lý import Excel ────────────────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // ── Xử lý import Excel ────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = '';

    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file .xlsx hoặc .xls!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn! Tối đa 5MB.');
      return;
    }

    setImporting(true);

    const formPayload = new FormData();
    formPayload.append('file', file); // ← Giữ nguyên 'file'
    formPayload.append('assignedTo', userId || localStorage.getItem('userId'));

    try {
      console.log('📤 Đang gửi file:', file.name, 'với key: file');

      const response = await axios.post(IMPORT_EXCEL_URL, formPayload, {
        headers: {
          // KHÔNG set 'Content-Type' thủ công → để Axios tự xử lý boundary
        }
      });

      console.log('✅ Import thành công:', response.data);

      setImportResult(response.data);
      setShowImportModal(true);
      toast.success(`Import thành công: ${response.data.details?.success || 0} khách hàng!`);
      setRefreshContacts((prev) => !prev);
    } catch (error) {
      console.error('❌ Lỗi import chi tiết:', error.response?.data || error);
      const msg = error.response?.data?.message || 'Lỗi khi import file Excel!';
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  // ── Download file mẫu ─────────────────────────────────────────────────────
  const handleDownloadSample = () => {
    // Nếu có URL server thì dùng axios, hoặc link tĩnh
    const link = document.createElement('a');
    link.href = SAMPLE_EXCEL_URL;
    link.download = 'import_khachhang_mau.xlsx';
    link.click();
  };

  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };

  const handleAddRelationship = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      profileCode: fd.get('relativeProfileCode'),
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      relationship: fd.get('relationship'),
      interactionLevel: fd.get('interactionLevel'),
      notes: fd.get('notes'),
      city: fd.get('city'),
      country: fd.get('country'),
      birthDate: fd.get('birthDate'),
      assignedTo: localStorage.getItem('userId')
    };
    try {
      await axios.post(`https://www.system.crmkhitam.com/api/v1/contact/invalidEndpoint`, data);
      toast.success('Thêm mối quan hệ thành công!');
      handleCloseModal();
      setRefreshContacts((prev) => !prev);
    } catch (error) {
      console.error('Lỗi khi thêm mối quan hệ:', error);
      toast.error('Không thể thêm mối quan hệ. Vui lòng thử lại!');
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };
  const handleEditClose = () => {
    setSelectedContact(null);
    setShowEditModal(false);
  };

  const handleEditSave = async () => {
    try {
      if (!selectedContact.name || !selectedContact.email || !selectedContact.phone) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }
      if (selectedContact.birthDate && isNaN(new Date(selectedContact.birthDate))) {
        toast.error('Ngày sinh không hợp lệ!');
        return;
      }
      const { name, email, phone, birthDate, interactionLevel, notes, city, country } = selectedContact;
      await axios.put(`https://www.system.crmkhitam.com/api/v1/contact/contact/${selectedContact._id}`, {
        name,
        email,
        phone,
        birthDate,
        interactionLevel,
        notes,
        city,
        country,
        userId
      });
      toast.success('Cập nhật thành công!');
      setShowEditModal(false);
      setRefreshContacts((prev) => !prev);
    } catch (error) {
      console.error('Error updating contact:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin liên hệ.');
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedContact((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <React.Fragment>
      {/* ── Toolbar buttons ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Button variant="success" onClick={() => setShowForm(true)} style={{ backgroundColor: '#054a27', borderColor: '#054a27' }}>
          + Tạo Khách Hàng
        </Button>

        {/* ── Nút Import Excel ── */}
        <Button
          variant="primary"
          onClick={handleImportClick}
          disabled={importing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {importing ? (
            <>
              <Spinner animation="border" size="sm" /> Đang import...
            </>
          ) : (
            <>
              <MdUploadFile size={18} /> Import Excel
            </>
          )}
        </Button>

        {/* ── Nút tải file mẫu ── */}

        {/* Input file ẩn */}
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* ── Danh sách khách hàng ────────────────────────────────────────── */}
      {!showForm && (
        <>
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <Card.Title as="h5">Danh Sách Khách Hàng</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'center' }}>Mã hồ sơ</th>
                        <th style={{ textAlign: 'left' }}>Mối quan hệ</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                        <th style={{ textAlign: 'left' }}>Thông tin khách hàng</th>
                        <th>Ngày sinh</th>
                        <th style={{ textAlign: 'center' }}>Interaction Level</th>
                        <th>Note</th>
                        <th style={{ textAlign: 'left' }}>Thành phố</th>
                        <th style={{ textAlign: 'left' }}>Quốc gia</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'left' }}>Người tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact._id}>
                          <td style={{ textAlign: 'center' }}>{contact.profileCode}</td>
                          <td style={{ textAlign: 'left' }}>
                            {!contact.relativeProfileCode && (
                              <Button
                                variant="primary"
                                style={{ backgroundColor: '#054a27', borderColor: '#054a27', color: 'white' }}
                                onClick={() => handleShowModal(contact)}
                              >
                                Thêm Mối Quan Hệ
                              </Button>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Button variant="warning" onClick={() => handleEditClick(contact)}>
                              Edit
                            </Button>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <strong>Họ & Tên:</strong> {contact.name} <br />
                            <strong>Email:</strong> {contact.email} <br />
                            <strong>Phone:</strong> {contact.phone}
                          </td>
                          <td>{new Date(contact.birthDate).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'center' }}>{contact.interactionLevel}</td>
                          <td>{contact.notes}</td>
                          <td style={{ textAlign: 'left' }}>{contact.city}</td>
                          <td style={{ textAlign: 'left' }}>{contact.country}</td>
                          <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'center' }}>{contact.status}</td>
                          <td style={{ textAlign: 'left' }}>
                            {contact.assignedTo ? `${contact.assignedTo.lastname} ${contact.assignedTo.firstname}` : 'Chưa gán'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {selectedContact && (
                    <Modal show={showEditModal} onHide={handleEditClose}>
                      <Modal.Header closeButton>
                        <Modal.Title>Chỉnh Sửa Thông Tin</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form>
                          <Form.Group className="mb-2">
                            <Form.Label>Họ & Tên</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedContact.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={selectedContact.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedContact.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Ngày sinh</Form.Label>
                            <Form.Control
                              type="date"
                              value={
                                selectedContact.birthDate && !isNaN(new Date(selectedContact.birthDate))
                                  ? new Date(selectedContact.birthDate).toISOString().split('T')[0]
                                  : ''
                              }
                              onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Interaction Level</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedContact.interactionLevel || ''}
                              onChange={(e) => handleInputChange('interactionLevel', e.target.value)}
                            >
                              <option value="Tư vấn lần 1">Tư vấn lần 1</option>
                              <option value="Tư vấn lần 2">Tư vấn lần 2</option>
                              <option value="Đã thanh toán">Đã thanh toán</option>
                              <option value="Nợ">Nợ</option>
                              <option value="Tái mua hàng">Tái mua hàng</option>
                              <option value="VIP">VIP</option>
                              <option value="Thân thiết">Thân thiết</option>
                            </Form.Control>
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Ghi Chú</Form.Label>
                            <Form.Control
                              as="textarea"
                              value={selectedContact.notes || ''}
                              onChange={(e) => handleInputChange('notes', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Thành Phố</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedContact.city || ''}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Quốc Gia</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedContact.country || ''}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                            />
                          </Form.Group>
                        </Form>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleEditClose}>
                          Hủy
                        </Button>
                        <Button variant="primary" onClick={handleEditSave}>
                          Lưu Thay Đổi
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* ── Form tạo khách hàng ─────────────────────────────────────────── */}
      {showForm && (
        <Card>
          <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Card.Title as="h3">Thông Tin Khách Hàng - Khí Tâm Therapy</Card.Title>
            <Button
              style={{ backgroundColor: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
              onClick={() => setShowForm(false)}
            >
              <MdClose style={{ color: 'black', fontSize: '24px' }} />
            </Button>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Card.Title as="h5">I. Thông tin cá nhân:</Card.Title>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Địa chỉ email <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Nhập email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Họ & Tên <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Giới tính <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control as="select" name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="">Chọn giới tính</option>
                      <option>Nam</option>
                      <option>Nữ</option>
                      <option>Khác</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Ngày sinh <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Độ tuổi <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập độ tuổi (ví dụ: 25-34)"
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Số điện thoại <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <PhoneInput
                      placeholder="Ví dụ: +84987654321"
                      defaultCountry="VN"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      international
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Nghề nghiệp <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập nghề nghiệp"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Cấp độ tương tác <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control as="select" name="interactionLevel" value={formData.interactionLevel} onChange={handleChange}>
                      <option>Tư vấn lần 1</option>
                      <option>Tư vấn lần 2</option>
                      <option>Nợ</option>
                      <option>Tái mua hàng</option>
                      <option>VIP</option>
                      <option>Thân thiết</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      placeholder="Nhập ghi chú thêm"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Quốc gia <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    {loadingLocations ? (
                      <Form.Control type="text" placeholder="Đang tải danh sách quốc gia..." disabled />
                    ) : (
                      <Form.Control as="select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} required>
                        <option value="">Chọn quốc gia</option>
                        {countries.map((c, index) => (
                          <option key={index} value={c.country}>
                            {c.country}
                          </option>
                        ))}
                      </Form.Control>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Thành phố <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    {isInputVisible ? (
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Nhập tên thành phố"
                      />
                    ) : (
                      <Form.Control
                        as="select"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        disabled={loadingLocations || filteredCities.length === 0}
                      >
                        <option value="">Chọn thành phố</option>
                        {filteredCities.map((city, index) => (
                          <option key={index} value={city}>
                            {city}
                          </option>
                        ))}
                      </Form.Control>
                    )}
                  </Form.Group>
                  <Button variant="secondary" className="mb-3" onClick={toggleView}>
                    {isInputVisible ? 'Cho chọn thành phố' : 'Cho nhập thành phố'}
                  </Button>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Nguồn khách <span style={{ color: 'red' }}>(*)</span>
                    </Form.Label>
                    <Form.Control as="select" name="customerSource" value={formData.customerSource} onChange={handleChange} required>
                      <option value="">Chọn nguồn khách</option>
                      <option>Facebook</option>
                      <option>Website</option>
                      <option>Quảng cáo</option>
                      <option>Giới thiệu</option>
                      <option>Khác</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Link Facebook</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập link Facebook"
                      name="facebookLink"
                      value={formData.facebookLink}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Card.Title as="h5">II. Thông tin gia đình:</Card.Title>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tình trạng hôn nhân</Form.Label>
                    <Form.Control as="select" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                      <option value="Độc thân">Độc thân</option>
                      <option value="Đã kết hôn">Đã kết hôn</option>
                      <option value="Ly hôn">Ly hôn</option>
                      <option value="Khác">Khác</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Thông tin thêm về gia đình</Form.Label>
                    <Form.Control as="textarea" rows={3} name="familyNotes" value={formData.familyNotes} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <Card.Title as="h5">III. Nhu cầu và mong muốn:</Card.Title>
              <Row>
                <Form.Group>
                  <Form.Label style={{ fontSize: '18px', fontWeight: 'bold', color: '#054a27' }}>
                    1. Quan tâm đến Khí Tâm Academy:
                  </Form.Label>
                  {visibleSections.academy && (
                    <Row>
                      <Col md={6}>
                        <Form.Check
                          type="checkbox"
                          label="Học nghề Khí Tâm Trị Liệu"
                          onChange={() => handleCheckboxChange('therapyCareer')}
                        />
                        {visibleSections.therapyCareer && (
                          <>
                            <h5>Học nghề Khí Tâm Trị Liệu:</h5>
                            <Form.Group className="mb-3">
                              <Form.Label>Cấp độ quan tâm</Form.Label>
                              <Form.Control
                                as="select"
                                name="interests.academy.therapyCareer.interestLevel"
                                value={formData.interests.academy.therapyCareer.interestLevel}
                                onChange={handleChange}
                              >
                                <option value="Cơ bản">Cơ bản</option>
                                <option value="Nâng cao">Nâng cao</option>
                                <option value="Chuyên sâu">Chuyên sâu</option>
                              </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Mục tiêu học nghề</Form.Label>
                              <Form.Control
                                as="select"
                                name="interests.academy.therapyCareer.careerGoals"
                                value={formData.interests.academy.therapyCareer.careerGoals}
                                onChange={handleChange}
                              >
                                <option value="Phát triển bản thân">Phát triển bản thân</option>
                                <option value="Hỗ trợ người thân">Hỗ trợ người thân</option>
                                <option value="Thay đổi nghề nghiệp">Thay đổi nghề nghiệp</option>
                                <option value="Khác">Khác</option>
                              </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Thời gian dự kiến bắt đầu học</Form.Label>
                              <Form.Control
                                type="text"
                                name="interests.academy.therapyCareer.startTime"
                                value={formData.interests.academy.therapyCareer.startTime}
                                onChange={handleChange}
                                placeholder="Nhập thời gian dự kiến bắt đầu học"
                              />
                            </Form.Group>
                          </>
                        )}
                      </Col>
                      <Col md={6}>
                        <Form.Check type="checkbox" label="Kinh doanh ngành đào tạo" onChange={() => handleCheckboxChange('business')} />
                        {visibleSections.business && (
                          <>
                            <h5>Kinh doanh ngành đào tạo:</h5>
                            <Form.Group className="mb-3">
                              <Form.Label>Mô hình quan tâm</Form.Label>
                              <Form.Control
                                as="select"
                                name="interests.academy.business.model"
                                value={formData.interests.academy.business.model}
                                onChange={handleChange}
                              >
                                <option value="Nhượng quyền thương hiệu">Nhượng quyền thương hiệu</option>
                                <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
                              </Form.Control>
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Quy mô dự kiến</Form.Label>
                              <Form.Control
                                type="text"
                                name="interests.academy.business.scale"
                                value={formData.interests.academy.business.scale}
                                onChange={handleChange}
                                placeholder="Nhập quy mô dự kiến"
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Vốn đầu tư dự kiến</Form.Label>
                              <Form.Control
                                type="text"
                                name="interests.academy.business.investmentCapital"
                                value={formData.interests.academy.business.investmentCapital}
                                onChange={handleChange}
                                placeholder="Nhập vốn đầu tư dự kiến"
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label>Kinh nghiệm trong lĩnh vực giáo dục (nếu có)</Form.Label>
                              <Form.Control
                                type="text"
                                name="interests.academy.business.educationExperience"
                                value={formData.interests.academy.business.educationExperience}
                                onChange={handleChange}
                                placeholder="Nhập kinh nghiệm (nếu có)"
                              />
                            </Form.Group>
                          </>
                        )}
                      </Col>
                    </Row>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label style={{ fontSize: '15px', fontWeight: 'bold', color: '#054a27' }}>
                    2. Quan tâm đến Khí Tâm Health Hub:
                  </Form.Label>
                  {visibleSections.healthHub && (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Chữa bệnh bằng Khí Tâm Trị Liệu"
                            onChange={() => handleCheckboxChange('therapyTreatment')}
                          />
                          {visibleSections.therapyTreatment && (
                            <>
                              <Form.Group className="mb-3">
                                <Form.Label>Vấn đề sức khỏe quan tâm</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="interests.healthHub.therapyTreatment.healthIssues"
                                  value={formData.interests.healthHub.therapyTreatment.healthIssues}
                                  onChange={handleChange}
                                  placeholder="Nhập vấn đề sức khỏe quan tâm"
                                />
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>Mức độ nghiêm trọng</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="interests.healthHub.therapyTreatment.severityLevel"
                                  value={formData.interests.healthHub.therapyTreatment.severityLevel}
                                  onChange={handleChange}
                                  placeholder="Nhập mức độ nghiêm trọng"
                                />
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>Đã từng điều trị bằng phương pháp khác (nếu có)</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="interests.healthHub.therapyTreatment.previousTreatments"
                                  value={formData.interests.healthHub.therapyTreatment.previousTreatments}
                                  onChange={handleChange}
                                  placeholder="Nhập thông tin điều trị trước đây"
                                />
                              </Form.Group>
                            </>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Các dịch vụ khác tại Health Hub"
                            onChange={() => handleCheckboxChange('otherServices')}
                          />
                          {visibleSections.otherServices && (
                            <Form.Group className="mb-3">
                              <Form.Label>Dịch vụ khác tại Health Hub (nếu có)</Form.Label>
                              <Form.Control
                                type="text"
                                name="interests.healthHub.otherServices"
                                value={formData.interests.healthHub.otherServices}
                                onChange={handleChange}
                                placeholder="Nhập các dịch vụ khác tại Health Hub"
                              />
                            </Form.Group>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label style={{ fontSize: '15px', fontWeight: 'bold', color: '#054a27' }}>3. Quan tâm đến The Yogishop:</Form.Label>
                  {visibleSections.yogiShop && (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Sản phẩm quan tâm</Form.Label>
                          <Form.Control
                            type="text"
                            name="interests.yogiShop.interestedProducts"
                            value={formData.interests.yogiShop.interestedProducts}
                            onChange={handleChange}
                            placeholder="Nhập sản phẩm quan tâm"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Mục đích sử dụng</Form.Label>
                          <Form.Control
                            type="text"
                            name="interests.yogiShop.usagePurpose"
                            value={formData.interests.yogiShop.usagePurpose}
                            onChange={handleChange}
                            placeholder="Nhập mục đích sử dụng"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </Form.Group>

                <Form.Group>
                  {visibleSections.otherWishes && (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '15px', fontWeight: 'bold', color: '#054a27' }}>
                              4. Các mong muốn khác khi đồng hành cùng Khí Tâm:
                            </Form.Label>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Check
                                  type="checkbox"
                                  label="Làm việc quốc tế trong lĩnh vực Khí Tâm Trị Liệu"
                                  onChange={() => handleCheckboxChange('internationalWork')}
                                />
                                {visibleSections.internationalWork && (
                                  <>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Quốc gia mong muốn</Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="interests.otherWishes.internationalWork.desiredCountries"
                                        value={formData.interests.otherWishes.internationalWork.desiredCountries}
                                        onChange={handleChange}
                                        placeholder="Nhập quốc gia mong muốn"
                                      />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Kinh nghiệm làm việc quốc tế (nếu có)</Form.Label>
                                      <Form.Control
                                        type="text"
                                        name="interests.otherWishes.internationalWork.workExperience"
                                        value={formData.interests.otherWishes.internationalWork.workExperience}
                                        onChange={handleChange}
                                        placeholder="Nhập kinh nghiệm làm việc quốc tế"
                                      />
                                    </Form.Group>
                                  </>
                                )}
                              </Form.Group>
                            </Col>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              label="Định cư các quốc gia phát triển"
                              onChange={() => handleCheckboxChange('migration')}
                            />
                            {visibleSections.migration && (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label>Quốc gia mong muốn</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="interests.otherWishes.migration.desiredCountries"
                                    value={formData.interests.otherWishes.migration.desiredCountries}
                                    onChange={handleChange}
                                    placeholder="Nhập quốc gia mong muốn"
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Lý do định cư</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="interests.otherWishes.migration.reasons"
                                    value={formData.interests.otherWishes.migration.reasons}
                                    onChange={handleChange}
                                    placeholder="Nhập lý do định cư"
                                  />
                                </Form.Group>
                              </>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              label="Tư vấn định hướng giáo dục cho con"
                              onChange={() => handleCheckboxChange('childEducation')}
                            />
                            {visibleSections.childEducation && (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label>Độ tuổi con</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="interests.otherWishes.childEducation.childAge"
                                    value={formData.interests.otherWishes.childEducation.childAge}
                                    onChange={handleChange}
                                    placeholder="Nhập độ tuổi con"
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Vấn đề gặp phải</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="interests.otherWishes.childEducation.issues"
                                    value={formData.interests.otherWishes.childEducation.issues}
                                    onChange={handleChange}
                                    placeholder="Nhập vấn đề gặp phải"
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label>Mong muốn cho con</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="interests.otherWishes.childEducation.wishes"
                                    value={formData.interests.otherWishes.childEducation.wishes}
                                    onChange={handleChange}
                                    placeholder="Nhập mong muốn cho con"
                                  />
                                </Form.Group>
                              </>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}
                </Form.Group>
              </Row>

              <Card.Title as="h5">IV. Ghi chú của TVV:</Card.Title>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ấn tượng ban đầu về khách hàng</Form.Label>
                    <Form.Control
                      type="text"
                      name="consultantNotes.initialImpression"
                      value={formData.consultantNotes.initialImpression}
                      onChange={handleChange}
                      placeholder="Nhập ấn tượng ban đầu"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Nhu cầu tiềm ẩn của khách hàng</Form.Label>
                    <Form.Control
                      type="text"
                      name="consultantNotes.hiddenNeeds"
                      value={formData.consultantNotes.hiddenNeeds}
                      onChange={handleChange}
                      placeholder="Nhập nhu cầu tiềm ẩn"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Khả năng tài chính (ước tính)</Form.Label>
                    <Form.Control
                      type="text"
                      name="consultantNotes.financialEstimate"
                      value={formData.consultantNotes.financialEstimate}
                      onChange={handleChange}
                      placeholder="Nhập khả năng tài chính"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phương án tư vấn phù hợp</Form.Label>
                    <Form.Control
                      type="text"
                      name="consultantNotes.consultationPlan"
                      value={formData.consultantNotes.consultationPlan}
                      onChange={handleChange}
                      placeholder="Nhập phương án tư vấn phù hợp"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Các bước tiếp theo</Form.Label>
                    <Form.Control
                      type="text"
                      name="consultantNotes.nextSteps"
                      value={formData.consultantNotes.nextSteps}
                      onChange={handleChange}
                      placeholder="Nhập các bước tiếp theo"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Button
                  variant="success"
                  type="submit"
                  style={{
                    fontSize: '15px',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    backgroundColor: '#054a27',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Gửi
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* ── Modal Thêm Mối Quan Hệ ──────────────────────────────────────── */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm Mối Quan Hệ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddRelationship}>
            <Form.Group className="mb-2">
              <Form.Label>Mã người thân</Form.Label>
              <Form.Control type="text" name="relativeProfileCode" defaultValue={selectedContact?.profileCode || ''} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control type="text" name="name" placeholder="Nhập họ và tên" required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" placeholder="Nhập email" required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control type="text" name="phone" placeholder="Nhập số điện thoại" required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mối quan hệ</Form.Label>
              <Form.Control as="select" name="relationship" required>
                <option value="">Chọn loại mối quan hệ</option>
                <option value="Vợ/Chồng">Vợ/Chồng</option>
                <option value="Con">Con</option>
                <option value="Bố/Mẹ">Bố/Mẹ</option>
                <option value="Khác">Khác</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cấp độ tương tác</Form.Label>
              <Form.Control as="select" name="interactionLevel" required>
                <option value="">Chọn cấp độ tương tác</option>
                <option value="Tư vấn lần 1">Tư vấn lần 1</option>
                <option value="Tư vấn lần 2">Tư vấn lần 2</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Nợ">Nợ</option>
                <option value="Tái mua hàng">Tái mua hàng</option>
                <option value="VIP">VIP</option>
                <option value="Thân thiết">Thân thiết</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control as="textarea" name="notes" placeholder="Nhập ghi chú (nếu có)" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Thành phố</Form.Label>
              <Form.Control type="text" name="city" placeholder="Nhập thành phố" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Quốc gia</Form.Label>
              <Form.Control type="text" name="country" defaultValue="Vietnam" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control type="date" name="birthDate" />
            </Form.Group>
            <Button type="submit" variant="success">
              Tạo mới
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ── Modal kết quả import ─────────────────────────────────────────── */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📊 Kết quả Import Excel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {importResult && (
            <>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                >
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>{importResult.details?.success || 0}</div>
                  <div style={{ color: '#555', fontSize: '14px' }}>✅ Thành công</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#fff3e0',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    minWidth: '140px'
                  }}
                >
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e65100' }}>{importResult.details?.skipped || 0}</div>
                  <div style={{ color: '#555', fontSize: '14px' }}>⚠️ Bỏ qua</div>
                </div>
              </div>

              <ProgressBar style={{ marginBottom: '16px', height: '10px' }}>
                <ProgressBar
                  variant="success"
                  now={importResult.details?.success || 0}
                  max={(importResult.details?.success || 0) + (importResult.details?.skipped || 0)}
                  label={`${importResult.details?.success || 0} thành công`}
                  key={1}
                />
                <ProgressBar
                  variant="warning"
                  now={importResult.details?.skipped || 0}
                  max={(importResult.details?.success || 0) + (importResult.details?.skipped || 0)}
                  label={`${importResult.details?.skipped || 0} bỏ qua`}
                  key={2}
                />
              </ProgressBar>

              {importResult.details?.errors?.length > 0 && (
                <>
                  <h6 style={{ color: '#c62828', marginBottom: '8px' }}>Chi tiết lỗi / bỏ qua:</h6>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
                    <Table size="sm" bordered hover style={{ marginBottom: 0, fontSize: '13px' }}>
                      <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ width: '70px' }}>Dòng</th>
                          <th>Tên</th>
                          <th>SĐT</th>
                          <th>Lý do</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.details.errors.map((err, idx) => (
                          <tr key={idx}>
                            <td>{err.row}</td>
                            <td>{err.name || '—'}</td>
                            <td>{err.phone || '—'}</td>
                            <td style={{ color: err.reason === 'Đã tồn tại' ? '#e65100' : '#c62828' }}>{err.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </React.Fragment>
  );
};

export default Customer;

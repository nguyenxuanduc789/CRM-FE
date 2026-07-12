import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import logo from '../../../assets/images/user/logo.png';

const SignUp1 = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    region: 'Việt Nam', // Mặc định Việt Nam
    province: '',
    team: '',
    profileDetails: {
      dateOfBirth: '',
      bio: '',
      education: '',
      certifications: '',
      experiences: '',
      motto: '',
      address: '',
      phone: ''
    }
  });

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]); // Lưu danh sách tỉnh thành

  // Gọi API lấy danh sách tỉnh thành khi chọn Việt Nam
  useEffect(() => {
    if (formData.region === 'Việt Nam') {
      fetchProvinces();
    } else {
      setProvinces([]); // Xóa danh sách tỉnh thành nếu không phải Việt Nam
    }
  }, [formData.region]);

  // Hàm gọi API để lấy tỉnh thành
  const fetchProvinces = async () => {
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tỉnh thành:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    if (child) {
      setFormData((prevState) => ({
        ...prevState,
        [parent]: { ...prevState[parent], [child]: value }
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      // Hiển thị alert khi mật khẩu không khớp
      alert('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/admin/create-users', formData);
      // Hiển thị alert khi đăng ký thành công
      alert('Đăng ký thành công!');
      setFormData({
        email: '',
        firstname: '',
        lastname: '',
        password: '',
        confirmPassword: '',
        region: 'Việt Nam', // Reset mặc định
        province: '',
        team: '',
        profileDetails: {
          dateOfBirth: '',
          bio: '',
          education: '',
          certifications: '',
          experiences: '',
          motto: '',
          address: '',
          phone: ''
        }
      });
    } catch (error) {
      // Hiển thị alert khi có lỗi xảy ra
      alert(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content">
        <Card className="borderless">
          <Row className="align-items-center">
            <Col>
              <Card.Body>
                <div className="text-center mb-4">
                  <img src={logo} alt="KT Therapy Icon" style={{ width: '100px', height: '100px' }} />
                </div>
                <h3 className="text-center mb-4">Đăng ký</h3>

                {statusMessage.text && <Alert variant={statusMessage.type}>{statusMessage.text}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Alert variant="info" className="mt-3">
                    Lưu ý: Vui lòng ghi nhớ <strong>Email</strong> và <strong>Mật khẩu</strong> để đăng nhập sau này!
                  </Alert>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      name="profileDetails.phone"
                      placeholder="Số điện thoại"
                      value={formData.profileDetails.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          name="lastname"
                          placeholder="Họ"
                          value={formData.lastname}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          name="firstname"
                          placeholder="Tên"
                          value={formData.firstname}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="date"
                        name="profileDetails.dateOfBirth"
                        placeholder="Ngày sinh"
                        value={formData.profileDetails.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quốc gia</Form.Label>
                        <Form.Select name="region" value={formData.region} onChange={handleChange} required>
                          <option value="">Chọn quốc gia</option>
                          <option value="Việt Nam">Việt Nam</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tỉnh/Thành phố</Form.Label>
                        <Form.Select name="province" value={formData.province} onChange={handleChange} required>
                          <option value="">Chọn tỉnh/thành phố</option>
                          {provinces.map((province) => (
                            <option key={province.code} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        name="profileDetails.address"
                        placeholder="Địa chỉ"
                        value={formData.profileDetails.address}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Row>
                  {/* Thêm trường "team" */}

                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      name="profileDetails.bio"
                      placeholder="Giới thiệu bản thân"
                      value={formData.profileDetails.bio}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      name="profileDetails.education"
                      placeholder="Học vấn và bằng cấp"
                      value={formData.profileDetails.education}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      name="profileDetails.experiences"
                      placeholder="Kinh nghiệm làm việc"
                      value={formData.profileDetails.experiences}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      name="profileDetails.motto"
                      placeholder="Câu nói tâm đắc"
                      value={formData.profileDetails.motto}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Bạn thuộc đội ngũ nào</Form.Label>
                    <Form.Select name="team" value={formData.team} onChange={handleChange} required>
                      <option value="">Chọn đội ngũ</option>
                      <option value="Đội ngũ Khí Tâm Sale Leaders">Đội ngũ Khí Tâm Sale Leaders</option>
                      <option value="Đội ngũ Cộng tác viên">Đội ngũ Cộng tác viên</option>
                    </Form.Select>
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={loading} className="w-100">
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                  </Button>
                </Form>
                <p className="text-center mt-3">
                  Bạn đã có tài khoản? <NavLink to="/auth/signin-1">Đăng nhập</NavLink>
                </p>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default SignUp1;

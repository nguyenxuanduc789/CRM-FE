import React from 'react';

import axios from 'axios';
import { Formik } from 'formik';
import {
  Alert,
  Button,
  Col,
  Row
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { LOGIN_URL } from '../../../config/api.js';

const JWTLogin = () => {
  const navigate = useNavigate();
  const handleLogin = async (values, { setErrors, setSubmitting }) => {
    try {
      // Gửi yêu cầu đến API với LOGIN_URL
      const response = await axios.post(LOGIN_URL, {
        email: values.email,
        password: values.password
      });

      // Xử lý kết quả trả về

      // Lưu access_token vào localStorage
      const { access_token, role, userId, firstnames, lastnames, employeeCodes } = response.data.data; // Truy cập access_token từ phản hồi
      localStorage.setItem('role', role);
      localStorage.setItem('accessToken', access_token.accessToken); // Lưu token vào localStorage
      localStorage.setItem('refreshToken', access_token.refreshToken); // Lưu refresh token nếu cần
      localStorage.setItem('userId', userId);
      localStorage.setItem('firstnames', firstnames);
      localStorage.setItem('lastnames', lastnames);
      localStorage.setItem('employeeCode', employeeCodes);
      setSubmitting(false);
      navigate('/app/dashboard/home');
    } catch (error) {
      if (error.response?.status === 401) {
        // Nếu mã lỗi là 401, thông báo lỗi là 'Invalid email or password'
        setErrors({
          submit: 'Invalid email or password'
        });
      } else {
        // Nếu lỗi khác, sử dụng thông điệp mặc định hoặc thông điệp lỗi từ API
        setErrors({
          submit: error.response?.data?.message || 'An error occurred during login'
        });
      }
      setSubmitting(false);
    }
  };
  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={handleLogin}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              className="form-control"
              label="Email Address / Username"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              value={values.email}
              placeholder="Enter your email"
            />
            {touched.email && errors.email && <small className="text-danger form-text">{errors.email}</small>}
          </div>
          <div className="form-group mb-4">
            <input
              className="form-control"
              label="Password"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
              placeholder="Password"
            />
            {touched.password && errors.password && <small className="text-danger form-text">{errors.password}</small>}
          </div>

          <div className="custom-control custom-checkbox text-start mb-4 mt-2">
            <input type="checkbox" className="custom-control-input mx-2" id="customCheck1" />
            <label className="custom-control-label" htmlFor="customCheck1">
              Save credentials.
            </label>
          </div>

          {errors.submit && (
            <Col sm={12}>
              <Alert variant="danger">{errors.submit}</Alert>
            </Col>
          )}
          <Row>
            <Col mt={2}>
              <Button className="btn-block mb-4" color="primary" disabled={isSubmitting} size="large" type="submit" variant="primary">
                Signin
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default JWTLogin;

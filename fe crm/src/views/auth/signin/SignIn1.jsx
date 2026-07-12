import React from 'react';

import { Card } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';
import AuthLogin from './JWTLogin';
import logo from '../../../assets/images/user/logo.png';
const Signin1 = () => {
  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless text-center">
            <Card.Body>
            <div className="mb-4">
              <img
                src={logo} // Đường dẫn bắt đầu từ thư mục public
                alt="auth-icon"
                style={{
                  width: '110px',      // Chiều rộng của hình ảnh
                  height: '110px',     // Chiều cao của hình ảnh
                  objectFit: 'contain', // Đảm bảo hình ảnh không bị méo
                  display: 'block',    // Hiển thị dưới dạng khối
                  margin: 'auto'       // Căn giữa
                }}
              />
            </div>
              <AuthLogin />
              {/* <p className="mb-2 text-muted">
                Forgot password?{' '}
                <NavLink to={'#'} className="f-w-400">
                  Reset
                </NavLink>
              </p> */}
             <p className="mb-0 text-muted">
                Bạn chưa có tài khoản?{' '}
                <NavLink to="/auth/signup-1" className="f-w-400">
                  Đăng ký
                </NavLink>
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;

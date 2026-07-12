import React, {
  useEffect,
  useState
} from 'react';

import {
  Dropdown,
  ListGroup
} from 'react-bootstrap';

import useWindowSize from '../../../../hooks/useWindowSize';
import NavSearch from './NavSearch';

const NavLeft = () => {
  const windowSize = useWindowSize();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    role: '',
    employeeCode: '' // Thêm mã nhân viên
  });

  useEffect(() => {
    // Lấy dữ liệu họ, tên và vai trò từ localStorage
    const storedFirstName = localStorage.getItem('firstnames') || '';
    const storedLastName = localStorage.getItem('lastnames') || '';
    const storedRole = localStorage.getItem('role') || '';
    const storedEmployeeCode = localStorage.getItem('employeeCode') || '';
    setUser({
      firstName: storedFirstName,
      lastName: storedLastName,
      role: storedRole,
      employeeCode: storedEmployeeCode
    });
  }, []);

  let navItemClass = ['nav-item'];
  if (windowSize.width <= 575) {
    navItemClass = [...navItemClass, 'd-none'];
  }

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav mr-auto">
        <ListGroup.Item as="li" bsPrefix=" " className={navItemClass.join(' ')}>
          <Dropdown align={'start'}>
            <Dropdown.Toggle variant={'link'} id="dropdown-basic" className="text-decoration-none">
              <span>Xin chào </span>
              <span className="fw-bold">{user.role}</span> -
              <span className="fw-bold">
                {user.lastName} {user.firstName}
              </span>
              (<span className="fw-bold">{user.employeeCode}</span>)
            </Dropdown.Toggle>
          </Dropdown>
        </ListGroup.Item>
        <ListGroup.Item as="li" bsPrefix=" " className="nav-item">
          <NavSearch windowWidth={windowSize.width} />
        </ListGroup.Item>
      </ListGroup>
    </React.Fragment>
  );
};

export default NavLeft;

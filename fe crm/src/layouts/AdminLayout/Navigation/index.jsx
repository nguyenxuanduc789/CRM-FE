import React, { useContext } from 'react';

import { ConfigContext } from '../../../contexts/ConfigContext';
import useWindowSize from '../../../hooks/useWindowSize';
import navigation from '../../../menu-items';
import NavContent from './NavContent';
import NavLogo from './NavLogo';

const Navigation = () => {
  const configContext = useContext(ConfigContext);
  const { collapseMenu } = configContext.state;
  const windowSize = useWindowSize();
  const role = localStorage.getItem('role'); // Lấy vai trò người dùng từ localStorage

  let navClass = ['pcoded-navbar'];
  navClass = [...navClass];

  if (windowSize.width < 992 && collapseMenu) {
    navClass = [...navClass, 'mob-open'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  // Lọc menu items theo vai trò
  const filteredItems = navigation.items.filter((item) => {
    // Kiểm tra nếu vai trò người dùng không phải là 'admin' thì ẩn menu "Quản lý hệ thống phân phối"
    if (item.title === 'Quản lý hệ thống phân phối' && role !== 'Admin') {
      return false; // Không hiển thị mục này
    }
    if (item.title === 'Quản lý nhân viên & chấm công' && role !== 'Admin') {
      return false; // Không hiển thị mục này
    }
    if (item.title === 'Quản lý lịch hẹn & booking' && role !== 'Admin') {
      return false; // Không hiển thị mục này
    }
    if (item.id === 'taichinh' && role !== 'Admin' && role !== 'Accountant') {
      return false; // Không hiển thị mục này
    }
    if (item.id === 'quantrihethong' && role !== 'Admin' && role !== 'KTT Sale Team Leader' && role !== 'KTT Sale Manager') {
      return false; // Không hiển thị mục này
    }
    if (item.id === 'portaldata' && role !== 'Admin' && role !== 'Aca_Specialis' && role !== 'Cust_service' && role !== 'Hub Specialist') {
      return false; // Không hiển thị mục này
    }
    
    if (
      item.id === 'reportacademy' &&
      role !== 'Admin' &&
      role !== 'Aca_Specialis' &&
      role !== 'Cust_service ' &&
      role !== 'Hub Specialist ' &&
      role !== 'Accountant '
    ) {
      return false; // Không hiển thị mục này
    }
    if (item.id === 'customers' && (role === 'KTT User' || role === 'Accountant'|| role === 'KTT Partner')) {
      return false; // Không hiển thị mục này cho vai trò 'KTT User' hoặc 'Admin'
    }

    if (
      item.id === 'congvieckpi' &&
      (role === 'Aca_Specialis' || role === 'Cust_service' || role === 'Hub Specialist' || role === 'Accountant')
    ) {
      return false; // Không hiển thị mục này nếu vai trò là 'Aca_Specialis' hoặc 'New_Role'
    }
    if (
      item.id === 'cus-tomers' &&
      (role === 'Aca_Specialis' || role === 'Cust_service' || role === 'Hub Specialist' || role === 'Accountant')
    ) {
      return false; // Không hiển thị mục này nếu vai trò là 'Aca_Specialis' hoặc 'New_Role'
    }

    // if (item.id === 'customers' && (role === 'Aca_Specialis' || role === 'Cust_service')) {
    //   return false; // Không hiển thị mục này nếu vai trò là 'Aca_Specialis' hoặc 'New_Role'
    // }
    if (item.id === 'ui-forms' && role !== 'Admin') {
      return false; // Không hiển thị mục này
    }
    if (item.id === 'pages' && role !== 'Admin') {
      return false; // Không hiển thị mục này
    }
    return true; // Hiển thị các mục khác
  });

  let navBarClass = ['navbar-wrapper'];

  let navContent = (
    <div className={navBarClass.join(' ')}>
      <NavLogo />
      <NavContent navigation={filteredItems} /> {/* Truyền filteredItems thay vì navigation.items */}
    </div>
  );

  if (windowSize.width < 992) {
    navContent = (
      <div className="navbar-wrapper">
        <NavLogo />
        <NavContent navigation={filteredItems} />
      </div>
    );
  }

  return (
    <React.Fragment>
      <nav className={navClass.join(' ')}>{navContent}</nav>
    </React.Fragment>
  );
};

export default Navigation;

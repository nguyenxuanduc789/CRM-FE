import React from 'react';

import Reportcontact from './reportcontact';

const AdminPage = () => {
  const role = localStorage.getItem('role'); // Lấy vai trò từ localStorage

  return (
    <div>
      {/* Kiểm tra nếu là Admin hoặc KTT Sale Manager hoặc KTT Sale Team Leader */}
      {(role === 'Admin' || role === 'KTT Sale Manager' || role === 'KTT Sale Team Leader') && (
        <>
          <Reportcontact />
          <Reportcontact />
        </>
      )}
    </div>
  );
};

export default AdminPage;

import React from "react";
import PendingUsersTable from "./PendingUserList";
import UserSearch from "./UserSearch";

const AdminPage = () => {
  const role = localStorage.getItem("role"); // Lấy vai trò từ localStorage

  return (
    <div>
      {role === "Admin" && (
        <>
          <PendingUsersTable />
          <UserSearch />
        </>
      )}
      {role === "KTT Sale Manager" && <PendingUsersTable />}
      {role === "KTT Sale Team Leader" && <UserSearch />}
    </div>
  );
};

export default AdminPage;

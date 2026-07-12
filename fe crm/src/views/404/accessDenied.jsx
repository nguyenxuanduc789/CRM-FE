import React from "react";

const AccessDenied = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>403 - Truy cập bị từ chối</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "20px" }}>
        Bạn không có quyền truy cập vào trang này.
      </p>
    
    </div>
  );
};

export default AccessDenied;

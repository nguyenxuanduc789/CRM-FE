import React, { useEffect, useState } from "react";
import { Card, Table, Spinner } from "react-bootstrap";
import axios from "axios";

const AffiliateLeadsTable = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:3056/api/v1/affiliate-leads");
        console.log("API Response:", response.data);
        if (response.data && response.data.success) {
          // Fallback to array if undefined
          const data = response.data.leads || [];
          setLeads(data);
        }
      } catch (error) {
        console.error("Error fetching affiliate leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  console.log("Render leads length:", leads.length);

  return (
    <Card>
      <Card.Header>
        <Card.Title as="h5">Khách hàng Đắc Sư (Affiliate Leads)</Card.Title>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Mã CTV</th>
                <th>Tên CTV</th>
                <th>Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.fullName}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone || "-"}</td>
                    <td>{lead.affiliateCode}</td>
                    <td>{lead.affiliateName || "-"}</td>
                    <td>{new Date(lead.createdAt).toLocaleString("vi-VN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    Chưa có dữ liệu khách hàng
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default AffiliateLeadsTable;

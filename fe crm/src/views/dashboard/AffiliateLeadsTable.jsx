import React, { useEffect, useState } from "react";
import { Card, Table } from "react-bootstrap";
import axios from "axios";
import { API_URL } from "../../config/constant";

const AffiliateLeadsTable = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${API_URL}/affiliate-leads`);
        if (response.data.success) {
          setLeads(response.data.leads);
        }
      } catch (error) {
        console.error("Error fetching affiliate leads:", error);
      }
    };

    fetchLeads();
  }, []);

  return (
    <Card>
      <Card.Header>
        <Card.Title as="h5">Khách hàng Đắc Sư (Affiliate Leads)</Card.Title>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Mã CTV (Affiliate)</th>
              <th>Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.fullName}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone || "-"}</td>
                  <td>{lead.affiliateCode}</td>
                  <td>{new Date(lead.createdAt).toLocaleString("vi-VN")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Chưa có dữ liệu khách hàng
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default AffiliateLeadsTable;

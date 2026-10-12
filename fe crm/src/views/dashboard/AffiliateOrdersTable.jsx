import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Badge } from "react-bootstrap";
import axios from "axios";

const fmtNum = (v) => (v || 0).toLocaleString("vi-VN");

const AffiliateOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3056/api/v1/affiliate-leads/orders");
        if (response.data && response.data.success) {
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching affiliate orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge bg="success">Đã xác nhận</Badge>;
      case "paid":
        return <Badge bg="primary">Đã thanh toán</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark">Chờ duyệt</Badge>;
      case "refunded":
        return <Badge bg="danger">Đã hoàn tiền</Badge>;
      default:
        return <Badge bg="secondary">{status || "—"}</Badge>;
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title as="h5">Đơn hàng mua qua link Aff (Đắc Sư Conversions)</Card.Title>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Sản phẩm</th>
                <th style={{ textAlign: "right" }}>Tổng tiền</th>
                <th style={{ textAlign: "right" }}>Hoa hồng CTV</th>
                <th>Mã CTV</th>
                <th>Tên CTV</th>
                <th style={{ textAlign: "center" }}>Trạng thái</th>
                <th>Ngày mua</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="font-weight-bold" style={{ fontSize: "0.85em" }}>
                        {order.orderId ? `${order.orderId.substring(0, 8)}...` : "—"}
                      </span>
                    </td>
                    <td>{order.customerName || "—"}</td>
                    <td>{order.customerEmail || "—"}</td>
                    <td>
                      <Badge bg="info" text="dark">
                        {order.productCode || "—"}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "#0d6efd" }}>
                      {fmtNum(order.orderAmount)} {order.orderCurrency}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "#198754" }}>
                      {fmtNum(order.commissionAmount)} {order.orderCurrency}
                    </td>
                    <td>
                      <Badge bg="secondary">{order.affiliateCode || "—"}</Badge>
                    </td>
                    <td>{order.affiliateName || "—"}</td>
                    <td style={{ textAlign: "center" }}>{getStatusBadge(order.status)}</td>
                    <td style={{ fontSize: "0.85em", color: "#6c757d" }}>
                      {order.orderCreatedAt
                        ? new Date(order.orderCreatedAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-muted">
                    Chưa có đơn hàng mua qua link Affiliate nào.
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

export default AffiliateOrdersTable;

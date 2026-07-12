import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Button, Card, Container, Form, Modal, Spinner, Table } from 'react-bootstrap';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('academy');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userRole, setUserRole] = useState(null); // Add state for user role

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role'); // Get user role from localStorage
    setUserRole(role); // Set the user role state

    if (userId) {
      fetchProducts(userId);
    } else {
      console.error('Không tìm thấy userId trong localStorage');
    }
  }, []);

  const fetchProducts = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/products/getallproducts/${userId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
    }
    setLoading(false);
  };

  const filteredProducts = () => {
    if (activeCategory === 'academy') {
      return products.filter((product) => product.category === 'Academy');
    } else if (activeCategory === 'hub') {
      return products.filter((product) => product.category === 'Health Hub');
    }
    return products;
  };

  const handleCreateVoucher = (product) => {
    setSelectedProduct(product);
    setShowVoucherModal(true);
  };

  const handleCloseVoucherModal = () => {
    setShowVoucherModal(false);
    setSelectedProduct(null);
  };

  const handleSubmitVoucher = async (event) => {
    event.preventDefault();

    const voucherTypeValue = event.target.voucherType.value;
    let voucherType;

    if (voucherTypeValue === 'percentage') {
      voucherType = '%';
    } else if (voucherTypeValue === 'fixed') {
      voucherType = 'Amount';
    } else if (voucherTypeValue === 'coupon') {
      voucherType = 'Coupon';
    }

    const voucherData = {
      voucherValue: event.target.voucherValue.value,
      voucherType: voucherType,
      validityPeriodFrom: event.target.validityPeriodFrom.value,
      validityPeriodTo: event.target.validityPeriodTo.value,
      attachedFile: event.target.attachedFile.files[0] || null,
      status: event.target.status.value,
      note: event.target.note.value,
      createdBy: localStorage.getItem('userId')
    };

    try {
      await axios.post(`https://www.system.crmkhitam.com/api/v1/products/${selectedProduct._id}/vouchers`, voucherData);
      alert('Tạo voucher thành công!');
      handleCloseVoucherModal();
    } catch (error) {
      console.error('Lỗi khi tạo voucher:', error);
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
    }
  };

  const handleCreateNewProduct = async (event) => {
    event.preventDefault();

    const productData = {
      name: event.target.productName.value,
      category: event.target.category.value,
      price: event.target.price.value,
      vouchers: [] // Assuming an empty array for vouchers initially
    };

    try {
      const response = await axios.post('https://www.system.crmkhitam.com/api/v1/products/create', productData);
      alert('Sản phẩm đã được tạo!');
      fetchProducts(localStorage.getItem('userId')); // Refresh the product list
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      alert('Không thể tạo sản phẩm!');
    }
  };

  return (
    <Container fluid>
      <Card.Header>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          {/* Conditionally render the "Create Product" button */}
          {(userRole === 'Admin' || userRole === 'KTT Sale Manager') && (
            <Button variant="success" onClick={() => setShowProductModal(true)}>
              Tạo sản phẩm mới
            </Button>
          )}
          <span
            onClick={() => setActiveCategory('academy')}
            style={{
              cursor: 'pointer',
              fontWeight: activeCategory === 'academy' ? 'bold' : 'normal',
              textDecoration: activeCategory === 'academy' ? 'underline' : 'none',
              color: activeCategory === 'academy' ? '#007bff' : '#6c757d',
              fontSize: activeCategory === 'academy' ? '25px' : '16px',
              transition: 'font-size 0.3s ease'
            }}
          >
            Academy
          </span>
          <span
            onClick={() => setActiveCategory('hub')}
            style={{
              cursor: 'pointer',
              fontWeight: activeCategory === 'hub' ? 'bold' : 'normal',
              textDecoration: activeCategory === 'hub' ? 'underline' : 'none',
              color: activeCategory === 'hub' ? '#007bff' : '#6c757d',
              fontSize: activeCategory === 'hub' ? '25px' : '16px',
              transition: 'font-size 0.3s ease'
            }}
          >
            Health Hub
          </span>
        </div>
      </Card.Header>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Mã sản phẩm</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts().map((product) => (
              <tr key={product._id}>
                <td>{product.productCode}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price} VND</td>
                <td>{product.status}</td>
                <td>
                  <Button variant="primary" onClick={() => handleCreateVoucher(product)}>
                    Tạo voucher
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal tạo voucher */}
      <Modal show={showVoucherModal} onHide={handleCloseVoucherModal}>
        <Modal.Header closeButton>Tạo Voucher {selectedProduct && `: ${selectedProduct.name}`}</Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitVoucher}>
            <Form.Group controlId="voucherValue">
              <Form.Label>Giá trị voucher</Form.Label>
              <Form.Control type="number" placeholder="Nhập giá trị voucher" required />
            </Form.Group>

            <Form.Group controlId="voucherType">
              <Form.Label>Loại voucher</Form.Label>
              <Form.Control as="select" required>
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Cố định</option>
                <option value="coupon">Mã Coupon</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="validityPeriodFrom">
              <Form.Label>Ngày bắt đầu</Form.Label>
              <Form.Control type="date" required />
            </Form.Group>

            <Form.Group controlId="validityPeriodTo">
              <Form.Label>Ngày kết thúc</Form.Label>
              <Form.Control type="date" required />
            </Form.Group>

            <Form.Group controlId="attachedFile">
              <Form.Label>File đính kèm</Form.Label>
              <Form.Control type="file" />
            </Form.Group>

            <Form.Group controlId="status">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Control as="select" required>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="note">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control as="textarea" placeholder="Nhập ghi chú (tùy chọn)" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Tạo voucher
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal tạo sản phẩm */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>Tạo sản phẩm mới</Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateNewProduct}>
            <Form.Group controlId="productName">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control type="text" placeholder="Nhập tên sản phẩm" required />
            </Form.Group>

            <Form.Group controlId="category">
              <Form.Label>Danh mục</Form.Label>
              <Form.Control as="select" required>
                <option value="Academy">Academy</option>
                <option value="Health Hub">Health Hub</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="price">
              <Form.Label>Giá</Form.Label>
              <Form.Control type="number" placeholder="Nhập giá" required />
            </Form.Group>

            <Button variant="primary" type="submit">
              Tạo sản phẩm
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductList;

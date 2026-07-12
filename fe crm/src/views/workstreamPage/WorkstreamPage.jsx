import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Modal, Nav, Row, Tab, Table, Spinner, Badge } from 'react-bootstrap';
import { FaThumbsUp, FaShoppingCart } from 'react-icons/fa';

import Dashboard from './Dashboard';

const WorkstreamPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [posts, setPosts] = useState([]); // Danh sách bài viết

  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'campaign',
    uploadedBy: '', // Sẽ được lấy từ localStorage
    image: null
  });
  const [selectedPost, setSelectedPost] = useState(null); // Bài viết được chọn
  const [isLikeModalOpen, setIsLikeModalOpen] = useState(false); // Modal để hiển thị người thích

  // State cho Customer Leads
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [errorLeads, setErrorLeads] = useState(null);

  // State cho Đơn hàng (Unpaid & Paid)
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  // Hàm mở modal để xem người like
  const toggleLikeModal = (post) => {
    setSelectedPost(post); // Cập nhật bài viết được chọn
    setIsLikeModalOpen(true); // Mở modal
  };

  // Hàm đóng modal
  const handleCloseLikeModal = () => {
    setIsLikeModalOpen(false); // Đóng modal
  };
  // Ensure this state is defined correctly
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const handleShowCommentModal = () => setIsCommentModalOpen(true); // Mở modal để thêm bình luận
  const handleCloseCommentModal = () => setIsCommentModalOpen(false); // Đóng modal
  const handleCommentChange = (e) => setCommentText(e.target.value);
  const handleAddComment = async () => {
    try {
      // Gửi bình luận đến API
      const response = await axios.post('https://www.system.crmkhitam.com/api/workstreams/comment', {
        postId: selectedPost._id, // ID của bài viết
        userId: userId, // ID của người dùng hiện tại
        text: commentText // Nội dung bình luận
      });

      // Cập nhật danh sách bài viết với bình luận mới
      const updatedPosts = posts.map((post) => {
        if (post._id === selectedPost._id) {
          return { ...post, comments: [...post.comments, { user: { name: 'Nguyễn Văn A' }, text: commentText }] };
        }
        return post;
      });

      setPosts(updatedPosts); // Cập nhật lại state bài viết
      setCommentText(''); // Reset commentText sau khi thêm
      setShowSuccess(true);
      setSuccessMessage('Bình luận đã được thêm thành công!');
      handleCloseCommentModal(); // Đóng modal
      await fetchPosts();
    } catch (error) {
      // Nếu có lỗi xảy ra trong quá trình gửi bình luận
      console.error('Lỗi kết nối:', error);
      setShowError(true);
      setErrorMessage('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại.');
    }
  };
  useEffect(() => {
    // Lấy userId từ localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setNewPost((prev) => ({
        ...prev,
        uploadedBy: userId
      }));
    }

    // Gọi API để lấy danh sách bài viết
    fetchPosts();

    // Gọi API để lấy danh sách khách hàng tiềm năng
    fetchLeads();

    // Gọi API để lấy danh sách đơn hàng
    fetchOrders();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      const response = await axios.get('https://www.beassess.khitamtherapyintl.com/api/customers');
      if (response.data.success) {
        setLeads(response.data.data || []);
      } else {
        setErrorLeads('Không thể lấy dữ liệu khách hàng');
      }
    } catch (err) {
      console.error('Lỗi kết nối khi lấy Leads:', err);
      setErrorLeads('Lỗi kết nối đến máy chủ API Leads');
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get('https://www.beassess.khitamtherapyintl.com/api/orders');
      if (response.data.success) {
        const orders = response.data.data || [];
        setUnpaidOrders(orders.filter(order => order.status === 'PENDING'));
        setPaidOrders(orders.filter(order => order.status === 'PAID'));
      } else {
        setErrorOrders('Không thể lấy dữ liệu đơn hàng');
      }
    } catch (err) {
      console.error('Lỗi kết nối khi lấy Đơn hàng:', err);
      setErrorOrders('Lỗi kết nối đến máy chủ API Orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const userId = localStorage.getItem('userId'); // Lấy userId từ localStorage

      if (!userId) {
        alert('Bạn cần đăng nhập để thích bài viết.');
        return; // Dừng hàm nếu người dùng chưa đăng nhập
      }

      // Gửi yêu cầu like đến API
      const response = await axios.post('https://www.system.crmkhitam.com/api/workstreams/like', {
        workstreamId: postId,
        userId: userId
      });

      if (response.data.success) {
        // Cập nhật lại danh sách likes trong trạng thái posts
        const updatedPosts = posts.map((post) => {
          if (post._id === postId) {
            return { ...post, likes: response.data.likes }; // Cập nhật danh sách likes
          }
          return post;
        });
        setPosts(updatedPosts); // Cập nhật lại state posts
        await fetchPosts();
      } else {
        console.error('Lỗi khi cập nhật trạng thái like:', response.data.message);
        alert('Có lỗi khi thực hiện hành động thích, vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      alert('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại.');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('https://www.system.crmkhitam.com/api/workstreams'); // Thay bằng URL API của bạn
      const data = await response.json();

      if (response.ok) {
        // console.log(data.data);
        setPosts(data.data); // Lưu danh sách bài viết vào state
      } else {
        console.error('Lỗi khi lấy bài viết:', data.message);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    }
  };
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setNewPost((prev) => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmitPost = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('description', newPost.description);
      formData.append('category', newPost.category);
      formData.append('uploadedBy', newPost.uploadedBy);
      if (newPost.image) {
        formData.append('image', newPost.image);
      }

      // Gửi API POST
      const response = await fetch('https://www.system.crmkhitam.com/api/workstreams', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        // Sau khi thành công, hiển thị thông báo thành công và reset form
        setSuccessMessage('Đăng bài thành công!');
        setShowSuccess(true);
        setShowModal(false);
        setNewPost({
          title: '',
          description: '',
          category: 'campaign',
          uploadedBy: localStorage.getItem('userId') || '',
          image: null
        });
        setShowError(false); // Ẩn alert lỗi nếu đang hiển thị
        fetchPosts(); // Cập nhật lại danh sách bài viết
      } else {
        // Hiển thị lỗi nếu không thành công
        setErrorMessage(data.message || 'Đã xảy ra lỗi khi đăng bài.');
        setShowError(true);
        setShowSuccess(false); // Ẩn alert thành công nếu đang hiển thị
      }
    } catch (error) {
      // Hiển thị lỗi kết nối
      setErrorMessage('Không thể kết nối đến server.');
      setShowError(true);
      setShowSuccess(false); // Ẩn alert thành công nếu đang hiển thị
    }
  };

  const userRole = localStorage.getItem('role'); // role có thể là 'Admin', 'KTT', 'Sale Manager', v.v.

  // Kiểm tra điều kiện để hiển thị nút
  const canViewButtons = ['Admin', 'KTT Sale Manager'].includes(userRole);

  // Nhóm danh sách leads theo Task
  const groupedLeads = leads.reduce((acc, lead) => {
    const taskName = lead.task || 'Khác (Không có task)';
    if (!acc[taskName]) acc[taskName] = [];
    acc[taskName].push(lead);
    return acc;
  }, {});
  const leadTasks = Object.keys(groupedLeads);

  return (
    <Container fluid>
      <Row>
        <Dashboard />
      </Row>
      <Row>
        <Col md={15}>
          <Container fluid style={{ width: '100%', padding: '0' }}>
            <Row className="bg-light border-bottom py-3">
              <Col md={12} className="d-flex justify-content-start align-items-center">
                {canViewButtons && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.6rem 1.2rem',
                        marginRight: '0.5rem'
                      }}
                      onClick={handleShowModal}
                    >
                      Đăng bài
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.6rem 1.2rem',
                        marginRight: '0.5rem'
                      }}
                      onClick={handleShowModal}
                    >
                      Quản lý bài đăng
                    </Button>
                  </>
                )}
              </Col>
            </Row>
            {/* Hiển thị thông báo thành công */}
            {showSuccess && (
              <Row className="mt-3">
                <Col>
                  <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
                    {successMessage}
                  </Alert>
                </Col>
              </Row>
            )}
            {showError && (
              <Row className="mt-3">
                <Col>
                  <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
                    {errorMessage}
                  </Alert>
                </Col>
              </Row>
            )}

            <Row className="mt-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4>Workstream & Quản lý Leads</h4>
                </div>
                <Tab.Container defaultActiveKey="unpaid">
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="unpaid">
                        Khách chưa thanh toán {unpaidOrders.length > 0 && <Badge bg="danger" className="ms-1">{unpaidOrders.length}</Badge>}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="paid">
                        Khách đã thanh toán (Thành công) {paidOrders.length > 0 && <Badge bg="success" className="ms-1">{paidOrders.length}</Badge>}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="leads">Khách hàng Tiềm năng (Leads)</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="bangtin">Tin nhắn từ cô Tố Hải</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="tinquantrong">Tin quan trọng</Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* Tab Khách chưa thanh toán (Unpaid Orders) */}
                    <Tab.Pane eventKey="unpaid">
                      {loadingOrders ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" variant="danger" /> <span className="ms-2">Đang tải dữ liệu đơn hàng...</span>
                        </div>
                      ) : errorOrders ? (
                        <Alert variant="danger">{errorOrders}</Alert>
                      ) : (
                        <Container fluid className="p-0">
                          <Card className="shadow-sm border-danger">
                            <Card.Header className="bg-white text-danger fw-bold d-flex align-items-center">
                              <FaShoppingCart className="me-2" />
                              Danh sách khách hàng đã thêm vào giỏ hàng nhưng chưa thanh toán
                            </Card.Header>
                            <Card.Body>
                              {unpaidOrders.length > 0 ? (
                                <Table responsive hover bordered striped className="mt-2">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Họ và Tên</th>
                                      <th>Email</th>
                                      <th>Số điện thoại</th>
                                      <th>Khóa học quan tâm</th>
                                      <th>Số tiền (VND)</th>
                                      <th>Trạng thái</th>
                                      <th>Ngày tạo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {unpaidOrders.map((order, i) => (
                                      <tr key={i}>
                                        <td className="fw-bold">{order.customerName}</td>
                                        <td>{order.customerEmail}</td>
                                        <td>{order.customerPhone}</td>
                                        <td>{order.courseName}</td>
                                        <td className="text-danger fw-bold">
                                          {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}
                                        </td>
                                        <td><Badge bg="warning" text="dark">{order.status}</Badge></td>
                                        <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <div className="text-center p-4 text-muted">
                                  Không có khách hàng nào chưa thanh toán.
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Container>
                      )}
                    </Tab.Pane>

                    {/* Tab Khách ĐÃ thanh toán (Paid Orders) */}
                    <Tab.Pane eventKey="paid">
                      {loadingOrders ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" variant="success" /> <span className="ms-2">Đang tải dữ liệu đơn hàng...</span>
                        </div>
                      ) : errorOrders ? (
                        <Alert variant="danger">{errorOrders}</Alert>
                      ) : (
                        <Container fluid className="p-0">
                          <Card className="shadow-sm border-success">
                            <Card.Header className="bg-white text-success fw-bold d-flex align-items-center">
                              <FaShoppingCart className="me-2" />
                              Danh sách khách hàng ĐÃ thanh toán thành công
                            </Card.Header>
                            <Card.Body>
                              {paidOrders.length > 0 ? (
                                <Table responsive hover bordered striped className="mt-2">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Họ và Tên</th>
                                      <th>Email</th>
                                      <th>Số điện thoại</th>
                                      <th>Khóa học</th>
                                      <th>Số tiền (VND)</th>
                                      <th>Trạng thái</th>
                                      <th>Ngày thanh toán</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paidOrders.map((order, i) => (
                                      <tr key={i}>
                                        <td className="fw-bold">{order.customerName}</td>
                                        <td>{order.customerEmail}</td>
                                        <td>{order.customerPhone}</td>
                                        <td>{order.courseName}</td>
                                        <td className="text-success fw-bold">
                                          {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}
                                        </td>
                                        <td><Badge bg="success">Thành công (PAID)</Badge></td>
                                        <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <div className="text-center p-4 text-muted">
                                  Chưa có đơn hàng nào thanh toán thành công.
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Container>
                      )}
                    </Tab.Pane>

                    {/* Tab Customer Leads */}
                    <Tab.Pane eventKey="leads">
                      {loadingLeads ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" variant="primary" /> <span className="ms-2">Đang tải dữ liệu khách hàng...</span>
                        </div>
                      ) : errorLeads ? (
                        <Alert variant="danger">{errorLeads}</Alert>
                      ) : (
                        <Container fluid className="p-0">


                          <Card className="shadow-sm">
                            <Card.Header>Danh sách chi tiết theo Task</Card.Header>
                            <Card.Body>
                              <Tab.Container defaultActiveKey={leadTasks[0] || 'all'}>
                                <Nav variant="pills" className="mb-3">
                                  {leadTasks.map((taskName, idx) => (
                                    <Nav.Item key={idx}>
                                      <Nav.Link eventKey={taskName} className="me-2 mb-2 border rounded">
                                        {taskName} ({groupedLeads[taskName].length})
                                      </Nav.Link>
                                    </Nav.Item>
                                  ))}
                                </Nav>
                                <Tab.Content>
                                  {leadTasks.map((taskName, idx) => (
                                    <Tab.Pane eventKey={taskName} key={idx}>
                                      <Table responsive hover bordered striped className="mt-2">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Họ và Tên</th>
                                            <th>Email</th>
                                            <th>Số điện thoại</th>
                                            <th>Nguồn</th>
                                            <th>Ngày đăng ký</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {groupedLeads[taskName].map((lead, i) => (
                                            <tr key={i}>
                                              <td className="fw-bold">{lead.fullName}</td>
                                              <td>{lead.email}</td>
                                              <td>{lead.phone}</td>
                                              <td>{lead.source || 'Website'}</td>
                                              <td>{new Date(lead.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </Tab.Pane>
                                  ))}
                                </Tab.Content>
                              </Tab.Container>
                            </Card.Body>
                          </Card>
                        </Container>
                      )}
                    </Tab.Pane>

                    {/* Tab Tin nhắn từ cô Tố Hải */}
                    <Tab.Pane eventKey="bangtin">
                      {posts
                        .filter((post) => post.category === 'campaign')
                        .map((post) => (
                          <Card key={post._id} className="mb-3 shadow-sm">
                            <Card.Body>
                              <Row>
                                <Col sm="1" className="text-center">
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      backgroundColor: '#6c757d',
                                      color: '#fff',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      fontSize: '18px'
                                    }}
                                  >
                                    {post.uploadedBy.firstname.charAt(0)}
                                  </div>
                                </Col>
                                <Col>
                                  <div>
                                    <strong>
                                      {post.uploadedBy.lastname} {post.uploadedBy.firstname}{' '}
                                    </strong>{' '}
                                    • <span className="text-muted">{post.uploadedBy.role.name}</span>
                                  </div>
                                  <small className="text-muted">{formatDate(post.createdAt)}</small>
                                  <h5 className="mt-2">{post.title}</h5>
                                  <p>
                                    {post.description.split('\n').map((item, index) => (
                                      <React.Fragment key={index}>
                                        {item}
                                        <br />
                                      </React.Fragment>
                                    ))}
                                  </p>
                                  {post.imageUrl && (
                                    <img
                                      src={newPost.image || 'http://via.placeholder.com/150'} // Sử dụng imageUrl từ API nếu có, nếu không thì dùng placeholder
                                      alt={post.title}
                                      style={{
                                        maxWidth: '70%',
                                        height: 'auto',
                                        borderRadius: '0px'
                                      }}
                                    />
                                  )}

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                                    <Button
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId) ? '#007bff' : 'white', // Nếu đã thích thì nền xanh, nếu chưa thích thì nền trắng
                                        borderRadius: '50%',
                                        padding: '10px',
                                        border:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId) ? 'none' : '#black', // Nếu đã thích thì không có viền, nếu chưa thích thì có viền
                                        color:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId) ? 'white' : '#007bff', // Nếu đã thích thì chữ màu trắng, nếu chưa thích thì chữ màu xanh
                                        fontSize: '16px',
                                        cursor:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)
                                            ? 'not-allowed'
                                            : 'pointer', // Nếu đã thích thì không thể bấm vào
                                        transition: 'background-color 0.3s ease, border-color 0.3s ease' // Thêm hiệu ứng chuyển màu
                                      }}
                                      onClick={() => {
                                        if (Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)) {
                                          alert('Bạn đã thích bài viết này rồi.');
                                          return; // Nếu đã thích, không làm gì nữa
                                        }
                                        handleLike(post._id); // Nếu chưa thích, gọi handleLike để thực hiện hành động thích
                                      }}
                                      disabled={Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)} // Disable nếu đã thích
                                    >
                                      <FaThumbsUp
                                        style={{
                                          color:
                                            Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)
                                              ? 'white'
                                              : '#007bff', // Nếu đã thích thì biểu tượng có màu trắng, nếu chưa thích thì màu xanh
                                          fontSize: '20px',
                                          marginRight: '3px'
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => toggleLikeModal(post)}
                                      style={{
                                        color: '#007bff', // Màu xanh nước biển cho chữ
                                        fontSize: '14px', // Điều chỉnh kích thước chữ nếu cần
                                        padding: '0', // Loại bỏ padding thừa quanh nút
                                        border: 'none', // Loại bỏ viền nút
                                        backgroundColor: 'transparent' // Nền trong suốt
                                      }}
                                    >
                                      {post.likesCount} Lượt thích
                                    </Button>

                                    {/* Comment Button */}
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedPost(post); // Chọn bài viết để bình luận
                                        handleShowCommentModal(); // Mở modal để thêm bình luận
                                      }}
                                    >
                                      Bình luận
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                    </Tab.Pane>

                    {/* Tab Tin quan trọng */}
                    <Tab.Pane eventKey="tinquantrong">
                      {posts
                        .filter((post) => post.category === 'important')
                        .map((post) => (
                          <Card key={post._id} className="mb-3 shadow-sm">
                            <Card.Body>
                              <Row>
                                <Col sm="1" className="text-center">
                                  <div
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      backgroundColor: '#6c757d',
                                      color: '#fff',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      fontSize: '18px'
                                    }}
                                  >
                                    {post.uploadedBy.firstname.charAt(0)}
                                  </div>
                                </Col>
                                <Col>
                                  <div>
                                    <strong>
                                      {post.uploadedBy.lastname} {post.uploadedBy.firstname}{' '}
                                    </strong>{' '}
                                    • <span className="text-muted">{post.uploadedBy.role.name}</span>
                                  </div>
                                  <small className="text-muted">{formatDate(post.createdAt)}</small>
                                  <h5 className="mt-2">{post.title}</h5>
                                  <p>
                                    {post.description.split('\n').map((item, index) => (
                                      <React.Fragment key={index}>
                                        {item}
                                        <br />
                                      </React.Fragment>
                                    ))}
                                  </p>
                                  {post.imageUrl && (
                                    <img
                                      src={'http://via.placeholder.com/150' || 'http://via.placeholder.com/150'} // Sử dụng imageUrl từ API nếu có, nếu không thì dùng placeholder
                                      alt={post.title}
                                      style={{
                                        maxWidth: '70%',
                                        height: 'auto',
                                        borderRadius: '0px'
                                      }}
                                    />
                                  )}

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                                    <Button
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId) ? '#007bff' : 'white', // Nếu đã thích thì nền xanh, nếu chưa thích thì nền trắng
                                        borderRadius: '50%',
                                        padding: '10px',
                                        border:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId) ? 'none' : '#black', // Nếu đã thích thì không có viền, nếu chưa thích thì có viền
                                        color:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId) ? 'white' : '#007bff', // Nếu đã thích thì chữ màu trắng, nếu chưa thích thì chữ màu xanh
                                        fontSize: '16px',
                                        cursor:
                                          Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)
                                            ? 'not-allowed'
                                            : 'pointer', // Nếu đã thích thì không thể bấm vào
                                        transition: 'background-color 0.3s ease, border-color 0.3s ease' // Thêm hiệu ứng chuyển màu
                                      }}
                                      onClick={() => {
                                        if (Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)) {
                                          alert('Bạn đã thích bài viết này rồi.');
                                          return; // Nếu đã thích, không làm gì nữa
                                        }
                                        handleLike(post._id); // Nếu chưa thích, gọi handleLike để thực hiện hành động thích
                                      }}
                                      disabled={Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)} // Disable nếu đã thích
                                    >
                                      <FaThumbsUp
                                        style={{
                                          color:
                                            Array.isArray(post.likes) && post.likes.some((user) => user._id === userId)
                                              ? 'white'
                                              : '#007bff', // Nếu đã thích thì biểu tượng có màu trắng, nếu chưa thích thì màu xanh
                                          fontSize: '20px',
                                          marginRight: '3px'
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => toggleLikeModal(post)}
                                      style={{
                                        color: '#007bff', // Màu xanh nước biển cho chữ
                                        fontSize: '14px', // Điều chỉnh kích thước chữ nếu cần
                                        padding: '0', // Loại bỏ padding thừa quanh nút
                                        border: 'none', // Loại bỏ viền nút
                                        backgroundColor: 'transparent' // Nền trong suốt
                                      }}
                                    >
                                      {post.likesCount} Lượt thích
                                    </Button>

                                    {/* Comment Button */}
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedPost(post); // Chọn bài viết để bình luận
                                        handleShowCommentModal(); // Mở modal để thêm bình luận
                                      }}
                                    >
                                      Bình luận
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
      <Modal show={isCommentModalOpen} onHide={handleCloseCommentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm Bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {selectedPost && selectedPost.comments && selectedPost.comments.length > 0 ? (
            selectedPost.comments.map((comment, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                {/* Hiển thị tên đầy đủ của người bình luận */}
                <div style={{ fontWeight: 'bold' }}>
                  {comment.user.lastname} {comment.user.firstname}
                </div>
                {/* Hiển thị nội dung bình luận */}
                <div>{comment.text}</div>
                {/* Hiển thị thời gian bình luận */}
                <div style={{ fontSize: 'small', color: 'gray' }}>{formatDate(comment.createdAt)}</div>
              </div>
            ))
          ) : (
            <div>Chưa có bình luận nào.</div>
          )}
        </Modal.Body>
        <Form.Control as="textarea" rows={3} value={commentText} onChange={handleCommentChange} placeholder="Nhập bình luận của bạn" />
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCommentModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddComment}>
            Thêm Bình luận
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isLikeModalOpen} onHide={handleCloseLikeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Những người đã thích</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {selectedPost && selectedPost.likes.length > 0 ? (
              selectedPost.likes.map((user, index) => (
                <ListGroup.Item key={index}>
                  {user.lastname} {user.firstname}
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>Không có ai</ListGroup.Item>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLikeModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Đăng bài mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control type="text" placeholder="Nhập tiêu đề" name="title" value={newPost.title} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Loại bài viết</Form.Label>
              <Form.Select name="category" value={newPost.category} onChange={handleInputChange}>
                <option value="campaign">Chiến dịch</option>
                <option value="important">Tin quan trọng</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Nhập nội dung"
                name="description"
                value={newPost.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh đính kèm (không bắt buộc)</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmitPost}>
            Đăng bài
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkstreamPage;

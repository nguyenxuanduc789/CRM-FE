import React, { useEffect, useState } from "react";

import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Nav,
  Row,
  Tab,
  Table,
  Spinner,
  Badge,
  Pagination,
} from "react-bootstrap";
import { FaThumbsUp, FaShoppingCart } from "react-icons/fa";

import Dashboard from "./Dashboard";
import RishikeshFormsTab from "./RishikeshFormsTab";
import { useLanguage } from "../../contexts/LanguageContext";
import { getDashboardTranslations } from "./translations";

const WorkstreamPage = () => {
  const { language } = useLanguage();
  const t = getDashboardTranslations(language);
  const locale = language === "en" ? "en-US" : "vi-VN";
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [posts, setPosts] = useState([]); // Danh sách bài viết

  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    category: "campaign",
    uploadedBy: "", // Sẽ được lấy từ localStorage
    image: null,
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

  // State cho Mailchimp Data
  const [mailchimpData, setMailchimpData] = useState({});
  const [loadingMailchimp, setLoadingMailchimp] = useState(true);
  const [errorMailchimp, setErrorMailchimp] = useState(null);

  // Phân trang Mailchimp
  const [currentPageMailchimp, setCurrentPageMailchimp] = useState({});
  const itemsPerPage = 20; // Số lượng khách hàng mỗi trang

  const handlePageChangeMailchimp = (tagName, pageNumber) => {
    setCurrentPageMailchimp((prev) => ({ ...prev, [tagName]: pageNumber }));
  };

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
  const [commentText, setCommentText] = useState("");
  const handleShowCommentModal = () => setIsCommentModalOpen(true); // Mở modal để thêm bình luận
  const handleCloseCommentModal = () => setIsCommentModalOpen(false); // Đóng modal
  const handleCommentChange = (e) => setCommentText(e.target.value);
  const handleAddComment = async () => {
    try {
      // Gửi bình luận đến API
      const response = await axios.post(
        "https://www.system.crmkhitam.com/api/workstreams/comment",
        {
          postId: selectedPost._id, // ID của bài viết
          userId: userId, // ID của người dùng hiện tại
          text: commentText, // Nội dung bình luận
        },
      );

      // Cập nhật danh sách bài viết với bình luận mới
      const updatedPosts = posts.map((post) => {
        if (post._id === selectedPost._id) {
          return {
            ...post,
            comments: [
              ...post.comments,
              { user: { name: "Nguyễn Văn A" }, text: commentText },
            ],
          };
        }
        return post;
      });

      setPosts(updatedPosts); // Cập nhật lại state bài viết
      setCommentText(""); // Reset commentText sau khi thêm
      setShowSuccess(true);
      setSuccessMessage(t.commentSuccess);
      handleCloseCommentModal(); // Đóng modal
      await fetchPosts();
    } catch (error) {
      // Nếu có lỗi xảy ra trong quá trình gửi bình luận
      console.error("Lỗi kết nối:", error);
      setShowError(true);
      setErrorMessage(t.connectionError);
    }
  };
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setNewPost((prev) => ({
        ...prev,
        uploadedBy: storedUserId,
      }));
    }

    // Orders trước; các API còn lại ngay sau paint (không chờ 800ms).
    fetchOrders();
    const deferId = window.setTimeout(() => {
      fetchPosts();
      fetchLeads();
      fetchMailchimpData();
    }, 0);

    return () => window.clearTimeout(deferId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMailchimpData = async () => {
    try {
      setLoadingMailchimp(true);
      // Sử dụng localhost:3333 cho dev hoặc domain thực tế của bạn
      const response = await axios.get(
        "https://www.beassess.khitamtherapyintl.com/api/mailchimp/by-tags",
      );
      if (response.data.success) {
        setMailchimpData(response.data.data || {});
      } else {
        setErrorMailchimp(t.fetchMailchimpFailed);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lấy Mailchimp:", err);
      setErrorMailchimp(t.connectionError);
    } finally {
      setLoadingMailchimp(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      const response = await axios.get(
        "https://www.beassess.khitamtherapyintl.com/api/customers",
      );
      if (response.data.success) {
        setLeads(response.data.data || []);
      } else {
        setErrorLeads(t.fetchCustomersFailed);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lấy Leads:", err);
      setErrorLeads(t.connectionError);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(
        "https://www.beassess.khitamtherapyintl.com/api/orders",
      );
      if (response.data.success) {
        const orders = response.data.data || [];
        setUnpaidOrders(orders.filter((order) => order.status === "PENDING"));
        setPaidOrders(orders.filter((order) => order.status === "PAID"));
      } else {
        setErrorOrders(t.fetchOrdersFailed);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lấy Đơn hàng:", err);
      setErrorOrders(t.connectionError);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage

      if (!userId) {
        alert(t.loginToLike);
        return; // Dừng hàm nếu người dùng chưa đăng nhập
      }

      // Gửi yêu cầu like đến API
      const response = await axios.post(
        "https://www.system.crmkhitam.com/api/workstreams/like",
        {
          workstreamId: postId,
          userId: userId,
        },
      );

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
        console.error(
          "Lỗi khi cập nhật trạng thái like:",
          response.data.message,
        );
        alert(t.likeFailed);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert(t.connectionError);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        "https://www.system.crmkhitam.com/api/workstreams",
      ); // Thay bằng URL API của bạn
      const data = await response.json();

      if (response.ok) {
        // console.log(data.data);
        setPosts(data.data); // Lưu danh sách bài viết vào state
      } else {
        console.error("Lỗi khi lấy bài viết:", data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(locale, options);
  };
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setNewPost((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmitPost = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("description", newPost.description);
      formData.append("category", newPost.category);
      formData.append("uploadedBy", newPost.uploadedBy);
      if (newPost.image) {
        formData.append("image", newPost.image);
      }

      // Gửi API POST
      const response = await fetch(
        "https://www.system.crmkhitam.com/api/workstreams",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        // Sau khi thành công, hiển thị thông báo thành công và reset form
        setSuccessMessage(t.postSuccess);
        setShowSuccess(true);
        setShowModal(false);
        setNewPost({
          title: "",
          description: "",
          category: "campaign",
          uploadedBy: localStorage.getItem("userId") || "",
          image: null,
        });
        setShowError(false); // Ẩn alert lỗi nếu đang hiển thị
        fetchPosts(); // Cập nhật lại danh sách bài viết
      } else {
        // Hiển thị lỗi nếu không thành công
        setErrorMessage(data.message || t.postFailed);
        setShowError(true);
        setShowSuccess(false); // Ẩn alert thành công nếu đang hiển thị
      }
    } catch (error) {
      // Hiển thị lỗi kết nối
      setErrorMessage(t.serverUnavailable);
      setShowError(true);
      setShowSuccess(false); // Ẩn alert thành công nếu đang hiển thị
    }
  };

  const userRole = localStorage.getItem("role"); // role có thể là 'Admin', 'KTT', 'Sale Manager', v.v.

  // Kiểm tra điều kiện để hiển thị nút
  const canViewButtons = ["Admin", "KTT Sale Manager"].includes(userRole);

  // Nhóm danh sách leads theo Task
  const groupedLeads = leads.reduce((acc, lead) => {
    const taskName = lead.task || t.otherTask;
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
          <Container fluid style={{ width: "100%", padding: "0" }}>
            <Row className="bg-light border-bottom py-3">
              <Col
                md={12}
                className="d-flex justify-content-start align-items-center"
              >
                {canViewButtons && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.6rem 1.2rem",
                        marginRight: "0.5rem",
                      }}
                      onClick={handleShowModal}
                    >
                      {t.post}
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.6rem 1.2rem",
                        marginRight: "0.5rem",
                      }}
                      onClick={handleShowModal}
                    >
                      {t.managePosts}
                    </Button>
                  </>
                )}
              </Col>
            </Row>
            {/* Hiển thị thông báo thành công */}
            {showSuccess && (
              <Row className="mt-3">
                <Col>
                  <Alert
                    variant="success"
                    onClose={() => setShowSuccess(false)}
                    dismissible
                  >
                    {successMessage}
                  </Alert>
                </Col>
              </Row>
            )}
            {showError && (
              <Row className="mt-3">
                <Col>
                  <Alert
                    variant="danger"
                    onClose={() => setShowError(false)}
                    dismissible
                  >
                    {errorMessage}
                  </Alert>
                </Col>
              </Row>
            )}

            <Row className="mt-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4>{t.workstreamTitle}</h4>
                </div>
                <Tab.Container defaultActiveKey="unpaid">
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="unpaid">
                        {t.unpaidTab}{" "}
                        {unpaidOrders.length > 0 && (
                          <Badge bg="danger" className="ms-1">
                            {unpaidOrders.length}
                          </Badge>
                        )}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="paid">
                        {t.paidTab}{" "}
                        {paidOrders.length > 0 && (
                          <Badge bg="success" className="ms-1">
                            {paidOrders.length}
                          </Badge>
                        )}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="leads">{t.leadsTab}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="mailchimp">{t.mailchimpTab}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="bangtin">{t.messagesTab}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="tinquantrong">
                        {t.importantTab}
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="rishikesh">
                        Form thu thập thông tin
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* Tab Khách chưa thanh toán (Unpaid Orders) */}
                    <Tab.Pane eventKey="unpaid">
                      {loadingOrders ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" variant="danger" />{" "}
                          <span className="ms-2">{t.loadingOrders}</span>
                        </div>
                      ) : errorOrders ? (
                        <Alert variant="danger">{errorOrders}</Alert>
                      ) : (
                        <Container fluid className="p-0">
                          <Card className="shadow-sm border-danger">
                            <Card.Header className="bg-white text-danger fw-bold d-flex align-items-center">
                              <FaShoppingCart className="me-2" />
                              {t.unpaidList}
                            </Card.Header>
                            <Card.Body>
                              {unpaidOrders.length > 0 ? (
                                <Table
                                  responsive
                                  hover
                                  bordered
                                  striped
                                  className="mt-2"
                                >
                                  <thead className="table-light">
                                    <tr>
                                      <th>{t.fullName}</th>
                                      <th>Email</th>
                                      <th>{t.phone}</th>
                                      <th>{t.courseInterested}</th>
                                      <th>{t.amountVnd}</th>
                                      <th>{t.status}</th>
                                      <th>{t.createdDate}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {unpaidOrders.map((order, i) => (
                                      <tr key={i}>
                                        <td className="fw-bold">
                                          {order.customerName}
                                        </td>
                                        <td>{order.customerEmail}</td>
                                        <td>{order.customerPhone}</td>
                                        <td>{order.courseName}</td>
                                        <td className="text-danger fw-bold">
                                          {new Intl.NumberFormat(locale).format(
                                            order.totalAmount,
                                          )}
                                        </td>
                                        <td>
                                          <Badge bg="warning" text="dark">
                                            {t.pendingStatus}
                                          </Badge>
                                        </td>
                                        <td>
                                          {new Date(
                                            order.createdAt,
                                          ).toLocaleString(locale)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <div className="text-center p-4 text-muted">
                                  {t.noUnpaid}
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
                          <Spinner animation="border" variant="success" />{" "}
                          <span className="ms-2">{t.loadingOrders}</span>
                        </div>
                      ) : errorOrders ? (
                        <Alert variant="danger">{errorOrders}</Alert>
                      ) : (
                        <Container fluid className="p-0">
                          <Card className="shadow-sm border-success">
                            <Card.Header className="bg-white text-success fw-bold d-flex align-items-center">
                              <FaShoppingCart className="me-2" />
                              {t.paidList}
                            </Card.Header>
                            <Card.Body>
                              {paidOrders.length > 0 ? (
                                <Table
                                  responsive
                                  hover
                                  bordered
                                  striped
                                  className="mt-2"
                                >
                                  <thead className="table-light">
                                    <tr>
                                      <th>{t.fullName}</th>
                                      <th>Email</th>
                                      <th>{t.phone}</th>
                                      <th>{t.course}</th>
                                      <th>{t.amountVnd}</th>
                                      <th>{t.status}</th>
                                      <th>{t.paymentDate}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paidOrders.map((order, i) => (
                                      <tr key={i}>
                                        <td className="fw-bold">
                                          {order.customerName}
                                        </td>
                                        <td>{order.customerEmail}</td>
                                        <td>{order.customerPhone}</td>
                                        <td>{order.courseName}</td>
                                        <td className="text-success fw-bold">
                                          {new Intl.NumberFormat(locale).format(
                                            order.totalAmount,
                                          )}
                                        </td>
                                        <td>
                                          <Badge bg="success">
                                            {t.paidStatus}
                                          </Badge>
                                        </td>
                                        <td>
                                          {new Date(
                                            order.createdAt,
                                          ).toLocaleString(locale)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <div className="text-center p-4 text-muted">
                                  {t.noPaid}
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
                          <Spinner animation="border" variant="primary" />{" "}
                          <span className="ms-2">{t.loadingCustomers}</span>
                        </div>
                      ) : errorLeads ? (
                        <Alert variant="danger">{errorLeads}</Alert>
                      ) : (
                        <Container fluid className="p-0">
                          <Card className="shadow-sm">
                            <Card.Header>{t.taskDetails}</Card.Header>
                            <Card.Body>
                              <Tab.Container
                                defaultActiveKey={leadTasks[0] || "all"}
                              >
                                <Nav variant="pills" className="mb-3">
                                  {leadTasks.map((taskName, idx) => (
                                    <Nav.Item key={idx}>
                                      <Nav.Link
                                        eventKey={taskName}
                                        className="me-2 mb-2 border rounded"
                                      >
                                        {taskName} (
                                        {groupedLeads[taskName].length})
                                      </Nav.Link>
                                    </Nav.Item>
                                  ))}
                                </Nav>
                                <Tab.Content>
                                  {leadTasks.map((taskName, idx) => (
                                    <Tab.Pane eventKey={taskName} key={idx}>
                                      <Table
                                        responsive
                                        hover
                                        bordered
                                        striped
                                        className="mt-2"
                                      >
                                        <thead className="table-light">
                                          <tr>
                                            <th>{t.fullName}</th>
                                            <th>Email</th>
                                            <th>{t.phone}</th>
                                            <th>{t.source}</th>
                                            <th>{t.registeredDate}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {groupedLeads[taskName].map(
                                            (lead, i) => (
                                              <tr key={i}>
                                                <td className="fw-bold">
                                                  {lead.fullName}
                                                </td>
                                                <td>{lead.email}</td>
                                                <td>{lead.phone}</td>
                                                <td>
                                                  {lead.source || "Website"}
                                                </td>
                                                <td>
                                                  {new Date(
                                                    lead.createdAt,
                                                  ).toLocaleString(locale)}
                                                </td>
                                              </tr>
                                            ),
                                          )}
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

                    {/* Tab Mailchimp theo Tags */}
                    <Tab.Pane eventKey="mailchimp">
                      {loadingMailchimp ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" variant="info" />{" "}
                          <span className="ms-2">{t.loadingMailchimp}</span>
                        </div>
                      ) : errorMailchimp ? (
                        <Alert variant="danger">{errorMailchimp}</Alert>
                      ) : (
                        <Container fluid className="p-0">
                          <Card className="shadow-sm border-info">
                            <Card.Header className="bg-white text-info fw-bold">
                              {t.mailchimpList}
                            </Card.Header>
                            <Card.Body>
                              <Tab.Container
                                defaultActiveKey={
                                  Object.keys(mailchimpData)[0] || "all"
                                }
                              >
                                <Nav variant="pills" className="mb-3">
                                  {Object.keys(mailchimpData).map(
                                    (tagName, idx) => (
                                      <Nav.Item key={idx}>
                                        <Nav.Link
                                          eventKey={tagName}
                                          className="me-2 mb-2 border rounded"
                                        >
                                          {tagName} (
                                          {mailchimpData[tagName].length})
                                        </Nav.Link>
                                      </Nav.Item>
                                    ),
                                  )}
                                </Nav>
                                <Tab.Content>
                                  {Object.keys(mailchimpData).map(
                                    (tagName, idx) => {
                                      const currentTab =
                                        currentPageMailchimp[tagName] || 1;
                                      const indexOfLastItem =
                                        currentTab * itemsPerPage;
                                      const indexOfFirstItem =
                                        indexOfLastItem - itemsPerPage;
                                      const currentItems = mailchimpData[
                                        tagName
                                      ].slice(
                                        indexOfFirstItem,
                                        indexOfLastItem,
                                      );
                                      const totalPages = Math.ceil(
                                        mailchimpData[tagName].length /
                                          itemsPerPage,
                                      );

                                      return (
                                        <Tab.Pane eventKey={tagName} key={idx}>
                                          <Table
                                            responsive
                                            hover
                                            bordered
                                            striped
                                            className="mt-2"
                                          >
                                            <thead className="table-light">
                                              <tr>
                                                <th>{t.fullName}</th>
                                                <th>Email</th>
                                                <th>{t.phone}</th>
                                                <th>{t.syncDate}</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {currentItems.map((member, i) => (
                                                <tr key={i}>
                                                  <td className="fw-bold">
                                                    {member.fullName}
                                                  </td>
                                                  <td>{member.email}</td>
                                                  <td>
                                                    {member.phone ||
                                                      t.notUpdated}
                                                  </td>
                                                  <td>
                                                    {new Date(
                                                      member.createdAt,
                                                    ).toLocaleString(locale)}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>

                                          {totalPages > 1 && (
                                            <div className="d-flex justify-content-end mt-3">
                                              <Pagination>
                                                <Pagination.First
                                                  onClick={() =>
                                                    handlePageChangeMailchimp(
                                                      tagName,
                                                      1,
                                                    )
                                                  }
                                                  disabled={currentTab === 1}
                                                />
                                                <Pagination.Prev
                                                  onClick={() =>
                                                    handlePageChangeMailchimp(
                                                      tagName,
                                                      currentTab - 1,
                                                    )
                                                  }
                                                  disabled={currentTab === 1}
                                                />

                                                <Pagination.Item active>
                                                  {t.page} {currentTab} /{" "}
                                                  {totalPages}
                                                </Pagination.Item>

                                                <Pagination.Next
                                                  onClick={() =>
                                                    handlePageChangeMailchimp(
                                                      tagName,
                                                      currentTab + 1,
                                                    )
                                                  }
                                                  disabled={
                                                    currentTab === totalPages
                                                  }
                                                />
                                                <Pagination.Last
                                                  onClick={() =>
                                                    handlePageChangeMailchimp(
                                                      tagName,
                                                      totalPages,
                                                    )
                                                  }
                                                  disabled={
                                                    currentTab === totalPages
                                                  }
                                                />
                                              </Pagination>
                                            </div>
                                          )}
                                        </Tab.Pane>
                                      );
                                    },
                                  )}
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
                        .filter((post) => post.category === "campaign")
                        .map((post) => (
                          <Card key={post._id} className="mb-3 shadow-sm">
                            <Card.Body>
                              <Row>
                                <Col sm="1" className="text-center">
                                  <div
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      backgroundColor: "#6c757d",
                                      color: "#fff",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "bold",
                                      fontSize: "18px",
                                    }}
                                  >
                                    {post.uploadedBy.firstname.charAt(0)}
                                  </div>
                                </Col>
                                <Col>
                                  <div>
                                    <strong>
                                      {post.uploadedBy.lastname}{" "}
                                      {post.uploadedBy.firstname}{" "}
                                    </strong>{" "}
                                    •{" "}
                                    <span className="text-muted">
                                      {post.uploadedBy.role.name}
                                    </span>
                                  </div>
                                  <small className="text-muted">
                                    {formatDate(post.createdAt)}
                                  </small>
                                  <h5 className="mt-2">{post.title}</h5>
                                  <p>
                                    {post.description
                                      .split("\n")
                                      .map((item, index) => (
                                        <React.Fragment key={index}>
                                          {item}
                                          <br />
                                        </React.Fragment>
                                      ))}
                                  </p>
                                  {post.imageUrl && (
                                    <img
                                      src={
                                        newPost.image ||
                                        "http://via.placeholder.com/150"
                                      } // Sử dụng imageUrl từ API nếu có, nếu không thì dùng placeholder
                                      alt={post.title}
                                      style={{
                                        maxWidth: "70%",
                                        height: "auto",
                                        borderRadius: "0px",
                                      }}
                                    />
                                  )}

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      marginBottom: "10px",
                                    }}
                                  >
                                    <Button
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "#007bff"
                                            : "white", // Nếu đã thích thì nền xanh, nếu chưa thích thì nền trắng
                                        borderRadius: "50%",
                                        padding: "10px",
                                        border:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "none"
                                            : "#black", // Nếu đã thích thì không có viền, nếu chưa thích thì có viền
                                        color:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "white"
                                            : "#007bff", // Nếu đã thích thì chữ màu trắng, nếu chưa thích thì chữ màu xanh
                                        fontSize: "16px",
                                        cursor:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "not-allowed"
                                            : "pointer", // Nếu đã thích thì không thể bấm vào
                                        transition:
                                          "background-color 0.3s ease, border-color 0.3s ease", // Thêm hiệu ứng chuyển màu
                                      }}
                                      onClick={() => {
                                        if (
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                        ) {
                                          alert(t.alreadyLiked);
                                          return; // Nếu đã thích, không làm gì nữa
                                        }
                                        handleLike(post._id); // Nếu chưa thích, gọi handleLike để thực hiện hành động thích
                                      }}
                                      disabled={
                                        Array.isArray(post.likes) &&
                                        post.likes.some(
                                          (user) => user._id === userId,
                                        )
                                      } // Disable nếu đã thích
                                    >
                                      <FaThumbsUp
                                        style={{
                                          color:
                                            Array.isArray(post.likes) &&
                                            post.likes.some(
                                              (user) => user._id === userId,
                                            )
                                              ? "white"
                                              : "#007bff", // Nếu đã thích thì biểu tượng có màu trắng, nếu chưa thích thì màu xanh
                                          fontSize: "20px",
                                          marginRight: "3px",
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => toggleLikeModal(post)}
                                      style={{
                                        color: "#007bff", // Màu xanh nước biển cho chữ
                                        fontSize: "14px", // Điều chỉnh kích thước chữ nếu cần
                                        padding: "0", // Loại bỏ padding thừa quanh nút
                                        border: "none", // Loại bỏ viền nút
                                        backgroundColor: "transparent", // Nền trong suốt
                                      }}
                                    >
                                      {post.likesCount} {t.likes}
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
                                      {t.comment}
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
                        .filter((post) => post.category === "important")
                        .map((post) => (
                          <Card key={post._id} className="mb-3 shadow-sm">
                            <Card.Body>
                              <Row>
                                <Col sm="1" className="text-center">
                                  <div
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      backgroundColor: "#6c757d",
                                      color: "#fff",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "bold",
                                      fontSize: "18px",
                                    }}
                                  >
                                    {post.uploadedBy.firstname.charAt(0)}
                                  </div>
                                </Col>
                                <Col>
                                  <div>
                                    <strong>
                                      {post.uploadedBy.lastname}{" "}
                                      {post.uploadedBy.firstname}{" "}
                                    </strong>{" "}
                                    •{" "}
                                    <span className="text-muted">
                                      {post.uploadedBy.role.name}
                                    </span>
                                  </div>
                                  <small className="text-muted">
                                    {formatDate(post.createdAt)}
                                  </small>
                                  <h5 className="mt-2">{post.title}</h5>
                                  <p>
                                    {post.description
                                      .split("\n")
                                      .map((item, index) => (
                                        <React.Fragment key={index}>
                                          {item}
                                          <br />
                                        </React.Fragment>
                                      ))}
                                  </p>
                                  {post.imageUrl && (
                                    <img
                                      src={
                                        "http://via.placeholder.com/150" ||
                                        "http://via.placeholder.com/150"
                                      } // Sử dụng imageUrl từ API nếu có, nếu không thì dùng placeholder
                                      alt={post.title}
                                      style={{
                                        maxWidth: "70%",
                                        height: "auto",
                                        borderRadius: "0px",
                                      }}
                                    />
                                  )}

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      marginBottom: "10px",
                                    }}
                                  >
                                    <Button
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "#007bff"
                                            : "white", // Nếu đã thích thì nền xanh, nếu chưa thích thì nền trắng
                                        borderRadius: "50%",
                                        padding: "10px",
                                        border:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "none"
                                            : "#black", // Nếu đã thích thì không có viền, nếu chưa thích thì có viền
                                        color:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "white"
                                            : "#007bff", // Nếu đã thích thì chữ màu trắng, nếu chưa thích thì chữ màu xanh
                                        fontSize: "16px",
                                        cursor:
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                            ? "not-allowed"
                                            : "pointer", // Nếu đã thích thì không thể bấm vào
                                        transition:
                                          "background-color 0.3s ease, border-color 0.3s ease", // Thêm hiệu ứng chuyển màu
                                      }}
                                      onClick={() => {
                                        if (
                                          Array.isArray(post.likes) &&
                                          post.likes.some(
                                            (user) => user._id === userId,
                                          )
                                        ) {
                                          alert(t.alreadyLiked);
                                          return; // Nếu đã thích, không làm gì nữa
                                        }
                                        handleLike(post._id); // Nếu chưa thích, gọi handleLike để thực hiện hành động thích
                                      }}
                                      disabled={
                                        Array.isArray(post.likes) &&
                                        post.likes.some(
                                          (user) => user._id === userId,
                                        )
                                      } // Disable nếu đã thích
                                    >
                                      <FaThumbsUp
                                        style={{
                                          color:
                                            Array.isArray(post.likes) &&
                                            post.likes.some(
                                              (user) => user._id === userId,
                                            )
                                              ? "white"
                                              : "#007bff", // Nếu đã thích thì biểu tượng có màu trắng, nếu chưa thích thì màu xanh
                                          fontSize: "20px",
                                          marginRight: "3px",
                                        }}
                                      />
                                    </Button>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => toggleLikeModal(post)}
                                      style={{
                                        color: "#007bff", // Màu xanh nước biển cho chữ
                                        fontSize: "14px", // Điều chỉnh kích thước chữ nếu cần
                                        padding: "0", // Loại bỏ padding thừa quanh nút
                                        border: "none", // Loại bỏ viền nút
                                        backgroundColor: "transparent", // Nền trong suốt
                                      }}
                                    >
                                      {post.likesCount} {t.likes}
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
                                      {t.comment}
                                    </Button>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                    </Tab.Pane>
                    {/* Tab Rishikesh */}
                    <Tab.Pane eventKey="rishikesh">
                      <RishikeshFormsTab />
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
          <Modal.Title>{t.addComment}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedPost &&
          selectedPost.comments &&
          selectedPost.comments.length > 0 ? (
            selectedPost.comments.map((comment, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                {/* Hiển thị tên đầy đủ của người bình luận */}
                <div style={{ fontWeight: "bold" }}>
                  {comment.user.lastname} {comment.user.firstname}
                </div>
                {/* Hiển thị nội dung bình luận */}
                <div>{comment.text}</div>
                {/* Hiển thị thời gian bình luận */}
                <div style={{ fontSize: "small", color: "gray" }}>
                  {formatDate(comment.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div>{t.noComments}</div>
          )}
        </Modal.Body>
        <Form.Control
          as="textarea"
          rows={3}
          value={commentText}
          onChange={handleCommentChange}
          placeholder={t.commentPlaceholder}
        />
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCommentModal}>
            {t.cancel}
          </Button>
          <Button variant="primary" onClick={handleAddComment}>
            {t.addComment}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isLikeModalOpen} onHide={handleCloseLikeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t.likedBy}</Modal.Title>
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
              <ListGroup.Item>{t.nobody}</ListGroup.Item>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLikeModal}>
            {t.close}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t.newPost}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t.title}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t.titlePlaceholder}
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t.postType}</Form.Label>
              <Form.Select
                name="category"
                value={newPost.category}
                onChange={handleInputChange}
              >
                <option value="campaign">{t.campaign}</option>
                <option value="important">{t.importantTab}</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t.description}</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder={t.contentPlaceholder}
                name="description"
                value={newPost.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t.attachment}</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t.cancel}
          </Button>
          <Button variant="primary" onClick={handleSubmitPost}>
            {t.post}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkstreamPage;

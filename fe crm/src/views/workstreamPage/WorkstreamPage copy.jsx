import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';

import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Nav,
  Row,
  Tab
} from 'react-bootstrap';

import Dashboard from './Dashboard';

const WorkstreamPage = () => {
  const posts = [
    {
      id: 1,
      userName: 'Admin HT',
      role: 'Ban lãnh đạo',
      time: '05/12/2024 16:18',
      title: 'Chiến dịch bán nhẫn cầu hôn',
      content: 'Tôi vừa tạo mới chiến dịch: Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊 Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊 Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊',
      comments: [
        {
          userName: 'Admin HT',
          time: '05/12/2024 16:18',
          content: 'Tạo mới tin tức'
        },
        {
          userName: 'Admin HT',
          time: '05/12/2024 16:18',
          content: 'Tạo mới tin tức'
        }
      ]
    },
    {
      id: 2,
      userName: 'Nguyễn Thúy',
      role: 'CSKH',
      time: '27/11/2024 19:48',
      title: 'Thông báo ngày mai đi thị trường',
      content: 'Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊',
      comments: []
    },
    {
      id: 2,
      userName: 'Nguyễn Thúy',
      role: 'CSKH',
      time: '27/11/2024 19:48',
      title: 'Thông báo ngày mai đi thị trường',
      content: 'Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊',
      comments: []
    },
    {
      id: 2,
      userName: 'Nguyễn Thúy',
      role: 'CSKH',
      time: '27/11/2024 19:48',
      title: 'Thông báo ngày mai đi thị trường',
      content: 'Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊',
      comments: []
    },
    {
      id: 2,
      userName: 'Nguyễn Thúy',
      role: 'CSKH',
      time: '27/11/2024 19:48',
      title: 'Thông báo ngày mai đi thị trường',
      content: 'Đi thị trường phường 10, phường 11 và 12. Tất cả tập chung ở công ty lúc 8:30. Xin cảm ơn 😊😊😊😊😊',
      comments: []
    }
  ];
  return (
    <Container fluid>
      <Row>
        {/* <Dashboard /> */}
      </Row>
      <Row>
        <Col md={15}>
          <Container fluid style={{ width: '100%', padding: '0' }}>
          <Row className="bg-light border-bottom py-3">
            <Col md={12} className="d-flex justify-content-start align-items-center">
              <Button
                variant="primary"
                size="lg"
                style={{
                  fontSize: '0.8rem', // Kích thước chữ
                  padding: '0.6rem 1.2rem', // Padding nút
                  marginRight: '0.5rem', // Khoảng cách bên phải
                }}
              >
                Đăng bài
              </Button>
            </Col>
          </Row>
            <Row className="mt-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4>Workstream</h4>
                </div>
                <Tab.Container defaultActiveKey="bangtin">
                  <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="bangtin">Tin nhắn từ cô Tố Hải</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="tinquantrong">Tin quan trọng</Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    {/* Bảng tin */}
                    <Tab.Pane eventKey="bangtin">
                      {posts.map((post) => (
                        <Card key={post.id} className="mb-3 shadow-sm">
                          <Card.Body>
                            <Row>
                              <Col sm="1" className="text-center">
                                <div
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#004085',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '18px'
                                  }}
                                >
                                  {post.userName.charAt(0)}
                                </div>
                              </Col>
                              <Col>
                                <div>
                                  <strong>{post.userName}</strong> • {post.role} • <span className="text-muted">{post.time}</span>
                                </div>
                                <h6 className="mt-2">{post.title}</h6>
                                <p>
                                  {post.content}{' '}
                                  {post.link && (
                                    <a href="#" className="text-primary">
                                      {post.link}
                                    </a>
                                  )}
                                </p>
                                <div>
                                  <Button variant="link" size="sm" className="p-0 me-3">
                                    Thích
                                  </Button>
                                  <Button variant="link" size="sm" className="p-0 me-3">
                                    Bình luận
                                  </Button>
                                 
                                </div>
                                {post.comments.map((comment, idx) => (
                                  <div key={idx} className="mt-3 border-top pt-2">
                                    <strong>{comment.userName}</strong> • <span className="text-muted">{comment.time}</span>
                                    <p className="mb-0">{comment.content}</p>
                                  </div>
                                ))}
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </Tab.Pane>

                    {/* Tin quan trọng */}
                    <Tab.Pane eventKey="tinquantrong">
                      <p>Chưa có tin quan trọng nào.</p>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkstreamPage;

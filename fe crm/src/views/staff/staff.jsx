import React, { useState } from 'react';

import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

const Staff = () => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the visibility state
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Card.Title as="h5">Form controls</Card.Title>
              <Button>Tạo Nhân Viên</Button>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control type="email" placeholder="Enter email" />
                      <Form.Text className="text-muted">We&apos;ll never share your email with anyone else.</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicLastname">
                      <Form.Label>Last name</Form.Label>
                      <Form.Control type="lastname" placeholder="Lastname" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicFirstname">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control type="firstname" placeholder="Firstname" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'} // Toggle between password and text
                          placeholder="Password"
                        />
                        <InputGroup.Text>
                          <Button
                            variant="link"
                            onClick={togglePasswordVisibility}
                            style={{ border: 'none', background: 'transparent', color: 'black' }}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Show different icons based on state */}
                          </Button>
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                    <Button variant="primary">Submit</Button>
                  </Form>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlSelect1">
                    <Form.Label></Form.Label>
                    <Form.Control as="select">
                      <option>Admin</option>
                      <option>KTT Sale Manager</option>
                      <option>KTT Sale Team Leader</option>
                      <option>KTT User</option>
                      <option>KTT Partner</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Text</Form.Label>
                    <Form.Control type="email" placeholder="Text" />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Example textarea</Form.Label>
                    <Form.Control as="textarea" rows="3" />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Staff;

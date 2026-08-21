import React, { useState } from 'react';
import { Card, Dropdown, ListGroup } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link, useNavigate } from 'react-router-dom';

import avatar1 from '../../../../assets/images/user/avatar-1.jpg';
import avatar2 from '../../../../assets/images/user/avatar-2.jpg';
import avatar3 from '../../../../assets/images/user/avatar-3.jpg';
import avatar4 from '../../../../assets/images/user/avatar-4.jpg';
import ChatList from './ChatList';
import LanguageToggle from '../../../../components/LanguageToggle';

const NavRight = () => {
  const navigate = useNavigate();

  const handleLockOut = () => {
    localStorage.clear();
    window.location.reload();
    setTimeout(() => { navigate('/login'); }, 500);
  };

  const [listOpen, setListOpen] = useState(false);

  const notiData = [
    { name: 'Joseph William', image: avatar2, details: 'Purchase New Theme and make payment', activity: '30 min' },
    { name: 'Sara Soudein', image: avatar3, details: 'currently login', activity: '30 min' },
    { name: 'Suzen', image: avatar4, details: 'Purchase New Theme and make payment', activity: 'yesterday' }
  ];

  return (
    <React.Fragment>
      <style>
        {`
          @media (max-width: 991px) {
            .navbar-nav .icon.feather {
              color: #333 !important;
            }
            .navbar-nav > li > a {
              color: #333 !important;
            }
          }
        `}
      </style>
      {/* Toàn bộ nav-right nằm trên một hàng ngang */}
      <ul
        className="navbar-nav"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '4px',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}
      >
        {/* ── Bell notification ── */}
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown align="end">
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="feather icon-bell icon" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="notification notification-scroll">
              <div className="noti-head">
                <h6 className="d-inline-block m-b-0">Notifications</h6>
                <div className="float-end">
                  <Link to="#" className="me-2">mark as read</Link>
                  <Link to="#">clear all</Link>
                </div>
              </div>
              <PerfectScrollbar>
                <ListGroup as="ul" bsPrefix=" " variant="flush" className="noti-body">
                  <ListGroup.Item as="li" bsPrefix=" " className="n-title">
                    <p className="m-b-0">NEW</p>
                  </ListGroup.Item>
                  <ListGroup.Item as="li" bsPrefix=" " className="notification">
                    <Card className="d-flex align-items-center shadow-none mb-0 p-0" style={{ flexDirection: 'row', backgroundColor: 'unset' }}>
                      <img className="img-radius" src={avatar1} alt="Generic placeholder" />
                      <Card.Body className="p-0">
                        <p>
                          <strong>John Doe</strong>
                          <span className="n-time text-muted">
                            <i className="icon feather icon-clock me-2" />30 min
                          </span>
                        </p>
                        <p>New ticket Added</p>
                      </Card.Body>
                    </Card>
                  </ListGroup.Item>
                  <ListGroup.Item as="li" bsPrefix=" " className="n-title">
                    <p className="m-b-0">EARLIER</p>
                  </ListGroup.Item>
                  {notiData.map((data, index) => (
                    <ListGroup.Item key={index} as="li" bsPrefix=" " className="notification">
                      <Card className="d-flex align-items-center shadow-none mb-0 p-0" style={{ flexDirection: 'row', backgroundColor: 'unset' }}>
                        <img className="img-radius" src={data.image} alt="Generic placeholder" />
                        <Card.Body className="p-0">
                          <p>
                            <strong>{data.name}</strong>
                            <span className="n-time text-muted">
                              <i className="icon feather icon-clock me-2" />{data.activity}
                            </span>
                          </p>
                          <p>{data.details}</p>
                        </Card.Body>
                      </Card>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </PerfectScrollbar>
              <div className="noti-footer">
                <Link to="#">show all</Link>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </li>

        {/* ── Language Toggle ── */}
        <li style={{ display: 'flex', alignItems: 'center', padding: '0 2px' }}>
          <LanguageToggle />
        </li>

        {/* ── Mail / Chat ── */}
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown>
            <Dropdown.Toggle as={Link} variant="link" to="#" className="displayChatbox" onClick={() => setListOpen(true)}>
              <i className="icon feather icon-mail" />
            </Dropdown.Toggle>
          </Dropdown>
        </li>

        {/* ── Settings / Profile ── */}
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown align="end" className="drp-user">
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-settings">
              <i className="icon feather icon-settings" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <div className="pro-head">
                <img src={avatar1} className="img-radius" alt="User Profile" />
                <span>John Doe</span>
                <Link to="#" className="dud-logout" title="Logout">
                  <i className="feather icon-log-out" />
                </Link>
              </div>
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item">
                    <i className="feather icon-settings" /> Settings
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item">
                    <i className="feather icon-user" /> Profile
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item">
                    <i className="feather icon-mail" /> My Messages
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={handleLockOut}>
                    <i className="feather icon-lock" /> Log Out
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </li>
      </ul>

      <ChatList listOpen={listOpen} closed={() => setListOpen(false)} />
    </React.Fragment>
  );
};

export default NavRight;

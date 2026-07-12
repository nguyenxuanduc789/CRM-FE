import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GET_IP_URL, TIMEKEEPING_URL } from './config/api';

const TimekeepingForm = () => {
  const [status, setStatus] = useState('IN'); // Giá trị mặc định là 'IN'
  const [userId, setUserId] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [alertMessage, setAlertMessage] = useState({ message: '', variant: '' });
  const [currentTime, setCurrentTime] = useState(new Date()); // Thời gian thực

  // Lấy userId khi component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedFirstname = localStorage.getItem('firstnames');
    const storedLastname = localStorage.getItem('lastnames');
    
    if (storedUserId) setUserId(storedUserId);
    if (storedFirstname) setFirstname(storedFirstname);
    if (storedLastname) setLastname(storedLastname);
   

    // Cập nhật thời gian mỗi giây
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup khi component unmount
    return () => clearInterval(interval);
  }, []);

  // Định dạng thời gian theo kiểu: Thứ hai, 16/12/2024 09:41
  const formattedTime = currentTime.toLocaleString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  // Lấy tọa độ GPS
  const getLocation = () => {
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        console.error(error);
        setLocationError('Không thể lấy vị trí của bạn.');
      }
    );
  };

  // Gọi API chấm công
  const handleTimekeeping = async () => {
    if (!latitude || !longitude) {
      getLocation();
      return;
    }

    setLoading(true);
    try {
      const ip = await axios.get(GET_IP_URL);
      const response = await axios.post(TIMEKEEPING_URL, {
        userId,
        status,
        ip: ip.data.ip,
        latitude,
        longitude,
      });

      setAlertMessage({ message: response.data.message, variant: 'success' });
    } catch (error) {
      setAlertMessage({ message: 'Đã xảy ra lỗi khi chấm công. Vui lòng liên hệ IT.', variant: 'danger' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: '20rem', textAlign: 'center', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <Card.Body>
        <div className="mb-3">
          <img
            src="https://healthhub.khitamtherapy.com/wp-content/uploads/2024/08/HEALTHUB-1024x922.png"
            alt="User"
            style={{ borderRadius: '50%', width: '120px', height: '120px', objectFit: 'cover' }}
          />
        </div>
        <p style={{ fontSize: '0.9rem', color: '#777', margin: 0 }}>{formattedTime}</p>
        <h5 style={{ fontWeight: 'bold', marginTop: '10px', marginBottom: '20px' }}>
        Chào buổi sáng, {lastname} {firstname}
        </h5>
        {/* Alert thông báo */}
        {alertMessage.message && (
          <Alert variant={alertMessage.variant} onClose={() => setAlertMessage({ message: '', variant: '' })} dismissible>
            {alertMessage.message}
          </Alert>
        )}

        {/* Select box cho trạng thái IN/OUT */}
        <Form.Group controlId="statusSelect" className="mb-3">
          <Form.Label>Chọn trạng thái</Form.Label>
          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
          >
            <option value="IN">Chấm công vào</option>
            <option value="OUT">Chấm công ra</option>
          </Form.Select>
        </Form.Group>

        <Button
          variant="outline-success"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
          onClick={handleTimekeeping}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : (
            <>
              <i className="bi bi-calendar-check" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
              Xác nhận chấm công
            </>
          )}
        </Button>
        {locationError && <p style={{ color: 'red', marginTop: '10px' }}>{locationError}</p>}
      </Card.Body>
    </Card>
  );
};

export default TimekeepingForm;

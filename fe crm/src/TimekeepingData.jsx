import React, { useState } from 'react';

import axios from 'axios';

const TimekeepingData = () => {
  const [userId, setUserId] = useState('');
  const [timekeepingData, setTimekeepingData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFetchData = async () => {
    if (!userId) {
      setErrorMessage('Vui lòng nhập User ID');
      return;
    }
    try {
      // Gửi yêu cầu GET để lấy dữ liệu chấm công
      const response = await axios.get(`https://www.system.crmkhitam.com/api/v1/chamcong/getTimekeepingData?userId=${userId}`);

      // Cập nhật dữ liệu trả về vào state (Lấy timeLogs)
      setTimekeepingData(response.data.timeLogs || []);
      setErrorMessage(''); // Reset lỗi nếu có dữ liệu
    } catch (error) {
      // Xử lý lỗi
      if (error.response && error.response.status === 404) {
        setErrorMessage('Không có dữ liệu chấm công cho người dùng này');
      } else {
        setErrorMessage('Lỗi khi tải dữ liệu chấm công');
      }
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Danh sách Dữ liệu Chấm công</h2>

      <div>
        <label>User ID:</label>
        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Nhập User ID" />
      </div>

      <button onClick={handleFetchData}>Lấy Dữ liệu Chấm công</button>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {timekeepingData.length > 0 && (
        <div>
          <h3>Dữ liệu Chấm công:</h3>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Date</th>
                <th>IP</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {timekeepingData.map((item, index) => (
                <tr key={index}>
                  <td>{item.status}</td>
                  <td>{item.date}</td>

                  <td>{item.ip}</td>
                  <td>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimekeepingData;

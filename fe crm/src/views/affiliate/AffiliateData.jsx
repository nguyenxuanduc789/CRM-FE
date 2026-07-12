import React from 'react';

const AffiliateData = ({ summaryData, affiliateData }) => {
  // Tính tổng số click từ affiliateData (mỗi bản ghi được coi là một click)
  const totalClicks = affiliateData.length;

  return (
    <>
      <h3>Tổng hợp Affiliate:</h3>
      {totalClicks > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Tổng số lượng click</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{totalClicks}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="no-data">Không có dữ liệu tổng hợp affiliate để hiển thị.</p>
      )}

      <h3>Thông tin Khách hàng:</h3>
      {affiliateData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Affiliate Name</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {affiliateData.map((item) => (
              <tr key={item._id}>
                <td>{item.affiliate_name}</td>
                <td>{item.full_name || 'N/A'}</td>
                <td>{item.email || 'N/A'}</td>
                <td>{item.phone || 'N/A'}</td>
                <td>{new Date(item.datetime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">Không có dữ liệu affiliate để hiển thị.</p>
      )}
    </>
  );
};

export default AffiliateData;
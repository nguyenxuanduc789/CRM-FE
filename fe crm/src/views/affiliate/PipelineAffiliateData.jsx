import React from 'react';

const PipelineAffiliateData = ({ pipelineData }) => {
  // Tỷ lệ hoa hồng cố định là 30%
  const commissionRate = 0.3;

  return (
    <div>
      <h3>Danh sách đơn hàng Affiliate</h3>
      {pipelineData.length === 0 ? (
        <p className="no-data">Không có dữ liệu đơn hàng.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Thông tin Affiliate</th>
              <th>Tên khách hàng</th>
              <th>Số điện thoại</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>% Hoa hồng</th>
              <th>Trạng thái</th>
              <th>Hình ảnh</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {pipelineData.map((pipeline) => (
              <tr key={pipeline._id}>
                <td>{pipeline.orderCode}</td>
                <td>
                  {pipeline.affiliateInfo?.affiliate_id && pipeline.affiliateInfo?.affiliate_name
                    ? `${pipeline.affiliateInfo.affiliate_id} - ${pipeline.affiliateInfo.affiliate_name}`
                    : 'N/A'}
                </td>
                <td>{pipeline.contact?.name || 'N/A'}</td>
                <td>{pipeline.contact?.phone || 'N/A'}</td>
                <td>{pipeline.products?.map((product) => product.name).join(', ') || 'N/A'}</td>
                <td>{pipeline.amountTotal?.toLocaleString('vi-VN') || 'N/A'} VNĐ</td>
                <td>{pipeline.amountTotal ? (pipeline.amountTotal * commissionRate).toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}</td>
                <td>{pipeline.status || 'N/A'}</td>
                <td className="text-center">
                  {pipeline.images && pipeline.images.length > 0 ? (
                    <>
                      {pipeline.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => window.open(`https://www.system.crmkhitam.com${image.url}`, '_blank')}
                          style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginBottom: '5px',
                            display: 'block'
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
                          onMouseOut={(e) => (e.target.style.backgroundColor = '#4caf50')}
                        >
                          Xem ảnh {index + 1}
                        </button>
                      ))}
                    </>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{new Date(pipeline.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PipelineAffiliateData;

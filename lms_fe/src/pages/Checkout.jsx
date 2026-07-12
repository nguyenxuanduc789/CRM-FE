import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails, enrollCourse } from '../utils/lmsApi';
import './Checkout.css';

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    getCourseDetails(courseId)
      .then(res => setCourse(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleApplyCoupon = () => {
    // Mock logic for coupon
    if (couponCode.toUpperCase() === 'GIAM50') {
      setDiscount(course.price * 0.5);
      alert('Áp dụng mã giảm 50% thành công!');
    } else {
      alert('Mã không hợp lệ!');
      setDiscount(0);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const finalPrice = course.price - discount;
      await enrollCourse({ courseId, paymentAmount: finalPrice, paymentMethod: 'mock' });
      alert('🎉 Thanh toán thành công! Chúc bạn học tốt.');
      navigate(`/course/${courseId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>;
  if (!course) return <div style={{ padding: '40px', textAlign: 'center' }}>Khóa học không tồn tại</div>;

  const finalPrice = Math.max(0, course.price - discount);

  return (
    <div className="checkout-page">
      <div className="container checkout-container">
        <div className="checkout-left">
          <h2>Thanh toán khóa học</h2>
          
          <div className="checkout-course-card">
            <img src={course.thumbnail || 'https://via.placeholder.com/150'} alt={course.title} />
            <div className="checkout-course-info">
              <h3>{course.title}</h3>
              <p>👨‍🏫 Giảng viên: {course.instructor?.fullName || 'Admin'}</p>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Phương thức thanh toán</h3>
            <label className="payment-method active">
              <input type="radio" checked readOnly />
              <div className="method-info">
                <strong>Mock Payment (Giả lập)</strong>
                <p>Mô phỏng thanh toán trực tiếp không cần thẻ thật.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="checkout-right">
          <div className="order-summary">
            <h3>Tóm tắt đơn hàng</h3>
            
            <div className="summary-row">
              <span>Giá gốc:</span>
              <span>{course.price.toLocaleString()}đ</span>
            </div>
            
            <div className="summary-row">
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString()}đ</span>
            </div>
            
            <hr />
            
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{finalPrice.toLocaleString()}đ</span>
            </div>

            <div className="coupon-box">
              <input 
                type="text" 
                placeholder="Nhập mã giảm giá..." 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
              />
              <button onClick={handleApplyCoupon}>Áp dụng</button>
            </div>

            <button 
              className="btn btn-primary btn-checkout" 
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
            <p className="secure-checkout">🔒 Thanh toán bảo mật an toàn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../utils/lmsApi';
import CourseCard from '../components/CourseCard';

const Wishlist = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = () => {
    getWishlist()
      .then(res => setCourses(res.data.data?.courses?.map(c => c.course) || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleRemove = async (courseId) => {
    try {
      await removeFromWishlist(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải wishlist...</div>;

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh', background: 'var(--bg-light)' }}>
      <div className="container">
        <h2 style={{ marginBottom: '30px', color: 'var(--text-dark)' }}>Khóa Học Yêu Thích Của Tôi ❤️</h2>
        {courses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {courses.map(course => (
              <div key={course._id} style={{ position: 'relative' }}>
                <CourseCard course={course} />
                <button 
                  onClick={() => handleRemove(course._id)}
                  style={{ position: 'absolute', top: '10px', left: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: 'red', fontSize: '18px', zIndex: 10 }}
                  title="Xóa khỏi Wishlist"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💔</div>
            <h3>Danh sách yêu thích trống</h3>
            <p style={{ color: '#64748b' }}>Bạn chưa thêm khóa học nào vào danh sách yêu thích.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

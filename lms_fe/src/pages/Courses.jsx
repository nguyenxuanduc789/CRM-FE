import React, { useState, useEffect } from 'react';
import { searchCourses, getCategories } from '../utils/lmsApi';
import CourseCard from '../components/CourseCard';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    // Load categories
    getCategories().then(res => setCategories(res.data.data)).catch(console.error);
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    // Remove empty filters
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
    
    searchCourses(cleanFilters)
      .then(res => setCourses(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="courses-page">
      <div className="courses-hero">
        <div className="container">
          <h1>Khám Phá Khóa Học</h1>
          <p>Nâng cao kỹ năng của bạn với hàng ngàn khóa học chất lượng cao.</p>
          <form className="search-bar" onSubmit={applyFilters}>
            <input 
              type="text" 
              name="search"
              placeholder="Bạn muốn học gì hôm nay?" 
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button type="submit" className="btn btn-primary">Tìm kiếm</button>
          </form>
        </div>
      </div>

      <div className="container courses-container">
        {/* Sidebar Filters */}
        <aside className="courses-sidebar">
          <div className="filter-group">
            <h3>Danh mục</h3>
            <ul>
              <li 
                className={filters.category === '' ? 'active' : ''}
                onClick={() => { setFilters({...filters, category: ''}); setTimeout(fetchCourses, 50) }}
              >
                Tất cả
              </li>
              {categories.map(cat => (
                <li 
                  key={cat._id}
                  className={filters.category === cat._id ? 'active' : ''}
                  onClick={() => { setFilters({...filters, category: cat._id}); setTimeout(fetchCourses, 50) }}
                >
                  {cat.icon} {cat.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h3>Cấp độ</h3>
            <select name="level" value={filters.level} onChange={handleFilterChange} className="form-control">
              <option value="">Tất cả cấp độ</option>
              <option value="beginner">Người mới bắt đầu</option>
              <option value="intermediate">Trung bình</option>
              <option value="advanced">Nâng cao</option>
            </select>
          </div>

          <div className="filter-group">
            <h3>Mức giá</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" name="minPrice" placeholder="Từ" className="form-control" value={filters.minPrice} onChange={handleFilterChange} />
              <input type="number" name="maxPrice" placeholder="Đến" className="form-control" value={filters.maxPrice} onChange={handleFilterChange} />
            </div>
          </div>

          <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }} onClick={fetchCourses}>
            Áp dụng bộ lọc
          </button>
        </aside>

        {/* Course Grid */}
        <main className="courses-main">
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="skeleton-card"></div>)}
            </div>
          ) : courses.length > 0 ? (
            <div className="course-grid">
              {courses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span style={{ fontSize: '64px' }}>🔍</span>
              <h3>Không tìm thấy khóa học nào!</h3>
              <p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
              <button className="btn btn-outline" onClick={() => {
                setFilters({ search: '', category: '', level: '', minPrice: '', maxPrice: '' });
                setTimeout(fetchCourses, 50);
              }}>Xóa bộ lọc</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Courses;

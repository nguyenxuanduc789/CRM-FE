import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getCourseDetails, createCourse, updateCourse, 
  adminGetCategories, submitCourseForApproval,
  createSection, updateSection, deleteSection,
  createActivity, updateActivity, deleteActivity,
  uploadVideo
} from '../../utils/lmsApi';
import { useAuth } from '../../contexts/AuthContext';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';
  
  const [activeTab, setActiveTab] = useState('info');
  const [categories, setCategories] = useState([]);
  const [courseData, setCourseData] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, thumbnail: '',
    level: 'beginner', category: '', requirements: [], objectives: []
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(() => {
    adminGetCategories().then(res => setCategories(res.data.data || [])).catch(console.error);
    if (!isNew) {
      loadCourse();
    }
  }, [id, isNew]);

  const loadCourse = async () => {
    try {
      const res = await getCourseDetails(id);
      const c = res.data.data;
      setCourseData(c);
      setFormData({
        title: c.title,
        description: c.description || '',
        price: c.price || 0,
        thumbnail: c.thumbnail || '',
        level: c.level || 'beginner',
        category: c.category?._id || c.category || '',
        requirements: c.requirements || [],
        objectives: c.objectives || []
      });
    } catch (err) {
      console.error(err);
      alert('Không thể tải khóa học');
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isNew) {
        const res = await createCourse(formData);
        alert('Tạo khóa học thành công!');
        navigate(`/instructor/courses/${res.data.data._id}/edit`);
      } else {
        await updateCourse(id, formData);
        alert('Cập nhật thông tin thành công!');
        loadCourse();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (window.confirm('Gửi khóa học này để Admin duyệt? Khóa học sẽ được xuất bản nếu được chấp nhận.')) {
      try {
        await submitCourseForApproval(id);
        alert('Đã gửi yêu cầu phê duyệt!');
        loadCourse();
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  // ----- CURRICULUM MANAGEMENT -----
  const handleAddSection = async () => {
    const title = window.prompt('Nhập tên phần học (Ví dụ: Phần 1: Giới thiệu)');
    if (title) {
      try {
        await createSection(id, { title, order: (courseData.sections?.length || 0) + 1 });
        loadCourse();
      } catch (err) { alert('Lỗi tạo section'); }
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Xóa phần học này sẽ xóa tất cả bài học bên trong. Chắc chắn?')) {
      try {
        await deleteSection(sectionId);
        loadCourse();
      } catch (err) { alert('Lỗi xóa section'); }
    }
  };

  const handleAddActivity = async (sectionId, type) => {
    const title = window.prompt(`Nhập tên bài học (${type === 'video' ? 'Video' : 'Trắc nghiệm'}):`);
    if (title) {
      try {
        await createActivity(sectionId, { 
          title, 
          type, 
          order: courseData.sections.find(s => s._id === sectionId)?.activities?.length || 0 
        });
        loadCourse();
      } catch (err) { alert('Lỗi tạo activity'); }
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Chắc chắn xóa bài học này?')) {
      try {
        await deleteActivity(activityId);
        loadCourse();
      } catch (err) { alert('Lỗi xóa activity'); }
    }
  };

  const handleUploadVideo = async (activityId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('video', file);
    try {
      setUploadProgress(0);
      const res = await uploadVideo(fd, (evt) => {
        setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      // Now update the activity with the URL and duration
      await updateActivity(activityId, { 
        videoUrl: res.data.data.url, 
        duration: res.data.data.duration || 0 
      });
      alert('Tải lên thành công!');
      loadCourse();
    } catch (err) {
      alert('Lỗi tải video');
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>{isNew ? 'Tạo Khóa Học Mới' : 'Quản Lý Khóa Học'}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isNew && !courseData?.isApproved && (
            <button className="btn btn-primary" onClick={handleSubmitApproval}>Gửi Phê Duyệt</button>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/instructor/courses')}>Quay lại</button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button 
            style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'info' ? 'white' : 'transparent', fontWeight: activeTab === 'info' ? 'bold' : 'normal', color: activeTab === 'info' ? 'var(--primary-color)' : '#64748b', cursor: 'pointer', borderBottom: activeTab === 'info' ? '2px solid var(--primary-color)' : 'none' }}
            onClick={() => setActiveTab('info')}
          >
            1. Thông tin cơ bản
          </button>
          <button 
            style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'content' ? 'white' : 'transparent', fontWeight: activeTab === 'content' ? 'bold' : 'normal', color: activeTab === 'content' ? 'var(--primary-color)' : '#64748b', cursor: 'pointer', borderBottom: activeTab === 'content' ? '2px solid var(--primary-color)' : 'none' }}
            onClick={() => setActiveTab('content')}
            disabled={isNew}
          >
            2. Chương trình giảng dạy
          </button>
        </div>

        <div style={{ padding: '30px' }}>
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên khóa học</label>
                <input type="text" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mô tả chi tiết</label>
                <textarea className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '150px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Giá bán (VNĐ)</label>
                  <input type="number" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Danh mục</label>
                  <select className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Cấp độ</label>
                  <select className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                    <option value="beginner">Người mới bắt đầu</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>URL Ảnh Bìa (Thumbnail)</label>
                <input type="text" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://..." />
                {formData.thumbnail && <img src={formData.thumbnail} alt="preview" style={{ marginTop: '10px', height: '100px', borderRadius: '4px', objectFit: 'cover' }} />}
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu Thông Tin'}
              </button>
            </form>
          )}

          {activeTab === 'content' && !isNew && courseData && (
            <div>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Bắt đầu tạo chương trình học bằng cách thêm các Phần (Sections) và Bài học (Activities).</p>
              
              {courseData.sections?.map((section, sIndex) => (
                <div key={section._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', background: '#f8fafc', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0' }}>Phần {sIndex + 1}: {section.title}</h4>
                    <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDeleteSection(section._id)}>Xóa Phần Học</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {section.activities?.map((act, aIndex) => (
                      <div key={act._id} style={{ background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>Bài {aIndex + 1}: {act.title}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            Loại: {act.type === 'video' ? '📺 Video' : act.type === 'quiz' ? '📝 Bài tập / Trắc nghiệm' : act.type === 'document' ? '📄 Tài liệu' : act.type}
                            {act.videoUrl && ' • Đã tải video'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {act.type === 'video' && (
                            <label className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer', margin: 0 }}>
                              {act.videoUrl ? 'Thay đổi Video' : 'Tải lên Video'}
                              <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleUploadVideo(act._id, e.target.files[0])} />
                            </label>
                          )}
                          {act.type === 'quiz' && (
                            <Link to={`/instructor/courses/${id}/quiz/${act._id}`} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px', textDecoration: 'none' }}>
                              Soạn câu hỏi
                            </Link>
                          )}
                          <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDeleteActivity(act._id)}>Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button className="btn btn-outline" style={{ fontSize: '13px', borderStyle: 'dashed' }} onClick={() => handleAddActivity(section._id, 'video')}>+ Thêm Bài Video</button>
                    <button className="btn btn-outline" style={{ fontSize: '13px', borderStyle: 'dashed' }} onClick={() => handleAddActivity(section._id, 'quiz')}>+ Thêm Trắc Nghiệm</button>
                  </div>
                </div>
              ))}

              <button className="btn btn-primary" onClick={handleAddSection}>+ Thêm Phần Học Mới</button>
              
              {uploadProgress !== null && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0', zIndex: 1000 }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Đang tải lên Video...</p>
                  <div style={{ width: '200px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.2s' }}></div>
                  </div>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', textAlign: 'right' }}>{uploadProgress}%</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;

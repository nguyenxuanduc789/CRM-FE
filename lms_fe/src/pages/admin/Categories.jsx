import React, { useState, useEffect } from 'react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../utils/lmsApi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await adminGetCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminUpdateCategory(editingId, formData);
        alert('Cập nhật thành công');
      } else {
        await adminCreateCategory(formData);
        alert('Thêm mới thành công');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', icon: '' });
      fetchCats();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, slug: cat.slug || '', description: cat.description || '', icon: cat.icon || '' });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Chắc chắn xóa danh mục này?')) {
      try {
        await adminDeleteCategory(id);
        fetchCats();
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Quản Lý Danh Mục</h2>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', slug: '', description: '', icon: '' }); }}>
            + Thêm Danh Mục
          </button>
        )}
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--primary-color)' }}>
          <h3>{editingId ? 'Sửa danh mục' : 'Thêm mới danh mục'}</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tên danh mục *</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Slug (Đường dẫn)</label>
                <input type="text" className="form-control" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="VD: lap-trinh-web" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả ngắn</label>
              <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Icon (Emoji)</label>
              <input type="text" className="form-control" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="💻" style={{ width: '100px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Lưu lại</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        {loading ? <p>Đang tải...</p> : (
          <table className="admin-table">
            <thead><tr><th>ID / Icon</th><th>Tên Danh Mục</th><th>Đường Dẫn</th><th>Thao Tác</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c._id}>
                  <td>{c.icon || '📂'}</td>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px'}} onClick={() => handleEdit(c)}>Sửa</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDelete(c._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chưa có danh mục nào</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Categories;

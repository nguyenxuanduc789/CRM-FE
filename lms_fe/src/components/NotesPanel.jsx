import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '../utils/lmsApi';

const NotesPanel = ({ courseId, activityId, getCurrentTime, seekTo }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const fetchNotes = async () => {
    if (!activityId) return;
    setLoading(true);
    try {
      const res = await getNotes({ courseId, activityId });
      const data = res.data.data || res.data || [];
      setNotes(Array.isArray(data) ? data.sort((a, b) => a.timestamp - b.timestamp) : []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [activityId]);

  const formatTime = (secs) => {
    if (!secs && secs !== 0) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const t = getCurrentTime ? getCurrentTime() : 0;
      await createNote({ courseId, activityId, content: newText.trim(), timestamp: t });
      setNewText('');
      fetchNotes();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      await updateNote(id, { content: editText.trim() });
      setEditingId(null);
      fetchNotes();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa ghi chú này?')) return;
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Add Note */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: '8px', fontSize: '13px', color: '#666', fontWeight: '500' }}>
          📝 Thêm ghi chú tại vị trí hiện tại
        </div>
        <textarea
          ref={textareaRef}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Nhập ghi chú của bạn..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={saving || !newText.trim()}
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '8px',
            background: '#00B1B0',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          {saving ? 'Đang lưu...' : '+ Thêm ghi chú'}
        </button>
      </div>

      {/* Notes List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Đang tải...</div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
            <div>Chưa có ghi chú nào</div>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              style={{
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
              >
                <button
                  onClick={() => seekTo && seekTo(note.timestamp)}
                  style={{
                    background: '#00B1B022',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    color: '#00B1B0',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  ⏱ {formatTime(note.timestamp)}
                </button>
                <span style={{ fontSize: '11px', color: '#aaa' }}>
                  {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {editingId === note._id ? (
                <>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #00B1B0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button
                      onClick={() => handleEdit(note._id)}
                      style={{ flex: 1, padding: '6px', background: '#00B1B0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ flex: 1, padding: '6px', background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Huỷ
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#333', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                    {note.content}
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { setEditingId(note._id); setEditText(note.content); }}
                      style={{ padding: '3px 10px', fontSize: '11px', background: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#555' }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      style={{ padding: '3px 10px', fontSize: '11px', background: '#fee', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#e74c3c' }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPanel;

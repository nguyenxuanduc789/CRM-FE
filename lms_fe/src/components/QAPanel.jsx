import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getQA, createQuestion, addAnswer, upvoteQuestion } from '../utils/lmsApi';

const QAPanel = ({ courseId, activityId }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('list');
  const [expandedId, setExpandedId] = useState(null);
  const [answerTexts, setAnswerTexts] = useState({});
  const [newQ, setNewQ] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchQA = async () => {
    setLoading(true);
    try {
      const params = { courseId };
      if (activityId) params.activityId = activityId;
      const res = await getQA(params);
      setQuestions(res.data.data || res.data || []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQA(); }, [courseId, activityId]);

  const handleAsk = async () => {
    if (!newQ.title.trim()) return;
    setSubmitting(true);
    try {
      await createQuestion({ courseId, activityId, title: newQ.title, content: newQ.content });
      setNewQ({ title: '', content: '' });
      setTab('list');
      fetchQA();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (qId) => {
    if (!answerTexts[qId]?.trim()) return;
    try {
      await addAnswer(qId, { content: answerTexts[qId] });
      setAnswerTexts(p => ({ ...p, [qId]: '' }));
      fetchQA();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpvote = async (qId) => {
    try {
      await upvoteQuestion(qId);
      fetchQA();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0' }}>
        {[['list', '❓ Câu hỏi'], ['ask', '✏️ Đặt câu hỏi']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              borderBottom: tab === key ? '2px solid #00B1B0' : '2px solid transparent',
              color: tab === key ? '#00B1B0' : '#666',
              marginBottom: '-2px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'ask' ? (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Tiêu đề câu hỏi *
              </label>
              <input
                value={newQ.title}
                onChange={e => setNewQ(p => ({ ...p, title: e.target.value }))}
                placeholder="Câu hỏi ngắn gọn..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                Chi tiết (tùy chọn)
              </label>
              <textarea
                value={newQ.content}
                onChange={e => setNewQ(p => ({ ...p, content: e.target.value }))}
                placeholder="Mô tả chi tiết hơn..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={handleAsk}
              disabled={submitting || !newQ.title.trim()}
              style={{
                width: '100%',
                padding: '10px',
                background: '#00B1B0',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '12px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Đang tải...</div>
            ) : questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>❓</div>
                <div>Chưa có câu hỏi nào</div>
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q._id}
                  style={{
                    background: '#fff',
                    border: '1px solid #f0f0f0',
                    borderRadius: '10px',
                    marginBottom: '10px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Question Header */}
                  <div
                    style={{ padding: '12px', cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a2e', marginBottom: '4px' }}>
                          {q.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {q.user?.fullName || 'Ẩn danh'} •{' '}
                          {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {q.resolved && (
                          <span style={{ fontSize: '10px', background: '#d4edda', color: '#28a745', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                            ✓ Đã giải quyết
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpvote(q._id); }}
                          style={{
                            background: 'none',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            color: '#666',
                          }}
                        >
                          👍 {q.upvotes || 0}
                        </button>
                        <span style={{ fontSize: '11px', color: '#999' }}>
                          💬 {q.answers?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Answers + Answer Form */}
                  {expandedId === q._id && (
                    <div style={{ borderTop: '1px solid #f5f5f5', padding: '12px', background: '#fafafa' }}>
                      {q.content && (
                        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: '1.5' }}>
                          {q.content}
                        </p>
                      )}
                      {(q.answers || []).map((ans, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#fff',
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>
                            {ans.user?.fullName || 'Giảng viên'} •{' '}
                            {new Date(ans.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                          <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.5' }}>
                            {ans.content}
                          </div>
                        </div>
                      ))}
                      {/* Answer Form */}
                      <div style={{ marginTop: '8px' }}>
                        <textarea
                          value={answerTexts[q._id] || ''}
                          onChange={e => setAnswerTexts(p => ({ ...p, [q._id]: e.target.value }))}
                          placeholder="Viết câu trả lời..."
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '13px',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          onClick={() => handleAnswer(q._id)}
                          disabled={!answerTexts[q._id]?.trim()}
                          style={{
                            marginTop: '6px',
                            padding: '6px 14px',
                            background: '#00B1B0',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          Trả lời
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QAPanel;

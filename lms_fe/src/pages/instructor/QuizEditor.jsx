import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetQuiz, adminUpdateQuiz, adminCreateQuiz } from '../../utils/lmsApi';

const QuizEditor = () => {
  const { courseId, activityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Bài tập trắc nghiệm',
    description: '',
    timeLimit: 0,
    passingScore: 70,
    questions: []
  });

  useEffect(() => {
    loadQuiz();
  }, [activityId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Giả sử API getQuiz theo activityId
      const res = await adminGetQuiz(activityId);
      if (res.data.data) {
        setQuizId(res.data.data._id);
        setFormData({
          title: res.data.data.title || '',
          description: res.data.data.description || '',
          timeLimit: res.data.data.timeLimit || 0,
          passingScore: res.data.data.passingScore || 70,
          questions: res.data.data.questions || []
        });
      }
    } catch (err) {
      // Chưa có quiz cho activity này
      console.log("No quiz found, will create new");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        activity: activityId,
        title: formData.title,
        description: formData.description,
        timeLimit: formData.timeLimit,
        passingScore: formData.passingScore,
        questions: formData.questions
      };

      if (quizId) {
        await adminUpdateQuiz(quizId, payload);
        alert('Cập nhật bộ đề thành công!');
      } else {
        const res = await adminCreateQuiz(payload);
        setQuizId(res.data.data._id);
        alert('Tạo bộ đề mới thành công!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi lưu bộ đề');
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions, 
        { questionText: '', type: 'single_choice', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
      ]
    }));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = [...formData.questions];
    updated.splice(index, 1);
    setFormData({ ...formData, questions: updated });
  };

  const addOption = (qIndex) => {
    const updated = [...formData.questions];
    updated[qIndex].options.push({ text: '', isCorrect: false });
    setFormData({ ...formData, questions: updated });
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const updated = [...formData.questions];
    
    // Nếu là trắc nghiệm 1 đáp án, chuyển các đáp án khác thành false
    if (field === 'isCorrect' && value === true && updated[qIndex].type === 'single_choice') {
      updated[qIndex].options.forEach(opt => opt.isCorrect = false);
    }
    
    updated[qIndex].options[oIndex][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...formData.questions];
    updated[qIndex].options.splice(oIndex, 1);
    setFormData({ ...formData, questions: updated });
  };

  if (loading) return <div style={{ padding: '40px' }}>Đang tải bộ đề...</div>;

  return (
    <div style={{ paddingBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)' }}>Quản Lý Bộ Đề Trắc Nghiệm</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}>Về khóa học</button>
          <button className="btn btn-primary" onClick={handleSave}>Lưu Bộ Đề</button>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3>Cài đặt chung</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tên bộ đề</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả ngắn</label>
            <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Giới hạn thời gian (Phút) - Nhập 0 để không giới hạn</label>
            <input type="number" className="form-control" value={formData.timeLimit} onChange={e => setFormData({...formData, timeLimit: Number(e.target.value)})} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Điểm để qua môn (%)</label>
            <input type="number" className="form-control" value={formData.passingScore} onChange={e => setFormData({...formData, passingScore: Number(e.target.value)})} style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Danh sách câu hỏi ({formData.questions.length})</h3>
        <button className="btn btn-primary" onClick={addQuestion}>+ Thêm câu hỏi mới</button>
      </div>

      {formData.questions.map((q, qIndex) => (
        <div key={qIndex} className="admin-card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h4 style={{ margin: 0 }}>Câu {qIndex + 1}</h4>
            <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '4px 8px', fontSize: '12px' }} onClick={() => removeQuestion(qIndex)}>Xóa câu hỏi</button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <textarea className="form-control" placeholder="Nhập nội dung câu hỏi..." value={q.questionText} onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)} style={{ width: '100%', padding: '10px', minHeight: '80px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Loại câu hỏi</label>
              <select className="form-control" value={q.type} onChange={e => updateQuestion(qIndex, 'type', e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="single_choice">Trắc nghiệm 1 đáp án đúng</option>
                <option value="multiple_choice">Trắc nghiệm nhiều đáp án đúng</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Điểm số</label>
              <input type="number" className="form-control" value={q.points} onChange={e => updateQuestion(qIndex, 'points', Number(e.target.value))} style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>Các lựa chọn đáp án</p>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input 
                  type={q.type === 'single_choice' ? 'radio' : 'checkbox'} 
                  checked={opt.isCorrect} 
                  onChange={e => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)} 
                  name={`q-${qIndex}`}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <input 
                  type="text" 
                  className="form-control" 
                  value={opt.text} 
                  onChange={e => updateOption(qIndex, oIndex, 'text', e.target.value)} 
                  placeholder={`Lựa chọn ${oIndex + 1}`} 
                  style={{ flex: 1, padding: '8px', border: opt.isCorrect ? '1px solid #10b981' : '1px solid #cbd5e1' }}
                />
                <button className="btn btn-outline" style={{ padding: '6px 10px', color: '#64748b', border: 'none' }} onClick={() => removeOption(qIndex, oIndex)}>✖</button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px', marginTop: '10px' }} onClick={() => addOption(qIndex)}>+ Thêm lựa chọn</button>
          </div>
        </div>
      ))}

      {formData.questions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b' }}>Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
        </div>
      )}
    </div>
  );
};

export default QuizEditor;

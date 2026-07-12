import React, { useState, useEffect, useRef } from 'react';
import { getQuiz, startQuizAttempt, submitQuizAttempt } from '../utils/lmsApi';

const QuizComponent = ({ activityId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getQuiz(activityId);
        setQuiz(res.data.data || res.data);
      } catch {
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activityId]);

  const handleStart = async () => {
    try {
      const res = await startQuizAttempt(activityId);
      const att = res.data.data || res.data;
      setAttempt(att);
      if (quiz?.timeLimit) {
        setTimeLeft(quiz.timeLimit * 60);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSelect = (qId, value, isMultiple) => {
    setAnswers(prev => {
      if (isMultiple) {
        const current = prev[qId] || [];
        const exists = current.includes(value);
        return {
          ...prev,
          [qId]: exists ? current.filter(v => v !== value) : [...current, value],
        };
      }
      return { ...prev, [qId]: value };
    });
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);
    try {
      const formatted = (quiz?.questions || []).map(q => ({
        questionId: q._id,
        answer: answers[q._id] || (q.type === 'multiple' ? [] : ''),
      }));
      const res = await submitQuizAttempt(attempt._id, { answers: formatted });
      setResult(res.data.data || res.data);
      if (onComplete) onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
      Đang tải bài kiểm tra...
    </div>
  );

  if (!quiz) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
      Không tìm thấy bài kiểm tra.
    </div>
  );

  // Results screen
  if (result) {
    const passed = result.passed;
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        color: '#1a1a2e',
      }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>
          {passed ? '🎉' : '😔'}
        </div>
        <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>
          {passed ? 'Chúc mừng! Bạn đã vượt qua!' : 'Chưa đạt — Hãy thử lại!'}
        </h2>
        <div style={{
          display: 'inline-block',
          padding: '8px 24px',
          borderRadius: '999px',
          background: passed ? '#d4edda' : '#f8d7da',
          color: passed ? '#28a745' : '#dc3545',
          fontWeight: '700',
          fontSize: '20px',
          margin: '16px 0',
        }}>
          {result.score ?? '--'} / {result.totalScore ?? '--'} điểm
        </div>
        <div style={{ color: '#666', marginBottom: '24px' }}>
          Tỷ lệ đúng: {result.percentage ?? '--'}% • Điểm đạt: {quiz.passingScore ?? 70}%
        </div>

        {/* Answer Review */}
        {result.details && (
          <div style={{ textAlign: 'left', marginTop: '16px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Đánh giá câu trả lời:</h3>
            {result.details.map((d, i) => (
              <div
                key={i}
                style={{
                  background: d.correct ? '#f0fff4' : '#fff5f5',
                  border: `1px solid ${d.correct ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                  {d.correct ? '✅' : '❌'} Câu {i + 1}: {d.question}
                </div>
                <div style={{ fontSize: '13px', color: '#555' }}>
                  Đáp án của bạn: <strong>{Array.isArray(d.userAnswer) ? d.userAnswer.join(', ') : d.userAnswer || '(Bỏ trống)'}</strong>
                </div>
                {!d.correct && (
                  <div style={{ fontSize: '13px', color: '#28a745', marginTop: '4px' }}>
                    Đáp án đúng: <strong>{Array.isArray(d.correctAnswer) ? d.correctAnswer.join(', ') : d.correctAnswer}</strong>
                  </div>
                )}
                {d.explanation && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', fontStyle: 'italic' }}>
                    💡 {d.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setResult(null); setAttempt(null); setAnswers({}); }}
          style={{
            marginTop: '16px',
            padding: '12px 32px',
            background: '#00B1B0',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          🔄 Làm lại
        </button>
      </div>
    );
  }

  // Start Screen
  if (!attempt) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '60px auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center',
        color: '#1a1a2e',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <h2 style={{ marginBottom: '8px' }}>{quiz.title}</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          {quiz.description || 'Hoàn thành bài kiểm tra để tiếp tục.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '28px' }}>
          {quiz.questions?.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#00B1B0' }}>
                {quiz.questions.length}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Câu hỏi</div>
            </div>
          )}
          {quiz.timeLimit && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#f39c12' }}>
                {quiz.timeLimit}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Phút</div>
            </div>
          )}
          {quiz.passingScore && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#e74c3c' }}>
                {quiz.passingScore}%
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Điểm đạt</div>
            </div>
          )}
        </div>
        <button
          onClick={handleStart}
          style={{
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #00B1B0, #0f3460)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          🚀 Bắt đầu làm bài
        </button>
      </div>
    );
  }

  // Quiz Questions
  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '24px',
      color: '#1a1a2e',
    }}>
      {/* Timer */}
      {timeLeft !== null && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '12px',
          background: timeLeft < 60 ? '#fee2e2' : 'rgba(255,255,255,0.9)',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '24px',
          color: timeLeft < 60 ? '#dc3545' : '#1a1a2e',
        }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      )}

      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#fff' }}>{quiz.title}</h2>

      {(quiz.questions || []).map((q, qi) => (
        <div
          key={q._id}
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px' }}>
            Câu {qi + 1}. {q.question}
          </div>

          {q.type === 'essay' ? (
            <textarea
              value={answers[q._id] || ''}
              onChange={e => handleSelect(q._id, e.target.value, false)}
              placeholder="Nhập câu trả lời của bạn..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            (q.options || []).map((opt, oi) => {
              const isMultiple = q.type === 'multiple';
              const selected = isMultiple
                ? (answers[q._id] || []).includes(opt.value ?? opt.text ?? opt)
                : answers[q._id] === (opt.value ?? opt.text ?? opt);
              return (
                <label
                  key={oi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `2px solid ${selected ? '#00B1B0' : '#e8ecef'}`,
                    marginBottom: '8px',
                    cursor: 'pointer',
                    background: selected ? '#f0fdfc' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    checked={selected}
                    onChange={() => handleSelect(q._id, opt.value ?? opt.text ?? opt, isMultiple)}
                    style={{ accentColor: '#00B1B0', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '14px' }}>{opt.text ?? opt}</span>
                </label>
              );
            })
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '14px',
          background: submitting ? '#aaa' : 'linear-gradient(135deg, #00B1B0, #0f3460)',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '700',
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginTop: '8px',
        }}
      >
        {submitting ? 'Đang nộp bài...' : '📤 Nộp bài'}
      </button>
    </div>
  );
};

export default QuizComponent;

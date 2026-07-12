import React, { useEffect, useRef } from 'react';

const ProgressBar = ({ value = 0, max = 100, height = 8, showLabel = true, color, animated = true }) => {
  const fillRef = useRef(null);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const barColor = color || (pct === 100 ? '#2ecc71' : '#00B1B0');

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (fillRef.current) fillRef.current.style.width = `${pct}%`;
        });
      });
    }
  }, [pct]);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: '#e8ecef',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={fillRef}
          style={{
            height: '100%',
            background: barColor,
            borderRadius: '999px',
            transition: animated ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            width: `${pct}%`,
          }}
        />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: barColor }}>
            {Math.round(pct)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

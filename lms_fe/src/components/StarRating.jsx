import React, { useState } from 'react';

const StarRating = ({ value = 0, max = 5, interactive = false, onChange, size = 18 }) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  const getStarType = (index) => {
    const full = index <= Math.floor(display);
    const half = !full && index === Math.ceil(display) && display % 1 >= 0.4;
    return full ? 'full' : half ? 'half' : 'empty';
  };

  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((index) => {
        const type = getStarType(index);
        return (
          <span
            key={index}
            style={{
              fontSize: `${size}px`,
              cursor: interactive ? 'pointer' : 'default',
              color: type === 'empty' ? '#ddd' : '#f39c12',
              transition: 'transform 0.1s',
              display: 'inline-block',
              userSelect: 'none',
            }}
            onClick={() => interactive && onChange && onChange(index)}
            onMouseEnter={() => interactive && setHovered(index)}
            onMouseLeave={() => interactive && setHovered(0)}
            onMouseOver={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseOut={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {type === 'full' ? '★' : type === 'half' ? '⯨' : '☆'}
          </span>
        );
      })}
    </span>
  );
};

export default StarRating;

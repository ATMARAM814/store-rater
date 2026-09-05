import { useState } from 'react';

export default function RatingStars({ value = 0, onChange, readonly = false, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div
      className={`star-rating ${readonly ? 'readonly' : ''}`}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${(hoverValue || value) >= star ? 'filled' : ''}`}
          style={{ fontSize: sizes[size] }}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          role={readonly ? 'presentation' : 'button'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

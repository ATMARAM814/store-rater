export default function BrandLogo({ showTagline = true, size = 'md' }) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const textSizes = {
    sm: '1.15rem',
    md: '1.4rem',
    lg: '1.75rem',
  };

  const s = iconSizes[size] || 36;

  return (
    <div className="brand-logo-container">
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="brand-bag-icon"
      >
        {/* Bag handles */}
        <path
          d="M17 17V12C17 8.13401 20.134 5 24 5C27.866 5 31 8.13401 31 12V17"
          stroke="#166534"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Bag body */}
        <path
          d="M10 16L13.2 40.2C13.4 41.8 14.8 43 16.4 43H31.6C33.2 43 34.6 41.8 34.8 40.2L38 16H10Z"
          stroke="#166534"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Star in the center */}
        <path
          d="M24 23L25.8 28.2H31.3L26.8 31.4L28.5 36.6L24 33.3L19.5 36.6L21.2 31.4L16.7 28.2H22.2L24 23Z"
          fill="#166534"
        />
      </svg>
      <div className="brand-text-block">
        <span className="brand-title" style={{ fontSize: textSizes[size] }}>
          Store<span style={{ color: '#166534' }}>Rater</span>
        </span>
        {showTagline && (
          <span className="brand-tagline">Rate. Share. Shop Better.</span>
        )}
      </div>
    </div>
  );
}

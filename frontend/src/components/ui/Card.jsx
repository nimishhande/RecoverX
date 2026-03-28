import React from 'react';

export const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`rx-card ${className}`}>
      {(title || subtitle) && (
        <div className="rx-card-header">
          <div>
            {title && <h3 className="rx-card-title">{title}</h3>}
            {subtitle && <p className="rx-card-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="rx-card-content">{children}</div>
    </div>
  );
};

export default Card;

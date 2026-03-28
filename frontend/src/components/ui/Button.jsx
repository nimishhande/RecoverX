import React from 'react';

export const Button = ({ children, className = '', variant = 'primary', icon, ...props }) => {
  const baseClass = variant === 'primary' ? 'rx-btn-primary' : 'rx-btn-social';
  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;

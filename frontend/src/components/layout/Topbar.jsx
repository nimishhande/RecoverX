import React from 'react';
import { Menu, Bell } from 'lucide-react';

const Topbar = ({ onMenuClick, title, subtitle }) => {
  return (
    <header className="rx-topbar">
      <div className="rx-topbar-left">
        <button
          className="rx-mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="rx-topbar-title">{title}</h1>
          {subtitle && (
            <span className="rx-topbar-breadcrumb">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="rx-topbar-right">
        <button className="rx-topbar-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;

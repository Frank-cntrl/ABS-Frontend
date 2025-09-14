import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CSS/NavBarStyles.css";

const NavBar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" onClick={closeMenu}>
          <img
            src="https://i.imgur.com/y3zzfrY.png"
            alt="ABS Logo"
            className="navbar-logo"
          />
        </Link>
      </div>

      {/* Hamburger Menu Button */}
      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>

      {/* Navigation Menu */}
      <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="public-links">
          <Link to="/events" className="nav-link" onClick={closeMenu}>
            Upcoming Events
          </Link>
          <Link to="/eboard" className="nav-link" onClick={closeMenu}>
            Get to Know Us
          </Link>
        </div>

        <div className="nav-links">
          {user ? (
            <div className="user-section">
              <Link to="/me" className="nav-link profile-link" onClick={closeMenu}>
                Welcome, {user.username}!
              </Link>
              <button 
                onClick={() => {
                  onLogout();
                  closeMenu();
                }} 
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <span className="auth-text">Member of the E-board? Login Here 👉</span>
              <Link to="/login" className="nav-link login-btn" onClick={closeMenu}>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
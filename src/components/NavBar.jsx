import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CSS/NavBarStyles.css";

// MUI Icons
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

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

      {/* Hamburger Menu Button with MUI Icon */}
      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <CloseIcon className="hamburger-icon" />
        ) : (
          <MenuIcon className="hamburger-icon" />
        )}
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
            <EventIcon className="nav-icon" />
            <span>Upcoming Events</span>
          </Link>
          <Link to="/eboard" className="nav-link" onClick={closeMenu}>
            <PeopleIcon className="nav-icon" />
            <span>Get to Know Us</span>
          </Link>
        </div>

        <div className="nav-links">
          {user ? (
            <div className="user-section">
              <Link to="/me" className="nav-link profile-link" onClick={closeMenu}>
                <AccountCircleIcon className="nav-icon" />
                <span>Welcome, {user.username}!</span>
              </Link>
              <button 
                onClick={() => {
                  onLogout();
                  closeMenu();
                }} 
                className="logout-btn nav-button"
              >
                <LogoutIcon className="nav-icon" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <span className="auth-text">Member of the E-board? Login Here</span>
              <Link to="/login" className="nav-link login-btn" onClick={closeMenu}>
                <LoginIcon className="nav-icon" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
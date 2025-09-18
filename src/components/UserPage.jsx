import React, { useState } from "react";
import "./CSS/UserPageStyles.css";

// MUI Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import BugReportIcon from '@mui/icons-material/BugReport';
import HelpIcon from '@mui/icons-material/Help';
import BuildIcon from '@mui/icons-material/Build';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const UserPage = ({ user }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("franccescoepetta@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = "franccescoepetta@gmail.com";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="user-page-container">
        <div className="user-page-content">
          <div className="not-logged-in">
            <div className="login-prompt">
              <SecurityIcon className="login-icon" />
              <h1>My Profile</h1>
              <p>Please log in to view your profile and access admin features.</p>
              <div className="public-info">
                <PublicIcon className="public-icon" />
                <p>Visitors can browse events and view our E-board members without logging in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user.username === "Admin";

  return (
    <div className="user-page-container">
      <div className="user-page-content">
        <div className="profile-header">
          <div className="profile-info">
            <AdminPanelSettingsIcon className="admin-icon" />
            <div className="profile-text">
              <h1>Welcome, {user.username}!</h1>
              {isAdmin ? (
                <p className="admin-badge">
                  <SecurityIcon className="badge-icon" />
                  Administrator Account
                </p>
              ) : (
                <p className="user-badge">User Account</p>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="admin-dashboard">
            <div className="dashboard-header">
              <h2>
                <BuildIcon className="section-icon" />
                Admin Dashboard
              </h2>
              <p>Here's what you can do as an administrator:</p>
            </div>

            <div className="admin-features">
              <div className="feature-section">
                <div className="section-header">
                  <EventIcon className="section-icon" />
                  <h3>Event Management</h3>
                </div>
                <div className="feature-cards">
                  <div className="feature-card">
                    <AddIcon className="feature-icon" />
                    <h4>Create Events</h4>
                    <p>Add new upcoming events with details like date, location, and description.</p>
                  </div>
                  <div className="feature-card">
                    <EditIcon className="feature-icon" />
                    <h4>Edit Events</h4>
                    <p>Update existing event information, change dates, or modify descriptions.</p>
                  </div>
                  <div className="feature-card">
                    <DeleteIcon className="feature-icon" />
                    <h4>Delete Events</h4>
                    <p>Remove outdated or cancelled events from the public listing.</p>
                  </div>
                </div>
              </div>

              <div className="feature-section">
                <div className="section-header">
                  <PeopleIcon className="section-icon" />
                  <h3>E-Board Management</h3>
                </div>
                <div className="feature-cards">
                  <div className="feature-card">
                    <AddIcon className="feature-icon" />
                    <h4>Add Members</h4>
                    <p>Add new E-board members with their roles, majors, and descriptions.</p>
                  </div>
                  <div className="feature-card">
                    <EditIcon className="feature-icon" />
                    <h4>Update Profiles</h4>
                    <p>Edit member information, update roles, or change profile pictures.</p>
                  </div>
                  <div className="feature-card">
                    <DeleteIcon className="feature-icon" />
                    <h4>Remove Members</h4>
                    <p>Remove members who are no longer part of the E-board.</p>
                  </div>
                </div>
              </div>

              <div className="permissions-section">
                <div className="section-header">
                  <SecurityIcon className="section-icon" />
                  <h3>Access Permissions</h3>
                </div>
                <div className="permissions-grid">
                  <div className="permission-item">
                    <CheckCircleIcon className="permission-icon admin" />
                    <span>Full administrative access</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircleIcon className="permission-icon admin" />
                    <span>Create, edit, and delete events</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircleIcon className="permission-icon admin" />
                    <span>Manage E-board member profiles</span>
                  </div>
                  <div className="permission-item">
                    <VisibilityIcon className="permission-icon public" />
                    <span>Public users can view events and members</span>
                  </div>
                  <div className="permission-item">
                    <LockIcon className="permission-icon restricted" />
                    <span>Admin features require authentication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="contact-section">
          <div className="section-header">
            <ContactSupportIcon className="section-icon" />
            <h3>Need Help or Want to Contribute?</h3>
          </div>
          <div className="contact-content">
            <p>If you encounter any issues, want to suggest new features, or need assistance with the website, feel free to reach out!</p>
            
            <div className="contact-reasons">
              <div className="contact-reason">
                <BugReportIcon className="reason-icon bug" />
                <div className="reason-text">
                  <h4>Report a Bug</h4>
                  <p>Found something that's not working correctly?</p>
                </div>
              </div>
              <div className="contact-reason">
                <HelpIcon className="reason-icon help" />
                <div className="reason-text">
                  <h4>Need Help</h4>
                  <p>Need assistance with using the admin features?</p>
                </div>
              </div>
              <div className="contact-reason">
                <BuildIcon className="reason-icon feature" />
                <div className="reason-text">
                  <h4>Feature Request</h4>
                  <p>Have an idea for improving the website?</p>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <div className="email-section">
                <EmailIcon className="email-icon" />
                <div className="email-content">
                  <h4>Contact Developer</h4>
                  <div className="email-wrapper">
                    <span className="email-address">franccescoepetta@gmail.com</span>
                    <button 
                      className={`copy-button ${copiedEmail ? 'copied' : ''}`}
                      onClick={handleCopyEmail}
                      title="Copy email address"
                    >
                      {copiedEmail ? (
                        <>
                          <CheckCircleIcon className="copy-icon" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <InfoIcon className="copy-icon" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="regular-user-info">
            <div className="section-header">
              <InfoIcon className="section-icon" />
              <h3>Your Account</h3>
            </div>
            <p>You're logged in as a regular user. You can browse events and view E-board members, but administrative features are restricted to admin accounts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
import React from "react";
import "./CSS/EboardStyles.css";

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CakeIcon from '@mui/icons-material/Cake';

const EboardCard = ({ member, isAdmin, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${member.name} from the E-board? This action cannot be undone.`)) {
      onDelete(member.id);
    }
  };

  return (
    <div className="eboard-card">
      <div className="member-image">
        {member.picture ? (
          <img src={member.picture} alt={member.name} />
        ) : (
          <PersonIcon className="default-avatar" />
        )}
        <div className="image-overlay"></div>
      </div>
      
      <div className="member-content">
        <div className="member-header">
          <h3 className="member-name">{member.name}</h3>
          <div className="member-role">
            <WorkIcon className="role-icon" />
            <span>{member.role}</span>
          </div>
        </div>

        <div className="member-details">
          <div className="member-info">
            <div className="info-item">
              <CakeIcon className="info-icon" />
              <span>{member.age}</span>
            </div>
            <div className="info-item">
              <SchoolIcon className="info-icon" />
              <span>{member.major}</span>
            </div>
          </div>

          <div className="member-description">
            <p>{member.description}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="member-actions">
            <button 
              className="edit-btn" 
              onClick={() => onEdit(member)}
              title="Edit Member"
            >
              <EditIcon className="btn-icon" />
              <span>Edit</span>
            </button>
            <button 
              className="delete-btn" 
              onClick={handleDelete}
              title="Delete Member"
            >
              <DeleteIcon className="btn-icon" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EboardCard;
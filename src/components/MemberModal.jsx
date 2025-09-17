import React, { useState, useEffect } from "react";
import "./CSS/EboardStyles.css";

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const MemberModal = ({ isOpen, onClose, onSubmit, editingMember, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    major: '',
    role: '',
    description: '',
    picture: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name || '',
        age: editingMember.age || '',
        major: editingMember.major || '',
        role: editingMember.role || '',
        description: editingMember.description || '',
        picture: editingMember.picture || ''
      });
    } else {
      setFormData({
        name: '',
        age: '',
        major: '',
        role: '',
        description: '',
        picture: ''
      });
    }
    setErrors({});
  }, [editingMember, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    }
    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {editingMember ? (
              <>
                <EditIcon className="modal-icon" />
                Edit Member
              </>
            ) : (
              <>
                <PersonAddIcon className="modal-icon" />
                Add New Member
              </>
            )}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>
                <PersonIcon className="label-icon" />
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter member's name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                <CakeIcon className="label-icon" />
                Age
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 21, Senior, Junior (21)"
                className={errors.age ? 'error' : ''}
              />
              {errors.age && <span className="error">{errors.age}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <SchoolIcon className="label-icon" />
                Major
              </label>
              <input
                type="text"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Business"
                className={errors.major ? 'error' : ''}
              />
              {errors.major && <span className="error">{errors.major}</span>}
            </div>

            <div className="form-group">
              <label>
                <WorkIcon className="label-icon" />
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., President, Marketing Lead"
                className={errors.role ? 'error' : ''}
              />
              {errors.role && <span className="error">{errors.role}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>
              <DescriptionIcon className="label-icon" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about this member..."
              rows="4"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>
              <ImageIcon className="label-icon" />
              Picture URL (Optional)
            </label>
            <input
              type="url"
              name="picture"
              value={formData.picture}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {formData.picture && (
            <div className="image-preview">
              <img src={formData.picture} alt="Preview" />
              <div className="preview-label">
                <ImageIcon className="preview-icon" />
                Preview
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              <CancelIcon className="btn-icon" />
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="spinner spinner-small"></div>
              ) : (
                <>
                  <SaveIcon className="btn-icon" />
                  {editingMember ? 'Update' : 'Add'} Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import "./CSS/EboardStyles.css";
import ImageCropModal from './ImageCropModal';

// MUI Components and Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FormControl, Select, MenuItem } from '@mui/material';

const MemberModal = ({ isOpen, onClose, onSubmit, editingMember, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    major: '',
    role: '',
    description: '',
    picture: ''
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Year options
  const yearOptions = [
    'Freshman',
    'Sophomore', 
    'Junior',
    'Senior',
    'Graduate Student',
    'Alumni'
  ];

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name || '',
        year: editingMember.year || editingMember.age || '', // Handle legacy 'age' field
        major: editingMember.major || '',
        role: editingMember.role || '',
        description: editingMember.description || '',
        picture: editingMember.picture || ''
      });
      // Show existing image as preview if available
      setImagePreview(editingMember.picture || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        year: '',
        major: '',
        role: '',
        description: '',
        picture: ''
      });
      setImagePreview('');
      setImageFile(null);
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

  // Handle file selection - opens crop modal
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          picture: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          picture: 'Image size must be less than 10MB'
        }));
        return;
      }

      // Store the file and open crop modal
      setSelectedImageFile(file);
      setShowCropModal(true);

      // Clear picture errors
      if (errors.picture) {
        setErrors(prev => ({
          ...prev,
          picture: ''
        }));
      }
    }
  };

  // Handle crop completion
  const handleCropComplete = (croppedFile) => {
    setImageFile(croppedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(croppedFile);
    
    setShowCropModal(false);
    setSelectedImageFile(null);
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImageFile(null);
    
    // Clear the file input
    const fileInput = document.getElementById("imageFile");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!imageFile) {
      // If no new file and image was cleared, return empty string
      if (!imagePreview && !formData.picture) {
        return '';
      }
      // Otherwise return existing image URL
      return formData.picture;
    }
    
    const formDataUpload = new FormData();
    formDataUpload.append('image', imageFile);
    
    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/upload/image`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Clear file selection
  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview('');
    
    // Clear the file input
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Clear the image from formData as well
    setFormData(prev => ({
      ...prev,
      picture: ''
    }));
    
    // Clear any image-related errors
    if (errors.picture) {
      setErrors(prev => ({
        ...prev,
        picture: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
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
      // Upload image if new file selected, otherwise keep existing
      const imageUrl = await uploadImage();
      
      // Send 'year' as 'age' for backend compatibility
      const submitData = {
        ...formData,
        age: formData.year, // Map year to age for backend
        picture: imageUrl
      };
      delete submitData.year; // Remove year since we're using age
      
      await onSubmit(submitData);
    } catch (error) {
      setErrors({ general: error.message || "Failed to save member. Please try again." });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      year: '',
      major: '',
      role: '',
      description: '',
      picture: ''
    });
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setUploadingImage(false);
    setShowCropModal(false);
    setSelectedImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
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
          <button className="modal-close" onClick={handleClose} disabled={loading || uploadingImage || showCropModal}>
            <CloseIcon />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

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
                disabled={loading || uploadingImage || showCropModal}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>
                <CalendarTodayIcon className="label-icon" />
                Year
              </label>
              <FormControl fullWidth variant="outlined" error={!!errors.year}>
                <Select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  displayEmpty
                  disabled={loading || uploadingImage || showCropModal}
                  className="year-select"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: errors.year ? '#dc3545' : '#e9ecef',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#9966c7'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#9966c7',
                        boxShadow: '0 0 0 4px rgba(153, 102, 199, 0.1)'
                      }
                    },
                    '& .MuiSelect-select': {
                      padding: '1rem',
                      fontSize: '1rem'
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Select year...</em>
                  </MenuItem>
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.year && <span className="error">{errors.year}</span>}
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
                disabled={loading || uploadingImage || showCropModal}
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
                disabled={loading || uploadingImage || showCropModal}
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
              disabled={loading || uploadingImage || showCropModal}
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imageFile">
              <ImageIcon className="label-icon" />
              Member Photo
            </label>
            
            {/* File upload section */}
            <div className="image-upload-section">
              <label htmlFor="imageFile" className="file-upload-label">
                <CloudUploadIcon className="upload-icon" />
                <span>
                  {imageFile ? imageFile.name : (editingMember && formData.picture ? 'Change photo' : 'Choose photo file')}
                </span>
                <small>Max 10MB - JPG, PNG, GIF - Will open crop tool</small>
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading || uploadingImage || showCropModal}
                className="file-input"
              />
              
              {(imageFile || imagePreview) && (
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="clear-file-btn"
                  disabled={loading || uploadingImage || showCropModal}
                >
                  {imageFile ? 'Clear Selected File' : 'Remove Photo'}
                </button>
              )}
            </div>

            {errors.picture && (
              <span className="error">
                {errors.picture}
              </span>
            )}

            {/* Image preview */}
            {imagePreview && (
              <div className="modal-image-preview">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                />
                <div className="modal-preview-label">
                  <ImageIcon className="modal-preview-icon" />
                  {uploadingImage ? 'Uploading...' : 'Preview'}
                </div>
              </div>
            )}
            
            {/* Upload progress */}
            {uploadingImage && (
              <div className="upload-progress">
                <div className="spinner spinner-small"></div>
                <span>Uploading photo to cloud storage...</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleClose}
              disabled={loading || uploadingImage || showCropModal}
            >
              <CancelIcon className="btn-icon" />
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || uploadingImage || showCropModal}
            >
              {loading || uploadingImage ? (
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

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        onCropComplete={handleCropComplete}
        imageFile={selectedImageFile}
        aspectRatio={1} // Square ratio for member photos
      />
    </div>
  );
};

export default MemberModal;
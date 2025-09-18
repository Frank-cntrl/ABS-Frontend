import React, { useState, useEffect } from "react";
import "./CSS/EventStyles.css";

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const EventModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    editingEvent = null, 
    loading = false 
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        image: ''
    });
    const [errors, setErrors] = useState({});

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

    // Update form data when editingEvent changes
    useEffect(() => {
        if (editingEvent) {
            setFormData({
                title: editingEvent.title || '',
                description: editingEvent.description || '',
                location: editingEvent.location || '',
                date: editingEvent.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : '',
                image: editingEvent.image || ''
            });
        } else {
            setFormData({
                title: '',
                description: '',
                location: '',
                date: '',
                image: ''
            });
        }
        setErrors({});
    }, [editingEvent, isOpen]);

    const handleInputChange = (e) => {
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
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            await onSubmit(formData);
        } catch (error) {
            setErrors({ general: error.message || "Failed to save event. Please try again." });
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            location: '',
            date: '',
            image: ''
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {editingEvent ? (
                            <>
                                <EditIcon className="modal-icon" />
                                Edit Event
                            </>
                        ) : (
                            <>
                                <AddIcon className="modal-icon" />
                                Add New Event
                            </>
                        )}
                    </h2>
                    <button className="modal-close" onClick={handleClose} disabled={loading}>
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {errors.general && (
                        <div className="error-message">
                            {errors.general}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="title">
                            <EventIcon className="label-icon" />
                            Event Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={errors.title ? 'error' : ''}
                            placeholder="e.g., Welcome Back Mixer"
                            disabled={loading}
                        />
                        {errors.title && (
                            <span className="error">
                                {errors.title}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            <DescriptionIcon className="label-icon" />
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={errors.description ? 'error' : ''}
                            placeholder="Describe your event, activities, and what attendees can expect..."
                            rows="4"
                            disabled={loading}
                        />
                        {errors.description && (
                            <span className="error">
                                {errors.description}
                            </span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="location">
                                <LocationOnIcon className="label-icon" />
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className={errors.location ? 'error' : ''}
                                placeholder="e.g., Student Union Room 201"
                                disabled={loading}
                            />
                            {errors.location && (
                                <span className="error">
                                    {errors.location}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">
                                <AccessTimeIcon className="label-icon" />
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">
                            <ImageIcon className="label-icon" />
                            Event Image (Optional)
                        </label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="https://example.com/your-image.jpg"
                            disabled={loading}
                        />
                        {formData.image && (
                            <div className="image-preview">
                                <img src={formData.image} alt="Preview" />
                                <div className="preview-label">
                                    <ImageIcon className="preview-icon" />
                                    Preview
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="cancel-btn"
                            disabled={loading}
                        >
                            <CancelIcon className="btn-icon" />
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner spinner-small"></div>
                            ) : (
                                <>
                                    <SaveIcon className="btn-icon" />
                                    {editingEvent ? 'Update' : 'Add'} Event
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
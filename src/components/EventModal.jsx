import React, { useState, useEffect } from "react";
import "./CSS/EventStyles.css";

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
                                <span className="modal-icon">✏️</span>
                                Edit Event
                            </>
                        ) : (
                            <>
                                <span className="modal-icon">✨</span>
                                Create New Event
                            </>
                        )}
                    </h2>
                    <button className="modal-close" onClick={handleClose} disabled={loading}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {errors.general && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {errors.general}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="title">
                            Event Title *
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
                                <span className="error-icon">❌</span>
                                {errors.title}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Description *
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
                                <span className="error-icon">❌</span>
                                {errors.description}
                            </span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="location">
                                Location *
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
                                    <span className="error-icon">❌</span>
                                    {errors.location}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">
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
                            Event Image
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
                            <span className="btn-icon">❌</span>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    {editingEvent ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">
                                        {editingEvent ? '💾' : '✨'}
                                    </span>
                                    {editingEvent ? 'Update Event' : 'Create Event'}
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
import React from "react";
import "./CSS/EventStyles.css";

const EventCard = ({ event, isAdmin, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="event-card">
            {event.image && (
                <div className="event-image">
                    <img src={event.image} alt={event.title} />
                    <div className="image-overlay"></div>
                </div>
            )}
            
            <div className="event-content">
                <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    {event.date && (
                        <div className="event-date">
                            <span className="date-icon">📅</span>
                            {formatDate(event.date)}
                        </div>
                    )}
                </div>

                <div className="event-details">
                    {event.location && (
                        <div className="event-location">
                            <span className="location-icon">📍</span>
                            {event.location}
                        </div>
                    )}
                    
                    <p className="event-description">{event.description}</p>
                </div>

                {isAdmin && (
                    <div className="event-actions">
                        <button 
                            className="edit-btn"
                            onClick={() => onEdit(event)}
                        >
                            <span className="btn-icon">✏️</span>
                            Edit
                        </button>
                        <button 
                            className="delete-btn"
                            onClick={() => onDelete(event.id)}
                        >
                            <span className="btn-icon">🗑️</span>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
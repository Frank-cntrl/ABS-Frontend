import React from "react";
import "./CSS/EventStyles.css";

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

    const formatTime = (dateString) => {
        const options = { 
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
                            <AccessTimeIcon className="date-icon" />
                            <span>{formatDate(event.date)}</span>
                        </div>
                    )}
                </div>

                <div className="event-details">
                    {event.location && (
                        <div className="event-location">
                            <LocationOnIcon className="location-icon" />
                            <span>{event.location}</span>
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
                            <EditIcon className="btn-icon" />
                            Edit
                        </button>
                        <button 
                            className="delete-btn"
                            onClick={() => onDelete(event.id)}
                        >
                            <DeleteIcon className="btn-icon" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
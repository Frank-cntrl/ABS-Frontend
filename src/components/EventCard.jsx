import React from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/EventStyles.css";

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImageIcon from '@mui/icons-material/Image';

const EventCard = ({ event, isAdmin, onEdit, onDelete }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'Date TBD';
        
        const date = new Date(dateString);
        const options = { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    };

    const handleCardClick = (e) => {
        // Don't navigate if clicking on admin buttons
        if (e.target.closest('.event-actions')) {
            return;
        }
        navigate(`/events/${event.id}`);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(event);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(event.id);
    };

    return (
        <div className="event-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            {/* Always render image container for consistent layout */}
            <div className="modal-event-image">
                {event.image ? (
                    <img src={event.image} alt={event.title} />
                ) : (
                    <div className="default-event-image">
                        <EventIcon className="default-event-icon" />
                    </div>
                )}
                <div className="image-overlay"></div>
            </div>
            
            <div className="event-content">
                <div className="event-card-header">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-date">
                        <AccessTimeIcon className="date-icon" />
                        <span>{formatDate(event.date)}</span>
                    </div>
                </div>

                <div className="event-details">
                    {event.location && (
                        <div className="event-location">
                            <LocationOnIcon className="location-icon" />
                            <span>{event.location}</span>
                        </div>
                    )}
                    
                    <p className="event-description">
                        {event.description && event.description.length > 150 
                            ? `${event.description.substring(0, 150)}...`
                            : event.description}
                    </p>
                </div>

                {isAdmin && (
                    <div className="event-actions">
                        <button 
                            className="edit-btn"
                            onClick={handleEdit}
                        >
                            <EditIcon className="btn-icon" />
                            Edit
                        </button>
                        <button 
                            className="delete-btn"
                            onClick={handleDelete}
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
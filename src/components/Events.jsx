import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import EventCard from "./EventCard";
import "./CSS/EventStyles.css";

const Events = ({ user }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        image: ''
    });
    const [errors, setErrors] = useState({});

    const isAdmin = user && user.username === 'Admin';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/events`);
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
            // Mock data for development
            setEvents([
                {
                    id: 1,
                    title: "Welcome Back Mixer",
                    description: "Join us for our annual welcome back event! Meet new members, reconnect with old friends, and enjoy great food and music.",
                    location: "Student Union Building, Room 201",
                    date: "2024-09-20T18:00:00Z",
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKHNHzxf_lzP3SbFSewtq-hn6XJT7N2rRgew&s"
                },
                {
                    id: 2,
                    title: "Leadership Workshop",
                    description: "Develop your leadership skills with interactive workshops and guest speakers from industry professionals.",
                    location: "Business Building, Conference Room A",
                    date: "2024-09-25T14:00:00Z",
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKHNHzxf_lzP3SbFSewtq-hn6XJT7N2rRgew&s"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (editingEvent) {
                const response = await axios.put(
                    `${API_URL}/api/events/${editingEvent.id}`,
                    formData,
                    config
                );
                setEvents(prev => prev.map(event => 
                    event.id === editingEvent.id ? response.data : event
                ));
            } else {
                const response = await axios.post(
                    `${API_URL}/api/events`,
                    formData,
                    config
                );
                setEvents(prev => [response.data, ...prev]);
            }

            closeModal();
        } catch (error) {
            console.error("Error saving event:", error);
            setErrors({ general: "Failed to save event. Please try again." });
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            location: event.location,
            date: event.date ? event.date.split('T')[0] : '',
            image: event.image || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/events/${eventId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEvents(prev => prev.filter(event => event.id !== eventId));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const openModal = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            date: '',
            image: ''
        });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            date: '',
            image: ''
        });
        setErrors({});
    };

    if (loading) {
        return (
            <div className="events-container">
                <div className="loading">
                    <div className="spinner"></div>
                    Loading events...
                </div>
            </div>
        );
    }

    return (
        <div className="events-container">
            <div className="events-header">
                <h1>Upcoming Events</h1>
                {isAdmin && (
                    <button className="add-event-btn" onClick={openModal}>
                        ✨ Add Event
                    </button>
                )}
            </div>

            {/* Events Grid */}
            <div className="events-grid">
                {events.length === 0 ? (
                    <div className="no-events">
                        <div className="no-events-icon">📅</div>
                        <h3>No events yet</h3>
                        <p>Check back soon for upcoming events!</p>
                    </div>
                ) : (
                    events.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            isAdmin={isAdmin}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            {errors.general && (
                                <div className="error-message">{errors.general}</div>
                            )}

                            <div className="form-group">
                                <label htmlFor="title">Event Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={errors.title ? 'error' : ''}
                                    placeholder="Enter event title"
                                />
                                {errors.title && <span className="error">{errors.title}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={errors.description ? 'error' : ''}
                                    placeholder="Describe your event"
                                    rows="4"
                                />
                                {errors.description && <span className="error">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="location">Location *</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={errors.location ? 'error' : ''}
                                        placeholder="Event location"
                                    />
                                    {errors.location && <span className="error">{errors.location}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="date">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Image URL</label>
                                <input
                                    type="url"
                                    id="image"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
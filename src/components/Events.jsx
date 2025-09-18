import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import "./CSS/EventStyles.css";

import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const Events = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const isAdmin = user && user.username === "Admin";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to perform this action");
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (editingEvent) {
        // Update existing event
        const response = await axios.put(
          `${API_URL}/api/events/${editingEvent.id}`,
          formData,
          config
        );
        setEvents((prev) =>
          prev.map((event) =>
            event.id === editingEvent.id ? response.data : event
          )
        );
      } else {
        // Create new event
        const response = await axios.post(
          `${API_URL}/api/events`,
          formData,
          config
        );
        setEvents((prev) => [response.data, ...prev]);
      }

      setShowModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
        return;
      }
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to save event";
      alert(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (
      !window.confirm(
        `Are you sure you want to delete "${event?.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("You must be logged in");
      }

      // Use Authorization header like the other requests
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.delete(`${API_URL}/api/events/${eventId}`, config);
      
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      console.error("Delete error response:", error.response);
      
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="events-container">
        <div className="events-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading amazing events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-content">
        <div className="events-header">
          <div className="header-content">
            <h1>Upcoming Events</h1>
          </div>
          {isAdmin && (
            <button className="add-event-btn" onClick={openCreateModal}>
              <AddIcon className="btn-icon" />
              Add Event
            </button>
          )}
        </div>

        <div className="events-grid">
          {events.length === 0 ? (
            <div className="no-events">
              <EventIcon className="no-events-icon" />
              <h3>No events scheduled yet</h3>
              <p>Check back soon for exciting upcoming events!</p>
              {isAdmin && (
                <button
                  className="create-first-event-btn"
                  onClick={openCreateModal}
                >
                  <AutoAwesomeIcon className="btn-icon" />
                  Create Your First Event
                </button>
              )}
            </div>
          ) : (
            events.map((event) => (
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
      </div>

      <EventModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        editingEvent={editingEvent}
        loading={modalLoading}
      />
    </div>
  );
};

export default Events;
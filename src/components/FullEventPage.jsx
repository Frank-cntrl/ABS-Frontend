import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import "./CSS/FullEventPageStyles.css";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import RsvpIcon from "@mui/icons-material/EventAvailable";
import ShareIcon from "@mui/icons-material/Share";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ImageIcon from "@mui/icons-material/Image";
import ErrorIcon from "@mui/icons-material/Error";
import LoadingIcon from "@mui/icons-material/HourglassEmpty";

const FullEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await axios.get(`${API_URL}/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Event not found or failed to load");
      setEvent(null); // Ensure event is null on error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";

    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "TBD";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Time TBD";

    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        console.log("Event link copied to clipboard!");
      }
    } catch (error) {
      // User canceled share or clipboard failed
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        // Fallback for any other errors
        try {
          await navigator.clipboard.writeText(window.location.href);
          console.log("Event link copied to clipboard!");
        } catch (clipboardError) {
          console.error("Could not copy to clipboard:", clipboardError);
        }
      }
      // Don't show error for AbortError (user canceled)
    }
  };

  const handleRSVP = () => {
    if (event.rsvpLink) {
      window.open(event.rsvpLink, "_blank");
    } else {
      alert("RSVP link not available for this event.");
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="full-event-container">
        <div className="full-event-content">
          <div className="loading-state">
            <LoadingIcon className="loading-icon" />
            <h2>Loading Event...</h2>
            <p>Please wait while we fetch the event details.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error or no event data
  if (error || !event) {
    return (
      <div className="full-event-container">
        <div className="full-event-content">
          <div className="error-state">
            <ErrorIcon className="error-icon" />
            <h2>Event Not Found</h2>
            <p>
              {error ||
                "The event you're looking for doesn't exist or has been removed."}
            </p>
            <button className="back-button" onClick={() => navigate("/events")}>
              <ArrowBackIcon className="btn-icon" />
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only render the event content when we have valid event data
  return (
    <div className="full-event-container">
      <div className="full-event-content fade-in">
        {/* Header with back button */}
        <div className="event-header">
          <button className="back-button" onClick={() => navigate("/events")}>
            <ArrowBackIcon className="btn-icon" />
            Back to Events
          </button>
          <button className="share-button" onClick={handleShare}>
            <ShareIcon className="btn-icon" />
            Share
          </button>
        </div>

        {/* Event Image */}
        {event.image && (
          <div className="event-image-container">
            <img src={event.image} alt={event.title} className="event-image" />
            <div className="image-overlay"></div>
          </div>
        )}

        {/* Event Details Card */}
        <div className="event-details-card">
          <div className="event-title-section">
            <h1 className="event-title">
              <EventIcon className="title-icon" />
              {event.title}
            </h1>

            <div className="event-meta">
              <div className="meta-item">
                <CalendarTodayIcon className="meta-icon" />
                <span className="meta-text">{formatDateShort(event.date)}</span>
              </div>
              <div className="meta-item">
                <AccessTimeIcon className="meta-icon" />
                <span className="meta-text">{formatTime(event.date)}</span>
              </div>
              <div className="meta-item">
                <LocationOnIcon className="meta-icon" />
                <span className="meta-text">{event.location}</span>
              </div>
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="info-section">
            <h3 className="section-title">
              <AccessTimeIcon className="section-icon" />
              When
            </h3>
            <p className="section-content">{formatDate(event.date)}</p>
          </div>

          {/* Location Section */}
          <div className="info-section">
            <h3 className="section-title">
              <LocationOnIcon className="section-icon" />
              Where
            </h3>
            <p className="section-content">{event.location}</p>
          </div>

          {/* Description Section */}
          <div className="info-section">
            <h3 className="section-title">
              <DescriptionIcon className="section-icon" />
              About This Event
            </h3>
            <div className="section-content description-content">
              {event.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* RSVP Section */}
          <div className="rsvp-section">
            <div className="rsvp-content">
              <div className="rsvp-text">
                <h3>
                  <PersonIcon className="rsvp-icon" />
                  Join Us!
                </h3>
                <p>
                  Secure your spot at this amazing event. Let us know you're
                  coming!
                </p>
              </div>
              <button
                className="rsvp-button"
                onClick={handleRSVP}
                disabled={!event.rsvpLink}
              >
                <RsvpIcon className="btn-icon" />
                {event.rsvpLink ? "RSVP Here" : "RSVP Unavailable"}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-card">
            <h4>Questions?</h4>
            <p>
              Contact us if you have any questions about this event or need
              additional information.
            </p>
          </div>
          <div className="info-card">
            <h4>Accessibility</h4>
            <p>
              We strive to make our events accessible to everyone. Please
              contact us for any accommodation needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullEventPage;
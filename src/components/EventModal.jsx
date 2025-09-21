import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import "./CSS/EventStyles.css";
import ImageCropModal from "./ImageCropModal";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ImageIcon from "@mui/icons-material/Image";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropIcon from "@mui/icons-material/Crop";

const EventModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingEvent = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    image: "",
    rsvpLink: "",
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [originalImageFile, setOriginalImageFile] = useState(null); // Store original uncropped file
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [needsCropping, setNeedsCropping] = useState(false);

  // Function to convert date to local datetime-local format
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    // Adjust for timezone offset to get local time
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
  };

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  // Update form data when editingEvent changes
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || "",
        description: editingEvent.description || "",
        location: editingEvent.location || "",
        date: formatDateForInput(editingEvent.date),
        image: editingEvent.image || "",
        rsvpLink: editingEvent.rsvpLink || "",
      });
      // Show existing image as preview if available
      setImagePreview(editingEvent.image || "");
      setImageFile(null);
      setOriginalImageFile(null);
      setNeedsCropping(false);
    } else {
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        image: "",
        rsvpLink: "",
      });
      setImagePreview("");
      setImageFile(null);
      setOriginalImageFile(null);
      setNeedsCropping(false);
    }
    setErrors({});
  }, [editingEvent, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle file selection - now just stores the file and shows preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 10MB",
        }));
        return;
      }

      // Clear image errors
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }

      // Store the original file and create preview
      setOriginalImageFile(file);
      setImageFile(null); // Clear any cropped version
      setNeedsCropping(true); // Mark as needing cropping

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open crop modal with scroll to top
  const handleCropImage = () => {
    if (originalImageFile) {
      // Multiple approaches to ensure scrolling works
      const modalContent = document.querySelector(".modal-content");
      const modalOverlay = document.querySelector(".modal-overlay");

      // Method 1: Direct scrollTop property (most reliable)
      if (modalContent) {
        modalContent.scrollTop = 0;
      }

      if (modalOverlay) {
        modalOverlay.scrollTop = 0;
      }

      // Method 2: Window scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Method 3: Force all scrollable elements to top
      const scrollableElements = document.querySelectorAll(
        ".modal-content, .modal-overlay, .modal-form"
      );
      scrollableElements.forEach((element) => {
        element.scrollTop = 0;
      });

      // Method 4: Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (modalContent) {
          modalContent.scrollTop = 0;
        }

        // Small delay then open crop modal
        setTimeout(() => {
          setShowCropModal(true);
        }, 50); // Reduced delay
      });
    }
  };

  // Handle crop completion
  const handleCropComplete = (croppedFile) => {
    setImageFile(croppedFile);
    setNeedsCropping(false); // Mark as cropped

    // Create preview from cropped file
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(croppedFile);

    setShowCropModal(false);
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropModal(false);
  };

  // Upload image to Cloudinary
  const uploadImage = async () => {
    // If no image file selected
    if (!imageFile && !originalImageFile) {
      // If no new file and image was cleared, return empty string
      if (!imagePreview && !formData.image) {
        return "";
      }
      // Otherwise return existing image URL
      return formData.image;
    }

    // Use cropped version if available, otherwise original
    const fileToUpload = imageFile || originalImageFile;

    const formDataUpload = new FormData();
    formDataUpload.append("image", fileToUpload);

    try {
      setUploadingImage(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/upload/image`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.imageUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // ...existing code...

  const validateForm = () => {
    const newErrors = {};

    // Title validation - match backend requirements
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    } else if (formData.title.trim().length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    } else if (formData.location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters long";
    }

    // Date validation (optional but if provided, should be in future)
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.date = "Event date should be in the future";
      }
    }

    // RSVP Link validation (optional but if provided, should be valid URL)
    if (formData.rsvpLink && formData.rsvpLink.trim()) {
      try {
        new URL(formData.rsvpLink.trim());
      } catch {
        newErrors.rsvpLink = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ...existing code...

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Upload image if new file selected, otherwise keep existing
      const imageUrl = await uploadImage();

      // Convert the local datetime back to ISO string for submission
      const submitData = {
        ...formData,
        image: imageUrl,
      };

      if (submitData.date) {
        // Create date object from the datetime-local input (which is in local time)
        const localDate = new Date(submitData.date);
        // Convert to ISO string (which will be in UTC)
        submitData.date = localDate.toISOString();
      }

      await onSubmit(submitData);
    } catch (error) {
      setErrors({
        general: error.message || "Failed to save event. Please try again.",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      date: "",
      image: "",
      rsvpLink: "",
    });
    setErrors({});
    setImageFile(null);
    setOriginalImageFile(null);
    setImagePreview("");
    setUploadingImage(false);
    setShowCropModal(false);
    setNeedsCropping(false);
    onClose();
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setOriginalImageFile(null);
    setImagePreview("");
    setNeedsCropping(false);

    // Clear the file input
    const fileInput = document.getElementById("imageFile");
    if (fileInput) {
      fileInput.value = "";
    }

    // Clear the image from formData as well
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));

    // Clear any image-related errors
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
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
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading || uploadingImage}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.general && (
            <div className="error-message">{errors.general}</div>
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
              className={errors.title ? "error" : ""}
              placeholder="e.g., Welcome Back Mixer (minimum 3 characters)"
              disabled={loading || uploadingImage}
              minLength={3}
              maxLength={30}
            />
            {errors.title && <span className="error">{errors.title}</span>}
            <small className="input-hint">
              {formData.title.length}/30 characters{" "}
              {formData.title.length < 3 && formData.title.length > 0
                ? "(minimum 3 required)"
                : ""}
            </small>
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
              className={errors.description ? "error" : ""}
              placeholder="Describe your event, activities, and what attendees can expect..."
              rows="4"
              disabled={loading || uploadingImage}
            />
            {errors.description && (
              <span className="error">{errors.description}</span>
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
                className={errors.location ? "error" : ""}
                placeholder="e.g., Student Union Room 201"
                disabled={loading || uploadingImage}
              />
              {errors.location && (
                <span className="error">{errors.location}</span>
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
                disabled={loading || uploadingImage}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">
              <ImageIcon className="label-icon" />
              Event Image
            </label>

            {/* File upload section */}
            <div className="image-upload-section">
              <label htmlFor="imageFile" className="file-upload-label">
                <CloudUploadIcon className="upload-icon" />
                <span>
                  {originalImageFile
                    ? originalImageFile.name
                    : editingEvent && formData.image
                    ? "Change image"
                    : "Choose image file"}
                </span>
                <small>
                  Max 10MB - JPG, PNG, GIF - 1.78:1 aspect ratio recommended
                </small>
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading || uploadingImage}
                className="file-input"
              />

              {(originalImageFile || imagePreview) && (
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="clear-file-btn"
                  disabled={loading || uploadingImage}
                >
                  {originalImageFile ? "Clear Selected File" : "Remove Image"}
                </button>
              )}
            </div>

            {errors.image && <span className="error">{errors.image}</span>}

            {/* Crop button - shows when image is uploaded but not cropped */}
            {originalImageFile && needsCropping && (
              <div className="crop-button-section">
                <button
                  type="button"
                  onClick={handleCropImage}
                  className="crop-image-btn"
                  disabled={loading || uploadingImage}
                >
                  <CropIcon className="btn-icon" />
                  Crop Image to 1.78:1 Ratio
                </button>
                <small className="crop-hint">
                  Click to crop your image to the optimal 1.78:1 aspect ratio
                </small>
              </div>
            )}

            {/* Show cropped status */}
            {originalImageFile && !needsCropping && imageFile && (
              <div className="crop-status">
                <CropIcon className="crop-status-icon" />
                <span>Image cropped successfully!</span>
                <button
                  type="button"
                  onClick={handleCropImage}
                  className="recrop-btn"
                  disabled={loading || uploadingImage}
                >
                  Crop Again
                </button>
              </div>
            )}

            {/* Image preview */}
            {imagePreview && (
              <div className="modal-image-preview">
                <img src={imagePreview} alt="Preview" />
                <div className="modal-preview-label">
                  <ImageIcon className="modal-preview-icon" />
                  {uploadingImage
                    ? "Uploading..."
                    : needsCropping
                    ? "Preview - Click Crop Button"
                    : "Preview - Cropped"}
                </div>
              </div>
            )}

            {/* Upload progress */}
            {uploadingImage && (
              <div className="upload-progress">
                <div className="spinner spinner-small"></div>
                <span>Uploading image to cloud storage...</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rsvpLink">
              <EventAvailableIcon className="label-icon" />
              RSVP Link (Optional)
            </label>
            <input
              type="url"
              id="rsvpLink"
              name="rsvpLink"
              value={formData.rsvpLink}
              onChange={handleInputChange}
              placeholder="https://forms.google.com/your-form-link"
              disabled={loading || uploadingImage}
            />
            {formData.rsvpLink && (
              <div className="rsvp-preview">
                <EventAvailableIcon className="preview-icon" />
                <span>RSVP link will be available on event details page</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-btn"
              disabled={loading || uploadingImage}
            >
              <CancelIcon className="btn-icon" />
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || uploadingImage}
            >
              {loading || uploadingImage ? (
                <div className="spinner spinner-small"></div>
              ) : (
                <>
                  <SaveIcon className="btn-icon" />
                  {editingEvent ? "Update" : "Add"} Event
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
        imageFile={originalImageFile}
        aspectRatio={1.78} // 1.78:1 aspect ratio
      />
    </div>
  );
};

export default EventModal;

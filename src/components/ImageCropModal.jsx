import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './CSS/ImageCropModal.css';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import CropIcon from '@mui/icons-material/Crop';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const ImageCropModal = ({ isOpen, onClose, onCropComplete, imageFile, aspectRatio = 16/9 }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef(null);

  // Force crop modal to appear at top of viewport
  useEffect(() => {
    if (isOpen) {
      // Force immediate scroll to top of page
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Prevent all scrolling on body and html
      const originalBodyStyle = document.body.style.cssText;
      const originalHtmlStyle = document.documentElement.style.cssText;
      
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      
      // Force all existing modals to top and freeze them
      const allModals = document.querySelectorAll('.modal-content, .modal-overlay');
      const originalModalStyles = [];
      
      allModals.forEach((modal, index) => {
        originalModalStyles.push(modal.style.cssText);
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.overflow = 'hidden';
        modal.style.touchAction = 'none';
      });
      
      return () => {
        // Restore all styles
        document.body.style.cssText = originalBodyStyle;
        document.documentElement.style.cssText = originalHtmlStyle;
        
        allModals.forEach((modal, index) => {
          modal.style.cssText = originalModalStyles[index] || '';
        });
      };
    }
  }, [isOpen]);

  // Handle underlying modal scroll prevention when crop modal opens
  useEffect(() => {
    if (isOpen) {
      // Set CSS custom property for real viewport height on mobile
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
      window.addEventListener('orientationchange', setViewportHeight);

      return () => {
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
        document.documentElement.style.removeProperty('--vh');
      };
    }
  }, [isOpen]);

  // Load image when file changes
  useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  const onImageLoad = useCallback((e) => {
    const { width: displayWidth, height: displayHeight } = e.currentTarget;
    imgRef.current = e.currentTarget;

    // Use the DISPLAYED dimensions, not natural dimensions
    let cropWidth, cropHeight;

    if (displayWidth / displayHeight > aspectRatio) {
      // Image is wider than desired aspect ratio
      cropHeight = displayHeight * 0.7; // Slightly smaller for better visibility
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Image is taller than desired aspect ratio
      cropWidth = displayWidth * 0.7; // Slightly smaller for better visibility
      cropHeight = cropWidth / aspectRatio;
    }

    // Center the crop on the DISPLAYED image
    const x = (displayWidth - cropWidth) / 2;
    const y = (displayHeight - cropHeight) / 2;

    const initialCrop = {
      unit: 'px',
      width: Math.max(cropWidth, 50), // Ensure minimum visible size
      height: Math.max(cropHeight, 50 / aspectRatio),
      x: Math.max(x, 0),
      y: Math.max(y, 0),
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, [aspectRatio]);

  // Enhanced crop change handler with bounds checking
  const handleCropChange = useCallback((newCrop, percentageCrop) => {
    if (!imgRef.current) return;

    const { width: imgWidth, height: imgHeight } = imgRef.current;
    
    // Ensure crop stays within image bounds
    const boundedCrop = {
      ...newCrop,
      x: Math.max(0, Math.min(newCrop.x, imgWidth - newCrop.width)),
      y: Math.max(0, Math.min(newCrop.y, imgHeight - newCrop.height)),
    };

    // Ensure crop doesn't go beyond image boundaries
    if (boundedCrop.x + boundedCrop.width > imgWidth) {
      boundedCrop.width = imgWidth - boundedCrop.x;
    }
    if (boundedCrop.y + boundedCrop.height > imgHeight) {
      boundedCrop.height = imgHeight - boundedCrop.y;
    }

    // Maintain aspect ratio if width/height changed
    if (aspectRatio && boundedCrop.width !== newCrop.width) {
      boundedCrop.height = boundedCrop.width / aspectRatio;
    } else if (aspectRatio && boundedCrop.height !== newCrop.height) {
      boundedCrop.width = boundedCrop.height * aspectRatio;
    }

    setCrop(boundedCrop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (image, crop) => {
    if (!crop || !image || crop.width === 0 || crop.height === 0) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    // Set canvas size to the crop size
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped image
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            resolve(null);
            return;
          }
          
          // Create a new File object with the original file properties
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now(),
          });
          
          resolve(croppedFile);
        },
        imageFile.type,
        0.95
      );
    });
  }, [imageFile]);

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      console.error('Missing image reference or crop data');
      return;
    }

    try {
      const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop);
      if (croppedImageFile) {
        onCropComplete(croppedImageFile);
      } else {
        console.error('Failed to create cropped image');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(null);
    onClose();
  };

  // Allow scrolling within the crop modal but prevent background interaction
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="crop-modal-overlay" 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999, // Higher than other modals
        display: 'flex',
        alignItems: 'flex-start', // Changed from center to flex-start
        justifyContent: 'center',
        paddingTop: '80px', // Increased from 20px to 80px to account for navbar
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="crop-modal-content" 
        onClick={handleModalClick}
        style={{
          position: 'relative',
          maxHeight: 'calc(100vh - 100px)', // Adjusted to account for larger top padding
          width: '90vw',
          maxWidth: '900px',
          margin: '0 auto',
          overflowY: 'auto'
        }}
      >
        <div className="crop-modal-header">
          <h2>
            <CropIcon className="crop-icon" />
            Crop Image - {aspectRatio === 1 ? 'Square' : `${Math.round(aspectRatio * 100) / 100}:1 Ratio`}
          </h2>
          <button className="crop-modal-close" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="crop-container">
          <ReactCrop
            crop={crop}
            onChange={handleCropChange}
            onComplete={(c, percentageCrop) => {
              if (c.width && c.height) {
                setCompletedCrop(c);
              }
            }}
            aspect={aspectRatio}
            minWidth={30}
            minHeight={30 / aspectRatio}
            keepSelection={true}
            ruleOfThirds={true}
            circularCrop={false}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="crop-image"
              onDragStart={(e) => e.preventDefault()}
            />
          </ReactCrop>
        </div>

        <div className="crop-instructions">
          <p>
            Drag the corners to resize or drag the center to move the crop area. 
            {aspectRatio === 1 ? ' Creating square crop for profile photo.' : ` Creating ${Math.round(aspectRatio * 100) / 100}:1 ratio for event image.`}
          </p>
        </div>

        <div className="crop-modal-actions">
          <button 
            className="crop-cancel-btn" 
            onClick={handleClose}
          >
            <CancelIcon className="btn-icon" />
            Cancel
          </button>
          <button 
            className="crop-apply-btn" 
            onClick={handleCropComplete}
            disabled={!completedCrop}
          >
            <CheckIcon className="btn-icon" />
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
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
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle body scroll when modal opens/closes - ENHANCED
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const currentScrollY = window.scrollY;
      setScrollPosition(currentScrollY);
      
      // Remove any existing modal-open classes
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
      
      // Add crop modal specific classes
      document.body.classList.add('crop-modal-open');
      document.documentElement.classList.add('crop-modal-open');
      
      // More aggressive scroll prevention
      document.body.style.position = 'fixed';
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // Prevent scroll on html element too
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      
      return () => {
        // Restore everything
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        
        document.body.classList.remove('crop-modal-open');
        document.documentElement.classList.remove('crop-modal-open');
        
        // Restore original modal-open class if needed
        document.body.classList.add('modal-open');
        
        // Restore scroll position
        window.scrollTo(0, currentScrollY);
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
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    // Calculate initial crop with CORRECT aspect ratio
    let cropWidth, cropHeight;

    if (width / height > aspectRatio) {
      // Image is wider than desired aspect ratio
      cropHeight = height * 0.8;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Image is taller than desired aspect ratio
      cropWidth = width * 0.8;
      cropHeight = cropWidth / aspectRatio;
    }

    // Center the crop
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;

    const initialCrop = {
      unit: 'px',
      width: Math.max(cropWidth, 100),
      height: Math.max(cropHeight, 100 / aspectRatio),
      x: Math.max(x, 0),
      y: Math.max(y, 0),
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
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

  // Prevent any scrolling or interaction with background
  const handleModalClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const preventScroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="crop-modal-overlay" 
      onClick={handleOverlayClick}
      onWheel={preventScroll}
      onTouchMove={preventScroll}
      onScroll={preventScroll}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, // Much higher than regular modals
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <div className="crop-modal-content" onClick={handleModalClick}>
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
            onChange={(newCrop, percentageCrop) => {
              setCrop(newCrop);
            }}
            onComplete={(c, percentageCrop) => {
              if (c.width && c.height) {
                setCompletedCrop(c);
              }
            }}
            aspect={aspectRatio} // This ensures correct aspect ratio
            minWidth={50}
            minHeight={50 / aspectRatio}
            maxWidth={imgRef.current?.naturalWidth || undefined}
            maxHeight={imgRef.current?.naturalHeight || undefined}
            keepSelection={true}
            ruleOfThirds={true}
            circularCrop={false}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="crop-image"
              style={{ 
                maxHeight: window.innerWidth <= 768 ? '50vh' : '60vh', 
                maxWidth: '100%',
                height: 'auto',
                width: 'auto',
                display: 'block'
              }}
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
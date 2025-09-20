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
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef(null);

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Add classes to prevent scrolling
      document.body.classList.add('crop-modal-open');
      document.documentElement.classList.add('crop-modal-open');
      
      // Set body style to prevent scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore scroll position when modal closes
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        document.body.classList.remove('crop-modal-open');
        document.documentElement.classList.remove('crop-modal-open');
        
        // Restore scroll position
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
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

    // Calculate initial crop based on aspect ratio
    let cropWidth, cropHeight, x, y;

    if (width / height > aspectRatio) {
      // Image is wider than aspect ratio
      cropHeight = height * 0.8;
      cropWidth = cropHeight * aspectRatio;
      x = (width - cropWidth) / 2;
      y = (height - cropHeight) / 2;
    } else {
      // Image is taller than aspect ratio
      cropWidth = width * 0.8;
      cropHeight = cropWidth / aspectRatio;
      x = (width - cropWidth) / 2;
      y = (height - cropHeight) / 2;
    }

    const initialCrop = {
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: x,
      y: y,
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (image, crop) => {
    if (!crop || !image) {
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
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setCompletedCrop(null);
    onClose();
  };

  // Prevent modal from closing when clicking inside and prevent any scrolling
  const handleModalClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Prevent scroll on overlay
  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="crop-modal-overlay" 
      onClick={handleOverlayClick}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="crop-modal-content" onClick={handleModalClick}>
        <div className="crop-modal-header">
          <h2>
            <CropIcon className="crop-icon" />
            Crop Image
          </h2>
          <button className="crop-modal-close" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="crop-container">
          <ReactCrop
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={50}
            minHeight={50 / aspectRatio}
            keepSelection={true}
            ruleOfThirds={true}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="crop-image"
              style={{ maxHeight: '60vh', maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>

        <div className="crop-instructions">
          <p>Drag the corners to resize the crop area or drag the center to move it.</p>
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
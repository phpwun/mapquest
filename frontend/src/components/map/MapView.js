// First, install the exif-js library:
// npm install exif-js --save

// Then import at the top of TripForm.js:
import EXIF from 'exif-js';

// Replace the handlePhotoUpload function with this complete implementation:
const handlePhotoUpload = async e => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Check file type
  const fileType = file.type.split('/')[0];
  if (fileType !== 'image') {
    setAlert('Please upload an image file', 'danger');
    return;
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setAlert('File size should not exceed 5MB', 'danger');
    return;
  }
  
  // Check if already have 20 photos
  if (photos.length >= 20) {
    setAlert('Maximum 20 photos allowed per trip', 'danger');
    return;
  }
  
  // Validate main location coordinates for fallback
  if (!mainLocation.lat || !mainLocation.lng) {
    setAlert('Please enter location coordinates first. These must be within valid ranges: latitude (-90 to 90), longitude (-180 to 180)', 'danger');
    return;
  }
  
  // Start processing the file
  setLoading(true);
  
  try {
    // Try to extract location data from EXIF
    let photoLocation = {
      lat: parseFloat(mainLocation.lat),
      lng: parseFloat(mainLocation.lng),
      address: mainLocation.address || ''
    };
    
    // Read EXIF data from the image
    const extractExifLocation = () => {
      return new Promise((resolve) => {
        EXIF.getData(file, function() {
          try {
            // Check if image has GPS data
            if (EXIF.getTag(this, "GPSLatitude") && EXIF.getTag(this, "GPSLongitude")) {
              const latDegrees = EXIF.getTag(this, "GPSLatitude");
              const lngDegrees = EXIF.getTag(this, "GPSLongitude");
              const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
              const lngRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";
              
              if (latDegrees && lngDegrees) {
                // Convert degrees, minutes, seconds to decimal
                let lat = convertDMSToDD(latDegrees[0], latDegrees[1], latDegrees[2], latRef);
                let lng = convertDMSToDD(lngDegrees[0], lngDegrees[1], lngDegrees[2], lngRef);
                
                // Validate coordinates
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  console.log("EXIF location found:", lat, lng);
                  resolve({
                    lat,
                    lng,
                    address: ''
                  });
                  return;
                }
              }
            }
            // If we get here, either no GPS data or invalid coordinates
            console.log("No valid EXIF location data found, using main location");
            resolve(null);
          } catch (error) {
            console.error("Error extracting EXIF data:", error);
            resolve(null);
          }
        });
      });
    };
    
    // Convert EXIF DMS (degrees, minutes, seconds) format to decimal degrees
    const convertDMSToDD = (degrees, minutes, seconds, direction) => {
      let dd = degrees + minutes/60 + seconds/3600;
      if (direction === "S" || direction === "W") {
        dd = dd * -1;
      }
      return dd;
    };
    
    // Try to get location from EXIF
    const exifLocation = await extractExifLocation();
    if (exifLocation) {
      photoLocation = exifLocation;
    }
    
    // Upload the photo
    const formData = new FormData();
    formData.append('photo', file);
    
    // Make sure token is in headers
    const token = localStorage.getItem('token');
    
    console.log('Uploading photo...');
    const res = await axios.post('/api/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-auth-token': token
      }
    });
    
    console.log('Upload response:', res.data);
    
    // Fix for URL - replace "minio" with "localhost" in the URL
    let imageUrl = res.data.url;
    if (imageUrl && imageUrl.includes('minio:9000')) {
      imageUrl = imageUrl.replace('minio:9000', 'localhost:9000');
    }
    
    // Create new photo object
    const newPhoto = {
      title: file.name || 'Photo',
      description: '',
      url: imageUrl,
      location: photoLocation,
      order: photos ? photos.length : 0
    };
    
    // Safety check for photos array
    const currentPhotos = Array.isArray(photos) ? photos : [];
    
    // Add to photos array
    setFormData(prevData => ({
      ...prevData,
      photos: [...currentPhotos, newPhoto]
    }));
    
    setLoading(false);
    setAlert('Photo uploaded successfully', 'success');
  } catch (err) {
    console.error('Upload error:', err);
    setLoading(false);
    setAlert(
      err.response?.data?.message || 'Error uploading photo', 
      'danger'
    );
  }
};
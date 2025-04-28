import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import TripContext from '../../context/trip/TripContext';
import CommentBubble from './CommentBubble';

// Map component styling
const MapWrapper = styled.div`
  height: calc(100vh - 60px);
  width: 100%;
  position: relative;
`;

const MapControls = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MapButton = styled.button`
  background: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #f0f0f0;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const TripInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-width: 400px;
  
  @media (max-width: 768px) {
    bottom: 10px;
    left: 10px;
    right: 10px;
    padding: 10px;
  }
`;

const TripTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
`;

const TripDescription = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #666;
  max-height: 80px;
  overflow-y: auto;
`;

const PhotoCount = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #888;
`;

const PhotoPreview = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
  
  img {
    width: 60px;
    height: 45px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const CommentButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  
  &:hover {
    background: #357abd;
  }
`;

const CommentForm = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const CommentFormContent = styled.form`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
`;

const CommentFormTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  resize: vertical;
  margin-bottom: 10px;
`;

const CommentFormButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CommentFormButton = styled.button`
  background: ${props => props.primary ? '#4a90e2' : '#f0f0f0'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.primary ? '#357abd' : '#e0e0e0'};
  }
`;

const MapView = () => {
  const { id } = useParams(); // Trip ID if viewing a specific trip
  const { alertState, setAlertState } = useContext(AlertContext);
  const { tripState, setTripState } = useContext(TripContext);
  const { authState } = useContext(AuthContext);
  
  const [map, setMap] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTripInfo, setShowTripInfo] = useState(false);
  const [showRoutes, setShowRoutes] = useState({});
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(true);
  
  // Configure map bounds reference
  const mapBounds = useRef(null);
  
  // Define custom marker icons based on user preferences
  const createCustomIcon = (color, animal) => {
    const animalEmojis = {
      'Bear': '🐻',
      'Wolf': '🐺',
      'Fox': '🦊',
      'Lion': '🦁',
      'Tiger': '🐯',
      'Panda': '🐼',
      'Koala': '🐨',
      'Elephant': '🐘',
      'Giraffe': '🦒',
      'Dolphin': '🐬',
      'Penguin': '🐧',
      'Owl': '🦉',
      'Eagle': '🦅',
      'Butterfly': '🦋',
      'Turtle': '🐢'
    };
    
    // Use a default emoji if the animal is not found
    const emoji = animalEmojis[animal] || '🐾';
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 35px;
          height: 35px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          font-size: 20px;
          position: relative;
        ">
          ${emoji}
          <div style="
            width: 10px;
            height: 10px;
            background-color: ${color};
            position: absolute;
            bottom: -5px;
            left: 12px;
            transform: rotate(45deg);
            box-shadow: 2px 2px 2px rgba(0,0,0,0.1);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [35, 40],
      iconAnchor: [17, 40]
    });
  };
  
  // Create photo marker icons
  const createPhotoIcon = (color) => {
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 25px;
          height: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          font-size: 14px;
          position: relative;
        ">
          📷
          <div style="
            width: 8px;
            height: 8px;
            background-color: ${color};
            position: absolute;
            bottom: -4px;
            left: 8px;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [25, 30],
      iconAnchor: [12, 30]
    });
  };
  
  // Set up alerts
  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlertState([...alertState, { id, msg, type }]);

    setTimeout(() => {
      setAlertState(alertState.filter(alert => alert.id !== id));
    }, timeout);
  };
  
  // Fetch trips data
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        
        // If viewing a specific trip
        if (id) {
          const res = await axios.get(`/api/trips/${id}`);
          setCurrentTrip(res.data);
          setTrips([res.data]); // Just show this trip
          
          // Set comments
          if (res.data.comments) {
            setComments(res.data.comments);
          }
          
          // Auto show trip info and route
          setShowTripInfo(true);
          setShowRoutes({ [res.data._id]: true });
          
          // Update bounds to fit this trip
          fitMapToTrip(res.data);
        } else {
          // Load all trips
          const res = await axios.get('/api/trips');
          setTrips(res.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setAlert(
          err.response?.data?.message || 'Error fetching trips', 
          'danger'
        );
        setLoading(false);
      }
    };
    
    fetchTrips();
    // eslint-disable-next-line
  }, [id]);
  
  // Fit map to show all markers of a trip
  const fitMapToTrip = (trip) => {
    if (!trip || !map) return;
    
    const bounds = L.latLngBounds();
    
    // Add main location
    bounds.extend([trip.mainLocation.lat, trip.mainLocation.lng]);
    
    // Add all photo locations
    if (trip.photos && trip.photos.length > 0) {
      trip.photos.forEach(photo => {
        if (photo.location) {
          bounds.extend([photo.location.lat, photo.location.lng]);
        }
      });
    }
    
    // Update bounds ref
    mapBounds.current = bounds;
    
    // Fit map to bounds with padding
    map.fitBounds(bounds, { padding: [50, 50] });
  };
  
  // Toggle trip route display
  const toggleTripRoute = (tripId) => {
    // If already showing, hide it
    if (showRoutes[tripId]) {
      const updatedRoutes = { ...showRoutes };
      delete updatedRoutes[tripId];
      setShowRoutes(updatedRoutes);
      return;
    }
    
    // Find the trip
    const trip = trips.find(t => t._id === tripId);
    if (!trip) return;
    
    // Show this trip's route
    setShowRoutes({ [tripId]: true });
    setCurrentTrip(trip);
    setShowTripInfo(true);
    
    // If trip has comments, set them
    if (trip.comments) {
      setComments(trip.comments);
    } else {
      setComments([]);
    }
    
    // Fit map to trip
    fitMapToTrip(trip);
  };
  
  // Toggle comment form
  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
    setCommentText('');
  };
  
  // Handle comment submission
  const submitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentTrip) return;
    
    try {
      const res = await axios.post(`/api/trips/${currentTrip._id}/comments`, {
        text: commentText.trim()
      });
      
      setComments(res.data);
      setCommentText('');
      setShowCommentForm(false);
      setAlert('Comment added successfully', 'success');
    } catch (err) {
      setAlert(
        err.response?.data?.message || 'Error adding comment', 
        'danger'
      );
    }
  };
  
  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  // Sort photos by order
  const getSortedPhotos = (photos) => {
    if (!photos || !Array.isArray(photos)) return [];
    return [...photos].sort((a, b) => a.order - b.order);
  };
  
  // Get route coordinates from sorted photos
  const getRouteCoordinates = (trip) => {
    if (!trip || !trip.photos || trip.photos.length === 0) {
      return [[trip.mainLocation.lat, trip.mainLocation.lng]];
    }
    
    const sortedPhotos = getSortedPhotos(trip.photos);
    
    // Start with main location
    const coordinates = [[trip.mainLocation.lat, trip.mainLocation.lng]];
    
    // Add photo locations in order
    sortedPhotos.forEach(photo => {
      if (photo.location) {
        coordinates.push([photo.location.lat, photo.location.lng]);
      }
    });
    
    return coordinates;
  };
  
  // Navigate to photo book view
  const goToPhotoBook = () => {
    if (currentTrip) {
      window.location.href = `/trips/${currentTrip._id}/photobook`;
    }
  };
  
  // Center map on all trips
  const viewAllTrips = () => {
    if (!map || trips.length === 0) return;
    
    const bounds = L.latLngBounds();
    
    // Add all trip main locations
    trips.forEach(trip => {
      bounds.extend([trip.mainLocation.lat, trip.mainLocation.lng]);
    });
    
    // Fit map to bounds
    map.fitBounds(bounds, { padding: [50, 50] });
    
    // Reset state
    setCurrentTrip(null);
    setShowTripInfo(false);
    setShowRoutes({});
  };
  
  // Debug helper
  const logMapInfo = () => {
    if (!map) return;
    
    console.log('Current map center:', map.getCenter());
    console.log('Current map zoom:', map.getZoom());
    console.log('Current map bounds:', map.getBounds());
  };
  
  return (
    <MapWrapper>
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {/* Main Trip Markers */}
        {trips.map(trip => (
          <Marker
            key={trip._id}
            position={[trip.mainLocation.lat, trip.mainLocation.lng]}
            icon={createCustomIcon(trip.user.favoriteColor, trip.user.favoriteAnimal)}
            eventHandlers={{
              click: () => toggleTripRoute(trip._id)
            }}
          >
            <Popup>
              <div>
                <h3>{trip.title}</h3>
                <p>By: {trip.user.username}</p>
                <p>{trip.photos ? trip.photos.length : 0} photos</p>
                <button onClick={() => toggleTripRoute(trip._id)}>
                  {showRoutes[trip._id] ? 'Hide Route' : 'Show Route'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Photo Markers - Only show for active trip */}
        {currentTrip && showRoutes[currentTrip._id] && currentTrip.photos && currentTrip.photos.map((photo, index) => (
          <Marker
            key={`photo-${index}`}
            position={[photo.location.lat, photo.location.lng]}
            icon={createPhotoIcon(currentTrip.user.favoriteColor)}
          >
            <Popup>
              <div>
                <h4>{photo.title}</h4>
                <p>{photo.description}</p>
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  style={{ width: '150px', height: 'auto', marginTop: '5px' }}
                />
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Trip Routes */}
        {Object.keys(showRoutes).map(tripId => {
          const trip = trips.find(t => t._id === tripId);
          return trip ? (
            <Polyline
              key={`route-${tripId}`}
              positions={getRouteCoordinates(trip)}
              color={trip.user.favoriteColor}
              weight={4}
              opacity={0.7}
              dashArray="5, 10"
            />
          ) : null;
        })}
        
        {/* Comment Bubbles */}
        {showComments && comments.map((comment, index) => {
          if (!currentTrip || !map) return null;
          
          // Randomly position comments around main location
          const baseLat = currentTrip.mainLocation.lat;
          const baseLng = currentTrip.mainLocation.lng;
          
          // Use the index to distribute comments in a circle
          const angle = (index * (360 / comments.length)) * (Math.PI / 180);
          const radius = 0.01; // Adjust based on zoom level
          
          const lat = baseLat + radius * Math.cos(angle);
          const lng = baseLng + radius * Math.sin(angle);
          
          return (
            <CommentBubble
              key={comment._id || `comment-${index}`}
              comment={comment}
              trip={currentTrip}
              position={[lat, lng]}
            />
          );
        })}
      </MapContainer>
      
      <MapControls>
        <MapButton onClick={viewAllTrips} title="View all trips">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 3L3 10.53V11.5L9.84 14.16L12.5 21H13.46L21 3Z" fill="#333"/>
          </svg>
        </MapButton>
        {currentTrip && (
          <MapButton onClick={goToPhotoBook} title="View in photobook mode">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="#333"/>
            </svg>
          </MapButton>
        )}
        {currentTrip && (
          <MapButton onClick={toggleComments} title={showComments ? 'Hide comments' : 'Show comments'}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="#333"/>
            </svg>
          </MapButton>
        )}
      </MapControls>
      
      {showTripInfo && currentTrip && (
        <TripInfo>
          <TripTitle>{currentTrip.title}</TripTitle>
          <TripDescription>{currentTrip.description || 'No description provided.'}</TripDescription>
          
          <PhotoCount>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#888"/>
            </svg>
            {currentTrip.photos ? currentTrip.photos.length : 0} Photos
          </PhotoCount>
          
          {currentTrip.photos && currentTrip.photos.length > 0 && (
            <PhotoPreview>
              {getSortedPhotos(currentTrip.photos).slice(0, 5).map((photo, index) => (
                <img key={index} src={photo.url} alt={photo.title} onClick={goToPhotoBook} />
              ))}
              {currentTrip.photos.length > 5 && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#888' }}>
                  +{currentTrip.photos.length - 5} more
                </div>
              )}
            </PhotoPreview>
          )}
          
          <CommentButton onClick={toggleCommentForm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
            </svg>
            Add Comment
          </CommentButton>
        </TripInfo>
      )}
      
      {showCommentForm && (
        <CommentForm>
          <CommentFormContent onSubmit={submitComment}>
            <CommentFormTitle>Add a Comment</CommentFormTitle>
            <CommentTextarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts or reactions..."
              maxLength={500}
              required
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>
              {commentText.length <= 12 
                ? 'Your comment will appear as a small emoji bubble (3-12 characters)'
                : 'Your comment will appear as a speech bubble'}
            </p>
            <CommentFormButtons>
              <CommentFormButton 
                type="button" 
                onClick={toggleCommentForm}
              >
                Cancel
              </CommentFormButton>
              <CommentFormButton 
                type="submit" 
                primary
                disabled={!commentText.trim()}
              >
                Add Comment
              </CommentFormButton>
            </CommentFormButtons>
          </CommentFormContent>
        </CommentForm>
      )}
    </MapWrapper>
  );
};

export default MapView;
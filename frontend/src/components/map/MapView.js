import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import TripContext from '../../context/trip/TripContext';
import CommentBubble from './CommentBubble';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWrapper = styled.div`
  height: calc(100vh - 60px);
  width: 100%;
  position: relative;
`;

const MapControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Button = styled.button`
  background: ${props => props.primary ? '#4a90e2' : 'white'};
  color: ${props => props.primary ? 'white' : '#4a90e2'};
  border: 1px solid #4a90e2;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.primary ? '#357abd' : '#f0f7ff'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TripInfoPanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 300px;
`;

const TripTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
`;

const TripDescription = styled.p`
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
`;

const ViewButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.3s;
  
  &:hover {
    background: #357abd;
  }
`;

const PhotoMarker = ({ trip, photo, onMarkerClick, setShowComments }) => {
  // Determine if this is the main marker
  const isMainMarker = !photo;
  
  // Create custom icon based on user's favorite color and animal
  const createCustomIcon = () => {
    const favoriteColor = trip.user.favoriteColor;
    const favoriteAnimal = trip.user.favoriteAnimal.toLowerCase();
    
    // Default marker for main location
    if (isMainMarker) {
      return L.divIcon({
        html: `
          <div style="background-color: ${favoriteColor}; width: 25px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            <div style="color: white; transform: rotate(45deg); font-weight: bold; font-size: 16px;">
              ${trip.photos ? trip.photos.length : 0}
            </div>
          </div>
        `,
        className: '',
        iconSize: [25, 35],
        iconAnchor: [12, 35],
        popupAnchor: [0, -35]
      });
    }
    
    // Photo location markers (smaller)
    return L.divIcon({
      html: `
        <div style="background-color: ${favoriteColor}; width: 15px; height: 15px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      `,
      className: '',
      iconSize: [15, 15],
      iconAnchor: [7, 7],
      popupAnchor: [0, -7]
    });
  };
  
  const position = isMainMarker
    ? [trip.mainLocation.lat, trip.mainLocation.lng]
    : [photo.location.lat, photo.location.lng];
  
  const icon = createCustomIcon();
  
  return (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        click: () => {
          if (isMainMarker) {
            onMarkerClick(trip);
            // Show comments when main marker is clicked
            setShowComments(true);
          } else {
            onMarkerClick({ ...trip, currentPhoto: photo });
            // Hide comments for photo markers
            setShowComments(false);
          }
        }
      }}
    >
      <Popup>
        {isMainMarker ? (
          <>
            <h3>{trip.title}</h3>
            <p>{trip.mainLocation.address || `${trip.mainLocation.lat.toFixed(4)}, ${trip.mainLocation.lng.toFixed(4)}`}</p>
            <p>{trip.photos ? trip.photos.length : 0} photos</p>
          </>
        ) : (
          <>
            <h3>{photo.title}</h3>
            <p>{photo.description || 'No description'}</p>
            <img src={photo.url} alt={photo.title} style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }} />
          </>
        )}
      </Popup>
    </Marker>
  );
};

// Component to center map view on selected trip
const CenterMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const { alertState, setAlertState } = useContext(AlertContext);
  const { tripState, setTripState } = useContext(TripContext);
  
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([40, -98]); // Default center on US
  const [mapZoom, setMapZoom] = useState(4);
  const [showTripInfo, setShowTripInfo] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const mapRef = useRef(null);
  
  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlertState([...alertState, { id, msg, type }]);

    setTimeout(() => {
      setAlertState(alertState.filter(alert => alert.id !== id));
    }, timeout);
  };
  
  // Fetch trips
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (id) {
          // Fetch specific trip
          const res = await axios.get(`/api/trips/${id}`);
          setTrips([res.data]);
          setSelectedTrip(res.data);
          
          // Center map on trip
          setMapCenter([res.data.mainLocation.lat, res.data.mainLocation.lng]);
          setMapZoom(10);
          setShowTripInfo(true);
        } else {
          // Fetch all trips
          const res = await axios.get('/api/trips');
          setTrips(res.data);
        }
        
        setLoading(false);
      } catch (err) {
        setAlert(
          err.response?.data?.message || 'Error fetching trip data', 
          'danger'
        );
        setLoading(false);
      }
    };
    
    fetchData();
    // eslint-disable-next-line
  }, [id]);
  
  const handleMarkerClick = (trip) => {
    setSelectedTrip(trip);
    setShowTripInfo(true);
    
    // Center map on selected trip
    setMapCenter([trip.mainLocation.lat, trip.mainLocation.lng]);
    
    // Zoom in if needed
    if (mapZoom < 10) {
      setMapZoom(10);
    }
  };
  
  const handleCenterMap = () => {
    if (selectedTrip) {
      setMapCenter([selectedTrip.mainLocation.lat, selectedTrip.mainLocation.lng]);
      setMapZoom(10);
    } else if (trips.length > 0) {
      // Calculate bounds from all trips
      const bounds = L.latLngBounds(
        trips.map(trip => [trip.mainLocation.lat, trip.mainLocation.lng])
      );
      
      mapRef.current.fitBounds(bounds);
    }
  };
  
  const handleViewPhotobook = () => {
    if (selectedTrip) {
      navigate(`/trips/${selectedTrip._id}/photobook`);
    }
  };
  
  if (loading) {
    return <div>Loading map...</div>;
  }
  
  return (
    <MapWrapper>
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={map => { mapRef.current = map; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <CenterMapView center={mapCenter} zoom={mapZoom} />
        
        {trips.map(trip => (
          <React.Fragment key={trip._id}>
            {/* Main marker for the trip */}
            <PhotoMarker 
              trip={trip} 
              onMarkerClick={handleMarkerClick}
              setShowComments={setShowComments}
            />
            
            {/* Only show photo markers and route for selected trip */}
            {selectedTrip && selectedTrip._id === trip._id && trip.photos && trip.photos.length > 0 && (
              <>
                {/* Photo markers */}
                {trip.photos.map(photo => (
                  <PhotoMarker 
                    key={photo._id || photo.url} 
                    trip={trip} 
                    photo={photo} 
                    onMarkerClick={handleMarkerClick}
                    setShowComments={setShowComments}
                  />
                ))}
                
                {/* Route path between points */}
                <Polyline
                  positions={[
                    [trip.mainLocation.lat, trip.mainLocation.lng],
                    ...trip.photos
                      .sort((a, b) => a.order - b.order)
                      .map(photo => [photo.location.lat, photo.location.lng])
                  ]}
                  color={trip.user.favoriteColor}
                  weight={3}
                  opacity={0.7}
                />
              </>
            )}
          </React.Fragment>
        ))}
        
        {/* Show comment bubbles for selected trip */}
        {selectedTrip && showComments && selectedTrip.comments && selectedTrip.comments.length > 0 && (
          selectedTrip.comments.map((comment, index) => (
            <CommentBubble
              key={comment._id || index}
              comment={comment}
              trip={selectedTrip}
              position={[
                selectedTrip.mainLocation.lat + (Math.random() * 0.02 - 0.01),
                selectedTrip.mainLocation.lng + (Math.random() * 0.02 - 0.01)
              ]}
            />
          ))
        )}
      </MapContainer>
      
      <MapControls>
        <Button onClick={handleCenterMap}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" fill="currentColor"/>
          </svg>
          Center Map
        </Button>
        {selectedTrip && (
          <Button primary onClick={handleViewPhotobook}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
            </svg>
            View Photobook
          </Button>
        )}
      </MapControls>
      
      {showTripInfo && selectedTrip && (
        <TripInfoPanel>
          <TripTitle>{selectedTrip.title}</TripTitle>
          {selectedTrip.currentPhoto ? (
            <>
              <img 
                src={selectedTrip.currentPhoto.url} 
                alt={selectedTrip.currentPhoto.title}
                style={{ width: '100%', borderRadius: '4px', marginBottom: '10px' }}  
              />
              <p>{selectedTrip.currentPhoto.description || 'No description provided.'}</p>
            </>
          ) : (
            <TripDescription>
              {selectedTrip.description || 'No description provided.'}
            </TripDescription>
          )}
          <ViewButton onClick={handleViewPhotobook}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H17.5L13.96 12.29Z" fill="white"/>
            </svg>
            View Photobook
          </ViewButton>
        </TripInfoPanel>
      )}
    </MapWrapper>
  );
};

export default MapView;
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import TripContext from '../../context/trip/TripContext';

const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 2.2rem;
  color: #333;
  margin: 0 0 10px 0;
`;

const Metadata = styled.div`
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Button = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &.primary {
    background-color: #4a90e2;
    color: white;
    
    &:hover {
      background-color: #357abd;
    }
  }
  
  &.secondary {
    background-color: white;
    color: #4a90e2;
    border: 1px solid #4a90e2;
    
    &:hover {
      background-color: #f0f7ff;
    }
  }
  
  &.danger {
    background-color: white;
    color: #e74c3c;
    border: 1px solid #e74c3c;
    
    &:hover {
      background-color: #fdf0f0;
    }
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  transition: all 0.3s;
  
  &:hover {
    background-color: #fdf0f0;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 30px;
`;

const MapPreview = styled.div`
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  height: 300px;
  position: relative;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const ViewMapButton = styled.div`
  background: white;
  color: #333;
  padding: 12px 20px;
  border-radius: 5px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const PhotosSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const PhotosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const PhotoCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const PhotoInfo = styled.div`
  padding: 15px;
`;

const PhotoTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #333;
`;

const PhotoLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 10px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CommentsSection = styled.div`
  margin-bottom: 40px;
`;

const CommentsList = styled.div`
  margin-top: 20px;
`;

const CommentCard = styled.div`
  display: flex;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
`;

const CommentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color || '#4a90e2'};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  margin-right: 15px;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentUser = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
`;

const CommentText = styled.p`
  margin: 0;
  color: #444;
  font-size: ${props => props.isEmoji ? '18px' : '0.9rem'};
`;

const CommentDate = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
`;

const NoCommentsMessage = styled.div`
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const { alertState, setAlertState } = useContext(AlertContext);
  const { tripState, setTripState } = useContext(TripContext);
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
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
  
  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlertState([...alertState, { id, msg, type }]);

    setTimeout(() => {
      setAlertState(alertState.filter(alert => alert.id !== id));
    }, timeout);
  };
  
  // Fetch trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/trips/${id}`);
        
        setTrip(res.data);
        
        // Check if current user is the trip owner
        if (authState.user && res.data.user._id === authState.user._id) {
          setIsOwner(true);
        }
        
        // Update trip in context
        setTripState({
          ...tripState,
          currentTrip: res.data
        });
        
        setLoading(false);
      } catch (err) {
        setAlert(
          err.response?.data?.message || 'Error fetching trip', 
          'danger'
        );
        setLoading(false);
        navigate('/dashboard');
      }
    };
    
    fetchTrip();
    // eslint-disable-next-line
  }, [id, authState.user]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/trips/${id}`);
        
        // Update trips in context
        setTripState({
          ...tripState,
          trips: tripState.trips.filter(t => t._id !== id),
          currentTrip: null
        });
        
        setAlert('Trip deleted successfully', 'success');
        navigate('/dashboard');
      } catch (err) {
        setAlert(
          err.response?.data?.message || 'Error deleting trip', 
          'danger'
        );
      }
    }
  };
  
  if (loading) {
    return (
      <LoadingSpinner>
        Loading...
      </LoadingSpinner>
    );
  }
  
  if (!trip) {
    return (
      <DetailContainer>
        <div>Trip not found</div>
      </DetailContainer>
    );
  }
  
  // Format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <DetailContainer>
      <HeaderSection>
        <TitleSection>
          <Title>{trip.title}</Title>
          <Metadata>
            <MetadataItem>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#666"/>
              </svg>
              {trip.user.username}
            </MetadataItem>
            <MetadataItem>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 17H7V7H17V17ZM15 9H9V11H15V9ZM15 13H9V15H15V13Z" fill="#666"/>
              </svg>
              {formatDate(trip.createdAt)}
            </MetadataItem>
            <MetadataItem>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#666"/>
              </svg>
              {trip.mainLocation.address || 
                `${trip.mainLocation.lat.toFixed(4)}, ${trip.mainLocation.lng.toFixed(4)}`
              }
            </MetadataItem>
          </Metadata>
        </TitleSection>
        
        <ActionButtons>
          <Button to={`/trips/${id}/map`} className="primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z" fill="white"/>
            </svg>
            Map View
          </Button>
          
          <Button to={`/trips/${id}/photobook`} className="primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="white"/>
            </svg>
            Photobook
          </Button>
          
          {isOwner && (
            <>
              <Button to={`/trips/${id}/edit`} className="secondary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="#4a90e2"/>
                </svg>
                Edit Trip
              </Button>
              
              <DeleteButton onClick={handleDelete}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="#e74c3c"/>
                </svg>
                Delete
              </DeleteButton>
            </>
          )}
        </ActionButtons>
      </HeaderSection>
      
      <Description>{trip.description || 'No description provided.'}</Description>
      
      <MapPreview>
        <iframe 
          title="Trip location"
          src={`https://maps.google.com/maps?q=${trip.mainLocation.lat},${trip.mainLocation.lng}&z=13&output=embed`}
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
        />
        <Link to={`/trips/${id}/map`}>
          <MapOverlay>
            <ViewMapButton>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#333"/>
              </svg>
              View Interactive Map
            </ViewMapButton>
          </MapOverlay>
        </Link>
      </MapPreview>
      
      <PhotosSection>
        <SectionTitle>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#4a90e2"/>
          </svg>
          Photos ({trip.photos ? trip.photos.length : 0})
        </SectionTitle>
        
        {trip.photos && trip.photos.length > 0 ? (
          <PhotosGrid>
            {trip.photos.map((photo, index) => (
              <PhotoCard key={photo._id || index}>
                <Link to={`/trips/${id}/photobook`}>
                  <PhotoImage src={photo.url} alt={photo.title} />
                </Link>
                <PhotoInfo>
                  <PhotoTitle>{photo.title}</PhotoTitle>
                  <PhotoLocation>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#666"/>
                    </svg>
                    {photo.location?.address || 
                      `${photo.location?.lat.toFixed(3)}, ${photo.location?.lng.toFixed(3)}`
                    }
                  </PhotoLocation>
                </PhotoInfo>
              </PhotoCard>
            ))}
          </PhotosGrid>
        ) : (
          <NoCommentsMessage>
            This trip has no photos yet.
          </NoCommentsMessage>
        )}
      </PhotosSection>
      
      <CommentsSection>
        <SectionTitle>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#4a90e2"/>
          </svg>
          Comments ({trip.comments ? trip.comments.length : 0})
        </SectionTitle>
        
        <CommentsList>
          {trip.comments && trip.comments.length > 0 ? (
            trip.comments.map((comment, index) => {
              const animalEmoji = animalEmojis[comment.user.favoriteAnimal] || '🐾';
              
              return (
                <CommentCard key={comment._id || index}>
                  <CommentAvatar color={comment.user.favoriteColor}>
                    {animalEmoji}
                  </CommentAvatar>
                  <CommentContent>
                    <CommentUser>{comment.user.username}</CommentUser>
                    <CommentText isEmoji={comment.isEmoji}>
                      {comment.text}
                    </CommentText>
                    <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                  </CommentContent>
                </CommentCard>
              );
            })
          ) : (
            <NoCommentsMessage>
              No comments yet. Be the first to comment on this trip!
            </NoCommentsMessage>
          )}
        </CommentsList>
      </CommentsSection>
    </DetailContainer>
  );
};

export default TripDetail;
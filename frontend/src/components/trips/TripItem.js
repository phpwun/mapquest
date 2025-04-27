import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const CardImageContainer = styled.div`
  height: 180px;
  overflow: hidden;
  position: relative;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const PhotoCount = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CardContent = styled.div`
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const TripTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
`;

const TripDescription = styled.p`
  color: #666;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
  line-height: 1.5;
  flex-grow: 1;
  
  /* Truncate text after 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
`;

const ViewButton = styled(Link)`
  text-decoration: none;
  color: #4a90e2;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    color: #357abd;
  }
`;

const TripLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #888;
  font-size: 0.9rem;
  margin-top: 5px;
`;

const TripDate = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 15px;
`;

const TripItem = ({ trip }) => {
  // Format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Placeholder image if no photos
  const defaultImageUrl = 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80';

  return (
    <Card>
      <CardImageContainer>
        <CardImage 
          src={trip.photos && trip.photos.length > 0 ? trip.photos[0].url : defaultImageUrl} 
          alt={trip.title} 
        />
        <PhotoCount>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM9.5 13.5L11 15.5L13.5 12L17 17H7L9.5 13.5Z" fill="white"/>
          </svg>
          {trip.photos ? trip.photos.length : 0}
        </PhotoCount>
      </CardImageContainer>
      
      <CardContent>
        <TripTitle>{trip.title}</TripTitle>
        <TripDate>{formatDate(trip.createdAt)}</TripDate>
        <TripLocation>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#888"/>
          </svg>
          {trip.mainLocation && trip.mainLocation.address ? 
            truncateText(trip.mainLocation.address, 30) : 
            `${trip.mainLocation?.lat.toFixed(2)}, ${trip.mainLocation?.lng.toFixed(2)}`
          }
        </TripLocation>
        
        <TripDescription>{trip.description || 'No description provided.'}</TripDescription>
        
        <CardActions>
          <ViewButton to={`/trips/${trip._id}`}>
            View Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
            </svg>
          </ViewButton>
          
          <div>
            <ViewButton to={`/trips/${trip._id}/map`} style={{ marginRight: '15px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z" fill="currentColor"/>
              </svg>
            </ViewButton>
            
            <ViewButton to={`/trips/${trip._id}/photobook`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
              </svg>
            </ViewButton>
          </div>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default TripItem;
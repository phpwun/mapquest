import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import AlertContext from '../../context/alert/AlertContext';
import TripContext from '../../context/trip/TripContext';
import CommentForm from './CommentForm';

const PhotoBookContainer = styled.div`
  height: calc(100vh - 60px);
  width: 100%;
  background-color: #000;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const CarouselContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const PhotoWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const PhotoImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.prev {
    left: 20px;
  }
  
  &.next {
    right: 20px;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const PhotoInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 20px;
  box-sizing: border-box;
`;

const PhotoTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.5rem;
`;

const PhotoDescription = styled.p`
  margin: 0 0 15px 0;
  font-size: 1rem;
  max-width: 60%;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const PhotoLocation = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CommentBubble = styled.div`
  position: absolute;
  max-width: 200px;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  animation: fadeIn 0.5s ease-in-out;
  z-index: 50;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const AnimalEmoji = styled.div`
  font-size: 20px;
  margin-right: 10px;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: ${props => props.isEmoji ? '16px' : '14px'};
`;

const Controls = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
`;

const ControlButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Counter = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  z-index: 100;
`;

const Indicators = styled.div`
  position: absolute;
  bottom: 100px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 100;
`;

const Indicator = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
`;

const PhotoBookView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alertState, setAlertState } = useContext(AlertContext);
  const { tripState, setTripState } = useContext(TripContext);
  
  const [trip, setTrip] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Animal emojis for the comment bubbles
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
  
  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/trips/${id}`);
        
        // Make sure trip has photos
        if (!res.data.photos || res.data.photos.length === 0) {
          setAlert('This trip has no photos to display', 'warning');
          navigate('/dashboard');
          return;
        }
        
        setTrip(res.data);
        
        // Set comments from the trip
        if (res.data.comments) {
          setComments(res.data.comments);
        }
        
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
  }, [id]);
  
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(prevIndex => 
      prevIndex === 0 ? trip.photos.length - 1 : prevIndex - 1
    );
  };
  
  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prevIndex => 
      prevIndex === trip.photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToMapView = () => {
    navigate(`/trips/${id}/map`);
  };
  
  const getRandomPosition = () => {
    const positions = [
      { top: '20%', left: '15%' },
      { top: '30%', right: '10%' },
      { bottom: '25%', right: '15%' },
      { bottom: '35%', left: '10%' },
      { top: '60%', left: '5%' },
      { top: '15%', right: '5%' }
    ];
    
    return positions[Math.floor(Math.random() * positions.length)];
  };
  
  const handleCommentSubmit = async (commentText) => {
    try {
      const res = await axios.post(`/api/trips/${id}/comments`, {
        text: commentText
      });
      
      setComments(res.data);
      setShowCommentForm(false);
      setAlert('Comment added successfully', 'success');
    } catch (err) {
      setAlert(
        err.response?.data?.message || 'Error adding comment', 
        'danger'
      );
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line
  }, [trip]);
  
  if (loading || !trip) {
    return <div>Loading photobook...</div>;
  }
  
  const currentPhoto = trip.photos[currentPhotoIndex];
  
  return (
    <PhotoBookContainer>
      <Counter>
        {currentPhotoIndex + 1} / {trip.photos.length}
      </Counter>
      
      <Controls>
        <ControlButton onClick={() => setShowCommentForm(!showCommentForm)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
          </svg>
          {showCommentForm ? 'Cancel' : 'Add Comment'}
        </ControlButton>
        
        <ControlButton onClick={goToMapView}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z" fill="currentColor"/>
          </svg>
          Map View
        </ControlButton>
      </Controls>
      
      <CarouselContainer>
        <NavButton className="prev" onClick={handlePrevPhoto}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="white"/>
          </svg>
        </NavButton>
        
        <PhotoWrapper>
          <PhotoImage src={currentPhoto.url} alt={currentPhoto.title} />
          
          <PhotoInfo>
            <PhotoTitle>{currentPhoto.title}</PhotoTitle>
            <PhotoDescription>{currentPhoto.description || 'No description provided.'}</PhotoDescription>
            <PhotoLocation>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white"/>
              </svg>
              {currentPhoto.location?.address || 
                `${currentPhoto.location?.lat.toFixed(4)}, ${currentPhoto.location?.lng.toFixed(4)}`
              }
            </PhotoLocation>
          </PhotoInfo>
          
          {/* Display randomly positioned comments */}
          {comments.slice(0, 3).map((comment, index) => {
            const position = getRandomPosition();
            const animalEmoji = animalEmojis[comment.user.favoriteAnimal] || '🐾';
            
            return (
              <CommentBubble 
                key={comment._id || index}
                style={{
                  ...position,
                  backgroundColor: comment.user.favoriteColor,
                  color: 'white'
                }}
              >
                <AnimalEmoji>{animalEmoji}</AnimalEmoji>
                <CommentText isEmoji={comment.isEmoji}>
                  {comment.text}
                </CommentText>
              </CommentBubble>
            );
          })}
        </PhotoWrapper>
        
        <NavButton className="next" onClick={handleNextPhoto}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="white"/>
          </svg>
        </NavButton>
      </CarouselContainer>
      
      <Indicators>
        {trip.photos.map((_, index) => (
          <Indicator
            key={index}
            active={currentPhotoIndex === index}
            onClick={() => setCurrentPhotoIndex(index)}
          />
        ))}
      </Indicators>
      
      {showCommentForm && (
        <CommentForm 
          onSubmit={handleCommentSubmit}
          onCancel={() => setShowCommentForm(false)}
        />
      )}
    </PhotoBookContainer>
  );
};

export default PhotoBookView;
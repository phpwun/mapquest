import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';

const BubbleContent = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
`;

const AnimalIcon = styled.div`
  width: 30px;
  height: 30px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: ${props => props.isEmoji ? '16px' : '12px'};
  color: #333;
`;

const CommentBubble = ({ comment, trip, position }) => {
  const [visible, setVisible] = useState(false);
  
  // Animal emojis for the comment bubble
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
  
  // Get emoji for user's favorite animal
  const getAnimalEmoji = () => {
    const favoriteAnimal = comment.user.favoriteAnimal;
    return animalEmojis[favoriteAnimal] || '🐾';
  };
  
  // Create comment bubble icon
  const createCommentIcon = () => {
    const isEmoji = comment.isEmoji;
    const favoriteColor = comment.user.favoriteColor;
    const animalEmoji = getAnimalEmoji();
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${favoriteColor};
          color: white;
          padding: 8px 12px;
          border-radius: 16px;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          font-size: ${isEmoji ? '16px' : '12px'};
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          animation: fadeIn 0.5s ease-in-out;
        ">
          ${animalEmoji} ${comment.text.length > 20 ? comment.text.substring(0, 20) + '...' : comment.text}
          <div style="
            width: 10px;
            height: 10px;
            background-color: ${favoriteColor};
            position: absolute;
            bottom: -5px;
            left: 10px;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [150, 40],
      iconAnchor: [10, 40],
      popupAnchor: [0, -40]
    });
  };
  
  // Show comments with animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, Math.random() * 1000); // Random delay for staggered appearance
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-hide comments after some time
  useEffect(() => {
    if (visible) {
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 5000 + Math.random() * 3000); // Show for 5-8 seconds
      
      return () => clearTimeout(hideTimer);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Marker position={position} icon={createCommentIcon()}>
      <Popup>
        <BubbleContent>
          <AnimalIcon>{getAnimalEmoji()}</AnimalIcon>
          <CommentText isEmoji={comment.isEmoji}>
            {comment.text}
          </CommentText>
        </BubbleContent>
      </Popup>
    </Marker>
  );
};

export default CommentBubble;
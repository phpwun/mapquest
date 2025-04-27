import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Form = styled.form`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const CharCounter = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: ${props => props.isLong ? '#999' : props.isEmoji ? '#4caf50' : '#f44336'};
  margin-top: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &.primary {
    background: #4a90e2;
    color: white;
    border: none;
    
    &:hover {
      background: #357abd;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: white;
    color: #4a90e2;
    border: 1px solid #4a90e2;
    
    &:hover {
      background: #f0f7ff;
    }
  }
`;

const Hint = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 15px 0;
  font-style: italic;
`;

const CommentForm = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState('');
  
  const handleChange = (e) => {
    setText(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (text.trim() === '') return;
    
    onSubmit(text.trim());
    setText('');
  };
  
  const isEmoji = text.length <= 12;
  const isLong = text.length > 500;
  
  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Title>Add a Comment</Title>
        
        <Hint>
          {isEmoji 
            ? 'Your comment will appear as a small emoji bubble (3-12 characters)' 
            : 'Your comment will appear as a speech bubble'}
        </Hint>
        
        <FormGroup>
          <Label htmlFor="comment">Your Comment</Label>
          <TextArea
            id="comment"
            value={text}
            onChange={handleChange}
            placeholder="Share your thoughts or reactions..."
            maxLength={500}
            required
          />
          <CharCounter isEmoji={isEmoji} isLong={isLong}>
            {text.length}/500 characters {isEmoji && '(Emoji Mode)'}
          </CharCounter>
        </FormGroup>
        
        <ButtonGroup>
          <Button 
            type="button" 
            className="secondary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="primary"
            disabled={text.trim() === '' || isLong}
          >
            Add Comment
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default CommentForm;
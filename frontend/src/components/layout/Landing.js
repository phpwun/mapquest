import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AuthContext from '../../context/auth/AuthContext';

const HeroContainer = styled.div`
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  position: relative;
  overflow: hidden;
  text-align: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2134&q=80');
    background-size: cover;
    background-position: center;
    filter: brightness(0.7);
    z-index: -1;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 40px;
  max-width: 800px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  padding: 12px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s;
  
  &.primary {
    background-color: #4a90e2;
    color: white;
    
    &:hover {
      background-color: #357abd;
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const Landing = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <HeroContainer>
      <Title>Share Your Journey</Title>
      <Subtitle>
        Create beautiful interactive maps of your travels, showcase your photos, and connect with other travelers in a unique social experience.
      </Subtitle>
      <ButtonContainer>
        <Button to="/register" className="primary">Get Started</Button>
        <Button to="/login" className="secondary">Sign In</Button>
      </ButtonContainer>
    </HeroContainer>
  );
};

export default Landing;
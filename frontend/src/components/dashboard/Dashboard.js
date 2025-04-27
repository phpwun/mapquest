import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import AuthContext from '../../context/auth/AuthContext';
import TripContext from '../../context/trip/TripContext';
import AlertContext from '../../context/alert/AlertContext';
import TripItem from '../trips/TripItem';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
`;

const AddButton = styled(Link)`
  background-color: #4a90e2;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #357abd;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 0;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.4rem;
  color: #495057;
  margin-bottom: 15px;
`;

const EmptyText = styled.p`
  color: #6c757d;
  margin-bottom: 25px;
`;

const TripGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
`;

const Welcome = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const WelcomeTitle = styled.h3`
  font-size: 1.4rem;
  color: #495057;
  margin-bottom: 10px;
`;

const WelcomeText = styled.p`
  color: #6c757d;
  line-height: 1.6;
`;

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
  const { tripState, setTripState } = useContext(TripContext);
  const { alertState, setAlertState } = useContext(AlertContext);
  const [loading, setLoading] = useState(true);

  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlertState([...alertState, { id, msg, type }]);

    setTimeout(() => {
      setAlertState(alertState.filter(alert => alert.id !== id));
    }, timeout);
  };

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get('/api/trips');
        
        setTripState({
          ...tripState,
          trips: res.data,
          loading: false
        });
        
        setLoading(false);
      } catch (err) {
        setAlert(
          err.response?.data?.message || 'Error fetching trips', 
          'danger'
        );
        
        setTripState({
          ...tripState,
          trips: [],
          loading: false,
          error: err.response?.data?.message || 'Error fetching trips'
        });
        
        setLoading(false);
      }
    };

    fetchTrips();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <Welcome>
        <WelcomeTitle>Welcome, {authState.user?.username}!</WelcomeTitle>
        <WelcomeText>
          Create and share your travel memories by adding new trips. Your pins will be colored with your favorite color ({authState.user?.favoriteColor}) and marked with your favorite animal ({authState.user?.favoriteAnimal}).
        </WelcomeText>
      </Welcome>
      
      <Header>
        <Title>Your Trips</Title>
        <AddButton to="/trips/new">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add New Trip
        </AddButton>
      </Header>
      
      {tripState.trips.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No trips yet</EmptyTitle>
          <EmptyText>Start by adding your first travel memory!</EmptyText>
          <AddButton to="/trips/new">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add New Trip
          </AddButton>
        </EmptyState>
      ) : (
        <TripGrid>
          {tripState.trips.map(trip => (
            <TripItem key={trip._id} trip={trip} />
          ))}
        </TripGrid>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
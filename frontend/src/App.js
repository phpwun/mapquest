import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import MapView from './components/map/MapView';
import PhotoBookView from './components/photobook/PhotoBookView';
import TripForm from './components/trips/TripForm';
import TripDetail from './components/trips/TripDetail';
import PrivateRoute from './components/routing/PrivateRoute';
import Alert from './components/layout/Alert';

// Context
import AuthContext from './context/auth/AuthContext';
import AlertContext from './context/alert/AlertContext';
import TripContext from './context/trip/TripContext';

// Utils
import setAuthToken from './utils/setAuthToken';

// Check for token in localStorage
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  });

  const [alertState, setAlertState] = useState([]);

  const [tripState, setTripState] = useState({
    trips: [],
    currentTrip: null,
    loading: true,
    error: null
  });

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        setAuthToken(localStorage.token);
        
        try {
          const res = await axios.get('/api/auth/me');
          
          setAuthState({
            ...authState,
            isAuthenticated: true,
            loading: false,
            user: res.data
          });
        } catch (err) {
          localStorage.removeItem('token');
          setAuthState({
            ...authState,
            token: null,
            isAuthenticated: false,
            loading: false,
            user: null,
            error: err.response?.data?.message || 'Authentication error'
          });
        }
      } else {
        setAuthState({
          ...authState,
          isAuthenticated: false,
          loading: false
        });
      }
    };

    loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <AlertContext.Provider value={{ alertState, setAlertState }}>
        <TripContext.Provider value={{ tripState, setTripState }}>
          <Router>
            <div className="App">
              <Navbar />
              <Alert />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/map" 
                  element={
                    <PrivateRoute>
                      <MapView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/trips/:id/map" 
                  element={
                    <PrivateRoute>
                      <MapView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/trips/:id/photobook" 
                  element={
                    <PrivateRoute>
                      <PhotoBookView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/trips/new" 
                  element={
                    <PrivateRoute>
                      <TripForm />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/trips/:id/edit" 
                  element={
                    <PrivateRoute>
                      <TripForm />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/trips/:id" 
                  element={
                    <PrivateRoute>
                      <TripDetail />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </TripContext.Provider>
      </AlertContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
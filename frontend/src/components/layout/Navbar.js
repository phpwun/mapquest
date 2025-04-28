import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AuthContext from '../../context/auth/AuthContext';

const NavContainer = styled.nav`
  background-color: #4a90e2;
  padding: 12px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-left: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Button = styled.button`
background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  padding: 8px 12px;
  margin-left: 20px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Navbar = () => {
  const { authState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { isAuthenticated, loading } = authState;

  const onLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Update auth state
    setAuthState({
      ...authState,
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    });
    
    navigate('/');
  };

  const authLinks = (
    <NavLinks role="navigation" aria-label="User navigation">
      <NavLink to="/dashboard" aria-label="Go to dashboard">Dashboard</NavLink>
      <NavLink to="/map" aria-label="View map">Map View</NavLink>
      <Button onClick={onLogout} aria-label="Logout">Logout</Button>
    </NavLinks>
  );

  const guestLinks = (
    <NavLinks role="navigation" aria-label="Guest navigation">
      <NavLink to="/register" aria-label="Register new account">Register</NavLink>
      <NavLink to="/login" aria-label="Login to account">Login</NavLink>
    </NavLinks>
  );

  return (
    <NavContainer role="navigation" aria-label="Main Navigation">
      <Logo to="/" aria-label="PhotoBook Home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 13.17 9.42 18.92 11.24 21.11C11.64 21.59 12.37 21.59 12.77 21.11C14.58 18.92 19 13.17 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="white"/>
        </svg>
        PhotoBook
      </Logo>
      {!loading && (isAuthenticated ? authLinks : guestLinks)}
    </NavContainer>
  );
};

export default Navbar;
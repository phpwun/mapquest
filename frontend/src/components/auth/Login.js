import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/auth/AuthContext';
import AlertContext from '../../context/alert/AlertContext';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 500px;
  margin: 80px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
`;

const Button = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #357abD;
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 20px;
  
  a {
    color: #4a90e2;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const { authState, setAuthState } = useContext(AuthContext);
  const { alertState, setAlertState } = useContext(AlertContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, navigate]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlertState([...alertState, { id, msg, type }]);

    setTimeout(() => {
      setAlertState(alertState.filter(alert => alert.id !== id));
    }, timeout);
  };

  const onSubmit = async e => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify({ email, password });

      const res = await axios.post('/api/auth/login', body, config);

      // Set token in localStorage
      localStorage.setItem('token', res.data.token);

      // Update auth state
      setAuthState({
        ...authState,
        token: res.data.token,
        isAuthenticated: true,
        loading: false,
        user: res.data.user
      });

      navigate('/dashboard');
    } catch (err) {
      localStorage.removeItem('token');
      
      setAlert(
        err.response?.data?.message || 'Invalid credentials', 
        'danger'
      );
      
      setAuthState({
        ...authState,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: err.response?.data?.message || 'Login failed'
      });
    }
  };

  return (
    <Container>
      <Title>Sign In</Title>
      <Form onSubmit={onSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </FormGroup>
        <Button type="submit">Login</Button>
      </Form>
      <RegisterLink>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </RegisterLink>
    </Container>
  );
};

export default Login;
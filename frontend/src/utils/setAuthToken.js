import axios from 'axios';

const setAuthToken = token => {
  if (token) {
    // Set auth token for all requests
    axios.defaults.headers.common['x-auth-token'] = token;
    // Log to confirm token is set (remove in production)
    console.log('Auth token set:', token.substring(0, 10) + '...');
  } else {
    // Remove auth token
    delete axios.defaults.headers.common['x-auth-token'];
    console.log('Auth token removed');
  }
};

export default setAuthToken;
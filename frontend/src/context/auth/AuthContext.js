import { createContext, useReducer } from 'react';

// Define actions
export const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  USER_LOADED: 'USER_LOADED',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_FAIL: 'LOGIN_FAIL',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user
      };
    case AUTH_ACTIONS.AUTH_ERROR:
    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.REGISTER_FAIL:
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ authState: state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
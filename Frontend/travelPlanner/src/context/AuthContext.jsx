import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Actions
const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case authActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  }, []);

  // Verify token function
  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        dispatch({
          type: authActions.LOGIN_SUCCESS,
          payload: {
            user: userData.user,
            token: token
          }
        });
      } else {
        localStorage.removeItem('token');
        dispatch({ type: authActions.LOGOUT });
      }
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: authActions.LOGOUT });
    } finally {
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  };

  // Login function
  const login = async (email, password) => {
    dispatch({ type: authActions.LOGIN_START });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        dispatch({
          type: authActions.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            token: data.token
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: authActions.LOGIN_FAILURE,
          payload: data.message || 'Login failed'
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: 'Network error. Please try again.'
      });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: authActions.LOGIN_START });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        dispatch({
          type: authActions.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            token: data.token
          }
        });
        return { success: true };
      } else {
        dispatch({
          type: authActions.LOGIN_FAILURE,
          payload: data.message || 'Registration failed'
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: 'Network error. Please try again.'
      });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: authActions.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

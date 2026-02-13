// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useReducer } from 'react';

import { authService } from '../services/apiService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const userData = JSON.parse(user);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              token: token,
            },
          });
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      // Stocker les données
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        role: response.role,
      }));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            username: response.username,
            role: response.role,
          },
          token: response.token,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data || 'Erreur de connexion';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.register(userData);
      
      // Stocker les données
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        role: response.role,
      }));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            username: response.username,
            role: response.role,
          },
          token: response.token,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const isAdmin = () => {
    return state.user?.role === 'ADMIN';
  };

  const isUser = () => {
    return state.user?.role === 'USER';
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    isAdmin,
    isUser,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};


'use client';

import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { isValidToken, setLocalStorage, clearLocalStorageStates } from './utils';

// ----------------------------------------------------------------------


const initialState = {
  user: null,
  loading: true,
  accessToken: null,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'GOOGLE_LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  if (action.type === 'UPDATE_USER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setLocalStorage(accessToken);

        const response = await axios.get(endpoints.auth.user, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const { user } = response.data.data;

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              ...user,
              loading: false,
              accessToken
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const verifyUser = useCallback(async (token) => {
    try {
      console.log('here the user login verifyUser ', verifyUser);
      const response = await axios.get(`${endpoints.auth.verify}?token=${token}`);

      return response.data;
    } catch (error) {
      
      return { errors: error.errors || 'Verification failed' };
    }
  }, []);

  // LOGIN
  const login = useCallback(async (email, password) => {
    try {
      const data = { email, password };
      const response = await axios.post(endpoints.auth.login, data);

      const { accessToken, user, errors, message } = response.data;
      if (!accessToken) {
        throw new Error(errors || message || "Login failed");
      }
  
      setLocalStorage(accessToken);
      Cookies.set('userRole', user?.role);
      Cookies.set('status', user?.status);

      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            ...user,
            accessToken,
          },
        },
      });
    } catch (error) {
      throw new Error(error.response?.data?.errors || error.message || "Login failed");
    }
  }, []);

  const googleLogin = useCallback(async ({
    userId, 
    // user, accessToken, refreshToken, expires 
  }) => {
    try {
      // const data = { user, accessToken, refreshToken, expires };

      const data = { userId };
      const response = await axios.post(endpoints.auth.googleLogin, data);

      const {
        accessToken: newAccessToken,
        user: newUser,
        errors,
        message
      } = response.data;
      
      if (!newAccessToken) {
        throw new Error(errors || message || "Login failed");
      }

      setLocalStorage(newAccessToken);
      Cookies.set('userRole', newUser?.role);
      Cookies.set('status', newUser?.status);

      dispatch({
        type: 'GOOGLE_LOGIN',
        payload: {
          user: {
            ...newUser,
            accessToken: newAccessToken,
          },
        },
      });
    } catch (error) {
      throw new Error(error.response?.data?.errors || error.message || "Login failed");
    }
  }, []);

  const updateUser = useCallback((newUser) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        user: {
          ...newUser,
          accessToken: state.user?.accessToken || null
        },
      },
    });
  }, [state.user?.accessToken]);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const data = { email, password, firstName, lastName };
    const response = await axios.post(endpoints.auth.register, data);
    const { errors } = response.data;

    if(errors) throw new Error(errors);
    
    return response.data;
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setLocalStorage(null);
    clearLocalStorageStates();
    Cookies.remove('userRole');
    Cookies.remove('status');
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      accessToken: state.user ? state.user.accessToken : null,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      login,
      register,
      logout,
      verifyUser,
      googleLogin,
      updateUser
    }),
    [googleLogin, login, logout, register, verifyUser, state.user, status]
  );
 
  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

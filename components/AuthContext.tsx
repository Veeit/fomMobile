import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AUTH_CONFIG } from './AuthConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tokenResponse, setTokenResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredToken();
  }, []);

  const loadStoredToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('tokenResponse');
      if (storedToken) {
        const token = JSON.parse(storedToken);
        if (token.expiresAt && token.expiresAt > Date.now()) {
          setTokenResponse(token);
        } else if (token.refresh_token) {
          await refreshToken(token.refresh_token);
        }
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (refresh_token) => {
    try {
      const response = await fetch(AUTH_CONFIG.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: AUTH_CONFIG.CLIENT_ID,
          refresh_token: refresh_token,
        }).toString(),
      });

      const tokenData = await response.json();
      
      if (!response.ok) {
        throw new Error(tokenData.error || 'Failed to refresh token');
      }

      const newToken = {
        ...tokenData,
        expiresAt: Date.now() + (tokenData.expires_in * 1000)
      };

      await SecureStore.setItemAsync('tokenResponse', JSON.stringify(newToken));
      setTokenResponse(newToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
    }
  };

  useEffect(() => {
    if (tokenResponse) {
      SecureStore.setItemAsync('tokenResponse', JSON.stringify(tokenResponse));
    }
  }, [tokenResponse]);

  useEffect(() => {
    let refreshTimer;
    if (tokenResponse?.expiresAt) {
      const timeUntilRefresh = tokenResponse.expiresAt - Date.now() - (5 * 60 * 1000); // Refresh 5 minutes before expiry
      if (timeUntilRefresh > 0 && tokenResponse.refresh_token) {
        refreshTimer = setTimeout(() => refreshToken(tokenResponse.refresh_token), timeUntilRefresh);
      }
    }
    return () => refreshTimer && clearTimeout(refreshTimer);
  }, [tokenResponse]);

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('tokenResponse');
      setTokenResponse(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      tokenResponse,
      setTokenResponse,
      logout,
      isLoggedIn: !!tokenResponse
    }}>
      {children}
    </AuthContext.Provider>
  );
};
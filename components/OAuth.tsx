import React, { useState, useContext } from 'react';
import { View, Button, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { AuthContext } from './AuthContext';
import { AUTH_CONFIG } from './AuthConfig';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

const OAuthWebView = () => {
  const { setTokenResponse } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: AUTH_CONFIG.CLIENT_ID,
      redirect_uri: AUTH_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: AUTH_CONFIG.SCOPES
    });
    return `${AUTH_CONFIG.AUTHORIZATION_ENDPOINT}?${params.toString()}`;
  };

  const exchangeCodeForToken = async (code) => {
    setLoading(true);
    try {
      const tokenResponse = await fetch(AUTH_CONFIG.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: AUTH_CONFIG.CLIENT_ID,
          code: code,
          redirect_uri: AUTH_CONFIG.REDIRECT_URI,
        }).toString(),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || 'Failed to exchange code for token');
      }

      const tokenWithExpiry = {
        ...tokenData,
        expiresAt: Date.now() + (tokenData.expires_in * 1000)
      };

      setTokenResponse(tokenWithExpiry);
    } catch (error) {
      console.error('Token exchange error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState) => {
    if (navState.url.startsWith(AUTH_CONFIG.REDIRECT_URI)) {
      const url = new URL(navState.url);
      const code = url.searchParams.get('code');
      if (code) {
        setModalVisible(false);
        exchangeCodeForToken(code);
      } else {
        const error = url.searchParams.get('error');
        console.error('Authorization error:', error);
        setModalVisible(false);
      }
      return false;
    }
    return true;
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView style={[styles.container]}>

    <View style={styles.container}>
      <Button 
        title="Login mit OAuth2" 
        onPress={() => setModalVisible(true)}
        disabled={loading}
      />
      
      {loading && (
        <ActivityIndicator 
          size="large" 
          color="#0000ff" 
          style={styles.loading} 
        />
      )}
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Button 
            title="Schließen" 
            onPress={() => setModalVisible(false)} 
          />

          <WebView
            source={{ uri: getAuthUrl() }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <ActivityIndicator 
                size="large" 
                color="#0000ff" 
                style={styles.webViewLoading} 
              />
            )}
            incognito={true}
          />
          
        </View>
      </Modal>
    </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    marginTop: 40,
  },
  loading: {
    marginTop: 20,
  },
  webViewLoading: {
    flex: 1,
  },
});

export default OAuthWebView;
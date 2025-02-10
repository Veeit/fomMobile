import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '@/components/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function WebViewTab() {
  const { tokenResponse } = useContext(AuthContext);
  const webViewRef = useRef(null);
  const navigation = useNavigation();

  // Set native navigation options
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackTitle: 'Back',
      headerTitle: 'Online Campus',
      headerLargeTitle: true,
      headerTransparent: true,
    });
  }, [navigation]);

  // Extract resource from token response and create storage key
  const resource = tokenResponse?.profile?.appid || 'd5e45e36-8497-4bf7-a033-9a303bd9b062';
  const storageKey = `oidc.user:https://adfs.fom-net.de/adfs:${resource}`;
const cssInjection = `
  const styleSheet = \`
    .cards {
    grid-template-columns: repeat(1, minmax(340px, 1fr)) !important;
}
  \`;

  if (!document.getElementById('mobile-styles')) {
    const styleNode = document.createElement('style');
    styleNode.id = 'mobile-styles';
    styleNode.type = 'text/css';
    const styleText = document.createTextNode(styleSheet);
    styleNode.appendChild(styleText);
    document.getElementsByTagName('head')[0].appendChild(styleNode);
  }
  true;
`;

  const storageValue = {
    id_token: tokenResponse?.id_token,
    session_state: null,
    access_token: tokenResponse?.access_token,
    refresh_token: tokenResponse?.refresh_token,
    token_type: 'bearer',
    scope: 'openid',
    profile: tokenResponse?.profile || {
      aud: tokenResponse?.profile?.aud,
      iss: 'https://adfs.fom-net.de/adfs',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: tokenResponse?.profile?.sub,
      upn: tokenResponse?.profile?.upn,
      unique_name: tokenResponse?.profile?.unique_name,
      pwd_url: "https://adfs.fom-net.de/adfs/portal/updatepassword/",
      sid: "",
      PersonenID: tokenResponse?.profile?.PersonenID,
      apptype: 'Public',
      appid: 'd5e45e36-8497-4bf7-a033-9a303bd9b062',
      authmethod: tokenResponse?.profile?.authmethod,
      ver: '1.0',
      scp: 'openid'
    },
    expires_at: Math.floor(Date.now() / 1000) + 3600
  };

  const injectSessionStorage = `
    try {
      window.sessionStorage.setItem(
        '${storageKey}',
        '${JSON.stringify(storageValue)}'
      );
      
      console.log('Session storage set successfully');
    } catch (error) {
      console.error('Error setting session storage:', error);
    }
  `;

  console.log('Injecting session storage with:', storageValue);
  console.log('Injecting session storage key:', storageKey);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://oc-digital.de' }}
        injectedJavaScriptBeforeContentLoaded={injectSessionStorage}
        injectedJavaScript={injectSessionStorage}
        onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView error:', nativeEvent);
          }}
          onLoadEnd={() => {
            webViewRef.current?.injectJavaScript(cssInjection);
          }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: Platform.OS === 'ios' ? 100 : 80,
    },
  });
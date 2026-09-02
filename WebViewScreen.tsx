import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import React, { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from 'expo-location';
import { initializeCache } from './cache-adapter';

const whiteList = [
  "https://giessdeinviertel.codeforleipzig.de",
  "https://leipziggiesst-login.codeforleipzig.de",
  "https://www.giessdenkiez.de",
];

export const getGeoLocationJS = () => {
  const geoLocCode = require('./assets/GeoLocation.js')
  return `
    (function() {
      ${geoLocCode}
    })();
  `;
};

const WebViewScreen = () => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const cacheRef = useRef(null);

  useEffect(() => {
    const setupCache = async () => {
      cacheRef.current = await initializeCache();
      await cacheRef.current.init();
    };
    setupCache();
  }, []);

  const handleWebViewMessage = async (event) => {
    const { type, key, value } = JSON.parse(event.nativeEvent.data);
    const cache = cacheRef.current;

    try {
      switch (type) {
        case 'GET_CACHE':
          const data = await cache.getItem(key);
          webViewRef.current?.injectJavaScript(`
            window.__cacheResponse = ${JSON.stringify(data)};
            window.__cacheReady = true;
          `);
          break;
        
        case 'SET_CACHE':
          await cache.setItem(key, value);
          webViewRef.current?.injectJavaScript(`
            window.__cacheSaved = true;
          `);
          break;
        
        case 'REMOVE_CACHE':
          await cache.removeItem(key);
          break;
        
        case 'CLEAR_CACHE':
          await cache.clear();
          break;
      }
    } catch (error) {
      console.error('Cache operation failed:', error);
    }
  };

  return (
    <WebView
      geolocationEnabled={ true }
      injectedJavaScript={ getGeoLocationJS() }
      javaScriptEnabled={ true }
      onMessage={ event => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          const eventTypes = [
            {
              event: 'getCurrentPosition',
              fun: Location.getCurrentPositionAsync,
              successCode: 'currentPosition',
              errorCode: 'currentPositionError'
            },
            {
              event: 'watchPosition',
              fun: Location.watchPositionAsync, 
              successCode: 'watchPosition',
              errorCode: 'watchPositionError'
            },
            {
              event: 'clearWatch',
              fun: Location.stopLocationUpdatesAsync,
              input: (param: { taskName: string }) => param.taskName
            },
          ]
          const postMessage = (msg: {}) => {
            webview.postMessage(JSON.stringify(msg));
          }
          const eventType = eventTypes.find(eventType => data?.event && data.event == eventType.event);
          if (eventType) {
            if (eventType.successCode) {
              eventType.fun(
                input => postMessage({ event: eventType.successCode, data: input }),
                error => postMessage({ event: eventType.errorCode, data: error })
              );
            } else if (eventType.input) {
              eventType.fun(eventType.input(data));
            }
          }    
        } catch (e) {
          console.log(e);
        }
      }}
      ref={webViewRef}
      startInLoadingState={ true } 
      style={[styles.webView, { marginTop: insets.top }]}
      source={{ uri: "https://giessdeinviertel.codeforleipzig.de" }}
      originWhitelist={whiteList}
      allowsBackForwardNavigationGestures
      sharedCookiesEnabled
    />
  );
};

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});

export default WebViewScreen;

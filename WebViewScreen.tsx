import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import React, { useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from 'expo-location';


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
  const webViewRef = useRef<WebView>(null);
  const locationSubscriptions = new Map<number, Location.LocationSubscription>();
  let nextWatchId = 1;
  const insets = useSafeAreaInsets();

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.event) {
        case 'getCurrentPosition': {
          try {
            const location = await Location.getCurrentPositionAsync({});

            postMessage({
              event: 'currentPosition',
              data: location,
            });
          } catch (error) {
            postMessage({
              event: 'currentPositionError',
              data: error,
            });
          }
          break;
        }
        case 'watchPosition': {
          const watchId = nextWatchId++;
          try {
            const subscription = await Location.watchPositionAsync(
              {},
              location => {
                postMessage({
                  event: 'watchPosition',
                  watchId,
                  data: location,
                });
              },
              error => {
                postMessage({
                  event: 'watchPositionError',
                  watchId,
                  data: error,
                });
              }
            );
            locationSubscriptions.set(watchId, subscription);
            postMessage({
              event: 'watchPositionStarted',
              watchId,
            });
          } catch (error) {
            postMessage({
              event: 'watchPositionError',
              watchId,
              data: error,
            });
          }
          break;
        }
        case 'clearWatch': {
          const subscription = locationSubscriptions.get(data.watchId);
          if (subscription) {
            subscription.remove();
            locationSubscriptions.delete(data.watchId);
          }
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      geolocationEnabled={ true }
      injectedJavaScript={ getGeoLocationJS() }
      javaScriptEnabled={ true }
      onMessage={handleMessage}
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

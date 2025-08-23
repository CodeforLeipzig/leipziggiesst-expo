import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import React from "react";
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
  const insets = useSafeAreaInsets();

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
      ref={ ref => {
        webview = ref;
      }}
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

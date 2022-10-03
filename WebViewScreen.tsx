import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const whiteList = [
  "https://giessdeinviertel.codeforleipzig.de",
  "https://leipziggiesst-login.codeforleipzig.de",
];

const WebViewScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <WebView
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

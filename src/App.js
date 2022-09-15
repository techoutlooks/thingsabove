import React, { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { Provider, useSelector, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import styled, { ThemeProvider } from "styled-components/native";
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {LoadAssets} from "@/components";

// import './lib/poly'

import DrawerNavigator from "@/navigation/DrawerNavigator";
import NotificationHandler from "./NotificationHandler";
import { getAuthState } from "./state/auth";
import { store, persistor } from "./state/configureStore";
import { selectTheme } from "./state/settings";


const assets = []

const fonts = {
  "SFProDisplay-Bold": require("../assets/fonts/SF-Pro-Display-Bold.otf"),
  "SFProDisplay-Semibold": require("../assets/fonts/SF-Pro-Display-Semibold.otf"),
  "SFProDisplay-Medium": require("../assets/fonts/SF-Pro-Display-Medium.otf"),
  "SFProDisplay-Regular": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
};


const themeMap = {
  light: require(`./components/uiStyle/styles/light`).theme,
  dark: require(`./components/uiStyle/styles/dark`).theme,
};

const Main = () => {
  const auth = useSelector(getAuthState);
  const dispatch = useDispatch();

  const themeKey = useSelector(selectTheme);
  const theme = themeMap[themeKey];

  return (
    <ThemeProvider theme={theme}>
      <LoadAssets {...{fonts, assets}}>
        <NotificationHandler />
        {Platform.OS === "android" && <AndroidStatusBarHeight />}
        <SafeArea behavior="padding" enabled>
          <AppBackground>
            <DrawerNavigator />
          </AppBackground>
        </SafeArea>
      </LoadAssets>
    </ThemeProvider>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Main />
      </PersistGate>
    </Provider>
  );
};

export default App;

const AppFrame = styled.View`
  background-color: #000;
  flex: 1;
`;

const AppBackground = styled(GestureHandlerRootView)`
  background-color: ${(p) => p.theme.colors.appBg};
  flex: 1;
  justify-content: center;
  border-radius: 15px;
  overflow: hidden;
`;

// const SafeArea = styled.KeyboardAvoidingView`
const SafeArea = styled.View`
  flex: 1;
`;

const AndroidStatusBarHeight = styled.View`
  height: ${StatusBar.currentHeight}px;
`;

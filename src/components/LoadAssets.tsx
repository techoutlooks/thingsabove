import React, { ReactElement, useCallback, useEffect, useState } from "react";
import styled from "styled-components/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { InitialState, NavigationContainer } from "@react-navigation/native";
import Constants from "expo-constants";
import * as SplashScreen from 'expo-splash-screen';


const NAVIGATION_STATE_KEY = `NAVIGATION_STATE_KEY-${Constants.manifest.sdkVersion}`;


export type FontSource = Parameters<typeof Font.loadAsync>[0];
const usePromiseAll = (promises: Promise<void | void[]>[], cb: () => void) =>
  useEffect(() => {
    (async () => {
      await Promise.all(promises);
      cb();
    })();
  });


const useLoadAssets = (assets: number[], fonts: FontSource): boolean => {
    const [ready, setReady] = useState(false);
    usePromiseAll([
        Font.loadAsync(fonts), ...assets.map((asset) => Asset.loadAsync(asset))
    ], () => setReady(true))
    return ready;
}

type LoadAssetsProps = {
  fonts?: FontSource;
  assets?: number[];
  children: ReactElement | ReactElement[]; }

/*** 
 * <LoadAssets/>
 * - loads assets
 * - restores nav state from storage in DEV mode. 
 *   nav state changes are always saved to storage
 */
const LoadAssets = ({ assets, fonts, children }: LoadAssetsProps) => {

    // Assets
    // ==========================
    const ready = useLoadAssets(assets || [], fonts || {});

    // Nav
    // ==========================
    // !setIsNavigationReady (DEV) => restore nav state from storage 
    const [navReady, setNavReady] = useState(true) //useState(!__DEV__);
    const [initialState, setInitialState] = useState<InitialState | undefined>();
    useEffect(() => {
        const restoreState = async () => {
            try {
                const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
                const state = savedStateString ? JSON.parse(savedStateString) : undefined;
                setInitialState(state)
            } finally {
                setNavReady(true)
            }
        }
        if (!navReady) {
            restoreState();
        }
    }, [navReady])

    const onStateChange = useCallback((state) =>
        AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state)),
    [])
    
    // Splash 
    // ==========================
    // Keep the splash screen visible while we fetch resources
    useEffect(() => {
    (async () => SplashScreen.preventAutoHideAsync())() }, [])
    const onReady = useCallback(async () => {
        if (ready && navReady) {
          await SplashScreen.hideAsync() }
      }, [ready, navReady]);


    if (!ready || !navReady) {
        return null }
    return (
        <NavigationContainer {...{ onStateChange, initialState, onReady }}>
            {children}
        </NavigationContainer>
    )
};




export default LoadAssets;

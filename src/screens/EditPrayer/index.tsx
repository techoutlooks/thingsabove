import * as React from 'react';

import {createNativeStackNavigator} from "@react-navigation/native-stack";
import PrayNowOne from './PrayNowOneScreen';
import PrayNowTwo from './PrayNowTwoScreen';
import { ScreensContextProvider } from './PrayerContext';

const Stack = createNativeStackNavigator();


/***
 * Create or Edit a prayer i successive screens
 */
export default () => {

  return (
    <ScreensContextProvider>
      <Stack.Navigator screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="PrayNowOne" component={PrayNowOne} />
        <Stack.Screen name="PrayNowTwo" component={PrayNowTwo} 
            options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </ScreensContextProvider>
  )
}


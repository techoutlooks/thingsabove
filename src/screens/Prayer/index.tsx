import * as React from 'react';

import {createNativeStackNavigator} from "@react-navigation/native-stack";
import RecordScreen from './RecordScreen';
import EditInfoScreen from './EditInfoScreen';
import PreviewScreen from './PreviewScreen';
import { ScreensContextProvider } from './PrayerContext';

const Stack = createNativeStackNavigator();


/***
 * Create or Edit a prayer i successive screens
 * // options={{ presentation: 'modal' }} />
 */
export default () => {

  return (
    <ScreensContextProvider>
      <Stack.Navigator screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="Record" component={RecordScreen} />
        <Stack.Screen name="EditInfo" component={EditInfoScreen} /> 
        <Stack.Screen name="Preview" component={PreviewScreen} />
      </Stack.Navigator>
    </ScreensContextProvider>
  )
}


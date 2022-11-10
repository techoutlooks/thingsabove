import * as React from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import MySharingsScreen from './MySharingsScreen';
import MyPrayersScreen from './MyPrayersScreen';
import IndexScreen from './IndexScreen';



const Stack = createNativeStackNavigator();
export default () => (
  <Stack.Navigator screenOptions={{
    headerShown: false
  }}>
    <Stack.Screen name="Index" component={IndexScreen} />
    <Stack.Screen name="MySharings" component={MySharingsScreen} />
    <Stack.Screen name="MyPrayers" component={MyPrayersScreen} /> 
  </Stack.Navigator>
)


export { MyPrayersScreen, MySharingsScreen, IndexScreen }




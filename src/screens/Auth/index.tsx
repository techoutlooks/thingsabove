import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import { useAuthSessionListener } from '@/hooks';
import {IntroScreen as OnboardingScreen} from './Onboarding';
import AuthScreen from "./AuthScreen"
import AuthProfileScreen from "./AuthProfileScreen"


const Stack = createNativeStackNavigator();

const AuthStack = () => {

  const session = useAuthSessionListener()

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      { !!!session?.user ? (<>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="DoAuth" component={AuthScreen} />
      </>): (<>
        <Stack.Screen name="AuthProfile" component={AuthProfileScreen} />
      </>)}
    </Stack.Navigator>
  );
};

export default AuthStack;
export { AuthScreen, AuthProfileScreen }

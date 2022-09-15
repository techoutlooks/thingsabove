import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Easing} from 'react-native'

import {useAuthSessionListener} from '@/hooks'

import {default as WelcomeStack} from '@/screens/Welcome';
import {AuthScreen, AuthProfileScreen} from '@/screens/Auth'

import {default as TeamsStack} from '@/screens/Team';
import {default as PrayNowStack} from '@/screens/EditPrayer';


// import SyncScreen from '@/screens/sync'


const Stack = createNativeStackNavigator();

const getScreens = () => {

  const session = useAuthSessionListener()
  // const isSyncing = useSelector(selectIsSyncing)

  // if (isSyncing) {
  //     return <Stack.Screen name="SyncProgress" component={SyncScreen}/>
  // }

  return !!session?.user ? (
    <>
      <Stack.Screen name="Welcome" component={WelcomeStack} />
      <Stack.Screen name="Teams" component={TeamsStack} />
      <Stack.Screen name="PrayNow" component={PrayNowStack} />
    </>
  ) : (
    <Stack.Screen name="Auth" component={AuthScreen}/>
  ) 
}

const Navigator = () => {
  const screens = getScreens()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardStyleInterpolator,
        transitionSpec: {
          open: transitionConfigIn,
          close: transitionConfigOut,
        },
      }}
    >
      {screens}
    </Stack.Navigator>
  )
}

export default Navigator


const transitionConfigIn = {
  animation: 'timing',
  config: {
    duration: 350,
    easing: Easing.out(Easing.poly(5)),
  },
}

const transitionConfigOut = {
  animation: 'timing',
  config: {
    duration: 200,
    easing: Easing.in(Easing.linear),
  },
}

const cardStyleInterpolator = ({current, next, layouts}) => {
  return {
    cardStyle: {
        opacity: current.progress,
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width / 2, 0],
            }),
          },
        ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  }
}

import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from "styled-components/native";
import {CustomDrawer2, CustomDrawer} from "@/components"

import AuthStack, { AuthScreen } from '@/screens/Auth'
import {MyPrayersScreen} from '@/screens/My'

import BottomNavigator from "./BottomNavigator"
import { useIsAuthed } from '@/hooks';

const Drawer = createDrawerNavigator()


export default () => {
  const theme = useTheme()
  const isAuthed = useIsAuthed() 

  console.log(`\n ???????? Drawer isAuthed=`, isAuthed)

  return (
    <Drawer.Navigator
      // defaultStatus="open"
      initialRouteName="Home"
      drawerContent={ props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.colors.primaryButtonBg
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerLabel: 'Home',
          groupName: 'Section 2',
          activeTintColor: '#e91e63',
        }}
        component={BottomNavigator}
      />
      { isAuthed && (
        <Drawer.Screen
          name="MyPrayers"
          component={MyPrayersScreen}
          options={{
            drawerLabel: 'My Prayers',
            groupName: 'My',
            activeTintColor: '#e91e63',
          }}
        />
      )}
      { !isAuthed && (
        <Drawer.Screen
          name="DoAuth"
          component={AuthScreen}
          options={{
            drawerLabel: 'Sign In',
            groupName: 'My',
            activeTintColor: '#e91e63',
          }}
        />
      )}
      <Drawer.Screen
        name="Auth"
        component={AuthStack}
        options={{
          drawerLabel: isAuthed ? "My Profile" : "Begin",
          groupName: 'Auth',
          activeTintColor: '#e91e63',
        }}
      />

    </Drawer.Navigator>
  )
}
import React from 'react'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { useTheme } from "styled-components/native";

import {CustomSidebarMenu} from "@/components"

import {AuthScreen, AuthProfileScreen} from '@/screens/Auth'
import {MyPrayersScreen} from '@/screens/My'

import BottomNavigator from "./BottomNavigator"

const Drawer = createDrawerNavigator()

export default () => {
  const theme = useTheme()

  return (
    <Drawer.Navigator
      // defaultStatus="open"
      initialRouteName="Home"
      // drawerContent={ props => <CustomSidebarMenu {...props} />}
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
      <Drawer.Screen
        name="MyPrayers"
        options={{
          drawerLabel: 'My Prayers',
          groupName: 'My',
          activeTintColor: '#e91e63',
        }}
        component={MyPrayersScreen}
      />
      <Drawer.Screen
        name="Auth"
        options={{
          drawerLabel: 'Sign In',
          groupName: 'Auth',
          activeTintColor: '#e91e63',
        }}
        component={AuthScreen}
      />
      <Drawer.Screen
        name="AuthProfile"
        options={{
          drawerLabel: 'Profile',
          groupName: 'Auth',
          activeTintColor: '#e91e63',
        }}
        component={AuthProfileScreen}
      />
    </Drawer.Navigator>
  )
}
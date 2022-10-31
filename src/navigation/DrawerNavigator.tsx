import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from "styled-components/native";
import { AntDesign } from '@expo/vector-icons';
import { Image } from "react-native"

import { useIsAuthed } from '@/hooks';
import {CustomDrawer2, CustomDrawer} from "@/components"
import AuthStack, { AuthScreen } from '@/screens/Auth'
import {MyPrayersScreen} from '@/screens/My'

import BottomNavigator from "./BottomNavigator"
import * as appImages from '../../assets';


const Drawer = createDrawerNavigator()


export default () => {
  const theme = useTheme()
  const isAuthed = useIsAuthed() 

  return (
    <Drawer.Navigator
      // defaultStatus="open"
      initialRouteName="Home"
      drawerContent={ props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.colors.primaryButtonBg, 
        drawerLabelStyle: { fontFamily: 'SFProDisplay-Medium', fontSize: 16, lineHeight: 16  },
        drawerStyle: {
          // backgroundColor: '#c6cbef',
          // width: 240,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        options={{
          groupName: 'Section 2',
          activeTintColor: '#e91e63',
          drawerLabel: 'Home',
          drawerIcon: ({ tintColor }) => (
            <Image source={appImages.branding.icon} resizeMode='cover'
              style={[{ width: 45, height: 40, margin: -10 }, { tintColor: tintColor }]}
            />
          ),
        }}
        component={BottomNavigator}
      />
      { isAuthed && (
        <Drawer.Screen
          name="MyPrayers"
          component={MyPrayersScreen}
          options={{
            groupName: 'My',
            activeTintColor: '#e91e63',
            drawerLabel: 'My Prayers',
            drawerIcon: ({focused, size, color}) => (
              <AntDesign name="profile" size={size} color={focused ? '#e91e63' : color} />
            )
          }}
        />
      )}
      { !isAuthed && (
        <Drawer.Screen
          name="DoAuth"
          component={AuthScreen}
          options={{
            groupName: 'My',
            activeTintColor: '#e91e63',
            drawerLabel: 'Sign In',
            drawerIcon: ({focused, size, color}) => (
              <AntDesign name="login" size={size} color={focused ? '#e91e63' : color} />
            )
          }}
        />
      )}
      <Drawer.Screen
        name="Auth"
        component={AuthStack}
        options={{
          groupName: 'Auth',
          activeTintColor: '#e91e63',
          drawerLabel: isAuthed ? "My Profile" : "Begin",
          drawerIcon: ({focused, size, color}) => (
            <AntDesign name="unlock" size={size} color={focused ? '#e91e63' : color} />
          )
        }}
      />

    </Drawer.Navigator>
  )
}
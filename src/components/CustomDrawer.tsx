import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native"
import { View, Text, ImageBackground, Image, TouchableOpacity, ViewStyle, TouchableOpacityProps } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import styled, {useTheme} from "styled-components/native";
import { Ionicons } from '@expo/vector-icons'; 
import { FontAwesome5 } from '@expo/vector-icons';

import {UserProfile} from "@/lib/supabase"
import { checkForUpdates } from '@/lib/expo'
import { countPrayersByUserId } from '@/state/prayers';
import { useIsAuthed, useAuthProfile } from '@/hooks';
import { signOut } from "@/state/auth"
import * as appImages from '../../assets';
import { RADIUS, Spacer } from './uiStyle/atoms';
import Avatar from './Avatar';




export default (props) => {

  const navigation = useNavigation()
  const dispatch = useDispatch()
  const isAuthed = useIsAuthed() 
  const {profile} = useAuthProfile()

  const logOut = () => {
    dispatch(signOut)
    navigation.navigate('Auth')
  }

  const updateApp = () => { checkForUpdates(true) }

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#8200d6'}}
      >
        <ImageBackground
          source={appImages.drawer.drawer_bg}
          style={{padding: 20}}
        >
          {isAuthed ? (<ProfileImage {...{profile}} />) : (<DefaultHeader />)}
        </ImageBackground>
        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 10}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        {isAuthed && (
          <ActionButton label="Sign Out" icon="exit-outline" onPress={logOut} /> 
        )}
        <ActionButton label="Tell A Friend" icon="share-social-outline"  /> 
        <ActionButton label="Check Updates" icon="md-code-download-outline" onPress={updateApp} />      
      </View>
    </View>
  );
};


const ProfileImage = styled(({profile, style}
  : {profile: UserProfile, style: ViewStyle}) => {

  const navigation = useNavigation()
  const myPrayersCount = useSelector(countPrayersByUserId(profile?.id))

  return (
    <View {...{style}}>
      <Avatar 
        path={profile?.avatar_url} size={80} style={{borderRadius: 40, marginBottom: 10}}
        onPress={() => navigation.navigate("AuthProfile")}
      />
      <Spacer height={16} />
      <Text
        style={{
          color: '#fff',
          fontSize: 18,
          fontFamily: 'SFProDisplay-Medium',
          marginBottom: 5,
        }}>
        {`Hi, ${profile?.first_name ?? profile?.username ?? 'warrior !'}`}
      </Text>
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            color: '#fff',
            fontFamily: 'SFProDisplay-Regular',
            marginRight: 5,
          }}>
          <Text style={{fontWeight: 'bold', fontSize: 18}}>
            {myPrayersCount?? 0}</Text> prayers
        </Text>
        <FontAwesome5 name="praying-hands" size={24} color="#fff" />
      </View>
    </View>

)})``



const ActionButton = styled(({label: children, icon, onPress, style}: 
  Omit<TouchableOpacityProps, 'children'> & { label: string, icon: string }) => (

    <TouchableOpacity {...{onPress}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Ionicons name={icon} size={22} />
        <Text onPress={onPress}
          style={{
            fontFamily: 'SFProDisplay-Medium', fontSize: 15,
            marginLeft: 5,
          }}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
))`
  padding-vertical: 15px
`

const DefaultHeader = styled(() => (
  <>
    <Image source={appImages.branding.logo2} resizeMode='cover' 
       style={{borderRadius: RADIUS, marginBottom: 10, width: 225, height: 200 }} 
    />
  </>
))``



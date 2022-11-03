import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native"
import { View, ImageBackground, Image, TouchableOpacity, ViewStyle, TouchableOpacityProps } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import styled, {useTheme} from "styled-components/native";
import { Ionicons } from '@expo/vector-icons'; 

import {UserProfile} from "@/lib/supabase"
import { checkForUpdates } from '@/lib/expo'
import { countPrayersByUserId } from '@/state/prayers';
import { useIsAuthed, useAuthProfile } from '@/hooks';
import { signOut } from "@/state/auth"
import * as appImages from '../../assets';
import { RADIUS, Spacer, Text, Row } from './uiStyle/atoms';
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
    <Container>
      <DrawerContentScrollView {...props}
        contentContainerStyle={{backgroundColor: '#8200d6'}}
      >
        <ImageBackground
          source={appImages.drawer.drawer_bg} style={{padding: 20}}
        >
          {isAuthed ? (<ProfileImage {...{profile}} />) : (<DefaultHeader />)}
        </ImageBackground>

        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 18 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        {isAuthed && (<Button label="Sign Out" icon="exit-outline" onPress={logOut} />)}
        <Button label="Tell A Friend" icon="share-social-outline"  /> 
        <Button label="Check Updates" icon="md-code-download-outline" onPress={updateApp} />      
      </View>
    </Container>
  );
};


const ProfileImage = styled(({profile, style}
  : {profile: UserProfile, style: ViewStyle}) => {

  const navigation = useNavigation()
  const myPrayersCount = useSelector(countPrayersByUserId(profile?.id))

  return (
    <View {...{style}}>
      <Greetings {...{profile}} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'} }>
          <LogoIcon />
          <Spacer width={12} />
          <View>
            <Info>Prayers  ({myPrayersCount?? 0})</Info> 
            <Info>Teams    ({myPrayersCount?? 0})</Info> 
          </View>
        </View>
        <ProfilePicture path={profile?.avatar_url} 
          onPress={() => navigation.navigate("Auth", { screen: "AuthProfile"})}
        />
      </View>
    </View>

)})``

const Greetings = styled.Text.attrs(({ profile }) => ({
  children: `Hi, ${profile?.first_name ?? profile?.username ?? 'warrior !'}`,
}))`
  color: ${p => p.theme.colors.primaryButtonFg}; 
  font-size: 18px; font-family: SFProDisplay-Medium; line-height: 32px;
`
const ProfilePicture = styled(Avatar).attrs({ size: 80 })`
  border: 1px solid ${p => p.theme.colors.primaryButtonFg}; 
  border-radius: ${p => p.size/2}px;
`
const LogoIcon = styled.Image.attrs({
  resizeMode: 'cover',
  source: appImages.branding.icon_white, 
})`
  width: 45px; height: 55px; 
  border-width: 1px;  
  border-color: ${p => p.theme.colors.primaryButtonFg}; 
  border-radius: ${RADIUS}px;
`
const Info = styled(Text)`
  color: ${p => p.theme.colors.primaryButtonFg }
  font-size: 14px;
`

const Button = styled(({label: children, icon, onPress, style}: 
  Omit<TouchableOpacityProps, 'children'> & { label: string, icon: string }) => (

    <TouchableOpacity {...{style, onPress}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Ionicons name={icon} size={22} />
        <Text onPress={onPress} style={{ 
          fontFamily: 'SFProDisplay-Medium', fontSize: 15,marginLeft: 5, 
        }}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
))`
  padding-vertical: 8px;
`

const DefaultHeader = styled(() => (
  <>
    <Image source={appImages.branding.logo2} resizeMode='cover' 
       style={{borderRadius: RADIUS, marginBottom: 10, width: 225, height: 200 }} 
    />
  </>
))``


const Container = styled.View`
  flex: 1;
`
import React, {useEffect, useRef, useState, useMemo} from 'react';
import {View, Text, Pressable, ViewStyle} from 'react-native';
import {useNavigation} from "@react-navigation/native"
import styled, {useTheme} from 'styled-components/native'

import Prayer from "@/types/Prayer"
import { Image } from "@/lib/supabase"

import {WIDTH, RADIUS, Spacer
} from '@/components/uiStyle/atoms'


type Props = {
  prayer: Prayer, style?: ViewStyle} 

export default ({prayer}: Props) => {
  const navigation = useNavigation()
  const theme = useTheme()
  

  return (
    <Container>
      <Pressable 
        onPress={ () => navigation.navigate('TeamPrayers', {teamId: team.id})}
        style={{
          flexDirection: 'row', overflow: 'hidden', height: '100%',
          backgroundColor: 'white', borderRadius: 5,
        }}
      >
        <Image 
          path={`avatars/${prayer.picture_urls?.[0]}`} 
          style={{
            aspectRatio: 1, resizeMode: 'contain', 
            backgroundColor: theme.colors.cardBg,
            borderWidth: 1, borderColor: theme.colors.mutedFg, borderRadius: 5,
          }}
        />
        <View style={{padding: 10, flex: 1, justifyContent: 'center'}}>
          <Text numberOfLines={1} style={{ fontWeight: 'bold' }} > 
            {prayer.title} 
          </Text>
          {/* <Spacer height={8} /> */}
          <Text numberOfLines={2} style={{ color: theme.colors.muted }}>
            {prayer.description}
          </Text>
          <Text style={{ color: theme.colors.inputFg, fontWeight: 'bold' }}>
            audios ({prayer.audio_urls?.length})
          </Text>
        </View>
      </Pressable>
    </Container>
  )
}
  
  
  const Container = styled.View`
    width: ${WIDTH-120}px;
    height: 90px;
    padding: 5px;
    
    // https://ethercreative.github.io/react-native-shadow-generator/
    // shadowColor: #000;
    // shadow-offset: 0px 3px;
    // shadowOpacity: 0.27;
    // shadowRadius: 4.65px;
    // elevation: 6;
  `
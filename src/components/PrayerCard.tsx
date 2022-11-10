import React, {memo} from 'react';
import {View, Pressable, ViewStyle, TextProps} from 'react-native';
import styled, {useTheme} from 'styled-components/native'
import { EvilIcons } from '@expo/vector-icons';
import  { format } from 'date-fns'


import {Prayer} from "@/types/models"
import { Image } from "@/lib/supabase"

import {WIDTH, useFmtTime, Text } from '@/components/uiStyle/atoms'
import { NextButton } from '@/components/uiStyle'


const CARD_HEIGHT = 95


type Props = {
  prayer: Prayer, onPress: () => void,
  hasNext?: boolean, onNext?: () => void,
  style?: ViewStyle 
} 

export default memo(({ prayer, hasNext, onPress, onNext, style }: Props) => {
  const theme = useTheme()
  const [duration] = useFmtTime(prayer.duration);

  return (
    <Container {...{style}}>
      <Pressable 
        onPress={onPress}
        style={{
          flexDirection: 'row',
          overflow: 'hidden', height: '100%', alignItems: 'center',
          backgroundColor: 'white',
        }}
      >
        <Image path={`avatars/${prayer.picture_urls?.[0]}`} 
          style={{
            height: '100%', width: CARD_HEIGHT,
            aspectRatio: 1, resizeMode: 'contain', 
            backgroundColor: theme.colors.cardBg,
            borderWidth: 1, borderColor: theme.colors.mutedFg, borderRadius: 5,
        }} />
        <Content>
          <View>
            <Title>{prayer.title}</Title>
            <Description>{prayer.description}</Description>
          </View>
          <Row>
            <Info>{format(new Date(prayer.updated_at), 'MM/dd/yyyy')}</Info> 
            <Info> audios ({prayer.audio_urls?.length}) </Info>
            <Duration value={duration} />
          </Row>
        </Content>
        { (typeof hasNext !== 'undefined') && (
          <NextButton {...{ hasNext, onNext }} /> )}
      </Pressable>
    </Container>
  )
})


const Info = styled(Text).attrs({numberOfLines: 1})`
  font-size: 12px;
  color: ${p => p.theme.colors.titleFg};
`
const Duration = styled(Info).attrs<{ value: string } & TextProps>(p => ({
  children: p.value || '00:00'
}))<{ value: string } & TextProps>`
  color: ${p => p.theme.colors.fg};
  font-size: 12px;
  font-family: SFProDisplay-Bold;
`
const Title = styled(Text).attrs({numberOfLines: 1})`
  font-family: SFProDisplay-Bold;
  font-size: 14px;
  color: ${p => p.theme.colors.titleFg};
`
const Description = styled(Text).attrs({numberOfLines: 2})`
  font-size: 13px;
`
const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const Content = styled.View`
  flex: 1;
  height: 100%;
  padding: 0px 15px;
  justify-content: space-between;
`
const Container = styled.View`
  width: ${WIDTH-12}px;
  height: ${CARD_HEIGHT}px;
`
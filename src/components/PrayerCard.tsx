import React, {memo} from 'react';
import {View, Pressable, ViewStyle, Text, TextProps} from 'react-native';
import { EvilIcons } from '@expo/vector-icons';
import  { format } from 'date-fns'


import styled, {useTheme} from 'styled-components/native'

import Prayer from "@/types/Prayer"
import { Image } from "@/lib/supabase"

import {WIDTH, RADIUS, Btn, useFmtTime } from '@/components/uiStyle/atoms'


type Props = {
  prayer: Prayer, onPress: () => void,
  hasNext?: boolean, onNext?: () => void,
  style?: ViewStyle 
} 

export default memo(({ prayer, hasNext, onPress, onNext }: Props) => {
  const theme = useTheme()
  const [duration] = useFmtTime(prayer.duration);

  return (
    <Container>
      <Pressable 
        onPress={onPress}
        style={{
          flexDirection: 'row',
          overflow: 'hidden', height: '100%', alignItems: 'center',
          backgroundColor: 'white',
        }}
      >
        <Image 
          path={`avatars/${prayer.picture_urls?.[0]}`} 
          style={{
            height: '100%',
            aspectRatio: 1, resizeMode: 'contain', 
            backgroundColor: theme.colors.cardBg,
            borderWidth: 1, borderColor: theme.colors.mutedFg, borderRadius: 5,
          }}
        />
        <View style={{padding: 15, flex: 1, justifyContent: 'center'}}>
          <Title>{prayer.title}</Title>
          <Description>{prayer.description}</Description>
          <Row>
            <Info>{format(new Date(prayer.updated_at), 'MM/dd/yyyy')}</Info> 
            <Info> audios ({prayer.audio_urls?.length}) </Info>
            <Duration value={duration} />
          </Row>
        </View>
        { (typeof hasNext !== 'undefined') && (
            <NextButton {...{ hasNext, onNext }} /> )}
      </Pressable>
    </Container>
  )
})

const NextButton = styled(Btn).attrs(({ hasNext, onNext, theme }) => ({
  disabled: !hasNext,
  onPress: onNext,
  icon: () => ( <EvilIcons {...{
    name: "arrow-right", size: 32, color: 
    hasNext ? theme.colors.fg : theme.colors.inputDisabledBg }} 
  />)
}))`
  color: ${p => p.hasNext ? p.theme.colors.fg : p.theme.colors.mutedFg};
  background-color: transparent;
`

const Info = styled.Text.attrs({numberOfLines: 1})`
  font-size: 13px;
  color: ${p => p.theme.colors.fg};
  line-height: 28px;
`
const Duration = styled(Info).attrs<{ value: string } & TextProps>(p => ({
  children: p.value || '00:00'
}))<{ value: string } & TextProps>`
  color: ${p => p.theme.colors.fg};
  font-size: 12px;
  font-weight: bold;
`
const Title = styled.Text.attrs({numberOfLines: 1})`
  font-weight: bold;
  font-size: 13px;
  color: ${p => p.theme.colors.titleFg};
`
const Description = styled.Text.attrs({numberOfLines: 2})`
  font-weight: bold;
  font-size: 13px;
  color: ${p => p.theme.colors.mutedFg};
`
const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const Container = styled.View`
  width: ${WIDTH-12}px;
  height: 95px;
`
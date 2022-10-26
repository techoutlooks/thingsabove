import React from "react"
import { ViewStyle } from "react-native"
import styled, { useTheme } from 'styled-components/native'
import { EvilIcons } from '@expo/vector-icons';
import {Btn} from '@/components/uiStyle/atoms'


type Props = {
  onPress: () => void,
  hasNext?: boolean, onNext?: () => void,
  style?: ViewStyle 
} 

export default styled(Btn).attrs<Props>(({ hasNext, onNext, style, ...p }) => ({
  style,
  disabled: !hasNext,
  onPress: onNext,
  icon: () => ( <EvilIcons {...{
    name: "arrow-right", size: 32, 
    color: hasNext ? p.theme.colors.fg : p.theme.colors.inputDisabledBg }} 
  />)

}))<Props>`
  color: ${p => p.hasNext ? p.theme.colors.fg : p.theme.colors.mutedFg};
  background-color: transparent;
`
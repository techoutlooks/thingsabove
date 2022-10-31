import React, {memo, useCallback} from "react";
import { Text, View, ViewStyle, ViewProps } from "react-native";
import { useNavigation } from '@react-navigation/native'
import styled, {useTheme} from "styled-components/native";
import { SimpleLineIcons, Feather } from '@expo/vector-icons';

import * as atoms from '@/components/uiStyle/atoms'
import {Team} from "@/types/Prayer";
import { DEFAULT_TEAM_ID } from '@env'


const DEFAULT_BUTTON_SIZE = 24

const Pray = styled(({team, style}: 
  {team: Team, style?: ViewStyle}) => {
    return (
      <View {...{style}}>
        <PostPrayer />
        <atoms.Spacer width={8} />
        <PrayNow {...{teamId: team?.id }} />
      </View>
    )
})`
  // width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

/***
 * Post Prayer from MyPrayers
 */
const PostPrayer = styled((props) => {

  const onPress = () => {
    navigation.navigate("Contact", {screen: "EditFriends"}) }
    

  return (<atoms.Btn {...props} />)
}).attrs({ label: "Send To Friend" })`
`


type Props = { teamId?: string,  label?: string, icon?: React.FC<any>,
  size?: number, color?: string, style?: ViewStyle}


/***
 * <PrayNow />
 * Redirects to RecordScreen from Prayer nav stack.
 * Fallback to default team if to team was provided to associate with prayer.
 */
const PrayNow = styled(({teamId, label, style, ...p}: Props) => {

  const navigation = useNavigation()
  const theme = useTheme()
  const size = p.size ?? DEFAULT_BUTTON_SIZE

  const color = p.color ?? theme.colors.fg 

  const onPress = useCallback(() => navigation.navigate("Prayer", {
    screen: "Record", params: { teamId: teamId ?? DEFAULT_TEAM_ID } }), [])

  const defaultIcon = () => (
    <SimpleLineIcons {...{ name: "microphone", size, color }} /> )
  const icon = p.icon ? () => p.icon({ size, color }) : defaultIcon

  return (
    <Container {...{style}}>
      <atoms.Btn {...{style, icon, onPress }} />
      { label && (<Label {...{ color, children: label }} />) }
    </Container>
  )
})`
  align-self: center;
`

const Label = styled(Text).attrs({ numberOfLines: 2 })`
  font-size: 14px;
  color: ${p => p.color}
`
const Container = styled.View`
  justify-content: center;
  align-items: center;
`



/* Animated PrayNowButton
================================================ */

const PulseAnim = styled(atoms.PulseAnim)`
  width: 40px;
  height: 50px;
  borderRadius: 20px;
  border-width: 10px;
  border-color: ${p => p.theme.colors.primaryButtonBg}
`

const PulseAnimation = styled(({style, children}: ViewProps) => (
  <View {...{style}}>
    <PulseAnim delay={0} duration={8000} />
    <PulseAnim delay={2000} duration={8000} />
    <PulseAnim delay={4000} duration={8000} />
    <PulseAnim delay={6000} duration={8000} />
    {children}
  </View>
))`
  align-items: center;
  justify-content: center;
`

type PrayNowPulseProps = { innerStyle: ViewStyle  } & Props;
const PrayNowPulse = styled(({style: containerStyle, innerStyle, ...p}: PrayNowPulseProps) => (
  <View {...{ style: containerStyle  }}>
    <PulseAnimation>
      <PrayNowButton {...{style: innerStyle, ...p}} />
    </PulseAnimation>
  </View>
)).attrs(p => ({ 
  size: 36, color: p.theme.colors.primaryButtonBg, 
  innerStyle: {backgroundColor: 'transparent' 
}}))``

const PrayButtonGroup = memo(Pray)
const PrayNowButton = memo(PrayNow)
const PrayNowPulseButton = memo(PrayNowPulse)

export { PrayNowButton, PrayNowPulseButton, PrayButtonGroup } 

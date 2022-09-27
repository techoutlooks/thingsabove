import {memo, useCallback} from "react";
import { View, ViewStyle } from "react-native";
import { useNavigation } from '@react-navigation/native'
import styled, {useTheme} from "styled-components/native";
import { SimpleLineIcons, Feather } from '@expo/vector-icons';

import { Button, Btn, Spacer } from "@/components/uiStyle/atoms";
import Prayer, {Team} from "@/types/Prayer";

import { DEFAULT_TEAM_ID } from '@env'



const Pray = styled(({team, style}: 
  {team: Team, style?: ViewStyle}) => {
    return (
      <View {...{style}}>
        <PostPrayer label="Post Prayer" />
        <Spacer width={8} />
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


const PostPrayer = styled(Btn)`
  background-color: transparent;
  border: ${p => p.theme.colors.fg} 1px;
`


type Props = { teamId?: string, style?: ViewStyle}


/***
 * <PrayNow />
 * Redirects to RecordScreen from Prayer nav stack.
 * Fallback to default team if to team was provided to associate with prayer.
 */
const PrayNow = styled(({teamId, style}: Props) => {

  const navigation = useNavigation()
  const theme = useTheme()
  const onPress = useCallback(() => navigation.navigate("Prayer", {
    screen: "Record", params: { teamId: teamId ?? DEFAULT_TEAM_ID } }), [])
  const icon = () => <SimpleLineIcons 
    name="microphone" size={36} color={theme.colors.fg} 
  />

  return (
    <Button {...{style, icon, onPress}} />
  )
})`
  background-color: transparent;
`

const PrayActionGroup = memo(Pray)
const PrayNowButton = memo(PrayNow)

export { PrayNowButton, PrayActionGroup } 

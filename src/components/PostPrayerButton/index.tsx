/***
 * PostPrayerButton
 * Opens up modals that let the user pick prayers and send them to selected friends.
 * Reveals the **SelectPrayersView* modal iff not supplied initially with prayers (props.prayers),
 * else opens up the **SharePrayerView** modal for picking friends to send the prayers to.
 */
import React, {memo, useCallback, useState, useMemo, ComponentProps} from "react";
import { View, ViewStyle, ViewProps } from "react-native";
import styled, {useTheme} from "styled-components/native";

import Modal from "../Modal"
import RecordPrayer from "../RecordPrayerButton"
import * as atoms from '../uiStyle/atoms'
import Prayer, {Team} from "@/types/Prayer";

// Views to display as modals
import SelectPrayerView from "./SelectPrayerView"
import SharePrayerView from "./SharePrayerView"


const BUTTON_HEIGHT = 45

type Props = { 
  prayers?: Prayer[],
  team?: Team, hasRecordPrayerButton?: boolean, 
  style?: ViewStyle
} & ComponentProps<typeof atoms.Btn>


/**
 * PrayNowButton : offers (2) scenarii:
 * a) Pick prayer(s) now from archive, then send to friends
 * b) Record a prayer now, then send to friends
 * @param team: Send prayer to team (has DEFAULT_TEAM_ID from env)
 * @param hasRecordPrayerButton: should embed a mic to record prayer? (default: false)
 */
 const PostPrayerButtonExtUnmemoized = 
 styled(({prayers, team, hasRecordPrayerButton, style}: Props) => {
    
    return (
      <View {...{style}}>
        <PostPrayerButtonUnmemoized {...{prayers}} />
        <atoms.Spacer width={8} />
        { hasRecordPrayerButton ?? (
          <RecordPrayerButton {...{teamId: team?.id }} /> )}
      </View>
    )
})`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`


/***
 * PostPrayerButton - Core functionality
 * Renders a hidden Modal (its revealing button visible instead)
 * 
 * Decides which view (`SelectPrayerView` vs `SharePrayerView`) to display
 * depending on whether prayers were already available for sharing.
 *
 * Prayer picker (`SelectPrayerView`) -> Friends picker/sharing (`SharePrayerView`)
 * Opens `SharePrayerView` straight away, iff we were initialized with prayers.
 */
 const PostPrayerButtonUnmemoized = 
 styled(({prayers: initialPrayers, style, ...props}: Omit<Props, 'team'|'hasRecordPrayerButton'>) => {
 
  // Data
  //=========
  const [prayers, onSelect] = useState<Prayer[]>(initialPrayers)

  // UI
  //=========
  const containerStyle = useMemo(() => 
    ({ flexGrow: 0, flexBasis: 'auto', marginTop: 0 }), [])
  const button = useCallback(
    ({ onPress }) => <atoms.Btn {...{...props, onPress}} />, [props])
  
   return (
     <Modal {...{button, style, containerStyle}} >
       { !prayers?.length ? ( <SelectPrayerView  {...{onSelect}} /> ) : (
         <SharePrayerView { ...{ prayers }} /> )}
     </Modal>
   )
 
 }).attrs({ 
  label: "Post Prayer" 
})`
  // counter-effects for modal container presets
  // padding: 35px 0;   
  width: ${atoms.WIDTH-30}px;
  height: ${atoms.HEIGHT-30}px;
  margin: 100px 0;
 `
 

const RecordPrayerButton = styled(RecordPrayer)`
  width: ${BUTTON_HEIGHT}px;  
  height: ${BUTTON_HEIGHT}px; 
`

export default memo(PostPrayerButtonExtUnmemoized)

import React, {useMemo, useState, useLayoutEffect, useEffect, ComponentProps} from "react";
import { TouchableOpacity, ViewStyle, View } from "react-native";
import {useSelector, useStore} from "react-redux";
import styled, {useTheme} from "styled-components/native";

import {Prayer, Team} from "@/types/models";
import { selectContactAvatar } from "@/state/contacts"

import Avatar from "../Avatar"
import * as FlipCard from "../FlipCard"
import AudioPlayList from "../AudioPlayList"
import { Row, RADIUS, WIDTH } from "@/components/uiStyle/atoms";
import * as ar from "@/components/audio-recorder";


const ITEM_HEIGHT = 50
const LAST_ITEM_HEIGHT = 75

type State = { flipSide: FlipCard.FlipSide } & ar.PlaybackStatus
export { State as PlayListItemState}

type Props = {
  isLast: boolean,
  prayer: Prayer,
  style?: ViewStyle,
  onChange?: (state: State) => void
} & Pick<ComponentProps<typeof AudioPlayList>, 'shouldReset'|'shouldPlay'|'shouldStop'>


/**
 * <PrayerListItem />
 * Double-sided component that displays prayer info with author avatar 
 * on the front side, and playable prayers recordings on the back side.
 * 
 * PrayerListItem -> AudioPlayList -> AudioPlayer
 */    
export default styled(
  ({prayer, shouldPlay, shouldReset, shouldStop: intiallyStopped, isLast, style, onChange}: Props) => {

  // Data
  // =========================

  const theme = useTheme()
  const authorAvatar = useSelector(selectContactAvatar(prayer.user_id))
  const [shouldStop, setShouldStop] = useState<boolean>(intiallyStopped)

  
  // Flip card
  // ==========================

  const [flipSide, setSide] = useState<FlipCard.FlipSide>(1)
  const changeSide = React.useCallback(() => {
    setSide((flipSide) => (flipSide === 0 ? 1 : 0)) }, []);

  // stop and unload iff shouldStop or list item flipped to front size
  useEffect(() => {  
    setShouldStop(!!flipSide || shouldStop) }, [flipSide, shouldStop])

  // Notify callbacksshouldReset
  // ==========================

  const [status, setStatus] = 
    useState<ar.PlaybackStatus>(ar.resetStatus)

  useEffect(() => { onChange?.({ flipSide, ...status}) }, 
    [flipSide, status.ready, status.playing, status.ended])

  // UX
  // ==========================

  const [height, setHeight] = useState(isLast? LAST_ITEM_HEIGHT: ITEM_HEIGHT)
  useLayoutEffect(()=> { setHeight(height => flipSide == 1 ? // FRONT
    height : height* (prayer.audio_urls?.length||1)  )}, [flipSide])

  const front = (
    <TouchableOpacity {...{onPress: changeSide}} style={{ 
      flex: 1,
    }}>
      <Front highlighted={shouldPlay}>
        <Avatar path={authorAvatar} size={50} />
        <View style={{flexDirection: 'column', marginLeft: 12 }}>
          <Title highlighted={shouldPlay}>{prayer.title}</Title>
          <Description highlighted={shouldPlay}>audios ({prayer.audio_urls?.length})</Description>
        </View>
      </Front>
    </TouchableOpacity>
  )

  const back = (
    <TouchableOpacity {...{onPress: changeSide}}>
      <AudioPlayList {...{
        paths: prayer.audio_urls, 
        shouldPlay, shouldReset, shouldStop,
        onChange: setStatus
      }} />
    </TouchableOpacity>
  )

  const memoStyle =
    useMemo(() => ({ ...style, height}), [style, height])

  return (
    <FlipCard.ReanimatedFlip {...{ 
      style: [memoStyle, {
        ...(!shouldPlay? {zIndex: -4} : { zIndex: 4}),
      }],
      front, back, side: flipSide, 
      rotate: FlipCard.RotateAxis.Y,
    }}/>
  )
    
})`
  ${p => `
  border: 1px ${p.theme.colors.mutedFg};
  border-radius: ${RADIUS}px;
  `}
`

const Front = styled(Row)`
  width: ${WIDTH-30}px;
  justify-content: flex-start;
  border-radius: ${RADIUS}px;
  border: 2px ${p => p.theme.colors.cardBg};
  background-color: ${p => !p.highlighted? 
    p.theme.colors.mutedFg: p.theme.colors.primaryButtonBg};
`

const Description = styled.Text`
  ${p => p.highlighted && `
  color: ${p.theme.colors.primaryButtonFg};
  `}
`
const Title = styled.Text`
  font-weight: bold;
  ${p => p.highlighted && `
  color: ${p.theme.colors.primaryButtonFg};
  `}
`


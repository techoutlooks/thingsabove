import React, {useMemo, useState, useReducer, useCallback, useLayoutEffect} from "react";
import { TouchableOpacity, ViewStyle, View } from "react-native";
import {useSelector, useStore} from "react-redux";
import styled, {useTheme} from "styled-components/native";

import Prayer, {Team} from "@/types/Prayer";
import { selectContactAvatar } from "@/state/contacts"

import { AudioPlayer, FlipCard, RotateAxis, Avatar } from "@/components";
import { Row, Spacer, Text, WIDTH, RADIUS, useLayout } from "@/components/uiStyle/atoms";


const LIST_ITEM_HEIGHT = 72


type Props = {
    prayer: Prayer, style?: ViewStyle} 


/**
 * Double-sided component that displays prayer info with author avatar 
 * on the front side, and playable prayers recordings on the back side.
 */    
const PrayerListItem = styled(({prayer, style}: Props) => {

    // Data
    // =========================
    const theme = useTheme()
    const authorAvatar = useSelector(selectContactAvatar(prayer.user_id))
    
    // Flip card
    // ==========================
    const [side, setSide] = useState<0 | 1>(1)
    const changeSide = React.useCallback(() => {
        setSide((side) => (side === 0 ? 1 : 0));
      }, []);

    // UX
    // ==========================

    const [height, setHeight] = useState(LIST_ITEM_HEIGHT)
    useLayoutEffect(()=> { setHeight(side == 1 ? 
      LIST_ITEM_HEIGHT : LIST_ITEM_HEIGHT* prayer.audio_urls?.length||1) }, [side])

   
    const front = (
      <TouchableOpacity {...{onPress: changeSide}} style={{ 
        borderWidth: 1, borderColor: theme.colors.mutedFg,
        borderRadius: RADIUS
      }}>
        <Row style={{justifyContent: 'flex-start', marginLeft:24 }}>
          <Avatar path={authorAvatar} size={55} />
          <Spacer width={8} />
          <Text>{prayer.title}</Text>
        </Row>
      </TouchableOpacity>
    )

    const back = (
      <TouchableOpacity {...{onPress: changeSide}}>
        { prayer.audio_urls?.map((path, key) => (
            <AudioPlayer {...{key, path}} />
        ))}
      </TouchableOpacity>
    )


    const memoStyle = useMemo(() => ({ ...style, height}), [style, height])
    console.log("<PrayerListItem />", `memoStyle=${memoStyle.height}. prayer=`, prayer)

    return (
      <FlipCard {...{ 
        style: memoStyle,
        front, back,
        side, rotate: RotateAxis.Y,
      }}/>
    )
    
})`
  ${p => `
  border: 1px ${p.theme.colors.mutedFg};
  border-radius: ${RADIUS}px;
  `}
`


export default PrayerListItem
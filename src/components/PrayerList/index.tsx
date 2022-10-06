import React, {useCallback, useState, useEffect, ComponentProps} from "react";
import {FlatList as RNFlatList, ViewStyle } from "react-native";
import styled, {useTheme} from "styled-components/native";

import Prayer from "@/types/Prayer";
import { Spacer, Row } from "@/components/uiStyle/atoms";

import PrayerListItem, {PrayerListItemState} from "./PrayerListItem"
import { usePlaylist } from "@/hooks";


/**
 * @param {boolean} shouldPlay: play all audios in first prayer,   
 * @param onChange: args: 
 *    flipped: true iff any of the PrayerListItem's was flipped (tails), 
 *        ie., with the back side (audios) shown.
 */
type PrayerListProps = {
  prayers: Prayer[], style?: ViewStyle, 
  customFlatList?: (props: any) => React.ReactElement<typeof RNFlatList>
} & Omit<ComponentProps<typeof PrayerListItem>, 'prayer'>



/***
 * PrayerList with list items implemented as flip cards
 * Customisable flatlist component. Defaults to RN.FlatList
 */
export default styled(({prayers, shouldReset, style, 
  onChange, customFlatList, ...p}: PrayerListProps) => {
      

    /* Flip card
    ========================= */

    const [flipped, setFlipped] = useState<boolean>(false)

    /* Prayers Playlist
    ========================= */

    const [{shouldPlay, ...status}, setStatus]  = usePlaylist({
      size: prayers.length, shouldPlay: p.shouldPlay })

    // playlist events notify
    useEffect(() => { onChange?.({flipped, ...status})
    }, [flipped, status.ready, status.playing, status.ended])

    const setState = (index: number, {flipSide, ...status}: PrayerListItemState) => { 
      setFlipped(() => !flipSide)   // FRONT=1 (info), BACK=0 (audios) 
      setStatus([index, status])    //
    }

    // console.log(`PrayerList [len=${prayers?.length}] p.shouldPlay=${p.shouldPlay} shouldReset=${shouldReset}`,
    // `-> shouldPlay=${JSON.stringify(shouldPlay)} status=${JSON.stringify(status)}`)

    /* FlatList comp.
    ========================= */

    const ItemSeparatorComponent = useCallback(() => (<Spacer height={8} />), [])
    const keyExtractor = useCallback((item, i) => item+i, [])
    const renderItem = useCallback(({item: prayer, index}) => (
      <PrayerListItem {...{
        prayer, shouldReset, keyExtractor, isLast: index+1==prayers.length,
        shouldPlay: shouldPlay[index], // ie., iff first prayer
        onChange: (status: PrayerListItemState) => setState(index, status)
      }} />
    ), [shouldPlay, shouldReset])

    const FlatList = !customFlatList ? RNFlatList :
      customFlatList({})

    return (
      <Row {...{style}}>
        <FlatList {...{
          data: prayers, renderItem, keyExtractor,
          ItemSeparatorComponent, initialNumToRender: 5,
        }} />
      </Row>
    )
})`
  padding: 0 16px;
`
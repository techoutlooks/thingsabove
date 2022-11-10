import React, { useEffect, useState, useCallback, ComponentProps } from 'react'
import { TextProps } from "react-native"
import styled from 'styled-components/native'

import {Prayer} from '@/types/models'
import {Switch as UnStyledSwitch, SwitchProps } from '../uiStyle/atoms'
import Avatar from '../Avatar'



enum SelectActions {
  ADD = "selectPrayer/ADD",         // prayer selected
  REMOVE = "selectPrayer/REMOVE",   // prayer unselected
  INIT = "selectPrayer/INIT"        // prayer item was just initialized
}

type OnSelectArgs = { action: SelectActions, prayer: Prayer }
type Props = { 
  prayer: Prayer,  
  onSelect: ({ action, prayer }: OnSelectArgs) => void 
} & Pick<SwitchProps, 'initiallyOn'>


/***
 * Found contact from contact's directory
 */
const SearchResultItem = React.memo(({ prayer, onSelect, initiallyOn }: Props) => {

  // dispatch .onChange() with contact and reason for change (contact add/removed ?)
  const onChange = useCallback((isOn: boolean|undefined) => {
    onSelect?.({ action: isOn ? SelectActions.ADD : SelectActions.REMOVE, prayer })
  }, [])

  return (
    <Switch {...{ onChange, initiallyOn }}>
      <Avatar path={prayer?.picture_urls?.[0]} size={40} />
      <Summary>
        <Name>{prayer?.title}</Name>
        <Username>{prayer?.description}</Username>
      </Summary>
    </Switch>
  )
})

export  {OnSelectArgs, SelectActions, SearchResultItem}

// Styles
// ==========================
const Switch = styled(UnStyledSwitch)
  .attrs({ transparent: true })
`
  padding: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  // border-radius: 0;
`
const Summary = styled.View`
  padding-left: 8px;
`
const Name = styled.Text.attrs({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-size: 15px;
  font-weight: bold;
  color: ${p => p.theme.colors.fg};
`
const Username = styled.Text.attrs<TextProps>(p => ({
  children: `@${p.children}`,
  numberOfLines: 1,
  ellipsizeMode: 'tail',
}))`
  color: ${p => p.theme.colors.mutedFg};
  font-size: 12px;
  font-weight: normal;
`

import React, { useEffect, useState, ComponentProps } from 'react'
import { TextProps, View } from "react-native"
import styled from 'styled-components/native'

import {Prayer} from '@/types/models'
import { useContact } from "@/hooks"
import * as atoms from '../uiStyle/atoms'
import * as supabase from "@/lib/supabase"


enum SelectActions {
  ADD = "selectPrayer/ADD",         // prayer selected
  REMOVE = "selectPrayer/REMOVE",   // prayer unselected
  INIT = "selectPrayer/INIT"        // prayer item was just initialized
}

type OnSelectArgs = { action: SelectActions, prayer: Prayer }
type Props = { 
  prayer: Prayer,  
  onSelect: ({ action, prayer }: OnSelectArgs) => void 
} & Pick<atoms.SwitchProps, 'initiallyOn'>


/***
 * Found contact from contact's directory
 */
const SearchResultItem = React.memo(({ prayer, onSelect, initiallyOn }: Props) => {

  /* Data
  -------------------------------- */
  const contact = useContact(prayer?.user_id)

  /* UI
  -------------------------------- */
  const [isOn, setIsOn] = useState<boolean|undefined>(initiallyOn)
  useEffect(() => onSelect?.({ 
    action: isOn ? SelectActions.ADD : SelectActions.REMOVE, prayer }), [isOn])

  return (
    <Switch primary {...{ onChange: setIsOn, initiallyOn }}>
      <Image {...{isOn, path: `avatars/${prayer?.picture_urls?.[0]}`}}  />
      <Summary>
        <Title {...{isOn}}>{prayer?.title}</Title>
        <Info>
          <Username {...{isOn}}>{contact?.username}{" "}</Username>
          <Description {...{isOn}}>{prayer?.description}</Description>
        </Info>
      </Summary>
    </Switch>
  )
})

export  {OnSelectArgs, SelectActions, SearchResultItem}

// Styles
// ==========================
const Switch = styled(atoms.Switch)
  .attrs({ transparent: true })
`
  padding: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`
const Summary = styled.View`
  padding-left: 8px;
`
const Info = styled.View`
  flex-direction: row;
  align-items: center;
`
const Text = styled(atoms.Text)
.attrs<TextProps & {isOn: boolean}>(p => ({
  numberOfLines: 1, ellipsizeMode: 'tail', ...p
}))`
  margin-right: 24px;
`
const Title = styled(Text)`
  font-size: 14px;
  font-family: SFProDisplay-Medium;
  color: ${p => p.isOn? p.theme.colors.cardBg : p.theme.colors.fg };
`
const Description = styled(Text)`
  font-size: 13px;
  color: ${p => p.isOn? p.theme.colors.cardBg : p.theme.colors.fg };
`
const Username = styled(Text).attrs(p => ({
  children: `@${p.children}`,
}))`
  color: ${p => p.isOn? p.theme.colors.inputDisabledBg : p.theme.colors.mutedFg };
  font-size: 12px;
  font-weight: normal;
  margin-right: 0px;
`
const Image = styled(supabase.Image).attrs(p => ({
  aspectRatio: 1, resizeMode: 'cover', ...p
}))`
  height: 40px; width: 40px;
  background-color: ${p => p.theme.colors.cardBg};
  border-color: ${p => p.isOn ? p.theme.colors.cardBg: p.theme.colors.mutedFg};
  border-width: 1px;
  borderRadius: 5px;
`
import React, { useEffect, useState, useCallback, ComponentProps } from 'react'
import { TextProps } from "react-native"
import styled from 'styled-components/native'
import { useDispatch } from "react-redux"

import { fetchContacts, Contact } from '@/state/contacts'
import {Switch as UnStyledSwitch, SwitchProps } from '@/components/uiStyle/atoms'
import {Avatar} from '@/components'



enum SelectActions {
  ADD = "selectContact/ADD",        // contact selected
  REMOVE = "selectContact/REMOVE",  // contact unselected
  INIT = "selectContact/INIT" 
}

type OnSelectArgs = { action: SelectActions, contact: Contact }
type Props = { contact: Contact,  
  onSelect: ({ action, contact }: OnSelectArgs) => void 
} & Pick<SwitchProps, 'initiallyOn'>


/***
 * Found contact from contact's directory
 */
const SearchResultItem = React.memo(({ contact, onSelect, initiallyOn }: Props) => {

  const dispatch = useDispatch()
  const [fetchedContact, setFetchedContact] = useState<Contact|null>(null)



  useEffect(() => {
    (async () => {
      if (!contact?.isNew) { setFetchedContact(null) } else { 
        const contacts = await dispatch(fetchContacts({usernames: [contact.username]}))
        setFetchedContact(!!contacts?.length ? contacts[0] : null) } 
    })()
  }, [contact.username, contact?.isNew])


  // dispatch .onChange() with contact and reason for change (contact add/removed ?)
  const onChange = useCallback((isOn: boolean|undefined) => {
    onSelect?.({ action: isOn ? SelectActions.ADD : SelectActions.REMOVE, contact })
  }, [])

  return (
    <Switch {...{ onChange, initiallyOn }}>
      <Avatar path={contact?.avatar?.[0]} size={40} />
      <Summary>
        <Name>{contact?.displayName}</Name>
        <Username>{contact.username}</Username>
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

import React, { useEffect, useState, useCallback, ComponentProps } from 'react'
import { TextProps } from "react-native"
import styled from 'styled-components/native'
import { useDispatch } from "react-redux"

import { fetchContacts, Contact } from '@/state/contacts'
import * as atoms from '../uiStyle/atoms'
import Avatar from '../Avatar'



enum SelectActions {
  ADD = "selectContact/ADD",        // contact selected
  REMOVE = "selectContact/REMOVE",  // contact unselected
  INIT = "selectContact/INIT" 
}

type OnSelectArgs = { action: SelectActions, contact: Contact }
type Props = { contact: Contact,  
  onSelect: ({ action, contact }: OnSelectArgs) => void 
} & Pick<atoms.SwitchProps, 'initiallyOn'>


/***
 * Found contact from contact's directory
 */
const SearchResultItem = React.memo(({ contact, onSelect, initiallyOn }: Props) => {

  // Data
  // ==========================
  const dispatch = useDispatch()
  const [fetchedContact, setFetchedContact] = useState<Contact|null>(null)

  useEffect(() => {
    (async () => {
      if (!contact?.isNew) { setFetchedContact(null) } else { 
        const contacts = await dispatch(fetchContacts({usernames: [contact.username]}))
        setFetchedContact(!!contacts?.length ? contacts[0] : null) } 
    })()
  }, [contact.username, contact?.isNew])

  // UI
  // ==========================
  const [isOn, setIsOn] = useState<boolean|undefined>(initiallyOn)
  const [label, setLabel] = useState<'add'|'remove'>(initiallyOn ? 'remove' : 'add')

  useEffect(() => {  
    setLabel(isOn? 'remove' : 'add')
    onSelect?.({ action: isOn ? SelectActions.ADD : SelectActions.REMOVE, contact })
  }, [isOn])


  return (
    <Switch primary {...{ onChange: setIsOn, initiallyOn }}>
      <Content>
        <Avatar path={contact?.avatar?.[0]} size={40} />
        <Summary>
          <Name {...{isOn}}>{contact?.displayName}</Name>
          <Username {...{isOn}}>{contact.username}</Username>
        </Summary>
      </Content>
      <Action {...{label, onPress: () => setIsOn(b => !b)}}/>
    </Switch>
  )
})

export  {OnSelectArgs, SelectActions, SearchResultItem}

// Styles
// ==========================
const Switch = styled(atoms.Switch)
  .attrs({ transparent: true })
`
  padding: 5px 8px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  // height: 40px;

`
const Content = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`
const Summary = styled.View`
  padding-left: 8px;
`

const Text = styled(atoms.Text)
.attrs<TextProps & {isOn: boolean}>(p => ({
  numberOfLines: 1, ellipsizeMode: 'tail', ...p
}))``
const Name = styled(Text)`
  font-size: 15px;
  font-weight: bold;
  color: ${p => p.isOn? p.theme.colors.cardBg : p.theme.colors.fg };
`
const Username = styled(Text).attrs<TextProps>(p => ({
  children: `@${p.children}`,
}))`
  color: ${p => p.isOn? p.theme.colors.inputDisabledBg : p.theme.colors.mutedFg };
  font-size: 12px;
  font-weight: normal;
`
const Action = styled(atoms.Button).attrs(({label}) => ({
  name: `person-${label}-alt-1`
}))``

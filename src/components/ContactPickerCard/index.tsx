import React, { useState, useMemo, useEffect, useCallback, 
  useReducer, Reducer, memo  } from 'react'
import { useNavigation } from '@react-navigation/native'
import styled from 'styled-components/native'

import lodash from 'lodash'

import { useAuthId } from "@/hooks"
import { Contact } from '@/state/contacts'
import * as atoms from '@/components/uiStyle/atoms/'

import {OnSelectArgs, SelectActions, SearchResultItem} from './SearchResultItem'


/***
 * @param initialContacts: contacts to pick from
 * @param selectedIds: preselected contact ids (subset of `initialContacts`)
 * @param onSelect: called with picked contacts
 */
type Props = { 
  initialContacts: Contact[],
  selectedIds?: string[],
  title?: string,
  onSelect?: (contacts: Contact[]) => void 
}


type A =  { action: SelectActions, contacts: Contact[] }
type I = { initialContacts: Contact[], selectedIds?: string[] } 

const initSelectedContacts = ({initialContacts, selectedIds}: I) => 
  initialContacts.filter(c => !!selectedIds?.includes(c.userId))

  

/**
 * Select contact reducer
 * Adds/removes contacts as they are individually selected/deselected 
 */
type R = Reducer<Contact[], A>
const selectContactReducer: R = (s, {action, contacts}) => {
  switch (action) {
    case SelectActions.ADD:
      return lodash.uniqBy([...s, ...contacts], 'userId')
    case SelectActions.REMOVE:
      const ids = contacts.map(c => c.userId)
      return s.filter(c => !ids.includes(c.userId))
    case SelectActions.INIT:
      return contacts
  }
}


/***
 * Displays a view that enables user to 
 * - pick contacts from given list
 * - search the directory for contacts to add.

 */
export default ({ initialContacts=[], selectedIds: initialSelectedIds=[], ...props } : Props) => {

  /* Data
  ========================= */

  const navigation = useNavigation()
  const authId = useAuthId()

  const initialData: I = { initialContacts, selectedIds: initialSelectedIds }
  const [ selectedContacts, setSelectedContacts ] = useReducer<R, I>(
    selectContactReducer, initialData, initSelectedContacts)

  // syncs reducer with props 
  useEffect(() => { !!initialSelectedIds?.length && setSelectedContacts({ 
    action: SelectActions.INIT, contacts: initSelectedContacts(initialData) }) 
  }, [initialSelectedIds])
  

  /* Search Contact
  ========================= */

  const [query, setQuery] = useState('')
  const [resultContacts, setResultContacts] = useState<Contact[]>([])


  useEffect(() => {
    const regex = new RegExp(`\\b[@:]?${query}`, 'i')
    const matches = initialContacts.filter(contact => ( 
      contact.userId !== authId                                       &&   // exclude self
      !selectedContacts.filter(c => c.userId==contact.userId).length  &&   // exclude already selected contacts
      (contact.displayName.match(regex) || contact.username.match(regex)) 
    ))

    const contacts = lodash.orderBy(matches,
      ['displayName'], ['asc']).slice(0, 20)

    // const newContact = getNewContactFromQuery(query)
    // if (newContact) { setResultContacts([newContact, ...contacts])
    // } else { setResultContacts(contacts) }

    setResultContacts(contacts) 

  }, [query, initialContacts, selectedContacts])



  /* Callbacks
  ========================= */

  const onSelect = useCallback(({action, contact}: OnSelectArgs) => {
    setSelectedContacts({action, contacts: [contact]}) }, [])

  const add = useCallback(() => {
    props?.onSelect?.(selectedContacts)  }, [selectedContacts])

  const renderContact = useCallback(({ item: contact }) => (
    <SearchResultItem {...{ contact, onSelect }} />), [])

  const renderSelectedContact = useCallback(({ item: contact }) => (
    <SearchResultItem initiallyOn {...{ contact, onSelect }} />), [])

  const navigateBack = useMemo(() => () => navigation.goBack(), [])

  // console.log(`<ContactPickerCard /> selectedContacts=${selectedContacts.length}`, 
  //  selectedContacts.map(c => c.displayName))

  return (
    <ScreenCard>
      <atoms.ScreenHeader
        title={props.title || "Pick Contacts"}
        leftIcon={<atoms.BackIcon onPress={navigateBack} />}
      />
      <ContactList inverted
        data={resultContacts}
        keyExtractor={({ isNew, username }, i) => (isNew ? 'new' : username)}
        initialNumToRender={15}
        keyboardShouldPersistTaps="handled"
        renderItem={renderContact}
      />
      <ContactList selected 
        data={selectedContacts}
        keyExtractor={({ isNew, username }, i) => (isNew ? 'new' : username)}
        initialNumToRender={15}
        keyboardShouldPersistTaps="handled"
        renderItem={renderSelectedContact}
      />
      <ScreenFooter>
        <SearchBar autoFocus value={query} 
          onChangeText={setQuery}
           postIcon="account-search-outline" 
        />
        <AddButton onPress={add} />
      </ScreenFooter>
      
    </ScreenCard>
  )
}


const ContactList = styled(atoms.FlatList)`
  ${p => p.selected && `
    border-top-width: 1px; border-top-style: solid; 
    border-top-color: ${p.theme.colors.mutedFg}
  `}
`

const AddButton = styled(atoms.Button)
  .attrs({ name: "group-add"})
`
  margin: 0 0 0 16px;
`

const SearchBar = styled(atoms.SearchInput)` 
  flex: 1;
`

const ScreenFooter = styled(atoms.ScreenFooter)`
  align-items: center;
  justify-content: space-between;
  padding: 0; // cancel padding from ancestor
  margin-top: 32px;
`

const ScreenCard = styled(atoms.ScreenCard)`
 padding: 16px;
 margin: 16px;
 width: 100%
`

const getNewContactFromQuery = (query: string) => {
  const isAddress = query.match(/^@.+?:.+\..+$/)
  return isAddress ? { isNew: true, username: query, avatarUrl: '' } : null
}

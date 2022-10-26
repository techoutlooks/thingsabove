import React, { useState, useMemo, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import styled from 'styled-components/native'

import { useSelector } from 'react-redux'
import _orderBy from 'lodash/orderBy'

import { getContactsById } from '@/state/contacts'
import { useAuthProfile } from '@/hooks'

import {
  ScreenCard, ScreenFooter, ScreenHeader, BackIcon,
  FlatList } from '@/components/uiStyle/atoms'

import {SearchInput as SearchBar} from '@/components/uiStyle/atoms/'
import SearchResultItem from './SearchResultItem'


const AddContactScreen = () => {

  const navigation = useNavigation()
  const {profile} = useAuthProfile()
  const navigateBack = useMemo(() => () => navigation.goBack(), [])
  const [query, setQuery] = useState('')
  const [resultContacts, setResultContacts] = useState([])

  const contactsById = useSelector(getContactsById)

  useEffect(() => {
    const regex = new RegExp(`\\b[@:]?${query}`, 'i')
    const matches = Object.values(contactsById).filter(contact => ( 
      contact.userId !== profile?.id &&                 // exclude self
      !profile?.friends_ids.includes(contact.userId) && // exclude already friends
      (contact.displayName.match(regex) || contact.username.match(regex)) 
    ))

    const contacts = _orderBy(matches,
      ['displayName'], ['asc', 'asc']).slice(0, 20)

    const newContact = getNewContactFromQuery(query)
    if (newContact) { setResultContacts([newContact, ...contacts])
    } else { setResultContacts(contacts) }

  }, [query])

  console.log(`<AddContactScreen /> contactsById=`, contactsById)

  return (
    <ScreenCard>
      <ScreenHeader
        title="Add Contact"
        leftIcon={<BackIcon onPress={navigateBack} />}
      />
      <FlatList
        data={resultContacts}
        keyExtractor={({ isNew, username }, i) => (isNew ? 'new' : username)}
        inverted
        initialNumToRender={15}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: contact }) => (
          <SearchResultItem contact={contact} />
        )}
      />
      <ScreenFooter>
        <SearchBar autoFocus value={query}
                   onChangeText={setQuery}
                   postIcon="account-search-outline" />
      </ScreenFooter>
    </ScreenCard>
  )
}

export default AddContactScreen
AddContactScreen.whyDidYouRender = true


const getNewContactFromQuery = (query: string) => {
  const isAddress = query.match(/^@.+?:.+\..+$/)
  return isAddress ? { isNew: true, username: query, avatarUrl: '' } : null
}

import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import _orderBy from 'lodash/orderBy'

import { getContactsById } from '@/state/contacts'
import { useAuthId } from '@/hooks'

import {
  ScreenCard, ScreenFooter, ScreenHeader, BackIcon,
  FlatList } from '@/components/uiStyle/atoms'

import {SearchInput as SearchBar} from '@/components/uiStyle/atoms/'
import SearchResultItem from './SearchResultItem'

const ChatScreen = () => {

  const navigation = useNavigation()
  const authId = useAuthId()
  const navigateBack = useMemo(() => () => navigation.goBack(), [])
  const [query, setQuery] = useState('')
  const [resultContacts, setResultContacts] = useState([])

  const contactsById = useSelector(getContactsById)

  useEffect(() => {
    const regex = new RegExp(`\\b[@:]?${query}`, 'i')
    const matches = Object.values(contactsById).filter(contact => {
      return (
        contact.userId !== authId &&
        (contact.displayName.match(regex) || contact.userId.match(regex))
      )
    })

    const contacts = _orderBy(
      matches,
      ['isDirect', 'displayName'],
      ['asc', 'asc'],
    ).slice(0, 20)

    const newContact = getNewContactFromQuery(query)

    if (newContact) {
      setResultContacts([newContact, ...contacts])
    } else {
      setResultContacts(contacts)
    }
  }, [query])

  return (
    <ScreenCard>
      <ScreenHeader
        title="New Message"
        leftIcon={<BackIcon onPress={navigateBack} />}
      />
      <FlatList
        data={resultContacts}
        keyExtractor={({ isNew, userId }, i) => (isNew ? 'new' : userId)}
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

export default ChatScreen
ChatScreen.whyDidYouRender = true

const getNewContactFromQuery = query => {
  const isAddress = query.match(/^@.+?:.+\..+$/)

  return isAddress ? { isNew: true, userId: query, avatarUrl: '' } : null
}

import React, { useEffect, useState } from 'react'
import { Alert, TextProps } from "react-native"
import styled from 'styled-components/native'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from "react-redux"

import { bolderize } from "@/lib/utils"
import { fetchContacts, Contact } from '@/state/contacts'
import {Avatar} from '@/components'
import { useAuthProfile } from "@/hooks"


type Props = { contact: Contact }
const SearchResultItem = React.memo(({ contact }: Props) => {

  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [fetchedContact, setFetchedContact] = useState<Contact|null>(null)


  const { profile: me, update: updateAuthProfile } = useAuthProfile()

  useEffect(() => {
    (async () => {
      if (!contact?.isNew) { setFetchedContact(null) } else { 
        const contacts = await dispatch(fetchContacts({usernames: [contact.username]}))
        setFetchedContact(!!contacts?.length ? contacts[0] : null) } 
    })()
  }, [contact.username, contact?.isNew])

  const addContact = () => { me?.friends_ids &&
    Alert.alert("Add Contact", `Add ${bolderize(contact.displayName)} to your friends list?`, [
      { text: "Yes", onPress: () => { 
        updateAuthProfile({ friends_ids: [...me.friends_ids, contact.userId]})
      }},
      { text: "View Profile", onPress: () => 
          navigation.navigate("ViewContact", { userId: contact?.userId }) 
      }
    ])
  }

  return (
    <Container onPress={addContact}>
      <Avatar path={contact?.avatar?.[0]} size={40} />
      <Summary>
        <Name>{contact?.displayName}</Name>
        <Username>{contact.username}</Username>
      </Summary>
    </Container>
  )
})

export default SearchResultItem

// Styles
// ==========================
const Container = styled.TouchableOpacity`
  padding: 8px 16px;
  flex-direction: row;
  align-items: center;
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

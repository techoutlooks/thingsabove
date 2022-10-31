import React, { useState, useEffect, useCallback  } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Alert } from "react-native"
import { useSelector } from "react-redux"
import _orderBy from 'lodash/orderBy'

import { useAuthProfile } from '@/hooks'
import { bolderize } from "@/lib/utils"
import { Contact, selectContacts } from '@/state/contacts'
import { ContactPickerCard } from '@/components'



const AddContactScreen = () => {

  
  const navigation = useNavigation()
  const { profile: me, update: updateAuthProfile } = useAuthProfile()
  const [contacts, setContacts] = useState<Contact[]>([])

  /* Data 
  ========================= */
  let contactsDirectory = useSelector(selectContacts())


  /* Save contacts (asks user confirmation)
  to the auth user's `profile.friends_ids` 
  ========================= */
  const saveContacts = (contacts: Contact[]) => { 
    if(!me) return

    const usernames = contacts.map(c => `@${c.username}`).join(', ')
    const friends_ids =  contacts.map(c => c.userId)
    me?.friends_ids && Alert.alert( 
      "Manage Friendlist", 
      `Make friends with ${bolderize(usernames)} ?`, [
        { text: "Yes", onPress: () => { 
          updateAuthProfile({ friends_ids })
          navigation.goBack()
        }},
        (!(friends_ids?.length==1) ? {} : { 
          text: "View Profile", onPress: () => 
            navigation.navigate("ViewContact", { userId: friends_ids[0] }) 
        }),
        { text: "Cancel", style: "cancel" }
      ]
    )
  }

  /* Selected contacts changed.
  a) Exclude already friends 
  b) save new contacts to friends list
  ========================= */
  useEffect(() => { saveContacts(contacts) }, [contacts])

  const onSelect = useCallback((selectedContacts: Contact[]) => {
    console.log(`<EditFriendsScreen /> selected contacts (${selectedContacts?.length||0})=`, selectedContacts)

    setContacts(selectedContacts.filter(
      c => !me?.friends_ids.includes(c.userId)
  )) }, [])

  // console.log(`<EditFriendsScreen /> selected contacts (${contacts?.length||0})=`, contacts)

  return (
    <ContactPickerCard {...{
      initialContacts: contactsDirectory, onSelect,
      selectedIds: me?.friends_ids || [],
      title: "Edit Friends"
    }} />
  )
}

export default AddContactScreen
AddContactScreen.whyDidYouRender = true



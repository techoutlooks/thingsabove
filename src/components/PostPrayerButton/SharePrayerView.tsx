import React, { useState, useEffect, useCallback  } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Alert } from "react-native"

import { bolderize } from "@/lib/utils"
import {Prayer, ItemTypes } from "@/types/models"
import { useFriends, useSharings } from "@/hooks"
import { Contact, selectContacts } from '@/state/contacts'
import ContactPickerCard from '../ContactPickerCard'


type Props = { prayers: Prayer[] }


/***
 * Pick contacts & share prayer with them 
 */
export default ({ prayers }: Props) => {

  const navigation = useNavigation()
  let initialContacts = useFriends()
  const [contactsTo, onSelect] = useState<Contact[]>([])
  const { share } = useSharings({ itemType: ItemTypes.PRAYER })


  /* Selected contacts changed.
  a) Exclude already friends  (filter before setContacts)
  b) save new contacts to friends list (effect)
  ========================= */
  useEffect(() => { 

    const usernames = contactsTo.map(c => `@${c.username}`).join(', ')
    const contactsIdsTo =  contactsTo.map(c => c.userId)
    if(!!prayers.length && !!contactsTo.length) {
      Alert.alert( 
        `Sharing (${prayers?.length}) prayer(s)`, 
        `Share prayer(s) with ${bolderize(usernames)} ?`, [
          { text: "Yes", onPress: () => { 
            share({ items: prayers, contactsIdsTo })
            navigation.goBack()
          }},
          { text: "Cancel", style: "cancel" }
        ]
      )
    }
  }, [contactsTo])

  return (
    <ContactPickerCard {...{
      initialContacts, onSelect,
      selectedIds: [],
      title: "Share to Friends"
    }} />
  )
}
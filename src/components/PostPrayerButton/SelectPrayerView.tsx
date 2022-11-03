import React, { useState, useEffect, useCallback  } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Alert } from "react-native"

import { useSelector } from "react-redux"

import Prayer from "@/types/Prayer"
import { useAuthId } from "@/hooks"
import { selectPrayersByUserId } from '@/state/prayers'

import PrayerPickerCard from '../PrayerPickerCard'



type Props = {
  onSelect?: (prayers: Prayer[]) => void  }

/***
 * Pick prayers from private archive &
 * share them with friends 
 */
export default (props: Props) => {

  const navigation = useNavigation()
  const authId = useAuthId()
  let initial = useSelector(selectPrayersByUserId(authId))
  const [selected, onSelect] = useState<Prayer[]>([])


  /* Selected contacts changed.
  a) Exclude already friends  (filter before setContacts)
  b) save new contacts to friends list (effect)
  ========================= */
  useEffect(() => { !!selected.length && Alert.alert( 
    `Selected (${selected.length}) Prayer(s)`, 
    `Share (${selected.length}) prayers from your archive with friends?`, [
      { text: "Share", onPress: () => { props.onSelect?.(selected)} },
      { text: "Cancel", style: "cancel" }
    ]
  )}, [selected])

  return (
    <PrayerPickerCard {...{
      initial, onSelect,
      selectedIds: [],
      title: "Select Prayers"
    }} />
  )
}
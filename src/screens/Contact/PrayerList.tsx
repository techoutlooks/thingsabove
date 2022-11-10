import React, { useCallback, memo, ComponentProps} from 'react'
import styled, { useTheme } from 'styled-components/native'
import { FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { useLatestPrayers } from "@/hooks"
import { Contact } from "@/state/contacts"
import { PrayerCard } from "@/components"
import * as atoms from '@/components/uiStyle/atoms';


const CARD_HEIGHT = 75
/**
 * @param published: whether to display private, public, prayers or both (iff `undefined`)
 */
type Props = { 
  contact: Contact, published: boolean 
} & Pick<ComponentProps<typeof PrayerCard>, 'onPress'|'style'>


/***
 * Displays a contact's prayers (published only by default)
 */
export default memo(styled(({ contact, published=true, onPress, style }: Props) => {

  const navigation = useNavigation()

  const prayers = useLatestPrayers({ published })
  
  const ItemSeparatorComponent = useCallback(() => <atoms.Spacer height={10} />, [])
  const renderItem = useCallback(({item: prayer}) => {
    const onPress = () => navigation.navigate('Prayer', {
      screen: "Preview", params: { prayerId: prayer.id }})
    return (<PrayerCard {...{ prayer, onPress, style: { height: CARD_HEIGHT }}} />)
  }, [])

  return (
    <>
      { !prayers?.length  ? 
        <EmptyPrayerList user={contact?.first_name} /> : (
        <FlatList {...{
          data: prayers, renderItem,
          ItemSeparatorComponent,
          decelerationRate: 'fast', style
        }} /> 
      )}
    </>
  )
})``
)

const EmptyPrayerList = styled(({user, ...p}) => (
  <atoms.Text {...{
    children: `${user ?? 'User'} has not shared any prayer yet !`, ...p
  }} />
))``

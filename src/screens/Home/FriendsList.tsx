
import React, {useRef, useCallback, useState} from 'react';
import { ViewStyle, TouchableHighlight } from 'react-native';
import {useNavigation} from "@react-navigation/native";
import styled, { useTheme } from 'styled-components/native';
import { MaterialCommunityIcons as Icon} from '@expo/vector-icons';

import { useFriends } from '@/hooks';
import { Contact } from '@/state/contacts';

import * as atoms from '@/components/uiStyle/atoms'
import { NextButton } from '@/components/uiStyle'
import { Avatar } from '@/components'


const NUM_ITEMS_TO_RENDER = 3
const ITEM_SIZE = 80
const ITEM_SEP_WIDTH = 0
const ITEM_OVERLAP = 8
const CONTAINER_RATIO = 1.4*atoms.CONTAINER_RATIO

type Props = { style?: ViewStyle }

export default ({style}: Props) => {

  const theme = useTheme()
  const navigation = useNavigation()
  const flatList = useRef()
  const {friends: contacts} = useFriends()
  const [current, setCurrent] = useState<number>(0)


  /* Nav
  ========================== */
  const addContact = useCallback(() => {
    navigation.navigate("Contact", {screen: "EditFriends"}) }, [])
    
  const showContact = useCallback(({contact}: {contact: Contact}) => {
    navigation.navigate("Contact", {screen: "ViewContact", params: { 
      userId: contact?.userId }}) }, [])

  
  /* ContactList
  ========================== */

  const hasNext = current + NUM_ITEMS_TO_RENDER < contacts?.length || 0
  const onNext = () => { // scroll to next item in current section
    const index = current + 3; setCurrent(index)
    flatList?.current?.scrollToIndex({ index }) }

  const ItemSeparatorComponent = () => (<atoms.Spacer width={ITEM_SEP_WIDTH} />)
  const keyExtractor = useCallback((item, i) => item+i, []) 
  const renderItem = useCallback(({item: contact, index}) => (
    <FriendAvatar {...{ index, contact, onPress: showContact }} /> ), [])


  return (
    <Container {...{ style }}>
      <ListView>
        <ContactList {...{ 
          data: contacts, keyExtractor, renderItem, horizontal: true,
          ItemSeparatorComponent, showsHorizontalScrollIndicator: false, 
        }} />  
        <NewContact onPress={addContact} />
      </ListView>
      <NextButton {...{ hasNext, onNext }} /> 
    </Container>
  )
}


const ContactList = styled(atoms.FlatList)`
  flex: 0 1 ${ NUM_ITEMS_TO_RENDER * (ITEM_SIZE + ITEM_SEP_WIDTH) }px;
`
const FriendAvatar = styled(({ contact, size, style, ...p }) => (
  <Avatar {...{ 
    path: contact?.avatar?.[0], size, style,
    onPress: () => p.onPress?.({contact}) 
  }} />
)).attrs({ 
  size: ITEM_SIZE, 
  overlap: ITEM_OVERLAP 
})`
  ${p => p.overlap && p.index>0 && `margin-left: -${p.overlap}px`}
  border: 2px solid ${p => p.theme.colors.primaryButtonBg};
  border-radius: ${p => p.size/2}px;
  ${p => `width: ${p.size}px; height: ${p.size}px;`}
`

// TouchableHighlight
const NewContact = styled(({name, size, color, ...p}) => (
  <TouchableHighlight {...p}>
    <Icon {...{ name, size, color }} />
  </TouchableHighlight>
)).attrs(p => ({  
  name: "account-edit-outline", size: ITEM_SIZE/CONTAINER_RATIO,
  color: p.theme.colors.cardBg,
  ...p
}))`
  align-items: center; justify-content: center;
  width: ${ITEM_SIZE}px; height: ${ITEM_SIZE}px;
  margin-left: -${ (NUM_ITEMS_TO_RENDER) * ITEM_OVERLAP}px
  border-radius: ${ITEM_SIZE/2}px;
  ${p => `width: ${ITEM_SIZE}px; height: ${ITEM_SIZE}px;`}
  background-color: ${p => p.theme.colors.primaryButtonBg};
`
  
const ListView = styled(atoms.Row)`
  padding: 0; margin: 0;
  justify-content: flex-start;
  flex: 1;
`
const Container = styled(atoms.Row)`
  justify-content: space-between;
  padding: 0; margin: 0;
  width: 100%;
`


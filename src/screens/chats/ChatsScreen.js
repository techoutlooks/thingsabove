import React, { useMemo, useCallback } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { useSelector, shallowEqual } from 'react-redux'

import { selectJoinedRoomIds } from '../../state/rooms'
import {
  ScreenCard, ScreenFooter, ScreenHeader,
  Btn, FlatList } from '@/components/uiStyle/atoms'

import NewChatButton from './NewChatButton'
import ChatPreview from './ChatPreview'

const ChatsScreen = ({ navigation }) => {

  const roomIds = useSelector(selectJoinedRoomIds, shallowEqual)
  const gotoNewChat = useCallback(() => navigation.navigate('NewChat'), [])

  return (
    <ScreenCard>
      <ScreenHeader title="Chats" />
      <FlatList
        data={roomIds}
        inverted
        keyExtractor={(roomId, i) => roomId}
        renderItem={({ item: roomId }) => <ChatPreview roomId={roomId} />}
      />
      <ScreenFooter style={{ justifyContent: 'flex-end' }}>
        {/* <SearchBar /> */}
        <Btn
          icon={props => <MaterialIcons name="edit" {...props} />}
          onPress={gotoNewChat} />
      </ScreenFooter>
    </ScreenCard>
  )
}

export default ChatsScreen

const EditIcon = () => {
  ;<MaterialIcons name="edit" size={24} color="#585265" />
}

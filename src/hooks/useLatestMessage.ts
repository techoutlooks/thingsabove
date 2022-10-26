import { useSelector } from 'react-redux'

import { getRoomLatestMessage } from '../state/room'

const isSameEvent = (a, b) => a.eventId === b.eventId

const useLatestMessage = roomId =>
  useSelector(getRoomLatestMessage(roomId), isSameEvent)

export default useLatestMessage;

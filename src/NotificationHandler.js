import React, { useEffect } from 'react'
import * as Notifications from 'expo-notifications';
import { useIsAuthed } from "@/hooks"

import { getIsAuthenticated } from '@/state/auth'
import { registerForPushNotifications } from '@/lib/pushNotifications'

const NotificationHandler = () => {
  const isAuthed = useIsAuthed()

  useEffect(() => {
    if (isAuthed) {
      registerForPushNotifications()
    }
  }, [isAuthed])

  useEffect(() => {
    const onNotification = ({ origin, data }) => {
      if (origin === 'selected' && data?.roomId) {
        navigation.replace('Chat', {
          roomId: data.roomId,
          eventId: data.eventId,
        })
      }
    }

    const { remove } = Notifications.addNotificationReceivedListener(onNotification)
    return remove
  }, [])

  return null
}

export default NotificationHandler

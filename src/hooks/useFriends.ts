import React from 'react';
import { Contact } from "@/state/contacts"
import { useAuthProfile } from './useAuth';
import {useContacts, useContactsOpts} from './useContact';


/*** 
 * Get friends of authenticated user  */
const useFriends = () => {
  const {profile} = useAuthProfile()
  const friends = useContacts(profile?.friends_ids) as Contact[]
  const friendsCount = (friends?.length || 0) as number
  return { friends, friendsCount }
}

export { useFriends }
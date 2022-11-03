import React from 'react';
import { Contact } from "@/state/contacts"
import { useAuthProfile } from './useAuth';
import {useContacts, useContactsOpts} from './useContact';


/*** 
 * Get friends of authenticated user  */
const useFriends = () => {
  const {profile} = useAuthProfile()
  return useContacts(profile?.friends_ids ?? []) as Contact[]
}

/*** 
 * The authed user's friends count  */
const useFriendsCount = () =>
  (useFriends()?.length as number)


export { useFriends, useFriendsCount }
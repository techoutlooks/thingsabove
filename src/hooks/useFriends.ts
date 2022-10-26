import React from 'react';
import { useAuthProfile } from './useAuth';
import {useContacts, useContactsOpts} from './useContact';


/*** 
 * Get friends of authenticated user  */
const useFriends = (opts?: useContactsOpts) => {
  const {profile} = useAuthProfile()
  return useContacts(profile?.friends_ids, opts)
}

/*** 
 * The authed user's friends count  */
const useFriendsCount = () =>
  (useFriends()?.length as number)


export { useFriends, useFriendsCount }
import React, {useEffect, useReducer, Reducer, useCallback, useMemo} from 'react'
import {useSelector, useDispatch, useStore} from "react-redux";
import * as _ from "lodash"

import { fetchUserProfile } from "@/lib/supabase"
import { Contact, getContact, selectContact, syncContacts, syncFailed } from '@/state/contacts'


type T = Record<string, Contact|null>
type R1 = Reducer<T, T>
type R2 = Reducer<Contact[], T>
type R = R1|R2

type useContactsOpts = Partial<{ flatten: boolean }>
/***
 * useContacts()
 * Get respective profiles from userId list
 * Careful: may want to memoize `userIds` from host component,
 *  since useContacts performs state update that may cause a loop !
 * TODO: dispatch possibly updated profile to store?
 * @param userIds lookup ids
 * @returns list of user ids and profiles as key/values 
 *    eg. [{<userId1>: <profile1>, <userId2>: null, ...}]
 *    eg. [<profile1>, null, <profile3>]
 */
 const useContacts = (userIds: string[], opts?: useContactsOpts) => {

    const state = useStore().getState()
    const dispatch = useDispatch()

    // flatten defaults to true if not explicitly set to false
    const flatten = (!opts && !!opts?.flatten) ? true : false

    const [contacts, push] = useReducer<R>((s,a) => flatten ? 
      ({...s, ...a}) : _.uniqBy([...s, ...Object.values(a)], 'userId'), flatten ? {}:[])

    const getProfile = useCallback((userId: string) => {
      if (userId) {
        const contact = selectContact(userId)(state)
        if (contact) { 
          push({ [userId]: contact })
        } else {
          fetchUserProfile({userId})
            .then(({ data: profile, error, status }) => { 
              if (error && status !== 406) { throw error }
              if (error || profile == null) { throw(error) } else { 
                const contact = getContact(profile)
                dispatch(syncContacts([contact]))
                push({[userId]: contact})
              } 
            })
            .catch(error => {
              const msg = `Error loading profile ${userId}: `
              dispatch(syncFailed(new Error(msg + error.msg)))
              push({ [userId]: null })
            })
        }
      }
    }, [])
  
    useEffect(() => { 
      userIds?.forEach(userId => getProfile(userId))
    }, [userIds])

    // console.log(`->>>>>>> userIds=${userIds} flatten=${flatten} contacts`, contacts )
    return contacts
  }



const useContact = (userId: string): Contact => {
  const userIds = useMemo(() => [userId], [userId])
  const [contact] = useContacts(userIds)
  return contact
}

export type { useContactsOpts }
export { useContact, useContacts}
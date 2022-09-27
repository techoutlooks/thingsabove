import {useEffect, useReducer, Reducer, useCallback} from 'react'
import {useSelector, useDispatch, useStore} from "react-redux";

import { fetchUserProfile } from "@/lib/supabase"
import { Contact, getContact, selectContact, syncContacts, syncFailed } from '@/state/contacts'


type T = Record<string, Contact|null>
type R1 = Reducer<T, T>
type R2 = Reducer<Contact[], T>
type R = R1|R2


/***
 * useContacts()
 * Get respective profiles from userId list
 * TODO: dispatch possibly updated profile to store?
 * @param userIds lookup ids
 * @returns list of user ids and profiles as key/values 
 *    eg. [{<userId1>: <profile1>, <userId2>: null, ...}]
 *    eg. [<profile1>, null, <profile3>]
 */
 const useContacts = (userIds: string[], flatten=false) => {

    const store = useStore()
    const dispatch = useDispatch()

    const [contacts, push] = useReducer<R>((s,a) => !flatten ? 
        ({...s, ...a}) : [...s, ...Object.values(a)], !flatten ? {}:[])
  
    const getProfile = useCallback((userId: string) => {
      if (userId != null) {
        const profile = selectContact(userId)(store.getState())
        // console.log("**** useContacts()/profile", profile)

        if (profile != null) {
          push({ [userId]: profile })
        } else {
          fetchUserProfile(userId)
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
              if(!flatten) { push({ [userId]: null }) }
            })
        }
      }
    }, [])
  
    useEffect(() => {
      userIds.forEach(userId => getProfile(userId)) }, [])
  
    return contacts
  }



export default useContacts
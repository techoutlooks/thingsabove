import React, {useEffect, useReducer, Reducer, useCallback, useMemo} from 'react'
import {useSelector, useDispatch, useStore} from "react-redux";
import * as _ from "lodash"

import { fetchUserProfile } from "@/lib/supabase"
import { Contact, getContact, selectContact, syncContacts, syncFailed } from '@/state/contacts'


type UserId = string
type useContactsOpts = Partial<{ flatten: boolean, nullable: boolean }>
enum Do { ADD = "useContacts/ADD", RESET = "useContacts/RESET" }

type T = Record<UserId, Contact|null>
type R = Reducer<(T|Contact|null)[], {do: Do, payload?: T}>


/***
 * Reducer factory
 * @param {boolean} flatten: reducer can
 *    unflattened, eg. yields array of objects, ie. userids/contacts k,v pairs 
 *    flattened, eg. yields a flat array of contacts 
 * 
 * Do.RESET -> resets the reducer state to []
 * Do.ADD   -> push contacts
 */

const createContactsReducer = (flatten: boolean): R => 
  (s, a) => (typeof a.payload == 'undefined') || a.do != Do.ADD ? [] : // reset
    !flatten ? ({...s, ...a.payload}) : _.uniqBy([...s, ...Object.values(a.payload)], 'userId')

/***
 * useContacts()
 * Map userIds -> resp. contacts (null contact wherever retrieval failed) 
 * Fetches contacts from the redux cache, failover to Supabase query.
 * 
 * Careful: may want to memoize `userIds` from host component,
 *  since useContacts() performs state update that may cause a loop !
 * 
 * @param userIds lookup ids
 * @param nullable: filter out null (failed retrieve) contacts in results
 * @returns list of user ids and profiles as key/values 
 *    eg. if NOT flattened, [{<userId1>: <profile1>, <userId2>: null, ...}]
 *    eg. elsewise (the default), [<profile1>, null, <profile3>] 
 *    Nota: null values represent contact that failed to retrieve
 */
 const useContacts = (userIds?: string[], opts?: useContactsOpts) => {

    const state = useStore().getState()
    const dispatch = useDispatch()

    // flatten -> true, unless not explicitly set to false
    // nullable -> false, unless not explicitly set to true
    const flatten = !(opts?.hasOwnProperty('flatten') && opts.flatten==false)
    const nullable = !!opts?.hasOwnProperty('nullable') && opts.nullable==true

    // reducer: yield object[], or contacts[], depending on `opts.flatten`
    const [contacts, push] = useReducer<R>(createContactsReducer(flatten), [])

    const getProfile = useCallback((userId: string) => {
      if (userId) {
        const contact = selectContact(userId)(state)
        if (contact) { 
          push({ do: Do.ADD, payload: {[userId]: contact} })
        } else {
          fetchUserProfile({userId})
            .then(({ data: profile, error, status }) => { 
              if (error && status !== 406) { throw error }
              if (error || profile == null) { throw(error) } else { 
                const contact = getContact(profile)
                dispatch(syncContacts([contact]))
                push({ do: Do.ADD, payload: {[userId]: contact} }) } 
            })
            .catch(error => {
              const msg = `Error loading profile ${userId}: `
              dispatch(syncFailed(new Error(msg + error.msg)))
              nullable && push({ do: Do.ADD, payload: {[userId]: null} })
            })
        }
      }
    }, [])
  
    /*
    resets fetched contacts to []
    before pulling contacts again, or not (userIds=[])
    ------------------------------ */
    useEffect(() => { 
      push({ do: Do.RESET })            
      if(userIds && !!userIds?.length) userIds.forEach(getProfile)      
    }, [userIds])

    // console.log(`useContacts() ->>>>>>> userIds=${userIds} flatten=${flatten} nullable=${nullable} contacts=`, contacts )
    return contacts
  }


/***
 * useContact
 * Get contact by its userId. 
 * Safer than useContacts([<userId>]) for retrieving a single contact.
 */
const useContact = (userId: string): Contact|null => {
  const userIds = useMemo(() => [userId], [userId])
  const [contact] = useContacts(userIds)
  return (contact as Contact)
}


export type { useContactsOpts }
export { useContact, useContacts }

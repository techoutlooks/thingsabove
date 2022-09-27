import React, {useState, useEffect, useCallback, useReducer, Reducer} from "react";
import { useDispatch, useStore, useSelector } from 'react-redux'

import { selectAuthId, selectAuthUser, getAuthStatus, selectAuthSession,
  selectAuthProfile, fetchProfile, updateProfile, syncSession} from '@/state/auth'
import {UserProfile, client} from "@/lib/supabase"
import { Session } from '@supabase/supabase-js'
import { isempty } from "@/lib/utils";


// Store Queries
// ==========================

export const useAuthSession = () => useSelector(selectAuthSession)

export const useIsAuthed = () => !!useAuthSession()

export const useAuthId = () =>  useSelector(selectAuthId)

export const useAuthUser = () => useSelector(selectAuthUser)

export const useAuthProfile = () => {
  
  const [profile, set] = useReducer<Reducer<UserProfile|null, Partial<UserProfile>>>(
    (s, a) => ({...(s ?? a), ...a} as UserProfile), null)

  const store = useStore()
  const dispatch = useDispatch()

  // get refreshed state variables
  const {fetching, error} = useSelector(getAuthStatus)
  const session = useSelector(selectAuthSession)
  const p = useSelector(selectAuthProfile)
  
  useEffect(() => {
    !!p ? set(p) :  fetch() }, [session, p]) // so this hook refreshes on new auth,

  const fetch = useCallback(() => {
    dispatch(fetchProfile) }, [])  

  const update = useCallback((updates: Partial<UserProfile>) => 
    dispatch(updateProfile(updates)), [])
  
    return {profile, fetching, error, set, fetch, update}
}

// Supabase Sync
// ==========================

/***
 * Watches for auth session changes,
 * syncs new session to the store, returns it.
 */
export const useAuthSessionListener = () => {
  const [session, setSession] = useState<Session|null>(null)
  const dispatch = useDispatch()

  useEffect(() => {
    let mounted = true
    mounted && setSession(client.auth.session())
    client.auth.onAuthStateChange((_event, session) => {
      // FIXME: mounted inside callback may remain true, since captured from closure
      mounted && setSession(session) 
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => { dispatch(syncSession(session))}, [session])
  return session
}


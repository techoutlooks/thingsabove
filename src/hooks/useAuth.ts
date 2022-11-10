import React, {useState, useEffect, useCallback, useReducer, Reducer} from "react";
import { useDispatch, useSelector } from 'react-redux'

import { selectAuthId, selectAuthUser, getAuthStatus, selectAuthSession,
  selectAuthProfile, fetchProfile, updateProfile, syncSession} from '@/state/auth'
import {UserProfile, client} from "@/lib/supabase"
import { Session } from '@supabase/supabase-js'


// Store Queries
// ==========================

export const useAuthSession = () => useSelector(selectAuthSession)

export const useIsAuthed = () => !!useAuthSession()

export const useAuthId = () =>  useSelector(selectAuthId)

export const useAuthUser = () => useSelector(selectAuthUser)

export const useAuthProfile = () => {
  
  const [profile, set] = useReducer<Reducer<UserProfile|null, Partial<UserProfile>>>(
    (s, a) => ({...(s ?? a), ...a} as UserProfile), null)

  const dispatch = useDispatch()

  // get refreshed state variables
  const {fetching, error} = useSelector(getAuthStatus)
  const session = useSelector(selectAuthSession)
  const p = useSelector(selectAuthProfile)

  // forces this hook to refresh on new auth,
  useEffect(() => { 
    !!p ? set(p) :  fetch() }, [session, p]) 

  // FIXME: `fetchProfile` dep required to keep `user.id` refreshed
  // when a signOut occurs. try [profile.id]?
  const fetch = useCallback(() => {
    dispatch(fetchProfile) }, [])  

  // const fetch = dispatch(fetchProfile)
  const update = useCallback((updates: Partial<UserProfile>) => 
    dispatch(updateProfile(updates)), [])
  
  return {profile, fetching, error, set, fetch, update}
}

// Supabase Sync
// ==========================

/***
 * Watches for auth session changes, not relying on the store.
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


import { User, UserCredentials, Session } from "@supabase/supabase-js"
import { showMessage, hideMessage } from "react-native-flash-message";
import * as _ from "lodash"
import {mergeDeep} from "@/lib/mergeDeep";

import * as supabase from "@/lib/supabase"
import * as lightTheme from "@/components/uiStyle/styles/light"
import { AppThunk } from "./configureStore";

export enum Auth {

  // Syncs: Supabase -> store
  SYNC_RESET = 'auth/SYNC_RESET',           // reset auth state
  SYNC_START = 'auth/SYNC_START',           // sync started
  SYNC_COMPLETE = 'auth/COMPLETE',          // sync ended
  SYNC_SESSION = 'auth/SYNC_SESSION',       // sync session object 
  SYNC_PROFILE = 'auth/SYNC_PROFILE',       // sync profile object
  SYNC_FAILED = 'auth/SYNC_FAILED',         // failed and toggle off fetching

  // Syncs Auth result
  AUTH_START = 'auth/AUTH_START',            // reset & start
  AUTH_LOGIN = 'auth/AUTH_LOGIN',            // login result from auth
  AUTH_LOGOUT = 'auth/AUTH_LOGOUT',          // reset store after logout

}

type S = { 
  profile: supabase.UserProfile,            // from @/lib/supabase.auth 
  user: User, session: Session,             // from @supabase
  fetching: boolean, error: any             // request status
}
type A = { type: Auth } & Partial<S>
type R = { auth: S }


const initialState = {
  profile: null,
  user: null, session: null,
  error: null, fetching: false, 
}

export default (state = initialState, action: A) => {

  const {type, ...payload} = action

  switch (type) {

    // expected ops: leave with errors cleared
    case Auth.AUTH_LOGIN:  
    case Auth.SYNC_SESSION: case Auth.SYNC_PROFILE:
      // merge deep only one level! eg. `state.profile.friends_ids`: deep merge
      // all keys under state including `profile`, but overwrite `friends_ids`
      // console.log(`???? state.auth [${type}] -> `, payload, 'state=', state)
      return mergeDeep(state, {...payload, error: null}) 


    case Auth.SYNC_START:
      return { ...state, fetching: true }
    case Auth.AUTH_START:
      return { ...initialState, fetching: true }
             
    case Auth.SYNC_COMPLETE: 
      return {...state, fetching: false}
    case Auth.SYNC_FAILED:
      return { ...state, ...payload, fetching: false }

    case Auth.SYNC_RESET: case Auth.AUTH_LOGOUT:
      return initialState
    default:
      return state
  }

}



// Selectors
// ==========================
export const getAuthState = (state: R) => state.auth

export const getAuthStatus = (state: R) => {
  const {fetching, error} = getAuthState(state)
  return {fetching, error} }

export const selectAuthSession = 
  (state: R) => getAuthState(state).session

export const selectIsAuthed = 
  (state: R) => !!getAuthState(state).session?.user

export const selectAuthUser = 
  (state: R) => getAuthState(state).user

export const selectAuthId = 
  (state: R) => getAuthState(state)?.user?.id || null

export const selectAuthProfile =
  (state: R) => getAuthState(state).profile


// Actions
// ==========================


// -- Copy data to store

const syncStart = () => ({ type: Auth.SYNC_START })

const syncComplete = () => ({ type: Auth.SYNC_COMPLETE, fetching: false })

export const syncReset = () => {
  showMessage({ message: "Authentication", type: "success", 
    backgroundColor: lightTheme.theme.colors.primaryButtonBgDown,
    statusBarHeight: 30, description: "Successfully signed out" })
  return { type: Auth.SYNC_RESET } 
}

export const syncSession = (session: Session|null) => ({
   type: Auth.SYNC_SESSION, session })

export const syncFailed = (error: Error) => {
  showMessage({ message: "Authentication", type: "danger", duration: 4000,
    statusBarHeight: 50, description: error?.message })
  return { type: Auth.SYNC_FAILED, error: error.message?? error }
}


// -- Auth/Core: run auth functions

const authStart = () => ({ type: Auth.AUTH_START })

export const authLogin = (user: User) => {
  showMessage({ message: "Authentication", type: "success", 
  backgroundColor: lightTheme.theme.colors.primaryButtonBgDown,
    statusBarHeight: 50, description: "Successfully signed in" })
  return { type: Auth.AUTH_LOGIN, user }
}

export const doAuth = (method: supabase.AuthTypes, data: UserCredentials): 
  AppThunk<Promise<void>> => (dispatch, getState) => {

    dispatch(authStart)
    return method(data)
      .then(({error, user}) => {
        if (user)  { 
          dispatch(authLogin(user))
          dispatch(fetchProfile)
        } else { throw(error)  }
      })
      .catch((e: any) => { dispatch(syncFailed(e)) })
      .finally(() => dispatch(syncComplete))
}

export const signOut: AppThunk<Promise<void>> = 
  (dispatch, getState) => {
    supabase.signOut().then(({error}) => {
      if(error) { throw Error(error) }
      dispatch(syncReset)
    })
    .catch((e: any) => { dispatch(syncFailed(e)) })      
    .finally(() => dispatch(syncComplete))

}



// -- Auth/Profile: run CRUD profile operations
// profiles availabe iff created trigger func to creates profile on user signup
// https://www.youtube.com/watch?v=0N6M5BBe9AE
// https://supabase.com/docs/guides/auth/managing-user-data#advanced-techniques

export const syncProfile = (profile: Partial<supabase.UserProfile>) => ({ 
  type: Auth.SYNC_PROFILE, profile})


export const fetchProfile: AppThunk<Promise<void>> = 
  (dispatch, getState) => {

    const authId = selectAuthId(getState())
    if(!authId) {
      // console.error(`\n--> Auth/fetchProfile(authId=${authId}): 'authId' not defined.`, 
      // `state.auth=`, getState().auth)
      return }

    dispatch(syncStart)
    supabase.fetchUserProfile({userId: authId})
      .then(({ data, error, status }) => { 
        if (error && status !== 406) { throw error }
        if(!error) { dispatch(syncProfile(data)) } else { throw(error) } 
      })
      .catch(e => { dispatch(syncFailed(e)) })
      .finally(() => dispatch(syncComplete))

}

export const updateProfile = (updates: Partial<supabase.UserProfile>)
  : AppThunk<Promise<void>> => (dispatch, getState) => {

    dispatch(syncStart)
    supabase.upsertUserProfile(selectAuthId(getState()), updates)
      .then(({ error }) => { 
        if (error) { throw error } else { 
          dispatch(syncProfile(updates));
        }
      }).catch(e => {
        console.error(e)
        dispatch(syncFailed(e))
      })
      .finally(() => dispatch(syncComplete))
  }

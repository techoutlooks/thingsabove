import { User, UserCredentials, Session } from "@supabase/supabase-js"
import { AuthTypes, UserProfile, fetchUserProfile, upsertUserProfile } from "@/lib/supabase"


export enum Auth {
  RESET = 'auth/RESET',
  START = 'auth/START',
  COMPLETE = 'auth/COMPLETE',
  FAILED = 'auth/FAILED',
  LOGIN = 'auth/LOGIN',
  SYNC_SESSION = 'auth/SYNC_SESSION',
  SYNC_PROFILE = 'auth/SYNC_PROFILE',
}

type S = { 
  profile: UserProfile,           // auth profile
  user: User, session: Session,   // auth core
  fetching: boolean, error: any   // request status
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

    case Auth.LOGIN: case Auth.FAILED: 
    case Auth.SYNC_SESSION: case Auth.SYNC_PROFILE:
      return { ...state, ...payload }

    case Auth.START:
      return { ...state, fetching: true }
    case Auth.COMPLETE: 
      return {...state, fetching: false}
    case Auth.FAILED:
      return { ...state, ...payload, fetching: false }

    case Auth.RESET:
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
  (state: R) => getAuthState(state).user.id

export const selectAuthProfile =
  (state: R) => getAuthState(state).profile


// Actions
// ==========================

// -- Auth/Core

const authStart = () => ({ type: Auth.START })
const authComplete = () => ({ type: Auth.COMPLETE, fetching: false })
export const resetAuth = () => ({ type: Auth.RESET })
export const syncSession = (session: Session|null) => ({ type: Auth.SYNC_SESSION, session })
export const authLogin = (user: User) => ({ type: Auth.LOGIN, user })
export const authFailed = (error: Error) => ({ type: Auth.FAILED, error: error.message })

export const doAuth = (method: AuthTypes, data: UserCredentials) => 
  (dispatch, getState) => {

    dispatch(authStart)
    method(data)
      .then(({error, user}) => {
        if (user)  { 
          dispatch(authLogin(user))
          dispatch(fetchProfile)
        } else { throw(error)  }
      })
      .catch((error: any) => {
        console.error(error)
        dispatch(authFailed(error)) 
      })
}

// -- Auth/Profile

export const syncProfile = (profile: Partial<UserProfile>) => ({ 
  type: Auth.SYNC_PROFILE, profile})

export const fetchProfile = (dispatch, getState) => {

    dispatch(authStart)
    const authId = selectAuthId(getState())
    fetchUserProfile(authId).then(({ data, error, status }) => { 
      if (error && status !== 406) { throw error }
      if(!error) { dispatch(syncProfile(data)) } else { throw(error) } 
      // console.log('--> Auth/fetchProfile(data)', data)
    }).catch(err => {
      console.error(err)
      dispatch(authFailed(err))
    })

}

export const updateProfile = (updates: Partial<UserProfile>) => 
  (dispatch, getState) => {

      dispatch(authStart)
      upsertUserProfile(selectAuthId(getState()), updates)
        .then(({ error }) => { 
          if (error) { throw error } else { 
            dispatch(syncProfile(updates));
            dispatch(authComplete)
          }
        }).catch(err => {
          console.error(err)
          dispatch(authFailed(err))
        })
  }

import { Auth } from './auth'
import { UserProfile } from "@/lib/supabase"
import { mergeDeep } from '@/lib/mergeDeep'
import * as supabase from "@/lib/supabase";
import { showMessage, hideMessage } from "react-native-flash-message";
import { AppThunk } from "./configureStore";



/**
 * Contact aka. the public user profile
 * Not a table, instead made-up fields from the `supabase.UserProfile` table
 */
export type Contact = {
  userId: string, // id == `user.id` == `profile.id`
  username: string, first_name: string, last_name: string,
  about: string,
  avatar: string|string[]|null,
  displayName: string,
  joinedOn: string
}

enum Actions {
  SYNC = 'contacts/SYNC',
  SYNC_START = 'contacts/SYNC_START',
  SYNC_FAILED = 'contacts/SYNC_FAILED',
  SYNC_COMPLETE = 'contacts/SYNC_COMPLETE',
}
type S = {
  contactsByIds: Record<string, Contact>,
  fetching: boolean, error: string|null
}
type A = { type: Actions|Auth } & S

type R = { contacts: S }


// Reducer
// ==========================

const initialState: S = {
  contactsByIds: {},
  fetching: false, 
  error: null
}

/***
 * Extract contact information from user profiles
 * Do NOT store profiles on the mobile !
 */
export default (state: S = initialState, action: A) => {

  switch (action.type) {

    case Actions.SYNC:
      return { ...state, contactsByIds: 
        mergeDeep(state.contactsByIds, action.contactsByIds) }
    case Actions.SYNC_START:
      return { ...state, fetching: true}
    case Actions.SYNC_COMPLETE:
      return { ...state, fetching: false}
    case Actions.SYNC_FAILED:
      const error = typeof action.error === 'string' ? 
        action.error : action.error
      return { ...state, error }

    case Auth.SYNC_RESET:
      return initialState
    default:
      return state
  }
}


// Selectors
// ==========================

export const getContactsState = (state: R) => {
  return state.contacts
}

export const getContactsByIds = (state: R) => {
  return getContactsState(state).contactsByIds
}

export const selectContacts = (userIds?: string[]) => (state: R) => {
  return !userIds?.length?  Object.values(getContactsByIds(state)) :
    userIds?.map(userId => selectContact(userId)(state))
}

export const selectContact = (userId: string) => (state: R) => {
  return getContactsByIds(state)[userId]
}

export const getContactDisplayName = (u: Contact & UserProfile) =>
  u?.displayName ?? 
  ((u?.first_name || u?.last_name) && `${u?.first_name} ${u?.last_name}`) ?? 
  u?.username ?? 'Unkown'

export const getInitials = (name: string) => {
  const strippedName = name.replace(/[#\-\_@]/g, ' ').trim()
  const match = strippedName.match(/^([^\s\\]).*?([^\s\\])?[^\s\\]*$/i)
  if (match != null) {
    return match.slice(1, 3).join('') }
  return null
}

export const getContactAvatar = (profile: UserProfile) => {
  if (profile?.avatar_url) {
    return [profile.avatar_url] }
  const displayName = getContactDisplayName(profile)
  return getInitials(displayName)
}

export const selectContactAvatar = (userId: string) => (state: R) => {
  const contact = selectContact(userId)(state)
  return contact?.avatar?.[0]
}

// Actions
// ==========================

export const syncStart = () => ({ type: Actions.SYNC_START })

export const syncComplete = () => {
  return { type: Actions.SYNC_COMPLETE }
}

export const syncFailed = (error: Error) => {
  showMessage({ message: "Contacts", type: "danger", duration: 4000,
    statusBarHeight: 50, description: error?.message })
  return { type: Auth.SYNC_FAILED, error: error.message?? error }
}

export const syncContacts = (contacts: Contact[] = []) => {
  const contactsByIds: { [id: string]: Contact } = {}
  contacts.forEach(p => { contactsByIds[p.userId] = p })
  showMessage({ message: "Sync success", type: "success", 
    statusBarHeight: 30, description: `Syncing (${contacts.length}) contacts.` })
  return { type: Actions.SYNC, contactsByIds }
}


/*** 
 * Fetch all contacts from TA's directory
 */
export const fetchAll = (dispatch, getState) => 
  fetchContacts()(dispatch, getState)


/***
 * Fetch contacts by their ids or usernames. ,
 * Fetch the entire contacts directory (all TA users) iff userIds/usernames undefined
 */
type fetchContactsArgs = { userIds?: string[], usernames?: string[] }
export const fetchContacts = (opts?: fetchContactsArgs): AppThunk<Promise<Contact[]>> => 
  async (dispatch, getState) => {

    // should fetch contacts by their userId? or their username (the default)?
    // usernames <- the ids and usernames of conacts to fetch
    const { userIds, usernames } = opts ?? {}
    const field = opts && (
      userIds?.length ? "userId" : 
      usernames?.length? "username" : 
      null)
    // const field = opts?.userIds ?? opts?.usernames

    const values = userIds ?? usernames ?? []

    // fetch contacts. returns the entire directory if no id/username supplied
    dispatch(syncStart)
    return new Promise<Contact[]>((resolve) =>  {

      if(!field) {
        supabase.fetchAll([[supabase.PROFILES_TABLE, '*']])
          .then(data => { 
            const contacts = data[supabase.PROFILES_TABLE]
              .map(profile => getContact(profile))
            resolve(contacts);            
          }) 

      } else {
        const contacts$ = values.map( value => 
          supabase.fetchUserProfile({ [field]: value })
            .then(({ data: profile, error, status }) => { 
              if (error && status !== 406) { throw error }
              if (error || profile == null) { throw(error) } else { 
                return getContact(profile) } 
            })
        )
        Promise.all(contacts$)
          .then(contacts => { resolve(contacts) })
      }
    })

      .then(contacts => {
        dispatch(syncContacts(contacts))
        return contacts
      })
      .catch(error => {
        dispatch(syncFailed(error))
        return []
      })
      .finally(() => dispatch(syncComplete))
}

// Utils
// ==========================

/***
 * Extract public info (ie., contact) from profile
 * Do NOT store profiles locally !
 */
 export const getContact = (profile: UserProfile): Contact => {
  return !!profile && {
    userId: profile.id, // is also the `user.id`
    username: profile.username,
    first_name: profile.first_name,
    last_name: profile.last_name,
    about: profile.about,
    joinedOn: profile.created_at,
    displayName: getContactDisplayName(profile),
    avatar: getContactAvatar(profile), 
  } 
}


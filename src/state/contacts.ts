import { Auth } from './auth'
import { UserProfile } from "@/lib/supabase"
import { mergeDeep } from '@/lib/mergeDeep'
import { fetchUserProfile } from "@/lib/supabase"


export type Contact = {
  id: string, // id == `user.id` == `profile.id`
  displayName: string,
  avatar: string|string[]|null,
}

enum Actions {
  SYNC = 'contacts/SYNC',
  SYNC_START = 'contacts/SYNC_START',
  SYNC_FAILED = 'contacts/SYNC_FAILED',
  SYNC_COMPLETE = 'contacts/SYNC_COMPLETE',
}
type S = {
  contactsById: Record<string, Contact>,
  fetching: boolean, error: string|null
}
type A = { type: Actions|Auth } & S

type R = { contacts: S }


// Reducer
// ==========================

const initialState: S = {
  contactsById: {},
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
      return { ...state, contactsById: 
        mergeDeep(state.contactsById, action.contactsById) }
    case Actions.SYNC_START:
      return { ...state, fetching: true}
    case Actions.SYNC_COMPLETE:
      return { ...state, fetching: false}
    case Actions.SYNC_FAILED:
      const error = typeof action.error === 'string' ? 
        action.error : action.error.message
      return { ...state, error }

    case Auth.RESET:
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

export const getContactsById = (state: R) => {
  return getContactsState(state).contactsById
}

export const selectContact = (state: R, userId: string) => {
  return getContactsById(state)[userId]
}

export const getContactDisplayName = (profile: UserProfile) =>
  profile?.username ?? profile?.id ?? 'Unkown'

export const getInitials = (name: string) => {
  const strippedName = name.replace(/[#\-\_@]/g, ' ').trim()
  const match = strippedName.match(/^([^\s\\]).*?([^\s\\])?[^\s\\]*$/i)
  if (match != null) {
    return match.slice(1, 3).join('')
  }
  return null
}

export const getContactAvatar = (profile: UserProfile) => {
  if (profile?.avatar_url != null) {
    return [profile.avatar_url]
  }

  const displayName = getContactDisplayName(profile)
  return getInitials(displayName)
}

export const selectContactAvatar = (userId: string) => (state: R) => {
  const contact = selectContact(state, userId)
  return contact?.avatar?.[0]
}

// Actions
// ==========================

export const syncStart = () => ({ type: Actions.SYNC_START })

export const syncComplete = () => {
  return { type: Actions.SYNC_COMPLETE } }

export const syncFailed = (error: Error) => {
  console.debug(`Error loading profile: `, error)
  return { type: Actions.SYNC_FAILED,  error }
}

export const syncContacts = (contacts: Contact[]) => {
  const contactsById: Record<string, Contact> = {}
  contacts.forEach(p => { contactsById[p.id] = p })
  return { type: Actions.SYNC, contactsById }
}

export const fetchContacts = (userIds: string[]) => 
  (dispatch, getState) => {
  
    dispatch(syncStart)
    const promises = userIds.map(
      userId => fetchUserProfile(userId)
        .then(({ data: profile, error, status }) => { 
          if (error && status !== 406) { throw error }
          if (error || profile == null) { throw(error) } else { 
            return getContact(profile) } 
        })
    )
    Promise.all(promises)
      .then(contacts => dispatch(syncContacts(contacts)))
      .catch(error => dispatch(syncFailed(error)) )
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
    id: profile.id, // is also the `user.id`
    displayName: getContactDisplayName(profile),
    avatar: getContactAvatar(profile), 
  } 
}


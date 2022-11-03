/***
 * Redux reducer for **sharing** functionality.
 * Items shared by/with the currently authenticated user
 * 
 * About the sharings feature :
 *  - No database rel to the user's auth profile. Keeps `supabase.auth` as an indep. lib! 
 *  - The user/sharings relationship is established at load time
 *  - Requires creating a sharings table on Subapase (var SHARINGS_TABLE below). 
 *  - dedicated reducer cache for managing shared content
 *  - useSharings() hook to fetch/set shared items from/to Redux/Supabase
 */
 import { showMessage, hideMessage } from "react-native-flash-message";

import { UserProfile } from "@/lib/supabase"
import { mergeDeep } from '@/lib/mergeDeep'
import * as supabase from "@/lib/supabase";
import { SharedItem, ItemTypes, Sharing } from "@/types/Prayer"

import { AppThunk } from "./configureStore";
import { Auth } from './auth'
import { Contact } from "./contacts"

 
const SHARINGS_TABLE = "sharings"

/***
 * Universal datastructure that represent an item to be shared
 * with one's contacts. For converting to table row (SHARINGS_TABLE)
 * using the `toSharing()` util.
 * @param item: item to share, eg. Prayer, etc.
 * @param userId: from user
 * @param contactsIdsTo: contacts whom to send item
 */
export type SharingInput = { 
  item: SharedItem, itemType: ItemTypes, 
  userId: string, contactsIdsTo: string[] 
}

enum Actions {
  SYNC = 'sharedContent/SYNC',
  SYNC_START = 'sharedContent/SYNC_START',
  SYNC_FAILED = 'sharedContent/SYNC_FAILED',
  SYNC_COMPLETE = 'sharedContent/SYNC_COMPLETE',
}

type S = {
  sharingsByUserIds: { [userId: string]: Sharing[] },
  fetching: boolean, error: string|null
}
type A = { type: Actions|Auth } & S
type R = { sharings: S }


// Reducer
// ==========================

const initialState: S = {
  sharingsByUserIds: {},
  fetching: false, error: null
}

/***
 * Extract contact information from user profiles
 * Do NOT store profiles on the mobile !
 */
export default (state: S = initialState, action: A) => {

  switch (action.type) {

    case Actions.SYNC:
      return { ...state, contentsByIds: 
        mergeDeep(state.sharingsByUserIds, action.sharingsByUserIds) }
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

export const getSharingsState = (state: R) => {
  return state.sharings
}

export const getSharingsByUserIds = (state: R, itemType: ItemTypes) => {
  const sharingsByUserIds = getSharingsState(state).sharingsByUserIds
  return !itemType ? sharingsByUserIds : Object.fromEntries(Object.entries(sharingsByUserIds)
    .map(([userId, sharings]) => [userId, sharings.filter(s => itemType==s.item_type)]))
}

export const selectSharingsSent = (userId: string, itemType: ItemTypes) => 
(state: R) => (userId && getSharingsByUserIds(state, itemType)?.[userId]) || []

export const selectSharingsReceived = (userId: string, itemType: ItemTypes) => 
  (state: R) => Object.values(getSharingsByUserIds(state, itemType))
    .flatMap(sharing => sharing).filter(({user_id}) => user_id!=userId)


// Actions
// ==========================

export const syncStart = () => ({ type: Actions.SYNC_START })

export const syncComplete = () => {
  showMessage({ message: "Sync success", type: "success", 
    statusBarHeight: 30, description: "Sharings(s) sync complete." })
  return { type: Actions.SYNC_COMPLETE }
}

export const syncFailed = (error: Error) => {
  showMessage({ message: "Contacts", type: "danger", duration: 4000,
    statusBarHeight: 50, description: error?.message })
  return { type: Auth.SYNC_FAILED, error: error.message?? error }
}

/***
 * Syncs sharings to storage, applying first following mapping:
 * sharings -> sharings by userId
 */
export const sync = (items: Sharing[] = []) => {
  const sharingsByUserIds: S['sharingsByUserIds'] = {}
  items.forEach(item => { 
    const old = sharingsByUserIds[item.user_id] ?? []
    sharingsByUserIds[item.user_id] = [...old, item]  })
  return { type: Actions.SYNC, sharingsByUserIds }
}


/*** 
 * Fetch all sharings by AND to the given user 
 * calls sync() that applies transform: sharings -> sharings by userId,
 * before syncing to redux.
 */
export const fetchAll = (userId: string): AppThunk<void> => 
(dispatch, getState) => {
  const sent$ = fetch(userId)(dispatch, getState)
  const received$ = fetch(userId, true)(dispatch, getState)
  return Promise.all([sent$, received$])
    .then(([sent, received]) => {
      const sharings = [...sent, ...received]
      dispatch(sync(sharings))
    })
    .catch(error => { dispatch(syncFailed(error)) })
    .finally(() => dispatch(syncComplete)) 
}

/***
 * Fetch items sent (the default) or received by the given user
 * @param reversed: iff true, get items shared with the user 
 */
export const fetch = (userId: string, reversed=false): AppThunk<Promise<Sharing[]>> => 
async (dispatch, getState) => {

  const filter = reversed ? 
    {contains: ['to_users_ids', [userId]]} :
    { eq: ['user_id', userId] } 

  dispatch(syncStart)
  return supabase.fetchAll<Sharing>([[ SHARINGS_TABLE, "*", filter ]])
    .then(({[SHARINGS_TABLE]: data}) => data)
}
 
/***
 * Persist shared item to the backend 
 * after suitable conversion from input 
 */
 export const upsert = 
 (inputs: SharingInput[]): AppThunk<void> => 
   async (dispatch, getState) => {
    const sharings = inputs.map(toSharing)

    dispatch(syncStart)
    supabase.upsertMany(SHARINGS_TABLE, sharings)
      .then(sharings => { dispatch(sync(sharings)) })
      .catch(e => { dispatch(syncFailed(e as Error)) })
      .finally(() => dispatch(syncComplete))
 }

/***
 * Generates sharing items suitable for saving to the database,
 * from raw data.
 */
export const toSharing = 
({ item, itemType, userId, contactsIdsTo }: SharingInput): Sharing => {
  const now = new Date().toISOString()
  return {
    id: item.id, item_type: itemType,
    user_id: userId, to_users_ids: contactsIdsTo, 
    updated_at: now, ...{created_at: item?.id ? undefined: now} 
  }
}
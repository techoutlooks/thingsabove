/***
 * Redux reducer for **sharing** functionality.
 * Items shared by/with the currently authenticated user
 * 
 * About the sharings feature :
 * 
 *  - Assumes exists `SHARINGS_TABLE` on Supabase with RLS disabled.
 *    That table holds the relationships between the item shared (`item_id`, `item_type`), 
 *    the sender (`user_id`), the recipients (`to_users_ids`), along with metadata.
 *    Every table row corresponds to one item being (re)shared no matter to whom 
 *    (always INSERTing, no UPDATE)
 * 
 *  - Assumes no database relationship to the user's auth profile. 
 *    Enables keeping the code at `lib/supabase.auth` as an independent library.
 * 
 *  - The user/sharings relationship is established at load time
 * 
 *  - At the core of the sharing functionality is a dedicated reducer cache,
 *    with primitives for managing the shared items, and a the useSharings() hook 
 *    for fetching/saving the shared items from/to Redux/Supabase
 */

 import { showMessage, hideMessage } from "react-native-flash-message";

 import { mergeDeep } from '@/lib/mergeDeep'
 import * as supabase from "@/lib/supabase";
 import { Shareable, ItemTypes, Sharing } from "@/types/models"
 
 import { AppThunk } from "./configureStore";
 import * as auth from './auth'
 
  
 const SHARINGS_TABLE = "sharings"
 
 export enum DirectionTypes { RECEIVED, SENT }
 
 
 /***
  * Universal datastructure that represent an item to be shared
  * with one's contacts. For converting to table row (SHARINGS_TABLE)
  * using the `toSharing()` util.
  * @param item: item to share, eg. Prayer, etc.
  * @param userId: from user
  * @param contactsIdsTo: contacts whom to send item
  */
 export type SharingInput = { 
   item: Shareable, itemType: ItemTypes, 
   userId: string, contactsIdsTo: string[] 
 }
 
 enum Actions {
   SYNC = 'sharings/SYNC',
   SYNC_START = 'sharings/SYNC_START',
   SYNC_FAILED = 'sharings/SYNC_FAILED',
   SYNC_COMPLETE = 'sharings/SYNC_COMPLETE',
   RESET = 'sharings/RESET',          
 }
 
 type S = {
   sharingsByUserIds: { [userId: string]: Sharing[] },
   fetching: boolean, error: string|null
 }
 type A = { type: Actions } & S
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
       return { ...state, sharingsByUserIds: 
         mergeDeep(state.sharingsByUserIds, action.sharingsByUserIds) }
     case Actions.SYNC_START:
       return { ...state, fetching: true}
     case Actions.SYNC_COMPLETE:
       return { ...state, fetching: false}
     case Actions.SYNC_FAILED:
       const error = typeof action.error === 'string' ? 
         action.error : action.error
       return { ...state, error }
 
     case Actions.RESET:
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
   (state: R) => {
    const r = Object.values(getSharingsByUserIds(state, itemType))
     .flatMap(sharings => sharings)
     .filter(({to_users_ids}) => to_users_ids.includes(userId))
     console.log(`selectSharingsReceived(${userId}) -> `, r)
     return r

   }
 
 
 
 // Actions
 // ==========================
 
 export const syncStart = () => ({ type: Actions.SYNC_START })
 
 export const syncComplete = () => ({ type: Actions.SYNC_COMPLETE })
 
 export const syncFailed = (error: Error) => {
   console.error(`redux/sharings.syncFailed() :`, error)
   showMessage({ message: "Contacts", type: "danger", duration: 4000,
     statusBarHeight: 50, description: error?.message })
   return { type: SYNC_FAILED, error: error.message?? error }
 }
 
 /***
  * Syncs sharings to storage, applying first following mapping:
  * sharings -> sharings by userId
  */
 export const sync = (items: Sharing[] = []) => {
 
  //  console.log(`redux/sharings.sync() :`, items)
   const sharingsByUserIds: S['sharingsByUserIds'] = {}
   items.forEach(item => { 
     const old = sharingsByUserIds[item.user_id] ?? []
     sharingsByUserIds[item.user_id] = [...old, item]  })
 
   showMessage({ message: "Sync success", type: "success", 
     statusBarHeight: 30, description: `Shared (${items.length}) item(s) .` })
 
   return { type: Actions.SYNC, sharingsByUserIds }
 }
 
 
 /*** 
  * Fetch all sharings by AND to the given user 
  * calls sync() that applies transform: sharings -> sharings by userId,
  * before syncing to redux. 
  * Nota: requires `store.auth` being intialized!
  * */
 export const fetchUserSharings =  (userId: string): AppThunk<void> => (dispatch, getState) => {

  const sent$ = fetch(userId, DirectionTypes.SENT)(dispatch, getState)
  const received$ = fetch(userId, DirectionTypes.RECEIVED)(dispatch, getState)
  return Promise.all([sent$, received$])
    .then(([sent, received]) => {
    // console.log(`-> sharings.fetchUserSharings(authId=${userId}) sent=`,sent, `received=`,received)
      const sharings = [...sent, ...received]
      dispatch(sync(sharings))
    })
    .catch(error => { dispatch(syncFailed(error)) })
    .finally(() => dispatch(syncComplete)) 
 }
 
/***
* Fetch items sent (the default) or received by the given user
* @param direction: iff true, get items shared with the user  */
export const fetch = (userId: string, direction: DirectionTypes): AppThunk<Promise<Sharing[]>> => 
async (dispatch, getState) => {

  const filter = direction==DirectionTypes.RECEIVED ? 
    {contains: ['to_users_ids', [userId]]} :
    { eq: ['user_id', userId] } 

  dispatch(syncStart)
  return supabase.fetchAll<Sharing>([[ SHARINGS_TABLE, "*", filter ]])
    .then(({[SHARINGS_TABLE]: data}) => data)
}
  
/***
* Persist shared item to the backend 
* after suitable conversion from input  */
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
* From raw data (`SharingInput`), generates shared items (`Sharing` instance) 
* suitable for saving to the database. */
export const toSharing = 
({ item, itemType, userId, contactsIdsTo }: SharingInput): Sharing => {
  const now = new Date().toISOString()
  return ({ // omitting id -> INSERT 
    item_id: item.id, item_type: itemType,
    user_id: userId, to_users_ids: contactsIdsTo, 
    updated_at: now, ...{created_at: item?.id ? undefined: now} 
  } as Sharing)
}
 
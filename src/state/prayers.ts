import { showMessage, hideMessage } from "react-native-flash-message";

import { RecordedItem } from "@/components/audio-recorder/lib";
import Prayer, {PrayerInput, Team, Room, Category, Topic} from "@/types/Prayer";

import {mergeDeep} from "@/lib/mergeDeep";
import * as _ from "lodash"
import * as supabase from "@/lib/supabase";
import * as storage from "@/lib/storage"
import { AppThunk } from './configureStore';

enum SyncTablesTypes { 'categories', 'topics', 'teams', 'prayers', 'rooms' }
const syncTables = Object.keys(SyncTablesTypes).filter(x => !(parseInt(x) >= 0))

// Reducer
export enum Actions {
  SYNC_START = 'prayers/SYNC_START',
  SYNC_FAILED = 'prayers/SYNC_FAILED',
  SYNC_COMPLETE = 'prayers/SYNC_COMPLETE',
  SYNC = 'prayers/SYNC'
}

// R: partition of root state, S: this state, A: action
type S = { 
  fetching: boolean, error: string|null,
  prayers: Prayer[],teams: Team[], rooms: Room[], topics: Topic[], categories: Category[] }

type R = {prayers: S, contacts: any} 
type A = { type: Actions } & Partial<S>
const initialState: S = {
  fetching: false, error: null,
  categories: [],
  teams: [],
  rooms: [],
  prayers: [],
  topics: []
}


const reducer = (state = initialState, action: A) => {
    const {type, ...payload} = action

    switch (action.type) {
      case Actions.SYNC:
        // return mergeDeep(state, payload) 
        return _.merge({}, state, payload)
      case Actions.SYNC_FAILED:
        return { ...state, ...payload, }
      case Actions.SYNC_START: 
        return {...state, fetching: true}
      case Actions.SYNC_COMPLETE: 
        return {...state, fetching: false}
      default:
        return state
    }
}

export default reducer

// Actions
// ==========================

export const syncStart = () => ({ type: Actions.SYNC_START }) 

export const syncFailed = (error: Error) => {
  console.error('prayers/syncFailed > ', error)
  showMessage({ message: "Sync failed", type: "danger",
    statusBarHeight: 30, description: "Prayer not synced due to an error!" })
  return { type: Actions.SYNC_FAILED, error: error.message} }

export const syncComplete = () => {
  showMessage({ message: "Sync success", type: "success", 
    statusBarHeight: 30, description: "Prayer(s) sync complete." })
  return { type: Actions.SYNC_COMPLETE } }

export const sync = (data: Partial<S>) => {
  // console.debug('--> prayers/sync', data)
  return { type: Actions.SYNC, ...data } }


/***
 * Fetch/listen RT data from server
 */
export const fetchAll = async (dispatch, getState) => {
  dispatch(syncStart)
  supabase.fetchAll(syncTables.map(t => [t, "*"]))
    .then(data => dispatch(sync(data)))
    .catch(error => { dispatch(syncFailed(error)) })
    .finally(() => dispatch(syncComplete)) 
}

/***
 * syncChanges
 * Merge RT row changes from the database into the store
 */
export const syncChanges = (dispatch, getState) => {
  dispatch(syncStart)
  syncTables.forEach(table => {
    supabase.on<Prayer>({ table }).subscribe({
      next: data => dispatch(sync(data)) ,
      error: error => dispatch(syncFailed(error)),
      complete: () => dispatch(syncComplete)
    })
  })
}

/***
 * **savePrayers()**
 * Save a prayer instance from `PrayerInput` data to the backend. 
 * A new prayer is INSERTed iff prayer.id==null|undefined
 */
export const savePrayers = 
(data: PrayerInput<RecordedItem>[]):  AppThunk<Promise<Prayer[]>> => 
  async (dispatch, getState) => {
    const prayers = await Promise.all(data.map(toPrayer))
    return await dispatch(upsertPrayers(prayers))
}

/***
 * **upsertPrayers()**
 * Save prayer instance to the backend. 
 */
export const upsertPrayers = 
(prayers: Prayer[]): AppThunk<Promise<Prayer[]>> => 
  async (dispatch, getState) => {
    dispatch(syncStart)
    try {
      return await Promise.all(prayers.map(prayer => 
        supabase.upsert(supabase.PRAYERS_TABLE, prayer)
          .then(prayer => {
            dispatch(sync({prayers: [prayer]}))
            return prayer
          })
      ))
    } catch(e) {
      dispatch(syncFailed(e as Error))
      return []
    } finally {
      dispatch(syncComplete)
    }
}


// Selectors
// ==========================

export const getPrayersState = (state: R) =>
  state.prayers

export const getStatus = (state: R) => {
  const {fetching, error} = getPrayersState(state)
  return {fetching, error} 
}

export const selectCategories = (state: R) =>
  getPrayersState(state).categories

export const selectTopics = (state: R) =>
  getPrayersState(state).topics

export const getTopics = (state: R) =>
  selectTopics(state).map(({name}) => name)

export const selectPrayers = (state: R) =>
  getPrayersState(state).prayers

export const selectTeams = (state: R) =>
  getPrayersState(state).teams

/***
 * **selectPrayerById()**
 * Expand Prayer by its id
 * @returns Prayer
 */
export const selectPrayerById = (prayerId: string) => 
  (state: R) => selectPrayers(state).find(({id}) => prayerId == id)

/***
 * **selectPrayersByTeamId()**
 * Get all prayers by team (teamId)
 * @returns Prayer
 */
 export const selectPrayersByTeamId = (state: R, teamId: string) =>
    selectPrayers(state).filter(({team_ids}) => team_ids?.includes(teamId));

/***
 * **selectPrayersByUserId()**
 * Get all prayers by user (userId)
 * @returns Prayer
 */
 export const selectPrayersByUserId = (userId: string) => (state: R) =>
    selectPrayers(state).filter(({user_id}) => user_id == userId);

/***
 * **selectUsersByPrayerIds()**
 * Get ids of respective users associated (1-to-1) with prayers
 @returns string|undefined
 */
 export const selectUsersByPrayerIds = (prayerIds: string[]) => (state: R) =>
    (prayerIds ?? []).map(prayerId => 
      ({[prayerId]: selectPrayerById(prayerId)(state)?.user_id})) 

 /***
 * **selectTeamById()**
 * Expand team by its id
 * @returns Team
 */
  export const selectTeamById = (teamId: string) => (state: R) =>
    selectTeams(state).find(({id}) => teamId == id)
 
/***
 * **selectTeamsByPrayerId()**
 * Get teams where prayer (prayerId) has been prayed/posted
 * if yields undefined, user is regular `friend` (belongs to no team, yet).
 * @returns Team[]
 */
 export const selectTeamsByPrayerId = (state: R, prayerId: string) =>
  selectTeams(state).filter(({id}) => 
    selectPrayerById(prayerId)(state)?.team_ids?.includes(id))

export const getPrayersByCategory = (state: R) => 
  selectCategories(state)?.map(({title, prayer_ids}) => ({        // expand prayers from resp. ids in each category
    [title]: selectPrayers(state)?.filter(                        // one dict per category
      prayer => prayer_ids?.includes(prayer.id))
  })).reduce((s, v) => ({...s, ...v}), {})                        // merge dicts 

  
export const getPrayersByTopic = ({published}: {published: boolean}) => 
  (state: R) => getTopics(state).map(topic => ({
    [topic]: selectPrayers(state)?.filter(
      p => !!p.published && p.topics?.includes(topic))
  })).reduce((s,v) => ({...s, ...v}), {})

    

// Funcs
// ==========================


/***
 * toPrayer()
 * Get Prayer from PrayerInput, after all recordings uploaded.
 * Returns prayer object ready for upsertion to supabase.
 * Was necessary to upload prayers first, that the paths of recordings inside
 * of supabase's bucket may be set as the `audio_urls` in the Prayer object.
 */
 export const toPrayer = (data:PrayerInput<RecordedItem>) => {
    
  let { prayerId, title, description, picture_urls,
    recordings, userId, teamId, roomId, topics, published } = data

  return new Promise<Prayer>((resolve, reject) => {

    // computed fields
    const now = new Date().toISOString()
    const duration = recordings.reduce((d, r) => d + r.duration, 0)
    let audios = recordings.reduce((u, r) => [...u, r.uri], ([] as string[]))
    
    // set some defaults 
    description = description || 
    `(${audios.length}) prayers (${duration})s  prayed on ${now}.`

    // resolve prayer after all audios were uploaded
    // resolved prayer's `.audio_urls` to contain paths of uploaded audios
    Promise.all(audios.map(uri => 
      storage.upload({uri, contentType: 'audio/m4a'}, supabase.AUDIOS_BUCKET))
    )
      .then(audio_urls => {
        resolve ({
          id: prayerId,
          user_id: userId,
          title, audio_urls, duration, is_recording: false,
          team_ids: teamId ? [teamId]: [], room_id: roomId,
          description, topics, picture_urls,
          published,
          updated_at: now,
          ...(prayerId ? {} : {created_at: now} ),
        } as Prayer)
      })

  })
}


        

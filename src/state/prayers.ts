import { RecordedItem } from "@/components/audio-recorder/lib";
import Prayer, {PrayerInput, Team, Room, Category, Topic} from "@/types/Prayer";
import { selectContact } from "@/state/contacts";

import {mergeDeep} from "@/lib/mergeDeep";
import * as _ from "lodash"
import * as supabase from "@/lib/supabase";
import * as storage from "@/lib/storage"

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
        return { ...state, ...payload, fetching: false }
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
  return { type: Actions.SYNC_FAILED, error: error.message} }

export const syncComplete = () => {
  return { type: Actions.SYNC_COMPLETE } }

export const sync = (data: Partial<S>) => {
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
 * Merge RT row changes from the database.
 */
export const syncChanges = (dispatch, getState) => {
  dispatch(syncStart)
  syncTables.forEach(table => {
    supabase.on<S>({ table }).subscribe({
      next: data => dispatch(sync(data)) ,
      error: error => dispatch(syncFailed(error)),
      complete: () => dispatch(syncComplete)
    })
  })
}

/***
 * **savePrayer()**
 * Save prayer to backend. new prayer iff prayer.id==null|undefined
 */
export const savePrayers = (data:PrayerInput<RecordedItem>[]) => 
  async (dispatch, getState) => {

    dispatch(syncStart)
    try {
      const errors = ([] as string[])
      const prayers = await Promise.all(data.map(p => toPrayer(getState(), p)))
      await Promise.all(prayers.map(prayer => 
        supabase.upsert(supabase.PRAYERS_TABLE, prayer)
          .then(({error}) => { error && errors.push(error.message) })
      ))

      if(!!errors.length) { 
        const msgs = errors.join('\n')
        dispatch(syncFailed(new Error(msgs))) 
      } else {
        dispatch(sync({prayers}))
      }
    } catch(e) {
      console.error('--> prayers/savePrayers', e.message)
      dispatch(syncFailed(e))
    }
}


// Selectors
// ==========================

export const getPrayersState = (state: R) =>
  state.prayers

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

export const getPrayersByCategory = (state: R) => {
  const categoriesExt =  selectCategories(state)
    .map(({title, prayer_ids}) => ({            // expand prayers from resp. ids in each category
      [title]: selectPrayers(state)?.filter(    // one dict per category
                prayer => prayer_ids?.includes(prayer.id))
    }))
  return categoriesExt.reduce(                  // merge dicts
    (s, v) => ({...s, ...v}), {})
}

export const getPrayersByTopic = (state: R) => {
  return getTopics(state).map(topic => ({
    [topic]: selectPrayers(state)?.filter(p => p.topics.includes(topic))
  })).reduce((s,v) => ({...s, ...v}), {})

}

/***
 * **selectPrayerById()**
 * Expand Prayer by its id
 * @returns Prayer
 */
export const selectPrayerById = (state: R, prayerId: string) =>
    selectPrayers(state).find(({id}) => prayerId == id)

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
      ({[prayerId]: selectPrayerById(state, prayerId)?.user_id})) 

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
    selectPrayerById(state, prayerId)?.team_ids?.includes(id))



// Funcs
// ==========================


/***
 * Get Prayer from input data.
 * Many recordings possible per prayer. 
 */
export const toPrayer = (state: R, data:PrayerInput<RecordedItem>) => {
    
  let {prayerId, title, description, picture_urls,
    recordings, userId, teamId, roomId, topics } = data

  return new Promise<Prayer>((resolve, reject) => {

    // computed fields
    const created_at = new Date().toLocaleString()
    const duration = recordings.reduce((d, r) => d + r.duration, 0)
    const profile = selectContact(state, userId)
    let audios = recordings.reduce((u, r) => [...u, r.uri], ([] as string[]))

    // following fields obviously require further input 
    // from user or ML pipeline. setting defaults for now
    // topics as labels to drive the ML classifier (backend job)
    description = description || 
      `(${audios.length}) prayers (${duration})s 
      by ${profile?.displayName} prayed on ${created_at}.`

    // resolve prayer after all audios were uploaded
    Promise.all(audios.map(uri => 
      storage.upload({uri, contentType: 'audio/m4a'}, supabase.AUDIOS_BUCKET))
    )
      .then(audio_urls => {
        resolve ({
          id: prayerId,
          user_id: userId,
          title, audio_urls, duration, created_at, is_recording: false,
          team_ids: teamId ? [teamId]: [], room_id: roomId,
          description, topics, picture_urls
        })
      })

  })
}
        

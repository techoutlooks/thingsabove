import { Observable } from "rxjs"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, RealtimeSubscription, UserCredentials } from '@supabase/supabase-js'
import { SupabaseEventTypes } from '@supabase/supabase-js/dist/module/lib/types';


const SUPABASE_URL = "https://izzjoyxiblbivyvhwdzd.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6empveXhpYmxiaXZ5dmh3ZHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA1NTk4NjAsImV4cCI6MTk3NjEzNTg2MH0.Bd6u3-BIpfF12tjWnYEzOM-OoHFbAoEpY6oEhR9utE4"

const supabaseUrl = SUPABASE_URL
const supabaseAnonKey = SUPABASE_KEY


export const client = createClient(supabaseUrl, supabaseAnonKey, {
  localStorage: AsyncStorage as any,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
})

/**
 * SignUp & createProfile
 * @param credentials 
 * @returns 
 */
export async function signUp(credentials: Pick<UserCredentials, 'email'|'password'>) {
  const { user, error } = await client.auth.signUp(credentials)
  return {user, error}
}

export async function signIn(credentials: UserCredentials) {
  const { user, error } = await client.auth.signIn(credentials)
  return {user, error}
}

export async function signOut() {
  const { error } = await client.auth.signOut()
  return { error}
}


/***
 * Base Supabase table model for apps based on this lib
 * Represents a table row.
 */
export interface Model {
  id: string
  created_at?: string
  updated_at: string
}


/***
 * UPSERT a singe row into table, ie.,
 * UPDATE row matching `id` iff primary key `id` is present and defined
 * on the `updates` payload; INSERT otherwise.
 */
// export async function upsert<T extends {id: string}>(table: string, updates: Partial<T>) {
//   let {id, ..._updates} = updates   // supabase id field is non-nullable
//   _updates = { ...(!!id? updates : _updates), updated_at: new Date() }
//   const { error } = await client.from(table).upsert(_updates, {
//     returning: 'minimal',           // Don't return the value after inserting
//   })
//   return { error }
// }
export async function upsertOne<T extends Model>
(table: string, update: Partial<T>) {

  let {id, ..._update} = update               
  _update = {  
    ...(!!id ? update : _update),   // drop `id` of undefined or null (triggers an INSERT) 
    ...(!!id ? {} : ('created_at'   // iff INSERT, also set `created_at` if not supplied
      in _update ? {} : {created_at: new Date().toISOString()} ))
  }
  const { data, error } = await client.from(table).upsert(_update)
  if(error) { throw Error(error.message) }
  return (data && data[0] as T)
}

// testing
export async function upsertMany<T extends Model>
(table: string, updates: Partial<T>[]) {

  const _updates = updates.map(update => {
    let {id, ..._update} = update               
    return {  
      ...(!!id ? update : _update),   // drop `id` of undefined or null (triggers an INSERT) 
      ...(!!id ? {} : ('created_at'     // iff INSERT, also set `created_at` if not supplied
        in _update ? {} : {created_at: new Date().toISOString()} ))
    }
  })
  const { data, error } = await client.from(table).upsert(_updates)
  console.log(`->>>>>>>> [${table}] updates=`, _updates, 'data=', data, 'error=', error)

  if(error) { throw Error(error.message) }

  return (data as T[])
}



/***
 * fetchAll()
 * Fetch data from tables. Optionally apply per-table rows filtering.
 * using the `query` arg. Yields  {table1: [row1, ...], ...}
 * @param table: table to select from
 * @param select: select statement (parameterized query)
 * @param filter: paramters for query
 * https://supabase.com/docs/reference/javascript/using-filters
 */
type FieldValue = [string, string]
type FilterOpts = { eq?: FieldValue, contains?: [string, string[]] }
type fetchAllArgs = [table: string, select?: string, filter?: FilterOpts][]

export async function fetchAll<T extends Model>(args: fetchAllArgs) {
  const data: { [table: string]: T[] } = {}
  const promises = args.map(([table, select, filter]) => {

    let query = client.from<T>(table).select(select)
    if(filter?.eq) { query = query.eq(...filter.eq) } 
    if(filter?.contains) { query = query.contains(...filter.contains) } 
    return query
  })

  await Promise.all(promises)
    .then(r => r.forEach(({data: rows, error}, i) => {
      const table = args[i][0]
      data[table] = rows ?? []
    }))
  
  return data
} 

/***
 * OnCallback. Called with changes or custom query results
 * Cf. OnTablesChanges
 */
type OnCallback<T> = (data: T) => void

/***
 * OnTablesChanges
 * @param event: database operation to listen to
 * @param tables: tables to spy for changes
 * @param query: if present, return data from custom SELECT query 
 *    instead of the tables changes payloads
 */
type OnTablesChanges = {
  event?: SupabaseEventTypes, 
  table: string, 
  query?: string
}

/***
 * on()
 * Yield to data changes from database table. Returns dict of 
 * table/updates (default) or; dict/rows matching `query` iff defined
 * ie., {table1: [row1, ...], ...}

 * FIXME: pagination, cursors, ... !
 */
export function on<T>(
  { event="*", table, query }: OnTablesChanges) {

    return new Observable<{[table: string]: T[]}>(observer => {

      const sub = client.from(table)
        .on(event, async (payload) => {
          const {data, error} = query ? 
            await client.from<T>(table).select(query) : 
            { data: [(payload['new'] as T)] , error: null }
          if(error) observer.error(error) 
            observer.next({[table]: data ?? []})
        })
        .subscribe()
      return () => client.removeSubscription(sub)

    })
}

/***
 * Get public url of file on bucket
 * @param {string} path: full path to file on bucket; eg. "avatars/me.jpg" 
 * @returns {Promise<string|null>}: eg. https://xxxx.supabase.co/storage/v1/object/public/avatars/me.jpg
 */
 export const getPublicUrl = (path: string) => {

  const bucket = path.slice(0, path.lastIndexOf('/')) 
  const fileName = path.slice(path.lastIndexOf('/') + 1)

  return new Promise<string|null>((resolve, reject) => {
    const {error, publicURL} = client.storage.from(bucket)
      .getPublicUrl(fileName) // orignal api is synchronous!
      if(!!error) { reject(error)}
    resolve(publicURL)
  })
}


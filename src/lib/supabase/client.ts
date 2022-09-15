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

export async function signIn(credentials: UserCredentials) {
  const { user, error } = await client.auth.signIn(credentials)
  return {user, error}
}

/***
 * UPSERT a singe row into table, ie.,
 * UPDATE row matching `id` iff primary key `id` is present and defined
 * on the `updates` payload; INSERT otherwise.
 */
export async function upsert<T extends {id: string}>(table: string, updates: Partial<T>) {
  let {id, ..._updates} = updates   // supabase id field is non-nullable
  _updates = { ...(!!id? updates : _updates), updated_at: new Date() }
  const { error } = await client.from(table).upsert(_updates, {
    returning: 'minimal',           // Don't return the value after inserting
  })
  return { error }
}

/***
 * fetchAll()
 * Fetch data from tables. Optionally filter row per-table 
 * using the `query` arg. Yields  {table1: [row1, ...], ...}
 */
type fetchAllArgs = [table: string, query?: string][]

export async function fetchAll(args: fetchAllArgs) {
  const data: Record<string, any> = {}
  const promises = args.map(
    ([table, query]) => client.from(table).select(query))

  await Promise.all(promises)
    .then(r => r.forEach(({data: rows, error}, i) => {
      const table = args[i][0]
      data[table] = rows
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
type OnTablesChanges<T> = {
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
export function on<T extends  Record<string, any>>(
  { event="*", table, query }: OnTablesChanges<T>) {

    return new Observable<T>(observer => {
      
      const sub = client.from(table)
        .on(event, async (payload) => {
          const {data, error} = query ? 
            await client.from(table).select(query) : 
            { data: payload['new'] , error: null }
          if(error) observer.error(error)
          observer.next({[table]: data})
        }).subscribe()

      return () => client.removeSubscription(sub)
    })
  }

/***
 * Get public url of file on bucket
 * eg. "avatars/me.jpg" 
 * -> https://xxxx.supabase.co/storage/v1/object/public/avatars/me.jpg
 */
 export const getPublicUrl = (path: string) => {

  const bucket = path.slice(0, path.lastIndexOf('/')) 
  const fileName = path.slice(path.lastIndexOf('/') + 1)

  return new Promise<{publicURL: string|null}>((resolve, reject) => {
    const {error, publicURL} = client.storage.from(bucket)
      .getPublicUrl(fileName) // orignal api is synchronous!
      if(!!error) { reject(error)}
    resolve({publicURL})
  })
}

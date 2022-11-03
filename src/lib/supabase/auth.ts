import { UserCredentials } from "@supabase/supabase-js"
import * as supabase from "./client"
import * as constants from "./constants"


// Auth / Profile
// ==========================


export type UserProfile = {
    id: string
    updated_at: string,
    created_at: string,
    username: string,
    first_name: string,
    last_name: string,
    about: string,
    avatar_url: string
    web_url: string,

    // data out of auth's scope. just point to it 
    // TODO: make them optional, feg., 
    //  - get the friends_ids from db lookup instead of static db rel. 
    //  - create extentable UserProfile
    friends_ids: string[],  
}


export async function fetchUserProfile({userId, username}: 
  { userId?: string } & Partial<Pick<UserProfile, 'username'>>) {

    const filter = {
      ...(userId ? { id: userId} : {}), 
      ...(username ? { username } : {}) }
    
    const { data, error, status } = await supabase.client
      .from<UserProfile>('profiles')
      .select( // make sure to specify all fields from `UserProfile`
        `id, username, first_name, last_name, web_url, avatar_url, 
        friends_ids, created_at, updated_at, about` )
      .match(filter)
      .single()
    return { data, error, status }
}

export async function upsertUserProfile(
  authId: string, updates: Partial<UserProfile>) {
  return supabase.upsertOne(constants.PROFILES_TABLE, {    
    ...updates, id: authId })             // do NOT trust id supplied by caller !
}


// Auth
// ==========================

export type AuthTypes = typeof signInWithEmail | typeof signUpWithEmail | 
  typeof signInWithProvider

export async function signInWithEmail({email, password}: UserCredentials) {
  return supabase.signIn({email, password })    
}
    
export async function signUpWithEmail({email, password}: UserCredentials) {
  return supabase.signUp({email, password })
}    

export async function signInWithProvider({provider}: UserCredentials) {
  return await supabase.signIn({provider })
}

export async function signOut() { 
  return supabase.signOut() 
}

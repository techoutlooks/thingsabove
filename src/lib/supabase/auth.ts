import { UserCredentials } from "@supabase/supabase-js"
import * as supabase from "./client"
 

// Auth / Profile
// ==========================

export type UserProfile = {
    id: string
    updated_at: string,
    created_at: string,
    username: string,
    first_name: string,
    last_name: string,
    avatar_url: string
    web_url: string,
}


export async function fetchUserProfile(userId: string) {
  const { data, error, status } = await supabase.client
    .from<UserProfile>('profiles')
    .select(
      `id, username, first_name, last_name, web_url, avatar_url, 
      created_at, updated_at` )
    .eq('id', userId)
    .single()
  return { data, error, status }
}

export async function upsertUserProfile(
  authId: string, updates: Partial<UserProfile>) {
  return supabase.upsert('profiles', {    // do NOT trust id
    ...updates, id: authId })             // supplied by caller !
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


import * as FileSystem from 'expo-file-system';

import { SUPABASE_AVATARS_BUCKET, SUPABASE_AUDIOS_BUCKET } from '@env'


/***
 * Supabase tables
 * Ensure realtime is enable per-table.
 */
export const PROFILES_TABLE = "profiles"
export const PRAYERS_TABLE = "prayers"

/***
 * Supabase buckets
 * Must: exist, have lowercase names.
 */
export const AVATARS_BUCKET = SUPABASE_AVATARS_BUCKET
export const AUDIOS_BUCKET = SUPABASE_AUDIOS_BUCKET

/***
 * Local cache directories. 
 * Media files read from there except expressely requested !
 * Nota: Audios path set by expo-av, cannot be changed
 * 
 * Eg. Android:
 * file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540ceduth%252Fta-app/Avatars/0.5053256743146127.jpg
 * file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540ceduth%252Fta-app/Audio/recording-d21bb3c9-1b5e-4af5-8c96-8941e7aee93e.m4a
 */
export const AVATARS_CACHE = `${FileSystem.cacheDirectory}Avatars`
export const AUDIOS_CACHE = `${FileSystem.cacheDirectory}Audio`

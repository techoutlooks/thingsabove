
/**
 * PrayerInput
 * RecordingItem -> Prayer input kwargs 
 */
type PrayerInput<T> = {
  prayerId: string, title: string, description: string, recordings: T[], 
  userId: string, teamId: string, roomId: string, topics: string[],
  picture_urls?: string[], published: boolean, lat_lng?: string
}

type Prayer = {
  id: string
  user_id: string
  room_id: string
  team_ids: string[]
  is_recording?: boolean

  audio_urls: string[]
  picture_urls?: string[]
  duration: number
  title: string
  description: string
  topics: string[]

  lat_lng?: string

  created_at: string
  updated_at: string
  published: boolean
  
}

type Team = {
  id: string
  created_at: string
  updated_at: string

  title: string
  description: string
  avatar_urls: string[]
  video_url: string
  web_url: string
  lat_lng: string
  timezone: string
}

type Room = {
  id: string
  title: string
  description: string
  picture: string
}

type Topic = {
  name: string
}

type Category = {
  id: string
  title: string
  description: string
  prayer_ids: string[]
  published: boolean
}


export {PrayerInput}
export {Team, Room, Category, Topic}
export default Prayer;

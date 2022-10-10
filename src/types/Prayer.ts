
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
/*
"team": Object {
  "created_at": "2022-08-15T13:33:10+00:00",
  "description": "Finishing the Task exists to convene and to catalyze the global body of Christ towards the goal of ensuring that everyone, everywhere has access to a Bible, Believer, and Body of Christ.",
  "id": "cbde91f6-99da-4b3c-82f1-2164c6c0f737",
  "lat_lng": "12.773955, 55.578595",
  "picture_urls": null,
  "timezone": "US/Eastern",
  "title": "Finish The Task",
  "updated_at": "2022-08-17T08:49:07.918253+00:00",
  "video_url": "https://youtu.be/ZsUn_ULzwrk",
  "web_url": "https://finishingthetask.com/",
}
*/
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
}


export {PrayerInput}
export {Team, Room, Category, Topic}
export default Prayer;

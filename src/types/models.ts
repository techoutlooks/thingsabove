import { Model } from "@/lib/supabase"


interface Prayer extends Model {
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
  published: boolean
}

interface Team extends Model {
  title: string
  description: string
  avatar_urls: string[]
  video_url: string
  web_url: string
  lat_lng: string
  timezone: string
}

interface Room {
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


/***
 * Shareable: Generic type for all shareable items
 * Items types for shareable content, etc. */
enum ItemTypes { PRAYER = "ItemTypes/Prayer" }
type Shareable = Prayer


/***
* Sharings table row, 
* Tracks items shared by users across the app.
* Stores only the refs to items as the `item_id` field, NOT the full item data!
* 
* Dedicated table, independent from `supabase.auth.UserProfile` table.
* Separated table also in an effort to perform efficient lookup (eg. contact loading)
* and analytics. 

  Object {
    "created_at": undefined,
    "item_id": "174f511a-6f19-488c-97a9-f339743b86af",
    "item_type": "ItemTypes/Prayer",
    "to_users_ids": Array [
      "4448be94-1478-4dae-83fa-b04f0b43cccd",
    ],
    "updated_at": "2022-11-04T11:18:54.281Z",
    "user_id": "d121b2bc-db64-4a87-883d-5f2e7eea7be4",
  }

*/

interface Sharing extends Model  {
  item_id: string, item_type: ItemTypes,
  user_id: string, to_users_ids: string[],
}



export {Prayer, Team, Room, Category, Topic}
export { ItemTypes, Sharing, Shareable }

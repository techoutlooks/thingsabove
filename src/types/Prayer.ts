

 interface Model {
  id: string
  created_at?: string
  updated_at: string
}



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
 * Items types for shareable content, etc.
 */
enum ItemTypes { PRAYER = "ItemTypes/Prayer" }
type SharedItem = Prayer


/***
* Sharings - table to keep track of shared items across the app. 
* 
* One item may be re-shared by multiple users.
* Dedicated table, away from `supabase.UserProfile` by our supabase lib.
* Separated table also in an effort to avoid duplicate items, save on storage costs,
* as well as perform and efficient lookup and analytics. 

Nota: id in this table must be manually set, ie. NOT auto-generated on supabase!
*/
interface Sharing extends Model  {
  user_id: string, to_users_ids: string[],
  item_type: ItemTypes,
}



export {Team, Room, Category, Topic}
export { ItemTypes, Sharing, SharedItem }
export default Prayer;

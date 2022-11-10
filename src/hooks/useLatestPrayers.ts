import React, { useState, useEffect } from "react"
import { orderBy } from "lodash"

import { selectPrayersByUserId, FilterOpts } from "@/state/prayers"
import { useStore } from "react-redux"
import { Prayer } from "@/types/models"
import { useAuthId } from "./useAuth"



const ITEMS_LIMIT = 5

type useLatestPrayersArgs = { limit?: number } & FilterOpts

export default (args?: useLatestPrayersArgs) => {

  const { limit=ITEMS_LIMIT, ...filter } = args ?? {}

  const store= useStore()
  const authId = useAuthId()
  const [prayers, set] = useState<Prayer[]>([]) 

  useEffect(() => { authId && 
    set(orderBy(selectPrayersByUserId(authId, filter)(store.getState()), 
      ['updated_at'], ['desc'] ).slice(0, limit)) 
  }, [authId])

  return prayers
}
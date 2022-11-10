import React, { useCallback, Reducer, useReducer, useEffect, } from "react"
import * as sharings from "@/state/sharings"
import { Shareable } from "@/types/models"
import { orderBy } from "lodash"


const ITEMS_LIMIT = 5


import useSharings, { useSharingsArgs } from "./useSharings"

type S = { sent: Shareable[], received: Shareable[] }
type R = Reducer<S, Partial<S>>
const initialState = { sent: [], received: [] }


const sorted = (items: Shareable[]) => orderBy(
  items, ['updated_at'], ['desc'] ).slice(0, ITEMS_LIMIT) 


/***
 * useShareable()
 * Extended version of `useSharings()` 
 * that expands shared items, ie., `item_id` -> full item data 
 * ordered DESC by `updated_at` time.
 * */
 const useShareables = (args: useSharingsArgs) => {

  const { sent: sentRefs, received: receivedRefs, expand } = useSharings(args)
  const [{sent, received}, set] = useReducer<R>((s, a) => ({ ...s, ...a }), initialState)

  useEffect(() => { set({sent: sorted(expand(sharings.DirectionTypes.SENT)) }) }, [sentRefs])
  useEffect(() => { set({received: sorted(expand(sharings.DirectionTypes.RECEIVED)) }) }, [receivedRefs])

  return { sent, received }
}

export default useShareables

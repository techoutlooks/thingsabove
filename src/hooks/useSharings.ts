import React, { useCallback, Reducer, useReducer, useEffect, } from "react"
import { useDispatch, useSelector, useStore } from 'react-redux';
import { orderBy } from "lodash"
import { ItemTypes, Shareable, Sharing } from "@/types/models"
import * as sharings from "@/state/sharings"
import * as prayers from "@/state/prayers"
import { useAuthId } from "./useAuth"


const ITEMS_LIMIT = 10

/**
 * Obtain a "get-item-by-id" function suitabe to the item type 
 * @param itemType: ItemTypes
 * @returns {Function}
 */
const getfunc = (itemType: ItemTypes) => {
  switch(itemType) {
    case ItemTypes.PRAYER: return prayers.selectPrayerById
  }
}


/**
 * Args types */
type useSharingsArgs = { itemType: ItemTypes, limit?: number}
type shareCallbackArgs = {items: Shareable[]  } & Pick<sharings.SharingInput, 'contactsIdsTo'>

/**
 * Reducer    */
type S = { sent: Sharing[], received: Sharing[] }
type R = Reducer<S, Partial<S>>
const initialState = { sent: [], received: [] }

/***
 * Obtain refs to shared items (`models.Shareable`) 
 * - Get items shared to/by the current user
 * - Exposes a primitive to share items to people.
 * 
 * Items are retrieved from reducer if available/unchanged, or
 * fetched from supabase.
 * */
const useSharings = ({ itemType, limit=ITEMS_LIMIT }: useSharingsArgs) => {

  const store = useStore()
  const dispatch = useDispatch()

  const authId = useAuthId()
  const [{sent, received}, set] = useReducer<R>((s, a) => ({ ...s, ...a }), initialState)

  useEffect(() => { if(authId) {
    const state = store.getState()
    set({ sent: sharings.selectSharingsSent(authId, itemType)(state)})
    set({ received: sharings.selectSharingsReceived(authId, itemType)(state)})
  }}, [authId, itemType])

  /***
   * Fetch items from the store given their type and id  
   * Discards null or undefined items */
   const get = useCallback((itemsIds: string[]) => 
    (itemsIds ?? [])?.map(id => getfunc(itemType)(id)(store.getState()))
      .filter(item => !!item), [])

  /**
   * Expand all items in given direction ie., received, sent.
   * Limit retrieved count to `ITEMS_LIMIT`  */
  const expand = useCallback((direction: sharings.DirectionTypes): Shareable[] => {

    const resultSharings = orderBy(direction == sharings.DirectionTypes.RECEIVED ? 
      received : sent, ['created_at'], ['desc']
    ).slice(0, limit)

    return get(resultSharings.map(sharing => sharing.item_id))
     .map((item, i) => ({ shared_at: resultSharings[i].created_at, ...item}))

   }, [received, sent, limit])

  
  /***
   * Share item with contacts, as the curent user 
   * Nota: The user/sharings relationship is established at load time
   *       via the sharings reducer's sync() dispatch  */
  const share = useCallback(({ items, contactsIdsTo }: shareCallbackArgs) => {  
    if(authId && !!items?.length) {
      const inputs = items?.map(item => ({ 
        item, itemType, userId: authId, contactsIdsTo }))
      dispatch(sharings.upsert(inputs)) }
  }, [itemType, authId])


  return { sent, received, share, get, expand }
}


export default useSharings
export { useSharingsArgs, ITEMS_LIMIT }

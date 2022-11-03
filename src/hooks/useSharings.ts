import React, { useCallback, Reducer, useReducer, useEffect, } from "react"
import { useDispatch, useSelector } from 'react-redux';

import { Contact } from '@/state/contacts'
import * as sharings from "@/state/sharings"
import Prayer, { Sharing, ItemTypes, SharedItem } from "@/types/Prayer"
import { useAuthProfile } from "./useAuth"



/**
 * Args types */
type useSharedContentArgs = { itemType: ItemTypes, reversed?: boolean }
type shareCallbackArgs = {items: SharedItem[] } & Pick<sharings.SharingInput, 'contactsIdsTo'>

/**
 * Reducer */
type S = { items: SharedItem[] }
type R = Reducer<S, Partial<S>>
const initialState : S = { items: [] }
const createItemsReducer = (reversed: boolean): R => 
  (s, a) => ({ ...s, ...a})

/***
 * - Get items shared to/by the current user
 * - Exposes a primitive to set items shared with ppl to their profiles.
 * 
 * Items are retrieved from reducer if available/unchanged, or
 * fetched from supabase.
 * */
const useSharings = ({ itemType }: useSharedContentArgs) => {

  const dispatch = useDispatch()
  const { profile: me, update: updateAuthProfile } = useAuthProfile()
  const sent = useSelector(sharings.selectSharingsSent(me?.id, itemType))
  const received = useSelector(sharings.selectSharingsReceived(me?.id, itemType))


  /***
   * Share item with contacts, as the curent user 
   * Nota: The user/sharings relationship is established at load time
   *       via the sharings reducer's sync() dispatch
   * */
  const share = useCallback(({ items, contactsIdsTo }: shareCallbackArgs) => {  
    if(me?.id && !!items?.length) {
      const inputs = items?.map(item => ({ 
        item, itemType, userId: me.id, contactsIdsTo }))
      dispatch(sharings.upsert(inputs)) }
  }, [itemType, me?.id])


  return { sent, received, share }
}

export { useSharings }
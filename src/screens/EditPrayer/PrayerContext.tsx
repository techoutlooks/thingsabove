/***
 * Context to share prayer state between prayer screens
 */
import { useContext, useMemo, useReducer, Reducer, createContext, Dispatch, SetStateAction, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux'

import { PrayerInput } from "@/types/Prayer";
import { RecordedItem } from "@/components/audio-recorder/lib";

import { savePrayers } from '@/state/prayers';

type T = PrayerInput<RecordedItem>

type Context = {
  prayerInput: T|null
  sync: (input: Partial<T>, shouldUpload?: boolean) => void
}

// Internal PrayerInput reducer
type S = {prayerInput: T, shouldUpload: boolean}
type R = Reducer<S, {partial: Partial<T>, shouldUpload: boolean}>

// Provider 
const ScreensContext = createContext<Context>({} as Context)

const ScreensContextProvider = ({children}) => {

  const dispatch = useDispatch()
  const [{shouldUpload, prayerInput}, set] = useReducer<R>(
    (s, {partial, shouldUpload}) => ({
      shouldUpload, prayerInput: {...(s?.prayerInput ?? {}), ...partial} }), 
    ({prayerInput: {topics: []}} as S))
    
  useEffect(() => { 
    shouldUpload && dispatch(savePrayers([prayerInput])) }, [prayerInput])
  
  const sync = useCallback((partial: Partial<T>, shouldUpload=false) => {
    set({partial, shouldUpload}) }, [])

  const value = useMemo(() => ({
    prayerInput, sync, }), [prayerInput])


  return (
    <ScreensContext.Provider 
      {...{value, children }} 
    />
  )

}

const useScreensContext = () => {
  const context = useContext(ScreensContext)
  if (context === undefined) {
    throw new Error(
      'useScreensContext() must be used within `<ScreensContextProvider/>`') }
  return context
}

export { ScreensContextProvider, useScreensContext }

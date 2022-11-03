/***
 * Context to share prayer state between prayer screens
 */
 import { useContext, useMemo, useReducer, Reducer, createContext, Dispatch, SetStateAction, useEffect, useCallback } from "react";
 import { useDispatch, useSelector } from 'react-redux'
 
 import { RecordedItem } from "@/components/audio-recorder/lib";
 
 import { PrayerInput, savePrayers } from '@/state/prayers';
 
 type T = PrayerInput<RecordedItem>
 
 /**
  * @param saved: prayer is already saved to backend
  * @param published: prayer should be saved, but also published publicly
  * @param dirty: form (<EditInfoScreen/ >) as touched fields
  * @param complete: prayer is complete. it is safe to navigate away
  */
 type Status = { 
    saved: boolean, published: boolean, dirty: boolean }

 type Context = {
   prayerInput: T|null
   status: Status
   sync: (input: Partial<T>, shouldUpload?: boolean) => void
   setDirty: (dirty: boolean) => void
   publish: () => void
 }
 
 // Internal PrayerInput reducer
 type S = {prayerInput: T, shouldUpload: boolean}
 type R = Reducer<S, {partial: Partial<T>, shouldUpload: boolean}>
 
 // Provider 
 const ScreensContext = createContext<Context>({} as Context)
 
 const ScreensContextProvider = ({children}) => {
 
  const dispatch = useDispatch()

  // Prayer state
  // =============================
  const [{shouldUpload, prayerInput}, set] = useReducer<R>(
    (s, {partial, shouldUpload}) => ({
      shouldUpload, prayerInput: {...(s?.prayerInput ?? {}), ...partial} }), 
    ({prayerInput: {topics: []}} as S))

  // Status state
  // =============================
  const [status, setStatus] = useReducer<Reducer<Status, Partial<Status>>>(
    (s,a) => ({...s, ...a}), {saved: false, published: false, dirty: false })
     
  /* Persist prayer -> backend based on state
    UPSERT prayers. iff new prayer, also sync `prayerId` locally.
  ============================= */
  useEffect(() => { 
    (async () => { if(shouldUpload) {
      const [prayer] = await dispatch(savePrayers([prayerInput]))
      setStatus({published: !!prayerInput?.published, dirty: false, saved: true })
      prayer.id && set({partial: {prayerId: prayer.id}, shouldUpload: false}) }
    })()
   }, [prayerInput, shouldUpload])
   
  /* callbacks
  ============================= */
  const sync = useCallback((partial: Partial<T>, shouldUpload=false) => {
    set({partial, shouldUpload}) }, [])
 
  const publish = useCallback(() => set(
    {partial: {published: true}, shouldUpload: true}), [])

  const setDirty = (dirty: boolean) => setStatus({dirty, saved: !dirty})
 
  const value = useMemo(() => ({
    prayerInput, status, 
    sync, publish, setDirty, 
  }), [prayerInput, status, status.saved])
 
  console.log(`<ScreensContextProvider [RENDER] /> shouldUpload=${shouldUpload} saved=${JSON.stringify(status )}`, prayerInput)

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
 
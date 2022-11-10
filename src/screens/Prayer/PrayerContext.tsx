/***
 * Context to share prayer state between prayer screens
 */
 import React, { useContext, createContext, useMemo, useEffect, 
  useCallback, useReducer, Reducer } from "react";
  import { useDispatch, useSelector } from 'react-redux'
  
  import { useMedia, AUDIOS_CACHE } from "@/lib/supabase"
  import { PrayerInput, savePrayers, selectPrayerById } from '@/state/prayers';
  import { RecordedItem } from "@/components/audio-recorder/lib";
  
  
   
  
  /**
   * @param saved: prayer is already saved to backend
   * @param published: prayer should be saved, but also published publicly
   * @param dirty: form (<EditInfoScreen/ >) as touched fields
   * @param complete: prayer is complete. it is safe to navigate away */
  type Status = { 
    saved: boolean, 
    published: boolean, 
    dirty: boolean }
  
  type Context = {
    prayerInput: T|null
    status: Status
    sync: (input: Partial<T>, shouldUpload?: boolean) => void
    setDirty: (dirty: boolean) => void
    publish: () => void }
  
  const ScreensContext = createContext<Context>({} as Context)
   
  // PrayerInput reducer types
  type T = PrayerInput<RecordedItem>
  const noPrayerInput = ({ topics: [], recordings: [] } as unknown as T)
  type S = {prayerInput: T, shouldUpload: boolean}
  type R = Reducer<S, {partial: Partial<T>, shouldUpload: boolean}>
  
  
  /***
   * Context Provider
   */
  const ScreensContextProvider = ({ children}) => {
  
    const dispatch = useDispatch()
  
    /* Prayer state
    ============================= */

    const [{shouldUpload, prayerInput}, set] = useReducer<R>(
      (s, {partial, shouldUpload}) => ({
        shouldUpload, prayerInput: {...(s?.prayerInput ?? {}), ...partial} }), 
        ({prayerInput: noPrayerInput, shouldUpload: false } as S))
  
    /* Status state
    ============================= */

    const [status, setStatus] = useReducer<Reducer<Status, Partial<Status>>>(
      (s,a) => ({...s, ...a}), {saved: false, published: false, dirty: false })
       
    /* Persist prayer -> backend based on state
    UPSERT prayers. iff new prayer, also sync `prayerId` locally.
    FIXME: don't setStatus iff savePrayers() returned errors!
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
   
    return (
      <ScreensContext.Provider 
        {...{value, children }} 
      />
    )
   
   }
   
    
  
  /***
   * Recover prayerInput from prayer 
   */
  const usePrayerInput = (prayerId?: string):  T => {
  
    const p = useSelector(selectPrayerById(prayerId || null))
    const { cached, errors } = useMedia(p?.audio_urls || null, AUDIOS_CACHE)
    const recordings = cached?.map(file => ({ uri: file.fileUri })) as unknown as RecordedItem[]
  
    const prayerInput = useMemo(() => !p ? noPrayerInput : ({
      prayerId: p.id, title: p.title, description: p.description, 
      userId: p.user_id, recordings, 
      teamId: p.team_ids?.[0], roomId: p.room_id, topics: p.topics,
      picture_urls: p.picture_urls, published: p.published, lat_lng: p.lat_lng,
    }), [prayerId, cached]) 

    return prayerInput
  }
   
  
  /***
   * Retrieve context
   * @param prayerId: prayer to initialize the context with 
   * @returns {Context}
   */
   const useScreensContext = (prayerId?: string) => {
  
    const context = useContext(ScreensContext)
    if (context === undefined) {
      throw new Error(
        'useScreensContext() must be used within `<ScreensContextProvider/>`') }
  
    // initialize context with prayer, only once.
    const initial = usePrayerInput(prayerId)
    useEffect(() => { prayerId && context.sync(initial) }, [prayerId])
    
    return context
  }
  
  
  export { ScreensContextProvider, useScreensContext }
  
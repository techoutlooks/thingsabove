import React, {
  useMemo, useCallback, useReducer, Reducer, useState, useEffect,
} from "react";
import Recording from "./Recording";

  
type RecordedItem = {
  id: string, title: string,    // generated
  uri: string, duration: number // inherited from Recording
} 

type S = {
  recordings: RecordedItem[],
  listeningTo: RecordedItem,
  add: (r: RecordedItem) => void,
  del: (r: RecordedItem) => void,
  get: (r: RecordedItem) => number,
  fromrecording: (r: Recording & {title: string}) => RecordedItem
  play: (r: RecordedItem) => void,
}

const RecContext = React.createContext<S>(({} as S))


const RecProvider = ({children}) => {

  // RECORDINGS
  // ==========

  const [recordings, dispatch] = 
  useReducer<Reducer<RecordedItem[], { do: 'get'|'add'|'del', r: RecordedItem}>>(
    (s,a) => {
      const _add = (r: RecordedItem) => [...s, r]
      const _del = (r: RecordedItem) => { 
        const i = s.findIndex(({id}) => id===r.id);
        return (i < 0) ? s : s.splice(i, 1) }

      return [...(a.do==='add'? _add(a.r) : a.do==='del'? _del(a.r) : [] )]
  }, [])

  const add = useCallback((r: RecordedItem) =>  dispatch({do: 'add', r}), [])
  const del = useCallback((r: RecordedItem) => dispatch({do: 'del', r}), [])
  const get = useCallback(<T extends {id: string}>(r: T): number => 
    recordings.findIndex(({id}) => id===r.id), [recordings])
  const fromrecording = useCallback((r: Recording & {title: string}): RecordedItem => ({ 
      uri: r.uri, id: r.id, duration: r.duration,
      title: r.title, }), [])

  // PLAYBACK
  // ========
  
  const lastRecording = recordings.slice(-1)[0]
  const [listeningTo, setListeningTo] = 
    useState<RecordedItem>()
  
  useEffect(() => { 
    setListeningTo(lastRecording)}, [recordings])  

  const play = useCallback(setListeningTo , [recordings])
  
  const value = useMemo(() => ({
    recordings, get, add, del, fromrecording,
    listeningTo, play              
  }), [recordings, listeningTo])

  
  console.log(`>>> RecProvider()`, 
  `recordings (${recordings?.length}) =`, recordings.map(r => `${r.id} (${r.duration}s) - ${r.title}`),
  `listeningTo:${listeningTo?.title} lastRecording=${lastRecording?.title}`)

  return (
    <RecContext.Provider 
      {...{value, children }}
    />
  )
}    

const useRecordings = () => {
  const context = React.useContext(RecContext)
  if (context === undefined) {
    throw new Error('useRecordings must be used within `<RecordingsProvider/>`')
  }
  return context
}

    
export {RecProvider, useRecordings}
export type {RecordedItem}

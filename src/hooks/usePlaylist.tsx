
import React, { useReducer, Reducer, useEffect, useState } from "react";
import * as ar from "@/components/audio-recorder";


type Args = { shouldPlay?: boolean, size: number}
type State = { shouldPlay: boolean[] } & ar.PlaybackStatus
type R = Reducer<State, [number, ar.PlaybackStatus]>


/**
 * usePlaylist()
 * 
 * Animates a playlist which items are intially in a `ready` state.
 * Decision, which item in a playlist should play next,
 * based on whether the previous item's plaayback ended naturally.
 * A playlist is in state:
 *  - `ready` iff all subtitems are in `ready` state,
 *  - `playing` if at least one subitem is `playing`
 *  - `ended` iff the last subitem has done playing (is in `ended` state)
 */
const usePlaylist = ({size, ...p}: Args) => {

  // no audio in playlist should play initially, except iff `shouldPlay==true` 
  // play then playlist starting with first item. 
  const resetState: State = { ...ar.readyStatus, shouldPlay:  [
    !!p.shouldPlay, ...new Array(size).fill(false).slice(1)] }

  // authoritative state
  // compound values from props and dispatch func.
  const [state, setState] = useState<State>(resetState)
  // propagates shouldPlay from props -> reducer, that holds authority
  // as to the decision to play an item. required since the reducer can
  // only update its state when its dispatch fn is called.
  useEffect(() => { setState(s => ({...s, ...resetState}))
  }, [p.shouldPlay])


  // state for updates dispatched by playlist items. 
  // this state will be copied into the authoritative state.
  const [state2, setState2] = useReducer<R>(
    (s, [index, { ready: isReady, playing, ended: hasEnded }]) => {
    
    // set next audio to play iff active one ended
    const shouldPlay: boolean[] = s.shouldPlay.map(
      (v, i) => /* p.shouldPlay && */ hasEnded && i===index+1 ? true : v)

    // playlist ready iff all audios ready
    const ready = s.ready && isReady

    // playlist ended iff last item has ended
    const ended = hasEnded && (index+1===size)

    // console.log(`???????????? usePlaylist(${index}/${size}) ended=${ended} p.shouldPlay=${p.shouldPlay}`,
    //   `-> shouldPlay=${JSON.stringify(shouldPlay)}`)

    return { ...s, ...{shouldPlay, ready, playing, ended }}
  }, state) 
  // merge secondary state (from dispatched actions) -> authoritative state
  useEffect(() => { setState(state2) }, [state2])

  return [state, setState2]
  
}

export default usePlaylist;

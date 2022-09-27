/***
 * React hooks and provider for recording audio using expo-av.
 * Designed for internal use of public component <RecorderPlayer/> 
 * 
 * **<RecProvider/>** exposes the internal recorder's state.
 * **useRecordings()** implements the user-facing side of internal API vs
 * **useRecorder()** manipulates internal state based on user/timer/audio eventsevents 
 * 
 */
import React, {
  useEffect, useReducer, Reducer, Dispatch,
} from "react";
import {ValueOf} from "@/lib/utils";



// TODO: <RecButton/> glow, etc. if voice detected
// TODO: show percentage value through the progress bar?

// User & Timer & Audio events
type Events = Record<'ready'|'ended'|'swipedOn'|'clicked', boolean>

// Recording's actions/states (mutually exclusive). To be enacted by clicking
// the <RecButton /> button (`pushed` state). Regardless, doBefore, doAfter 
// actions fire sequentially in following order : doBefore -> do -> doAfter
enum Rec { 
  START = 'start', STOP = 'stop', PAUSE = 'pause', 
  RESET = 'reset', ADD = 'add', DELETE = 'del' }
type RecAction = ValueOf<typeof Rec>
type RecDo = { 
  do: RecAction, doBefore: RecAction[], doAfter: RecAction[], 
  pushed: boolean, hintText: string 
}

// recDisabled: default decision (reset state): recReady: ready to start  
const recDisabled: RecDo = {
  do: Rec.RESET, pushed: false, doBefore: [], doAfter: [], hintText: "" }
const recReady: RecDo = { ...recDisabled, do: Rec.START , hintText: "Click to pray"}
const recReset: RecDo = { ...recDisabled, do: Rec.RESET, pushed: true }


type Commit = Partial<Record<'pushed'|'reset', boolean>>
type Callback = () => Promise<boolean>
type Playback = Record<RecAction, Callback>
type IsFn = (action: RecAction, pushed?: boolean) => boolean;




/***
* **useRecorder()** 
* 
* decision: wt action (start/pause/stop & add/delete recording) should run next
* based on user input (clicked, swipedOn) and timer (ended) ,
* decision enacted (committed) iff clicked==True, ie. <RecButton /> btn clicked
*/
const useRecorder = (ev: Events, playback: Playback): [RecDo, Dispatch<Commit>, IsFn] => {

  const [recDo, commit] = useReducer<Reducer<RecDo, Commit>>(
    (s, {pushed=false, reset=false}) => {

    // current recording state
    const _is = (action: RecAction, pushed=true) => s.do==action && s.pushed==pushed
    const disabled = s.do===Rec.RESET && s.pushed==false
    
    // policies ready to enact iff commit was pushed,
    // ie.,  `commit({pushed: true})`, eg., if <RecButton/> clicked
    const shouldStart = _is(Rec.START, false) || (_is(Rec.PAUSE) && !ev.swipedOn)
    const shouldPause = ev.ready && _is(Rec.START) && !ev.swipedOn  && !ev.ended
    const deleteIfSwippedOnWhileStarted = (_is(Rec.START) && ev.swipedOn) // || _is(Rec.DELETE, false)
    const resumeAfterDeleteAttempt = _is(Rec.DELETE, false) && !ev.swipedOn
    const deleteIfSwippedOnAfterEnded = ev.ended && ev.swipedOn && !pushed
    const addIfSwipedOnAfterPaused = !ev.ended && (ev.swipedOn && _is(Rec.PAUSE) || _is(Rec.ADD, false))
    const addIfEndedNotSwippedOn = ev.ended && !ev.swipedOn

    // also, should automatically stop the recording 
    // if ended normally, or interrupted with intention to stop
    // const shouldStop = ev.ended || deleteIfSwippedOnWhileStarted  || addIfSwipedOnAfterPaused 

    // return decision as [RecAction, commit, hintText]
    // caller should update the UI to one of the RecAction's
    // but only commit the action iff `commit==true`
    const decision: RecDo = {...recDisabled, ...(
      reset ? recReset :
      (disabled && ev.ready) || _is(Rec.RESET) ? recReady : 
      shouldStart ? {do: Rec.START, pushed, hintText: "Click to Pause, Slide to Delete"} :
      shouldPause ? {do: Rec.PAUSE, pushed, hintText: "Slide to end"} : 
      deleteIfSwippedOnWhileStarted ? {do: Rec.DELETE, pushed,
        doBefore: [Rec.PAUSE], hintText: "Delete?"} :
      resumeAfterDeleteAttempt ? { do: Rec.START, pushed: true } :
      addIfSwipedOnAfterPaused ? {do: Rec.ADD, pushed,
        doBefore: [Rec.STOP], hintText: "Add recording ..." } :
      addIfEndedNotSwippedOn ? {do: Rec.ADD, pushed,
        doBefore: [Rec.STOP], hintText: "Slide to delete" } :
      deleteIfSwippedOnAfterEnded ? {do: Rec.DELETE, pushed} : recDisabled
    )}

    console.log(`+++ ${s.do}=${s.pushed} -> ${decision.do}=${decision.pushed}`, 
      `clicked=${pushed} reset=${_is(Rec.RESET)} started=${_is(Rec.START)} paused=${_is(Rec.PAUSE)} swipedOn=${ev.swipedOn} ended=${ev.ended} ready=${ev.ready}`)
    
    return decision

  }, recDisabled);

  // const is = useCallback((action: RecAction, pushed=true) => recDo.do==action && recDo.pushed==pushed, [recDo])
  const is = (action: RecAction, pushed=true) => recDo.do==action && recDo.pushed==pushed

  /*  
    PLABACK
    ==========================
    fire async callbacks for queued actions sequentially
    only pushed commit will run (ie., iff `pushed=true`, and not a reset)
    first action to return falsy blocks further ones in chain to execute. 
    ==========================
  */
  useEffect(() => {

    // run callbacks sequentially for given actions  
    const run = async (dos: RecAction[]) => 
      dos.filter(a => a !== Rec.RESET)
        .reduce((p, a) => p.then(r => r && playback[a]()), Promise.resolve(true))

    // queue actions groups: doBefore -> do -> doAfter
    const queue = async () => {
      recDo.pushed && run(recDo.doBefore)
        .then(() => run([recDo.do]))
        .then(() => run(recDo.doAfter)) 
        .catch(err => {console.error(`run(${recDo.do}) : `, err)}) }
    queue()
    
  }, [recDo.do, recDo.pushed])

  /*  
    AUTO-RESET
    ==========================
    force auto-reset, since after ADD, DELETE actions no external event is expected,
    that can modify the state. first reset should trigger media preparation
    ==========================
  */
  useEffect(() => { if(recDo) {
    const shouldReset  = is(Rec.ADD) || is(Rec.DELETE) //|| (is(Rec.RESET, false) && ev.ready)
    shouldReset && console.log('[RESET]')
    shouldReset && commit({reset: true}) 
  }}, [recDo])
  return [recDo, commit, is]
}


export default useRecorder
export type {Events}
export {Rec}

import React, {useEffect, useReducer, Reducer} from "react";
import useInterval from "./useInterval"


/***
 * **useClock()**
 * 
 * Runs a timer for given duration in seconds. Returns seconds elapsed, 
 * paused/running status as well  as primitivesto toggle and reset timer
 * status. Progress smoothness parameterable via the `resolution` prop.
 */
type ValueOf<T> = T[keyof T] 
const CLOCK_RESOLUTION = 1/1000
enum ClockDo { TICK, TOGGLE, RESET, STOP }
  
type S = {ended: boolean, paused: boolean, secs: number}
const resetState = {ended: false, paused: true, secs: 0}
const useTimer = (duration: number, resolution=CLOCK_RESOLUTION) => {
 
  // reducer,  avoids abusive calling of `setInterval()`  
  const [{ended, paused, secs}, dispatch] = 
    useReducer<Reducer<S, ValueOf<typeof ClockDo>>>((s,a) => ({...s, ...(
      a===ClockDo.TICK ? {secs: s.secs + 1/resolution/1000} : 
      a===ClockDo.TOGGLE? {paused: !s.paused} : 
      a==ClockDo.RESET? resetState : {ended: true}
    )}), resetState)
 
  // internal clock, ticks with `resolution` till unmounted
  useInterval(() => {
    !paused && !ended && dispatch(ClockDo.TICK) }, 1/resolution)

  // timer ended. also clearInterval()?
  useEffect(() => {
    if(secs >= duration) { dispatch(ClockDo.STOP) } }, [secs])

  const reset = () => dispatch(ClockDo.RESET)
  const toggle = () => dispatch(ClockDo.TOGGLE) 

  return {secs, paused, ended, resolution, toggle, reset}
}

 
/***
 * **useFmtTime()**
 * 
 * milliseconds -> MM:SS
 */
const useFmtTime = (millisecond: number) =>
  useReducer<Reducer<string, number>, number>(
    (acc, v) => toMMSS(v), millisecond, toMMSS);



/***
 * milliseconds -> MM:SS
 * Requires millisecond time < 1d
 * @returns {string}
 * @param milliseconds
 */
const toMMSS = (milliseconds: number) =>
new Date(milliseconds).toISOString().slice(14, 19)


export default useTimer
export {useFmtTime}
import React, {useRef, useEffect} from "react";


/***
 * Calls `callback()` after `duration` seconds have elapsed
 * must use an immutable callback, since without it, setInterval would 
 * pick a changing `duration` from its closure when the effect is run.
 */
const useInterval = (callback: () => void, duration: number) => {
    const tick = useRef<typeof callback>()
    useEffect(() => { tick.current = callback }, [callback])
    useEffect(() => { 
      if (!!duration && tick.current) {
          const clock = setInterval(() => tick.current(), duration)
          return () => clearInterval(clock)
      }
    }, [duration])
}

export default useInterval;
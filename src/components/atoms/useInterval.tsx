import React, {useRef, useEffect} from "react";


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
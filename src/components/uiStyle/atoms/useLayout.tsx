import {useReducer, useCallback} from "react";
import { PADDING } from "./constants";

/**
 * **useLayoutOpts()**
 * 
 * Generates `onLayout`, a 'snitch' function for passing on to measured up components.
 * Measured dimensions and cordinates avail in the `layout` state.
 * Optionally runs the custom `callback` after reporting the measurements.
 */
type Opts = {padding?: boolean, callback?: Function}
const useLayout = ({callback, padding}:Opts = {padding: false}) => {
  
    const [layout, setLayout] = useReducer((s,a) => ({...a,  ...(!!padding 
      && {width: a.width+PADDING*2, height: a.height+PADDING*2} || {}),
    }), {width: 0, height: 0, x: 0, y: 0});

    const onLayout = useCallback(ev => {
      setLayout(ev.nativeEvent.layout) 
      callback && callback(ev)
    }, [])

  return [layout, onLayout]
}

export default useLayout;
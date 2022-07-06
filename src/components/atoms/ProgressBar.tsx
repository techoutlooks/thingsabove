import React, { useEffect, useState, useReducer, useCallback, Reducer } from "react";
import styled from "styled-components";
import {View, ViewProps} from "react-native";

import useTimer from "./useTimer";
import { RADIUS, PADDING } from "./constants";

type Props = {
  duration?: number,                      // duration (ms)
  paused?: boolean,                       // whether to pause the timer
  reset?: boolean,                        // whether to reset the timer
  onEnded?: (ended: boolean) => void,   // called on end, or user stopping   
} & ViewProps

/***
 * Timer
 * 
 * Displays a progress bar, calls supplied ` onEnded()` func when ended.
 */
const ProgressBar = styled((props: Props) => {

    const {style, children, duration=10, onEnded, ...p} = props
    const {secs, paused, ended, toggle, reset} = useTimer(duration)
    const width = `${100 * secs/duration}%`

    // handle clock events
    useEffect(() => { toggle() }, [p.paused])
    useEffect(() => { reset() }, [p.reset])
    useEffect(() => { onEnded && onEnded(ended) }, [ended])

    // console.log('??? Timer', `reset=${p.reset} paused=${paused}/${!!p?.paused} secs=${secs} ended=${ended} secs=${secs}`)
    return (<View {...{style: [style, {width}], children }} />)
  
  })<Props>
  `
    background-color: ${p => p.theme.colors.mutedFg};
    border-radius: ${RADIUS}px;
    padding: ${PADDING}px;
  `;

export default ProgressBar;
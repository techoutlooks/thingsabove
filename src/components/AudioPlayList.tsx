import React, { useReducer, Reducer, useEffect } from "react";
import { View, ViewProps } from "react-native"
import styled from "styled-components/native"

import * as ar from "./audio-recorder";
import AudioPlayer from "./AudioPlayer";
import { usePlaylist } from "@/hooks";


type Props = { 
  paths: string[],     
  onChange?: (status: ar.PlaybackStatus) => void
} 
  & Pick<ar.PlayerProps, 'shouldPlay'|'shouldReset'|'shouldStop'> 
  & ViewProps
  

/***
 * @param {string[]} paths: list of audios paths relative to the audios bucket
 * @param {boolean} shouldPlay: play playlist, starting with first item  
 * @param {boolean} shouldReset: reset all audios in playlist
 */
export default styled(({paths, shouldReset, ...p}: Props) => {
  
  const [{shouldPlay, ...status}, setStatus]  = usePlaylist({
    size: paths.length, shouldPlay: p.shouldPlay })

  // playlist events notify
  useEffect(() => { p.onChange?.(status) 
  }, [status.ready, status.playing, status.ended])

  // console.log(`AudioPlayList [len=${paths?.length}] p.shouldPlay=${p.shouldPlay} shouldReset=${shouldReset}`,
  //   `-> shouldPlay=${JSON.stringify(shouldPlay)} status=${JSON.stringify(status)}`)

  return (
    <View {...p}>
      { paths?.map((path, i) => (
          <AudioPlayer {...{
            key: i, path, shouldPlay: shouldPlay[i], shouldReset,
            onChange: status => setStatus([i, status])}} 
          />
        ))
      }
    </View>
  )
})``

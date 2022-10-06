import React, { memo, useState, useEffect, useCallback, useReducer, Reducer, useRef } from "react";
import { ViewStyle } from "react-native";
import styled, { css } from "styled-components/native";

import {AVPlaybackSource} from "expo-av/src/AV.types";
import {default as Loader} from "../SkeletonCard"
import { Row, Button, useFmtTime } from "@/components/uiStyle/atoms";

import {Audio, PlaybackEvent } from "./lib";
import LineControl from "./LineControl";
import Duration from "./Duration";
import { isempty } from "@/lib/utils";


type PlaybackStatus = { 
  ready: boolean, playing: boolean, ended: boolean }

// Playback statuses
const resetStatus = { ready: false, playing: false, ended: false }
const readyStatus = { ready: true,  playing: false, ended: false }
const endedStatus = { ready: false,  playing: false, ended: true }


/***
 * **useAudio() hook**
 * Create/load audio from src
 */
const useAudio = (src:AVPlaybackSource, 
  {shouldPlay=false, shouldReset=false, shouldStop=false}) => {

  const willUnmount = useRef<boolean>(false)

  /* Playback
  ========================== */
  // const audio = useRef(new Audio(src)).current
  const [audio, setAudio] = useState<Audio>();
  const [status, setStatus] = 
    useReducer<Reducer<PlaybackStatus, Partial<PlaybackStatus>>>(
      (s,a) => ({...s, ...a}), resetStatus)

  const [seek, setSeek] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // callbacks for the Audio.load() api 
  // nota: Audio lib unloads audio on ended
  const onPlay = () => { !willUnmount.current && setStatus({playing: true}) }
  const onPause = () => { !willUnmount.current && setStatus({playing: false}) }
  const onEnded = () => { if(!willUnmount.current) {  setStatus(endedStatus); }} //setSeek(0);  }}
  const onTimeUpdate = ({ currentTime }) => setSeek(currentTime)
  const onLoad = ({ duration }) => { if (!willUnmount.current) { 
    setStatus(readyStatus); setDuration(duration); setSeek(0) }}


  /* Funcs
  ========================== */
  const load = useCallback(
    async (src:AVPlaybackSource) => await Audio.load(src, {
      loadeddata: onLoad, timeupdate: onTimeUpdate,
      play: onPlay, pause: onPause, ended: onEnded,   
    }, shouldPlay),
  [shouldPlay])

  const unload = useCallback(() => {
    audio?.unload().then(() => audio?.removeEventListeners())
  }, [audio])

  // initialize player. dep [load] accounts for `shouldPlay`
  const init = useCallback(() => { 
    src && load(src).then(audio => !willUnmount.current && setAudio(audio)) 
  }, [load, willUnmount.current]) 

  const stop = useCallback(() => {
    audio?.stop().then(audio?.unload)}, [audio])

  const onToggle = useCallback(async () => {
    audio && await (status.playing ? audio.pause : audio.play)();
    setStatus({playing: !status.playing});
  }, [audio, status.playing]);
  

  /* Effects
  ========================== */

  // LOAD
  useEffect(() => { init()
    return () => unload() }, [init]) 

  // RESET - reload audios on reset (also resets playback status)
  useEffect(() => {      
    if(shouldReset) { willUnmount.current = false ; init() }
    return () => unload() }, [shouldReset, willUnmount.current])

  // STOP
  useEffect(() => { stop() }, [shouldStop])

  
  // UNMOUNT - notify player unmount
  useEffect(() => {() => {willUnmount.current = true }}, [])

  // console.log(`useAudio(${src.uri.slice(src.uri.lastIndexOf("/")+1)})`,
  //    `shouldReset=${shouldReset} -> status=${JSON.stringify(status)}`, `willUnmount.current=${willUnmount.current}`)

  return {
    audio,
    seek, duration,
    ...status,
    stop,
    onToggle,
  }
}


type Props = { 
  src: AVPlaybackSource, 
  shouldPlay?: boolean, shouldStop?: boolean, shouldReset?: boolean,
  onChange?: ({ready, playing, ended}: PlaybackStatus) => void
  key?: any, style?: ViewStyle
}

/***
 * <PlayerWidget/>
 */
const PlayerWidget = memo(({src, shouldPlay = false, shouldReset=false, shouldStop=false,
                      key, style, onChange }: Props) => {
  
  const uri = (!src.hasOwnProperty('uri') && src) || src?.uri
  const hasSrc = !isempty(src) && !!uri
  
                        
  if(!hasSrc) {
    return (<Loader />)
  }

  // load audio
  const {
    audio,
    seek: seekMillis, duration: durationMillis,
    ready, playing, ended,
    onToggle,
  } = useAudio(src, {shouldPlay, shouldReset, shouldStop});

  // stateful formatted time

  const [duration, setDuration] = useFmtTime(durationMillis);
  const [currentTime, setCurrentTime] = useFmtTime(seekMillis);

  const resetProgress = () => {};

  useEffect(() => { setDuration(durationMillis) }, [durationMillis]);
  useEffect(() => { setCurrentTime(seekMillis) }, [seekMillis]);
  useEffect(() => { onChange?.({ready, playing, ended}) }, [ready, playing, ended])

  // console.log(`<PlayerWidget /> ${uri.slice(uri.lastIndexOf("/") + 1)} (${audio?.duration}) shouldPlay=${shouldPlay}`, 
  //   `-> ready=${ready} playing=${playing} ended=${ended}`)

  return (
    <Container {...{key, style}}>
      <PlayBack>
        <Button
          name={playing ? "pause" : "play-arrow"}
          disabled={!ready}
          onPress={onToggle}
        />
      </PlayBack>

      <Bar>
        <Duration value={currentTime} />
        <Progress {...{ percentage: seekMillis / durationMillis }} />
        <Duration value={duration} />
        {/* <VolumeControl {...{ percentage: audio?.volume }} /> */}
      </Bar>
    </Container>
  );
})

const PlayBack = styled.View`
  flex: 0.15;
`;

const Progress = styled(LineControl)`
  flex: 1;
`;

const Bar = styled.View`
  flex: 1;
  height: 100%;
  margin: 0 12px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled(Row)`
  width: 100%;
`;


export default PlayerWidget;
export { Props as PlayerProps, PlaybackStatus }
export { resetStatus, readyStatus, endedStatus }


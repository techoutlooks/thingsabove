import React, { useState, useEffect, useCallback } from "react";
import { ViewStyle } from "react-native";
import styled, { css } from "styled-components/native";

import {AVPlaybackSource} from "expo-av/src/AV.types";
import { Row, Button, useFmtTime } from "@/components/uiStyle/atoms";

import {Audio, PlaybackEvent } from "./lib";
import LineControl from "./LineControl";
import Duration from "./Duration";
import ThreeDots from "./ThreeDots"
import { isempty } from "@/lib/utils";


/***
 * **useAudio() hook**
 * Create a load audio from src
 */
const useAudio = (src:AVPlaybackSource, shouldPlay=false) => {

  const [willUnmount, setWillUnmount] = useState(false)

  // Playback
  // ==========================
  // make audio state reactive
  // const audio = useRef(new Audio(src)).current
  const [audio, setAudio] = useState<Audio>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [seek, setSeek] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const load = useCallback(

    async (src:AVPlaybackSource) => await Audio.load(src, {
      loadeddata: ({ duration }) => { if(!willUnmount) { 
        setDuration(duration); setIsReady(true) }},
      play: () => !willUnmount && setIsPlaying(true),
      pause: () => !willUnmount && setIsPlaying(false),
      ended: () => { if(!willUnmount) { 
        setIsPlaying(false); setIsReady(false); setSeek(0) }},
      timeupdate: ({ currentTime }) => !willUnmount && setSeek(currentTime) ,

    }, shouldPlay),[src, shouldPlay]);

  const unload = useCallback(() => {
    audio?.unload();
    audio?.removeEventListeners();
  }, [audio]);

  useEffect(() => {
    if(src ) {
      load(src).then(audio => !willUnmount && setAudio(audio))
      return () => { setWillUnmount(true) }; return unload() };
  }, [load])

  // alter playback on ui events
  const onSeek = useCallback(() => {}, []);

  const onToggle = useCallback(async () => {
    audio && await (isPlaying ? audio.pause : audio.play)();
    setIsPlaying(!isPlaying);
  }, [audio, isPlaying]);

  return {
    audio,
    seek,
    duration,
    ready: isReady,
    playing: isPlaying,
    onSeek,
    onToggle,
  };
};


type Props = { 
  src: AVPlaybackSource, shouldPlay?: boolean,
  key?: any, style?: ViewStyle
 }

/***
 * <PLayer/>
 */
const Player = ({src, shouldPlay = false, key, style}: Props) => {
  
  const uri = (!src.hasOwnProperty('uri') && src) || src.uri
  const hasSrc = !isempty(src) && !!uri
    
  if(!hasSrc) {
    return (<ThreeDots />)
  }

  // load audio
  const {
    audio,
    seek: seekMillis,
    duration: durationMillis,
    ready,
    playing,
    onSeek,
    onToggle,
  } = useAudio(src, shouldPlay);

  // stateful formatted time

  const [duration, setDuration] = useFmtTime(durationMillis);
  const [currentTime, setCurrentTime] = useFmtTime(seekMillis);

  const resetProgress = () => {};

  useEffect(() => { setDuration(durationMillis) }, [durationMillis]);
  useEffect(() => { setCurrentTime(seekMillis) }, [seekMillis]);

  // console.log('Player.tsx', `ready=${ready} (${audio?.duration}) -> ${uri}`)

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
};

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
  // background-color: red;
  width: 100%;
`;

export default Player;



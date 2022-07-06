import React, {
  useState,
  useReducer,
  useRef,
  useEffect,
  useCallback,
  useMemo, Reducer,
} from "react";
import styled, { css } from "styled-components/native";

import {Audio, PlaybackEvent } from "./lib";
import LineControl from "./LineControl";
import Duration from "./Duration";
import VolumeControl from "./VolumeControl";
import { Row, Button, useFmtTime } from "@/components/atoms";
import {useRecordings} from "./lib";


/***
 * **useAudio() hook**
 * Create a load audio from src
 */
const useAudio = (src: string) => {
  // make audio state reactive
  // const audio = useRef(new Audio(src)).current

  const [audio, setAudio] = useState<Audio>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [seek, setSeek] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const load = useCallback(
    async (uri: string, shouldPlay: boolean) => {
      return await Audio.load({uri}, {
        loadeddata: ({ duration }) => {
          setDuration(duration);
          setIsReady(true);
        },
        play: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
        ended: () => {
          setIsPlaying(false);
          setIsReady(false);
          setSeek(0);
        },
        timeupdate: ({ currentTime }) => {
          setSeek(currentTime);
        },
      }, shouldPlay);
    },[src]);

  const unload = useCallback(() => {
    audio?.unload();
    audio?.removeEventListeners();
  }, [audio]);

  useEffect(() => {
    if(src ) {
      load(src, true).then(setAudio)
      return unload;
    }

  }, [load]); 

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

const Player = () => {

  const {listeningTo} = useRecordings()
  const uri = listeningTo?.uri

  // load audio
  const {
    audio,
    seek: seekMillis,
    duration: durationMillis,
    ready,
    playing,
    onSeek,
    onToggle,
  } = useAudio(uri);

  // stateful formatted time

  const [duration, setDuration] = useFmtTime(durationMillis);
  const [currentTime, setCurrentTime] = useFmtTime(seekMillis);

  const resetProgress = () => {};

  useEffect(() => { setDuration(durationMillis) }, [durationMillis]);
  useEffect(() => { setCurrentTime(seekMillis) }, [seekMillis]);

  // console.log('Player.tsx', `ready=${ready} (${audio?.duration}) -> ${uri}`)

  return (
    <Container>
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
`;

export default Player;



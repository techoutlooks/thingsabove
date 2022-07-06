import React, {
  useEffect, useCallback, useState, useReducer, Reducer,
} from "react";
import styled from "styled-components/native";

import {useRecorder, useRecordings, Rec, Events, Recording, RecordedItem} from "./lib";
import {AUDIO_MAX_DURATION, RECORDING_TITLE_PREFIX} from "./constants";

import { 
  useLayout,
  ProgressBar, Button, Col, Swiper, Swipeable, Underlay, TextInput, SendIcon, FlatList,
} from "@/components/atoms";
import {trim} from "@/lib/utils"

import RecordedItemView from "./RecordedItemView";



const eventsInitial: Events & {reset: boolean} = 
{clicked: false, ended: false, swipedOn: false, reset: false, ready: false}


const Recorder = () => {

  // LAYOUT
  // =========

  const [{height}, onLayout] = useLayout({padding: true}) 
  const {recordings, listeningTo, fromrecording, add: recadd, del: recdel, play} = useRecordings()

  // RECORDING
  // =========

  // input events capture, and dispatching to useRecDo decision process
  // without committing them (comitted by pressing <RecButton/>)
  const [{ready, ended, swipedOn}, emit] = 
    useReducer<Reducer<Events,Partial<Events>>>((s, a) => (
      {...s, ...a}), eventsInitial);
  useEffect(() => { commit({pushed: false}) }, [ready, ended, swipedOn])

  // current recording
  // new, empty recording generated on every `reset` event cf. `useRecorder()`
  const [recording, setRecording] = useState<Recording|null>(null)
  const [title, setTitle] = useState('')

  // callbacks for playback
  // actions: START, STOP, PAUSE,  ADD, DELETE 
  const start = useCallback(async () => recording?.start(), [recording])
  const pause = useCallback(async () => recording?.pause(), [recording])

  const add = useCallback(() => {
    const rec_item = fromrecording(recording)
    console.log('[ADD]', {...rec_item, title})
    return recadd({...rec_item, title})
  }, [recording, title])

  const del = useCallback(() => recdel(recording), [recording])
  const stop = useCallback(async () =>  Promise.resolve(recording)
    .then(r => r?.stop()).then(() => emit({ready: false})), [recording])
    
  // recDo, or: what to do with the audio, based on events
  // callbacks for playback  
  const [recDo, commit, is] = useRecorder(
    {ready, ended, swipedOn}, 
    {start, pause, stop, add, del})
  const {do: action, pushed, hintText} = recDo 
  const started = is(Rec.START) 
  const reset = is(Rec.RESET) 
  const disabled = is(Rec.RESET, false)
  const willAdd = is(Rec.ADD, false)

  // prepare a new recording when needed
  // and advertise readiness subsequently 
  useEffect(() => {
    if (!recording || reset) { 
      Recording.prepare().then(setRecording)
      .then(() => emit({ready: true}))
      .catch(() => emit({ready: false}))
    }
    // return stop;
  }, [reset]);


  // title editing
  const [hideEditTitle, setHideEditTitle] = useState(true)
  useEffect(() => {    
    setTitle(`${RECORDING_TITLE_PREFIX}#${recordings.length+1}`)
  }, [willAdd])


  // console.log(`>>> Recorder.tsx ${Recording.Status[recording?.status]}`, 
  //   `recordings (${recordings?.length}) =`, recordings.map(r => `${r.id} (${r.duration}s) - ${r.title}`))


  return (
    <Container>

      <RecorderWidget>
        { !hideEditTitle && 
          <TitleInput {...{ 
              title, changeInput: setTitle,
              onSave: () => {
                commit({pushed: true}); setHideEditTitle(true)}
          }} /> 
        }

        <Swiper 
          {...{onLayout, text: hintText, reset,
              onToggle: (swipedOn) => emit({swipedOn}) }} 
        >
          <Underlay>
            <Progress style={[{height}]} {...{
              paused: !started, reset, duration: AUDIO_MAX_DURATION,
              onEnded: (ended) => emit({ended}),
            }} />
          </Underlay> 
          <Swipeable>
            <RecButton {...{
              action,
              onPress: () => willAdd ? 
                setHideEditTitle(false) : commit({pushed: true}) 
            }} /> 
          </Swipeable>
        </Swiper>
      </RecorderWidget>
      
      <RecordingsList 
        {...{recordings, listeningTo, play, del }} 
      />
      
    </Container>
  );
};


type RecordingsListProps = {
  recordings: RecordedItem[],
  listeningTo: RecordedItem,
  play: (r: RecordedItem) => void,
  del: (r: RecordedItem) => void,
}
const RecordingsList = styled((props: RecordingsListProps) => {
  const {recordings, listeningTo, play, del, ...p} = props

  const keyExtractor = useCallback(item => `${item.id}`, [])
  const renderRecordedItem = useCallback(({item: recording}) => (
    <RecordedItemView 
      highlighted={recording?.id===listeningTo?.id}
      {...{recording, del, play}}
    />
  ), [listeningTo])


  return (
    <FlatList {...p}
      data={recordings}
      keyExtractor={keyExtractor}
      renderItem={renderRecordedItem}
  />)
})`
  width: 100%;
`


const RecorderWidget = styled.View`
  flex-direction: row;
` 


const TitleInput = styled(TextInput)
  .attrs(({title, changeInput, placeholder, onSave, ...p}) => ({
    value: title, 
    onChangeText: changeInput,
    placeholder: `Prayer `,
    multiline: true,
    textBreakStrategy: "simple",
    postIcon: <SendIcon onPress={onSave} show={trim(title).length > 0} />,
    disabled: false,
    ...p
  }))`
    position: absolute;
    width: 100%;
    height: 100%;
    flex: 1;
    z-index: 10;
  `

const Progress = styled(ProgressBar)`
`

// material icons per rec action
const recIcons = { 
  [Rec.RESET]: "lock-clock",
  'start': "mic", [Rec.PAUSE]: "pause",
  [Rec.ADD]:  "add", [Rec.DELETE]: "delete"
}

const RecButton = styled(Button)
  .attrs(({ action }) => ({name: recIcons[action], size: "lg"}))``;

const Container = styled(Col)`
  flex: 1;
  // background-color: yellow;
`;

export default Recorder;

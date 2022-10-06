import React, {
  useEffect, useCallback, useState, useReducer, Reducer, useMemo, useRef,
} from "react";
import styled from "styled-components/native";

import {useRecorder, useRecordings, Rec, Events, Recording, RecordedItem} from "./lib";
import {AUDIO_MAX_DURATION, RECORDING_TITLE_PREFIX} from "./constants";

import {
  useLayout,
  ProgressBar, Button, Row, Col, Swiper, Swipeable, Underlay, TextInput, SendIcon, FlatList,
} from "@/components/uiStyle/atoms";
import {trim} from "@/lib/utils"

import RecordedItemView from "./RecordedItemView";



const eventsInitial: Events & {reset: boolean} =
{clicked: false, ended: false, swipedOn: false, reset: false, ready: false}

type Props = { 
  onChange?: (recordings: RecordedItem[]) => void }


  
const RecorderWidget = ({onChange}: Props) => {

  // LAYOUT
  // =========

  const [{height}, onLayout] = useLayout({padding: true})
  const {recordings, listeningTo, fromrecording, add: recadd, del: recdel, play} = useRecordings()

  // RECORDING
  // =========

  // input events capture, and dispatching to useRecDo decision process
  // without committing them (comitted by pressing <RecButton/>)
  // ==========================
  const [{ready, ended, swipedOn}, emit] =
    useReducer<Reducer<Events,Partial<Events>>>((s, a) => (
      {...s, ...a}), eventsInitial);
  useEffect(() => { commit({pushed: false}) }, [ready, ended, swipedOn])

  // current recording
  // new, empty recording generated on every `reset` event cf. `useRecorder()`
  // ==========================
  const [recording, setRecording] = useState<Recording|null>(null)
  const [title, setTitle] = useState('')

  // callbacks for playback
  // actions: START, STOP, PAUSE,  ADD, DELETE
  // ==========================
  const start = useCallback(async () => recording?.start(), [recording])
  const pause = useCallback(async () => recording?.pause(), [recording])

  const add = useCallback(() => {
    const rec_item = fromrecording(recording)
    console.debug('[ADD]', {...rec_item, title})
    return recadd({...rec_item, title})
  }, [recording, title])

  const del = useCallback(recdel, [recording])
  const stop = useCallback(async () =>  Promise.resolve(recording)
    .then(r => r?.stop()).then(() => emit({ready: false})), [recording])

  // recDo, or: what to do with the audio, based on events
  // callbacks for playback
    // ==========================
  const [recDo, commit, is] = useRecorder(
    {ready, ended, swipedOn},
    {start, pause, stop, add, del})
  const {do: action, pushed, hintText} = recDo
  const started = is(Rec.START)
  const reset = is(Rec.RESET)
  const disabled = is(Rec.RESET, false)
  const willAdd = is(Rec.ADD, false)


  /* a) prepare a new recording ahead of time when needed (!recording, reset)
     b) save prepared recording to state iff component mounted, ie. user has not 
        navigated away from page containing Recorder.
        Nota: safe to prepare a new recording only after reset (stop -> add -> reset)
     c) advertise readiness subsequently. 
  ========================== */
  useEffect(() => {  
    let mounted = true
    const sub = new Recording().on().subscribe({
      error: error => mounted && emit({ready: false}),
      next: recording => { if(mounted) {
        setRecording(recording); emit({ready: true})
      }},
    })

    return () => { 
      mounted = false 
      sub.unsubscribe()
    }

  }, [])



  // title editing
  // ==========================
  const [hideEditTitle, setHideEditTitle] = useState(true)
  useEffect(() => {
    setTitle(`${RECORDING_TITLE_PREFIX}#${recordings.length+1}`)
  }, [willAdd])


  // notify parent component that recordings list changed:
  // run parent callback with current recordings
  // ==========================
  useEffect(() => {onChange && onChange(recordings)}, [recordings])


  console.debug(`>>> Recorder.tsx  recording=${recording?.id}/${Recording.Status[recording?.status]} (emitted=${!!ready})`,
    `recordings (${recordings?.length}) =`, recordings.map(r => `${r.id} (${r.duration}s) - ${r.title}`))


  return (
    <Container>

      <RecorderContainer>
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
              action, disabled,
              onPress: () => willAdd ?
                setHideEditTitle(false) : commit({pushed: true})
            }} />
          </Swipeable>
        </Swiper>
      </RecorderContainer>

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
    <RecordedItemView {...{
      recording, del, play,
      highlighted: recording?.id===listeningTo?.id
    }} />
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


const RecorderContainer = styled(Row)`
  justify-content: center;
`


const TitleInput = styled(TextInput)
  .attrs(({title, changeInput, placeholder, onSave, ...p}) => ({
    value: title,
    onChangeText: changeInput,
    placeholder: `Prayer `,
    multiline: false,
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

    // background-color: yellow;
    
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
  .attrs(({ action }) => ({name: recIcons[action], size: "md"}))``;

const Container = styled(Col)`
  flex: 1;
  // background-color: yellow;
`;

export {Props as RecorderProps};
export default RecorderWidget;

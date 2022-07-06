import { Audio } from "expo-av";
import {ValueOf} from "@/lib/utils";
import uuid from 'react-native-uuid';

// FIXME: durationMillis==0 https://github.com/expo/expo/issues/17909
class Recording {

    private recording: Audio.Recording;
    status: ValueOf<typeof Recording.Status> = Recording.Status.EMPTY;
    uri: string;
    id: string;
    duration: number = 0;

    constructor(kwargs?: Partial<Recording>) {
      this.reset(kwargs)
    }

    reset = (kwargs?: Partial<Recording>) => {
      return Object.assign(this, {
        id: uuid.v4(),
        recording: new Audio.Recording(),
        status: Recording.Status.EMPTY,
        uri: null,
        duration: 0,
      }, kwargs);
    }

    public static prepare = async () => {

      const self = new Recording() 

      try {
        self.status = Recording.Status.PREPARING
        console.debug('Requesting permissions ...');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true, 
          // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        })

        console.debug('preparing recording ...', Recording.Status[self.status]);
        await self.recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
        // self.recording.setOnRecordingStatusUpdate(self.onRecordingStatusUpdate);
        self.status = Recording.Status.READY 
        self.uri = self.recording.getURI()
        console.debug('preparing recording ...', Recording.Status[self.status], self.uri);

      } catch (err) {
        console.error('preparing recording failed', err);
        self.status = Recording.Status.FAILED
      }

      // FIXME: state is not reported in caller until self is returned
      return self
    }

    start = async () =>  {
      if(this.status===Recording.Status.READY || this.status===Recording.Status.PAUSED) {
        console.debug('starting recording ...');
        await this.recording?.startAsync()
        this.status = Recording.Status.STARTED
      } 
    }

    pause = async () => {
      if (this.status !== Recording.Status.STARTED) { return }
      console.debug('pausing recording ...');
      await this.recording?.pauseAsync()
      this.status = Recording.Status.PAUSED
    }

    stop = async () => {
      if(this.status <= Recording.Status.STOPPED) { return null }
      try {
        console.debug('stopping recording ...');
        const {durationMillis} = await this.recording.stopAndUnloadAsync();
        this.uri = this.recording.getURI()

        this.status = Recording.Status.STOPPED
        this.duration = durationMillis
        console.debug(`recording (${this.duration}s) stopped and stored at`, this.uri);

        // this.reset()
        
      } catch (err) {
        console.error('stopping recording failed', err);
        return null
      }
    }
    
    // called every 500ms and AFTER stop, start but asynchronously
    onRecordingStatusUpdate = ({canRecord, isRecording, isDoneRecording, durationMillis}: Audio.RecordingStatus) => {
      console.debug(`>>> onRecordingStatusUpdate ${Recording.Status[this.status]}`, `canRecord=${canRecord} isRecording=${isRecording} isDoneRecording=${isDoneRecording} durationMillis=${durationMillis}`)
      this.duration = durationMillis;
    }
}

namespace Recording {

  export enum Status { // respect to order !
    EMPTY, FAILED, STOPPED, PREPARING, READY, STARTED, PAUSED  }
}

export default Recording;
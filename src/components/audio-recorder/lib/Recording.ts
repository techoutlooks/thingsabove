import { Audio } from "expo-av";
import {ValueOf} from "@/lib/utils";
import uuid from 'react-native-uuid';
import ExponentAV from "expo-av/src/ExponentAV";
import { Observer } from "redux";
import { Observable } from "rxjs";

// FIXME: durationMillis==0 https://github.com/expo/expo/issues/17909
class Recording {

    private observer: Observer<Recording>;
    private audio: Audio.Recording;
    status: ValueOf<typeof Recording.Status> = Recording.Status.EMPTY;
    uri: string;
    id: string;
    duration: number = 0;

    constructor(kwargs?: Partial<Recording>) {
      Object.assign(this, {
        // observer: null,
        id: null,
        audio: new Audio.Recording(),
        status: Recording.Status.EMPTY,
        uri: null,
        duration: 0,
      }, kwargs)    
    }

    reset = () => {
      this.prepare()
        .then(recording => this.observer.next(recording) )
        .catch(error => {
          console.log('reset error', error)
          this.observer.error(error)
        })
    }


    on = () => {
      return new Observable<Recording|null>((observer) => {
        this.observer = observer 
        this.reset()
        return async () => await this.cleanup()
      })
    }

    /***
     * Prepare a new record
     */
    prepare = async (): Promise<Recording> =>  {

      const self = new Recording({observer: this.observer,}) 

      try {
        self.status = Recording.Status.PREPARING
        console.debug('Requesting permissions ...');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true, 
          // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        })

        console.debug(`preparing recording ...`);
        await self.audio.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
        // self.audio.setOnRecordingStatusUpdate(self.onRecordingStatusUpdate);
        self.status = Recording.Status.READY 
        self.uri = self.audio.getURI()
        self.id = self.uri.slice(self.uri.lastIndexOf('/') + 1)
        console.debug(`recording ${self.id} is ${Recording.Status[self.status]}`);

      } catch (err) {
        console.error('preparing recording failed', err);
        self.status = Recording.Status.FAILED
        Promise.reject(null)
      }

      // FIXME: state is not reported in caller until self is returned
      return self
    }

    start = async () =>  {
      if(this.status===Recording.Status.READY || this.status===Recording.Status.PAUSED) {
        console.debug(`starting recording ${this.id}...`);
        await this.audio?.startAsync()
        this.status = Recording.Status.STARTED
      } 
    }

    pause = async () => {
      if (this.status !== Recording.Status.STARTED) { return }
      console.debug(`pausing recording ${this.id} ...`);
      await this.audio?.pauseAsync()
      this.status = Recording.Status.PAUSED
    }

    /***
     * Stops and cleanup iff recording was started or paused
     * Resolves silently to void. stop() never rejects!
     */
    stop = async () => {

      if(this.status < Recording.Status.READY ) { 
        console.debug(`won't stop recording ${this.id} (${Recording.Status[this.status]}).`,
        `must be at least READY`);
        return 
      }

      try {
        console.debug(`stopping recording ${this.id} ...`);
        const {durationMillis} = await this.audio.stopAndUnloadAsync();
        this.uri = this.audio.getURI()

        this.status = Recording.Status.STOPPED
        this.duration = durationMillis
        console.debug(`recording ${this.id} (${this.duration}s) stopped and stored at`, this.uri);

        await this.reset()
        
      } catch (e) {
        console.error('stopping recording failed', e);
        return 
      }
    }

    /***
     * mere cleanup requested; eg.,
     * recording was only prepared (`READY` state), not `STARTED`.
     */
    cleanup = async () => {
      console.debug(`cleaning recording ${this.id} ...`);
      await ExponentAV.unloadAudioRecorder();
      await this.audio._cleanupForUnloadedRecorder({durationMillis: 0} as any);
      return 
    }
    
    /***
     * called every 500ms and AFTER stop, start but asynchronously
     */
    onRecordingStatusUpdate = ({canRecord, isRecording, isDoneRecording, durationMillis}: Audio.RecordingStatus) => {
      console.debug(`>>> onRecordingStatusUpdate ${Recording.Status[this.status]}`, `canRecord=${canRecord} isRecording=${isRecording} isDoneRecording=${isDoneRecording} durationMillis=${durationMillis}`)
      this.duration = durationMillis;
    }
}

namespace Recording {

  export enum Status { // CAUTION: order matters !
    EMPTY, FAILED, PREPARING, READY, STARTED, PAUSED, STOPPED }
}

export default Recording;
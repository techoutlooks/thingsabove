import * as av from 'expo-av'
import {EventEmitter} from 'fbemitter'
import {AVPlaybackSource, AVMetadata} from "expo-av/src/AV.types";



// TODO:


/***
 * @member loadedmetadata: only metadata loaded, media (duration, tracks, ...) unknown
 * @member loadeddata: frame at seek position loaded
 * @member play: `Audio.paused` changed to false
 */
enum PlaybackEvents {
  loadedmetadata = 'loadedmetadata',
  loadeddata = 'loadeddata',
  play = 'play',
  pause = 'pause',
  timeupdate = 'timeupdate',
  ended = 'ended'
}


type ValueOf<T> =  T[keyof  T]
type Callback = (audio: Audio) => void
export type PlaybackEvent = keyof typeof PlaybackEvents
type Playback = Partial<Record<PlaybackEvent, Callback>>

// @ts-ignore
type Sound = av.Audio


/***
 * **Audio()**
 * Automatically unloads audio once it has finished playing.
 * 
 * Helper class around expo-av SDK trying to mimic to HTMLMediaElement
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * https://docs.expo.dev/versions/latest/sdk/audio/#audiosound
 * https://docs.expo.dev/versions/latest/sdk/av/
 */
export default class Audio {

  uri: string = '';
  sound: Sound = null

  currentTime: number = 0
  duration: number = 0
  paused: boolean = false
  rate: number = 0
  muted: boolean = false
  volume: number = 0

  emitter = new EventEmitter()
  subscriptions = []


  constructor(sound: Sound) {}

  // playback
  play = async () => await this.sound?.playAsync()
  pause = async () => await this.sound?.pauseAsync()
  stop = async () => await this.sound?.stopAsync()
  unload = async () => { 
    try { 
      this.sound?.unloadAsync() ; 
      // console.debug('unloaded ...', this.uri) 
    } catch(e) { handleError(e) }
  }


  // events
  addEventListener = (event: PlaybackEvent, callback: Callback) =>
    this.subscriptions.push(this.emitter.addListener(event, callback))
  removeEventListeners = () => this.subscriptions.forEach(s => s.remove())


  public static async load(source: AVPlaybackSource, playback: Playback, shouldPlay: boolean = false) {

    const self = new Audio(source)
    try{

      // ensure register caller-supplied event listeners, if any
      // before expo calls `onPlaybackStatusUpdate()` asynchronously
      Object.entries(playback).forEach(([ev, fn]) =>
        self.addEventListener(ev, fn)) 

      // load sound
      // console.debug('loading ...', source);
      const { sound, status } = await av.Audio.Sound
        .createAsync(source, {shouldPlay}, self.onPlaybackStatusUpdate)
      sound && Object.assign(self, { sound, uri: status?.uri })
      // console.debug('loaded ...', status)

    } catch (e) {
      handleError(e)
    }

    // TODO: reject(null) if no sound

    return self
  }

  /**
   * **onPlaybackStatusUpdate()**
   *
   * Set playback props similar to HTMLMediaElement
   * called back every 500ms. unloads audio once playback endeds.
   */
  onPlaybackStatusUpdate = (status: av.AVPlaybackStatus) => {

    // fire events iff media loaded
    if(status.isLoaded) {

      // set props & fire 'loadeddata' signal
      this.duration = status.durationMillis
      this.paused = !status.isPlaying
      this.rate = status.rate
      this.muted = !!status.isMuted
      this.volume = status.volume
      this.emitter.emit(PlaybackEvents.loadeddata, this)

      // set seek prop and fire 'timeupdate' signal
      if(status.positionMillis) {
        this.currentTime = status.positionMillis
        this.emitter.emit(PlaybackEvents.timeupdate, this)
      }

      // fire play/pause signals conditionally
      // automatically unload audio if playback had ended.
      this.emitter.emit(status.isPlaying? PlaybackEvents.play: PlaybackEvents.pause, this)
      if (status.didJustFinish) {
        this.emitter.emit(PlaybackEvents.ended, this)
        this.unload().then(() => {})
      }
    }
  }

}

//
const handleError = (err: any) => {
  console.error(err)
  return err
}

// run action aynchronously
// eg. runAction(this, this.sound?.playAsync)
const runAction = (audio, func) => {
  new Promise((resolve, reject) => {
    !!!audio.souxnd && reject('no sound')
    func.apply(audio).then((res) => resolve(res))
  })
}

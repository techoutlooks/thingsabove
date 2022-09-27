import { memo, ComponentProps } from "react"
import { useMedia, AUDIOS_CACHE, AUDIOS_BUCKET} from "@/lib/supabase"
import AudioPlayer from "./audio-recorder/AudioPlayer"



type Props = { path: string, isStale?: boolean, key?: any}
    & Omit<ComponentProps<typeof AudioPlayer>, 'src'>

export default ({path: rPath, isStale, ...p}: Props) => {
  const path = rPath && `${AUDIOS_BUCKET}/${rPath}`
  const [{ uri}] = useMedia(path, AUDIOS_CACHE, isStale)
  return (
    <AudioPlayer {...{
      ...p, src: {uri, overrideFileExtensionAndroid: "m4a"}}} 
    />
  )
}
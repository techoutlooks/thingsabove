import { ComponentProps } from "react"
import { useAsset, AUDIOS_CACHE, AUDIOS_BUCKET} from "@/lib/supabase"
import PlayerWidget from "./audio-recorder/PlayerWidget"



type Props = { path: string, isStale?: boolean, key?: any}
  & Omit<ComponentProps<typeof PlayerWidget>, 'src'>

export default ({path: rPath, isStale, ...p}: Props) => {
  const path = rPath && `${AUDIOS_BUCKET}/${rPath}`
  const { fileUri } = useAsset(path, AUDIOS_CACHE, isStale)
  return (
    <PlayerWidget {...{
      ...p, src: { uri: fileUri, overrideFileExtensionAndroid: "m4a" }}} 
    />
  )
}
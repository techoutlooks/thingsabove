import { memo, ComponentProps, useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { ShareButton } from "./uiStyle/atoms"
import {Prayer} from "@/types/models"
import { useAuthId, useContact } from '@/hooks'
import { AUDIOS_BUCKET, getPublicUrl } from "@/lib/supabase"
import { bolderize } from "@/lib/utils"
import { DOMAIN_URL, BRAND_NAME } from '@env'


type Props = { prayer: Prayer } 
  & ComponentProps<typeof ShareButton> 


/**
 * <SharePrayer />
 * https://docs.expo.dev/versions/latest/react-native/share/
 * 
 * TODO: share proper SEO/OpenGraph link instead or mere text message

 */
export default memo(({prayer, ...rest}: Props) => {

  const url = `🔗 ${DOMAIN_URL}/${prayer.id}`

  const senderId = useAuthId()
  const sender = useContact(senderId)

  const [ audios, setAudios] = useState("")
  useEffect(() => {
    (async () => {
      await Promise.all(prayer.audio_urls
        .map(path => getPublicUrl(`${AUDIOS_BUCKET}/${path}`)))
        .then(urls => urls.filter(url => !!url).map(url => `🔊 ${url}`).join("\n"))
        .then(setAudios)
    })()
  }, [])
  
  const message = `${sender && bolderize(sender.displayName)} has shared a prayer with you: \n\n` + 
    bolderize(prayer.title) + '\n' + prayer.description + '\n\n' + url + '\n\n' + audios + '\n\n' + 
    `- ${bolderize(BRAND_NAME)}`
     
  return (
    <ShareButton {...{
      content: {
        message,                      
        title: prayer?.title,     // Android
        url                       // iOS
      },
      options: {
        dialogTitle:              // Android
          `Sharing Prayer (${prayer?.audio_urls.length} audios)`
      },
      ...rest
    }} />
  )
})
import { memo, ComponentProps, useEffect, useState } from "react"
import {Contact} from "@/state/contacts"
import { useAuthId, useContact } from '@/hooks'
import { bolderize } from "@/lib/utils"
import { ShareButton } from "./uiStyle/atoms"
import { DOWNLOAD_URL, BRAND_NAME } from '@env'


type Props = { contact: Contact } 
  & ComponentProps<typeof ShareButton> 


/**
 * <SharePrayer />
 * https://docs.expo.dev/versions/latest/react-native/share/
 * 
 * TODO: share proper SEO/OpenGraph link instead or mere text message

 */
export default memo(({contact, ...rest}: Props) => {

  const url = `🔗 ${DOWNLOAD_URL}`

  const senderId = useAuthId()
  const sender = useContact(senderId)
  const title = 'Sharing a Contact'
  
  const message = `Click to connect with ${bolderize(contact.displayName)} ` + 
    `from ${sender && bolderize(sender.displayName)}'s network :` + '\n\n' + 
    url + '\n\n' + 
    `- ${bolderize(BRAND_NAME)}`
  
  return (
    <ShareButton {...{
      content: {
        message,                      
        title,                    // Android
        url                       // iOS
      },
      options: {
        dialogTitle: title        // Android
      },
      ...rest
    }} />
  )
  
})



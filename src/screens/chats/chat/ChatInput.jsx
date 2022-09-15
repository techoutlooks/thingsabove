import React, { useState, useRef } from 'react'
import {TextInput, SendIcon} from '@/components/uiStyle/atoms'
import {trim} from "@/lib/utils"


const ChatInput = ({ sendMessage, disabled }) => {
  const [chatInput, setChatInput] = useState('')
  const [hideSend, setHideSend] = useState(false)

  const trimmedMessage = trim(chatInput)
  const hasInput = trimmedMessage.length > 0

  const send = async () => {
    sendMessage({
      type: 'm.text',
      body: trimmedMessage,
    })
    setHideSend(true)

    setChatInput('')
  }

  const changeInput = value => {
    setChatInput(value)
    setHideSend(false)
  }

  const showSendIcon = !hideSend && !disabled

  return (
    <TextInput
      value={chatInput}
      onChangeText={changeInput}
      placeholder="Type a message..."
      multiline
      style={textInputStyle}
      postIcon={showSendIcon && <SendIcon onPress={send} show={hasInput} />}
      textBreakStrategy="simple"
      disabled={disabled}
    />
  )
}
const textInputStyle = { flex: 1 }


export default ChatInput

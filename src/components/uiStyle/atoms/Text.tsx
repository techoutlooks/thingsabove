import {TextProps} from "react-native"
import styled from "styled-components/native"

const LIST_ITEM_TEXT_MAX_LEN = 35


type Props = Omit<TextProps, 'children'> & { 
  children: string, maxLength?: number }


export default styled.Text.attrs(
  ({children: text, maxLength, ...p}: Props) => {
    const len = maxLength ?? LIST_ITEM_TEXT_MAX_LEN
    return ({
      children: text && (text.length > len ? 
        `${text.slice(0, len)} ...`: text),
      ...p
  })
})``


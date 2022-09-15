import {TextProps} from "react-native"
import styled from "styled-components/native"

const LIST_ITEM_TEXT_MAX_LEN = 35


type Props = Omit<TextProps, 'children'> & { children: string}

export default styled.Text.attrs(({children: text, ...p}: Props) => ({
    children: text && (text.length > LIST_ITEM_TEXT_MAX_LEN ? 
      `${text.slice(0, LIST_ITEM_TEXT_MAX_LEN)} ...`: text),
    ...p
  }))``


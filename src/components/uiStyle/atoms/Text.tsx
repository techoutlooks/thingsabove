import {TextProps} from "react-native"
import styled from "styled-components/native"


type Props = Omit<TextProps, 'children'> & { 
  children: string, numberOfCharacters?: number }


export default styled.Text.attrs(({children: text, ...p}: Props) => ({
  children: !p?.numberOfCharacters ? text : text && (
    text.length > p.numberOfCharacters ? 
    `${text.slice(0, p.numberOfCharacters)} ...`: text),
  ...p
}))`
  font-family: SFProDisplay-Regular;
  font-size: 16px;
  line-height: 18px;
`


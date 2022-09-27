import React, { useEffect, useRef, useState, useContext } from 'react'
import { Keyboard, TextInputProps as RNTextInputProps } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import styled, { ThemeContext } from 'styled-components/native'


type IconType = JSX.Element | string
type Props = {
  preIcon?: IconType, postIcon?: IconType
} & RNTextInputProps

export {Props as TextInputProps} 

/***
 * RN's <TextInput/> Customization
 * Blurs wrapped RN's <TextInput/> on keyboard hidden
 * Adaptive height based on inner <Input/> content
 * Forwards `style` to inner <Input/>
 *
 * @param preIcon
 * @param postIcon
 * @param style
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export default ({ preIcon, postIcon, style, ...props }: Props) => {

  const inputRef = useRef(null)
  const [inputHeight, setInputHeight] = useState(18)
  const theme = useContext(ThemeContext)

  const blurInput = () => {
    inputRef.current.blur()
  }

  useEffect(() => {
    const didHideListener = Keyboard.addListener('keyboardDidHide', blurInput)
    return () => didHideListener.remove()
  }, [])

  const onContentSizeChange = ({ nativeEvent }) => {
    const newHeight = Math.floor(nativeEvent.contentSize.height)
    setInputHeight(newHeight)
  }


  const preIconElement =
    typeof preIcon === 'string' ? (
      <MaterialCommunityIcons
        name={preIcon}
        size={18}
        color={theme.colors.mutedFg}
        style={{ marginRight: 8 }}
      />
    ) : (preIcon)

  const postIconElement =
    typeof postIcon === 'string' ? (
      <MaterialCommunityIcons
        name={postIcon}
        size={24}
        color={theme.colors.mutedFg}
        style={{ marginLeft: 8, marginRight: 12 }}
      />
    ) : ( postIcon )

  return (
    <Container
      style={style}
      hasPost={!!postIconElement}
      disabled={props.disabled}
    >
      {preIcon && preIconElement}
      <Input
        {...props}
        style={[{ height: inputHeight }]}
        ref={inputRef}
        onContentSizeChange={onContentSizeChange}
      />
      {postIcon && postIconElement}
    </Container>
  )
}


const Container = styled.View`
  background-color: ${p => p.theme.colors.inputBg};
  border-radius: 10px;
  padding: 0 ${p => (p.hasPost ? 0 : 12)}px 0 8px;
  min-height: 40px;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  ${p => p.disabled && `
    background-color: ${p => p.inputDisabledBg};`}
  
  // optional iff default font defined
  ${p => `font-size: ${p?.style?.fontSize || '16px'};`}

`

const Input = styled.TextInput.attrs(p => ({
  placeholderTextColor: p.disabled ?
      p.inputDisabledFg : p.inputPlaceholder,
  ...p
}))`
  flex: 1;
  max-height: 120px;
  min-height: 18px;
  color: ${p => p.theme.colors.inputFg};
  text-align-vertical: top;
  padding: 9px 0;

  ${p => p.disabled && `color: ${p.theme.colors.inputDisabledFg};`}

`

import React from 'react'
import {ImageProps, ImageURISource, TouchableOpacity } from "react-native"
import styled from 'styled-components/native'
import PropTypes from 'prop-types'
import { LinearGradient } from 'expo-linear-gradient'

import { getAvatarColor } from '@/lib/userColor'

type  Props = { 
  avatar?: null | string | string[], 
  size: number, style: ImageProps["style"], 
  onPress?: (ev: any) => void
}
// type Props = { 
//   size: number
//   onPress: (ev: any) => void
// } & Pick<ImageProps, 'source'|'style'>

/***
 * <Avatar />
 * Renders <Image source={avatar} ... /> if avatar is the regular 
 * `{uri: <publicUrl>}` object, ie. `ImageProps["style"]`;
 * or first two letters (initials) of string if avatar is a string,
 * or the default picture (`./default.png`) if avatar is undefined.
 */
const Avatar = ({ avatar, size, style, onPress }: Props) => {


  const borderRadius = Math.round(size * 0.33)
  const containerStyles = [{width: size, height: size}, style]

  if (!!!(avatar?? avatar?.length)) {
    return (
    <Container {...{onPress, containerStyles}}>
      <Picture source={require("./default.png")} />
    </Container>)
  }

  // display initials instead of image,
  // iff avatar is a string.
  if (typeof avatar === 'string' && avatar.length > 0)  {
    const { backgroundLight, backgroundDark, foreground } = 
      getAvatarColor(avatar, )

    return (
      <InitialsContainer {...{onPress, style}}
        style={{ ...containerStyles, borderRadius }}
        colors={[backgroundLight, backgroundDark]}
      >
        <Initials {...{onPress}}
          style={{ color: foreground, fontSize: Math.round(size * 0.4) }}
        >
          {avatar.slice(0,2)}
        </Initials>
      </InitialsContainer>
    )
  }

  return (
    <Container {...{style: containerStyles, onPress}}>
      {avatar.length === 1 && (
        <Picture source={{ uri: avatar[0] }} style={{ borderRadius }} />
      )}
      {avatar.length > 1 && (
      <>{avatar.map(((uri, i) => (<Avatar1 source={{ uri}} />)))} </>)}
    </Container>
  )
}

export default Avatar;

Avatar.defaultProps = {
  size: 40,
}

// Avatar.propTypes = {
//   size: PropTypes.number,
//   avatar: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.arrayOf(PropTypes.string),
//   ]),
// }


const Container = styled.TouchableOpacity`
  position: relative;
  overflow: hidden;
`

// renders a default picture iff exists source.uri but,
// it is the empty string, null or undefined
// const Picture = styled.Image.attrs<ImageProps>(({source}) => ({
//   source: !(source?.hasOwnProperty('uri') && !!!source?.uri) ? 
//     source : require("./default.png")
// }))`
//   width: 100%;
//   height: 100%;
// `
const Picture = styled.Image.attrs<ImageProps>(({source}) => ({
  source
}))`
  width: 100%;
  height: 100%;
`

const Avatar1 = styled(Picture)`
  border-radius: 11px;
  position: absolute;
  top: 0;
  left: 0;
  width: 70%;
  height: 70%;
`


const InitialsContainer = styled(p => (
  <TouchableOpacity>
    <LinearGradient {...p} />
  </TouchableOpacity>
))`
  align-items: center;
  justify-content: center;
`

const Initials = styled.Text`
  font-weight: bold;
  text-align: center;
  color: #eafbe0;
  text-transform: uppercase;
`

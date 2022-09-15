import React, { useMemo } from 'react'
import { View } from 'react-native'


type Props = {
  width?: number, height?: number, style?: Object }

  
const Spacer = ({ height, width, style }: Props) => {
  const memoStyle = useMemo(() => ({ width, height, ...style }),
      [width, height, style])
  return <View style={memoStyle} />
}

export default Spacer

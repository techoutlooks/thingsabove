import React from 'react'
import ContentLoader, { Circle } from "react-content-loader/native"

const ThreeDots = (props) => (
  <ContentLoader
    viewBox="0 0 400 160"
    height={70}
    width={400}
    backgroundColor="transparent"
    {...props}
  >
    <Circle cx="150" cy="86" r="8" />
    <Circle cx="194" cy="86" r="8" />
    <Circle cx="238" cy="86" r="8" />
  </ContentLoader>
)

ThreeDots.metadata = {
  name: 'RioF',
  github: 'clariokids',
  description: 'Three Dots',
  filename: 'ThreeDots',
}

export default ThreeDots

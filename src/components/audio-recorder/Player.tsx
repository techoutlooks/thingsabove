import React from "react";
import styled, { css } from "styled-components/native";
import {useRecordings} from "./lib";
import AudioPlayer from "./AudioPlayer"



const Player = () => {

  const {listeningTo} = useRecordings()
  const uri = listeningTo?.uri

  return (
    !uri ? null : (
    <AudioPlayer {...{src: {uri}, shouldPlay: true}} />)
  )
}


export default Player;



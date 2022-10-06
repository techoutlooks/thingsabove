import React from "react";
import {useRecordings} from "./lib";
import PlayerWidget from "./PlayerWidget"



const Player = () => {

  const {listeningTo} = useRecordings()
  const uri = listeningTo?.uri

  return (
    !uri ? null : (
    <PlayerWidget {...{src: {uri}, shouldPlay: true}} />)
  )
}


export default Player;



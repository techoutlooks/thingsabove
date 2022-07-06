import React, {useState} from "react";
import styled from "styled-components/native";

import {Col} from "@/components/atoms";

import Player from "./Player";
import Recorder from "./Recorder";
import {RecProvider} from "./lib";


type Props = {};

const RecorderPlayer = (props: Props) => {


  return (
    <Container>
      <RecProvider>
        <Recorder />
        <Player />
      </RecProvider>
    </Container>
  );
};

const Container = styled(Col)`
  padding: 12px;
`;

export default RecorderPlayer;

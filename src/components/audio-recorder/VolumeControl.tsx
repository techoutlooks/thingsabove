import React, { useEffect, useReducer } from "react";
import styled from "styled-components/native";

import LineControl from "./LineControl";
import { Button, Row } from "@/components/uiStyle/atoms";

// TODO: volume seeking

const VolumeControl = ({ percentage }) => {
  const scale = (v: number) => (!v ? 0 : v <= 1 ? v * 100 : v);

  const [volume, setVolume] = useReducer((s, a) => scale(a), percentage);

  useEffect(() => {
    setVolume(percentage);
  }, [percentage]);

  return (
    <Container>
      <Button name={`volume-${volume ? "up" : "mute"}`} />
      <VolumeLineControl percentage={volume} />
    </Container>
  );
};

const VolumeLineControl = styled(LineControl)`
  width: 50px;
  //position: relative;
`;

const Container = styled(Row)`
  line-height: 10px;
  padding: 0 5px;
`;

export default VolumeControl;

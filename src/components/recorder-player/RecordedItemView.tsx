import React, {ComponentType} from "react";
import {ViewProps} from "react-native";
import styled from "styled-components/native";
  
  import Duration from "./Duration";
  import {RecordedItem} from "./lib";
  
  import { 
    RADIUS, useFmtTime,
    Button,
  } from "@/components/atoms";
  
  

/***
 * **RecordedItemView**
 *
 * Listen/Play recorded audio in-memory
 */
 type Props = { 
    recording: RecordedItem, 
    play: (r: RecordedItem) => void,
    del: (r: RecordedItem) => void,
  } & typeof Bar;
  

const RecordedItemView = styled((props: Props) => {
  const { recording, del, play, ...p } = props
  const [duration,] = useFmtTime(recording.duration);
  return (
    <Bar {...p}>
      <Delete onPress={() => del(recording)} />
      <Title>{recording.title}</Title>
      <Listen onPress={() => play(recording)} />
      <Save />
      <Duration value={duration} />
      {/* <Share /> */}
    </Bar>
  )
})<Props>``


const MemoizedRecordedItemView = React.memo<Props>(
  RecordedItemView, 
  (p1, p2) =>  (p1.recording.id === p2.recording.id) 
            && (p1.highlighted === p2.highlighted)
)

  const Title = styled.Text`
  flex: 0.8;
  color: ${(p) => p.theme.colors.titleFg};
`;

const Save = styled(Button).attrs((p) => ({
  name: "save",
}))``;

const Listen = styled(Button).attrs((p) => ({
  name: "play-arrow",
}))``;

const Delete = styled(Button).attrs((p) => ({
  name: "delete",
}))``;

const Share = styled(Button).attrs((p) => ({
  name: "share",
}))``;



type BarProps = {highlighted: boolean} & ViewProps
const Bar = styled.View<BarProps>`
  ${p => !!p.highlighted && `background-color: ${p.theme.colors.mutedFg}`}
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: ${RADIUS}px;
  margin: 5px 0;
`;

export default MemoizedRecordedItemView;

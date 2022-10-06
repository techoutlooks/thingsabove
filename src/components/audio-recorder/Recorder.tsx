/***
 * Standalone components: <RecorderPlayer/>, <AudioPlayer/>
 * Inspired from :https://jsfiddle.net/grishkovelli/rb1anxyj/ and
 * https://www.telerik.com/blogs/how-create-react-audio-library
 */
 import React, {useCallback, useState} from "react";
 import styled from "styled-components/native";
 
 import {Col} from "@/components/uiStyle/atoms";
 
 import Player from "./Player";
 import Recorder, {RecorderProps} from "./RecorderWidget";
 import {RecProvider, RecordedItem} from "./lib";
 
 
 type Props = {} & RecorderProps
 
export default ({onChange: callback}: Props) => {
   const [recordings, setRecordings] = useState<RecordedItem[]>()
 
   // only chance to get the recorded files,
   // since <RecProvider/> is not mounted yet
   const onChange = useCallback(recordings => {
     setRecordings(recordings)
     callback && callback(recordings)
   }, [])
  
   return (
     <Container>
       <RecProvider>
         <Recorder {...{onChange}} />
         {!!recordings?.length && (<Player />) }
       </RecProvider>
     </Container>
   );
 };
 
 const Container = styled(Col)`
   flex: 1;  
   align-self: center;
 `;
 
 
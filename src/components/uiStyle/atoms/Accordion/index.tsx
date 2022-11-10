
import React, { useCallback, memo } from "react";
import styled from "styled-components/native"

import Text from "../Text" 
import FlatList from "../FlatList"
import List, { List as ListType } from "./List";



type Props = { 
  header?: any, data: ListType[] }


export { ListType }
export const Accordion = memo(({header, data}: Props) => {

  const headerElement = header && (typeof header === "string" ? Header : header())
  const keyExtractor = useCallback((item, i) => item+i, []) 
  const renderItem = useCallback(({item: list}) => (<List {...{list}} />), [])
  
  return (
    <Container>
      { headerElement }
      <FlatList {...{ data, renderItem, keyExtractor }} />
    </Container>
  );
})


const Header = styled(Text)`
  font-size: 32;
  font-weight: bold;
`
const Container = styled.View`
  flex: 1;
  padding: 16;
  background-color: #f4f4f6;
`



import styled from "styled-components/native"
import {FontAwesome5} from "@expo/vector-icons";

import { SearchInput } from "@/components/uiStyle/atoms"



export default styled(SearchInput).attrs(p => ({
  autoFocus: false, multiline: false,
  placeholder: "Search...",
  postIcon: null,
  preIcon:
    <FontAwesome5
      name="search"
      size={24}
      color={p.theme.colors.mutedFg}
      style={{marginLeft: 8, marginRight: 10}}
    />,
  ...p
}))`
  flex: 1;
  font-size: 12px;
`
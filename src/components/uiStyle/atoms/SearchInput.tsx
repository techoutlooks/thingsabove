import React from 'react'
import TextInput from './TextInput'

type Props = { postIcon: any } & typeof TextInput

const SearchInput = ({postIcon, ...props}: Props) => (
  <TextInput
    placeholder="Search..."
    multiline={false}
    style={textInputStyle}
    // postIcon={postIcon ?? "account-search-outline"}
    {...props}
  />
)


const textInputStyle = {flex: 1}

export default SearchInput

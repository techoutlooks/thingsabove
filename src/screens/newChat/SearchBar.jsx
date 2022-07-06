import React from 'react'

import {TextInput} from '@/components/atoms'

const SearchInput = props => (
  <TextInput
    placeholder="Search..."
    multiline
    style={textInputStyle}
    postIcon="account-search-outline"
    {...props}
  />
)
const textInputStyle = { flex: 1 }

export default SearchInput

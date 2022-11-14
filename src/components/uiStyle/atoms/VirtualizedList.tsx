import React, { useMemo, useCallback } from 'react'
import { FlatList } from "react-native"
import styled from 'styled-components/native'



/***
 * Fix for https://stackoverflow.com/a/62968543:
 * "VirtualizedLists should never be nested inside plain ScrollViews ..."
 * DOESNT REALLY WORK
 */
export default styled(({ children, style }) => {
  const data = useMemo(() => [], [])
  return (
    <FlatList {...{data, style}}
      renderItem={() => null}
      ListHeaderComponent={
        <>{children}</>
      }
    />
  )
})``



import { useMemo, useEffect, memo } from "react"
import {Image, ImageProps, View} from "react-native"
import styled from "styled-components/native"

import useMedia from "../useMedia"
import { AVATARS_CACHE } from "../constants"

/***
 * @param {string} path : full `bucket/image.ext` path of image.
 * @param render: factory that renders a custom Image component
 * @param {boolean} isStale: force re-download, since server vs. local files are not synced.
 * @param {boolean} noCache: disable RN's <Image/> cache. Forces download.
 */
type Props = {
  path: string|null,
  render?: any
  isStale?: boolean 
  noCache?: boolean
} & Omit<ImageProps, 'source'>

/***
 * <SupabaseImage path="..." />
 * Image factory that displays an image from a supabase public bucket.
 * Is generic component, NOT aware of bucket it should upload to: provide 
 * full path to `path` prop; ie. `bucket/path/to/image.ext`
 * Renders an image with props similar to RN's ImageProps.
 * Renders a default image if path is null/undefined or the empty string.
 */
export default memo(({ path, render, isStale: shouldDownload, noCache, 
  ...props }: Props) => {
  
  // isStale==true iff download actually was performed (useMedia -> useDownload), 
  // ie., iff didn't use cache, add `?v=xxx` to the image uri to force <Image/> to refresh
  // https://github.com/facebook/react-native/issues/12606
  const [{uri, isStale}] = useMedia(path, AVATARS_CACHE, shouldDownload)
  const source = useMemo(() => uri && ({ uri: uri + 
    ((noCache || isStale) ? `?v=${new Date().toISOString()}` : '')
  }), [uri, isStale, noCache])

  // console.log(`supabase.Image(${path}) uri=${uri} path=${path} source=`, source)
  
  return !render ? (
    source ? <Image {...{source, ...props}} /> : <NoImage {...props} />
  ) : (render({source, ...props}))

})


const NoImage = (props: Omit<ImageProps, 'source'>) => (
  <Image {...{source: require("./default.png"), ...props } } /> )
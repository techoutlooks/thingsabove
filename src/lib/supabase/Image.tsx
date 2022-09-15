import { useMemo, useEffect } from "react"
import {Image, ImageProps} from "react-native"
import useMedia from "./useMedia"

import { AVATARS_CACHE } from "./constants"

/***
 * @param path : full `bucket/image.ext` path
 * @param render: factory that renders a custom Image component
 * @param isStale: ha file changed on server and should be re-read?
 * @param noCache: disable RN's <Image/> cache?
 */
type Props = {
  path: string,
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
 */
export default ({ path, render, isStale: shouldDownload, noCache, 
  ...props }: Props) => {
  
  // isStale==true iff download actually was performed, ie., didn't use cache!
  // add `?v=xxx` to the image uri to force <Image/> to refresh
  // https://github.com/facebook/react-native/issues/12606
  const [{uri, isStale}] = useMedia(path, AVATARS_CACHE, shouldDownload)
  const source = useMemo(() => ({ uri: uri + 
    ((noCache || isStale) ? `?v=${new Date().toISOString()}` : '')
  }), [uri, isStale, noCache])

  // console.log(`___________________________________/${source?.uri}/_____________________________`, noCache)
  return !render ? (
    source ? <Image {...{source, ...props}} /> : <></>
  ) : (render({source, ...props}))

}

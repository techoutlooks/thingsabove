import React, { useMemo } from "react"
import useMedia from "./useMedia"

/***
 * Retrieve a single asset from cache, 
 * or download iff cache miss.
 */
export default (path: string|null, cacheDir: string, forceDownload = false) => {
  const paths = useMemo(() => [path], [path])
  const { cached, errors } = useMedia(paths, cacheDir, forceDownload)
  return cached?.[0] || {}
}
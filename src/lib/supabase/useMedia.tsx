import { useState, useEffect } from 'react';

import * as FileSystem from 'expo-file-system';
import useDownload from "./useDownload"
import { getOrCreateDir, splitPath } from './storage';


/*** 
 * Cache-aware file retriever, from Supabase public bucket.
 * @param shouldDownload: will force download, even if file is cached
 */
const useMedia = (path: string|null, cacheDir: string, shouldDownload = false) => {

  // ensure supplied path is legit
  const [bucketPath, fileName] = splitPath(path)
  path = fileName ? path : null

  // forbid updating state of component that's abt to be unmounted
  const [willUnmount, setWillUnmount] = useState(false)
  useEffect(() => { return () => { setWillUnmount(true) } }, [path])

  const [cachedFile, setCachedFile] = useState<string>()
  const [willDownload, setWillDownload] = useState(shouldDownload)
  const [error, setError] = useState<Error|null>(null)

  // hold downloading till advised by `willDownload`
  const [{isStale, fileUri: downloadedFile, publicUrl, error: downloadError}] = 
    useDownload(path, cacheDir, !willDownload)

  // if useDownload() reported that it just performed a download,
  // set that uri to be returned. set flags accordingly.
  useEffect(() => { 
    (isStale && downloadedFile) && setCachedFile(downloadedFile) 
    setWillDownload(!downloadedFile) }, [isStale, downloadedFile])

  // console.debug(`useMedia(${path}) -> `,
  //   `[willDownload?=${willDownload}, isStale=${isStale}]`, 
  //   `cachedFile(uri)=${cachedFile}`, `publicUrl=${publicUrl}`)

  // instruct download (by useDownload() when setWillDownload truthy) 
  // happens iff local file doesn't exist, AND shouldDownload truthy.
  useEffect(() => {

    if(downloadError) { setError(downloadError); return  }
    if(fileName) {
      (async () => {
        try {
          const localFile = await getOrCreateDir(cacheDir)
            .then(cacheDir => `${cacheDir}/${fileName}`)
          await FileSystem.getInfoAsync(localFile)
            .then(info => {
              if (!info.exists || shouldDownload) { 
                !willUnmount && setWillDownload(true)
              } else { 
                !willUnmount && setWillDownload(false)
                !willUnmount && setCachedFile(info.uri) }
            })
        } catch(e) {
          setError(e.message)
          console.error(e)
        } finally {
          !willUnmount && setWillDownload(false)
        }
      })()
    }

  }, [path, cacheDir, shouldDownload, downloadError])

    
return [{ isStale, uri: cachedFile, publicUrl, error }]

}




export default useMedia
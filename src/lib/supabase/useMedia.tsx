import { useState, useEffect } from 'react';

import * as FileSystem from 'expo-file-system';
import useDownload from "./useDownload"
import { getOrCreateDir } from '../storage';

/*** 
 * Cache-aware file retriever, from Supabase public bucket.
 * @param shouldDownload: will force download, even if file is cached
 */
const useMedia = (path: string, cacheDir: string, shouldDownload = false) => {

  const [willUnmount, setWillUnmount] = useState(false)
  useEffect(() => { return () => { setWillUnmount(true) } }, [path])

  const [cachedFile, setCachedFile] = useState<string>()
  const [willDownload, setWillDownload] = useState(shouldDownload)
  const [error, setError] = useState<Error|null>(null)

  // hold downloading till advised by `willDownload`
  const [{isStale, fileUri: downloadedFile, publicUrl, error: downloadError}] = 
    useDownload(path, cacheDir, !willDownload)
  useEffect(() => { downloadedFile && setCachedFile(downloadedFile) 
    setWillDownload(false) }, [isStale, downloadedFile])

  console.debug(`useMedia(${path}) -> `,
    `[willDownload?=${willDownload}, isStale=${isStale}]`, 
    `cachedFile=${cachedFile}`, `publicUrl=${publicUrl}`)

  // whether to download?
  useEffect(() => {

    if(downloadError) { setError(downloadError); return  }
    if(!!path) {

      (async () => {

          try {
            const fileName = path.slice(path.lastIndexOf("/")+1)
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

  }, [path, cacheDir, shouldDownload, downloadedFile, downloadError])

    
return [{ isStale, uri: cachedFile, publicUrl, error }]

}




export default useMedia
import { useEffect, useState } from "react"
import { download } from "./storage";

/***
 * Download a file from Supabase's public bucket to the local filesystem
 * Hold download iff `pause` is true.
 *
 * Implement a workaround to cache base64 images from Supabase public buckets,
 * since Supabase publicURLs can't be displayed by regular RN's Image
 * Output: the public url and blob of stored file as an array.
 * 
 * @return
 * isState: file was downloaded/overwritten, so UI should trigger a refresh
 * publicUrl: public url of file on Supabase server
 * fileUri: local uri of file after download from Supabase
 */
const useDownload = (path: string, cacheDir: string, paused=false) => {

  const [{fileUri, publicUrl, isStale}, set] = useState({
    isStale: false, fileUri: null, publicUrl: null,
  })
  const [error, setError] = useState<Error|null>(null)

  useEffect(() => {
    if(path && !paused) {
      (async () => {
        try {
          const [fileUri, publicURL] = await download(path, cacheDir)
          set({publicUrl: publicURL, fileUri, isStale: true})
        } catch (e) {
          const msg = `Error downloading '${path}' from bucket: `
          setError(new Error(msg + e.message))
        }
      })();
    }
  },[path, paused]);

  // console.debug(`useDownload(${path}) -> publicUrl=${publicUrl} [paused?=${paused}]`, 
  //   `fileUri=${fileUri}`)

  return [{fileUri, publicUrl, isStale, error}]
}


export default useDownload
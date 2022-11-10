import React, { useEffect, useState, useReducer, Reducer } from "react"
import * as storage from "./storage";


type P = string|null  // file locactor, eg. path, uri, url

/** 
 * R - Result
 * @param path: original path
 * @param didDownload: whether file was actually downloaded/overwritten
 * @param publicUrl: public url of file on Supabase server
 * @param fileUri: local uri of file after download from Supabase */
export type Download = { path: P, fileUri: P, publicUrl: P, didDownload: boolean}

type R = { downloads: Download[], errors: Error[]|null }

const wontDownload = { publicUrl: null, fileUri: null, didDownload: false }


/***
 * Download files from Supabase's public bucket to the local filesystem
 * Hold all downloads iff `pause` is true.
 * 
 * Download files in sequential manner given their path relative to bucket.
 *
 * Implement a workaround to cache base64 images from Supabase public buckets,
 * since Supabase publicURLs can't be displayed by regular RN's Image
 * Output: the public url and blob of stored file as an array.
 * 
 * @return {R}
 */
export default (paths: P[], cacheDir: string, paused=false): R => {

  const [downloads, push] = useReducer<Reducer<Download[], Download>>((s,a) => [...s, a], [])
  const [errors, pushError] = useReducer<Reducer<Error[]|null, Error>>(
    (s, a) => !s ? [a] : [...s, a], null)

  // if supplied path is legit, return it, null elswise! 
  const validatePath = (path: P) => 
    storage.getFileName(path) && path || null

  /* perform download, always resolves to a Download instance;
  to wontDownload iff invalid/fails, or downloaded file's metadata
   ------------------------------------------------------------- */ 
  const download = (path: P) => new Promise<Download>(
    (resolve) => {
      path = validatePath(path)
      !path ? resolve({path, ...wontDownload}) : 
        storage.download(path, cacheDir)
          .then(([publicUrl, fileUri]) => push({path, publicUrl, fileUri, didDownload: true}))
          .catch(e => {
            resolve({path, ...wontDownload})
            pushError(new Error(
              `Error downloading '${path}' from bucket: ` + e?.message ?? e))
          })
    }
  )

  useEffect(() => {
    if(!!paths?.length && !paused) {
      (async () => {
        await paths.reduce(async (acc, path) => { 
          await download(path)
          await acc
        }, Promise.resolve())
      })();
    }
  },[paths, paused]);

  // console.debug(`**** useDownload(paths=${paths}, paused=${paused}) -> `, downloads)
  return { downloads, errors }
}



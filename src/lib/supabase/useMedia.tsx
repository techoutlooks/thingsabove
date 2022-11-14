import { useState, useEffect, useReducer, Reducer } from 'react';

import { uniqBy } from 'lodash';
import * as FileSystem from 'expo-file-system';
import useDownloads, { Download } from "./useDownloads"
import * as storage from "./storage";



/*** 
* Download reducer - download cache
* Handles dispatch {statusType, [index, payload]} of download status 
* of individually requested file.
------------------------------ */
type D = Pick<Download, 'fileUri'|'path'>
type R1 = Reducer<D[], D>
const downloadReducer: R1 = (s, d) => uniqBy(
  [...s, { fileUri: d.fileUri, path: d.path}], 'fileUri')

/***
* Statuses reducer - download and error states
* Handles dispatch {statusType, [index, payload]} of download status 
* of individually requested file.
------------------------------ */
enum StatusTypes { willDownload = "willDownload" }
type Status = {
  [StatusTypes.willDownload]: boolean[], }

type A2 = Record<StatusTypes, [number, any]> 
type R2 = Reducer<Status, Partial<A2>>
const statusReducer: R2 = (s: Status, a: Partial<A2>): Status => {
  const b = Object.fromEntries(
    Object.entries(a).map(([status, [i, payload]]) => 
      [status, s[status]?.splice(i, 1, payload)] ))
  return {...s, ...b}
}

/***
* Errors reducer
------------------------------ */
type Errors = ReturnType<typeof useDownloads>['errors']
type R3 = Reducer<Errors, Error[]> 
const errorsReducer: R3 = (s, a) => [ ...(!s ? []:s), ...a]




/*** 
 * Cache-aware file retriever, from Supabase public bucket.
 * Per-file workflow as follows:
 * -> willDownload? -> perform download -> cache download / clean flags
 * 
 * @param paths: full supabase paths to retrieve 
 * @param cacheDir: from/where to retrieve/cache the downloads?
 * @param forceDownload: initial state. will force download, even if file is cached 
 ***/
const useMedia = (paths: Parameters<typeof useDownloads>[0]|null, 
  cacheDir: string, forceDownload = false) => {

  // if(!paths?.length) return { cached: [], errors: null }

  /* UI
  forbid updating state of component that's abt to be unmounted
  ========================= */
  const [willUnmount, setWillUnmount] = useState(false)
  useEffect(() => { return () => { setWillUnmount(true) } }, [paths])

  /* Download
  ========================= */

  const [cached, markCached] = useReducer<R1>(downloadReducer, [])
  const [status, setStatus]  = useReducer<R2>(statusReducer, { 
    willDownload: (paths ?? [])?.map(p => !!p && forceDownload) })
  const [errors, addErrors] = useReducer<R3>(errorsReducer, null)

  /* perform new download
  hold downloading till advised by `willDownload`
  ------------------------------------------------------------- */ 
  const {downloads, errors: downloadErrors} = useDownloads(
    paths, cacheDir, !status.willDownload)

  /* cache new download
  if useDownloads() reported that it just performed a download, set that uri
  to be returned by the hook, then update per-download status flags accordingly.
  ------------------------------------------------------------- */ 
  useEffect(() => { 
    downloads.forEach((d, i) => {
      (d.fileUri && d.didDownload) && markCached(d)
      !willUnmount && setWillDownload(i, false) })
  }, [downloads])


  /* detect cache hit
  on subsequent hook calls, ie. hook props changed.
  instructs download of files (sets willDownload on individual files)
  iff file doesn't exist in cache OR forceDownload truthy.
  ------------------------------------------------------------- */ 
  useEffect(() => {
    if(!!downloadErrors?.length) { 
      addErrors(downloadErrors); return  }

    (async () => {
      const promises = downloads.map((d, i) => doSetWillDownload(i))
      await Promise.all(promises)
    })()
  }, [paths, cacheDir, forceDownload, downloadErrors])

  
  /* Funcs
  ========================= */

  const setWillDownload = (i: number, value: boolean) =>
    !willUnmount && paths[i] && setStatus({ [StatusTypes.willDownload]: [i, value] })

  const doSetWillDownload = async (i: number) => {
    try {
      const path = paths[i]
      const fileName = storage.getFileName(path)
      if(fileName) {
        const localFile = await storage.getOrCreateDir(cacheDir)
          .then(cacheDir => `${cacheDir}/${fileName}`)
        await FileSystem.getInfoAsync(localFile)
          .then(info => {
            if (!info.exists || forceDownload) { 
               setWillDownload(i, true)
            } else { 
              setWillDownload(i, false)
              !willUnmount && markCached({path, fileUri: info.uri }) 
            }
        })
      }
    } catch(e) {
      addErrors([e.message])
      console.error(e)
    } finally {
      setWillDownload(i, false)
    }

  }

  // !!paths?.length && console.debug(`**** useMedia(paths=${paths}, forceDownload=${forceDownload}) -> `, 
  //   `status=${JSON.stringify(status)}`, `cached=`,cached)

  return { cached, errors }

}



export default useMedia
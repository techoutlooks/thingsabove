import * as FileSystem from 'expo-file-system';
import { decode } from "base64-arraybuffer";
import * as supabase from "./client"



/***
 * Download resource at bucket's `path` 
 * from Supabase to local cache dir
 */
 export function download(path: string, cacheDir: string) {


  return new Promise<[string|null, string|null]>((resolve, reject) => {

    const fileName = path.slice(path.lastIndexOf("/")+1)
    if(!fileName) {
      resolve([null, null])
      
    } else {
      supabase.getPublicUrl(path).then(publicURL => {
        if(!publicURL ) {
          reject(new Error(`No publicURL found for ${path}`)) 
        } else {
            getOrCreateDir(cacheDir).then(dir => {
              FileSystem.downloadAsync(publicURL, `${dir}/${fileName}`)
                .then(({uri}) => { 
                  // console.debug(`>>> download() cached ${path} -> ${uri}`, fileName)
                  resolve([uri, publicURL]) 
                })
            })
        } 
      })

    }


  })

}


/***
 * Upload (UPSERT) local file to Supabase bucket
 * Resolves with filename relative to bucket
 * @uri 
 * @param as: optional  name to upload file as `image.jpg`
 * @param contentType: eg. `image/jpeg`, `audio/m4a`
 */
export async function upload(
    {uri, as, contentType, cacheControl}: 
    {uri: string, as?: string, contentType: string, cacheControl?: string}, 
    bucket: string
) {

  const base64 = await FileSystem.readAsStringAsync(uri,
    { encoding: FileSystem.EncodingType.Base64 });

  // decode base64 -> blob for storage 
  const fileName = as ?? uri.substr(uri.lastIndexOf("/") + 1) 
  const fileBlob = decode(base64)

  // upload to bucket at path
  return new Promise<string>((resolve, reject) => 
    supabase.client.storage.from(bucket)
      .upload(fileName, fileBlob, { contentType, upsert: true, cacheControl })
      .then(({ error }) => { // doesn't reject error !
        if (error) { reject(error) } else { resolve(fileName)} 
      })
  )
}

/***
 * Create directory if doesn't exist.
 * Returns uri of directory asynchronously.
 * @param dir {string}: uri of local directory
 */
 export function getOrCreateDir(dir: string) {

  return FileSystem.getInfoAsync(dir).then(info => {
    if(info.exists) { return dir } else {
      // `intermediates==true` means `mkdir -p`
      return FileSystem
        .makeDirectoryAsync(dir, { intermediates: true })
        .then(() => dir)
    }
  })
}


/***
 * @param {string} charToTtrim: trailing character to trim
 */
 export function splitPath(path: string|null, charToTrim="/"): Array<string|null> {
  if(!path) return []
  const i = path.lastIndexOf("/") + 1

  return [path?.slice?.(0, i), path?.slice?.(i)].map(name => {
    let result = path?.replace?.(new RegExp(`${charToTrim}+$`), '') // trim trailing 
    result = name && (name != 'undefined') ? name : null            // maps "", "undefined", undefined -> null
    return result 
  })
}


/***
 * Extract the filename part of path
 * @param path 
*/
export const getFileName  = (path: string|null) => {
  return ( path && splitPath(path)?.[1] ) || null
}
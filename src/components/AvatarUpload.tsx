import { useEffect, useState, useReducer, Reducer } from 'react'
import { Alert, View, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import styled from "styled-components/native";

import { AVATARS_BUCKET } from '@/lib/supabase';
import { upload } from '@/lib/storage'
import { Btn } from "@/components/uiStyle/atoms";

import Avatar from "./Avatar"


// Upload status
type Status = { uploading: boolean, success: boolean }

type Props = {
    path: string|null, size?: number, 
    onChange?: (path: string, status: Status) => void 
    onError?: (error: Error) => void }


export default ({ path: rPath = null, size=200, onChange, onError }: Props) => {

  /* Bucket Path 
  ====================================================== */

  const [path, setPath] = useState<string|null>(() => rPath)
  useEffect(() => setPath(rPath), [rPath])

  /* Uploading
  .onChange() called exactly twice with path and upload status 
  resp. at the begining and end of the upload
  ====================================================== */

  const [isStale, setIsStale] = useState(false)
  
  const [status, setStatus] = 
    useReducer<Reducer<Status, Partial<Status>>>(
      (s,a) => ({...s, ...a}), {uploading: false, success: false })
  
  // notify callback on upload status change
  useEffect(() => { path && onChange?.(path, status) }, [path, status])
     
  async function uploadImage(uri: string) {
    try {
      // perform upload. do not respect filename from uri if `path` is defined
      // rather, overwrite existing path 
      const contentType = `image/${uri.split('.').pop()}`
      const as = (path??uri).slice((path??uri).lastIndexOf("/")+1)
      setStatus({uploading: true})
      await upload({uri, as, contentType, cacheControl: '0'}, AVATARS_BUCKET)

      // set path only iff upload succeeded !  
      setIsStale(true); setPath(as);
      setStatus({success: true})
      
    } catch (error) {
      onError?.(error as Error)
      
    } finally {
      setStatus({uploading: false})
      setIsStale(false)
    }
  }



  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 1,
      base64: false
    })

    if (!r.cancelled) {
      uploadImage(r.uri)
    }
  }

  const openCamera = async () => {

    const permissionResult = await ImagePicker.
      requestCameraPermissionsAsync()
    if (permissionResult.granted === false) {
      Alert.alert("Access to camera was blocked");
      return
    }
    const r = await ImagePicker
      .launchCameraAsync({base64: false, quality: 1 })

    console.log(r.uri);

    if (!r.cancelled) {
    
    }
  };

  // console.log(`<AvatarUpload /> path=${path} isStale=${isStale} uploadStatus=${JSON.stringify(status)}`)


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Avatar noCache {...{path, isStale, size}} />
      <Btn label="..." onPress={pickImage} disabled={status.uploading} 
        style={{position: 'absolute'}} />
    </View>
  )
}




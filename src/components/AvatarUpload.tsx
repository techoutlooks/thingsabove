import { useEffect, useState, ComponentProps } from 'react'
import { Alert, View, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import styled from "styled-components/native";

import { AVATARS_BUCKET } from '@/lib/supabase';
import { upload } from '@/lib/storage'
import { Btn } from "@/components/uiStyle/atoms";

import Avatar from "./Avatar"



type Props = {
    path: string|null, size?: number, 
    onUploaded?: (path: string) => void 
    onError?: (error: Error) => void }

export default ({ path: rPath = null, size=200, onUploaded, onError }: Props) => {

  // Bucket Path 
  // ==========================

  const [path, setPath] = useState<string|null>(() => rPath)
  useEffect(() => setPath(rPath), [rPath])

  // Uploading
  // ==========================

  const [isUploading, setIsUploading] = useState(false)
  const [isStale, setIsStale] = useState(false)

  async function uploadImage(uri: string) {
    try {

      // perform upload. do not respect filename from uri if `path` is defined
      // rather, overwrite existing path 
      setIsUploading(true)
      const contentType = `image/${uri.split('.').pop()}`
      const as = (path??uri).slice((path??uri).lastIndexOf("/")+1)
      await upload({uri, as, contentType, cacheControl: '0'}, AVATARS_BUCKET)

      // iff success, set flags, notify callback  
      setIsStale(true); setPath(as);
      onUploaded?.(as)
      
    } catch (error) {
      onError?.(error as Error)
      
    } finally {
      setIsUploading(false)
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

  console.log(`<AvatarUpload /> path=${path} isStale=${isStale} isUploading=${isUploading}`, )


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Avatar noCache {...{path, isStale, size}} />
      <Btn label="..." onPress={pickImage} disabled={isUploading} 
        style={{position: 'absolute'}} />
    </View>
  )
}




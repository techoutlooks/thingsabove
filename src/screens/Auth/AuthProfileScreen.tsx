import { useState, useEffect, useCallback } from 'react'
import {Text, View, Alert} from "react-native"
import styled from 'styled-components/native'
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';

import { UserCredentials } from '@supabase/supabase-js'

import { useAuthProfile, useAuthUser } from "@/hooks"
import {AvatarUpload, AppHeader} from "@/components"
import {ScreenCard, Spacer, Btn, TextField
} from "@/components/uiStyle/atoms";


export default ({navigation}) => {

  const user = useAuthUser()

  // Form
  // ==========================

  // RHF's form definition & state
  const {profile, fetching, error: authError, 
    set, fetch: reset, update } = useAuthProfile()
  const defaultValues = { ...profile, email: user.email}
  const {formState: {isValid, isDirty, errors}, ...methods} = useForm({
    mode: 'onChange', defaultValues })
  
  // keep form synced with profile 
  useEffect(() => { profile && methods.reset(profile) }, [profile])  

  // on submit, save form data to auth state
  const onSave = ({email, ...profile}) => {
    update(profile)
    setIsAvatarDirty(false)
  }
  
  const [isAvatarDirty, setIsAvatarDirty]  = useState<boolean>(false)


  // Error mgmt
  // ==========================

  const [error, setError] = useState<string>()
  useEffect(() => { error && Alert.alert(error) } , [error]) 

  useEffect(() => { setError(authError) }, [authError])  

  const onError: SubmitErrorHandler<UserCredentials> = (errors, e) => {
    const formError = Object.values(errors).reduce((acc, err) => acc + err, "")
    setError(formError) 
  }

  const uploadError = (error: Error) => setError(error.message)

  const onUpload = useCallback((avatar_url: string, uploadComplete: boolean) => {
    set({avatar_url})
    uploadComplete && setIsAvatarDirty(true)
  }, [])

  return (
    <Container>

      {fetching ? ( <Loading />
      ) : (
        <>
          <AvatarUpload 
            path={profile?.avatar_url || null} 
            onChange={onUpload}
            onError={uploadError}
          />
          <AuthProfileForm {...methods}>
            <TextField
              name="email"
              placeholder="Email"
              textContentType="emailAddress"
              rules={{ required: 'email is required!' }}
              // onInvalid={setError}
              preIcon="email-outline"
            />
            <Spacer height={8} />
            <TextField
              name="username"
              placeholder="Username"
              textContentType="username"
              rules={{ required: 'username is required!' }}
              // onInvalid={setError}
              preIcon="email-outline"
            />
            <Spacer height={8} />
            <TextField
              name="web_url"
              placeholder="Website"
              textContentType="URL"
              // onInvalid={setError}
              preIcon="email-outline"
            />
            <View style={{display: 'none'}}>
              <TextField 
                name="avatar_url" 
              />
            </View>




          </AuthProfileForm>
        </>
      )}
      <View>
      <Spacer height={48} />
            {( isDirty || isAvatarDirty) ? (
              <SaveButton 
                onPress={methods.handleSubmit(onSave, onError)}
                disabled={!isValid || fetching } 
              />
            ):(
              <GoBackButton 
                onPress={methods.handleSubmit(() => navigation.goBack(), onError)}
                disabled={!isValid || fetching } 
              />
            )}

            <ResetButton
              onPress={reset} disabled={fetching} />
        <SignOutButton label="Sign Out" 
          // onPress={() => supabase.auth.signOut()} 
        />
      </View>
    </Container>
  )
}


const AuthProfileForm = styled(({style, ...p}) => (
    <View {...{style}}>
        <FormProvider {...p} />
    </View>
  ))
`
    flex: 1;
    justify-content: flex-end;
    padding: 16px;
`

const ResetButton = styled(Btn).attrs(({
    label: "Reset"
}))`
  margin-top: 16px;
`
const GoBackButton = styled(Btn).attrs(({
  primary: true, label: "Back"
}))`
  margin-top: 16px;
`
const SaveButton = styled(Btn).attrs(({
    primary: true, label: "Save"
}))`
  margin-top: 16px;
`
const SignOutButton = styled(Btn)`
  margin-top: 16px;
`
const Loading = styled.Text
    .attrs({children: 'Saving ...'})
``
 
const Container = styled(ScreenCard)`
  padding: 20px;
`
import { useState, useEffect } from 'react'
import {Text, View, Alert} from "react-native"
import styled from 'styled-components/native'
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';

import { UserCredentials } from '@supabase/supabase-js'

import { useAuthProfile, useAuthUser } from "@/hooks"
import {AvatarUpload, AppHeader} from "@/components"
import {ScreenCard, ScreenHeaderCopy, Btn, TextField
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

  const onUploaded = (avatar_url: string) => {
    set({avatar_url})
    setIsAvatarDirty(true)
  }

  // console.log('<AuthProfileScreen />', isAvatarDirty, isDirty)

  return (
    <Container>

      {fetching ? ( <Loading />
      ) : (
        <>
          <AvatarUpload 
            path={profile?.avatar_url || null} 
            onUploaded={onUploaded}
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
            <TextField
              name="username"
              placeholder="Username"
              textContentType="username"
              rules={{ required: 'username is required!' }}
              // onInvalid={setError}
              preIcon="email-outline"
            />
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

          </AuthProfileForm>
        </>
      )}
      <View>
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
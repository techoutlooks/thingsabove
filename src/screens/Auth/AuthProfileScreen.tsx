import { useState, useEffect, useCallback } from 'react'
import {Text, View, Alert} from "react-native"
import styled from 'styled-components/native'
import { useDispatch } from "react-redux"
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';

import { UserCredentials } from '@supabase/supabase-js'

import { signOut } from "@/state/auth"
import { useAuthProfile, useAuthUser } from "@/hooks"
import {AvatarUpload, AppHeader} from "@/components"
import * as atoms from "@/components/uiStyle/atoms";


export default ({navigation}) => {

  const user = useAuthUser()
  const dispatch = useDispatch()

  const logOut = () => {
    dispatch(signOut)
    navigation.navigate('Auth')
  }

  // Form
  // ==========================

  // RHF's form definition & state
  const {profile, fetching, error: authError, 
    set, fetch: reset, update } = useAuthProfile()
  const defaultValues = { ...profile, email: user?.email}
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

      {fetching ? ( <Loading /> ) : (
        <Body>
          <AvatarUpload 
            path={profile?.avatar_url || null} 
            onChange={onUpload}
            onError={uploadError}
          />
          <DisplayName>        
            {`Hi, ${profile?.first_name ?? profile?.username ?? 'warrior !'}`}
          </DisplayName>
          <AuthProfileForm {...methods}>
            <atoms.TextField
              name="email"
              placeholder="Email"
              textContentType="emailAddress"
              rules={{ required: 'email is required!' }}
              // onInvalid={setError}
              preIcon="email-outline"
            />
            <atoms.Spacer height={8} />
            <atoms.TextField
              name="username"
              placeholder="Username"
              textContentType="username"
              rules={{ required: 'username is required!' }}
              // onInvalid={setError}
              preIcon="identifier"
            />
            <atoms.Spacer height={8} />
            <atoms.TextField
              name="first_name"
              placeholder="First Name"
              textContentType="givenName"
              rules={{ required: 'First name is required!' }}
              // onInvalid={setError}
              preIcon="rename-box"
            />
            <atoms.Spacer height={8} />
            <atoms.TextField
              name="last_name"
              placeholder="Last Name"
              textContentType="familyName"
              rules={{ required: 'Last name is required!' }}
              // onInvalid={setError}
              preIcon="rename-box"
            />
            <atoms.Spacer height={8} />

            <atoms.TextField
              name="web_url"
              placeholder="Website"
              textContentType="URL"
              // onInvalid={setError}
              preIcon="web"
            />
            <View style={{display: 'none'}}>
              <atoms.TextField 
                name="avatar_url" 
              />
            </View>




          </AuthProfileForm>
        </Body>
      )}

      <Buttons>
        <atoms.Spacer height={48} />
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
        <atoms.Spacer height={8} />
        <ResetButton
          onPress={reset} disabled={fetching} />
        <atoms.Spacer height={8} />
        <SignOutButton label="Sign Out" onPress={logOut} />
      </Buttons>

    </Container>
  )
}


const AuthProfileForm = styled(({style, ...p}) => (
  <View {...{style}}>
    <FormProvider {...p} />
  </View>
))`
  flex: 1;
  justify-content: flex-end;
`

const DisplayName = styled.Text`
  font-weight: bold;
  font-size: 20px;
  margin-left: 5px;
  align-self: center;
`
const ResetButton = styled(atoms.Btn).attrs(({
    label: "Reset"
}))``
const GoBackButton = styled(atoms.Btn).attrs(({
  primary: true, label: "Back"
}))``
const SaveButton = styled(atoms.Btn).attrs(({
    primary: true, label: "Save"
}))``
const SignOutButton = styled(atoms.Btn)`
`
const Loading = styled.Text
  .attrs({children: 'Saving ...'})
``
const Buttons = styled.View``

const Body = styled.View`
  flex: 1;
  justify-content: flex-start;
  padding: 16px;
`
const Container = styled(atoms.ScreenCard)`
  padding: 20px;
`
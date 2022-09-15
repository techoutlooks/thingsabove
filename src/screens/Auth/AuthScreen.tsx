import React, { useEffect, useState } from 'react'
import { View, Alert } from "react-native";
import styled from 'styled-components/native'
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux'

import { DEFAULT_USER_ID, DEFAULT_PASSWORD } from '@env'
import { getAuthState, doAuth } from '../../state/auth'
import {signInWithEmail, signUpWithEmail, signInWithProvider} from "@/lib/supabase"
import {ScreenCard, ScreenHeaderCopy, Btn, TextField} from "@/components/uiStyle/atoms";


type AuthData = { email: string, password: string}

const AuthScreen = () => {

    const dispatch = useDispatch()
    const { fetching, error } = useSelector(getAuthState)

    const defaultValues = { email: DEFAULT_USER_ID, password: DEFAULT_PASSWORD }
    const {formState: {isValid, isDirty, errors}, ...methods} = useForm({
        mode: 'onChange', defaultValues
    }) 

    const login = (data: AuthData) => dispatch(doAuth(signInWithEmail, data))
    const register = (data: AuthData) => dispatch(doAuth(signUpWithEmail, data))

    useEffect(() => {
        if (!!error) Alert.alert(error.message) }, [error])

    const onError: SubmitErrorHandler<AuthData> = (errors, e) => {
        return console.log({errors})  }

    // console.log('<AuthScreen />', useSelector(getAuthState))

    return (
        <Container>
            <HeaderContainer>
                <Header>Welcome!</Header>
            </HeaderContainer>

            <AuthForm {...methods}>
                <TextField
                    name="email"
                    placeholder="email"
                    textContentType="username"
                    rules={{ required: 'Email is required!' }}
                    // onInvalid={setError}
                    preIcon="email-outline"
                />
                <TextField
                    name="password"
                    placeholder="password"
                    textContentType="password"
                    secureTextEntry
                    // rules={{ required: 'Password is required!' }}
                    // onInvalid={setError}
                    preIcon="key"
                />
                <InputSpacer />
                <SignInButton
                    label="Sign In"
                    // onPress={connect}
                    onPress={methods.handleSubmit(login, onError)}

                    disabled={!isValid || fetching}
                    primary
                />
                <SignUpButton
                    label="Sign Up"
                    // onPress={connect}
                    onPress={methods.handleSubmit(register, onError)}
                    disabled={!isValid || fetching}
                    primary
                />
            </AuthForm>
        
        </Container>
  )
}

export default AuthScreen

const Container = styled(ScreenCard)``

const HeaderContainer = styled.View`
  justify-content: center;
  align-items: center;
  height: 60%;
`

const Header = styled(ScreenHeaderCopy)`
  font-size: 30px;
`

const AuthForm = styled(({style, ...p}) => (
  <View {...{style}}>
      <FormProvider {...p} />
  </View>
))`
  flex: 1;
  justify-content: flex-end;
  padding: 16px;
`

const InputSpacer = styled.View`
  height: 8px;
`

const SignInButton = styled(Btn)`
  margin-top: 16px;
`

const SignUpButton = styled(Btn)`
  margin-top: 16px;
`
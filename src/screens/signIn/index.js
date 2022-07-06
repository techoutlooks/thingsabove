import React, { useState } from 'react'
import styled from 'styled-components/native'
import { DEFAULT_USER_ID, DEFAULT_PASSWORD } from '@env'

import { useDispatch, useSelector } from 'react-redux'

import { getAuthState, connectToServer } from '../../state/auth'
import {
  ScreenCard, ScreenHeaderCopy,
  Btn, TextInput } from "@/components/atoms";


// const DEFAULT_USER_ID="@ceduth:matrix.org"
// const DEFAULT_PASSWORD="Eddu1234!"

const SignInScreen = () => {
  const dispatch = useDispatch()
  const { isConnecting } = useSelector(getAuthState)
  const [userId, setUserId] = useState(DEFAULT_USER_ID ?? '')
  const [password, setPassword] = useState(DEFAULT_PASSWORD ?? '')

  const connect = () => {
    dispatch(connectToServer({ userId, password }))
  }

  const isValid = userId !== '' && password !== ''

  return (
    <Container>
      <HeaderContainer>
        <Header>Welcome!</Header>
      </HeaderContainer>
      <SignInWell>
        <TextInput
          onChangeText={setUserId}
          value={userId}
          placeholder="userId"
          textContentType="username"
          preIcon="email-outline"
        />
        <InputSpacer />
        <TextInput
          onChangeText={setPassword}
          value={password}
          placeholder="password"
          secureTextEntry
          textContentType="password"
          preIcon="key"
        />
        <SignInButton
          label="Login"
          onPress={connect}
          disabled={!isValid || isConnecting}
          primary
        />
      </SignInWell>
    </Container>
  )
}

export default SignInScreen

const Container = styled(ScreenCard)``

const HeaderContainer = styled.View`
  justify-content: center;
  align-items: center;
  height: 60%;
`

const Header = styled(ScreenHeaderCopy)`
  font-size: 30px;
`

const SignInWell = styled.View`
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

import React, {useCallback, useReducer, useEffect} from "react"
import { View } from "react-native";
import styled from "styled-components/native"
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useSelector } from "react-redux"


import { selectTopics } from "@/state/prayers"
import { ScreenCard, ScreenHeaderCopy, Btn, TextField, MultiSelectField  } from "@/components/uiStyle/atoms"
import {AppHeader, AvatarUpload} from "@/components"
import { isempty } from "@/lib/utils"
import { useAuthProfile } from "@/hooks"

import { useScreensContext } from "./PrayerContext"


type FormData = {
    title: string;
    description: string }


/***
 * <EditPrayerScreen />
 * edits new prayer iff, nav param `prayerId` == null|undefined;
 * or loads and edits `prayerId` 
 */
export default ({navigation}) => {

  // Data & Context
  // ==========================

  const topics = useSelector(selectTopics)
  const { prayerInput, sync } = useScreensContext()

  // Form management
  // ==========================

  const {formState: {isValid, isDirty, errors}, ...methods} = useForm({
    mode: 'onChange', defaultValues: prayerInput})

  const onSubmit: SubmitHandler<FormData> = (data) => {
    sync(data, true)
    navigation.navigate("Welcome", {screen: "LatestPrayers"})
  }

  const onError: SubmitErrorHandler<FormData> = (errors, e) => {
    return console.log({errors})
  }


  // Nav
  // ==========================

  return (
    <Container>
      <AppHeader title="Edit Prayer"/>

      <AvatarUpload 
        path={prayerInput?.picture_urls?.[0]} 
        onUploaded={ url => { sync({picture_urls: [url]})} }
        onError={ error => onError(errors, null)}
      />
      
      <Form {...methods}>

        <MultiSelectField
          name="topics"
          items={topics}
          uniqueKey="name"
          selectText="Pick Topics"
          searchInputPlaceholderText="Search Topics..."
          tagRemoveIconColor="#CCC"
          tagBorderColor="#CCC"
          tagTextColor="#CCC"
          selectedItemTextColor="#CCC"
          selectedItemIconColor="#CCC"
          itemTextColor="#000"
          searchInputStyle={{ color: '#CCC' }}
          submitButtonColor="#CCC"
          submitButtonText="Submit"
        />
        <InputSpacer />
        <TextField
          name="title"
          placeholder="title"
          rules={{ required: 'Prayer title is required!' }}
          // onInvalid={setError}
          preIcon="text-short"
        />
        <InputSpacer />
        <TextField style={{height: 100, textAlignVertical: 'top'}}
          name="description"
          placeholder="description"
          // onInvalid={setError}
          preIcon="text-long"
          multiline
        />
        <SaveButton
          label="Save"
          onPress={methods.handleSubmit(onSubmit, onError)}
          disabled={!isDirty || !isValid || !isempty(errors) }
          // primary
        />
      </Form>
    </Container>
  )
}


const Header = styled(ScreenHeaderCopy)`
  font-size: 30px;
`

const Form = styled(({style, ...p}) => (
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
const SaveButton = styled(Btn)`
    background-color: transparent;
    border: ${p => p.theme.colors.fg} 2px;
    margin-top: 16px;
`

const Container = styled(ScreenCard)``

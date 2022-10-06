import React, {useCallback, useState, useEffect, useReducer, Reducer} from "react"
import { Alert, View } from "react-native";
import styled, { useTheme } from "styled-components/native"
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useSelector } from "react-redux"

import { selectTopics, getStatus } from "@/state/prayers"
import {AppHeader, AvatarUpload as PictureUpload} from "@/components"
import { isempty } from "@/lib/utils"
import { ScreenCard, ScreenHeaderCopy, Btn, TextField, MultiSelectField, Spacer 
} from "@/components/uiStyle/atoms"

import { useScreensContext } from "./PrayerContext"


type FormData = {title: string, description: string }
type PictureState = { touched: boolean, uploading: boolean }

const resetPictureState = {uploading: false, touched: false }

/***
 * <EditPrayerScreen />
 * edits new prayer iff, nav param `prayerId` == null|undefined;
 * or loads and edits `prayerId` 
 */
export default ({navigation}) => {

  const theme = useTheme()


  /* Data & Context
  ========================== */

  const topics = useSelector(selectTopics)
  const {fetching} = useSelector(getStatus)
  const { prayerInput, status, sync, publish, setDirty } = useScreensContext()
  const [pictureState, setPictureState] = 
    useReducer<Reducer<PictureState, Partial<PictureState>>>(
      (s,a) => ({...s, ...a}), resetPictureState)
  
  /* Form management
  ========================== */

  const {formState: {isValid, isDirty, isSubmitted, errors}, ...methods} = useForm({
    mode: 'onChange', defaultValues: prayerInput})

  useEffect(() => { // navigate away if done publishing
    status.published && !fetching && navigation.navigate("Home", {
      screen: "PrayersByTopic" }) 
  }, [fetching, status.published])

  useEffect(() => { // reset all fields on form submit
    // RHF remains dirty if was once dirty. 
    // https://github.com/react-hook-form/react-hook-form/issues/3097#issuecomment-704563859
    if(isSubmitted) {
      methods.reset(methods.getValues())
      setPictureState(resetPictureState) } 
  }, [isSubmitted, methods.getValues, methods.reset])

  useEffect(() => { 
    setDirty(isDirty || pictureState.touched) }, [isDirty, pictureState.touched])

  const onPublish = () => publish()

  const onSave: SubmitHandler<FormData> = (data) => sync(data, true)

  const onError: SubmitErrorHandler<FormData> = (errors, e) => {
    return console.log({errors})
  }

  const navigateBack = useCallback(() => {
    if(status.dirty) { 
      Alert.alert("Unsaved changes", "Save changes ?", [
        { text: "Save", onPress: () => { 
          onSave(methods.getValues() as FormData); 
          // setDirty(false); 
          navigation.goBack() }
        },
        { text: "Discard", onPress: () => navigation.goBack() },
        { text: "Stay", style: "cancel"} ])
    } else {
      navigation.goBack() }
  }, [prayerInput, status.dirty])

  
  console.log("<EditInfoScreen />", `!isDirty=${!isDirty} !isValid=${!isValid} saved=${status.saved} errors=${!isempty(errors)}`, 
    `!isAvatarDirty=${!pictureState.touched} -> ${!isDirty || !isValid || !isempty(errors) || !pictureState.touched}`,
    `pictureState=${JSON.stringify(pictureState)}  `, 

    )

  return (
    <Container>
      <AppHeader {...{
        title: prayerInput?.prayerId ? "Edit Prayer Info" : "New Prayer Info",
        navigateBack
      }} />

      <PictureUpload 
        path={prayerInput?.picture_urls?.[0]} 
        onChange={ (url, {success, uploading}) => { 
          sync({picture_urls: [url]}) 
          setPictureState({touched: success, uploading})
        }}
        onError={ error => onError(errors, undefined)}
      />
      
      <Form {...methods}>
        <MultiSelectField
          name="topics"
          rules={{ required: 'Pick at least one topic!' }}
          items={topics}
          uniqueKey="name"
          selectText="Pick Topics"
          searchInputPlaceholderText="Search Topics..."
          tagRemoveIconColor={theme.colors.inputDisabledFg}
          tagTextColor={theme.colors.inputFg}
          tagBorderColor={theme.colors.inputDisabledFg}
          selectedItemTextColor={theme.colors.appBg}
          selectedItemIconColor={theme.colors.appBg}
          itemTextColor={theme.colors.inputDisabledFg}
          searchInputStyle={{ color: '#CCC' }}
          submitButtonColor={theme.colors.primaryButtonBg}
          submitButtonText="Set topics"
        />
        <Spacer height={8} />
        <TextField
          name="title"
          placeholder="title"
          rules={{ required: 'Prayer title is required!' }}
          // onInvalid={setError}
          preIcon="text-short"
        />
        <Spacer height={8} />
        <TextField style={{height: 100, textAlignVertical: 'top'}}
          name="description"
          placeholder="description"
          // onInvalid={setError}
          preIcon="text-long"
          multiline
        />

        <Spacer height={48} />
        <SaveButton
          onPress={methods.handleSubmit(onSave, onError)}
          disabled={ (!isDirty && !pictureState.touched) || !isValid || !isempty(errors)  }
        />
        { status.saved && !status.dirty && (
          <PublishButton onPress={onPublish} disabled={pictureState.uploading} />
        )}
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

const Action = styled(Btn)`
  // background-color: transparent;
  // border: ${p => p.theme.colors.fg} 2px;
  margin-top: 16px;
`

const SaveButton = styled(Action).attrs({
  label: 'Save', primary: true
})``

const PublishButton = styled(Action).attrs({
  label: 'Publish', primary: true
})``


const Container = styled(ScreenCard)``

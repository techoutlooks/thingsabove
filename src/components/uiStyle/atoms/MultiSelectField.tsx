/***
 * Generic <FormTextInput/> with validation to use in forms
 * Leverages RHF (react-hook-form)'s `useController()` raw api instead of 
 * `<Controller/>`, for controlling wrapped RN's <TextInput/>.
 * 
 *  Wrapping user-side from inside <FormProvider/> required if
 *  the `control` props (gotten from useForm) is not supplied.
 * 
 * Inspired from doc: https://react-hook-form.com/api/usecontroller/
 * and great tutorials at:
 * https://blog.logrocket.com/react-hook-form-complete-guide/
 * https://echobind.com/post/react-hook-form-for-react-native
 */
 import { useEffect, forwardRef } from "react";
 import {View, TextInputProps} from "react-native"
 import styled from "styled-components/native"
 import {useController, useFormContext, UseControllerProps} from "react-hook-form"
 import { ErrorMessage } from '@hookform/error-message';
 
 import MultiSelect from 'react-native-multiple-select';

 
 type Props = {
     label?: string,
     onInvalid?: (errors: any) => void
 } & TextInputProps & UseControllerProps
 
 
 
 export default forwardRef(
  ({name, label, rules, defaultValue, onInvalid, ...props}:Props, ref) => {
    
  // infer params that will control our text input
  // `controp` prop is optional when using FormProvider.
  const {field, formState: {errors} } = useController( 
    {name, rules, defaultValue });                    
  const {onChange: onSelectedItemsChange, value: selectedItems} = field
  useEffect(() => { onInvalid?.(errors)}, [errors])

  return (
    <View>
      {label && (<Label {...{children: label}} />)}
      <MultiSelect {...{ ref, ...props, name, onSelectedItemsChange, selectedItems }} />
      <ErrorMessage {...{ name, errors, as: ErrorText }}  />
    </View>
  )
     
 })
 
const Label = styled.Text`
  background-color: red;
`
 
const ErrorText = styled.Text`
  color: ${p => p.theme.colors.error};
`
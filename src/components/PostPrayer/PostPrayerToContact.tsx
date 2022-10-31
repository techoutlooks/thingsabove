import React, { memo } from "react"
import styled from "styled-components/native"
import { useNavigation } from "@react-navigation/native"

/***
 * Post Prayer from MyPrayers to
 * PIc
 */
export default memo((props) => {

  const onPress = () => {
    navigation.navigate("Contact", {screen: "AddContact"}) }
    

  return (<atoms.Btn {...props} />)
}).attrs({ label: "Send To Friend" })`
`
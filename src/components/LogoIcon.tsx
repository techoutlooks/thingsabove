
import React from "react"
import { ImageProps } from "react-native"
import styled from "styled-components/native"
import * as appImages from '../../assets'
import * as atoms from "@/components/uiStyle/atoms"


type Props =  ImageProps & { 
  disabled: boolean 
  color?: 'white', 
} 


export default styled.Image.attrs<Props>(({source, ...p}) => ({
  resizeMode: 'cover',
  source: p.disabled? appImages.branding.icon_disabled : 
  appImages.branding[p.color ? `icon_${p.color}` : 'icon'],
  ...p
}))<Props>`
  width: 45px; height: 55px; 
  border-width: 1px;  
  border-color: ${p => p.theme.colors.primaryButtonFg}; 
  border-radius: ${atoms.RADIUS}px;
`
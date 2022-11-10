import styled, { useTheme } from "styled-components/native"
import * as atoms from "@/components/uiStyle/atoms"


export const Description = styled(atoms.Text)`
  font-family: SFProDisplay-Bold;
  margin: 24px 0 8px 0;
`
export const Heading1 = styled(atoms.Text)`
color: ${p => p.theme.colors.primaryButtonBg};
font-family: SFProDisplay-Bold;
  margin: 24px 0 8px 0;
`
export const Container = styled(atoms.ScreenCard)`
  padding: 0 12px;
`
import {Team} from "@/types/Prayer";
import React from "react";
import {useNavigation} from "@react-navigation/native";
import styled from "styled-components/native"

import { Image as SupabaseImage } from "@/lib/supabase"
import { useTheme } from "styled-components/native";



const ITEM_SIZE = 80

type Props = {
    team: Team, prayerIds: string[] }

/***
 * **SearchResultItem**
 * Displays teams for searched prayers
 */
export default React.memo(({team, prayerIds}: Props) => {

    const theme = useTheme()
    const navigation = useNavigation()
    const navigateToPrayer = () => {
      navigation.navigate("Team", {
        screen: "TeamPrayers", params: {teamId: team.id, prayerIds}} )
    }

    return (
      <Container onPress={navigateToPrayer}>
        <Image path={`avatars/${team.avatar_urls?.[0]}`} 
          resizeMode="contain" />
      </Container>
    )
})


const Image = styled(SupabaseImage)`
  flex: 1;
  border-width: 1px;  
  border-color: ${p => p.theme.colors.appBg};
`
const Container = styled.TouchableOpacity`
  width: ${ITEM_SIZE}px;
  height: ${ITEM_SIZE}px;
`
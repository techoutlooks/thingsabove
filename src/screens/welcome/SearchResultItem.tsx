import {Team} from "@/types/Prayer";
import React from "react";
import {useNavigation} from "@react-navigation/native";
import {TouchableOpacity, View, Text} from "react-native";

import { Image } from "@/lib/supabase"
import { useTheme } from "styled-components/native";

type Props = {
    team: Team
    prayerIds: string[]
}

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
      <TouchableOpacity onPress={navigateToPrayer}>
        <View style={{width: 100, height: 100}}>
          <Image 
            path={`avatars/${team.avatar_urls?.[0]}`} 
            resizeMode="contain"
            style={{
              width: '100%', height: '100%',
              backgroundColor: 'white',
              borderWidth: 1, borderColor: theme.colors.mutedFg,
            }}
          />
        </View>
      </TouchableOpacity>
    )
})

import React, {useCallback, useEffect} from "react";
import {Text, View} from "react-native";
import styled from "styled-components/native";
import {useStore} from "react-redux";

import {selectPrayerById, selectPrayersByTeamId} from "../../state/prayers";
import {FlatList, Row, Spacer} from "@/components/uiStyle/atoms";
import { Avatar } from "@/components"
import {Team} from "@/types/Prayer";
import { useContacts } from "@/hooks";

// import ImagedCardView from "react-native-imaged-card-view";


type Props = {
    team: Team,
    prayerIds?: string[]
}


/***
 * <TeamPrayers/>
 * Prayers by team, filterd by `prayerIds` if supplied.
 */
const TeamPrayersList = styled(({team, prayerIds}: Props) => {

    // console.log('<TeamPrayers/>', team, prayerIds)

    const state = useStore().getState();
    // const authors = useSelector(selectUsersByPrayerIds(prayerIds))
    const prayers = prayerIds.map(prayerId => selectPrayerById(state, prayerId))


    // prayers -> team warriors 
    // FIXME: eg. useProfileReducer(teamPrayers, pp => pp.map(p => p.userId))
    const teamPrayers = selectPrayersByTeamId(state, team.id)
    const memberIds = teamPrayers.map(p => p.user_id)

    let members = useContacts(memberIds, true)
    console.log("**** members", members)
    members = [...new Map(members.map(m => [m[m.id], m])).values()]
    console.log('**** <TeamPrayers />', members)


    return (
        <View>
            <Text>Listen to more prayers from {' '}
                <Text style={{fontWeight: 'bold'}}>{team.title}</Text>
            </Text>
            <MemberList {...{members}} />
        </View>
    )

})``


const MemberList = styled(({members}) => {
    const keyExtractor = useCallback((item, i) => item+i, [])
    const renderItem = useCallback(({item}) => (
        <Avatar path={item?.avatar[0]} size={60} />
    ), [])
    return (
        <Row>
            <FlatList horizontal {...{
                data: members, keyExtractor, renderItem,
                ItemSeparatorComponent: () => (
                    <Spacer width={10} />)
            }} />
        </Row>
    )
})``


export default TeamPrayersList;

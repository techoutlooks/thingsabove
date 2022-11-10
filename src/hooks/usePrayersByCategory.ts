import {Team} from "@/types/models";
import {getPrayersByCategory, selectTeamsByPrayerId} from "@/state/prayers";
import {useStore} from "react-redux";
import {Reducer, useReducer} from "react";


/***
 * prayersByCategory ->`SectionListData`
 * Adapt `prayersByCategory` for handling by <SectionList />

 * @param store
 * @return {(prayersByCategory: P) => S}
 */
const usePrayersByCategory = () => {

    // using useStore so that `component will not automatically update
    // if the store state changes: https://react-redux.js.org/api/hooks
    const store = useStore()
    const state = store.getState()

    const prayersByCategory = getPrayersByCategory(state)

    const [resultPrayers, setResultPrayers] =
        useReducer<Reducer<S, P>, P>((s, a) => toSectionListData(a),
            prayersByCategory, toSectionListData)


    return Object.entries(prayersByCategory)
        .map(([category, prayers]) => {

            const teamsById = ({} as Record<string, Team>)
            const prayerIdsByTeamId = ({} as Record<string, string[]>)

            prayers.forEach(prayer => {
                const team = selectTeamsByPrayerId(state, prayer.id)
                if (team) {
                    teamsById[team.id] = team
                    prayerIdsByTeamId[team.id] =
                        [ ...(prayerIdsByTeamId[team.id] || []) , prayer.id]
                }
            })

            const data = Object.entries(prayerIdsByTeamId)
                .map(([teamId, prayerIds]) => ({
                    team: teamsById[teamId], prayerIds }))

            return { data, title: category }
        })
}


export default usePrayersByCategory;